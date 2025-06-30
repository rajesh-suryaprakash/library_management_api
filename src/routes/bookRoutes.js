// src/routes/bookRoutes.js
const express = require('express');
const bookController = require('../controllers/bookControllers.js');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book inventory management and browsing. All text filters are case-insensitive.
 */

const canRead = [authenticateToken];
const canManage = [authenticateToken, checkRole(['LIBRARIAN', 'ADMIN'])];

/**
 * @swagger
 * /api/v1/books:
 *   get:
 *     summary: Get a list of books with advanced filtering
 *     tags: [Books]
 *     description: |
 *       Retrieves a paginated list of books with support for advanced filtering on both book and author attributes.
 *       Accessible to any authenticated user. All text filters are **case-insensitive**.
 *       ### Filter Syntax
 *       Use the format `filter[fieldName_operator]=value`.
 *       - **Top-level filter (on Book):** `?filter[title_like]=Dune`
 *       - **Nested filter (on Author):** `?filter[author.name_like]=Orwell`
 *       ### Supported Operators
 *       - `_eq`: Exact match (default if no operator is provided).
 *       - `_like`: Partial "contains" match.
 *       - `_startsWith`: "Starts with" match.
 *       - `_gt` / `_lt`: Greater/less than (for numbers like `publicationYear`).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter[title_like]
 *         schema: { type: string }
 *         description: "Example for a partial search on a book's title."
 *       # --- THIS IS THE NEWLY ADDED PARAMETER ---
 *       - in: query
 *         name: filter[title_eq]
 *         schema: { type: string }
 *         description: "Example for an exact search on a book's title."
 *       # --- END OF ADDITION ---
 *       - in: query
 *         name: filter[author.name_like]
 *         schema: { type: string }
 *         description: "Example for a partial search on the author's name."
 *       - in: query
 *         name: filter[publicationYear_gt]
 *         schema: { type: integer }
 *         description: "Example to find books published after a certain year."
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *         description: "Sort by field. Prefix with '-' for descending. Example: `sort=-publicationYear,title`"
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
 *         description: A paginated list of books.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BookWithAuthor'
 *       401:
 *         description: Unauthorized.
 */
router.get('/', canRead, bookController.getAllBooks);

/**
 * @swagger
 * /api/v1/books/{id}:
 *   get:
 *     summary: Get a single book by its ID
 *     tags: [Books]
 *     description: Retrieves details for a single book. Accessible to any authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the book to retrieve.
 *     responses:
 *       200:
 *         description: Detailed information about the book.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookWithAuthor'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Book not found.
 */
router.get('/:id', canRead, bookController.getBookById);

/**
 * @swagger
 * /api/v1/books:
 *   post:
 *     summary: Create a new book (Librarian/Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewBook'
 *     responses:
 *       201:
 *         description: Book created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad Request (e.g., missing fields, invalid authorId).
 *       403:
 *         description: Forbidden, insufficient permissions.
 *       409:
 *         description: Conflict - a book with this ISBN already exists.
 */
router.post('/', canManage, bookController.createBook);

/**
 * @swagger
 * /api/v1/books/{id}:
 *   put:
 *     summary: Update a book (Librarian/Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the book to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBook'
 *     responses:
 *       200:
 *         description: Book updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad Request (e.g., invalid fields).
 *       403:
 *         description: Forbidden, insufficient permissions.
 *       404:
 *         description: Book not found.
 */
router.put('/:id', canManage, bookController.updateBook);

/**
 * @swagger
 * /api/v1/books/{id}:
 *   delete:
 *     summary: Delete a book (Librarian/Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the book to delete.
 *     responses:
 *       204:
 *         description: Book deleted successfully (No Content).
 *       403:
 *         description: Forbidden, insufficient permissions.
 *       404:
 *         description: Book not found.
 */
router.delete('/:id', canManage, bookController.deleteBook);

module.exports = router;
