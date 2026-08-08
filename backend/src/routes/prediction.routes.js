import express from 'express';
import { verifyAuth } from '../middleware/auth.middleware.js';
import PredictionService from '../services/prediction.service.js';

const router = express.Router();

// GET - Predict KPI
router.get('/kpi/:kpiId', verifyAuth, async (req, res) => {
  try {
    const { kpiId } = req.params;
    const { months, state_id } = req.query;

    const prediction = await PredictionService.predictKPI(
      Number(kpiId),
      Number(months) || 3,
      state_id ? Number(state_id) : null
    );

    res.json({
      status: 'success',
      data: prediction,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Predict target completion
router.get('/target-completion/:kpiId', verifyAuth, async (req, res) => {
  try {
    const { kpiId } = req.params;
    const { state_id } = req.query;

    const prediction = await PredictionService.predictTargetCompletion(
      Number(kpiId),
      state_id ? Number(state_id) : null
    );

    res.json({
      status: 'success',
      data: prediction,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Scheme forecasts
router.get('/scheme/:schemeId', verifyAuth, async (req, res) => {
  try {
    const { schemeId } = req.params;
    const { months } = req.query;

    const forecasts = await PredictionService.getSchemeForecasts(
      Number(schemeId),
      Number(months) || 3
    );

    res.json({
      status: 'success',
      data: forecasts,
      count: forecasts.length,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

export default router;
