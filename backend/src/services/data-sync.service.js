import axios from 'axios';
import prisma from '../config/prisma.js';
import { getDataGovApiKey, SCHEME_CONFIGS } from '../config/scheme-integrations.js';

const hasUsableFieldMapping = (config) => Boolean(
  config?.fieldMapping
  && ((typeof config.fieldMapping.state === 'string' && config.fieldMapping.state.trim())
    || (typeof config.defaultState === 'string' && config.defaultState.trim()))
  && ((typeof config.fieldMapping.date === 'string' && config.fieldMapping.date.trim()) || config.reportDate)
  && config.fieldMapping.metrics
  && typeof config.fieldMapping.metrics === 'object'
  && !Array.isArray(config.fieldMapping.metrics)
  && Object.keys(config.fieldMapping.metrics).length > 0
  && Object.values(config.fieldMapping.metrics).every((field) => typeof field === 'string' && field.trim())
);

const normalizeLocationName = (name) => String(name || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const STATE_ALIASES = new Map([
  ['andaman and nicobar', 'andaman and nicobar islands'],
  ['andman and nicobar islands', 'andaman and nicobar islands'],
  ['nct of delhi', 'delhi'],
  ['orissa', 'odisha'],
  ['uttaranchal', 'uttarakhand'],
  ['pondicherry', 'puducherry'],
  ['jammu and kashmir', 'jammu and kashmir'],
]);

export const isNationalAggregate = (name) => ['total', 'grand total', 'all india', 'india']
  .includes(normalizeLocationName(name));

export const isExcludedCategory = (category, excludedCategories = []) => {
  const normalizedCategory = normalizeLocationName(category);
  return excludedCategories.some((excluded) => normalizeLocationName(excluded) === normalizedCategory);
};

export const isExcludedDistrict = (district, excludedDistricts = []) => {
  const normalizedDistrict = normalizeLocationName(district);
  return excludedDistricts.some((excluded) => normalizeLocationName(excluded) === normalizedDistrict);
};

export const resolveDistrictName = (districtName, aliases = {}) => {
  const normalized = normalizeLocationName(districtName);
  const alias = Object.entries(aliases).find(([source]) => normalizeLocationName(source) === normalized);
  return alias ? alias[1] : districtName;
};

export const aggregateSourceCategories = (records, config) => {
  if (!config.aggregateCategories || !config.includeCategories?.length) return records;

  const includedCategories = new Set(config.includeCategories.map(normalizeLocationName));
  const metricFields = Object.entries(config.fieldMapping.metrics);
  const groups = new Map();
  for (const record of records) {
    const category = record[config.fieldMapping.category];
    if (!includedCategories.has(normalizeLocationName(category))) continue;
    const state = record[config.fieldMapping.state];
    const district = record[config.fieldMapping.district];
    const key = `${normalizeLocationName(state)}:${normalizeLocationName(district)}`;
    if (!groups.has(key)) groups.set(key, new Map());
    groups.get(key).set(normalizeLocationName(category), record);
  }

  return Array.from(groups.values())
    .filter((group) => !config.requireAllCategories
      || Array.from(includedCategories).every((category) => group.has(category)))
    .map((group) => {
      const sourceRecords = Array.from(group.values());
      const combined = { ...sourceRecords[0] };
      combined[config.fieldMapping.category] = config.includeCategories.join(', ');
      for (const [, sourceField] of metricFields) {
        const values = sourceRecords.map((record) => {
          const raw = record[sourceField];
          if (raw == null || raw === '') return null;
          const value = Number(String(raw).replace(/,/g, ''));
          return Number.isFinite(value) ? value : null;
        });
        combined[sourceField] = values.every((value) => value != null)
          ? values.reduce((sum, value) => sum + value, 0)
          : null;
      }
      return combined;
    });
};

const resolveStateId = (stateMap, stateName) => {
  const normalized = normalizeLocationName(stateName);
  const canonical = STATE_ALIASES.get(normalized) || normalized;
  return stateMap.get(canonical);
};

class DataSyncService {
  static async getSchemeSummary(schemeCode) {
    const scheme = await prisma.scheme.findUnique({ where: { code: schemeCode } });
    if (!scheme) throw new Error(`Scheme ${schemeCode} not found in database`);

    const records = await prisma.schemeDataGeneric.findMany({
      where: {
        scheme_id: scheme.id,
          district_id: SCHEME_CONFIGS[schemeCode]?.aggregateByDistrict ? { not: null } : null,
      },
      include: { state: true, district: true },
      orderBy: { date: 'desc' },
    });
    if (SCHEME_CONFIGS[schemeCode]?.aggregateByDistrict) {
      const latestByDistrict = new Map();
      records.forEach((record) => {
        if (record.district && !latestByDistrict.has(record.district_id)) {
          latestByDistrict.set(record.district_id, {
            state_name: record.state?.name || null,
            district_name: record.district.name,
            ...record.data,
            last_updated: record.date,
          });
        }
      });
      return {
        scheme: schemeCode,
        total_states: new Set(Array.from(latestByDistrict.values(), (record) => record.state_name)).size,
        total_districts: latestByDistrict.size,
        districts: Array.from(latestByDistrict.values()),
      };
    }

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

  static async syncAllSchemeData(onSchemeComplete = () => {}) {
    const results = {
      success: 0,
      failed: 0,
      totalRecords: 0,
      schemes: {}
    };

    const schemes = ['PMAY-G', 'PMAY-U', 'MGNREGS', 'PMGSY', 'NRLM', 'DDU-GKY', 'SAGY'];

    for (const schemeCode of schemes) {
      const result = await this.syncSchemeData(schemeCode);
      results.schemes[schemeCode] = result;
      onSchemeComplete(schemeCode, result);
      if (result.status === 'success') results.success++;
      else results.failed++;
      results.totalRecords += result.recordsLoaded || 0;
    }

    return results;
  }

  static async syncSchemeData(schemeCode) {
    const config = SCHEME_CONFIGS[schemeCode];
    let scheme = null;
    let loaded = 0;
    let failed = 0;
    let skipped = 0;
    let errors = [];

    try {
      if (!config) throw new Error(`No data source configured for ${schemeCode}`);
      if (!getDataGovApiKey(schemeCode) || !config.resourceId
        || !hasUsableFieldMapping(config)) {
        throw new Error(`Verified Open Data resource ID, field mapping, and API key are required for ${schemeCode}`);
      }

      scheme = await prisma.scheme.upsert({
        where: { code: schemeCode },
        update: {
          name: config.name,
          ministry: config.ministry,
          description: config.description || undefined,
        },
        create: {
          code: schemeCode,
          name: config.name,
          ministry: config.ministry,
          description: config.description || null,
        },
      });
      for (const dataPoint of config.dataPoints || []) {
        await prisma.kPIDefinition.upsert({
          where: {
            scheme_id_kpi_name: {
              scheme_id: scheme.id,
              kpi_name: dataPoint.name,
            },
          },
          update: {
            description: dataPoint.description || null,
            unit: dataPoint.unit,
            data_type: dataPoint.type,
            target_value: null,
            frequency: 'one-time',
          },
          create: {
            scheme_id: scheme.id,
            kpi_name: dataPoint.name,
            description: dataPoint.description || null,
            unit: dataPoint.unit,
            data_type: dataPoint.type,
            target_value: null,
            frequency: 'one-time',
          },
        });
      }

      const records = await this.fetchFromAPI(schemeCode, config);
      if (records.length === 0) throw new Error('Source returned no records');

      ({ loaded, failed, skipped, errors } = await this.loadDataToDatabase(schemeCode, records, config));
      if (loaded === 0) throw new Error('No records could be mapped to known locations');

      const status = failed === 0 ? 'completed' : 'partial';
      await prisma.dataImport.create({
        data: {
          scheme_id: scheme.id,
          source: config.sourceUrl || `${config.apiEndpoint}/${encodeURIComponent(config.resourceId)}`,
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
        recordsSkipped: skipped,
        errors: errors.slice(0, 10),
        source: `${config.apiEndpoint}/${encodeURIComponent(config.resourceId)}`,
      };
    } catch (error) {
      if (scheme) {
        try {
          await prisma.dataImport.create({
            data: {
              scheme_id: scheme.id,
              source: config?.sourceUrl || (config?.resourceId ? `${config.apiEndpoint}/${encodeURIComponent(config.resourceId)}` : 'unconfigured'),
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
    const apiKey = getDataGovApiKey(schemeCode);
    if (!apiKey || !config.resourceId
      || !hasUsableFieldMapping(config)) {
      throw new Error(`Verified Open Data resource ID, field mapping, and API key are required for ${schemeCode}`);
    }
    const endpoint = `${config.apiEndpoint}/${encodeURIComponent(config.resourceId)}`;
    const pageSize = 1000;
    const records = [];
    let offset = 0;
    let total = null;
    do {
      let response;
      try {
        response = await axios.get(endpoint, {
          timeout: 30000,
          params: { 'api-key': apiKey, format: 'json', limit: pageSize, offset },
        });
      } catch (error) {
        const status = error.response?.status;
        throw new Error(status ? `Open Data request failed with HTTP ${status}` : 'Open Data request failed due to a network error');
      }
      const page = response.data?.records ?? response.data?.data ?? response.data;
      if (!Array.isArray(page)) {
        throw new Error(`${schemeCode} source returned an unsupported response format`);
      }
      records.push(...page);
      const parsedTotal = Number(response.data?.total);
      if (Number.isFinite(parsedTotal) && parsedTotal >= 0) total = parsedTotal;
      offset += page.length;
      if (page.length < pageSize || (total != null && offset >= total)) break;
    } while (true);

    return aggregateSourceCategories(records, config);
  }

  static async loadDataToDatabase(schemeCode, data, config) {
    let loaded = 0;
    let failed = 0;
    let skipped = 0;
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
    allStates.forEach((state) => stateMap.set(normalizeLocationName(state.name), state.id));
    const defaultStateId = config.defaultState ? resolveStateId(stateMap, config.defaultState) : null;
    const districtWhere = config.defaultState ? { state_id: defaultStateId || -1 } : {};
    const allDistricts = config.fieldMapping.district
      ? await prisma.district.findMany({
        where: districtWhere,
        select: { id: true, name: true, state_id: true },
      })
      : [];
    const districtMap = new Map(allDistricts.map((district) => [
      `${district.state_id}:${normalizeLocationName(district.name)}`,
      district,
    ]));

    for (const record of data) {
      try {
        if (isExcludedCategory(record.category, config.excludeCategories)) {
          skipped++;
          continue;
        }

        const stateName = (config.fieldMapping.state && record[config.fieldMapping.state])
          || config.defaultState
          || record.state_name
          || record.state;
        const nationalAggregate = isNationalAggregate(stateName);
        const stateId = nationalAggregate ? null : resolveStateId(stateMap, stateName);

        if (!stateId && !nationalAggregate) {
          failed++;
          errors.push(`State not found: ${stateName || 'unknown'}`);
          continue;
        }

        const rawDate = config.reportDate
          || record[config.fieldMapping.date]
          || record.date
          || record.last_updated
          || record.report_date
          || record.data_date
          || record.data_month
          || record.month;
        const date = rawDate ? new Date(rawDate) : null;
        if (!date || Number.isNaN(date.getTime())) throw new Error('Record has no valid reporting date');

        const districtName = (config.fieldMapping.district && record[config.fieldMapping.district]) || record.district_name || record.district;
        if (config.aggregateByDistrict && !districtName) {
          throw new Error('District name missing for district-level source record');
        }
        if (isExcludedDistrict(districtName, config.excludeDistricts)) {
          skipped++;
          continue;
        }
        const canonicalDistrictName = resolveDistrictName(districtName, config.districtAliases);
        let district = districtName
          ? districtMap.get(`${stateId}:${normalizeLocationName(canonicalDistrictName)}`) || null
          : null;
        if (districtName && !district && config.allowSourceDistrictCreation && stateId) {
          const sourceDistrictName = String(canonicalDistrictName).trim();
          if (!sourceDistrictName) throw new Error('District name is empty');
          district = await prisma.district.upsert({
            where: { state_id_name: { state_id: stateId, name: sourceDistrictName } },
            update: {},
            create: { state_id: stateId, name: sourceDistrictName, area_km2: null },
            select: { id: true, name: true, state_id: true },
          });
          districtMap.set(`${stateId}:${normalizeLocationName(district.name)}`, district);
        }
        if (districtName && !district) throw new Error(`District not found in configured geography: ${districtName}`);

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

    return { loaded, failed, skipped, errors };
  }

  static async createSchemeRecord(database, schemeId, stateId, districtId, blockId, villageId, date, record, config) {
    const excludedFields = new Set([
      'state_name', 'state', 'district_name', 'district', 'date', 'last_updated',
      'report_date', 'data_date', 'data_month', 'month', 'sl__no_', '_s__no_',
    ]);
    for (const sourceField of Object.values(config.fieldMapping || {})) {
      if (typeof sourceField === 'string') excludedFields.add(sourceField);
    }
    for (const sourceField of Object.values(config.fieldMapping?.metrics || {})) excludedFields.add(sourceField);
    for (const level of ['block', 'village']) {
      const sourceField = config.fieldMapping?.[level];
      if (sourceField) excludedFields.add(sourceField);
    }
    const sourceFields = Object.fromEntries(
      Object.entries(record).filter(([key]) => !excludedFields.has(key))
    );
    const mappedMetrics = Object.fromEntries(
      Object.entries(config.fieldMapping?.metrics || {}).flatMap(([metricId, sourceField]) => {
        const rawValue = record[sourceField];
        if (rawValue == null || rawValue === '') return [];
        const numericValue = Number(String(rawValue).replace(/,/g, ''));
        return [[metricId, Number.isFinite(numericValue) ? numericValue : rawValue]];
      })
    );
    const metrics = { ...sourceFields, ...mappedMetrics };
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
      const progress = target > 0 ? (value / target) * 100 : null;
      const status = progress == null ? 'no_target' : progress >= 80 ? 'on_track' : progress >= 50 ? 'at_risk' : 'critical';
      const metricDate = dataPoint.reportDate || date;
      const where = {
        kpi_id: definition.id,
        state_id: stateId,
        district_id: districtId,
        block_id: blockId,
        village_id: villageId,
        date: metricDate,
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
