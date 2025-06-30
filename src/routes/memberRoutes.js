// src/routes/memberRoutes.js
const express = require('express');
const memberController = require('../controllers/memberController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Member management and information retrieval (Privileged Access).
 */

// Define the middleware for privileged access (Librarian or Admin).
const canManageMembers = [authenticateToken, checkRole(['LIBRARIAN', 'ADMIN'])];

/**
 * @swagger
 * /api/v1/members/{memberId}/loans:
 *   get:
 *     summary: Get the loan history for a specific member (Librarian/Admin only)
 *     tags: [Members]
 *     description: Retrieves the complete loan history (past and active) for a single member by their ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique ID of the member.
 *     responses:
 *       200:
 *         description: A list of the member's loans. Returns an empty array if the member has no loans.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Loan'
 *       403:
 *         description: Forbidden, insufficient permissions.
 *       404:
 *         description: Member not found.
 */
router.get('/:memberId/loans', canManageMembers, memberController.getMemberLoanHistory);

module.exports = router;
