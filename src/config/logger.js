// src/config/logger.js

const winston = require('winston');

// Define the severity levels for logs in order of most to least important.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// This method determines the log level based on the environment.
// In development, we log everything down to 'debug'.
// In production, we'll only log 'info' and above to reduce noise.
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Define custom colors for each log level for better readability in the console.
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};
winston.addColors(colors);

// Define the format for console logging.
// This creates a colorful, timestamped, and easy-to-read format for development.
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define the format for file logging.
// This creates a structured JSON format, which is ideal for log analysis tools.
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Define the different "transports" (destinations) for our logs.
const transports = [
  // 1. Console Transport: For development feedback.
  new winston.transports.Console({ format: consoleFormat }),

  // 2. All Logs File Transport: A file containing every log entry.
  new winston.transports.File({
    filename: 'logs/all.log',
    format: fileFormat
  }),

  // 3. Error Logs File Transport: A dedicated file for only 'error' level logs.
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error', // Only log if info.level is 'error'.
    format: fileFormat
  })
];

// Create the main logger instance with the defined levels, format, and transports.
const logger = winston.createLogger({
  level: level(),
  levels,
  transports
});

// Create a stream object with a 'write' function that can be used by `morgan`.
// This allows Morgan's HTTP request logs to be piped through Winston.
logger.stream = {
  write: (message) => {
    // Morgan adds a newline character that we can strip before logging.
    logger.http(message.substring(0, message.lastIndexOf('\n')));
  }
};

// Export the configured logger so it can be used throughout the application.
module.exports = logger;
