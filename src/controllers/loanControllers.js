// src/controllers/loanController.js
const sequelize = require('../config/database');
const { Loan, Book, Member, User } = require('../models/associations');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { parseQuery } = require('../utils/queryHelper');

exports.borrowBook = catchAsync(async (req, res, next) => {
  const { bookId } = req.body;
  const { id: userId, username } = req.user;
  const t = await sequelize.transaction();

  try {
    const member = await Member.findOne({ where: { userId } }, { transaction: t });
    if (!member) {
      logger.error(`CRITICAL: User '${username}' (ID: ${userId}) has no associated member profile.`);
      await t.rollback();
      return next(new AppError('Member profile not found for this user', 404));
    }

    // --- FIX 1: ENFORCE MAXIMUM LOAN LIMIT ---
    const activeLoanCount = await Loan.count({
      where: {
        memberId: member.id,
        returnDate: null,
      },
      transaction: t,
    });

    if (activeLoanCount >= 5) {
      logger.warn(`User '${username}' (Member ID: ${member.id}) attempted to borrow a book but has reached the maximum loan limit of 5.`);
      await t.rollback();
      return next(new AppError('You have reached the maximum limit of 5 borrowed books.', 403));
    }

    const book = await Book.findByPk(bookId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!book) {
      await t.rollback();
      return next(new AppError('Book not found', 404));
    }

    if (book.availableCopies < 1) {
      logger.warn(`User '${username}' failed to borrow book '${book.title}' due to no available copies.`);
      await t.rollback();
      return next(new AppError('No available copies of this book to borrow', 400));
    }

    const existingLoan = await Loan.findOne({
      where: { bookId: book.id, memberId: member.id, returnDate: null },
      transaction: t,
    });

    if (existingLoan) {
      logger.warn(`User '${username}' attempted to borrow book '${book.title}' which they already have on loan.`);
      await t.rollback();
      return next(new AppError('You have already borrowed this book.', 409));
    }

    book.availableCopies -= 1;
    await book.save({ transaction: t });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const loan = await Loan.create({
      bookId: book.id,
      memberId: member.id,
      dueDate
    }, { transaction: t });

    await t.commit();
    logger.info(`User '${username}' successfully borrowed book '${book.title}'. Loan ID: ${loan.id}.`);
    res.status(201).json({ message: 'Book borrowed successfully', loan });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
});

exports.returnBook = catchAsync(async (req, res, next) => {
  const t = await sequelize.transaction();
  const { loanId } = req.params;
  const { id: userId, username } = req.user;

  try {
    const loan = await Loan.findByPk(loanId, { include: [Member], transaction: t });
    if (!loan) {
      await t.rollback();
      return next(new AppError('Loan record not found', 404));
    }

    if (loan.Member.userId !== userId) {
      await t.rollback();
      return next(new AppError('Forbidden: You cannot return a book you did not borrow.', 403));
    }

    if (loan.returnDate) {
      await t.rollback();
      return next(new AppError('This book has already been returned.', 400));
    }

    const returnDate = new Date();
    loan.returnDate = returnDate;
    let fine = 0;

    if (returnDate > loan.dueDate) {
      const lateDays = Math.ceil((returnDate - loan.dueDate) / (1000 * 60 * 60 * 24));
      logger.info(`Book return is late by ${lateDays} day(s). Calculating fine.`);
      
      if (lateDays <= 10) {
        fine = lateDays * 50;
      } else if (lateDays <= 20) {
        fine = (10 * 50) + ((lateDays - 10) * 100);
      } else {
        fine = (10 * 50) + (10 * 100) + ((lateDays - 20) * 200);
      }
    }
    loan.fineAmount = fine;

    await loan.save({ transaction: t });

    const book = await Book.findByPk(loan.bookId, { transaction: t, lock: t.LOCK.UPDATE });
    if (book) {
      book.availableCopies += 1;
      await book.save({ transaction: t });
      logger.info(`Stock for book '${book.title}' incremented.`);
    }

    await t.commit();
    
    let message = 'Book returned successfully.';
    if (fine > 0) {
      message += ` A late fine of Rs. ${fine} has been applied.`;
    }

    logger.info(`User '${username}' successfully returned loan (ID: ${loanId}). Fine: Rs. ${fine}.`);
    res.status(200).json({ message, loan });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
});

exports.getMyLoans = catchAsync(async (req, res, next) => {
  const { id: userId, username } = req.user;
  if (!userId) {
    logger.warn(`User '${username}' attempted to fetch loan history without a valid user ID.`);
    return next(new AppError('User not authenticated.', 401));
  }

  logger.info(`User '${username}' (ID: ${userId}) is fetching their loan history.`);

  const member = await Member.findOne({ where: { userId } });
  if (!member) {
    logger.error(`CRITICAL: User '${username}' (ID: ${userId}) has no associated member profile when fetching their loans.`);
    return next(new AppError('Member profile not found.', 404));
  }

  const loans = await Loan.findAll({
    where: { memberId: member.id },
    include: [{ model: Book, attributes: ['id', 'title'] }],
    order: [['loanDate', 'DESC']], // Order by most recent loan first
  });

  logger.info(`User '${username}' fetched their loan history. Total loans: ${loans.length}.`);

  if (!loans || loans.length === 0) {
    logger.info(`User '${username}' has no active or past loans.`);
    return res.status(200).json({ message: 'You have no active or past loan history.' });
  }

  logger.info(`User '${username}' successfully fetched their loans.`);
  res.status(200).json(loans);
});

exports.getAllLoans = catchAsync(async (req, res, next) => {
  const { options, page, limit, nestedWhere } = parseQuery(req.query);

  options.include = [
    {
      model: Book,
      attributes: ['id', 'title'],
      where: nestedWhere.Book || null,
      required: !!(nestedWhere.Book),
    },
    {
      model: Member,
      include: [{
        model: User,
        attributes: ['id', 'username'],
        where: nestedWhere.User || null,
        required: !!(nestedWhere.User)
      }],
      required: !!(nestedWhere.User)
    }
  ];
  options.distinct = true;

  logger.debug(`[LoanController] Final options passed to findAndCountAll: ${JSON.stringify(options)}`);
  const { count, rows } = await Loan.findAndCountAll(options);

  const response = {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    loans: rows
  };

  res.status(200).json(response);
});
