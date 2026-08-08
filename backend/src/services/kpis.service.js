import prisma from '../config/prisma.js';

export class KPIsService {
  // Get all KPI definitions
  static async getAllKPIs(schemeId = null) {
    try {
      const where = schemeId ? { scheme_id: parseInt(schemeId) } : {};

      const kpis = await prisma.kPIDefinition.findMany({
        where,
        include: {
          scheme: { select: { name: true, code: true } },
        },
        orderBy: { kpi_name: 'asc' },
      });

      return {
        status: 'success',
        data: kpis,
        count: kpis.length,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get KPI by ID with recent values
  static async getKPIById(kpiId) {
    try {
      const kpi = await prisma.kPIDefinition.findUnique({
        where: { id: parseInt(kpiId) },
        include: {
          scheme: { select: { name: true, code: true } },
          kpi_values: {
            orderBy: { date: 'desc' },
            take: 30, // Last 30 records
          },
        },
      });

      if (!kpi) {
        return {
          status: 'error',
          message: 'KPI not found',
        };
      }

      return {
        status: 'success',
        data: kpi,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get latest KPI values for dashboard
  static async getLatestKPIValues(schemeId = null, stateId = null) {
    try {
      const where = {
        ...(schemeId && { kpi: { scheme_id: parseInt(schemeId) } }),
        ...(stateId && { state_id: parseInt(stateId) }),
      };

      const kpiValues = await prisma.kPIValue.findMany({
        where,
        include: {
          kpi: { select: { kpi_name: true, unit: true, target_value: true } },
          state: { select: { name: true, code: true } },
        },
        orderBy: { date: 'desc' },
        take: 100,
      });

      // Group by KPI and get latest for each
      const latest = {};
      for (const value of kpiValues) {
        const key = `${value.kpi_id}-${value.state_id}`;
        if (!latest[key]) {
          latest[key] = value;
        }
      }

      return {
        status: 'success',
        data: Object.values(latest),
        count: Object.values(latest).length,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get KPI trend (historical data)
  static async getKPITrend(kpiId, stateId = null, days = 90) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const where = {
        kpi_id: parseInt(kpiId),
        date: { gte: startDate },
        ...(stateId && { state_id: parseInt(stateId) }),
      };

      const trend = await prisma.kPIValue.findMany({
        where,
        include: {
          state: { select: { name: true } },
        },
        orderBy: { date: 'asc' },
      });

      return {
        status: 'success',
        data: trend,
        count: trend.length,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get KPI statistics (min, max, avg)
  static async getKPIStatistics(kpiId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const kpiValues = await prisma.kPIValue.findMany({
        where: {
          kpi_id: parseInt(kpiId),
          date: { gte: startDate },
        },
      });

      if (kpiValues.length === 0) {
        return {
          status: 'success',
          data: {
            count: 0,
            message: 'No data available for this period',
          },
        };
      }

      const values = kpiValues.map((v) => Number(v.value));
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const latest = kpiValues[kpiValues.length - 1];

      return {
        status: 'success',
        data: {
          count: kpiValues.length,
          min,
          max,
          avg: Math.round(avg * 100) / 100,
          latest: latest.value,
          change: latest.value - kpiValues[0].value,
          changePercent: ((latest.value - kpiValues[0].value) / kpiValues[0].value) * 100,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get KPI performance status
  static async getKPIStatus(kpiId, stateId = null) {
    try {
      const where = {
        kpi_id: parseInt(kpiId),
        ...(stateId && { state_id: parseInt(stateId) }),
      };

      const statusCount = await prisma.kPIValue.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      });

      return {
        status: 'success',
        data: statusCount,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Create KPI value (add new data point)
  static async createKPIValue(data) {
    try {
      // Validate KPI exists
      const kpi = await prisma.kPIDefinition.findUnique({
        where: { id: parseInt(data.kpi_id) },
      });

      if (!kpi) {
        return {
          status: 'error',
          message: 'KPI not found',
        };
      }

      // Determine status based on target
      let status = 'on_track';
      if (kpi.target_value) {
        const percentage = (data.value / kpi.target_value) * 100;
        if (percentage < 70) status = 'critical';
        else if (percentage < 90) status = 'at_risk';
      }

      const kpiValue = await prisma.kPIValue.create({
        data: {
          kpi_id: parseInt(data.kpi_id),
          state_id: data.state_id ? parseInt(data.state_id) : null,
          district_id: data.district_id ? parseInt(data.district_id) : null,
          block_id: data.block_id ? parseInt(data.block_id) : null,
          village_id: data.village_id ? parseInt(data.village_id) : null,
          value: parseFloat(data.value),
          target_value: kpi.target_value,
          date: new Date(data.date || new Date()),
          status,
        },
      });

      return {
        status: 'success',
        data: kpiValue,
        message: 'KPI value created successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Bulk update KPI values (for data import)
  static async bulkUpdateKPIValues(values) {
    try {
      const results = [];
      for (const value of values) {
        const result = await this.createKPIValue(value);
        results.push(result);
      }

      const successful = results.filter((r) => r.status === 'success').length;

      return {
        status: 'success',
        data: results,
        summary: {
          total: values.length,
          successful,
          failed: values.length - successful,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get top performing states for a KPI
  static async getTopPerformers(kpiId, limit = 5) {
    try {
      const latestValues = await prisma.kPIValue.findMany({
        where: { kpi_id: parseInt(kpiId) },
        include: {
          state: { select: { id: true, name: true, code: true } },
          kpi: { select: { id: true, kpi_name: true, unit: true, target_value: true } },
        },
        orderBy: { value: 'desc' },
        take: limit,
      });

      return {
        status: 'success',
        data: latestValues,
        count: latestValues.length,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get underperforming states for a KPI
  static async getBottomPerformers(kpiId, limit = 5) {
    try {
      const latestValues = await prisma.kPIValue.findMany({
        where: { kpi_id: parseInt(kpiId) },
        include: {
          state: { select: { id: true, name: true, code: true } },
          kpi: { select: { id: true, kpi_name: true, unit: true, target_value: true } },
        },
        orderBy: { value: 'asc' },
        take: limit,
      });

      return {
        status: 'success',
        data: latestValues,
        count: latestValues.length,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}

export default KPIsService;
