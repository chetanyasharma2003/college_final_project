import prisma from '../config/prisma.js';
import { SCHEME_CONFIGS } from '../config/scheme-integrations.js';
import { filterSourceKpiDefinitions } from './kpi-management.service.js';

async function sourceKpiIds(schemeId) {
  const scheme = await prisma.scheme.findUnique({
    where: { id: schemeId },
    select: { code: true },
  });
  const config = SCHEME_CONFIGS[scheme?.code];
  if (!config?.fieldMapping) return [];

  const definitions = await prisma.kPIDefinition.findMany({
    where: { scheme_id: schemeId },
    select: { id: true, kpi_name: true },
  });
  return filterSourceKpiDefinitions(definitions, config).map(({ id }) => id);
}

function verifiedSourceDefinitions(schemeCode, definitions) {
  const config = SCHEME_CONFIGS[schemeCode];
  return config?.fieldMapping ? filterSourceKpiDefinitions(definitions, config) : [];
}

class AnalyticsService {
  /**
   * Compare schemes by KPI performance
   */
  static async compareSchemes(schemeIds, stateId = null, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const schemes = await prisma.scheme.findMany({
      where: { id: { in: schemeIds } },
      include: {
        kpi_definitions: true,
      },
    });

    const comparison = [];

    for (const scheme of schemes) {
      const sourceIds = verifiedSourceDefinitions(scheme.code, scheme.kpi_definitions)
        .map(({ id }) => id);
      const kpiValues = sourceIds.length ? await prisma.kPIValue.findMany({
        where: {
          kpi_id: { in: sourceIds },
          state_id: stateId || undefined,
          district_id: null,
          block_id: null,
          village_id: null,
          target_value: { not: null },
          date: { gte: startDate },
        },
        include: { kpi: true, state: true },
      }) : [];

      const avgCompletion = kpiValues.length
        ? kpiValues.reduce(
            (sum, kpi) =>
              sum +
              Math.min(
                100,
                (Number(kpi.value) / Number(kpi.target_value || 100)) * 100
              ),
            0
          ) / kpiValues.length
        : 0;

      const performance = Math.round(avgCompletion * 100) / 100;
      comparison.push({
        scheme_id: scheme.id,
        scheme_name: scheme.name,
        scheme_code: scheme.code,
        budget: scheme.budget,
        performance,
        avg_completion: performance,
        kpi_count: kpiValues.length,
        achieved_count: kpiValues.filter((k) => k.status === 'on_track').length,
        critical_count: kpiValues.filter((k) => k.status === 'critical').length,
        at_risk_count: kpiValues.filter((k) => k.status === 'at_risk').length,
      });
    }

    // Sort by completion rate
    return comparison.sort((a, b) => b.performance - a.performance);
  }

  /**
   * Compare states by scheme performance
   */
  static async compareStates(schemeId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const sourceIds = await sourceKpiIds(schemeId);
    if (sourceIds.length === 0) return [];

    const states = await prisma.state.findMany({
      include: { _count: { select: { districts: true } } },
    });

    const comparison = [];

    for (const state of states) {
      const kpiValues = await prisma.kPIValue.findMany({
        where: {
          kpi_id: { in: sourceIds },
          state_id: state.id,
          district_id: null,
          block_id: null,
          village_id: null,
          target_value: { not: null },
          date: { gte: startDate },
        },
      });

      if (kpiValues.length === 0) continue;

      const avgCompletion =
        kpiValues.reduce(
          (sum, kpi) =>
            sum +
            Math.min(
              100,
              (Number(kpi.value) / Number(kpi.target_value || 100)) * 100
            ),
          0
        ) / kpiValues.length;

      comparison.push({
        state_id: state.id,
        name: state.name,
        state_code: state.code,
        population: state.population,
        districts: state._count.districts,
        progress: Math.round(avgCompletion * 100) / 100,
        status: avgCompletion >= 80 ? 'on_track' : avgCompletion >= 60 ? 'at_risk' : 'critical',
        kpi_count: kpiValues.length,
        critical_count: kpiValues.filter((k) => k.status === 'critical').length,
        at_risk_count: kpiValues.filter((k) => k.status === 'at_risk').length,
        on_track_count: kpiValues.filter((k) => k.status === 'on_track').length,
      });
    }

    return comparison.sort((a, b) => b.progress - a.progress);
  }

  /**
   * Get state vs state detailed comparison
   */
  static async compareStateDetails(schemeId, state1Id, state2Id, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const sourceIds = await sourceKpiIds(schemeId);
    if (sourceIds.length === 0) return { scheme_id: schemeId, comparison: [] };

    const getStateData = async (stateId) => {
      const kpiValues = await prisma.kPIValue.findMany({
        where: {
          kpi_id: { in: sourceIds },
          state_id: stateId,
          district_id: null,
          block_id: null,
          village_id: null,
          target_value: { not: null },
          date: { gte: startDate },
        },
        include: { kpi: true },
      });

      return kpiValues.map((kpi) => ({
        kpi_name: kpi.kpi.kpi_name,
        value: Number(kpi.value),
        target: Number(kpi.target_value),
        completion: Math.round(
          (Number(kpi.value) / Number(kpi.target_value || 100)) * 100
        ),
        status: kpi.status,
        date: kpi.date,
      }));
    };

    const [state1, state2, state1Data, state2Data] = await Promise.all([
      prisma.state.findUnique({ where: { id: state1Id } }),
      prisma.state.findUnique({ where: { id: state2Id } }),
      getStateData(state1Id),
      getStateData(state2Id),
    ]);

    return {
      scheme_id: schemeId,
      comparison: [
        {
          state_name: state1.name,
          state_code: state1.code,
          data: state1Data,
          avg_completion:
            state1Data.length > 0
              ? Math.round(
                  (state1Data.reduce((sum, d) => sum + d.completion, 0) /
                    state1Data.length) *
                    100
                ) / 100
              : 0,
        },
        {
          state_name: state2.name,
          state_code: state2.code,
          data: state2Data,
          avg_completion:
            state2Data.length > 0
              ? Math.round(
                  (state2Data.reduce((sum, d) => sum + d.completion, 0) /
                    state2Data.length) *
                    100
                ) / 100
              : 0,
        },
      ],
    };
  }

  /**
   * Get performance ranking across all schemes
   */
  static async getRankings(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const schemes = await prisma.scheme.findMany({
      include: { kpi_definitions: { select: { id: true, kpi_name: true } } },
    });
    const states = await prisma.state.findMany();
    const sourceIdsByScheme = new Map(schemes.map((scheme) => [
      scheme.id,
      verifiedSourceDefinitions(scheme.code, scheme.kpi_definitions)
        .map(({ id }) => id),
    ]));

    const rankings = [];

    for (const state of states) {
      for (const scheme of schemes) {
        const sourceIds = sourceIdsByScheme.get(scheme.id);
        if (sourceIds.length === 0) continue;
        const kpiValues = await prisma.kPIValue.findMany({
          where: {
            kpi_id: { in: sourceIds },
            state_id: state.id,
            district_id: null,
            block_id: null,
            village_id: null,
            target_value: { not: null },
            date: { gte: startDate },
          },
        });

        if (kpiValues.length === 0) continue;

        const avgCompletion =
          kpiValues.reduce(
            (sum, kpi) =>
              sum +
              Math.min(
                100,
                (Number(kpi.value) / Number(kpi.target_value || 100)) * 100
              ),
            0
          ) / kpiValues.length;

        rankings.push({
          state_name: state.name,
          scheme_name: scheme.name,
          scheme_code: scheme.code,
          completion: Math.round(avgCompletion * 100) / 100,
          critical: kpiValues.filter((k) => k.status === 'critical').length,
          at_risk: kpiValues.filter((k) => k.status === 'at_risk').length,
        });
      }
    }

    return rankings.sort((a, b) => b.completion - a.completion).slice(0, 50);
  }

  /**
   * Get performance gap analysis
   */
  static async getPerformanceGaps(schemeId, stateId = null, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const sourceIds = await sourceKpiIds(schemeId);
    if (sourceIds.length === 0) return [];

    const kpiValues = await prisma.kPIValue.findMany({
      where: {
        kpi_id: { in: sourceIds },
        state_id: stateId || undefined,
        district_id: null,
        block_id: null,
        village_id: null,
        target_value: { not: null },
        date: { gte: startDate },
      },
      include: { kpi: true, state: true },
    });

    const gaps = kpiValues.map((kpi) => ({
      kpi_name: kpi.kpi.kpi_name,
      state_name: kpi.state?.name,
      current_value: Number(kpi.value),
      target_value: Number(kpi.target_value),
      gap: Number(kpi.target_value) - Number(kpi.value),
      gap_percentage: Math.round(
        ((Number(kpi.target_value) - Number(kpi.value)) /
          Number(kpi.target_value)) *
          100
      ),
      status: kpi.status,
    }));

    return gaps.sort((a, b) => b.gap_percentage - a.gap_percentage);
  }

  /**
   * Get trend analysis for KPI
   */
  static async getTrendAnalysis(kpiId, stateId = null, days = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const definition = await prisma.kPIDefinition.findUnique({
      where: { id: kpiId },
      include: { scheme: true },
    });
    const config = definition && SCHEME_CONFIGS[definition.scheme.code];
    if (!config?.fieldMapping || filterSourceKpiDefinitions([definition], config).length === 0) {
      return {
        kpi_name: null,
        trend: [],
        avg_value: null,
        trend_direction: 'insufficient_data',
      };
    }

    const values = await prisma.kPIValue.findMany({
      where: {
        kpi_id: kpiId,
        state_id: stateId || undefined,
        district_id: null,
        block_id: null,
        village_id: null,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
      include: { kpi: true },
    });

    return {
      kpi_name: values[0]?.kpi.kpi_name,
      trend: values.map((v) => ({
        date: v.date,
        value: Number(v.value),
        target: v.target_value == null ? null : Number(v.target_value),
        status: v.status,
      })),
      avg_value: values.length
        ? Math.round(
            (values.reduce((sum, v) => sum + Number(v.value), 0) /
              values.length) *
              100
          ) / 100
        : null,
      trend_direction: this.calculateTrend(values),
    };
  }

  static calculateTrend(values) {
    if (values.length < 2) return 'insufficient_data';

    const first = Number(values[0].value);
    const last = Number(values[values.length - 1].value);

    if (last > first * 1.05) return 'improving';
    if (last < first * 0.95) return 'declining';
    return 'stable';
  }
}

export default AnalyticsService;
