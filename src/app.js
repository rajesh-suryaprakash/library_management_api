// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const setupSwaggerDocs = require('./config/swagger.js');
const { generalLimiter, authLimiter } = require('./config/rateLimiter.js');
const logger = require('./config/logger.js');
const handleErrors = require('./utils/errorHandler.js');
const AppError = require('./utils/AppError.js');

// Import all route handlers
const baseRoutes = require('./routes/index.js');
const authRoutes = require('./routes/auth.js');
const userRoutes = require('./routes/userRoutes.js');
const authorRoutes = require('./routes/authorRoutes.js');
const bookRoutes = require('./routes/bookRoutes.js');
const loanRoutes = require('./routes/loanRoutes.js');
const memberRoutes = require('./routes/memberRoutes.js');

const app = express();

// --- Global Middleware ---
app.set('query parser', 'extended');
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: logger.stream }));
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', generalLimiter);

// --- Routes ---
app.use('/', baseRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/authors', authorRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/loans', loanRoutes);
app.use('/api/v1/members', memberRoutes);

// Setup Swagger Documentation
setupSwaggerDocs(app);

// --- THE FIX: Use a more robust catch-all syntax ---
// This middleware runs if no other route has matched.
app.all(/^\/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// --- END OF FIX ---

// --- Global Error Handling Middleware ---
app.use(handleErrors);

module.exports = app;
