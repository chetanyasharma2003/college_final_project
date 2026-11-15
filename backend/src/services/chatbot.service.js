import prisma from '../config/prisma.js';
import PredictionService from './prediction.service.js';
import ReportService from './report.service.js';
import { SCHEME_CONFIGS } from '../config/scheme-integrations.js';
import KPIManagementService from './kpi-management.service.js';

const matchMentionedScheme = (schemes, query) => [...schemes]
  .sort((first, second) => second.code.length - first.code.length)
  .find((scheme) => query.includes(scheme.code.toLowerCase()) || query.includes(scheme.name.toLowerCase()));

class ChatbotService {
  /**
   * Parse natural language query and execute
   */
  static async processQuery(userQuery, userContext = {}) {
    const query = userQuery.toLowerCase().trim();
    const intent = this.extractIntent(query);

    let response;

    switch (intent.type) {
      case 'performance':
        response = await this.handlePerformanceQuery(intent, query, userContext.stateAccess);
        break;
      case 'comparison':
        response = await this.handleComparisonQuery(intent, query, userContext.stateAccess);
        break;
      case 'forecast':
        response = await this.handleForecastQuery(intent, query, userContext.stateAccess);
        break;
      case 'ranking':
        response = await this.handleRankingQuery(intent, query, userContext.stateAccess);
        break;
      case 'status':
        response = await this.handleStatusQuery(intent, query, userContext.stateAccess);
        break;
      default:
        response = {
          type: 'help',
          message:
            'I can look up source-reported readings, compare available feed records, or show an exploratory projection when the KPI has enough dated history.',
          examples: [
            'What indicators are available for PMAY-U in Maharashtra?',
            'Compare reported PMAY-G and MGNREGS values',
            'Which states report the highest PMGSY values?',
            'What is the latest NRLM source date?',
          ],
        };
    }

    // Save query history
    await this.saveQuery(userContext.userId, userQuery, response, intent.type);

    return response;
  }

  /**
   * Extract intent from query
   */
  static extractIntent(query) {
    // Performance queries
    if (/indicator|available|source reading|how.*(perform|doing|progress)/.test(query)) {
      return { type: 'performance' };
    }

    // Comparison queries
    if (/(compare|vs|versus|difference)/.test(query)) {
      return { type: 'comparison' };
    }

    // Forecast queries
    if (/(forecast|predict|will|reach|target)/.test(query)) {
      return { type: 'forecast' };
    }

    // Ranking queries
    if (/(best|worst|rank|top|highest|lowest)/.test(query)) {
      return { type: 'ranking' };
    }

    // Status queries
    if (/(status|current|recent|latest)/.test(query)) {
      return { type: 'status' };
    }

    return { type: 'general' };
  }

  /**
   * Handle performance queries
   */
  static async handlePerformanceQuery(intent, query, stateAccess = null) {
    // Extract scheme and state names
    const schemes = await prisma.scheme.findMany();
    const states = await prisma.state.findMany();

    let schemeMatch = null;
    let stateMatch = null;

    schemeMatch = matchMentionedScheme(schemes, query);

    stateMatch = stateAccess
      ? states.find(state => state.id === stateAccess)
      : states.find(state => query.includes(state.name.toLowerCase()) || query.includes(state.code.toLowerCase()));

    if (!schemeMatch) {
      return {
        type: 'error',
        message: 'Please specify a scheme (PMAY, MGNREGS, PM-KISAN, etc.)',
      };
    }

    const sourceConfig = SCHEME_CONFIGS[schemeMatch.code];
    const definitions = sourceConfig?.fieldMapping
      ? await KPIManagementService.getSchemeKPIs(schemeMatch.code)
      : [];
    if (definitions.length === 0) {
      return { type: 'no_data', scheme: schemeMatch.name, message: 'No verified source mapping is configured for this scheme.' };
    }

    const kpiValues = await prisma.kPIValue.findMany({
      where: {
        kpi_id: { in: definitions.map(({ id }) => id) },
        state_id: stateMatch?.id,
      },
      include: { kpi: true, state: true, district: true },
      take: 20,
      orderBy: { date: 'desc' },
    });

    if (kpiValues.length === 0) {
      return {
        type: 'no_data',
        message: `No source observations are available for ${schemeMatch.name}${stateMatch ? ` in ${stateMatch.name}` : ''}.`,
      };
    }

    return {
      type: 'source_readings',
      scheme: schemeMatch.name,
      state: stateMatch?.name || 'configured locations',
      key_metrics: kpiValues.slice(0, 3).map((k) => ({
        name: k.kpi.kpi_name,
        value: Number(k.value),
        unit: k.kpi.unit,
        target: k.target_value == null ? null : Number(k.target_value),
        state: k.state?.name || k.district?.name || null,
        date: k.date,
      })),
      message: `Here are the latest available source readings for ${schemeMatch.name}${stateMatch ? ` in ${stateMatch.name}` : ''}. These values are not a shared performance score.`,
    };
  }

  /**
   * Handle comparison queries
   */
  static async handleComparisonQuery(intent, query, stateAccess = null) {
    const schemes = await prisma.scheme.findMany();
    const mentionedSchemes = schemes.filter(
      (s) =>
        query.includes(s.code.toLowerCase()) || query.includes(s.name.toLowerCase())
    );

    if (mentionedSchemes.length < 2) {
      return {
        type: 'error',
        message: 'Please specify at least 2 schemes to compare',
      };
    }

    const report = await ReportService.generateComparativeReport(
      mentionedSchemes.map((s) => s.id),
      stateAccess
    );
    const comparison = report.comparison.map((scheme) => ({
      ...scheme,
      indicators: scheme.indicators.slice(0, 3).map((indicator) => ({
        ...indicator,
        observations: indicator.observations.slice(0, 3),
      })),
    }));

    return {
      type: 'comparison',
      message: `Latest source readings for ${mentionedSchemes.map((s) => s.code).join(' and ')}. Their indicators and coverage differ, so no overall winner is calculated.`,
      comparison,
    };
  }

  /**
   * Handle forecast queries
   */
  static async handleForecastQuery(intent, query, stateAccess = null) {
    const schemes = await prisma.scheme.findMany();

    const scheme = matchMentionedScheme(schemes, query);

    if (!scheme) {
      return {
        type: 'error',
        message: 'Please specify a scheme (PMAY, MGNREGS, PM-KISAN, etc.)',
      };
    }

    const definitions = SCHEME_CONFIGS[scheme.code]?.fieldMapping
      ? await KPIManagementService.getSchemeKPIs(scheme.code)
      : [];
    const kpiDef = definitions[0];

    if (!kpiDef) {
      return {
        type: 'error',
        message: `No KPI data available for ${scheme.name}`,
      };
    }

    const prediction = await PredictionService.predictKPI(kpiDef.id, 3, stateAccess);

    if (prediction.status !== 'success') {
      return {
        type: 'insufficient_data',
        message: prediction.message,
      };
    }

    return {
      type: 'forecast',
      scheme: scheme.name,
      kpi: kpiDef.kpi_name,
      message: `The reported value for ${kpiDef.kpi_name} is trending ${prediction.trend}. Exploratory next-month estimate: ${prediction.next_month_prediction}; this is not a validated performance forecast.`,
      forecast: prediction.forecasts.slice(0, 3),
    };
  }

  /**
   * Handle ranking queries
   */
  static async handleRankingQuery(intent, query, stateAccess = null) {
    const schemes = await prisma.scheme.findMany();
    const scheme = matchMentionedScheme(schemes, query);
    if (!scheme) {
      return { type: 'help', message: 'Specify one scheme and, if possible, an indicator. Different schemes cannot be ranked on a shared performance scale.' };
    }
    const config = SCHEME_CONFIGS[scheme.code];
    const definitions = config?.fieldMapping ? await KPIManagementService.getSchemeKPIs(scheme.code) : [];
    if (definitions.length === 0) {
      return { type: 'no_data', scheme: scheme.name, message: 'No source-mapped indicators are configured for this scheme.' };
    }
    const definition = definitions.find((item) => query.includes(item.kpi_name.toLowerCase())) || definitions[0];
    const rows = await prisma.kPIValue.findMany({
      where: {
        kpi_id: definition.id,
        state_id: stateAccess || { not: null },
        district_id: config.aggregateByDistrict ? { not: null } : null,
        block_id: null,
        village_id: null,
      },
      include: { state: { select: { id: true, name: true } } },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      take: 10000,
    });
    const latestLocationRows = new Map();
    for (const row of rows) {
      const locationKey = config.aggregateByDistrict ? row.district_id : row.state_id;
      if (locationKey != null && !latestLocationRows.has(locationKey)) latestLocationRows.set(locationKey, row);
    }
    const stateValues = new Map();
    for (const row of latestLocationRows.values()) {
      const state = stateValues.get(row.state_id) || {
        state_name: row.state.name,
        value: 0,
        source_date: row.date,
        locations_covered: 0,
      };
      state.value += Number(row.value);
      if (row.date > state.source_date) state.source_date = row.date;
      state.locations_covered += 1;
      stateValues.set(row.state_id, state);
    }
    const data = Array.from(stateValues.values())
      .sort((first, second) => second.value - first.value)
      .slice(0, 5)
      .map((item) => ({ ...item, value: Math.round(item.value * 100) / 100 }));
    return {
      type: 'source_ranking',
      scheme: scheme.name,
      indicator: definition.kpi_name,
      unit: definition.unit,
      message: `Highest reported ${definition.kpi_name} values for ${scheme.code}. Larger counts or allocations do not necessarily mean better performance.`,
      data,
    };
  }

  /**
   * Handle status queries
   */
  static async handleStatusQuery(intent, query, stateAccess = null) {
    const schemes = await prisma.scheme.findMany();

    const scheme = matchMentionedScheme(schemes, query);

    if (!scheme) {
      return {
        type: 'help',
        message: 'Specify a scheme to review its latest source observations. Feed indicators and coverage differ, so the dashboard does not calculate one combined status.',
      };
    }

    const definitions = SCHEME_CONFIGS[scheme.code]?.fieldMapping
      ? await KPIManagementService.getSchemeKPIs(scheme.code)
      : [];
    if (definitions.length === 0) {
      return { type: 'no_data', scheme: scheme.name, message: 'No source-mapped indicators are configured for this scheme.' };
    }
    const kpiValues = await prisma.kPIValue.findMany({
      where: { kpi_id: { in: definitions.map(({ id }) => id) }, ...(stateAccess && { state_id: stateAccess }) },
      include: { kpi: true, state: true },
      take: 100,
      orderBy: { date: 'desc' },
    });

    const latestUpdate = kpiValues[0]?.date || null;
    return {
      type: 'status',
      scheme: scheme.name,
      message: kpiValues.length
        ? `${kpiValues.length} latest source observations are available for ${scheme.name}. The counts below describe observations, not one overall programme score.`
        : `No source observations are available for ${scheme.name}.`,
      observation_count: kpiValues.length,
      rated_observations: kpiValues.filter((item) => item.target_value != null && ['achieved', 'on_track', 'at_risk', 'critical'].includes(item.status)).length,
      unrated_observations: kpiValues.filter((item) => item.target_value == null).length,
      latest_update: latestUpdate,
    };
  }

  /**
   * Save query history
   */
  static async saveQuery(userId, queryText, response, queryType) {
    await prisma.chatbotQuery.create({
      data: {
        user_id: userId || null,
        query_text: queryText,
        response_text: JSON.stringify(response),
        query_type: queryType,
      },
    });
  }

  /**
   * Get sample queries
   */
  static getSampleQueries() {
    return [
      'What indicators are available for PMAY-U in Maharashtra?',
      'Compare reported PMAY-G and MGNREGS values',
      'Which states report the highest PMGSY values?',
      'What is the latest available NRLM data?',
      'Forecast DDU-GKY for next month',
    ];
  }
}

export default ChatbotService;
