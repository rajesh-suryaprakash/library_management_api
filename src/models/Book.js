// src/models/Book.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Title cannot be an empty string.'
      }
    }
  },
  isbn: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  publicationYear: {
    type: DataTypes.INTEGER,
    validate: {
      isInt: { msg: 'Publication year must be an integer.' },
      min: { args: [1000], msg: 'Publication year seems too old.' },
      max: { args: [new Date().getFullYear()], msg: 'Publication year cannot be in the future.' }
    }
  },
  availableCopies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      isInt: true,
      min: 0
    }
  },
  genre: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'Books',
  timestamps: true
});

module.exports = Book;
