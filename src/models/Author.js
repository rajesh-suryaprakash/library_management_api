// src/models/Author.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Author = sequelize.define('Author', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  biography: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'Authors',
  timestamps: true
});

module.exports = Author;
