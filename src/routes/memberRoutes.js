// src/routes/memberRoutes.js
const express = require('express');
const memberController = require('../controllers/memberController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const { uuidParamValidationRules, handleValidationErrors } = require('../middleware/validators');
const router = express.Router();

/** @swagger tags: { name: 'Members', description: 'Member management and information retrieval.' } */
const canManageMembers = [authenticateToken, checkRole(['LIBRARIAN', 'ADMIN'])];

/**
 * @swagger
 * /api/v1/members/{memberId}/loans:
 *   get:
 *     summary: Get the loan history for a specific member (Librarian/Admin only)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: memberId, required: true, schema: { type: string, format: uuid }}
 *     responses:
 *       '200': { description: "A list of the member's loans." }
 *       '403': { description: 'Forbidden.' }
 *       '404': { description: 'Member not found.' }
 */
router.get('/:memberId/loans', canManageMembers, uuidParamValidationRules('memberId'), handleValidationErrors, memberController.getMemberLoanHistory);

/**
 * @swagger
 * /api/v1/members/me/request-student-status:
 *   patch:
 *     summary: Request student status for the current user
 *     tags: [Members]
 *     description: Allows a logged-in member to flag their account as a student, which must then be verified by an admin or librarian to grant extra borrowing privileges.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: 'Request submitted for verification.' }
 *       '404': { description: 'Member profile not found.' }
 */
router.patch('/me/request-student-status', authenticateToken, memberController.requestStudentStatus);

/**
 * @swagger
 * /api/v1/members/{memberId}/verify-student-status:
 *   patch:
 *     summary: Verify a member's student status (Librarian/Admin only)
 *     tags: [Members]
 *     description: An admin or librarian can approve a member's student status, increasing their loan limit.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: memberId, required: true, schema: { type: string, format: uuid }}
 *     responses:
 *       '200': { description: 'Status verified successfully.' }
 *       '400': { description: 'Member has not requested student status.' }
 *       '403': { description: 'Forbidden.' }
 *       '404': { description: 'Member not found.' }
 */
router.patch('/:memberId/verify-student-status', canManageMembers, uuidParamValidationRules('memberId'), handleValidationErrors, memberController.verifyStudentStatus);

module.exports = router;
