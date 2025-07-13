// src/controllers/healthController.js
const sequelize = require('../config/database');
const logger = require('../config/logger');
const catchAsync = require('../utils/catchAsync');

exports.getHealthStatus = catchAsync(async (req, res, next) => {
  try {
    // The critical check: verify the database connection is alive.
    await sequelize.authenticate();

    // If successful, return a healthy status.
    res.status(200).json({
      status: 'UP',
      message: 'API is healthy and database connection is active.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // If the database connection fails, the service is unhealthy.
    logger.error('Health check failed - Database connection error:', error);
    res.status(503).json({ // 503 Service Unavailable
      status: 'DOWN',
      message: 'API is running but database connection failed.',
      timestamp: new Date().toISOString()
    });
  }
});
