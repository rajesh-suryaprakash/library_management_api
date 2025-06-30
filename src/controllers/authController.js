// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const logger = require('../config/logger');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// --- User Registration (NOW SIMPLIFIED) ---
exports.register = catchAsync(async (req, res, next) => {
  // The catchAsync wrapper will handle any errors from User.create
  // and pass them directly to our global error handler.
  const { username, email, password } = req.body;
  const user = await User.create({
    username,
    email,
    password,
  });

  logger.info(`User registered successfully: { id: ${user.id}, username: '${user.username}' }`);
  res.status(201).json({
    message: 'User registered successfully!',
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  });
});

// --- User Login (already correct) ---
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  const user = await User.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    logger.warn(`Failed login attempt for email: '${email}'`);
    return next(new AppError('Invalid credentials.', 401));
  }

  const tokenPayload = { id: user.id, username: user.username, role: user.role };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

  logger.info(`User logged in successfully: { id: ${user.id}, username: '${user.username}' }`);
  res.status(200).json({
    message: 'Login successful!',
    token,
  });
});
