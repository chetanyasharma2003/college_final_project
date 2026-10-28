import axios from 'axios';
import prisma from '../config/prisma.js';
import { SCHEME_CONFIGS } from '../config/scheme-integrations.js';

const hasUsableFieldMapping = (mapping) => Boolean(
  mapping
  && typeof mapping.state === 'string' && mapping.state.trim()
  && typeof mapping.date === 'string' && mapping.date.trim()
  && mapping.metrics && typeof mapping.metrics === 'object' && !Array.isArray(mapping.metrics)
  && Object.keys(mapping.metrics).length > 0
  && Object.values(mapping.metrics).every((field) => typeof field === 'string' && field.trim())
);

class DataSyncService {
  static async getSchemeSummary(schemeCode) {
    const scheme = await prisma.scheme.findUnique({ where: { code: schemeCode } });
    if (!scheme) throw new Error(`Scheme ${schemeCode} not found in database`);

    const records = await prisma.schemeDataGeneric.findMany({
      where: { scheme_id: scheme.id, district_id: null },
      include: { state: true },
      orderBy: { date: 'desc' },
    });
    const latestByState = new Map();
    records.forEach((record) => {
      if (record.state && !latestByState.has(record.state_id)) {
        latestByState.set(record.state_id, {
          state_name: record.state.name,
          ...record.data,
          last_updated: record.date,
        });
      }
    });

    return {
      scheme: schemeCode,
      total_states: latestByState.size,
      states: Array.from(latestByState.values()),
    };
  }

  static async syncAllSchemeData() {
    const results = {
      success: 0,
      failed: 0,
      totalRecords: 0,
      schemes: {}
    };

    const schemes = ['PMAY', 'MGNREGS', 'PMGSY', 'NRLM', 'DDU-GKY', 'SAGY'];

    for (const schemeCode of schemes) {
      const result = await this.syncSchemeData(schemeCode);
      results.schemes[schemeCode] = result;
      if (result.status === 'success') results.success++;
      else results.failed++;
      results.totalRecords += result.recordsLoaded || 0;
    }

    return results;
  }

  static async syncSchemeData(schemeCode) {
    const config = SCHEME_CONFIGS[schemeCode];
    const scheme = await prisma.scheme.findUnique({ where: { code: schemeCode } });
    let loaded = 0;
    let failed = 0;
    let errors = [];

    try {
      if (!config) throw new Error(`No data source configured for ${schemeCode}`);
      if (!scheme) throw new Error(`Scheme ${schemeCode} not found in database`);
      if (!process.env.DATA_GOV_API_KEY || !config.resourceId || !hasUsableFieldMapping(config.fieldMapping)) {
        throw new Error(`Verified Open Data resource ID, field mapping, and API key are required for ${schemeCode}`);
      }

      const records = await this.fetchFromAPI(schemeCode, config);
      if (records.length === 0) throw new Error('Source returned no records');

      ({ loaded, failed, errors } = await this.loadDataToDatabase(schemeCode, records, config));
      if (loaded === 0) throw new Error('No records could be mapped to known locations');

      const status = failed === 0 ? 'completed' : 'partial';
      await prisma.dataImport.create({
        data: {
          scheme_id: scheme.id,
          source: `${config.apiEndpoint}/${encodeURIComponent(config.resourceId)}`,
          import_type: 'api',
          records_imported: loaded,
          records_failed: failed,
          status,
          error_message: errors.length ? errors.slice(0, 10).join('; ') : null,
        },
      });

      return {
        status: failed === 0 ? 'success' : 'partial',
        scheme: schemeCode,
        recordsLoaded: loaded,
        recordsFailed: failed,
        source: `${config.apiEndpoint}/${encodeURIComponent(config.resourceId)}`,
      };
    } catch (error) {
      if (scheme) {
        try {
          await prisma.dataImport.create({
            data: {
              scheme_id: scheme.id,
              source: config?.resourceId ? `${config.apiEndpoint}/${encodeURIComponent(config.resourceId)}` : 'unconfigured',
              import_type: 'api',
              records_imported: loaded,
              records_failed: Math.max(failed, 1),
              status: 'failed',
              error_message: error.message,
            },
          });
        } catch (logError) {
          console.error(`Failed to record ${schemeCode} import failure:`, logError.message);
        }
      }

      return { status: 'error', scheme: schemeCode, recordsLoaded: loaded, error: error.message };
    }
  }

  static async fetchFromAPI(schemeCode, config) {
    if (!process.env.DATA_GOV_API_KEY || !config.resourceId || !hasUsableFieldMapping(config.fieldMapping)) {
      throw new Error(`Verified Open Data resource ID, field mapping, and API key are required for ${schemeCode}`);
    }
    const endpoint = `${config.apiEndpoint}/${encodeURIComponent(config.resourceId)}`;
    let response;
    try {
      response = await axios.get(endpoint, {
        timeout: 30000,
        params: { 'api-key': process.env.DATA_GOV_API_KEY, format: 'json', limit: 1000 },
      });
    } catch (error) {
      const status = error.response?.status;
      throw new Error(status ? `Open Data request failed with HTTP ${status}` : 'Open Data request failed due to a network error');
    }
    const records = response.data?.records ?? response.data?.data ?? response.data;
    if (!Array.isArray(records)) {
      throw new Error(`${schemeCode} source returned an unsupported response format`);
    }
    return records;
  }

  static async loadDataToDatabase(schemeCode, data, config) {
    let loaded = 0;
    let failed = 0;
    const errors = [];

    const scheme = await prisma.scheme.findUnique({
      where: { code: schemeCode }
    });

    if (!scheme) {
      throw new Error(`Scheme ${schemeCode} not found in database`);
    }

    // Get all states for mapping
    const allStates = await prisma.state.findMany();
    const stateMap = new Map();
    allStates.forEach(s => stateMap.set(s.name, s.id));

    for (const record of data) {
      try {
        const stateName = record[config.fieldMapping.state] || record.state_name || record.state;
        const stateId = stateMap.get(stateName);

        if (!stateId) {
          failed++;
          errors.push(`State not found: ${stateName || 'unknown'}`);
          continue;
        }

        const rawDate = record[config.fieldMapping.date] || record.date || record.last_updated || record.report_date || record.data_date || record.data_month || record.month;
        const date = rawDate ? new Date(rawDate) : null;
        if (!date || Number.isNaN(date.getTime())) throw new Error('Record has no valid reporting date');

        const districtName = (config.fieldMapping.district && record[config.fieldMapping.district]) || record.district_name || record.district;
        const district = districtName
          ? await prisma.district.findFirst({ where: { name: districtName, state_id: stateId } })
          : null;
        if (districtName && !district) throw new Error(`District not found: ${districtName}`);

        const blockName = config.fieldMapping.block ? record[config.fieldMapping.block] : null;
        if (blockName && !district) throw new Error('Block-level data requires a mapped district');
        const block = blockName
          ? await prisma.block.findFirst({ where: { name: blockName, district_id: district.id } })
          : null;
        if (blockName && !block) throw new Error(`Block not found: ${blockName}`);

        const villageName = config.fieldMapping.village ? record[config.fieldMapping.village] : null;
        if (villageName && !block) throw new Error('Village-level data requires mapped district and block');
        const village = villageName
          ? await prisma.village.findFirst({ where: { name: villageName, block_id: block.id } })
          : null;
        if (villageName && !village) throw new Error(`Village not found: ${villageName}`);

        await prisma.$transaction(async (transaction) => {
          await this.createSchemeRecord(transaction, scheme.id, stateId, district?.id || null, block?.id || null, village?.id || null, date, record, config);
          await this.createKPIValues(transaction, scheme.id, stateId, district?.id || null, block?.id || null, village?.id || null, date, record, config);
        });
        loaded++;
      } catch (error) {
        console.warn(`⚠️  Failed to load record for ${schemeCode}:`, error.message);
        failed++;
        errors.push(error.message);
      }
    }

    return { loaded, failed, errors };
  }

  static async createSchemeRecord(database, schemeId, stateId, districtId, blockId, villageId, date, record, config) {
    const excludedFields = new Set([
      'state_name', 'state', 'district_name', 'district', 'date', 'last_updated',
      'report_date', 'data_date', 'data_month', 'month',
    ]);
    for (const sourceField of Object.values(config.fieldMapping || {})) {
      if (typeof sourceField === 'string') excludedFields.add(sourceField);
    }
    for (const sourceField of Object.values(config.fieldMapping?.metrics || {})) excludedFields.add(sourceField);
    for (const level of ['block', 'village']) {
      const sourceField = config.fieldMapping?.[level];
      if (sourceField) excludedFields.add(sourceField);
    }
    const metrics = Object.fromEntries(
      Object.entries(record).filter(([key]) => !excludedFields.has(key))
    );
    const where = { scheme_id: schemeId, state_id: stateId, district_id: districtId, block_id: blockId, village_id: villageId, date };
    const existing = await database.schemeDataGeneric.findFirst({ where });

    if (existing) {
      return database.schemeDataGeneric.update({
        where: { id: existing.id },
        data: { data: metrics },
      });
    }

    return database.schemeDataGeneric.create({
      data: { ...where, data: metrics },
    });
  }

  static async createKPIValues(database, schemeId, stateId, districtId, blockId, villageId, date, record, config) {
    const definitions = await database.kPIDefinition.findMany({ where: { scheme_id: schemeId } });

    for (const dataPoint of config.dataPoints || []) {
      const definition = definitions.find(kpi => (
        kpi.kpi_name.toLowerCase() === dataPoint.name.toLowerCase()
      ));
      const rawValue = record[config.fieldMapping?.metrics?.[dataPoint.id] || dataPoint.id];
      if (!definition || rawValue == null || rawValue === '') continue;

      const value = Number(String(rawValue).replace(/,/g, ''));
      if (!Number.isFinite(value)) continue;

      const target = Number(definition.target_value) || 0;
      const progress = target > 0 ? (value / target) * 100 : 0;
      const status = progress >= 80 ? 'on_track' : progress >= 50 ? 'at_risk' : 'critical';
      const where = {
        kpi_id: definition.id,
        state_id: stateId,
        district_id: districtId,
        block_id: blockId,
        village_id: villageId,
        date,
      };
      const existing = await database.kPIValue.findFirst({ where });
      const data = { value, target_value: definition.target_value, status };

      if (existing) {
        await database.kPIValue.update({ where: { id: existing.id }, data });
      } else {
        await database.kPIValue.create({ data: { ...where, ...data } });
      }
    }
  }
}

export default DataSyncService;
