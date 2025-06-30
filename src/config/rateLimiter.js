// src/config/rateLimiter.js

const rateLimit = require('express-rate-limit');

// General rate limiter for most API routes
// This allows 100 requests from the same IP in a 15-minute window
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per `windowMs`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Stricter rate limiter for sensitive authentication routes
// This allows only 10 requests from the same IP in a 15-minute window
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 login/register attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
});

// 4. Error Logs File Transport: A dedicated file for only 'error' level logs.
module.exports = {
  generalLimiter,
  authLimiter
};
