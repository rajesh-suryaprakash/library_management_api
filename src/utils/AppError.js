// src/utils/AppError.js

class AppError extends Error {
  constructor (message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // Determine status based on statusCode (e.g., 4xx = 'fail', 5xx = 'error')
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // We use this flag to identify errors that we created intentionally.
    this.isOperational = true;

    // Capture the stack trace, excluding the constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
