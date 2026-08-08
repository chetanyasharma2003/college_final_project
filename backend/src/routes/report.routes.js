import express from 'express';
import { verifyAuth, checkRole } from '../middleware/auth.middleware.js';
import ReportService from '../services/report.service.js';

const router = express.Router();

// GET - List all reports
router.get('/list', verifyAuth, async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: {
        reports: [],
        total: 0,
        message: 'No reports generated yet'
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Detailed report
router.get('/detailed/:schemeId', verifyAuth, async (req, res) => {
  try {
    const { schemeId } = req.params;

    const report = await ReportService.generateExecutiveSummary(
      Number(schemeId),
      null,
      30
    );

    res.json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Executive summary
router.get('/executive-summary/:schemeId', verifyAuth, async (req, res) => {
  try {
    const { schemeId } = req.params;
    const { state_id, days } = req.query;

    const summary = await ReportService.generateExecutiveSummary(
      Number(schemeId),
      state_id ? Number(state_id) : null,
      Number(days) || 30
    );

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

// GET - CSV export
router.get('/csv/:schemeId', verifyAuth, async (req, res) => {
  try {
    const { schemeId } = req.params;
    const { state_id, start_date, end_date } = req.query;

    const report = await ReportService.generateCSV(
      Number(schemeId),
      state_id ? Number(state_id) : null,
      start_date ? new Date(start_date) : null,
      end_date ? new Date(end_date) : null
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${report.filename}"`
    );

    const fs = await import('fs');
    const data = fs.readFileSync(report.filepath, 'utf8');
    res.send(data);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - JSON report
router.get('/json/:schemeId', verifyAuth, async (req, res) => {
  try {
    const { schemeId } = req.params;
    const { state_id, start_date, end_date } = req.query;

    const report = await ReportService.generateJSON(
      Number(schemeId),
      state_id ? Number(state_id) : null,
      start_date ? new Date(start_date) : null,
      end_date ? new Date(end_date) : null
    );

    res.json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// POST - Schedule report
router.post('/schedule', verifyAuth, checkRole(['ADMIN', 'ANALYST']), async (req, res) => {
  try {
    const { scheme_id, report_type, frequency } = req.body;
    const userId = req.userId;

    if (!scheme_id || !report_type) {
      return res.status(400).json({
        status: 'error',
        message: 'scheme_id and report_type are required',
      });
    }

    const report = await ReportService.scheduleReport(
      userId,
      Number(scheme_id),
      report_type,
      frequency || 'monthly'
    );

    res.status(201).json({
      status: 'success',
      data: report,
      message: 'Report scheduled successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Comparative report
router.get('/comparative', verifyAuth, async (req, res) => {
  try {
    const { scheme_ids, state_id } = req.query;

    if (!scheme_ids) {
      return res.status(400).json({
        status: 'error',
        message: 'scheme_ids parameter required',
      });
    }

    const schemeIds = scheme_ids.split(',').map(Number);
    const report = await ReportService.generateComparativeReport(
      schemeIds,
      state_id ? Number(state_id) : null
    );

    res.json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

export default router;
