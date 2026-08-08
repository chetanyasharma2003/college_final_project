import prisma from '../config/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

class ReportService {
  /**
   * Generate Executive Summary Report (Text/CSV format)
   */
  static async generateExecutiveSummary(schemeId, stateId = null, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const scheme = await prisma.scheme.findUnique({
      where: { id: schemeId },
      include: { kpi_definitions: true },
    });

    const kpiValues = await prisma.kPIValue.findMany({
      where: {
        kpi: { scheme_id: schemeId },
        state_id: stateId || undefined,
        date: { gte: startDate },
      },
      include: { kpi: true, state: true },
    });

    const summaryData = {
      scheme_name: scheme.name,
      scheme_code: scheme.code,
      ministry: scheme.ministry,
      budget: scheme.budget,
      period: `Last ${days} days`,
      generated_date: new Date().toISOString().split('T')[0],
      total_kpis: kpiValues.length,
      on_track: kpiValues.filter((k) => k.status === 'on_track').length,
      at_risk: kpiValues.filter((k) => k.status === 'at_risk').length,
      critical: kpiValues.filter((k) => k.status === 'critical').length,
      overall_completion:
        kpiValues.length > 0
          ? Math.round(
              (kpiValues.reduce(
                (sum, k) =>
                  sum +
                  (Number(k.value) / Number(k.target_value || 100)) * 100,
                0
              ) /
                kpiValues.length) *
                100
            ) / 100
          : 0,
      key_metrics: kpiValues.slice(0, 5).map((k) => ({
        name: k.kpi.kpi_name,
        value: Number(k.value),
        target: Number(k.target_value),
        status: k.status,
      })),
    };

    return summaryData;
  }

  /**
   * Generate CSV Report
   */
  static async generateCSV(schemeId, stateId = null, startDate = null, endDate = null) {
    if (!startDate) {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
    }
    if (!endDate) endDate = new Date();

    const kpiValues = await prisma.kPIValue.findMany({
      where: {
        kpi: { scheme_id: schemeId },
        state_id: stateId || undefined,
        date: { gte: startDate, lte: endDate },
      },
      include: { kpi: true, state: true },
      orderBy: { date: 'asc' },
    });

    const csvHeader =
      'Date,KPI Name,State,Value,Target,Completion %,Status\n';
    const csvRows = kpiValues
      .map((kpi) => {
        const completion = Math.round(
          (Number(kpi.value) / Number(kpi.target_value || 100)) * 100
        );
        return `${kpi.date.toISOString().split('T')[0]},"${kpi.kpi.kpi_name}","${
          kpi.state?.name || 'National'
        }",${Number(kpi.value)},${Number(kpi.target_value)},${completion}%,${
          kpi.status
        }`;
      })
      .join('\n');

    const csv = csvHeader + csvRows;
    const filename = `report_${schemeId}_${Date.now()}.csv`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, csv);

    return { filename, filepath, size: csv.length };
  }

  /**
   * Generate JSON Report (for API response)
   */
  static async generateJSON(schemeId, stateId = null, startDate = null, endDate = null) {
    if (!startDate) {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
    }
    if (!endDate) endDate = new Date();

    const scheme = await prisma.scheme.findUnique({
      where: { id: schemeId },
      include: { kpi_definitions: true },
    });

    const kpiValues = await prisma.kPIValue.findMany({
      where: {
        kpi: { scheme_id: schemeId },
        state_id: stateId || undefined,
        date: { gte: startDate, lte: endDate },
      },
      include: { kpi: true, state: true },
      orderBy: { date: 'asc' },
    });

    const predictions = await prisma.prediction.findMany({
      where: {
        kpi: { scheme_id: schemeId },
        location_id: stateId || null,
      },
      take: 12,
    });

    return {
      metadata: {
        scheme_name: scheme.name,
        scheme_code: scheme.code,
        generated_date: new Date().toISOString(),
        period_start: startDate.toISOString().split('T')[0],
        period_end: endDate.toISOString().split('T')[0],
        total_records: kpiValues.length,
      },
      performance: {
        on_track: kpiValues.filter((k) => k.status === 'on_track').length,
        at_risk: kpiValues.filter((k) => k.status === 'at_risk').length,
        critical: kpiValues.filter((k) => k.status === 'critical').length,
        avg_completion:
          kpiValues.length > 0
            ? Math.round(
                (kpiValues.reduce(
                  (sum, k) =>
                    sum +
                    (Number(k.value) / Number(k.target_value || 100)) * 100,
                  0
                ) /
                  kpiValues.length) *
                  100
              ) / 100
            : 0,
      },
      kpi_details: kpiValues.map((kpi) => ({
        kpi_name: kpi.kpi.kpi_name,
        state: kpi.state?.name || 'National',
        date: kpi.date.toISOString().split('T')[0],
        value: Number(kpi.value),
        target: Number(kpi.target_value),
        completion: Math.round(
          (Number(kpi.value) / Number(kpi.target_value || 100)) * 100
        ),
        status: kpi.status,
      })),
      predictions: predictions.slice(0, 3).map((p) => ({
        predicted_value: Number(p.predicted_value),
        confidence: p.confidence_score,
        forecast_date: p.prediction_date.toISOString().split('T')[0],
      })),
    };
  }

  /**
   * Schedule automated report generation
   */
  static async scheduleReport(userId, schemeId, reportType, frequency = 'monthly') {
    const report = await prisma.report.create({
      data: {
        user_id: userId,
        title: `${reportType} Report - Scheme ${schemeId}`,
        report_type: reportType,
        file_format: reportType === 'executive' ? 'pdf' : 'csv',
        filters: {
          scheme_id: schemeId,
          frequency: frequency,
        },
      },
    });

    return report;
  }

  /**
   * Generate Comparative Report (Multiple schemes)
   */
  static async generateComparativeReport(schemeIds, stateId = null) {
    const schemes = await prisma.scheme.findMany({
      where: { id: { in: schemeIds } },
    });

    const comparison = [];

    for (const scheme of schemes) {
      const kpiValues = await prisma.kPIValue.findMany({
        where: {
          kpi: { scheme_id: scheme.id },
          state_id: stateId || undefined,
        },
        include: { kpi: true },
        take: 100,
      });

      const avgCompletion =
        kpiValues.length > 0
          ? Math.round(
              (kpiValues.reduce(
                (sum, k) =>
                  sum +
                  (Number(k.value) / Number(k.target_value || 100)) * 100,
                0
              ) /
                kpiValues.length) *
                100
            ) / 100
          : 0;

      comparison.push({
        scheme_name: scheme.name,
        scheme_code: scheme.code,
        budget: scheme.budget,
        kpi_count: kpiValues.length,
        avg_completion: avgCompletion,
        status:
          avgCompletion >= 80 ? 'on_track' : avgCompletion >= 60 ? 'at_risk' : 'critical',
      });
    }

    return {
      generated_date: new Date().toISOString(),
      scheme_count: schemes.length,
      comparison: comparison.sort((a, b) => b.avg_completion - a.avg_completion),
    };
  }

  /**
   * Clean up old report files
   */
  static async cleanupOldReports(daysOld = 30) {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - daysOld);

    const oldReports = await prisma.report.findMany({
      where: {
        created_at: { lt: oldDate },
      },
    });

    for (const report of oldReports) {
      if (report.file_path && fs.existsSync(report.file_path)) {
        fs.unlinkSync(report.file_path);
      }

      await prisma.report.delete({
        where: { id: report.id },
      });
    }

    return { deleted_count: oldReports.length };
  }
}

export default ReportService;
