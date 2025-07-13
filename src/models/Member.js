// src/models/Member.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true // Address is optional
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Please provide a valid contact email address.'
      }
    }
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  membershipDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isStudent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  institutionType: {
    type: DataTypes.ENUM('SCHOOL', 'COLLEGE'),
    allowNull: true
  },
  studentIdCardNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  institutionAddress: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Members',
  timestamps: true
});

module.exports = Member;
