// src/utils/errorHandler.js
const logger = require('../config/logger');
const AppError = require('./AppError');

const handleValidationErrorDB = (err) => {
  const messages = err.errors.map(el => el.message).join('. ');
  const message = `Invalid input data. ${messages}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // This regex extracts the value from the error message, e.g., "username must be unique"
  const value = err.errors[0].message;
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 409); // 409 Conflict
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401);

const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  logger.error('PROGRAMMING ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
  });
};

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
