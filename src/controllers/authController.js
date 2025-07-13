// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const ms = require('ms');
const { User, Member } = require('../models/associations');
const logger = require('../config/logger');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sequelize = require('../config/database');

const createNewUserAndMember = async (payload, transaction) => {
  const {
    username, email, password, role, isStudent,
    ...memberPayload
  } = payload;

  const user = await User.create({ username, email, password, role }, { transaction });

  // Create the associated Member record
  const member = await Member.create({
    userId: user.id,
    isStudent,
    ...memberPayload
  }, { transaction });

  // Return BOTH the user and the member objects
  return { user, member };
};

exports.registerMember = catchAsync(async (req, res, next) => {
  const result = await sequelize.transaction(async (t) => {
    return createNewUserAndMember({ ...req.body, isStudent: false, role: 'MEMBER' }, t);
  });
  logger.info(`New MEMBER registered: { id: ${result.user.id} }`);
  res.status(201).json({
    message: 'Member registered successfully!',
    user: {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      role: result.user.role,
      memberProfile: {
        contactEmail: result.member.contactEmail,
        mobileNumber: result.member.mobileNumber,
        address: result.member.address
      }
    }
  });
});

exports.registerStudent = catchAsync(async (req, res, next) => {
  const result = await sequelize.transaction(async (t) => {
    return createNewUserAndMember({ ...req.body, isStudent: true, role: 'STUDENT' }, t);
  });
  logger.info(`New STUDENT registered: { id: ${result.user.id} }`);
  res.status(201).json({
    message: 'Student registration submitted successfully. Please await verification.',
    user: {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      role: result.user.role,
      memberProfile: {
        contactEmail: result.member.contactEmail,
        mobileNumber: result.member.mobileNumber,
        address: result.member.address,
        isStudent: result.member.isStudent,
        isVerified: result.member.isVerified,
        institutionType: result.member.institutionType,
        studentIdCardNumber: result.member.studentIdCardNumber,
        institutionAddress: result.member.institutionAddress
      }
    }
  });
});

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

  // 1. Define the expiration string from the environment or use a default.
  const expiresInString = process.env.JWT_EXPIRES_IN || '1h';

  // 2. Calculate timestamps.
  const now = new Date();
  const tokenCreatedAt = now.toISOString();
  // Use the 'ms' library to convert '30m', '1h', etc., into milliseconds.
  const expiresInMilliseconds = ms(expiresInString);
  const tokenExpiresAt = new Date(now.getTime() + expiresInMilliseconds).toISOString();

  // 3. Create the token payload.
  const tokenPayload = { id: user.id, username: user.username, role: user.role };

  // 4. Sign the token using the expiration string.
  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET,
    { expiresIn: expiresInString }
  );

  logger.info(`User logged in successfully: { id: ${user.id}, username: '${user.username}' }`);

  // 5. Send the complete token information in the response.
  res.status(200).json({
    message: 'Login successful!',
    token,
    tokenExpiresIn: expiresInString, // e.g., "30m"
    tokenCreatedAt, // e.g., "2025-06-27T12:00:00.000Z"
    tokenExpiresAt // e.g., "2025-06-27T12:30:00.000Z"
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Define the user-friendly message once.
  const successMessage = 'If an account with that email exists, a password reset token has been generated. Please check your console logs to retrieve it. The token is valid for 10 minutes.';

  // 2. Get user based on POSTed email.
  const user = await User.findOne({ where: { email: req.body.email } });

  // 3. If no user, send the generic success message and return early.
  // This prevents user enumeration attacks.
  if (!user) {
    logger.warn(`Password reset attempt for non-existent email: ${req.body.email}`);
    return res.status(200).json({ message: successMessage });
  }

  // 4. If user exists, generate the random reset token.
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 5. Hash the token and set it in the database with an expiration time.
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // 6. "Send" the token by logging it to the console for our testing environment.
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
  logger.info(`Password reset token for ${user.email}: ${resetToken}`);
  logger.info(`Password reset URL (for testing): ${resetURL}`);

  // 7. Send the same generic success message to the client.
  res.status(200).json({ message: successMessage });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get the un-hashed token from the URL params
  const { token } = req.params;

  // 2) Hash the token from the params to match the one in the DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // 3) Find the user by the HASHED token and check if the token has not expired
  const user = await User.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { [require('sequelize').Op.gt]: Date.now() }
    }
  });

  // 4) If token is not found or is expired, send an error
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  // 5) If token is valid, set the new password
  // The model hook will automatically hash this new password before saving.
  user.password = req.body.password;
  if (!user.password || user.password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long.', 400));
  }
  // 6) Clear the reset token fields so it cannot be used again
  user.passwordResetToken = null;
  user.passwordResetExpires = null;

  await user.save();

  // 7) Log the user in and send JWT
  const loginTokenPayload = { id: user.id, username: user.username, role: user.role };
  const loginToken = jwt.sign(loginTokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30m' });

  logger.info(`Password for user '${user.username}' has been reset successfully.`);
  res.status(200).json({ message: 'Password reset successful!', token: loginToken });
});
