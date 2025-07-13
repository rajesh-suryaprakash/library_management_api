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

    // --- DYNAMIC LOAN LIMIT LOGIC ---
    // The loan limit is 10 for verified students, otherwise it is 5.
    const loanLimit = (member.isStudent && member.isVerified) ? 10 : 5;

    const activeLoanCount = await Loan.count({
      where: {
        memberId: member.id,
        returnDate: null
      },
      transaction: t
    });

    if (activeLoanCount >= loanLimit) {
      logger.warn(`User '${username}' (Member ID: ${member.id}) attempted to borrow a book but has reached their limit of ${loanLimit}.`);
      await t.rollback();
      return next(new AppError(`You have reached your maximum loan limit of ${loanLimit} books.`, 403));
    }
    // --- END DYNAMIC LOAN LIMIT LOGIC ---

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
      transaction: t
    });

    if (existingLoan) {
      logger.warn(`User '${username}' attempted to borrow book '${book.title}' which they already have on loan.`);
      await t.rollback();
      return next(new AppError('You have already borrowed this book and have not yet returned it.', 409));
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
    const loan = await Loan.findByPk(loanId, {
      include: [
        {
          model: Member,
          // We need to include the User model to get the member's role
          include: [{ model: User, attributes: ['role'] }]
        },
        {
          model: Book
        }
      ],
      transaction: t
    });

    if (!loan) {
      await t.rollback();
      return next(new AppError('Loan record not found', 404));
    }

    if (loan.Member.userId !== userId) {
      // Allow Librarians/Admins to return books on behalf of any user
      if (!['LIBRARIAN', 'ADMIN'].includes(req.user.role)) {
        await t.rollback();
        return next(new AppError('Forbidden: You can only return your own borrowed books.', 403));
      }
    }

    if (loan.returnDate) {
      await t.rollback();
      return next(new AppError('This book has already been returned.', 400));
    }

    const returnDate = new Date();
    loan.returnDate = returnDate;
    let fine = 0;

    // Only calculate a fine if the member is NOT a verified student.
    if (!loan.Member.isStudent || !loan.Member.isVerified) {
      if (returnDate > loan.dueDate) {
        const lateDays = Math.ceil((returnDate - loan.dueDate) / (1000 * 60 * 60 * 24));
        logger.info(`Book return by non-student member is late by ${lateDays} day(s). Calculating fine.`);

        if (lateDays <= 10) {
          fine = lateDays * 50;
        } else if (lateDays <= 20) {
          fine = (10 * 50) + ((lateDays - 10) * 100);
        } else {
          fine = (10 * 50) + (10 * 100) + ((lateDays - 20) * 200);
        }
      }
    } else {
      logger.info(`Verified student '${username}' returned a book. No late fine is applicable.`);
    }

    loan.fineAmount = fine;
    await loan.save({ transaction: t });

    const book = loan.Book; // We already fetched the book
    if (book) {
      book.availableCopies += 1;
      await book.save({ transaction: t });
      logger.info(`Stock for book '${book.title}' incremented.`);
    } else {
      logger.warn(`Could not find associated book (ID: ${loan.bookId}) to increment stock.`);
    }

    await t.commit();

    let message = 'Book returned successfully.';
    if (fine > 0) {
      message += ` A late fine of Rs. ${fine} has been applied.`;
    }

    logger.info(`User '${username}' processed return for loan (ID: ${loanId}). Fine: Rs. ${fine}.`);
    res.status(200).json({ message, loan });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
});

exports.getMyLoans = catchAsync(async (req, res, next) => {
  const { id: userId, username } = req.user;
  const member = await Member.findOne({ where: { userId } });
  if (!member) {
    logger.error(`CRITICAL: User '${username}' has no associated member profile when fetching loans.`);
    return next(new AppError('Member profile not found.', 404));
  }
  const loans = await Loan.findAll({
    where: { memberId: member.id },
    include: [{ model: Book, attributes: ['id', 'title'] }],
    order: [['loanDate', 'DESC']]
  });
  if (loans.length === 0) {
    return res.status(200).json({ message: 'You have no active or past loan history.' });
  }
  res.status(200).json(loans);
});

exports.getAllLoans = catchAsync(async (req, res, next) => {
  const { options, page, limit, nestedWhere } = parseQuery(req.query);

  options.include = [
    {
      model: Book,
      attributes: ['id', 'title'],
      where: nestedWhere.Book || null,
      required: !!(nestedWhere.Book)
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
