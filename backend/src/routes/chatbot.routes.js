import express from 'express';
import { verifyAuth } from '../middleware/auth.middleware.js';
import ChatbotService from '../services/chatbot.service.js';

const router = express.Router();

// POST - Process query
router.post('/query', verifyAuth, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Query text is required',
      });
    }

    const response = await ChatbotService.processQuery(query);

    res.json({
      status: 'success',
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// GET - Sample queries
router.get('/samples', verifyAuth, async (req, res) => {
  try {
    const samples = ChatbotService.getSampleQueries();

    res.json({
      status: 'success',
      data: samples,
      count: samples.length,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

export default router;
