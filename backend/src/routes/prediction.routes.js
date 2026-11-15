import express from 'express';
import { verifyAuth } from '../middleware/auth.middleware.js';
import PredictionService from '../services/prediction.service.js';

const router = express.Router();
const positiveInteger = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};
const requestedMonths = (value, fallback = 3) => {
  if (value == null) return fallback;
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 12 ? number : null;
};

// GET - Predict KPI
router.get('/kpi/:kpiId', verifyAuth, async (req, res) => {
  try {
    const kpiId = positiveInteger(req.params.kpiId);
    const { months, state_id } = req.query;
    const monthsToPredict = requestedMonths(months);
    const requestedStateId = state_id == null ? null : positiveInteger(state_id);
    if (!kpiId || !monthsToPredict || (state_id != null && !requestedStateId)) {
      return res.status(400).json({ status: 'error', message: 'A valid KPI ID, optional state ID, and forecast horizon from 1 to 12 months are required.' });
    }
    if (req.stateAccess && requestedStateId && requestedStateId !== req.stateAccess) {
      return res.status(403).json({ status: 'error', message: 'State access denied' });
    }

    const prediction = await PredictionService.predictKPI(
      kpiId,
      monthsToPredict,
      req.stateAccess || requestedStateId
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
    const kpiId = positiveInteger(req.params.kpiId);
    const { state_id } = req.query;
    const requestedStateId = state_id == null ? null : positiveInteger(state_id);
    if (!kpiId || (state_id != null && !requestedStateId)) {
      return res.status(400).json({ status: 'error', message: 'A valid KPI ID and optional state ID are required.' });
    }
    if (req.stateAccess && requestedStateId && requestedStateId !== req.stateAccess) {
      return res.status(403).json({ status: 'error', message: 'State access denied' });
    }

    const prediction = await PredictionService.predictTargetCompletion(
      Number(kpiId),
      req.stateAccess || requestedStateId
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
    const parsedSchemeId = positiveInteger(schemeId);
    const monthsToPredict = requestedMonths(months);
    if (!parsedSchemeId || !monthsToPredict) {
      return res.status(400).json({ status: 'error', message: 'A valid scheme ID and forecast horizon from 1 to 12 months are required.' });
    }

    const forecasts = await PredictionService.getSchemeForecasts(
      parsedSchemeId,
      monthsToPredict,
      req.stateAccess || null
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
