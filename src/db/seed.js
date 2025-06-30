// src/db/seed.js

// Make sure env vars are loaded for database connection, resolving the path correctly.
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { faker } = require('@faker-js/faker');
const sequelize = require('../config/database');
const logger = require('../config/logger');

// Import the setup function and models from our central associations file
const { setupAssociations, User, Author, Book, Member } = require('../models/associations');

// --- Configuration ---
const NUM_AUTHORS = 100;
const NUM_BOOKS = 500;
const GENRES = ['Fantasy', 'Sci-Fi', 'Dystopian', 'Mystery', 'Thriller', 'Romance', 'Historical Fiction', 'Biography'];

const seedDatabase = async () => {
  let t; // Define transaction variable in a higher scope
  try {
    logger.info('--- Starting Database Seed ---');
    t = await sequelize.transaction();

    // Setup associations before syncing the database.
    setupAssociations();

    // Resetting tables. `force: true` will drop and recreate them with the correct schema.
    await sequelize.sync({ force: true, transaction: t });
    logger.info('Database synchronized: All tables dropped and recreated.');

    // --- 1. Seed Users and Members ---
    const users = [
      { username: 'admin_user', email: 'admin@library.com', password: 'Password123!', role: 'ADMIN' },
      { username: 'librarian_user', email: 'librarian@library.com', password: 'Password123!', role: 'LIBRARIAN' },
      { username: 'member_user1', email: 'member1@library.com', password: 'Password123!', role: 'MEMBER' },
      { username: 'member_user2', email: 'member2@library.com', password: 'Password123!', role: 'MEMBER' },
      { username: 'member_user3', email: 'member3@library.com', password: 'Password123!', role: 'MEMBER' },
      { username: 'member_user4', email: 'member4@library.com', password: 'Password123!', role: 'MEMBER' },
      { username: 'member_user5', email: 'member5@library.com', password: 'Password123!', role: 'MEMBER' }
    ];
    logger.info(`Seeding ${users.length} test users and their member profiles...`);
    for (const userData of users) {
      const user = await User.create(userData, { transaction: t });
      await Member.create({ userId: user.id, address: faker.location.streetAddress(true), mobile: faker.phone.number() }, { transaction: t });
    }
    logger.info('Finished seeding test users and members.');

    // --- 2. Generate and Bulk-Insert Authors ---
    logger.info(`Generating ${NUM_AUTHORS} authors...`);
    const authorsData = [];
    for (let i = 0; i < NUM_AUTHORS; i++) {
      authorsData.push({
        name: faker.person.fullName(),
        biography: faker.lorem.paragraph()
      });
    }
    const createdAuthors = await Author.bulkCreate(authorsData, { transaction: t, returning: true });
    logger.info(`Successfully inserted ${createdAuthors.length} authors.`);

    // --- 3. Generate and Bulk-Insert Books ---
    logger.info(`Generating ${NUM_BOOKS} books...`);
    const booksData = [];
    for (let i = 0; i < NUM_BOOKS; i++) {
      const randomAuthor = createdAuthors[Math.floor(Math.random() * createdAuthors.length)];
      booksData.push({
        title: faker.commerce.productName(),
        isbn: faker.commerce.isbn(),
        publicationYear: faker.number.int({ min: 1800, max: new Date().getFullYear() }),
        availableCopies: faker.number.int({ min: 0, max: 20 }),
        genre: GENRES[Math.floor(Math.random() * GENRES.length)],
        authorId: randomAuthor.id
      });
    }
    const createdBooks = await Book.bulkCreate(booksData, { transaction: t });
    logger.info(`Successfully inserted ${createdBooks.length} books.`);

    // --- Commit Transaction ---
    await t.commit();
    logger.info('--- Database Seeding Completed Successfully! ---');
  } catch (error) {
    // Check if a transaction was started before trying to roll back.
    if (t) await t.rollback();
    logger.error('--- Database Seeding Failed ---');
    // Log the full error object for detailed debugging.
    logger.error(error);
    process.exit(1);
  } finally {
    // --- Close the database connection ---
    // This is important for standalone scripts to ensure they terminate properly.
    await sequelize.close();
    logger.info('Database connection closed.');
  }
};

// Execute the seeding function.
seedDatabase();
