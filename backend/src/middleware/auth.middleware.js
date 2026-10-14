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
export const verifyAuth = async (req, res, next) => {
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, state_access: true, is_active: true },
    });
    if (!user || !user.is_active) {
      return res.status(401).json({ status: 'error', message: 'User account is unavailable' });
    }

    req.userId = decoded.userId;
    req.userRole = user.role;
    req.stateAccess = user.state_access;
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
      let userRole = req.userRole;
      if (!userRole) {
        const token = extractToken(req);
        const decoded = token && AuthService.verifyToken(token);
        const user = decoded ? await prisma.user.findUnique({ where: { id: decoded.userId } }) : null;
        if (!user || !user.is_active) {
          return res.status(401).json({ status: 'error', message: 'User not found or inactive' });
        }
        req.userId = user.id;
        req.stateAccess = user.state_access;
        userRole = user.role;
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          status: 'error',
          message: 'Insufficient permissions for this action',
        });
      }

      req.userRole = userRole;
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
