import express from 'express';
import SchemesService from '../services/schemes.service.js';
import { verifyAuth, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/v1/schemes - Get all schemes
router.get('/', async (req, res) => {
  try {
    const result = await SchemesService.getAllSchemes();
    const statusCode = result.status === 'success' ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch schemes',
    });
  }
});

// GET /api/v1/schemes/list - Paginated list (MUST be before /:id)
router.get('/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await SchemesService.listSchemes(page, limit);
    const statusCode = result.status === 'success' ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch schemes',
    });
  }
});

// GET /api/v1/schemes/code/:code - Get scheme by code (MUST be before /:id)
router.get('/code/:code', async (req, res) => {
  try {
    const result = await SchemesService.getSchemeByCode(req.params.code);
    const statusCode = result.status === 'success' ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch scheme',
    });
  }
});

// GET /api/v1/schemes/:id - Get single scheme (AFTER specific routes)
router.get('/:id', async (req, res) => {
  try {
    const result = await SchemesService.getSchemeById(req.params.id);
    const statusCode = result.status === 'success' ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch scheme',
    });
  }
});

// GET /api/v1/schemes/:id/performance - Get scheme performance (AFTER :id)
router.get('/:id/performance', async (req, res) => {
  try {
    const result = await SchemesService.getSchemePerformance(req.params.id);
    const statusCode = result.status === 'success' ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch performance',
    });
  }
});

// POST /api/v1/schemes - Create scheme (Admin only)
router.post('/', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const { name, code, description, ministry, budget, launch_date } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and code are required',
      });
    }

    const result = await SchemesService.createScheme({
      name,
      code,
      description,
      ministry,
      budget: budget ? parseFloat(budget) : null,
      launch_date,
    });

    const statusCode = result.status === 'success' ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create scheme',
    });
  }
});

// PUT /api/v1/schemes/:id - Update scheme (Admin only)
router.put('/:id', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const { name, description, ministry, budget, launch_date } = req.body;

    const result = await SchemesService.updateScheme(req.params.id, {
      name,
      description,
      ministry,
      budget: budget ? parseFloat(budget) : null,
      launch_date,
    });

    const statusCode = result.status === 'success' ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update scheme',
    });
  }
});

// DELETE /api/v1/schemes/:id - Delete scheme (Admin only)
router.delete('/:id', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const result = await SchemesService.deleteScheme(req.params.id);
    const statusCode = result.status === 'success' ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete scheme',
    });
  }
});

// POST /api/v1/schemes/compare - Compare multiple schemes
router.post('/compare', async (req, res) => {
  try {
    const { schemeIds } = req.body;

    if (!schemeIds || !Array.isArray(schemeIds)) {
      return res.status(400).json({
        status: 'error',
        message: 'schemeIds array is required',
      });
    }

    const result = await SchemesService.compareSchemes(schemeIds);
    const statusCode = result.status === 'success' ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to compare schemes',
    });
  }
});

export default router;
