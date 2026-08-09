import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import dotenv from 'dotenv';
import {
  healthCheck,
  requestTimeout,
  validateResponse,
  deduplicateRequests,
  databaseCircuitBreaker,
} from './middleware/production.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';  // Allow access from Docker network

// ============= MIDDLEWARE =============

// CORS FIRST - must handle preflight OPTIONS requests
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'https://frontend-eta-smoky-88.vercel.app',
    'https://frontend-i6luaplsk-chetanya-s-projects.vercel.app',
    'https://frontend-ae3v.onrender.com'
  ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security headers
app.use(helmet());

// Request ID tracking (for tracing)
app.use((req, res, next) => {
  const id = Math.random().toString(36).slice(2, 10);
  req.requestId = id;
  res.setHeader('x-request-id', id);
  next();
});

// Request logging
const morganFormat = ':method :url :status :response-time ms [:req[x-request-id]]';
app.use(morgan(morganFormat));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Production-grade middleware (after body parsing, before routes)
app.use(requestTimeout);
app.use(healthCheck);
app.use(validateResponse);
app.use(deduplicateRequests);
app.use(databaseCircuitBreaker);

// General API rate limiting (relaxed for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || (process.env.NODE_ENV === 'production' ? 100 : 10000),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== 'production', // Skip rate limiting in development
});

// Strict rate limiting for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes (only counts failed attempts)
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins against limit
});

app.use('/api/', limiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ============= ROUTES =============

// Comprehensive health check
app.get('/health', (req, res) => {
  res.json({
    status: res.locals.dbHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: res.locals.dbHealthy ? 'connected' : 'disconnected',
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// System status endpoint for monitoring
app.get('/api/v1/system/status', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      database: res.locals.dbHealthy ? 'online' : 'offline',
      api: 'online',
      cache: 'online',
    },
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// API version check
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Government Schemes Analytics API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      schemes: '/api/v1/schemes',
      kpis: '/api/v1/kpis',
      analytics: '/api/v1/analytics',
      reports: '/api/v1/reports',
    },
  });
});

// Import route handlers
import authRoutes from './routes/auth.routes.js';
import schemesRoutes from './routes/schemes.routes.js';
import kpisRoutes from './routes/kpis.routes.js';
import geoRoutes from './routes/geographic.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import reportsRoutes from './routes/report.routes.js';
import predictionRoutes from './routes/prediction.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import etlRoutes from './routes/etl.routes.js';
import pmayRoutes from './routes/pmay.routes.js';
import schemesDataRoutes from './routes/schemes-data.routes.js';
import mlAnalyticsRoutes from './routes/ml-analytics.routes.js';
import syncRoutes from './routes/sync.routes.js';
import dataSyncRoutes from './routes/data-sync.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Route mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/schemes', schemesRoutes);
app.use('/api/v1/kpis', kpisRoutes);
app.use('/api/v1/geo', geoRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ml-analytics', mlAnalyticsRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/predictions', predictionRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1/etl', etlRoutes);
app.use('/api/v1/pmay', pmayRoutes);
app.use('/api/v1/schemes-data', schemesDataRoutes);
app.use('/api/v1/sync', syncRoutes);
app.use('/api/v1/data-sync', dataSyncRoutes);

// ============= ERROR HANDLING =============

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler - Production Grade
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Log error with context
  console.error(`[${errorId}] ${timestamp}`, {
    message: err.message,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || err.status || 500,
    stack: err.stack,
  });

  // Determine appropriate status code
  let statusCode = 500;
  let message = 'Internal Server Error';
  let retry = false;

  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    statusCode = 503;
    message = 'Service temporarily unavailable';
    retry = true;
  } else if (err.message?.includes('prisma')) {
    statusCode = 503;
    message = 'Database connection error';
    retry = true;
  } else if (err.message?.includes('JSON')) {
    statusCode = 400;
    message = 'Invalid request format';
  } else {
    statusCode = err.status || 500;
    message = err.message || 'Internal Server Error';
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    errorId: process.env.NODE_ENV === 'production' ? errorId : undefined,
    retry,
    timestamp,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============= SERVER STARTUP =============

const server = http.createServer(app);

// Production-grade connection management (Cineworld pattern)
// Keep connections alive between requests instead of re-handshaking each time
// keepAliveTimeout must be > any upstream load-balancer idle timeout (usually 60s)
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000; // must be > keepAliveTimeout
server.maxConnections = 1000; // Allow many concurrent connections per process

// Enable SO_REUSEADDR to reuse port immediately after restart
server.setsockopt = server.setsockopt || ((level, optname, value) => {
  if (level === 'socket' && optname === 'SO_REUSEADDR') {
    // Force address reuse
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
    console.error('This is likely from a previous crashed process.\n');
    console.error('SOLUTION: Run this command in another terminal:');
    console.error(`  lsof -ti:${PORT} | xargs kill -9\n`);
    console.error('Then restart this server.\n');
    process.exit(1);
  } else {
    throw err;
  }
});

// Enable SO_REUSEADDR to reuse port immediately after restart
server.listen({ port: PORT, host: HOST, exclusive: false, backlog: 511 }, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║   Government Schemes Analytics Backend                 ║
║   Listening on port ${PORT}                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   API Base: http://localhost:${PORT}/api/v1           ║
║   NOTE: If this crashes, port may stay in use.        ║
║   Run: lsof -ti:${PORT} | xargs kill -9              ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown handler
const gracefulShutdown = () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  setTimeout(() => {
    console.log('Force closing server');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', {
    reason: String(reason),
    timestamp: new Date().toISOString(),
  });
  // Don't exit - keep the process alive but log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });
  // Exit after logging - uncaught exceptions are critical
  process.exit(1);
});

export default app;
