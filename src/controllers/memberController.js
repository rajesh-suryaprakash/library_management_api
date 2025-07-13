// src/controllers/memberController.js
const { Member, Loan, Book } = require('../models/associations');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// This function will handle fetching the loan history for a specific member.
exports.getMemberLoanHistory = catchAsync(async (req, res, next) => {
  const { memberId } = req.params;

  const member = await Member.findByPk(memberId);

  if (!member) {
    logger.warn(`Privileged user attempted to get loan history for non-existent member ID: ${memberId}`);
    return next(new AppError('No member found with that ID.', 404));
  }

  const loans = await Loan.findAll({
    where: { memberId },
    include: [{ model: Book, attributes: ['id', 'title', 'isbn'] }],
    order: [['loanDate', 'DESC']]
  });

  logger.info(`User '${req.user.username}' retrieved loan history for member ID: ${memberId}`);

  if (!loans || loans.length === 0) {
    logger.info(`Member ID: ${memberId} has no active or past loans.`);
    return res.status(200).json({ message: 'This member has no active or past loan history.' });
  }
  res.status(200).json(loans);
});

exports.requestStudentStatus = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user; // Get the currently logged-in user

  const member = await Member.findOne({ where: { userId } });
  if (!member) {
    return next(new AppError('Member profile not found for your account.', 404));
  }

  member.isStudent = true;
  member.isVerified = false; // Requesting status always resets verification
  await member.save();

  logger.info(`Member (ID: ${member.id}) has requested student status verification.`);
  res.status(200).json({ message: 'Your request for student status has been submitted for verification.' });
});

exports.verifyStudentStatus = catchAsync(async (req, res, next) => {
  const { memberId } = req.params;

  const member = await Member.findByPk(memberId);
  if (!member) {
    return next(new AppError('No member found with that ID.', 404));
  }

  if (!member.isStudent) {
    return next(new AppError('This member has not requested student status.', 400));
  }

  member.isVerified = true;
  await member.save();

  logger.info(`Admin '${req.user.username}' has verified student status for member (ID: ${member.id}).`);
  res.status(200).json({ message: 'Member student status has been successfully verified.' });
});
