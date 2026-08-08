import express from 'express';
import { verifyAuth } from '../middleware/auth.middleware.js';
import MLAnalyticsService from '../services/ml-analytics.service.js';

const router = express.Router();

// GET - Detect anomalies in a KPI
router.get('/anomalies/:kpiId', verifyAuth, async (req, res) => {
  try {
    const { kpiId } = req.params;
    const { threshold } = req.query;

    const result = await MLAnalyticsService.detectAnomalies(
      Number(kpiId),
      threshold ? Number(threshold) : 2.5
    );

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Analyze KPI patterns and get recommendations
router.get('/patterns/:kpiId', verifyAuth, async (req, res) => {
  try {
    const { kpiId } = req.params;

    const result = await MLAnalyticsService.analyzePatterns(Number(kpiId));

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// POST - Compare multiple schemes
router.post('/compare-schemes', verifyAuth, async (req, res) => {
  try {
    const { scheme_ids } = req.body;

    if (!Array.isArray(scheme_ids) || scheme_ids.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'scheme_ids array required',
      });
    }

    const result = await MLAnalyticsService.compareSchemePerformance(
      scheme_ids.map(Number)
    );

    res.json({
      status: 'success',
      data: result,
      count: result.length,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Identify KPIs that need attention
router.get('/risk-kpis/:schemeId', verifyAuth, async (req, res) => {
  try {
    const { schemeId } = req.params;
    const { limit } = req.query;

    const result = await MLAnalyticsService.identifyRiskKPIs(
      Number(schemeId),
      limit ? Number(limit) : 5
    );

    res.json({
      status: 'success',
      data: result,
      count: result.length,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Get comprehensive dashboard insights
router.get('/dashboard/:schemeId', verifyAuth, async (req, res) => {
  try {
    const { schemeId } = req.params;

    // Parallel analytics
    const [riskKPIs, schemeComparison] = await Promise.all([
      MLAnalyticsService.identifyRiskKPIs(Number(schemeId), 5),
      MLAnalyticsService.compareSchemePerformance([Number(schemeId)]),
    ]);

    res.json({
      status: 'success',
      data: {
        risk_analysis: riskKPIs,
        performance_summary: schemeComparison[0] || null,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

export default router;
