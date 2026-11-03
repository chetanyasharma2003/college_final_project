import express from 'express';
import GeographicService from '../services/geographic.service.js';
import prisma from '../config/prisma.js';
import { verifyAuth } from '../middleware/auth.middleware.js';
import { createLocationScope } from '../services/location-scope.js';
import KPIManagementService from '../services/kpi-management.service.js';

const stateIdOfLocation = createLocationScope(prisma);

const router = express.Router();

// GET /api/v1/geo/states - Get all states
router.get('/states', async (req, res) => {
  try {
    const result = await GeographicService.getAllStates();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch states' });
  }
});

// GET /api/v1/geo/states/:id - Get state with districts
router.get('/states/:id', async (req, res) => {
  try {
    const result = await GeographicService.getStateWithDistricts(req.params.id);
    const statusCode = result.status === 'success' ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch state' });
  }
});

// GET /api/v1/geo/states/:id/stats - Get state statistics
router.get('/states/:id/stats', async (req, res) => {
  try {
    const result = await GeographicService.getStateStatistics(req.params.id);
    const statusCode = result.status === 'success' ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch statistics' });
  }
});

// GET /api/v1/geo/districts - Get districts for state
router.get('/districts', async (req, res) => {
  try {
    const stateId = req.query.stateId;
    if (!stateId) {
      return res.status(400).json({ status: 'error', message: 'stateId required' });
    }
    const result = await GeographicService.getDistrictsByState(stateId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch districts' });
  }
});

// GET /api/v1/geo/districts/:id - Get district with blocks
router.get('/districts/:id', async (req, res) => {
  try {
    const result = await GeographicService.getDistrictWithBlocks(req.params.id);
    const statusCode = result.status === 'success' ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch district' });
  }
});

// GET /api/v1/geo/blocks - Get blocks for district
router.get('/blocks', async (req, res) => {
  try {
    const districtId = req.query.districtId;
    if (!districtId) {
      return res.status(400).json({ status: 'error', message: 'districtId required' });
    }
    const result = await GeographicService.getBlocksByDistrict(districtId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch blocks' });
  }
});

// GET /api/v1/geo/blocks/:id - Get block with villages
router.get('/blocks/:id', async (req, res) => {
  try {
    const result = await GeographicService.getBlockWithVillages(req.params.id);
    const statusCode = result.status === 'success' ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch block' });
  }
});

// GET /api/v1/geo/villages - Get villages for block
router.get('/villages', async (req, res) => {
  try {
    const blockId = req.query.blockId;
    if (!blockId) {
      return res.status(400).json({ status: 'error', message: 'blockId required' });
    }
    const result = await GeographicService.getVillagesByBlock(blockId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch villages' });
  }
});

// GET /api/v1/geo/villages/:id - Get village details
router.get('/villages/:id', async (req, res) => {
  try {
    const result = await GeographicService.getVillageDetails(req.params.id);
    const statusCode = result.status === 'success' ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch village' });
  }
});

// GET /api/v1/geo/search - Search locations
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.length < 2) {
      return res.status(400).json({ status: 'error', message: 'Query must be at least 2 characters' });
    }
    const result = await GeographicService.searchLocation(query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Search failed' });
  }
});

// GET /api/v1/geo/hierarchy - Get geographic hierarchy
router.get('/hierarchy', async (req, res) => {
  try {
    const stateId = req.query.stateId;
    const result = await GeographicService.getHierarchy(stateId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch hierarchy' });
  }
});

// KPI heatmap data is grouped by district; coordinates are intentionally not
// used because the legacy seed data contains non-geographic random coordinates.
router.get('/performance-heatmap', verifyAuth, async (req, res) => {
  try {
    const schemeId = Number.parseInt(req.query.schemeId, 10);
    const stateId = Number.parseInt(req.query.stateId, 10);
    if (!Number.isInteger(schemeId) || schemeId <= 0 || !Number.isInteger(stateId) || stateId <= 0) {
      return res.status(400).json({ status: 'error', message: 'Valid schemeId and stateId are required' });
    }
    if (req.stateAccess && stateId !== req.stateAccess) {
      return res.status(403).json({ status: 'error', message: 'State access denied' });
    }

    const scheme = await prisma.scheme.findUnique({ where: { id: schemeId }, select: { code: true } });
    if (!scheme) return res.status(404).json({ status: 'error', message: 'Scheme not found' });
    const sourceDefinitions = await KPIManagementService.getSchemeKPIs(scheme.code);
    const definitions = sourceDefinitions
      .map(({ id, kpi_name, unit }) => ({ id, kpi_name, unit }))
      .sort((first, second) => first.kpi_name.localeCompare(second.kpi_name));
    const rows = definitions.length ? await prisma.kPIValue.findMany({
        where: { kpi_id: { in: definitions.map(({ id }) => id) }, state_id: stateId, district_id: { not: null }, block_id: null, village_id: null },
        orderBy: { date: 'desc' },
        take: 10000,
        include: { district: { select: { id: true, name: true } }, kpi: { select: { id: true, kpi_name: true, target_value: true } } },
      }) : [];

    const districts = new Map();
    for (const row of rows) {
      const item = districts.get(row.district_id) || { district_id: row.district_id, district_name: row.district.name, values: {} };
      if (!item.values[row.kpi_id]) {
        item.values[row.kpi_id] = {
          value: Number(row.value),
          target: row.target_value == null ? null : Number(row.target_value),
          status: row.target_value == null ? 'not_rated' : row.status,
          date: row.date,
        };
      }
      districts.set(row.district_id, item);
    }
    return res.json({ status: 'success', data: { kpis: definitions, districts: Array.from(districts.values()) } });
  } catch (error) {
    console.error('District heatmap query failed:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to load district KPI heatmap' });
  }
});

router.get('/location-kpis', verifyAuth, async (req, res) => {
  try {
    const id = Number.parseInt(req.query.id, 10);
    const schemeId = Number.parseInt(req.query.schemeId, 10);
    const level = req.query.level;
    const locationField = { state: 'state_id', district: 'district_id', block: 'block_id', village: 'village_id' }[level];
    if (!locationField || !Number.isInteger(id) || id <= 0 || !Number.isInteger(schemeId) || schemeId <= 0) {
      return res.status(400).json({ status: 'error', message: 'Valid level, id and schemeId are required' });
    }
    if (req.stateAccess && (await stateIdOfLocation(level, id)) !== req.stateAccess) {
      return res.status(403).json({ status: 'error', message: 'State access denied' });
    }

    const scheme = await prisma.scheme.findUnique({ where: { id: schemeId }, select: { code: true } });
    if (!scheme) return res.status(404).json({ status: 'error', message: 'Scheme not found' });
    const sourceDefinitions = await KPIManagementService.getSchemeKPIs(scheme.code);
    if (sourceDefinitions.length === 0) return res.json({ status: 'success', data: [] });
    const where = { kpi_id: { in: sourceDefinitions.map(({ id }) => id) } };
    if (level === 'state') Object.assign(where, { state_id: id, district_id: null, block_id: null, village_id: null });
    if (level === 'district') Object.assign(where, { district_id: id, block_id: null, village_id: null });
    if (level === 'block') Object.assign(where, { block_id: id, village_id: null });
    if (level === 'village') where.village_id = id;
    const rows = await prisma.kPIValue.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 5000,
      include: { kpi: { select: { id: true, kpi_name: true, unit: true } } },
    });
    const latest = new Map();
    for (const row of rows) {
      if (!latest.has(row.kpi_id)) latest.set(row.kpi_id, {
        kpi_id: row.kpi_id,
        kpi_name: row.kpi.kpi_name,
        unit: row.kpi.unit,
        value: Number(row.value),
        target: row.target_value == null ? null : Number(row.target_value),
        status: row.target_value == null ? 'not_rated' : row.status,
        date: row.date,
      });
    }
    return res.json({ status: 'success', data: Array.from(latest.values()) });
  } catch (error) {
    console.error('Location KPI query failed:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to load location KPIs' });
  }
});

export default router;
