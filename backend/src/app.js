const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');

const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');

const app = express();

// Routes
const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const customerRoutes = require('./routes/customerRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const usageRoutes = require('./routes/usageRoutes');
const walletRoutes = require('./routes/walletRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// 1. Security Hardening Middlewares
app.use(helmet()); // Secure HTTP Headers
app.use(mongoSanitize()); // Prevent NoSQL Query Injection

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. Per-API-Key / IP Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

const apiKeyUsageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000, // 1,000 events / minute
  message: { success: false, message: 'Rate limit exceeded for usage ingestion.' }
});

// Swagger API Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 3. Container Observability & Health Probes
app.get('/health/liveness', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'p17-backend' });
});

app.get('/health/readiness', (req, res) => {
  const dbState = mongoose.connection.readyState;
  if (dbState === 1) { // 1 = Connected
    return res.status(200).json({ status: 'READY', database: 'connected' });
  }
  return res.status(503).json({ status: 'NOT_READY', database: 'disconnected' });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'P17 Metering Backend API is healthy and operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/usage', apiKeyUsageLimiter, usageRoutes);
app.use('/api/v1/wallets', walletRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server!`,
    errorCode: 'NOT_FOUND'
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, errorCode: err.errorCode });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    errorCode: err.errorCode || 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
