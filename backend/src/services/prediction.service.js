import prisma from '../config/prisma.js';
import { SCHEME_CONFIGS } from '../config/scheme-integrations.js';
import { filterSourceKpiDefinitions } from './kpi-management.service.js';

class PredictionService {
  /**
   * Exploratory linear projection over dated, source-backed observations.
   */
  static async predictKPI(kpiId, forecastMonths = 3, stateId = null) {
    const historyMonths = 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - historyMonths);
    const kpi = await prisma.kPIDefinition.findUnique({
      where: { id: kpiId },
      include: { scheme: true },
    });
    if (!kpi) return { status: 'not_found', message: 'KPI definition not found.' };

    const sourceConfig = SCHEME_CONFIGS[kpi.scheme.code];
    if (!sourceConfig?.fieldMapping || filterSourceKpiDefinitions([kpi], sourceConfig).length === 0) {
      return { status: 'unsupported_source', message: 'This KPI is not mapped to a configured official source.' };
    }

    // Get historical data
    const historicalData = await prisma.kPIValue.findMany({
      where: {
        kpi_id: kpiId,
        state_id: stateId || undefined,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
      select: {
        value: true,
        target_value: true,
        date: true,
        state_id: true,
        district_id: true,
        block_id: true,
        village_id: true,
      },
    });

    const observations = this.buildObservationSeries(historicalData);
    const gapsInDays = observations.slice(1).map((observation, index) => (
      (observation.date.getTime() - observations[index].date.getTime()) / 86400000
    ));
    const spanInDays = observations.length > 1
      ? (observations.at(-1).date.getTime() - observations[0].date.getTime()) / 86400000
      : 0;
    if (observations.length < 3 || spanInDays < 60 || gapsInDays.some((gap) => gap <= 0 || gap > 180)) {
      return {
        status: 'insufficient_data',
        message: 'A monthly projection needs at least three recent source dates spanning 60 days, with no reporting gap longer than 180 days.',
        available_periods: observations.length,
      };
    }

    const trend = this.linearRegressionByDate(observations);

    // Generate forecasts
    const forecasts = [];
    const lastObservation = observations[observations.length - 1];
    const lastValue = lastObservation.value;
    const lastDate = new Date(lastObservation.date);

    for (let i = 1; i <= forecastMonths; i++) {
      const forecastDate = new Date(lastDate);
      const dayOfMonth = forecastDate.getUTCDate();
      forecastDate.setUTCDate(1);
      forecastDate.setUTCMonth(forecastDate.getUTCMonth() + i);
      const lastDayOfMonth = new Date(Date.UTC(
        forecastDate.getUTCFullYear(),
        forecastDate.getUTCMonth() + 1,
        0,
      )).getUTCDate();
      forecastDate.setUTCDate(Math.min(dayOfMonth, lastDayOfMonth));

      const trendForecast = lastValue + trend.slope * i;

      forecasts.push({
        date: forecastDate,
        predicted_value: Math.max(0, Math.round(trendForecast * 100) / 100),
        confidence_score: null,
        trend_direction: trend.slope > 0 ? 'increasing' : trend.slope < 0 ? 'decreasing' : 'stable',
        forecast_period: this.getForecastPeriod(i),
      });
    }

    // Store this as a simple linear projection. No statistical confidence score is claimed.
    for (const forecast of forecasts) {
      try {
        await prisma.prediction.create({
          data: {
            kpi_id: kpiId,
            location_type: stateId ? 'state' : 'national',
            location_id: stateId || null,
            predicted_value: forecast.predicted_value,
            prediction_date: forecast.date,
            forecast_period: forecast.forecast_period,
            model_type: 'linear_trend',
          },
        });
      } catch (err) {
        // Ignore duplicate key errors, just skip
        if (!err.message.includes('Unique constraint failed')) {
          console.error(`Failed to save prediction for KPI ${kpiId}:`, err.message);
        }
      }
    }

    return {
      status: 'success',
      kpi_name: kpi.kpi_name,
      kpi_id: kpiId,
      historical_periods: observations.length,
      aggregation: stateId ? 'selected_state_source_total' : 'national_total_or_lowest_available_geography_sum',
      historical_avg: Math.round(
        (observations.reduce((sum, observation) => sum + observation.value, 0) / observations.length) * 100
      ) / 100,
      trend: trend.slope > 0 ? 'increasing' : trend.slope < 0 ? 'decreasing' : 'stable',
      trend_rate:
        Math.round(Math.abs(trend.slope * 12) * 100) / 100 + ' per year',
      forecasts: forecasts,
      prediction_confidence: null,
      next_month_prediction: forecasts[0]?.predicted_value ?? null,
      next_quarter_prediction: forecasts[2]?.predicted_value ?? forecasts.at(-1)?.predicted_value ?? null,
    };
  }

  static buildObservationSeries(rows) {
    const rowsByDate = new Map();
    for (const row of rows) {
      const date = new Date(row.date);
      const value = Number(row.value);
      if (Number.isNaN(date.getTime()) || !Number.isFinite(value)) continue;
      const key = date.toISOString().slice(0, 10);
      const dayRows = rowsByDate.get(key) || [];
      dayRows.push({ ...row, value, date });
      rowsByDate.set(key, dayRows);
    }

    return Array.from(rowsByDate, ([, dayRows]) => {
      const nationalRows = dayRows.filter((row) => (
        row.state_id == null && row.district_id == null && row.block_id == null && row.village_id == null
      ));
      const districtRows = dayRows.filter((row) => row.district_id != null && row.block_id == null && row.village_id == null);
      const stateRows = dayRows.filter((row) => row.state_id != null && row.district_id == null && row.block_id == null && row.village_id == null);
      const sourceRows = nationalRows.length ? nationalRows : districtRows.length ? districtRows : stateRows;
      if (sourceRows.length === 0) return null;
      return {
        date: new Date(sourceRows.reduce((latest, row) => row.date > latest ? row.date : latest, sourceRows[0].date)),
        value: sourceRows.reduce((sum, row) => sum + row.value, 0),
      };
    }).filter(Boolean).sort((first, second) => first.date - second.date);
  }

  static linearRegressionByDate(observations) {
    const monthLength = 30.4375 * 86400000;
    const origin = observations[0].date.getTime();
    const points = observations.map(({ date, value }) => ({ x: (date.getTime() - origin) / monthLength, y: value }));
    const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
    const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
    const numerator = points.reduce((sum, point) => sum + ((point.x - meanX) * (point.y - meanY)), 0);
    const denominator = points.reduce((sum, point) => sum + ((point.x - meanX) ** 2), 0);
    const slope = denominator ? numerator / denominator : 0;
    return { slope, intercept: meanY - slope * meanX };
  }

  /**
   * Predict if KPI will reach target
   */
  static async predictTargetCompletion(kpiId, stateId = null) {
    const kpi = await prisma.kPIDefinition.findUnique({
      where: { id: kpiId },
    });

    if (!kpi) throw new Error('KPI not found');

    const targetValue = kpi.target_value == null ? null : Number(kpi.target_value);
    if (!Number.isFinite(targetValue) || targetValue <= 0) {
      return { status: 'no_target', kpi_name: kpi.kpi_name, message: 'No valid official target is configured for this KPI.' };
    }

    const prediction = await this.predictKPI(kpiId, 12, stateId);

    if (prediction.status !== 'success') {
      return prediction;
    }

    const lastForecast = prediction.forecasts[prediction.forecasts.length - 1];
    const projectedDifference = lastForecast.predicted_value - targetValue;

    return {
      status: 'exploratory_projection',
      kpi_name: kpi.kpi_name,
      target_value: targetValue,
      projected_value_at_12_months: lastForecast.predicted_value,
      projected_difference_from_target: Math.round(projectedDifference * 100) / 100,
      projection_method: 'linear_trend',
      note: 'This simple projection is not an official performance rating, target completion date, or programme recommendation.',
      forecasts: prediction.forecasts,
    };
  }

  /**
   * Get all predictions for a scheme
   */
  static async getSchemeForecasts(schemeId, months = 3, stateId = null) {
    const kpiDefinitions = await prisma.kPIDefinition.findMany({
      where: { scheme_id: schemeId },
    });

    const forecasts = [];

    for (const kpi of kpiDefinitions) {
      const prediction = await this.predictKPI(kpi.id, months, stateId);
      if (prediction.status === 'success') {
        forecasts.push({
          kpi_name: kpi.kpi_name,
          next_month: prediction.next_month_prediction,
          next_quarter: prediction.next_quarter_prediction,
          trend: prediction.trend,
        });
      }
    }

    return forecasts;
  }

  static getForecastPeriod(month) {
    if (month === 1) return 'next_month';
    if (month <= 3) return 'next_quarter';
    if (month <= 6) return 'next_half_year';
    return 'next_year';
  }
}

export default PredictionService;
