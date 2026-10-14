import axios from 'axios';
import prisma from '../config/prisma.js';
import { SCHEME_CONFIGS } from '../config/scheme-integrations.js';

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

      const records = await this.fetchFromAPI(schemeCode, config);
      if (records.length === 0) throw new Error('Source returned no records');

      ({ loaded, failed, errors } = await this.loadDataToDatabase(schemeCode, records, config));
      if (loaded === 0) throw new Error('No records could be mapped to known locations');

      const status = failed === 0 ? 'completed' : 'partial';
      await prisma.dataImport.create({
        data: {
          scheme_id: scheme.id,
          source: config.apiEndpoint,
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
        source: config.apiEndpoint,
      };
    } catch (error) {
      if (scheme) {
        try {
          await prisma.dataImport.create({
            data: {
              scheme_id: scheme.id,
              source: config?.apiEndpoint || 'unconfigured',
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
    const endpointPath = config.endpoints.performance || Object.values(config.endpoints)[0];
    if (!endpointPath) throw new Error(`No endpoint configured for ${schemeCode}`);

    const endpoint = `${config.apiEndpoint}${endpointPath}`;
    const response = await axios.get(endpoint, {
      timeout: 30000,
      headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {},
    });
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
        const stateName = record.state_name || record.state;
        const stateId = stateMap.get(stateName);

        if (!stateId) {
          failed++;
          errors.push(`State not found: ${stateName || 'unknown'}`);
          continue;
        }

        const rawDate = record.date || record.last_updated || record.report_date || record.data_date || record.data_month || record.month;
        const date = rawDate ? new Date(rawDate) : null;
        if (!date || Number.isNaN(date.getTime())) throw new Error('Record has no valid reporting date');

        const districtName = record.district_name || record.district;
        const district = districtName
          ? await prisma.district.findFirst({ where: { name: districtName, state_id: stateId } })
          : null;
        if (districtName && !district) throw new Error(`District not found: ${districtName}`);

        await prisma.$transaction(async (transaction) => {
          await this.createSchemeRecord(transaction, scheme.id, stateId, district?.id || null, date, record);
          await this.createKPIValues(transaction, scheme.id, stateId, district?.id || null, date, record, config);
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

  static async createSchemeRecord(database, schemeId, stateId, districtId, date, record) {
    const excludedFields = new Set([
      'state_name', 'state', 'district_name', 'district', 'date', 'last_updated',
      'report_date', 'data_date', 'data_month', 'month',
    ]);
    const metrics = Object.fromEntries(
      Object.entries(record).filter(([key]) => !excludedFields.has(key))
    );
    const where = { scheme_id: schemeId, state_id: stateId, district_id: districtId, date };
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

  static async createKPIValues(database, schemeId, stateId, districtId, date, record, config) {
    const definitions = await database.kPIDefinition.findMany({ where: { scheme_id: schemeId } });

    for (const dataPoint of config.dataPoints || []) {
      const definition = definitions.find(kpi => (
        kpi.kpi_name.toLowerCase() === dataPoint.name.toLowerCase()
      ));
      const rawValue = record[dataPoint.id];
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
        block_id: null,
        village_id: null,
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
