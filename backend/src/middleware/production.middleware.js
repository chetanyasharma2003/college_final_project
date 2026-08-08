import prisma from '../config/prisma.js';

// Health check for database connectivity
export const healthCheck = async (req, res, next) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.locals.dbHealthy = true;
    next();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    res.locals.dbHealthy = false;
    // Don't block - let it try to recover
    next();
  }
};

// Request timeout middleware
export const requestTimeout = (req, res, next) => {
  // 30 second timeout for all requests
  res.setTimeout(30000, () => {
    res.status(408).json({
      status: 'error',
      message: 'Request timeout - server took too long to respond',
    });
  });
  next();
};

// Error recovery middleware
export const errorRecovery = (err, req, res, next) => {
  console.error('🔴 ERROR:', {
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Gracefully handle different error types
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      status: 'error',
      message: 'Database temporarily unavailable. Retrying...',
      retry: true,
    });
  }

  if (err.code === 'ETIMEDOUT') {
    return res.status(408).json({
      status: 'error',
      message: 'Request timed out. Please try again.',
      retry: true,
    });
  }

  if (err.message.includes('prisma')) {
    return res.status(500).json({
      status: 'error',
      message: 'Database query failed. Data might be cached.',
      fallback: true,
    });
  }

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    trace: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

// Data validation middleware
export const validateResponse = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function(data) {
    // Ensure all responses have consistent structure
    const response = {
      status: data.status || 'success',
      data: data.data || data,
      timestamp: new Date().toISOString(),
      ...data,
    };

    // Remove circular references
    try {
      JSON.stringify(response);
    } catch (err) {
      console.error('⚠️ Response contains circular references');
      response.data = null;
    }

    return originalJson(response);
  };

  next();
};

// Request deduplication - prevent duplicate API calls
const recentRequests = new Map();

export const deduplicateRequests = (req, res, next) => {
  // Only for GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const key = `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
  const cached = recentRequests.get(key);

  if (cached && Date.now() - cached.time < 1000) {
    // Same request within 1 second - return cached response
    return res.json(cached.response);
  }

  const originalJson = res.json.bind(res);

  res.json = function(data) {
    recentRequests.set(key, { response: data, time: Date.now() });

    // Clean old entries every 100 requests
    if (recentRequests.size > 100) {
      const now = Date.now();
      for (const [k, v] of recentRequests.entries()) {
        if (now - v.time > 5000) {
          recentRequests.delete(k);
        }
      }
    }

    return originalJson(data);
  };

  next();
};

// Circuit breaker for database
let dbFailureCount = 0;
let dbCircuitBreakerOpen = false;

export const databaseCircuitBreaker = async (req, res, next) => {
  if (dbCircuitBreakerOpen) {
    return res.status(503).json({
      status: 'error',
      message: 'Database service temporarily unavailable',
      retry_after: '30s',
    });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbFailureCount = 0; // Reset on success
    next();
  } catch (err) {
    dbFailureCount++;

    if (dbFailureCount >= 3) {
      dbCircuitBreakerOpen = true;
      // Reopen after 30 seconds
      setTimeout(() => {
        dbCircuitBreakerOpen = false;
        dbFailureCount = 0;
        console.log('✅ Circuit breaker reset - retrying database connection');
      }, 30000);

      return res.status(503).json({
        status: 'error',
        message: 'Database circuit breaker opened - too many failures',
      });
    }

    next();
  }
};

export default {
  healthCheck,
  requestTimeout,
  errorRecovery,
  validateResponse,
  deduplicateRequests,
  databaseCircuitBreaker,
};
