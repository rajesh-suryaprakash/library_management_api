// src/routes/auth.js

const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const { registerValidationRules, handleValidationErrors } = require('../middleware/validators');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration and login
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Must be at least 8 characters long.
 *                 example: StrongP@ssw0rd!
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad Request - Validation error (e.g., missing fields, invalid email, short password).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Password must be at least 8 characters long."
 *       409:
 *         description: Conflict - Username or email already exists.
 *       500:
 *         description: Internal Server Error.
 */
// Apply the validation middleware chain before the controller
router.post(
  '/register',
  registerValidationRules,
  handleValidationErrors,
  authController.register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@library.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful, returns JWT.
 *       401:
 *         description: Invalid credentials.
 *       500:
 *         description: Internal Server Error.
 */
router.post('/login', authController.login);

module.exports = router;
