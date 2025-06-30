// src/controllers/memberController.js
const { Member, Loan, Book, User } = require('../models/associations');
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
    order: [['loanDate', 'DESC']],
  });

  logger.info(`User '${req.user.username}' retrieved loan history for member ID: ${memberId}`);

  if (!loans || loans.length === 0) {
    logger.info(`Member ID: ${memberId} has no active or past loans.`);
    return res.status(200).json({ message: 'This member has no active or past loan history.' });
  }
  res.status(200).json(loans);
});
