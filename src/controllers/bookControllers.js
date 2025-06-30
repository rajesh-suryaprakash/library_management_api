// src/controllers/bookController.js
const { Book, Author } = require('../models/associations');
const { parseQuery } = require('../utils/queryHelper');
const logger = require('../config/logger');

exports.getAllBooks = async (req, res) => {
  try {
    const { options, page, limit, nestedWhere } = parseQuery(req.query);
    options.include = [{
      model: Author,
      attributes: ['name', 'id'],
      where: nestedWhere.author || null,
      required: !!(nestedWhere.author)
    }];
    options.distinct = true;
    logger.debug(`[BookController] Final options passed to findAndCountAll: ${JSON.stringify(options)}`);
    const { count, rows } = await Book.findAndCountAll(options);
    const response = {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      books: rows
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching all books:', error);
    res.status(500).json({ error: 'An error occurred while fetching books.' });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { authorId } = req.body;
    const author = await Author.findByPk(authorId);
    if (!author) {
      logger.warn(`Attempt to create book with non-existent authorId: ${authorId}`);
      return res.status(400).json({ error: `Author with ID ${authorId} does not exist. Please create the author first.` });
    }

    const book = await Book.create(req.body);
    logger.info(`Book created successfully with ID: ${book.id}`);
    res.status(201).json(book);
  } catch (error) {
    // Handle specific validation errors from the Book model
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message).join(', ');
      logger.warn(`Book creation failed due to validation error: ${messages}`);
      return res.status(400).json({ error: messages });
    }
    // Handle specific unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      logger.warn(`Failed to create book. ISBN already exists: ${req.body.isbn}`);
      return res.status(409).json({ error: 'A book with this ISBN already exists.' });
    }
    // Handle all other errors
    logger.error('Error in createBook:', error);
    res.status(500).json({ error: 'An error occurred while creating the book.' });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id, {
      include: [{ model: Author, attributes: ['name', 'id'] }]
    });
    if (!book) {
      logger.warn(`Attempted to find book with non-existent ID: ${id}`);
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (error) {
    logger.error(`Error fetching book with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'An error occurred while fetching the book.' });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { authorId } = req.body;

    if (authorId) {
      const authorExists = await Author.findByPk(authorId);
      if (!authorExists) {
        logger.warn(`Attempt to update book (ID: ${id}) with non-existent authorId: ${authorId}`);
        return res.status(400).json({ error: `Author with ID ${authorId} does not exist.` });
      }
    }

    const [updated] = await Book.update(req.body, { where: { id } });
    if (!updated) {
      logger.warn(`Attempted to update book with non-existent ID: ${id}`);
      return res.status(404).json({ error: 'Book not found' });
    }

    const updatedBook = await Book.findByPk(id);
    logger.info(`Book with ID: ${id} was updated successfully.`);
    res.status(200).json(updatedBook);
  } catch (error) {
    // Handle specific validation errors from the Book model
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message).join(', ');
      logger.warn(`Book update failed for ID ${req.params.id} due to validation error: ${messages}`);
      return res.status(400).json({ error: messages });
    }
    // Handle specific unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      logger.warn(`Failed to update book. ISBN already exists: ${req.body.isbn}`);
      return res.status(409).json({ error: 'A book with this ISBN already exists.' });
    }
    // Handle all other errors
    logger.error(`Error updating book with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'An error occurred while updating the book.' });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Book.destroy({ where: { id } });
    if (!deleted) {
      logger.warn(`Attempted to delete book with non-existent ID: ${id}`);
      return res.status(404).json({ error: 'Book not found' });
    }
    logger.info(`Book with ID: ${id} was deleted successfully.`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting book with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'An error occurred while deleting the book.' });
  }
};
