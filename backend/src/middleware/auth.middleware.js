import jwt from 'jsonwebtoken';
import AuthService from '../services/auth.service.js';
import prisma from '../config/prisma.js';

// Extract token from header
export const extractToken = (req) => {
  const bearerToken = req.headers.authorization;
  if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
    return null;
  }
  return bearerToken.slice(7);
};

// Verify JWT middleware
export const verifyAuth = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided. Please login first.',
      });
    }

    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
    }

    // Attach user ID to request
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed',
    });
  }
};

// Check user role
export const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const token = extractToken(req);
      if (!token) {
        return res.status(401).json({
          status: 'error',
          message: 'No token provided',
        });
      }

      const decoded = AuthService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token',
        });
      }

      // Get user from database to check role
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found',
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Insufficient permissions for this action',
        });
      }

      req.userId = user.id;
      req.userRole = user.role;
      req.stateAccess = user.state_access;
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Role verification failed',
      });
    }
  };
};

// Optional: Refresh token before expiry
export const refreshTokenIfNeeded = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    const decoded = jwt.decode(token);
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;

    // If less than 5 minutes until expiry, suggest refresh
    if (timeUntilExpiry < 300) {
      res.setHeader('X-Token-Expiring-Soon', 'true');
    }

    next();
  } catch (error) {
    next();
  }
};
