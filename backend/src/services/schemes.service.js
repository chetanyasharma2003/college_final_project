import prisma from '../config/prisma.js';

export class SchemesService {
  // Get all schemes with stats
  static async getAllSchemes() {
    try {
      const schemes = await prisma.scheme.findMany({
        include: {
          kpi_definitions: {
            select: {
              id: true,
              kpi_name: true,
              unit: true,
            },
          },
        },
      });

      return {
        status: 'success',
        data: schemes,
        count: schemes.length,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get single scheme with details
  static async getSchemeById(schemeId) {
    try {
      const scheme = await prisma.scheme.findUnique({
        where: { id: parseInt(schemeId) },
        include: {
          kpi_definitions: {
            include: {
              kpi_values: {
                where: { date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
                orderBy: { date: 'desc' },
                take: 10,
              },
            },
          },
        },
      });

      if (!scheme) {
        return {
          status: 'error',
          message: 'Scheme not found',
        };
      }

      return {
        status: 'success',
        data: scheme,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get scheme by code
  static async getSchemeByCode(code) {
    try {
      const scheme = await prisma.scheme.findUnique({
        where: { code },
        include: {
          kpi_definitions: true,
        },
      });

      if (!scheme) {
        return {
          status: 'error',
          message: 'Scheme not found',
        };
      }

      return {
        status: 'success',
        data: scheme,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get scheme performance summary
  static async getSchemePerformance(schemeId) {
    try {
      const scheme = await prisma.scheme.findUnique({
        where: { id: parseInt(schemeId) },
      });

      if (!scheme) {
        return {
          status: 'error',
          message: 'Scheme not found',
        };
      }

      // Get latest KPI values for all states
      const kpiData = await prisma.kPIValue.groupBy({
        by: ['kpi_id', 'state_id'],
        where: {
          kpi: { scheme_id: parseInt(schemeId) },
        },
        _avg: { value: true },
        orderBy: { _avg: { value: 'desc' } },
      });

      // Count KPI values by status
      const statusCount = await prisma.kPIValue.groupBy({
        by: ['status'],
        where: {
          kpi: { scheme_id: parseInt(schemeId) },
        },
        _count: { id: true },
      });

      return {
        status: 'success',
        data: {
          scheme,
          kpiData,
          statusSummary: statusCount,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // List all schemes with pagination
  static async listSchemes(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const schemes = await prisma.scheme.findMany({
        skip,
        take: limit,
        include: {
          kpi_definitions: { select: { id: true, kpi_name: true } },
        },
        orderBy: { name: 'asc' },
      });

      const total = await prisma.scheme.count();

      return {
        status: 'success',
        data: schemes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Create scheme (Admin only)
  static async createScheme(data) {
    try {
      const scheme = await prisma.scheme.create({
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          ministry: data.ministry,
          budget: data.budget,
          launch_date: data.launch_date ? new Date(data.launch_date) : null,
        },
      });

      return {
        status: 'success',
        data: scheme,
        message: 'Scheme created successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Update scheme (Admin only)
  static async updateScheme(schemeId, data) {
    try {
      const scheme = await prisma.scheme.update({
        where: { id: parseInt(schemeId) },
        data: {
          name: data.name,
          description: data.description,
          ministry: data.ministry,
          budget: data.budget,
          launch_date: data.launch_date ? new Date(data.launch_date) : undefined,
          updated_at: new Date(),
        },
      });

      return {
        status: 'success',
        data: scheme,
        message: 'Scheme updated successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Delete scheme (Admin only)
  static async deleteScheme(schemeId) {
    try {
      const scheme = await prisma.scheme.delete({
        where: { id: parseInt(schemeId) },
      });

      return {
        status: 'success',
        message: 'Scheme deleted successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get scheme comparison (for analytics)
  static async compareSchemes(schemeIds) {
    try {
      const schemes = await prisma.scheme.findMany({
        where: { id: { in: schemeIds.map(Number) } },
        include: {
          kpi_definitions: {
            include: {
              kpi_values: {
                where: { date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
              },
            },
          },
        },
      });

      if (schemes.length === 0) {
        return {
          status: 'error',
          message: 'No schemes found',
        };
      }

      return {
        status: 'success',
        data: {
          schemes,
          count: schemes.length,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}

export default SchemesService;
