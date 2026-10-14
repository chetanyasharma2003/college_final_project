import express from 'express';
import { verifyAuth, checkRole } from '../middleware/auth.middleware.js';
import DataSyncService from '../services/data-sync.service.js';
import MGNREGSDataService from '../services/mgnregs-data.service.js';
import PMGSYDataService from '../services/pmgsy-data.service.js';
import NRLMDataService from '../services/nrlm-data.service.js';
import DDUGKYDataService from '../services/ddugky-data.service.js';
import SAGYDataService from '../services/sagy-data.service.js';

const router = express.Router();

// MGNREGS
router.post('/mgnregs/sync', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  const result = await DataSyncService.syncSchemeData('MGNREGS');
  res.status(result.status === 'success' ? 200 : 502).json({ status: result.status, data: result });
});

router.get('/mgnregs/summary', verifyAuth, async (req, res) => {
  const data = await MGNREGSDataService.getMGNREGSSummary();
  res.json({ status: 'success', data });
});

// PMGSY
router.post('/pmgsy/sync', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  const result = await DataSyncService.syncSchemeData('PMGSY');
  res.status(result.status === 'success' ? 200 : 502).json({ status: result.status, data: result });
});

router.get('/pmgsy/summary', verifyAuth, async (req, res) => {
  const data = await PMGSYDataService.getPMGSYSummary();
  res.json({ status: 'success', data });
});

// NRLM
router.post('/nrlm/sync', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  const result = await DataSyncService.syncSchemeData('NRLM');
  res.status(result.status === 'success' ? 200 : 502).json({ status: result.status, data: result });
});

router.get('/nrlm/summary', verifyAuth, async (req, res) => {
  const data = await NRLMDataService.getNRLMSummary();
  res.json({ status: 'success', data });
});

// DDU-GKY
router.post('/ddugky/sync', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  const result = await DataSyncService.syncSchemeData('DDU-GKY');
  res.status(result.status === 'success' ? 200 : 502).json({ status: result.status, data: result });
});

router.get('/ddugky/summary', verifyAuth, async (req, res) => {
  const data = await DDUGKYDataService.getDDUGKYSummary();
  res.json({ status: 'success', data });
});

// SAGY
router.post('/sagy/sync', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  const result = await DataSyncService.syncSchemeData('SAGY');
  res.status(result.status === 'success' ? 200 : 502).json({ status: result.status, data: result });
});

router.get('/sagy/summary', verifyAuth, async (req, res) => {
  const data = await SAGYDataService.getSAGYSummary();
  res.json({ status: 'success', data });
});

// Sync All Schemes at Once
router.post('/sync-all', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  const results = await Promise.all(['MGNREGS', 'PMGSY', 'NRLM', 'DDU-GKY', 'SAGY']
    .map(schemeCode => DataSyncService.syncSchemeData(schemeCode)));
  const failed = results.filter(result => result.status !== 'success').length;

  res.status(failed === 0 ? 200 : 207).json({
    status: failed === 0 ? 'success' : 'partial',
    data: {
      synced_schemes: results.length,
      failed_schemes: failed,
      results: results,
    },
  });
});

export default router;
