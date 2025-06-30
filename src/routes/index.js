// src/routes/index.js

const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: API health and status
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message for the API
 *     tags: [System]
 *     description: Returns a welcome message to confirm the API is running.
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome to the Library API!"
 */
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Library API!' });
});

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Check API health status
 *     tags: [System]
 *     description: Returns the health status of the API.
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 */

module.exports = router;
