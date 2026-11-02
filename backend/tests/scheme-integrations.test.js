import test from 'node:test';
import assert from 'node:assert/strict';
import { getDataGovApiKey, SCHEME_CONFIGS } from '../src/config/scheme-integrations.js';
import DataSyncService, {
  aggregateSourceCategories,
  isExcludedCategory,
  isExcludedDistrict,
  isNationalAggregate,
  resolveDistrictName,
} from '../src/services/data-sync.service.js';
import { filterSourceKpiDefinitions } from '../src/services/kpi-management.service.js';

const withEnvironment = async (values, callback) => {
  const previous = Object.fromEntries(
    Object.keys(values).map((key) => [key, process.env[key]]),
  );
  for (const [key, value] of Object.entries(values)) {
    if (value == null) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    await callback();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value == null) delete process.env[key];
      else process.env[key] = value;
    }
  }
};

test('uses the scheme-specific API key before the legacy shared key', async () => {
  await withEnvironment({
    DATA_GOV_API_KEY_MGNREGS: 'scheme-key',
    DATA_GOV_API_KEY: 'legacy-key',
  }, async () => {
    assert.equal(getDataGovApiKey('MGNREGS'), 'scheme-key');
  });
});

test('normalizes hyphenated scheme codes and falls back to the legacy key', async () => {
  await withEnvironment({
    DATA_GOV_API_KEY_DDU_GKY: 'scheme-key',
    DATA_GOV_API_KEY: 'legacy-key',
  }, async () => {
    assert.equal(getDataGovApiKey('DDU-GKY'), 'scheme-key');
  });

  await withEnvironment({
    DATA_GOV_API_KEY_MGNREGS: null,
    DATA_GOV_API_KEY: 'legacy-key',
  }, async () => {
    assert.equal(getDataGovApiKey('MGNREGS'), 'legacy-key');
  });
});

test('PMAY-G uses the verified historical source and does not invent a target or refresh schedule', () => {
  const config = SCHEME_CONFIGS['PMAY-G'];

  assert.equal(config.resourceId, '5f5f34ec-379f-45a3-b61a-40a9e063d933');
  assert.equal(config.fieldMapping.state, 'state_ut');
  assert.equal(config.fieldMapping.metrics.eligible_beneficiaries_availed_loan,
    'number_of_eligible_beneficiaries_of_pmay_g_who_availed_loan_of_rs_70_000__');
  assert.equal(config.reportDate.toISOString(), '2022-04-06T00:00:00.000Z');
  assert.equal(config.publicationDate.toISOString(), '2022-09-20T00:00:00.000Z');
  assert.equal(config.syncFrequency, null);
  assert.equal(config.dataPoints[0].unit, 'beneficiaries');
});

test('recognizes official national aggregate labels without treating state names as aggregates', () => {
  assert.equal(isNationalAggregate('Total'), true);
  assert.equal(isNationalAggregate('Grand Total'), true);
  assert.equal(isNationalAggregate('All India'), true);
  assert.equal(isNationalAggregate('India'), true);
  assert.equal(isNationalAggregate('Andaman and Nicobar'), false);
});

test('PMAY-U uses the verified dated state snapshot and excludes subtotal rows', () => {
  const config = SCHEME_CONFIGS['PMAY-U'];

  assert.equal(config.resourceId, 'ec678e2e-d084-4625-a821-380a82d94970');
  assert.equal(config.fieldMapping.state, 'state_ut');
  assert.equal(config.fieldMapping.metrics.houses_sanctioned,
    'physical_progress_of_houses__nos_____sanctioned');
  assert.equal(config.fieldMapping.metrics.houses_completed,
    'physical_progress_of_houses__nos_____construction_completed');
  assert.equal(config.fieldMapping.metrics.houses_occupied,
    'physical_progress_of_houses__nos_____occupied');
  assert.equal(config.reportDate.toISOString(), '2026-01-22T00:00:00.000Z');
  assert.equal(config.publicationDate.toISOString(), '2026-09-24T00:00:00.000Z');
  assert.equal(config.syncFrequency, null);
  assert.equal(config.dataPoints.length, 3);
  assert.equal(config.dataPoints.every((dataPoint) => dataPoint.description), true);
  assert.equal(isExcludedCategory('Sub-total (States)', config.excludeCategories), true);
  assert.equal(isExcludedCategory('Sub-total (NE States)', config.excludeCategories), true);
  assert.equal(isExcludedCategory('Sub-total (UTs)', config.excludeCategories), true);
  assert.equal(isExcludedCategory('Total', config.excludeCategories), false);
});

test('MGNREGS uses only the verified historical district job-card metric', () => {
  const config = SCHEME_CONFIGS.MGNREGS;

  assert.equal(config.resourceId, '9f3d0c32-a54b-4859-bb60-0e26b7997a8b');
  assert.equal(config.defaultState, 'Karnataka');
  assert.equal(config.aggregateByDistrict, true);
  assert.equal(config.fieldMapping.district, 'districts');
  assert.equal(config.fieldMapping.metrics.job_cards_issued, 'total_number_of__job_cards_issued');
  assert.equal(config.reportDate.toISOString(), '2022-01-10T00:00:00.000Z');
  assert.equal(config.syncFrequency, null);
  assert.equal(config.dataPoints.length, 1);
  assert.equal(config.dataPoints[0].name, 'Job Cards Issued (cumulative)');
  assert.deepEqual(config.excludeDistricts, ['NA']);
  assert.equal(resolveDistrictName('BENGALURU', config.districtAliases), 'Bengaluru Urban');
  assert.equal(resolveDistrictName('DHARWAR', config.districtAliases), 'Dharwad');
  assert.equal(isExcludedDistrict('na', config.excludeDistricts), true);
  assert.equal(isExcludedDistrict('Mysuru', config.excludeDistricts), false);
});

test('stores mapped source metrics in the generic scheme record', async () => {
  let created;
  const database = {
    schemeDataGeneric: {
      findFirst: async () => null,
      create: async ({ data }) => {
        created = data;
        return data;
      },
    },
  };
  const config = SCHEME_CONFIGS.MGNREGS;

  await DataSyncService.createSchemeRecord(
    database,
    1,
    2,
    3,
    null,
    null,
    config.reportDate,
    {
      _s__no_: '1',
      districts: 'MYSURU',
      total_number_of__job_cards_issued: '12,345',
    },
    config,
  );

  assert.deepEqual(created.data, { job_cards_issued: 12345 });
  assert.equal(created.date, config.reportDate);
  assert.equal(created.district_id, 3);
});

test('PMGSY uses the live source schema and requires all included components before aggregation', () => {
  const config = SCHEME_CONFIGS.PMGSY;
  const categories = config.includeCategories;
  const makeRecord = (district, category, length) => ({
    STATE_NAME: 'Karnataka',
    DISTRICT_NAME: district,
    PMGSY_SCHEME: category,
    LENGTH_OF_ROAD_WORK_COMPLETED_KM: String(length),
  });
  const records = [
    ...categories.map((category, index) => makeRecord('Mysuru', category, index + 1)),
    makeRecord('Dharwad', categories[0], 10),
    makeRecord('Dharwad', categories[1], 20),
    makeRecord('NotIncluded', 'PM-JANMAN', 100),
  ];
  const aggregated = aggregateSourceCategories(records, config);

  assert.equal(config.resourceId, 'd4361151-6d41-43c7-98cd-9a6cd90b5ca4');
  assert.equal(config.fieldMapping.state, 'STATE_NAME');
  assert.equal(config.fieldMapping.district, 'DISTRICT_NAME');
  assert.equal(config.reportDate.toISOString(), '2026-11-02T00:00:00.000Z');
  assert.equal(config.publicationDate.toISOString(), '2024-08-28T00:00:00.000Z');
  assert.equal(config.updatedDate.toISOString(), '2026-11-02T00:00:00.000Z');
  assert.equal(config.syncFrequency, null);
  assert.equal(config.dataPoints.length, 11);
  assert.equal(aggregated.length, 1);
  assert.equal(aggregated[0].LENGTH_OF_ROAD_WORK_COMPLETED_KM, 6);
  assert.equal(aggregated[0].PMGSY_SCHEME, categories.join(', '));
});

test('NRLM uses the verified annual funds resource without inventing currency units or freshness', () => {
  const config = SCHEME_CONFIGS.NRLM;

  assert.equal(config.resourceId, '7cd757e2-94f5-4715-9cae-b9d6b7185582');
  assert.equal(config.fieldMapping.state, 'state_ut');
  assert.deepEqual(Object.keys(config.fieldMapping.metrics), [
    'funds_allocation_2021_22',
    'funds_allocation_2022_23',
    'funds_allocation_2023_24',
  ]);
  assert.equal(config.dataPoints.every((dataPoint) => dataPoint.unit === 'source unit unspecified'), true);
  assert.deepEqual(
    config.dataPoints.map((dataPoint) => dataPoint.reportDate.toISOString()),
    [
      '2022-03-31T00:00:00.000Z',
      '2023-03-31T00:00:00.000Z',
      '2024-03-31T00:00:00.000Z',
    ],
  );
  assert.equal(config.updatedDate.toISOString(), '2024-09-10T13:33:59.000Z');
  assert.equal(config.aggregateByStateSum, true);
  assert.equal(config.syncFrequency, null);
});

test('configured scheme dashboards suppress stale KPIs not present in the official source', () => {
  const definitions = [
    { kpi_name: 'SHGs Formed' },
    { kpi_name: 'Funds Allocation (2021-22)' },
    { kpi_name: 'Funds Allocation (2022-23)' },
    { kpi_name: 'Funds Allocation (2023-24)' },
  ];

  assert.deepEqual(
    filterSourceKpiDefinitions(definitions, SCHEME_CONFIGS.NRLM).map(({ kpi_name }) => kpi_name),
    SCHEME_CONFIGS.NRLM.dataPoints.map(({ name }) => name),
  );
  assert.deepEqual(filterSourceKpiDefinitions(definitions, null), definitions);
});

test('unsupported legacy PMAY aggregate does not expose fabricated KPI definitions', () => {
  const definitions = [
    { kpi_name: 'Houses Sanctioned' },
    { kpi_name: 'Budget Allocated' },
  ];

  assert.equal(SCHEME_CONFIGS.PMAY.resourceId, null);
  assert.equal(SCHEME_CONFIGS.PMAY.fieldMapping, null);
  assert.equal(SCHEME_CONFIGS.PMAY.syncFrequency, null);
  assert.deepEqual(SCHEME_CONFIGS.PMAY.dataPoints, []);
  assert.deepEqual(filterSourceKpiDefinitions(definitions, SCHEME_CONFIGS.PMAY), []);
});

test('DDU-GKY maps only verified annual trained and placed counts', () => {
  const config = SCHEME_CONFIGS['DDU-GKY'];

  assert.equal(config.resourceId, '22f49a00-f3f2-47ca-b0bc-3f01f659b579');
  assert.equal(config.fieldMapping.state, 'state_ut');
  assert.equal(Object.keys(config.fieldMapping.metrics).length, 8);
  assert.equal(config.dataPoints.length, 8);
  assert.deepEqual(
    config.dataPoints.map(({ name }) => name),
    [
      'Candidates Trained (2020-21)',
      'Candidates Placed (2020-21)',
      'Candidates Trained (2021-22)',
      'Candidates Placed (2021-22)',
      'Candidates Trained (2022-23)',
      'Candidates Placed (2022-23)',
      'Candidates Trained (2023-24)',
      'Candidates Placed (2023-24)',
    ],
  );
  assert.deepEqual(
    config.dataPoints.map(({ reportDate }) => reportDate.toISOString()),
    [
      '2021-03-31T00:00:00.000Z',
      '2021-03-31T00:00:00.000Z',
      '2022-03-31T00:00:00.000Z',
      '2022-03-31T00:00:00.000Z',
      '2023-03-31T00:00:00.000Z',
      '2023-03-31T00:00:00.000Z',
      '2024-03-31T00:00:00.000Z',
      '2024-03-31T00:00:00.000Z',
    ],
  );
  assert.equal(config.publicationDate.toISOString(), '2024-04-04T00:00:00.000Z');
  assert.equal(config.syncFrequency, null);
  assert.equal(config.dataPoints.every(({ unit }) => unit === 'people'), true);
});

test('SAGY maps only the verified historical phase-wise Gram Panchayat counts', () => {
  const config = SCHEME_CONFIGS.SAGY;

  assert.equal(config.resourceId, '3601558b-811b-4ba3-96dd-c3abd06fa169');
  assert.equal(config.fieldMapping.state, 'state_ut');
  assert.deepEqual(config.fieldMapping.metrics, {
    gram_panchayats_identified_phase_i: 'phase_i',
    gram_panchayats_identified_phase_ii: 'phase_ii',
    gram_panchayats_identified_phase_iii: 'phase_iii',
    gram_panchayats_identified_phase_iv: 'phase_iv',
  });
  assert.deepEqual(config.dataPoints.map(({ name }) => name), [
    'Gram Panchayats Identified (Phase I)',
    'Gram Panchayats Identified (Phase II)',
    'Gram Panchayats Identified (Phase III)',
    'Gram Panchayats Identified (Phase IV)',
  ]);
  assert.equal(config.dataPoints.every(({ unit }) => unit === 'Gram Panchayats'), true);
  assert.equal(config.dataPoints.every(({ description }) => description.includes('3 March 2020')), true);
  assert.equal(config.reportDate.toISOString(), '2020-03-03T00:00:00.000Z');
  assert.equal(config.publicationDate.toISOString(), '2021-02-18T00:00:00.000Z');
  assert.equal(config.updatedDate.toISOString(), '2021-09-08T00:00:00.000Z');
  assert.equal(config.aggregateByStateSum, true);
  assert.equal(config.syncFrequency, null);

  const definitions = [
    { kpi_name: 'Villages Adopted' },
    ...config.dataPoints.map(({ name }) => ({ kpi_name: name })),
  ];
  assert.deepEqual(
    filterSourceKpiDefinitions(definitions, config).map(({ kpi_name }) => kpi_name),
    config.dataPoints.map(({ name }) => name),
  );
});
