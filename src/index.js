// src/index.js

// This MUST be the absolute first line to ensure all `process.env` variables
// are available to the rest of the application upon import.
require('dotenv').config();

// This listener will catch any synchronous error that occurs during startup
// or at any other time, preventing a silent crash.
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1); // For sync errors, immediate exit is necessary.
});

// Import other modules AFTER setting up error handling and dotenv.
const app = require('./app');
const sequelize = require('./config/database');
const logger = require('./config/logger');
const { setupAssociations } = require('./models/associations');

const PORT = process.env.PORT || 3000;

// Declare the server variable here so it's accessible by the shutdown handlers.
let server;

const startServer = async () => {
  try {
    logger.info('Connecting to database...');
    await sequelize.authenticate();
    logger.info('Database connection established.');

    setupAssociations();
    await sequelize.sync();
    logger.info('Models synchronized.');

    // Assign the running server instance to our variable.
    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// This listener catches any failed promise that doesn't have a .catch() block.
// It's a critical safety net for async operations.
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  // For async errors, we can perform a graceful shutdown.
  if (server) {
    // Stop accepting new connections, finish ongoing requests, then exit.
    server.close(() => {
      process.exit(1);
    });
  } else {
    // If the server never even started, just exit.
    process.exit(1);
  }
});
