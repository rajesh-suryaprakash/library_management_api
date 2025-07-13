// src/config/swagger.js

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const logger = require('./logger'); // <-- THE FIX: Import the logger

// Basic Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Library Management System API',
    version: '1.0.0',
    description:
      'This is the API documentation for the Library Management System. ' +
      'It is designed to be a practice backend for API automation testers.\n\n' +
      '**Note:** This API implements rate limiting. ' +
      'General endpoints are limited to 1000 requests per 15 minutes per IP. ' +
      'Authentication endpoints (`/auth/login`, `/auth/register`) are limited to 10 requests per 15 minutes per IP.',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Book: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          isbn: { type: 'string' },
          publicationYear: { type: 'integer' },
          availableCopies: { type: 'integer' },
          genre: { type: 'string' },
          authorId: { type: 'string', format: 'uuid' }
        }
      },
      BookWithAuthor: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          isbn: { type: 'string' },
          publicationYear: { type: 'integer' },
          availableCopies: { type: 'integer' },
          genre: { type: 'string' },
          Author: {
            type: 'object',
            properties: {
              name: { type: 'string' }
            }
          }
        }
      },
      NewBook: {
        type: 'object',
        required: ['title', 'isbn', 'authorId'],
        properties: {
          title: { type: 'string', example: 'The Lord of the Rings' },
          isbn: { type: 'string', example: '978-0618640157' },
          publicationYear: { type: 'integer', example: 1954 },
          availableCopies: { type: 'integer', example: 5 },
          genre: { type: 'string', example: 'Fantasy' },
          authorId: { type: 'string', format: 'uuid', description: 'The UUID of an existing author.' }
        }
      },
      UpdateBook: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'The Lord of the Rings' },
          isbn: { type: 'string', example: '978-0618640157' },
          publicationYear: { type: 'integer', example: 1954 },
          availableCopies: { type: 'integer', example: 3 },
          genre: { type: 'string', example: 'High Fantasy' },
          authorId: { type: 'string', format: 'uuid', description: 'The UUID of an existing author.' }
        }
      },
      Loan: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          loanDate: { type: 'string', format: 'date-time' },
          dueDate: { type: 'string', format: 'date-time' },
          returnDate: { type: 'string', format: 'date-time', nullable: true },
          fineAmount: {
            type: 'integer',
            description: 'The calculated fine for a late return, in Rs.',
            example: 0
          },
          memberId: { type: 'string', format: 'uuid' },
          bookId: { type: 'string', format: 'uuid' }
        }
      },
      Member: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          address: { type: 'string' },
          mobile: { type: 'string' },
          membershipDate: { type: 'string', format: 'date-time' },
          userId: { type: 'string', format: 'uuid' }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Options for swagger-jsdoc
const options = {
  swaggerDefinition,
  // Path to the API docs. This should include all route files.
  apis: ['./src/routes/*.js']
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Function to setup our swagger docs
const setupSwaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info('Swagger API documentation is available at http://localhost:3000/api-docs');
};

module.exports = setupSwaggerDocs;
