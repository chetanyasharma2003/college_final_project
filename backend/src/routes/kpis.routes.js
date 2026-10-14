import express from 'express';
import prisma from '../config/prisma.js';
import KPIManagementService from '../services/kpi-management.service.js';
import { verifyAuth, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(verifyAuth);

// Get all KPIs (compatibility endpoint for old frontend)
router.get('/', async (req, res) => {
  try {
    const schemeId = req.query.schemeId ? Number(req.query.schemeId) : null;
    const kpis = await prisma.kPIDefinition.findMany({
      where: schemeId ? { scheme_id: schemeId } : undefined,
      include: { scheme: true },
    });
    res.json({ status: 'success', data: kpis });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Get latest KPI values (compatibility endpoint for old frontend)
router.get('/latest', async (req, res) => {
  try {
    const schemeId = req.query.schemeId ? Number(req.query.schemeId) : null;
    const schemeCode = req.query.scheme ? req.query.scheme.toUpperCase() : null;
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const { startDate, endDate, stateId } = req.query;

    const parseDate = (value, endOfDay = false) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
      const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
        ? date
        : null;
    };

    const start = startDate ? parseDate(startDate) : null;
    const end = endDate ? parseDate(endDate, true) : null;
    if ((startDate && !start) || (endDate && !end) || (start && end && start > end)) {
      return res.status(400).json({ status: 'error', message: 'Invalid date range' });
    }

    const requestedStateId = stateId ? Number(stateId) : null;
    if (req.stateAccess && requestedStateId && requestedStateId !== req.stateAccess) {
      return res.status(403).json({ status: 'error', message: 'State access denied' });
    }
    const parsedStateId = req.stateAccess || requestedStateId;
    if (stateId && (!Number.isInteger(parsedStateId) || parsedStateId < 1)) {
      return res.status(400).json({ status: 'error', message: 'Invalid state ID' });
    }

    // Build where clause
    let where = {};
    if (schemeId) {
      where.kpi = { scheme_id: schemeId };
    } else if (schemeCode) {
      where.kpi = { scheme: { code: schemeCode } };
    }
    if (parsedStateId) where.state_id = parsedStateId;
    if (start || end) {
      where.date = {
        ...(start && { gte: start }),
        ...(end && { lte: end }),
      };
    }

    const values = await prisma.kPIValue.findMany({
      where,
      include: {
        kpi: true,
        state: true
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    // Add scheme info to response
    const valuesWithScheme = await Promise.all(values.map(async (v) => {
      const kpi = await prisma.kPIDefinition.findUnique({
        where: { id: v.kpi_id },
        include: { scheme: true }
      });
      return {
        ...v,
        scheme: kpi?.scheme || null
      };
    }));

    res.json({ status: 'success', data: valuesWithScheme });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Specific routes (must come BEFORE :kpiId parameter routes)
// Get all KPI definitions for a scheme
router.get('/definitions/:scheme', async (req, res) => {
  try {
    const kpis = await KPIManagementService.getSchemeKPIs(req.params.scheme);
    res.json({ status: 'success', scheme: req.params.scheme, kpis });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Get KPI status for a scheme (comparison with targets) - with optional state filter
router.get('/status/:scheme', async (req, res) => {
  try {
    const requestedStateId = req.query.stateId ? Number(req.query.stateId) : null;
    if (req.stateAccess && requestedStateId && requestedStateId !== req.stateAccess) {
      return res.status(403).json({ status: 'error', message: 'State access denied' });
    }
    const stateId = req.stateAccess || requestedStateId;
    const status = await KPIManagementService.getKPIStatus(req.params.scheme, stateId);
    res.json({ status: 'success', scheme: req.params.scheme, kpi_status: status });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Calculate all schemes KPI values (batch)
router.post('/calculate-all', checkRole(['ADMIN']), async (req, res) => {
  try {
    const startTime = Date.now();
    const results = await KPIManagementService.calculateAllKPIs();
    const executionTime = Date.now() - startTime;

    res.json({ status: 'success', results, execution_time: executionTime });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Calculate current KPI values for a scheme
router.post('/calculate/:scheme', checkRole(['ADMIN']), async (req, res) => {
  try {
    const values = await KPIManagementService.calculateKPIValues(req.params.scheme);
    res.json({ status: 'success', scheme: req.params.scheme, values });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Update KPI target
router.put('/definition/:id/target', checkRole(['ADMIN']), async (req, res) => {
  try {
    const { target_value } = req.body;
    if (!target_value || target_value < 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid target value' });
    }

    const updated = await KPIManagementService.updateKPITarget(req.params.id, target_value);
    res.json({ status: 'success', kpi: updated });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Generic :kpiId routes (must come AFTER specific named routes)
// Get KPI trend (time series data)
router.get('/:kpiId/trend', async (req, res) => {
  try {
    const { kpiId } = req.params;
    const { days = 90 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trend = await prisma.kPIValue.findMany({
      where: {
        kpi_id: parseInt(kpiId),
        ...(req.stateAccess && { state_id: req.stateAccess }),
        date: { gte: startDate }
      },
      include: { state: true },
      orderBy: { date: 'asc' },
      take: 100
    });

    res.json({ status: 'success', data: trend });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Get top performing states for a KPI
router.get('/:kpiId/top', async (req, res) => {
  try {
    const { kpiId } = req.params;
    const { limit = 5 } = req.query;

    const topPerformers = await prisma.kPIValue.findMany({
      where: { kpi_id: parseInt(kpiId), ...(req.stateAccess && { state_id: req.stateAccess }) },
      include: {
        state: true,
        kpi: true
      },
      orderBy: { value: 'desc' },
      take: parseInt(limit)
    });

    res.json({ status: 'success', data: topPerformers });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Get KPI statistics
router.get('/:kpiId/statistics', async (req, res) => {
  try {
    const { kpiId } = req.params;

    const values = await prisma.kPIValue.findMany({
      where: { kpi_id: parseInt(kpiId), ...(req.stateAccess && { state_id: req.stateAccess }) }
    });

    if (values.length === 0) {
      return res.json({
        status: 'success',
        data: {
          count: 0,
          avg: 0,
          min: 0,
          max: 0
        }
      });
    }

    const numValues = values.map(v => parseFloat(v.value) || 0);
    const sum = numValues.reduce((a, b) => a + b, 0);
    const avg = sum / numValues.length;
    const min = Math.min(...numValues);
    const max = Math.max(...numValues);

    res.json({
      status: 'success',
      data: {
        count: values.length,
        avg: Math.round(avg * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100
      }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

export default router;
