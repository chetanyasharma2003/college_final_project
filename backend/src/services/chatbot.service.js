import prisma from '../config/prisma.js';
import AnalyticsService from './analytics.service.js';
import PredictionService from './prediction.service.js';

class ChatbotService {
  /**
   * Parse natural language query and execute
   */
  static async processQuery(userQuery) {
    const query = userQuery.toLowerCase().trim();
    const intent = this.extractIntent(query);

    let response;

    switch (intent.type) {
      case 'performance':
        response = await this.handlePerformanceQuery(intent, query);
        break;
      case 'comparison':
        response = await this.handleComparisonQuery(intent, query);
        break;
      case 'forecast':
        response = await this.handleForecastQuery(intent, query);
        break;
      case 'ranking':
        response = await this.handleRankingQuery(intent, query);
        break;
      case 'status':
        response = await this.handleStatusQuery(intent, query);
        break;
      default:
        response = {
          type: 'help',
          message:
            'I can help you with: performance analysis, scheme comparison, forecasts, rankings, and status updates.',
          examples: [
            'How is PMAY performing in Maharashtra?',
            'Compare PMAY and MGNREGS',
            'Will PM-KISAN reach target?',
            'Which state has best performance?',
            'Show me MGNREGS status',
          ],
        };
    }

    // Save query history
    await this.saveQuery(userQuery, response, intent.type);

    return response;
  }

  /**
   * Extract intent from query
   */
  static extractIntent(query) {
    // Performance queries
    if (/how.*(perform|doing|progress)/.test(query)) {
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
  static async handlePerformanceQuery(intent, query) {
    // Extract scheme and state names
    const schemes = await prisma.scheme.findMany();
    const states = await prisma.state.findMany();

    let schemeMatch = null;
    let stateMatch = null;

    for (const scheme of schemes) {
      if (query.includes(scheme.code.toLowerCase()) || query.includes(scheme.name.toLowerCase())) {
        schemeMatch = scheme;
        break;
      }
    }

    for (const state of states) {
      if (query.includes(state.name.toLowerCase()) || query.includes(state.code.toLowerCase())) {
        stateMatch = state;
        break;
      }
    }

    if (!schemeMatch) {
      return {
        type: 'error',
        message: 'Please specify a scheme (PMAY, MGNREGS, PM-KISAN, etc.)',
      };
    }

    const kpiValues = await prisma.kPIValue.findMany({
      where: {
        kpi: { scheme_id: schemeMatch.id },
        state_id: stateMatch?.id,
      },
      include: { kpi: true },
      take: 10,
      orderBy: { date: 'desc' },
    });

    if (kpiValues.length === 0) {
      return {
        type: 'no_data',
        message: `No performance data available for ${schemeMatch.name}${stateMatch ? ` in ${stateMatch.name}` : ''}`,
      };
    }

    const avgCompletion =
      kpiValues.reduce(
        (sum, k) => sum + (Number(k.value) / Number(k.target_value || 100)) * 100,
        0
      ) / kpiValues.length;

    return {
      type: 'performance',
      scheme: schemeMatch.name,
      state: stateMatch?.name || 'All India',
      overall_completion: Math.round(avgCompletion * 100) / 100,
      status:
        avgCompletion >= 80 ? 'On Track' : avgCompletion >= 50 ? 'At Risk' : 'Critical',
      key_metrics: kpiValues.slice(0, 3).map((k) => ({
        name: k.kpi.kpi_name,
        value: Number(k.value),
        target: Number(k.target_value),
        completion: Math.round(
          (Number(k.value) / Number(k.target_value || 100)) * 100
        ),
      })),
      message: `${schemeMatch.name} is ${avgCompletion >= 80 ? 'performing well' : avgCompletion >= 50 ? 'at risk' : 'in critical condition'}${stateMatch ? ` in ${stateMatch.name}` : ''}. Current completion: ${Math.round(avgCompletion)}%`,
    };
  }

  /**
   * Handle comparison queries
   */
  static async handleComparisonQuery(intent, query) {
    const schemes = await prisma.scheme.findMany();
    const states = await prisma.state.findMany();

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

    const comparison = await AnalyticsService.compareSchemes(
      mentionedSchemes.map((s) => s.id)
    );

    return {
      type: 'comparison',
      message: `Comparing ${mentionedSchemes.map((s) => s.code).join(' vs ')}`,
      comparison: comparison.slice(0, 5),
      winner: comparison[0].scheme_code,
      winner_completion: comparison[0].avg_completion,
    };
  }

  /**
   * Handle forecast queries
   */
  static async handleForecastQuery(intent, query) {
    const schemes = await prisma.scheme.findMany();

    const scheme = schemes.find(
      (s) => query.includes(s.code.toLowerCase()) || query.includes(s.name.toLowerCase())
    );

    if (!scheme) {
      return {
        type: 'error',
        message: 'Please specify a scheme (PMAY, MGNREGS, PM-KISAN, etc.)',
      };
    }

    const kpiDef = await prisma.kPIDefinition.findFirst({
      where: { scheme_id: scheme.id },
    });

    if (!kpiDef) {
      return {
        type: 'error',
        message: `No KPI data available for ${scheme.name}`,
      };
    }

    const prediction = await PredictionService.predictKPI(kpiDef.id, 3);

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
      message: `${scheme.name} is ${prediction.trend}. Next month forecast: ${prediction.next_month_prediction}`,
      forecast: prediction.forecasts.slice(0, 3),
      confidence: prediction.prediction_confidence,
    };
  }

  /**
   * Handle ranking queries
   */
  static async handleRankingQuery(intent, query) {
    const rankings = await AnalyticsService.getRankings();

    const isStates = /state/.test(query);
    const isSchemes = /scheme/.test(query);

    let topPerformers;

    if (isSchemes) {
      topPerformers = rankings
        .reduce((acc, r) => {
          const existing = acc.find((x) => x.scheme_name === r.scheme_name);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ scheme_name: r.scheme_name, count: 1, completion: r.completion });
          }
          return acc;
        }, [])
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        type: 'ranking',
        category: 'schemes',
        message: 'Top performing schemes',
        data: topPerformers,
      };
    }

    topPerformers = rankings
      .reduce((acc, r) => {
        const existing = acc.find((x) => x.state_name === r.state_name);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ state_name: r.state_name, count: 1, completion: r.completion });
        }
        return acc;
      }, [])
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      type: 'ranking',
      category: 'states',
      message: 'Top performing states',
      data: topPerformers,
    };
  }

  /**
   * Handle status queries
   */
  static async handleStatusQuery(intent, query) {
    const schemes = await prisma.scheme.findMany();

    const scheme = schemes.find(
      (s) => query.includes(s.code.toLowerCase()) || query.includes(s.name.toLowerCase())
    );

    if (!scheme) {
      // Overall status
      const allKPIs = await prisma.kPIValue.findMany({
        take: 100,
        orderBy: { date: 'desc' },
      });

      return {
        type: 'status',
        message: 'Overall dashboard status',
        total_kpis: allKPIs.length,
        on_track: allKPIs.filter((k) => k.status === 'on_track').length,
        at_risk: allKPIs.filter((k) => k.status === 'at_risk').length,
        critical: allKPIs.filter((k) => k.status === 'critical').length,
      };
    }

    const kpiValues = await prisma.kPIValue.findMany({
      where: { kpi: { scheme_id: scheme.id } },
      include: { kpi: true },
      take: 20,
      orderBy: { date: 'desc' },
    });

    return {
      type: 'status',
      scheme: scheme.name,
      message: `Current status of ${scheme.name}`,
      total_kpis: kpiValues.length,
      on_track: kpiValues.filter((k) => k.status === 'on_track').length,
      at_risk: kpiValues.filter((k) => k.status === 'at_risk').length,
      critical: kpiValues.filter((k) => k.status === 'critical').length,
      latest_update: kpiValues[0]?.date,
    };
  }

  /**
   * Save query history
   */
  static async saveQuery(queryText, response, queryType) {
    await prisma.chatbotQuery.create({
      data: {
        query_text: queryText,
        response_text: JSON.stringify(response),
        query_type: queryType,
        confidence_score: 0.85,
      },
    });
  }

  /**
   * Get sample queries
   */
  static getSampleQueries() {
    return [
      'How is PMAY performing in Maharashtra?',
      'Compare PMAY and MGNREGS',
      'Will PM-KISAN reach its target?',
      'Which state has the best performance?',
      'Show me recent status updates',
      'What is the latest MGNREGS data?',
      'Compare Maharashtra vs Uttar Pradesh',
      'Forecast PM-KISAN for next quarter',
    ];
  }
}

export default ChatbotService;
