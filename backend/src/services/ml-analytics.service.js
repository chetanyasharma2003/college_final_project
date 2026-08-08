import prisma from '../config/prisma.js';

/**
 * ML Analytics Service - Advanced Data Analysis & Forecasting
 * Provides:
 * - Anomaly detection
 * - Trend analysis
 * - Pattern recognition
 * - Smart recommendations
 */
class MLAnalyticsService {
  /**
   * Detect anomalies in KPI values using statistical methods
   */
  static async detectAnomalies(kpiId, threshold = 2.5) {
    try {
      const recentValues = await prisma.kPIValue.findMany({
        where: { kpi_id: kpiId },
        orderBy: { date: 'desc' },
        take: 90, // Last 90 days
        select: { value: true, date: true, target_value: true },
      });

      if (recentValues.length < 10) {
        return { anomalies: [], status: 'insufficient_data' };
      }

      const values = recentValues.reverse().map(v => Number(v.value));
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(
        values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
      );

      const anomalies = recentValues
        .map((v, i) => ({
          date: v.date,
          value: Number(v.value),
          zscore: Math.abs((Number(v.value) - mean) / std),
          isAnomaly: Math.abs((Number(v.value) - mean) / std) > threshold,
          severity: Math.abs((Number(v.value) - mean) / std) > threshold * 2 ? 'HIGH' : 'MEDIUM',
        }))
        .filter(a => a.isAnomaly);

      return {
        anomalies,
        mean,
        stdDev: std,
        count: anomalies.length,
        severity: anomalies.some(a => a.severity === 'HIGH') ? 'HIGH' : 'LOW',
      };
    } catch (err) {
      console.error('Anomaly detection failed:', err.message);
      return { anomalies: [], error: err.message };
    }
  }

  /**
   * Analyze KPI patterns and provide recommendations
   */
  static async analyzePatterns(kpiId) {
    try {
      const kpiDef = await prisma.kPIDefinition.findUnique({
        where: { id: kpiId },
      });

      if (!kpiDef) {
        return { status: 'kpi_not_found' };
      }

      const values = await prisma.kPIValue.findMany({
        where: { kpi_id: kpiId },
        orderBy: { date: 'desc' },
        take: 60,
        select: { value: true, date: true, target_value: true, status: true },
      });

      if (values.length < 5) {
        return { status: 'insufficient_data', recommendations: [] };
      }

      const reversedValues = values.reverse();
      const numValues = reversedValues.map(v => Number(v.value));
      const targets = reversedValues.map(v => Number(v.target_value));

      // Calculate trend
      const recent = numValues.slice(-7);
      const older = numValues.slice(0, 7);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      const trendPercent = ((recentAvg - olderAvg) / olderAvg) * 100;

      // Calculate achievement rate
      const targetAvg = targets[targets.length - 1];
      const achievementRate = (recentAvg / targetAvg) * 100;

      // Generate recommendations
      const recommendations = [];

      if (achievementRate < 50) {
        recommendations.push({
          severity: 'CRITICAL',
          message: `KPI is significantly below target (${Math.round(achievementRate)}% vs 100%)`,
          action: 'Immediate intervention required',
        });
      } else if (achievementRate < 80) {
        recommendations.push({
          severity: 'HIGH',
          message: `KPI is underperforming (${Math.round(achievementRate)}% vs 100%)`,
          action: 'Increase resource allocation',
        });
      }

      if (trendPercent < -10) {
        recommendations.push({
          severity: 'HIGH',
          message: 'KPI is declining rapidly',
          action: 'Review and adjust strategy',
        });
      } else if (trendPercent > 10) {
        recommendations.push({
          severity: 'LOW',
          message: 'KPI shows positive momentum',
          action: 'Maintain current strategy',
        });
      }

      return {
        kpi_id: kpiId,
        kpi_name: kpiDef.kpi_name,
        current_value: recentAvg,
        target_value: targetAvg,
        achievement_rate: Math.round(achievementRate),
        trend: trendPercent > 0 ? 'improving' : 'declining',
        trend_rate: Math.abs(trendPercent).toFixed(2) + '%',
        recommendations,
        datapoints: values.length,
      };
    } catch (err) {
      console.error('Pattern analysis failed:', err.message);
      return { status: 'error', error: err.message };
    }
  }

  /**
   * Compare scheme performance using ML
   */
  static async compareSchemePerformance(schemeIds) {
    try {
      const comparisons = await Promise.all(
        schemeIds.map(async (schemeId) => {
          const kpis = await prisma.kPIDefinition.findMany({
            where: { scheme_id: schemeId },
          });

          const values = await prisma.kPIValue.findMany({
            where: { kpi: { scheme_id: schemeId } },
            orderBy: { date: 'desc' },
            take: 100,
            select: { value: true, target_value: true, status: true },
          });

          const numValues = values.map(v => Number(v.value));
          const avg = numValues.reduce((a, b) => a + b, 0) / numValues.length || 0;

          const statusCounts = {
            on_track: values.filter(v => v.status === 'on_track').length,
            at_risk: values.filter(v => v.status === 'at_risk').length,
            critical: values.filter(v => v.status === 'critical').length,
          };

          return {
            scheme_id: schemeId,
            kpi_count: kpis.length,
            average_performance: Math.round(avg),
            status_distribution: statusCounts,
            health_score: Math.round(
              ((statusCounts.on_track * 1 + statusCounts.at_risk * 0.5) / values.length) * 100
            ),
          };
        })
      );

      // Sort by health score
      return comparisons.sort((a, b) => b.health_score - a.health_score);
    } catch (err) {
      console.error('Scheme comparison failed:', err.message);
      return [];
    }
  }

  /**
   * Identify KPIs that need attention
   */
  static async identifyRiskKPIs(schemeId, limit = 5) {
    try {
      const kpis = await prisma.kPIDefinition.findMany({
        where: { scheme_id: schemeId },
      });

      const kpiScores = await Promise.all(
        kpis.map(async (kpi) => {
          const latestValues = await prisma.kPIValue.findMany({
            where: { kpi_id: kpi.id },
            orderBy: { date: 'desc' },
            take: 10,
            select: { value: true, target_value: true, status: true },
          });

          if (latestValues.length === 0) return null;

          const statusCounts = {
            on_track: latestValues.filter(v => v.status === 'on_track').length,
            at_risk: latestValues.filter(v => v.status === 'at_risk').length,
            critical: latestValues.filter(v => v.status === 'critical').length,
          };

          const riskScore =
            statusCounts.critical * 3 +
            statusCounts.at_risk * 1 +
            statusCounts.on_track * (-0.5);

          return {
            kpi_id: kpi.id,
            kpi_name: kpi.kpi_name,
            risk_score: riskScore,
            status_distribution: statusCounts,
            critical_count: statusCounts.critical,
          };
        })
      );

      return kpiScores
        .filter(Boolean)
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, limit);
    } catch (err) {
      console.error('Risk identification failed:', err.message);
      return [];
    }
  }
}

export default MLAnalyticsService;
