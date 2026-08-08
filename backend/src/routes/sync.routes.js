import express from 'express';
import { verifyAuth, checkRole } from '../middleware/auth.middleware.js';
import RealDataSyncService from '../services/real-data-sync.service.js';

const router = express.Router();

// POST - Sync all scheme data from government APIs
router.post('/all', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  try {
    console.log('🔄 Admin initiated data sync...');
    const result = await RealDataSyncService.syncAllSchemes();

    res.json({
      status: result.failed.length === 0 ? 'success' : 'partial',
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

    const { SCHEME_CONFIGS } = await import('../config/scheme-integrations.js');
    const config = SCHEME_CONFIGS[schemeCode.toUpperCase()];

    if (!config) {
      return res.status(400).json({
        status: 'error',
        message: `Scheme ${schemeCode} not found`,
      });
    }

    const result = await RealDataSyncService.syncSchemeData(
      schemeCode.toUpperCase(),
      config
    );

    res.json({
      status: 'success',
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
    res.json({
      status: 'ok',
      message: 'Real data sync service is operational',
      availableSchemes: ['PMAY', 'MGNREGS', 'PMGSY', 'NRLM', 'DDU-GKY', 'SAGY'],
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

export default router;
