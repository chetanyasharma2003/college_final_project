import express from 'express';
import { randomUUID } from 'node:crypto';
import { verifyAuth, checkRole } from '../middleware/auth.middleware.js';
import DataSyncService from '../services/data-sync.service.js';

const router = express.Router();
const syncJobs = new Map();

router.post('/all', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  const id = randomUUID();
  const job = {
    id,
    status: 'running',
    completedSchemes: 0,
    totalSchemes: 7,
    schemes: {},
    startedAt: new Date().toISOString(),
    result: null,
    error: null,
  };
  syncJobs.set(id, job);

  setImmediate(async () => {
    try {
      job.result = await DataSyncService.syncAllSchemeData((schemeCode, result) => {
        job.schemes[schemeCode] = result;
        job.completedSchemes += 1;
      });
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.completedAt = new Date().toISOString();
      console.error('Official data sync job failed:', error.message);
    }

    const cleanup = setTimeout(() => syncJobs.delete(id), 60 * 60 * 1000);
    cleanup.unref?.();
  });

  res.status(202).json({
    status: 'success',
    data: { jobId: id, status: job.status },
    message: 'Official source sync started.',
  });
});

router.get('/jobs/:jobId', verifyAuth, checkRole(['ADMIN']), (req, res) => {
  const job = syncJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ status: 'error', message: 'Sync job not found or expired' });
  return res.json({
    status: 'success',
    data: {
      id: job.id,
      status: job.status,
      completedSchemes: job.completedSchemes,
      totalSchemes: job.totalSchemes,
      schemes: job.schemes,
      result: job.result,
      error: job.error,
      startedAt: job.startedAt,
      completedAt: job.completedAt || null,
    },
  });
});

router.post('/:schemeCode', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const schemeCode = req.params.schemeCode.toUpperCase();
    const result = await DataSyncService.syncSchemeData(schemeCode);
    const statusCode = result.status === 'success' ? 200 : result.status === 'partial' ? 207 : 502;
    res.status(statusCode).json({
      status: result.status,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Scheme sync failed for ${req.params.schemeCode}:`, error.message);
    res.status(500).json({
      status: 'error',
      message: 'Scheme data sync failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET - Sync status check करो
router.get('/status', verifyAuth, async (req, res) => {
  try {
    const prisma = (await import('../config/prisma.js')).default;

    const stats = await prisma.$queryRaw`
      SELECT
        (SELECT COUNT(*) FROM "Scheme") as total_schemes,
        (SELECT COUNT(*) FROM "State") as total_states,
        (SELECT COUNT(*) FROM "KPIDefinition") as total_kpis,
        (SELECT COUNT(*) FROM "KPIValue") as total_kpi_values,
        (SELECT COUNT(*) FROM "SchemeDataGeneric") as generic_records,
        (SELECT COUNT(*) FROM "PMAYData") as pmay_records,
        (SELECT COUNT(*) FROM "MGNREGSData") as mgnregs_records
    `;

    res.json({
      status: 'success',
      data: stats[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;
