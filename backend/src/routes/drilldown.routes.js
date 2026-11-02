import express from 'express';
import { prismaAll } from '../config/prisma.js';
import { verifyAuth } from '../middleware/auth.middleware.js';
import { createDrilldownService, HttpError } from '../services/drilldown.service.js';

const router = express.Router();
router.use(verifyAuth);

const service = createDrilldownService(prismaAll);

const posInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const fail = (res, error) => {
  if (error instanceof HttpError) return res.status(error.status).json({ status: 'error', message: error.message });
  console.error('drilldown error:', error);
  return res.status(500).json({ status: 'error', message: 'Internal server error' });
};

// GET /api/v1/drilldown/heatmap?kpiId=12
router.get('/heatmap', async (req, res) => {
  const kpiId = posInt(req.query.kpiId);
  if (!kpiId) return res.status(400).json({ status: 'error', message: 'kpiId is required' });
  try {
    const data = await service.getHeatmap({ kpiId, stateScope: req.stateAccess || null });
    res.json({ status: 'success', data });
  } catch (e) { fail(res, e); }
});

// GET /api/v1/drilldown/children?kpiId=12&level=state&parentId=4
router.get('/children', async (req, res) => {
  const kpiId = posInt(req.query.kpiId);
  const parentId = posInt(req.query.parentId);
  const level = String(req.query.level || '');
  if (!kpiId || !parentId || !['state', 'district', 'block'].includes(level)) {
    return res.status(400).json({ status: 'error', message: 'kpiId, parentId and level (state|district|block) are required' });
  }
  try {
    const data = await service.getChildren({ kpiId, level, parentId, stateScope: req.stateAccess || null });
    res.json({ status: 'success', data });
  } catch (e) { fail(res, e); }
});

export default router;
