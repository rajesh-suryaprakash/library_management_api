// src/middleware/validators.js
const { body, validationResult } = require('express-validator');

// A middleware function to handle validation errors found by express-validator
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Define the validation rules for the user registration endpoint
const registerValidationRules = [
  // username must not be empty
  body('username')
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.'),

  // email must be an email
  body('email')
    .isEmail().withMessage('Please provide a valid email address.'),

  // password must be at least 8 chars long
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
];

const borrowBookValidationRules = [
  // Check that bookId is not empty and is a valid UUID
  body('bookId')
    .notEmpty().withMessage('The bookId field is required.')
    .isUUID(4).withMessage('The bookId must be a valid UUID version 4.'),
];

module.exports = {
  registerValidationRules,
  borrowBookValidationRules,
  handleValidationErrors
};
