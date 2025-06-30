// src/index.js
// IMPORTANT: This must be the very first line to catch synchronous errors on startup.
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

const app = require('./app');
const sequelize = require('./config/database');
const logger = require('./config/logger');
const { setupAssociations } = require('./models/associations');

const PORT = process.env.PORT || 3000;
let server;

const startServer = async () => {
  try {
    logger.info('Connecting to database...');
    await sequelize.authenticate();
    logger.info('Database connection established.');

    setupAssociations();
    await sequelize.sync();
    logger.info('Models synchronized.');

    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections (e.g., failed DB connection outside of startup)
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  // Gracefully close the server before exiting
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
