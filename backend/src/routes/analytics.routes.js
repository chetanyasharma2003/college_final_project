import express from 'express';
import prisma from '../config/prisma.js';
import { verifyAuth } from '../middleware/auth.middleware.js';
import AnalyticsService from '../services/analytics.service.js';

const router = express.Router();
router.use(verifyAuth);

const scopedStateId = (req, requestedValue) => {
  const requested = requestedValue ? Number(requestedValue) : null;
  if (req.stateAccess && requested && requested !== req.stateAccess) return { denied: true };
  return { stateId: req.stateAccess || requested };
};

// GET - Compare schemes
router.get('/compare-schemes', async (req, res) => {
  try {
    const { scheme_ids, state_id, days } = req.query;

    if (!scheme_ids) {
      return res.status(400).json({
        status: 'error',
        message: 'scheme_ids parameter required',
      });
    }

    const schemeIds = scheme_ids.split(',').map(Number);
    const scope = scopedStateId(req, state_id);
    if (scope.denied) return res.status(403).json({ status: 'error', message: 'State access denied' });
    const stateId = scope.stateId;
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
router.get('/compare-states', async (req, res) => {
  try {
    const { scheme_id, days } = req.query;

    if (!scheme_id) {
      return res.status(400).json({
        status: 'error',
        message: 'scheme_id parameter required',
      });
    }

    let comparison = await AnalyticsService.compareStates(
      Number(scheme_id),
      Number(days) || 30
    );
    if (req.stateAccess) {
      const state = await prisma.state.findUnique({ where: { id: req.stateAccess } });
      comparison = comparison.filter(item => item.state_id === req.stateAccess || item.name === state?.name);
    }

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
router.get('/compare-states-detail', async (req, res) => {
  try {
    const { scheme_id, state1_id, state2_id, days } = req.query;

    if (!scheme_id || !state1_id || !state2_id) {
      return res.status(400).json({
        status: 'error',
        message: 'scheme_id, state1_id, and state2_id required',
      });
    }
    if (req.stateAccess && (Number(state1_id) !== req.stateAccess || Number(state2_id) !== req.stateAccess)) {
      return res.status(403).json({ status: 'error', message: 'State access denied' });
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
router.get('/rankings', async (req, res) => {
  try {
    const { days } = req.query;
    let rankings = await AnalyticsService.getRankings(Number(days) || 30);
    if (req.stateAccess) {
      const state = await prisma.state.findUnique({ where: { id: req.stateAccess } });
      rankings = rankings.filter(item => item.state_name === state?.name);
    }

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
router.get('/performance-gaps', async (req, res) => {
  try {
    const { scheme_id, state_id, days } = req.query;

    if (!scheme_id) {
      return res.status(400).json({
        status: 'error',
        message: 'scheme_id parameter required',
      });
    }

    const scope = scopedStateId(req, state_id);
    if (scope.denied) return res.status(403).json({ status: 'error', message: 'State access denied' });
    const gaps = await AnalyticsService.getPerformanceGaps(
      Number(scheme_id),
      scope.stateId,
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
router.get('/trend/:kpiId', async (req, res) => {
  try {
    const { kpiId } = req.params;
    const { state_id, days } = req.query;

    const scope = scopedStateId(req, state_id);
    if (scope.denied) return res.status(403).json({ status: 'error', message: 'State access denied' });
    const trend = await AnalyticsService.getTrendAnalysis(
      Number(kpiId),
      scope.stateId,
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

// GET - State ranking for a scheme
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

    let rankings = await AnalyticsService.compareStates(schemeId, 30);
    if (req.stateAccess) {
      rankings = rankings.filter(item => item.state_id === req.stateAccess);
    }
    res.json({ status: 'success', data: rankings });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

export default router;
