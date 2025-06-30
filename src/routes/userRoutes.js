// src/routes/userRoutes.js

const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile
 */

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get the profile of the currently logged-in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: No token provided
 *       403:
 *         description: Invalid token
 */
// This route is protected. The authenticateToken middleware runs before the controller.
router.get('/me', authenticateToken, userController.getProfile);

// --- ADDED/VERIFIED SWAGGER DOCS BELOW ---

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: List all users (Librarian/Admin)
 *     tags: [Users]
 *     description: Retrieves a list of all users. Requires 'LIBRARIAN' or 'ADMIN' role.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   role:
 *                     type: string
 *                     enum: [MEMBER, LIBRARIAN, ADMIN]
 *       403:
 *         description: Forbidden, insufficient permissions.
 */
router.get('/', authenticateToken, checkRole(['LIBRARIAN', 'ADMIN']), userController.listUsers);

/**
 * @swagger
 * /api/v1/users/{userId}/role:
 *   put:
 *     summary: Change a user's role (Admin only)
 *     tags: [Users]
 *     description: Updates the role of a specific user. Requires 'ADMIN' role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The UUID of the user to update.
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 description: The new role for the user.
 *                 enum: [MEMBER, LIBRARIAN, ADMIN]
 *     responses:
 *       200:
 *         description: User role updated successfully.
 *       400:
 *         description: Invalid role specified.
 *       403:
 *         description: Forbidden, insufficient permissions.
 *       404:
 *         description: User not found.
 */
router.put('/:userId/role', authenticateToken, checkRole(['ADMIN']), userController.changeUserRole);

module.exports = router;
