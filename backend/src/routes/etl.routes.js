import express from 'express';
import { verifyAuth, checkRole } from '../middleware/auth.middleware.js';
import ETLService from '../services/etl.service.js';
import prisma from '../config/prisma.js';
import { getDataGovApiKey } from '../config/scheme-integrations.js';

const router = express.Router();

// POST - Trigger ETL pipeline
router.post('/sync/:schemeCode', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const { resourceId: bodyResourceId, filters, mapping } = req.body;
    const schemeKey = schemeCode.replace(/[^A-Z0-9]/gi, '_').toUpperCase();
    const resourceId = bodyResourceId || process.env[`DATA_GOV_RESOURCE_ID_${schemeKey}`];
    const apiKey = getDataGovApiKey(schemeCode);

    if (!apiKey || !resourceId) {
      return res.status(400).json({
        status: 'error',
        message: `Configure DATA_GOV_API_KEY_${schemeKey} and a verified resource ID in the server environment.`,
      });
    }
    const configuredMappingValue = process.env[`DATA_GOV_FIELD_MAP_${schemeKey}`];
    let configuredMapping = null;
    try { configuredMapping = configuredMappingValue ? JSON.parse(configuredMappingValue) : null; } catch {
      return res.status(500).json({ status: 'error', message: 'Configured field mapping is invalid JSON.' });
    }
    if (!mapping && !configuredMapping) {
      return res.status(400).json({ status: 'error', message: 'A verified source field mapping is required.' });
    }
    const requestedMapping = mapping || configuredMapping;
    const etlMapping = Array.isArray(requestedMapping.metrics)
      ? requestedMapping
      : { ...requestedMapping, metrics: Object.entries(requestedMapping.metrics || {}).map(([name, field]) => ({ name, field })) };

    const config = {
      apiKey,
      resourceId,
      filters: filters || {},
      mapping: etlMapping,
    };

    const result = await ETLService.runETLPipeline(schemeCode, config);

    const statusCode = result.status === 'success' ? 200 : result.status === 'partial' ? 207 : 502;
    res.status(statusCode).json({
      status: result.status,
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
      partial: recentImports.filter((i) => i.status === 'partial').length,
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
