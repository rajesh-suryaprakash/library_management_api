// src/config/database.js

const { Sequelize } = require('sequelize');

// Create a new Sequelize instance.
// The first argument is not used by SQLite, so it can be null.
// The configuration object specifies the 'dialect' as 'sqlite'
// and the 'storage' path to our database file.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './library-dev.sqlite', // This will create a file named library-dev.sqlite
  logging: console.log // Log SQL queries to the console. Great for development!
});

// Export the sequelize instance for use in other parts of the application.
// This instance can be used to define models and interact with the database.
// Note: Ensure that the 'sqlite3' package is installed in your project.
// To install the sqlite3 package, run: npm install sqlite3
module.exports = sequelize;
