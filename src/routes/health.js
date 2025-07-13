// src/routes/health.js
const express = require('express');
const healthController = require('../controllers/healthController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: System Health
 *   description: Monitoring and system status endpoints.
 */

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Check API health status
 *     tags: [System Health]
 *     description: Returns the health status of the API and verifies the database connection. This endpoint is public and does not require authentication.
 *     responses:
 *       200:
 *         description: API is healthy and database connection is active.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: 'UP' }
 *                 message: { type: string }
 *                 timestamp: { type: string, format: 'date-time' }
 *       503:
 *         description: Service Unavailable - API is running but cannot connect to the database.
 */
router.get('/', healthController.getHealthStatus);

module.exports = router;
