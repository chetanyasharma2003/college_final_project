import express from 'express';
import { verifyAuth, checkRole } from '../middleware/auth.middleware.js';
import PMAYDataService from '../services/pmay-data.service.js';

const router = express.Router();

// POST - Sync PMAY data from government API
router.post('/sync', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const { apiKey } = req.body;

    const result = await PMAYDataService.syncPMAYData(
      apiKey || process.env.PMAY_API_KEY
    );

    const statusCode = result.status === 'success' ? 200 : 400;

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

// GET - PMAY summary
router.get('/summary', verifyAuth, async (req, res) => {
  try {
    const summary = await PMAYDataService.getPMAYSummary();

    res.json({
      status: 'success',
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - PMAY data by state
router.get('/state/:stateId', verifyAuth, async (req, res) => {
  try {
    const { stateId } = req.params;
    const prisma = (await import('../config/prisma.js')).default;

    const data = await prisma.pMAYData.findMany({
      where: { state_id: Number(stateId) },
      orderBy: { date: 'desc' },
      take: 12, // Last 12 months
    });

    res.json({
      status: 'success',
      data,
      count: data.length,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

export default router;
