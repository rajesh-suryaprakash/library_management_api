// src/models/Member.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // userId will be added by the association
  address: {
    type: DataTypes.STRING
  },
  mobile: {
    type: DataTypes.STRING
  },
  membershipDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Members',
  timestamps: true
});

module.exports = Member;
