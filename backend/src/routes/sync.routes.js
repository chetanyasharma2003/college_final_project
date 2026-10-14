import express from 'express';
import { verifyAuth, checkRole } from '../middleware/auth.middleware.js';
import DataSyncService from '../services/data-sync.service.js';

const router = express.Router();

// POST - Sync all scheme data from government APIs
router.post('/all', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  try {
    console.log('🔄 Admin initiated data sync...');
    const result = await DataSyncService.syncAllSchemeData();

    res.json({
      status: result.failed === 0 ? 'success' : 'partial',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// POST - Sync specific scheme
router.post('/:schemeCode', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const { schemeCode } = req.params;
    console.log(`🔄 Syncing ${schemeCode}...`);

    const result = await DataSyncService.syncSchemeData(schemeCode.toUpperCase());

    res.status(result.status === 'success' ? 200 : result.status === 'partial' ? 207 : 502).json({
      status: result.status,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Sync status
router.get('/status', verifyAuth, async (req, res) => {
  try {
    const prisma = (await import('../config/prisma.js')).default;
    const latestImport = await prisma.dataImport.findFirst({ orderBy: { imported_at: 'desc' } });
    res.json({
      status: 'ok',
      message: 'Data sync service is operational',
      availableSchemes: ['PMAY', 'MGNREGS', 'PMGSY', 'NRLM', 'DDU-GKY', 'SAGY'],
      lastSync: latestImport?.imported_at || null,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

export default router;
