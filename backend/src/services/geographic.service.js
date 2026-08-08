import prisma from '../config/prisma.js';

export class GeographicService {
  // Get all states
  static async getAllStates() {
    try {
      const states = await prisma.state.findMany({
        orderBy: { name: 'asc' },
      });

      return {
        status: 'success',
        data: states,
        count: states.length,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get state by ID with districts
  static async getStateWithDistricts(stateId) {
    try {
      const state = await prisma.state.findUnique({
        where: { id: parseInt(stateId) },
        include: {
          districts: {
            orderBy: { name: 'asc' },
          },
        },
      });

      if (!state) {
        return {
          status: 'error',
          message: 'State not found',
        };
      }

      return {
        status: 'success',
        data: state,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get districts for a state
  static async getDistrictsByState(stateId) {
    try {
      const districts = await prisma.district.findMany({
        where: { state_id: parseInt(stateId) },
        orderBy: { name: 'asc' },
      });

      return {
        status: 'success',
        data: districts,
        count: districts.length,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get district by ID with blocks
  static async getDistrictWithBlocks(districtId) {
    try {
      const district = await prisma.district.findUnique({
        where: { id: parseInt(districtId) },
        include: {
          blocks: {
            orderBy: { name: 'asc' },
          },
          state: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      if (!district) {
        return {
          status: 'error',
          message: 'District not found',
        };
      }

      return {
        status: 'success',
        data: district,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get blocks for a district
  static async getBlocksByDistrict(districtId) {
    try {
      const blocks = await prisma.block.findMany({
        where: { district_id: parseInt(districtId) },
        orderBy: { name: 'asc' },
      });

      return {
        status: 'success',
        data: blocks,
        count: blocks.length,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get block by ID with villages
  static async getBlockWithVillages(blockId) {
    try {
      const block = await prisma.block.findUnique({
        where: { id: parseInt(blockId) },
        include: {
          villages: {
            orderBy: { name: 'asc' },
          },
          district: {
            select: { id: true, name: true, state_id: true },
          },
        },
      });

      if (!block) {
        return {
          status: 'error',
          message: 'Block not found',
        };
      }

      return {
        status: 'success',
        data: block,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get villages for a block
  static async getVillagesByBlock(blockId) {
    try {
      const villages = await prisma.village.findMany({
        where: { block_id: parseInt(blockId) },
        orderBy: { name: 'asc' },
      });

      return {
        status: 'success',
        data: villages,
        count: villages.length,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get village by ID with KPI data
  static async getVillageDetails(villageId) {
    try {
      const village = await prisma.village.findUnique({
        where: { id: parseInt(villageId) },
        include: {
          block: {
            select: { id: true, name: true, district_id: true },
          },
          kpi_values: {
            orderBy: { date: 'desc' },
            take: 5,
          },
        },
      });

      if (!village) {
        return {
          status: 'error',
          message: 'Village not found',
        };
      }

      return {
        status: 'success',
        data: village,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Search location (state/district/block/village)
  static async searchLocation(query) {
    try {
      const states = await prisma.state.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
      });

      const districts = await prisma.district.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        include: { state: { select: { name: true } } },
      });

      const blocks = await prisma.block.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        include: { district: { select: { name: true } } },
      });

      const villages = await prisma.village.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        include: { block: { select: { name: true } } },
      });

      return {
        status: 'success',
        data: {
          states,
          districts,
          blocks,
          villages,
          totalResults: states.length + districts.length + blocks.length + villages.length,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get state statistics
  static async getStateStatistics(stateId) {
    try {
      const state = await prisma.state.findUnique({
        where: { id: parseInt(stateId) },
      });

      if (!state) {
        return {
          status: 'error',
          message: 'State not found',
        };
      }

      const districtCount = await prisma.district.count({
        where: { state_id: parseInt(stateId) },
      });

      const blockCount = await prisma.block.count({
        where: { district: { state_id: parseInt(stateId) } },
      });

      const villageCount = await prisma.village.count({
        where: { block: { district: { state_id: parseInt(stateId) } } },
      });

      return {
        status: 'success',
        data: {
          state,
          statistics: {
            districts: districtCount,
            blocks: blockCount,
            villages: villageCount,
          },
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get geographic hierarchy (full tree)
  static async getHierarchy(stateId = null) {
    try {
      if (stateId) {
        // Get specific state hierarchy
        const state = await prisma.state.findUnique({
          where: { id: parseInt(stateId) },
          include: {
            districts: {
              include: {
                blocks: {
                  include: {
                    villages: true,
                  },
                },
              },
            },
          },
        });

        return {
          status: 'success',
          data: state,
        };
      } else {
        // Get all states hierarchy (use with caution - large data)
        const states = await prisma.state.findMany({
          include: {
            districts: {
              select: { id: true, name: true },
            },
          },
        });

        return {
          status: 'success',
          data: states,
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}

export default GeographicService;
