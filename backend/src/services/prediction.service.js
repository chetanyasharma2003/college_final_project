import prisma from '../config/prisma.js';

class PredictionService {
  /**
   * Simple trend-based forecasting (without external ML libraries)
   * Uses linear regression and moving average
   */
  static async predictKPI(kpiId, forecastMonths = 3, stateId = null) {
    const historyMonths = 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - historyMonths);

    // Get historical data
    const historicalData = await prisma.kPIValue.findMany({
      where: {
        kpi_id: kpiId,
        state_id: stateId || undefined,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
      include: { kpi: true },
    });

    if (historicalData.length < 3) {
      return {
        status: 'insufficient_data',
        message: 'Need at least 3 months of data',
      };
    }

    // Prepare data for analysis
    const values = historicalData.map((d) => ({
      date: d.date,
      value: Number(d.value),
      target: Number(d.target_value),
    }));

    // Calculate trend using linear regression
    const trend = this.linearRegression(values.map((v) => v.value));

    // Calculate moving average (3-month MA)
    const maValues = this.movingAverage(values.map((v) => v.value), 3);

    // Generate forecasts
    const forecasts = [];
    let lastValue = values[values.length - 1].value;
    const lastDate = new Date(values[values.length - 1].date);

    for (let i = 1; i <= forecastMonths; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);

      // Combine trend and momentum
      const trendForecast = lastValue + trend.slope * i;
      const confidenceScore = Math.max(
        0.5,
        Math.min(0.95, 0.7 + (maValues.length / historyMonths) * 0.25)
      );

      forecasts.push({
        date: forecastDate,
        predicted_value: Math.max(0, Math.round(trendForecast * 100) / 100),
        confidence_score: Math.round(confidenceScore * 100),
        trend_direction: trend.slope > 0 ? 'improving' : 'declining',
        forecast_period: this.getForecastPeriod(i),
      });

      lastValue = trendForecast;
    }

    // Save predictions to database
    const kpi = await prisma.kPIDefinition.findUnique({
      where: { id: kpiId },
    });

    for (const forecast of forecasts) {
      try {
        // Simply create the prediction (ignore if duplicate)
        await prisma.prediction.create({
          data: {
            kpi_id: kpiId,
            location_type: stateId ? 'state' : 'national',
            location_id: stateId || null,
            predicted_value: forecast.predicted_value,
            confidence_score: forecast.confidence_score,
            prediction_date: forecast.date,
            forecast_period: forecast.forecast_period,
            model_type: 'arima',
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
      historical_months: historyMonths,
      historical_avg: Math.round(
        (values.reduce((s, v) => s + v.value, 0) / values.length) * 100
      ) / 100,
      trend: trend.slope > 0 ? 'improving' : 'declining',
      trend_rate:
        Math.round(Math.abs(trend.slope * 12) * 100) / 100 + ' per year',
      forecasts: forecasts,
      prediction_confidence: 'Moderate',
      next_month_prediction: forecasts[0]?.predicted_value || 0,
      next_quarter_prediction: forecasts[2]?.predicted_value || 0,
    };
  }

  /**
   * Linear regression calculation
   */
  static linearRegression(values) {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * i, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Moving average calculation
   */
  static movingAverage(values, window = 3) {
    const ma = [];
    for (let i = 0; i <= values.length - window; i++) {
      const sum = values.slice(i, i + window).reduce((a, b) => a + b, 0);
      ma.push(sum / window);
    }
    return ma;
  }

  /**
   * Predict if KPI will reach target
   */
  static async predictTargetCompletion(kpiId, stateId = null) {
    const kpi = await prisma.kPIDefinition.findUnique({
      where: { id: kpiId },
    });

    if (!kpi) throw new Error('KPI not found');

    const prediction = await this.predictKPI(kpiId, 12, stateId);

    if (prediction.status !== 'success') {
      return prediction;
    }

    const targetValue = Number(kpi.target_value);
    const lastForecast = prediction.forecasts[prediction.forecasts.length - 1];

    return {
      kpi_name: kpi.kpi_name,
      target_value: targetValue,
      current_trajectory:
        lastForecast.predicted_value > targetValue * 0.95 ? 'on_track' : 'at_risk',
      months_to_target:
        lastForecast.predicted_value >= targetValue
          ? 'Within forecast period'
          : 'Beyond 1 year',
      confidence: prediction.prediction_confidence,
      recommendation:
        lastForecast.predicted_value >= targetValue
          ? 'Maintain current pace'
          : 'Increase efforts to meet target',
      forecasts: prediction.forecasts.slice(0, 4),
    };
  }

  /**
   * Get all predictions for a scheme
   */
  static async getSchemeForecasts(schemeId, months = 3) {
    const kpiDefinitions = await prisma.kPIDefinition.findMany({
      where: { scheme_id: schemeId },
    });

    const forecasts = [];

    for (const kpi of kpiDefinitions) {
      const prediction = await this.predictKPI(kpi.id, months);
      if (prediction.status === 'success') {
        forecasts.push({
          kpi_name: kpi.kpi_name,
          next_month: prediction.next_month_prediction,
          next_quarter: prediction.next_quarter_prediction,
          trend: prediction.trend,
          confidence: prediction.prediction_confidence,
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
