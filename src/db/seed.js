// src/db/seed.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const sequelize = require('../config/database');
const logger = require('../config/logger');
const { User, Author, Book, Member, setupAssociations } = require('../models/associations');

const authorsData = require('./authors.json');
const booksData = require('./books.json');

const seedDatabase = async () => {
  let t;
  try {
    logger.info('--- Starting Database Seed ---');
    t = await sequelize.transaction();

    setupAssociations();
    await sequelize.sync({ force: true, transaction: t });
    logger.info('Database synchronized: All tables dropped and recreated.');

    const users = [
      { username: 'admin_user', email: 'admin@library.com', password: 'Password123!', role: 'ADMIN' },
      { username: 'librarian_user', email: 'librarian@library.com', password: 'Password123!', role: 'LIBRARIAN' },
      { username: 'member_user1', email: 'member1@library.com', password: 'Password123!', role: 'MEMBER' },
      { username: 'member_user2', email: 'member2@library.com', password: 'Password123!', role: 'MEMBER' },
      { username: 'member_user3', email: 'member3@library.com', password: 'Password123!', role: 'MEMBER' },
      { username: 'member_user4', email: 'member4@library.com', password: 'Password123!', role: 'MEMBER' },
      { username: 'member_user5', email: 'member5@library.com', password: 'Password123!', role: 'MEMBER' },
      { username: 'verified_student1', email: 'verified_student1@library.com', password: 'Password123!', role: 'STUDENT' },
      { username: 'verified_student2', email: 'verified_student2@library.com', password: 'Password123!', role: 'STUDENT' },
      { username: 'verified_student3', email: 'verified_student3@library.com', password: 'Password123!', role: 'STUDENT' },
      { username: 'verified_student4', email: 'verified_student4@library.com', password: 'Password123!', role: 'STUDENT' },
      { username: 'verified_student5', email: 'verified_student5@library.com', password: 'Password123!', role: 'STUDENT' },
      { username: 'unverified_student1', email: 'unverified_student1@library.com', password: 'Password123!', role: 'STUDENT' },
      { username: 'unverified_student2', email: 'unverified_student2@library.com', password: 'Password123!', role: 'STUDENT' },
      { username: 'unverified_student3', email: 'unverified_student3@library.com', password: 'Password123!', role: 'STUDENT' },
      { username: 'unverified_student4', email: 'unverified_student4@library.com', password: 'Password123!', role: 'STUDENT' },
      { username: 'unverified_student5', email: 'unverified_student5@library.com', password: 'Password123!', role: 'STUDENT' }
    ];
    logger.info(`Seeding ${users.length} default users...`);

    for (const userData of users) {
      const user = await User.create(userData, { transaction: t });

      // Define the base member data, including the new required fields.
      let memberData = {
        userId: user.id,
        contactEmail: userData.email, // Use the login email as the contact email for simplicity
        mobileNumber: '9876543210',
        address: '123 Library Lane'
      };

      // Add student-specific data
      if (userData.username === 'student_verified') {
        memberData = { ...memberData, isStudent: true, isVerified: true };
      }
      if (userData.username === 'student_unverified') {
        memberData = { ...memberData, isStudent: true, isVerified: false };
      }

      await Member.create(memberData, { transaction: t });
    }
    logger.info('Finished seeding default users and members.');

    // De-duplicate and insert authors
    const uniqueAuthorNames = new Set();
    const uniqueAuthorsData = authorsData.filter(author => {
      if (!author.name || uniqueAuthorNames.has(author.name)) {
        logger.warn(`Found duplicate or invalid author name: '${author.name || 'N/A'}'. Skipping.`);
        return false;
      }
      uniqueAuthorNames.add(author.name);
      return true;
    });
    logger.info(`Inserting ${uniqueAuthorsData.length} unique authors...`);
    const createdAuthors = await Author.bulkCreate(uniqueAuthorsData, { transaction: t, returning: true });

    const authorNameToIdMap = new Map();
    createdAuthors.forEach(author => authorNameToIdMap.set(author.name, author.id));

    const uniqueIsbns = new Set();
    const booksToCreate = booksData
      .filter(book => {
        if (!book.isbn || uniqueIsbns.has(book.isbn)) {
          logger.warn(`Found duplicate or missing ISBN: '${book.isbn}'. Skipping book: '${book.title}'.`);
          return false;
        }
        if (!authorNameToIdMap.has(book.authorName)) {
          logger.warn(`Orphan book found: '${book.title}' by '${book.authorName}'. Skipping.`);
          return false;
        }
        uniqueIsbns.add(book.isbn);
        return true;
      })
      .map(book => ({
        title: book.title,
        isbn: book.isbn,
        publicationYear: book.publicationYear,
        availableCopies: book.availableCopies,
        genre: book.genre,
        authorId: authorNameToIdMap.get(book.authorName)
      }));

    logger.info(`Inserting ${booksToCreate.length} valid books...`);
    await Book.bulkCreate(booksToCreate, { transaction: t });
    logger.info('Successfully inserted books.');

    await t.commit();
    logger.info('--- Database Seeding Completed Successfully! ---');
  } catch (error) {
    if (t) await t.rollback();
    logger.error('--- Database Seeding Failed ---');
    console.dir(error, { depth: null });
    process.exit(1);
  } finally {
    await sequelize.close();
    logger.info('Database connection closed.');
  }
};

seedDatabase();
