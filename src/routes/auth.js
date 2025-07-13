// src/routes/auth.js
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const {
  registerValidationRules,
  studentRegistrationValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
  handleValidationErrors
} = require('../middleware/validators');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login, and password management.
 */

/**
 * @swagger
 * /api/v1/auth/register/member:
 *   post:
 *     summary: Register a new standard member
 *     tags: [Authentication]
 *     description: Creates a standard user account with member privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, contactEmail, mobileNumber]
 *             properties:
 *               username: { type: string, example: 'test_member' }
 *               email: { type: string, format: email, description: 'Login Email', example: 'member@example.com' }
 *               password: { type: string, format: password, description: 'Min 8 characters', example: 'StrongP@ssw0rd!' }
 *               contactEmail: { type: string, format: email, description: 'Contact Email', example: 'contact.member@example.com' }
 *               mobileNumber: { type: string, example: '+12223334444' }
 *               address: { type: string, description: '(Optional) Home address', example: '456 Bookworm Rd' }
 *     responses:
 *       '201': { description: 'Member registered successfully.' }
 *       '400': { description: 'Bad Request - Validation error.' }
 *       '409': { description: 'Conflict - Username or email already exists.' }
 */
router.post(
  '/register/member',
  registerValidationRules,
  handleValidationErrors,
  authController.registerMember
);

/**
 * @swagger
 * /api/v1/auth/register/student:
 *   post:
 *     summary: Register a new student member
 *     tags: [Authentication]
 *     description: Creates a user account and flags it for student status, requiring extra details for verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, contactEmail, mobileNumber, institutionType, studentIdCardNumber, institutionAddress]
 *             properties:
 *               username: { type: string, example: 'test_student' }
 *               email: { type: string, format: email, description: 'Login Email', example: 'student@example.com' }
 *               password: { type: string, format: password, description: 'Min 8 characters', example: 'StrongP@ssw0rd!' }
 *               contactEmail: { type: string, format: email, description: 'Contact Email', example: 'contact.student@example.com' }
 *               mobileNumber: { type: string, example: '+15556667777' }
 *               address: { type: string, description: '(Optional) Home address', example: '789 Scholar Ave' }
 *               institutionType: { type: string, enum: [SCHOOL, COLLEGE], example: 'COLLEGE' }
 *               studentIdCardNumber: { type: string, example: 'STUDENT-12345' }
 *               institutionAddress: { type: string, example: '123 University Ave, Tech City' }
 *     responses:
 *       '201': { description: 'Student registration submitted successfully.' }
 *       '400': { description: 'Bad Request - Validation error.' }
 *       '409': { description: 'Conflict - Username or email already exists.' }
 */
router.post(
  '/register/student',
  studentRegistrationValidationRules,
  handleValidationErrors,
  authController.registerStudent
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in a user to receive a JWT
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
 *       '200':
 *         description: Login successful. Returns the JWT, expiration details, and timestamps.
 *       '401':
 *         description: Invalid credentials.
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset token
 *     tags: [Authentication]
 *     description: |
 *       Initiates the password reset process.
 *       **Security Note:** For security reasons, this endpoint will **always** return a `200 OK` success response, regardless of whether the provided email is registered in the system or not.
 *       In the local development environment, the generated reset token will be printed to the server console.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "member1@library.com"
 *     responses:
 *       '200':
 *         description: A generic confirmation message is always sent to prevent account enumeration.
 *       '400':
 *         description: Bad Request - The provided email format is invalid.
 */
router.post('/forgot-password', forgotPasswordValidationRules, handleValidationErrors, authController.forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password/{token}:
 *   patch:
 *     summary: Reset password using a token
 *     tags: [Authentication]
 *     description: Sets a new password for the user associated with a valid reset token.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The password reset token from the 'forgot-password' step.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The new password. Must be at least 8 characters long.
 *                 example: "newStrongPassword123"
 *     responses:
 *       '200':
 *         description: Password has been reset successfully. Returns a new JWT for immediate login.
 *       '400':
 *         description: Bad Request - The token is invalid/expired or the new password is too short.
 */
router.patch('/reset-password/:token', resetPasswordValidationRules, handleValidationErrors, authController.resetPassword);

module.exports = router;
