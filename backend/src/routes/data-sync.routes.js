import express from 'express';
import { verifyAuth, checkRole } from '../middleware/auth.middleware.js';
import DataSyncService from '../services/data-sync.service.js';

const router = express.Router();

// POST - Sync सभी schemes का real API data
router.post('/all', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  try {
    console.log('\n📥 Data sync शुरू हुआ सभी schemes के लिए...');

    const result = await DataSyncService.syncAllSchemeData();

    console.log('\n✅ Data sync complete:', result);

    res.json({
      status: 'success',
      data: result,
      message: `${result.totalRecords} records successfully synced`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Sync failed:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
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
