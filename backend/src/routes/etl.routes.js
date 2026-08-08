import express from 'express';
import { verifyAuth, checkRole } from '../middleware/auth.middleware.js';
import ETLService from '../services/etl.service.js';
import prisma from '../config/prisma.js';

const router = express.Router();

// POST - Trigger ETL pipeline
router.post('/sync/:schemeCode', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const { resourceId, apiKey, filters, mapping } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        status: 'error',
        message: 'API key required. Set DATA_GOV_API_KEY in environment.',
      });
    }

    const config = {
      apiKey,
      resourceId: resourceId || schemeCode,
      filters: filters || {},
      mapping:
        mapping || {
          state: 'state_name',
          district: 'district_name',
          date: 'date',
          metrics: [],
        },
    };

    const result = await ETLService.runETLPipeline(schemeCode, config);

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Import history
router.get('/history', verifyAuth, checkRole(['ADMIN', 'ANALYST']), async (req, res) => {
  try {
    const { scheme_id, limit, offset } = req.query;

    const where = scheme_id ? { scheme_id: Number(scheme_id) } : {};

    const imports = await prisma.dataImport.findMany({
      where,
      include: { scheme: true },
      orderBy: { imported_at: 'desc' },
      take: Number(limit) || 20,
      skip: Number(offset) || 0,
    });

    const total = await prisma.dataImport.count({ where });

    res.json({
      status: 'success',
      data: imports,
      pagination: {
        total,
        limit: Number(limit) || 20,
        offset: Number(offset) || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Data sources
router.get('/sources', verifyAuth, async (req, res) => {
  try {
    const sources = await prisma.dataSource.findMany({
      include: { scheme: true },
    });

    res.json({
      status: 'success',
      data: sources,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// POST - Add data source
router.post('/sources', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const { scheme_id, name, api_endpoint, frequency } = req.body;

    if (!scheme_id || !name) {
      return res.status(400).json({
        status: 'error',
        message: 'scheme_id and name are required',
      });
    }

    const source = await prisma.dataSource.create({
      data: {
        scheme_id: Number(scheme_id),
        name,
        api_endpoint: api_endpoint || null,
        frequency: frequency || 'monthly',
        status: 'active',
      },
    });

    res.status(201).json({
      status: 'success',
      data: source,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Sync status
router.get('/sync-status', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const recentImports = await prisma.dataImport.findMany({
      orderBy: { imported_at: 'desc' },
      take: 50,
      include: { scheme: true },
    });

    const statusSummary = {
      total_imports: recentImports.length,
      successful: recentImports.filter((i) => i.status === 'completed').length,
      failed: recentImports.filter((i) => i.status === 'failed').length,
      total_records_imported: recentImports.reduce(
        (sum, i) => sum + (i.records_imported || 0),
        0
      ),
      last_sync: recentImports[0]?.imported_at || null,
    };

    res.json({
      status: 'success',
      data: statusSummary,
      recent_imports: recentImports.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

export default router;
