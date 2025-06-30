// src/utils/catchAsync.js

// This function takes another function (an async route handler) as an argument.
const catchAsync = (fn) => {
    // It returns a new anonymous function that Express will execute.
    return (req, res, next) => {
      // We execute the original function (fn) and chain a .catch() to it.
      // If the async function rejects a promise (throws an error),
      // the .catch() block will pass the error to Express's global error handler via next(err).
      fn(req, res, next).catch(next);
    };
  };
  
  module.exports = catchAsync;
  