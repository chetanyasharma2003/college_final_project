import dotenv from 'dotenv';
import { argv } from 'node:process';

const envFileArg = argv.find((arg) => arg.startsWith('--env-file='));
const envFile = envFileArg?.slice('--env-file='.length);
if (envFile) dotenv.config({ path: envFile, override: true });

const apply = argv.includes('--apply');
const confirmed = argv.includes('--confirm-production-cleanup');
if (apply && !confirmed) {
  throw new Error('Applying cleanup requires --confirm-production-cleanup.');
}
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Pass an explicit --env-file for the intended database.');
}

const { PrismaClient } = await import('@prisma/client');
const { SCHEME_CONFIGS } = await import('../src/config/scheme-integrations.js');
const prisma = new PrismaClient();

const locationKey = ({ scheme_id, state_id, district_id, block_id, village_id }) => (
  [scheme_id, state_id, district_id, block_id, village_id].join(':')
);

const numeric = (value) => {
  if (value == null || value === '') return null;
  const number = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(number) ? number : null;
};

try {
  await prisma.$connect();
  const schemes = await prisma.scheme.findMany({ include: { kpi_definitions: true } });
  const schemeById = new Map(schemes.map((scheme) => [scheme.id, scheme]));
  const configuredCodes = new Set(Object.keys(SCHEME_CONFIGS));
  const configuredSchemes = schemes.filter((scheme) => configuredCodes.has(scheme.code));
  if (configuredSchemes.length !== configuredCodes.size || schemes.length !== configuredCodes.size) {
    throw new Error('The database scheme set differs from the configured scheme set; refusing cleanup.');
  }

  const genericRows = await prisma.schemeDataGeneric.findMany({
    select: {
      scheme_id: true,
      state_id: true,
      district_id: true,
      block_id: true,
      village_id: true,
      data: true,
      date: true,
    },
  });
  const kpiValues = await prisma.kPIValue.findMany({
    include: { kpi: { select: { scheme_id: true, kpi_name: true } } },
  });
  const genericByLocation = new Map();
  for (const row of genericRows) {
    const scheme = schemeById.get(row.scheme_id);
    if (!scheme || !configuredCodes.has(scheme.code) || !SCHEME_CONFIGS[scheme.code]?.fieldMapping) {
      throw new Error(`Unmapped generic source row found for scheme ${scheme?.code || row.scheme_id}; refusing cleanup.`);
    }
    if (row.block_id != null || row.village_id != null) {
      throw new Error('A generic source row uses block/village geography; refusing to remove that hierarchy.');
    }
    const key = locationKey(row);
    const rows = genericByLocation.get(key) || [];
    rows.push(row);
    genericByLocation.set(key, rows);
  }

  const sourceDefinitionIds = new Set();
  const nonSourceDefinitionIds = new Set();
  const sourceDataPointByMetric = new Map();
  for (const scheme of configuredSchemes) {
    const config = SCHEME_CONFIGS[scheme.code];
    const dataPointsByName = new Map((config?.dataPoints || []).map((point) => [point.name, point]));
    for (const definition of scheme.kpi_definitions) {
      const dataPoint = dataPointsByName.get(definition.kpi_name);
      if (config?.fieldMapping && dataPoint) {
        sourceDefinitionIds.add(definition.id);
        sourceDataPointByMetric.set(definition.id, { scheme, config, dataPoint });
      } else {
        nonSourceDefinitionIds.add(definition.id);
      }
    }
  }

  const sourceRows = [];
  const unmatchedSourceRows = [];
  for (const row of kpiValues) {
    const mapping = sourceDataPointByMetric.get(row.kpi_id);
    if (!mapping) continue;
    const { scheme, config, dataPoint } = mapping;
    const key = locationKey({
      scheme_id: scheme.id,
      state_id: row.state_id,
      district_id: row.district_id,
      block_id: row.block_id,
      village_id: row.village_id,
    });
    const expectedDate = dataPoint.reportDate || config.reportDate;
    const expectedValueDate = expectedDate?.toISOString().slice(0, 10);
    const observedValueDate = row.date.toISOString().slice(0, 10);
    const rawMatch = (genericByLocation.get(key) || []).some((generic) => {
      const rawValue = numeric(generic.data?.[dataPoint.id]);
      return rawValue != null
        && Math.abs(rawValue - Number(row.value)) < 0.0001
        && generic.date?.toISOString().slice(0, 10) === config.reportDate?.toISOString().slice(0, 10);
    });
    if (rawMatch && expectedValueDate === observedValueDate) sourceRows.push(row);
    else unmatchedSourceRows.push(row);
  }

  if (unmatchedSourceRows.length > 0) {
    throw new Error(`${unmatchedSourceRows.length} source-mapped KPI observations do not match official raw values and dates; refusing cleanup.`);
  }
  if (sourceDefinitionIds.size === 0 || sourceRows.length === 0 || genericRows.length === 0) {
    throw new Error('No verified official source rows were found; refusing cleanup.');
  }

  const sourceIds = [...sourceDefinitionIds];
  const nonSourceIds = [...nonSourceDefinitionIds];
  const removeKpiValues = kpiValues.length - sourceRows.length;
  const removePredictions = await prisma.prediction.count({
    where: { kpi_id: { notIn: sourceIds } },
  });
  const removeBlocks = await prisma.block.count();
  const removeVillages = await prisma.village.count();
  const approximateDistricts = await prisma.district.count({
    where: { OR: [{ area_km2: { not: null } }, { population: { not: null } }] },
  });

  console.log(`official generic source rows to retain: ${genericRows.length}`);
  console.log(`source-matched KPI observations to retain: ${sourceRows.length}`);
  console.log(`non-source/synthetic KPI observations to remove: ${removeKpiValues}`);
  console.log(`non-source KPI definitions to remove: ${nonSourceIds.length}`);
  console.log(`non-source predictions to remove: ${removePredictions}`);
  console.log(`synthetic blocks/villages to remove: ${removeBlocks}/${removeVillages}`);
  console.log(`districts with unsourced area/population to clear: ${approximateDistricts}`);

  if (!apply) {
    console.log('Dry run only. Pass --apply --confirm-production-cleanup to apply this audited cleanup.');
    process.exitCode = 0;
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.kPIValue.deleteMany({ where: { kpi_id: { notIn: sourceIds } } });
      await tx.prediction.deleteMany({ where: { kpi_id: { notIn: sourceIds } } });
      await tx.kPIValue.updateMany({
        where: { kpi_id: { in: sourceIds } },
        data: { target_value: null, status: 'no_target' },
      });
      await tx.kPIDefinition.deleteMany({ where: { id: { in: nonSourceIds } } });
      await tx.village.deleteMany({});
      await tx.block.deleteMany({});
      await tx.district.updateMany({
        where: { OR: [{ area_km2: { not: null } }, { population: { not: null } }] },
        data: { area_km2: null, population: null },
      });
    }, { maxWait: 15000, timeout: 120000 });

    const [remainingValues, remainingDefinitions, remainingPredictions, remainingBlocks, remainingVillages, remainingDistrictMeta] = await Promise.all([
      prisma.kPIValue.count(),
      prisma.kPIDefinition.count({ where: { id: { in: nonSourceIds } } }),
      prisma.prediction.count({ where: { kpi_id: { notIn: sourceIds } } }),
      prisma.block.count(),
      prisma.village.count(),
      prisma.district.count({ where: { OR: [{ area_km2: { not: null } }, { population: { not: null } }] } }),
    ]);
    if (remainingValues !== sourceRows.length || remainingDefinitions || remainingPredictions || remainingBlocks || remainingVillages || remainingDistrictMeta) {
      throw new Error('Post-cleanup verification failed.');
    }
    console.log(`cleanup committed; official KPI observations retained: ${remainingValues}`);
    console.log('post-cleanup verification passed; non-source KPI rows, synthetic hierarchy, and unsourced district metadata are absent.');
  }
} finally {
  await prisma.$disconnect();
}
