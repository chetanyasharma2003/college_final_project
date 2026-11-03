import prisma from '../config/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  averageKpiCompletion,
  comparativeStatus,
  completionPercentage,
  sourceDataPeriod,
  sourceDateBounds,
  sourceReportKpiIds,
} from '../utils/source-report-metrics.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');

export const escapeCSVField = (value) => {
  if (value == null) return '""';
  let text = String(value);
  if (typeof value === 'string' && /^[\s\u0000-\u001f]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

class ReportService {
  /**
   * Generate Executive Summary Report (Text/CSV format)
   */
  static async generateExecutiveSummary(schemeId, stateId = null, days = null) {
    const hasDaysFilter = Number.isFinite(Number(days)) && Number(days) > 0;
    const startDate = hasDaysFilter ? new Date() : null;
    if (startDate) startDate.setDate(startDate.getDate() - Number(days));

    const scheme = await prisma.scheme.findUnique({ where: { id: schemeId } });

    if (!scheme) {
      const error = new Error('Scheme not found');
      error.statusCode = 404;
      throw error;
    }

    const definitions = await prisma.kPIDefinition.findMany({
      where: { scheme_id: schemeId },
      select: { id: true, kpi_name: true },
    });
    const sourceKpiIds = sourceReportKpiIds(scheme, definitions);

    const kpiValues = await prisma.kPIValue.findMany({
      where: {
        kpi_id: { in: sourceKpiIds },
        state_id: stateId || undefined,
        date: startDate ? { gte: startDate } : undefined,
      },
      include: { kpi: true, state: true },
    });

    const summaryData = {
      scheme_name: scheme.name,
      scheme_code: scheme.code,
      ministry: scheme.ministry,
      budget: scheme.budget,
      period: startDate ? `Last ${days} days` : sourceDataPeriod(kpiValues),
      generated_date: new Date().toISOString().split('T')[0],
      total_kpis: kpiValues.length,
      on_track: kpiValues.filter((k) => k.status === 'on_track').length,
      at_risk: kpiValues.filter((k) => k.status === 'at_risk').length,
      critical: kpiValues.filter((k) => k.status === 'critical').length,
      overall_completion: averageKpiCompletion(kpiValues),
      key_metrics: kpiValues.slice(0, 5).map((k) => ({
        name: k.kpi.kpi_name,
        value: Number(k.value),
        target: k.target_value == null ? null : Number(k.target_value),
        completion: completionPercentage(k.value, k.target_value),
        status: k.status,
      })),
    };

    return summaryData;
  }

  /**
   * Generate CSV Report
   */
  static async generateCSV(schemeId, stateId = null, startDate = null, endDate = null) {
    const scheme = await prisma.scheme.findUnique({ where: { id: schemeId } });
    if (!scheme) {
      const error = new Error('Scheme not found');
      error.statusCode = 404;
      throw error;
    }
    const definitions = await prisma.kPIDefinition.findMany({
      where: { scheme_id: schemeId },
      select: { id: true, kpi_name: true },
    });
    const sourceKpiIds = sourceReportKpiIds(scheme, definitions);

    const kpiValues = await prisma.kPIValue.findMany({
      where: {
        kpi_id: { in: sourceKpiIds },
        state_id: stateId || undefined,
        date: startDate || endDate ? {
          gte: startDate || undefined,
          lte: endDate || undefined,
        } : undefined,
      },
      include: { kpi: true, state: true },
      orderBy: { date: 'asc' },
    });

    const csvHeader = ['Date', 'KPI Name', 'State', 'Value', 'Target', 'Completion %', 'Status']
      .map(escapeCSVField)
      .join(',');
    const csvRows = kpiValues.map((kpi) => {
        const completion = completionPercentage(kpi.value, kpi.target_value);
        return [
          kpi.date.toISOString().split('T')[0],
          kpi.kpi.kpi_name,
          kpi.state?.name || 'National',
          Number(kpi.value),
          kpi.target_value == null ? null : Number(kpi.target_value),
          completion == null ? null : `${Math.round(completion)}%`,
          kpi.status,
        ].map(escapeCSVField).join(',');
      })
      .join('\n');

    const csv = `${csvHeader}\r\n${csvRows}`;
    const filename = `report_${schemeId}_${Date.now()}.csv`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, csv);

    return { filename, filepath, size: csv.length };
  }

  /**
   * Generate JSON Report (for API response)
   */
  static async generateJSON(schemeId, stateId = null, startDate = null, endDate = null) {
    const scheme = await prisma.scheme.findUnique({ where: { id: schemeId } });
    if (!scheme) {
      const error = new Error('Scheme not found');
      error.statusCode = 404;
      throw error;
    }
    const definitions = await prisma.kPIDefinition.findMany({
      where: { scheme_id: schemeId },
      select: { id: true, kpi_name: true },
    });
    const sourceKpiIds = sourceReportKpiIds(scheme, definitions);

    const kpiValues = await prisma.kPIValue.findMany({
      where: {
        kpi_id: { in: sourceKpiIds },
        state_id: stateId || undefined,
        date: startDate || endDate ? {
          gte: startDate || undefined,
          lte: endDate || undefined,
        } : undefined,
      },
      include: { kpi: true, state: true },
      orderBy: { date: 'asc' },
    });

    const predictions = await prisma.prediction.findMany({
      where: {
        kpi_id: { in: sourceKpiIds },
        location_id: stateId || null,
      },
      take: 12,
    });

    const sourceDates = sourceDateBounds(kpiValues);
    return {
      metadata: {
        scheme_name: scheme.name,
        scheme_code: scheme.code,
        generated_date: new Date().toISOString(),
        period_start: (startDate || sourceDates.start)?.toISOString().split('T')[0] || null,
        period_end: (endDate || sourceDates.end)?.toISOString().split('T')[0] || null,
        total_records: kpiValues.length,
      },
      performance: {
        on_track: kpiValues.filter((k) => k.status === 'on_track').length,
        at_risk: kpiValues.filter((k) => k.status === 'at_risk').length,
        critical: kpiValues.filter((k) => k.status === 'critical').length,
        avg_completion: averageKpiCompletion(kpiValues),
      },
      kpi_details: kpiValues.map((kpi) => ({
        kpi_name: kpi.kpi.kpi_name,
        state: kpi.state?.name || 'National',
        date: kpi.date.toISOString().split('T')[0],
        value: Number(kpi.value),
        target: kpi.target_value == null ? null : Number(kpi.target_value),
        completion: completionPercentage(kpi.value, kpi.target_value),
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
    const definitions = schemes.length ? await prisma.kPIDefinition.findMany({
      where: { scheme_id: { in: schemes.map(({ id }) => id) } },
      select: { id: true, scheme_id: true, kpi_name: true },
    }) : [];

    for (const scheme of schemes) {
      const sourceKpiIds = sourceReportKpiIds(
        scheme,
        definitions.filter((definition) => definition.scheme_id === scheme.id),
      );
      const kpiValues = await prisma.kPIValue.findMany({
        where: {
          kpi_id: { in: sourceKpiIds },
          state_id: stateId || undefined,
        },
        include: { kpi: true },
        take: 100,
      });

      const avgCompletion = averageKpiCompletion(kpiValues);

      comparison.push({
        scheme_name: scheme.name,
        scheme_code: scheme.code,
        budget: scheme.budget,
        kpi_count: kpiValues.length,
        avg_completion: avgCompletion,
        status: comparativeStatus(kpiValues, avgCompletion),
      });
    }

    return {
      generated_date: new Date().toISOString(),
      scheme_count: schemes.length,
      comparison: comparison.sort((a, b) => {
        if (a.avg_completion == null) return b.avg_completion == null ? 0 : 1;
        if (b.avg_completion == null) return -1;
        return b.avg_completion - a.avg_completion;
      }),
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
