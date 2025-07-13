// src/routes/authorRoutes.js
const express = require('express');
const authorController = require('../controllers/authorController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authors
 *   description: Author management. All endpoints require LIBRARIAN or ADMIN role. All text filters are case-insensitive.
 */

const canManageAuthors = [authenticateToken, checkRole(['LIBRARIAN', 'ADMIN'])];

/**
 * @swagger
 * /api/v1/authors:
 *   get:
 *     summary: Get a list of authors with advanced filtering (Librarian/Admin only)
 *     tags: [Authors]
 *     description: |
 *       Retrieves a paginated list of authors. All text filters are **case-insensitive**.
 *       Requires LIBRARIAN or ADMIN role.
 *       ### Filter Syntax
 *       Use the format `filter[fieldName_operator]=value`. Default is `_eq`.
 *       - **`_eq`**: Exact match (e.g., `?filter[name_eq]=George Orwell`)
 *       - **`_like`**: Partial "contains" match (e.g., `?filter[language_like]=eng`)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter[name_like]
 *         schema: { type: string }
 *         description: "Example for a partial search on an author's name."
 *       - in: query
 *         name: filter[language_eq]
 *         schema: { type: string }
 *         description: "Example for an exact search on an author's language."
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *         description: "Sort results by field. Prefix with '-' for descending. Example: `sort=-name`"
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
 *         description: A paginated list of authors.
 *       403:
 *         description: Forbidden, insufficient permissions.
 */
router.get('/', canManageAuthors, authorController.getAllAuthors);

/**
 * @swagger
 * /api/v1/authors/{id}:
 *   get:
 *     summary: Get a single author by ID (Librarian/Admin only)
 *     tags: [Authors]
 *     description: Retrieves details for a single author. Requires LIBRARIAN or ADMIN role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the author to retrieve.
 *     responses:
 *       200:
 *         description: Author details, including the new language field.
 *       403:
 *         description: Forbidden, insufficient permissions.
 *       404:
 *         description: Author not found.
 */
router.get('/:id', canManageAuthors, authorController.getAuthorById);

/**
 * @swagger
 * /api/v1/authors:
 *   post:
 *     summary: Create a new author (Librarian/Admin only)
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - language
 *             properties:
 *               name:
 *                 type: string
 *                 example: "J.R.R. Tolkien"
 *               biography:
 *                 type: string
 *                 example: "English writer, poet, philologist, and academic."
 *               language:
 *                 type: string
 *                 example: "English"
 *     responses:
 *       201:
 *         description: Author created successfully.
 *       400:
 *         description: Bad Request (e.g., missing name or language).
 *       403:
 *         description: Forbidden, insufficient permissions.
 *       409:
 *         description: Conflict - an author with this name already exists.
 */
router.post('/', canManageAuthors, authorController.createAuthor);

/**
 * @swagger
 * /api/v1/authors/{id}:
 *   put:
 *     summary: Update an author (Librarian/Admin only)
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the author to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               biography:
 *                 type: string
 *               language:
 *                 type: string
 *                 example: "English"
 *     responses:
 *       200:
 *         description: Author updated successfully.
 *       403:
 *         description: Forbidden, insufficient permissions.
 *       404:
 *         description: Author not found.
 */
router.put('/:id', canManageAuthors, authorController.updateAuthor);

/**
 * @swagger
 * /api/v1/authors/{id}:
 *   delete:
 *     summary: Delete an author (Librarian/Admin only)
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the author to delete.
 *     responses:
 *       204:
 *         description: Author deleted successfully (No Content).
 *       403:
 *         description: Forbidden, insufficient permissions.
 *       404:
 *         description: Author not found.
 */
router.delete('/:id', canManageAuthors, authorController.deleteAuthor);

module.exports = router;
