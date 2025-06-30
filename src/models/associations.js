// src/models/associations.js

// Import all the models
const User = require('./User');
const Author = require('./Author');
const Book = require('./Book');
const Member = require('./Member');
const Loan = require('./Loan');
const logger = require('../config/logger');

function setupAssociations () {
  // Define all model relationships here

  // Author <-> Book (One-to-Many)
  // If an author is deleted, their books are also deleted.
  Author.hasMany(Book, { foreignKey: 'authorId', onDelete: 'CASCADE' });
  Book.belongsTo(Author, { foreignKey: 'authorId' });

  // User <-> Member (One-to-One)
  // If a user is deleted, their member profile is also deleted.
  User.hasOne(Member, { foreignKey: 'userId', onDelete: 'CASCADE' });
  Member.belongsTo(User, { foreignKey: 'userId' });

  // Member <-> Loan (One-to-Many)
  // If a member is deleted, don't delete the historical loan record, just unlink it.
  Member.hasMany(Loan, { foreignKey: 'memberId', onDelete: 'SET NULL' });
  Loan.belongsTo(Member, { foreignKey: 'memberId' });

  // Book <-> Loan (One-to-Many)
  // If a book is deleted, don't delete the historical loan record, just unlink it.
  Book.hasMany(Loan, { foreignKey: 'bookId', onDelete: 'SET NULL' });
  Loan.belongsTo(Book, { foreignKey: 'bookId' });

  logger.info('Model associations have been successfully set up.');
}

// Export the setup function and all models for easy access elsewhere
module.exports = {
  setupAssociations,
  User,
  Author,
  Book,
  Member,
  Loan
};
