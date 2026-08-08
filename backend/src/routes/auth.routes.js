import express from 'express';
import AuthService from '../services/auth.service.js';
import { verifyAuth, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password, and full name are required',
      });
    }

    // Email format validation
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format',
      });
    }

    // Password strength validation
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be 8+ chars with uppercase, lowercase, number, and special char (@$!%*?&)',
      });
    }

    const result = await AuthService.register(email, password, fullName);
    // Fix enumeration vulnerability - use generic message for all failures
    const statusCode = result.status === 'success' ? 201 : 400;
    if (result.status !== 'success') {
      return res.status(statusCode).json({
        status: 'error',
        message: 'Registration failed. Please try again or contact support.',
      });
    }

    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Registration failed. Please try again or contact support.',
    });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required',
      });
    }

    // Email format validation
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format',
      });
    }

    const result = await AuthService.login(email, password);
    const statusCode = result.status === 'success' ? 200 : 401;

    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
    });
  }
});

// POST /api/v1/auth/refresh-token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token required',
      });
    }

    const result = await AuthService.refreshToken(refreshToken);
    const statusCode = result.status === 'success' ? 200 : 401;

    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Token refresh failed',
    });
  }
});

// GET /api/v1/auth/me - Get current user (Protected)
router.get('/me', verifyAuth, async (req, res) => {
  try {
    const result = await AuthService.getCurrentUser(req.userId);
    const statusCode = result.status === 'success' ? 200 : 404;

    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
    });
  }
});

// POST /api/v1/auth/logout - Logout (Protected)
router.post('/logout', verifyAuth, async (req, res) => {
  try {
    const result = await AuthService.logout(req.userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Logout failed',
    });
  }
});

export default router;
