// src/middleware/validators.js
const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidationRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long.'),

  body('email')
    .isEmail().withMessage('Please provide a valid login email address.')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),

  body('contactEmail')
    .notEmpty().withMessage('Contact email is required.')
    .isEmail().withMessage('Please provide a valid contact email address.')
    .normalizeEmail(),

  body('mobileNumber')
    .notEmpty().withMessage('Mobile number is required.')
    .isMobilePhone('any', { strictMode: false }).withMessage('Please provide a valid mobile number.'),

  body('address')
    .optional({ checkFalsy: true })
    .trim()
];

const studentRegistrationValidationRules = [
  ...registerValidationRules,
  body('institutionType')
    .notEmpty().withMessage('institutionType is required for student registration.')
    .isIn(['SCHOOL', 'COLLEGE']).withMessage('institutionType must be either SCHOOL or COLLEGE.'),
  body('studentIdCardNumber')
    .notEmpty().withMessage('studentIdCardNumber is required for student registration.'),
  body('institutionAddress')
    .notEmpty().withMessage('institutionAddress is required for student registration.')
];

const borrowBookValidationRules = [
  body('bookId')
    .notEmpty().withMessage('The bookId field is required.')
    .isUUID(4).withMessage('The bookId must be a valid UUID version 4.')
];

const forgotPasswordValidationRules = [
  body('email')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
];

const resetPasswordValidationRules = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
];

const uuidParamValidationRules = (paramName) => [
  param(paramName)
    .isUUID(4).withMessage(`The URL parameter '${paramName}' must be a valid UUID version 4.`)
];

module.exports = {
  registerValidationRules,
  studentRegistrationValidationRules,
  borrowBookValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
  uuidParamValidationRules,
  handleValidationErrors
};
