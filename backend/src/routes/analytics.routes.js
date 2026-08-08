import express from 'express';
import prisma from '../config/prisma.js';
import { verifyAuth, checkRole } from '../middleware/auth.middleware.js';
import AnalyticsService from '../services/analytics.service.js';

const router = express.Router();

// GET - Compare schemes
router.get('/compare-schemes', verifyAuth, async (req, res) => {
  try {
    const { scheme_ids, state_id, days } = req.query;

    if (!scheme_ids) {
      return res.status(400).json({
        status: 'error',
        message: 'scheme_ids parameter required',
      });
    }

    const schemeIds = scheme_ids.split(',').map(Number);
    const stateId = state_id ? Number(state_id) : null;
    const duration = days ? Number(days) : 30;

    const comparison = await AnalyticsService.compareSchemes(
      schemeIds,
      stateId,
      duration
    );

    res.json({
      status: 'success',
      data: comparison,
      metadata: {
        total_schemes: schemeIds.length,
        period_days: duration,
        state_filtered: stateId ? true : false,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Compare states
router.get('/compare-states', verifyAuth, async (req, res) => {
  try {
    const { scheme_id, days } = req.query;

    if (!scheme_id) {
      return res.status(400).json({
        status: 'error',
        message: 'scheme_id parameter required',
      });
    }

    const comparison = await AnalyticsService.compareStates(
      Number(scheme_id),
      Number(days) || 30
    );

    res.json({
      status: 'success',
      data: comparison,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Compare two states detail
router.get('/compare-states-detail', verifyAuth, async (req, res) => {
  try {
    const { scheme_id, state1_id, state2_id, days } = req.query;

    if (!scheme_id || !state1_id || !state2_id) {
      return res.status(400).json({
        status: 'error',
        message: 'scheme_id, state1_id, and state2_id required',
      });
    }

    const comparison = await AnalyticsService.compareStateDetails(
      Number(scheme_id),
      Number(state1_id),
      Number(state2_id),
      Number(days) || 30
    );

    res.json({
      status: 'success',
      data: comparison,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Get rankings
router.get('/rankings', verifyAuth, async (req, res) => {
  try {
    const { days } = req.query;
    const rankings = await AnalyticsService.getRankings(Number(days) || 30);

    res.json({
      status: 'success',
      data: rankings,
      count: rankings.length,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Performance gaps
router.get('/performance-gaps', verifyAuth, async (req, res) => {
  try {
    const { scheme_id, state_id, days } = req.query;

    if (!scheme_id) {
      return res.status(400).json({
        status: 'error',
        message: 'scheme_id parameter required',
      });
    }

    const gaps = await AnalyticsService.getPerformanceGaps(
      Number(scheme_id),
      state_id ? Number(state_id) : null,
      Number(days) || 30
    );

    res.json({
      status: 'success',
      data: gaps,
      critical_gaps: gaps.filter((g) => g.gap_percentage > 50).length,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Trend analysis
router.get('/trend/:kpiId', verifyAuth, async (req, res) => {
  try {
    const { kpiId } = req.params;
    const { state_id, days } = req.query;

    const trend = await AnalyticsService.getTrendAnalysis(
      Number(kpiId),
      state_id ? Number(state_id) : null,
      Number(days) || 90
    );

    res.json({
      status: 'success',
      data: trend,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - State ranking for a scheme (public endpoint)
router.get('/state-ranking/:scheme', async (req, res) => {
  try {
    const { scheme } = req.params;

    let schemeId;
    if (isNaN(scheme)) {
      // It's a code like 'PMAY', look it up
      const schemeRecord = await prisma.scheme.findUnique({
        where: { code: scheme }
      });
      if (!schemeRecord) {
        return res.status(404).json({ status: 'error', message: 'Scheme not found' });
      }
      schemeId = schemeRecord.id;
    } else {
      schemeId = parseInt(scheme);
    }

    const rankings = await AnalyticsService.compareStates(schemeId, 30);
    res.json({ status: 'success', data: rankings });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

export default router;
