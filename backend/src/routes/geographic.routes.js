import express from 'express';
import GeographicService from '../services/geographic.service.js';

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

export default router;
