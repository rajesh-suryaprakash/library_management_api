// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// This middleware checks if the user is authenticated and has the required role.
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    logger.warn(`Authentication failed for ${req.method} ${req.originalUrl}: No token provided.`);
    return res.status(401).json({ error: 'No token provided. Access denied.' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Log the specific reason for token invalidity.
      if (err.name === 'TokenExpiredError') {
        logger.warn(`Authentication failed for ${req.method} ${req.originalUrl}: Token expired.`);
      } else {
        logger.warn(`Authentication failed for ${req.method} ${req.originalUrl}: Token is not valid.`, { error: err.message });
      }
      return res.status(403).json({ error: 'Token is not valid or has expired. Access denied.' });
    }

    // Log successful authentication at the debug level to avoid cluttering production logs
    // unless you have a specific security requirement to log all successful authentications.
    logger.debug(`User authenticated successfully: { id: ${user.id}, username: '${user.username}' } for request to ${req.method} ${req.originalUrl}`);

    // Attach the user payload to the request object
    req.user = user;
    next();
  });
};

const checkRole = (roles) => {
  return (req, res, next) => {
    const user = req.user;

    // This should ideally never be hit if authenticateToken runs first, but it's good defensive coding.
    if (!user || !user.role) {
      logger.error(`CRITICAL: checkRole middleware was hit without a user or role attached to the request for ${req.method} ${req.originalUrl}.`);
      return res.status(403).json({ error: 'Forbidden: No role specified.' });
    }

    // Check if the user's role is included in the list of allowed roles
    if (!roles.includes(user.role)) {
      // This is a key security log. It shows who tried to access something they shouldn't.
      logger.warn(`FORBIDDEN: User '${user.username}' (ID: ${user.id}) with role '${user.role}' attempted to access protected route ${req.method} ${req.originalUrl} which requires roles: [${roles.join(', ')}].`);
      return res.status(403).json({ error: 'Forbidden: You do not have the required permissions.' });
    }

    // If the role is authorized, proceed.
    next();
  };
};

module.exports = { authenticateToken, checkRole };
