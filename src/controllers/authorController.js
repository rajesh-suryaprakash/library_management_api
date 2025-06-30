// src/controllers/authorController.js
const Author = require('../models/Author');
const logger = require('../config/logger');
const { parseQuery } = require('../utils/queryHelper');

exports.createAuthor = async (req, res) => {
  try {
    const author = await Author.create(req.body);
    // Log successful creation
    logger.info(`Author created successfully with ID: ${author.id}`);
    res.status(201).json(author);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      // Log the specific client error
      logger.warn(`Failed to create author. Name already exists: ${req.body.name}`);
      return res.status(409).json({ error: 'An author with this name already exists.' });
    }
    // Log the unexpected server error
    logger.error('Error in createAuthor:', error);
    res.status(400).json({ error: 'An error occurred while creating the author.' });
  }
};

exports.getAllAuthors = async (req, res) => {
  try {
    const { options, page, limit } = parseQuery(req.query);

    // --- NEW DEBUGGING LINE ---
    logger.debug(`[AuthorController] Final options passed to findAll: ${JSON.stringify(options, null, 2)}`);
    // --- END DEBUGGING LINE ---

    const { count, rows } = await Author.findAndCountAll(options);

    const response = {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      authors: rows
    };
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching all authors:', error);
    res.status(500).json({ error: 'An error occurred while fetching authors.' });
  }
};

exports.getAuthorById = async (req, res) => {
  try {
    const { id } = req.params;
    const author = await Author.findByPk(id);
    if (!author) {
      // Log when a requested resource is not found
      logger.warn(`Attempted to find author with non-existent ID: ${id}`);
      return res.status(404).json({ error: 'Author not found' });
    }
    res.status(200).json(author);
  } catch (error) {
    // Log the unexpected server error
    logger.error(`Error fetching author by ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'An error occurred while fetching the author.' });
  }
};

exports.updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Author.update(req.body, { where: { id } });
    if (!updated) {
      // Log when a resource to be updated is not found
      logger.warn(`Attempted to update author with non-existent ID: ${id}`);
      return res.status(404).json({ error: 'Author not found' });
    }
    const updatedAuthor = await Author.findByPk(id);
    // Log successful update
    logger.info(`Author with ID: ${id} was updated successfully.`);
    res.status(200).json(updatedAuthor);
  } catch (error) {
    // Log the unexpected server error
    logger.error(`Error updating author with ID ${req.params.id}:`, error);
    res.status(400).json({ error: 'An error occurred while updating the author.' });
  }
};

exports.deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Author.destroy({ where: { id } });
    if (!deleted) {
      // Log when a resource to be deleted is not found
      logger.warn(`Attempted to delete author with non-existent ID: ${id}`);
      return res.status(404).json({ error: 'Author not found' });
    }
    // Log successful deletion
    logger.info(`Author with ID: ${id} was deleted successfully.`);
    res.status(204).send(); // No Content
  } catch (error) {
    // Log the unexpected server error
    logger.error(`Error deleting author with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'An error occurred while deleting the author.' });
  }
};
