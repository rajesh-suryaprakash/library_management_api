// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const setupSwaggerDocs = require('./config/swagger');
const { generalLimiter, authLimiter } = require('./config/rateLimiter');
const logger = require('./config/logger');
const handleErrors = require('./utils/errorHandler');
const AppError = require('./utils/AppError');

// Import all route handlers
const baseRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const authorRoutes = require('./routes/authorRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const memberRoutes = require('./routes/memberRoutes');
const healthRoutes = require('./routes/health');

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
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/authors', authorRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/loans', loanRoutes);
app.use('/api/v1/members', memberRoutes);

// Setup Swagger Documentation
setupSwaggerDocs(app);

app.use((req, res, next) => {
  // Pass a new AppError to our global error handler.
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// --- Global Error Handling Middleware ---
app.use(handleErrors);

module.exports = app;
