// src/models/User.js

const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [8, 255], // Must be between 8 and 255 characters
        msg: 'Password must be at least 8 characters long.'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('MEMBER', 'STUDENT', 'LIBRARIAN', 'ADMIN'),
    allowNull: false,
    defaultValue: 'MEMBER'
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Users',
  timestamps: true,
  hooks: {
    // The 'beforeSave' hook runs on both User.create() and user.save().
    beforeSave: async (user, options) => {
      // We only want to hash the password if it has been changed
      // or if it is a new record.
      if (user.changed('password')) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    }
  }
});

module.exports = User;
