// src/utils/errorHandler.js
const logger = require('../config/logger');
const AppError = require('./AppError');

// Handles JWT errors, such as invalid or expired tokens
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401);

// Handles Sequelize's specific unique constraint error (e.g., duplicate email)
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.fields)[0];
  const message = `An account with that ${field} already exists. Please use another value.`;
  return new AppError(message, 409); // 409 Conflict
};

// Handles Sequelize's specific validation errors (e.g., password too short, invalid ISBN)
const handleValidationErrorDB = (err) => {
  const messages = err.errors.map(el => el.message).join('. ');
  const message = `Invalid input data: ${messages}`;
  return new AppError(message, 400);
};

// Sends detailed errors during development for easy debugging
const sendErrorDev = (err, res) => {
  logger.error('DEV ERROR 💥', { name: err.name, message: err.message, stack: err.stack });
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Sends generic, safe errors in production to avoid leaking details
const sendErrorProd = (err, res) => {
  // A) For operational, trusted errors that we created: send the message to the client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  // B) For programming or other unknown errors: don't leak details
  // 1) Log the error for developers
  logger.error('PRODUCTION ERROR 💥', err);
  // 2) Send a generic message to the client
  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!'
  });
};

// The main error handling middleware that processes all errors
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // In dev, we still want to see the processed error for clarity
    let error = { ...err, message: err.message, errors: err.errors };
    if (error.name === 'SequelizeValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'SequelizeUniqueConstraintError') error = handleDuplicateFieldsDB(error);
    // You can add more error handlers here if needed
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message, errors: err.errors };
    if (error.name === 'SequelizeValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'SequelizeUniqueConstraintError') error = handleDuplicateFieldsDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
