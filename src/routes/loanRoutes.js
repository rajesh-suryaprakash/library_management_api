// src/routes/loanRoutes.js
const express = require('express');
const loanController = require('../controllers/loanController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const { borrowBookValidationRules, handleValidationErrors } = require('../middleware/validators');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Loans
 *   description: Managing book loans and returns.
 */

const canManageAllLoans = [authenticateToken, checkRole(['LIBRARIAN', 'ADMIN'])];

/**
 * @swagger
 * /api/v1/loans:
 *   post:
 *     summary: Borrow a book
 *     tags: [Loans]
 *     description: |
 *       Creates a new loan record for the authenticated member.
 *       ### Business Rules:
 *       - A member can have a maximum of **5 active loans** at any given time.
 *       - A member cannot borrow a book they already have an active loan for.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookId]
 *             properties:
 *               bookId:
 *                 type: string
 *                 format: uuid
 *                 example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *     responses:
 *       201:
 *         description: Book borrowed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: 'string' }
 *                 loan: { $ref: '#/components/schemas/Loan' }
 *       400:
 *         description: Bad Request (e.g., missing/invalid bookId, book not available).
 *       403:
 *         description: Forbidden - The member has reached the maximum loan limit of 5 books.
 *       404:
 *         description: Book or Member profile not found.
 *       409:
 *         description: Conflict - This book is already on loan by the member.
 */
router.post(
  '/',
  authenticateToken,
  borrowBookValidationRules,
  handleValidationErrors,
  loanController.borrowBook
);

/**
 * @swagger
 * /api/v1/loans/{loanId}/return:
 *   put:
 *     summary: Return a borrowed book
 *     tags: [Loans]
 *     description: |
 *       Marks a loan as returned and calculates a fine if the return is after the due date.
 *       ### Fine Calculation Logic:
 *       - **Days 1-10 late:** Rs. 50 per day.
 *       - **Days 11-20 late:** Rs. 100 per day for this bracket (total fine will include the first 10 days).
 *       - **Days 21+ late:** Rs. 200 per day for this bracket (total fine will include the previous brackets).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the loan to be returned.
 *     responses:
 *       200:
 *         description: Book returned successfully. The message will indicate if a fine was applied.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: 'string', example: 'Book returned successfully. A late fine of Rs. 700 has been applied.' }
 *                 loan: { $ref: '#/components/schemas/Loan' }
 *       400:
 *         description: Bad Request - The book has already been returned.
 *       403:
 *         description: Forbidden - User did not borrow this book.
 *       404:
 *         description: Loan record not found.
 */
router.put('/:loanId/return', authenticateToken, loanController.returnBook);

/**
 * @swagger
 * /api/v1/loans/my_loan_history:
 *   get:
 *     summary: Get the current user's personal loan history
 *     tags: [Loans]
 *     description: Retrieves a list of all past and active loans for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's loans, or a message if none exist.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Loan'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "You have no active or past loan history."
 *       404:
 *         description: Member profile not found for the user.
 */
router.get('/my_loan_history', authenticateToken, loanController.getMyLoans);

/**
 * @swagger
 * /api/v1/loans:
 *   get:
 *     summary: Get all loans with advanced filtering (Librarian/Admin only)
 *     tags: [Loans]
 *     description: |
 *       Retrieves a paginated list of all loans in the system.
 *       Supports advanced filtering on loan attributes and related models like Book and User.
 *       Requires LIBRARIAN or ADMIN role. All text filters are case-insensitive.
 *       ### Filter Syntax Examples
 *       - **Filter by Book Title:** `?filter[Book.title_like]=Test`
 *       - **Filter by Member's Username:** `?filter[User.username_eq]=member_user1`
 *       - **Filter by returned status:** `?filter[returnDate_eq]=null` (for active loans)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter[Book.title_like]
 *         schema: { type: string }
 *         description: "Filter loans by the title of the borrowed book."
 *       - in: query
 *         name: filter[User.username_eq]
 *         schema: { type: string }
 *         description: "Filter loans by the username of the member."
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *         description: "Sort by field. Example: `sort=-loanDate`"
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: "Page number for pagination."
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: "Number of items per page."
 *     responses:
 *       200:
 *         description: A paginated list of all loans.
 *       403:
 *         description: Forbidden, insufficient permissions.
 */
router.get('/', canManageAllLoans, loanController.getAllLoans);

module.exports = router;
