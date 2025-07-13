// src/utils/queryHelper.js
const { Op } = require('sequelize');
const logger = require('../config/logger');

const parseQuery = (query) => {
  const options = {};
  const topLevelWhere = {};
  const nestedWhere = {};

  if (query.filter && typeof query.filter === 'object') {
    for (const key in query.filter) {
      const value = query.filter[key];
      if (value === null || value === undefined || value === '') continue;

      // Check for nested filters (e.g., author.name_like)
      if (key.includes('.')) {
        const [associationName, nestedKey] = key.split('.');
        if (!nestedWhere[associationName]) {
          nestedWhere[associationName] = {};
        }
        const [field, op = 'eq'] = nestedKey.split('_');

        // Apply operators for nested text filters
        if (op === 'like') {
          nestedWhere[associationName][field] = { [Op.like]: `%${value}%` };
        } else { // default to 'eq'
          nestedWhere[associationName][field] = { [Op.like]: value };
        }
      } else {
        // Handle top-level filters for the main model (e.g., Book)
        const [field, op = 'eq'] = key.split('_');
        // If the field is not a valid operator, default to 'eq'
        // It handles both text and numeric operators correctly.
        switch (op) {
          case 'like':
            topLevelWhere[field] = { [Op.like]: `%${value}%` };
            break;
          case 'eq':
            // For text, this is an exact match (case-insensitive in SQLite)
            // For numbers, this is a standard equals.
            topLevelWhere[field] = { [Op.like]: value };
            break;
          case 'gt':
            // Explicitly convert value to a number for correct comparison
            topLevelWhere[field] = { [Op.gt]: Number(value) };
            break;
          case 'lt':
            // Explicitly convert value to a number for correct comparison
            topLevelWhere[field] = { [Op.lt]: Number(value) };
            break;
          default:
            // Fallback for any other operator
            topLevelWhere[field] = { [Op.eq]: value };
        }
      }
    }
  }

  if (Object.keys(topLevelWhere).length > 0) {
    options.where = topLevelWhere;
  }

  // Sorting Logic
  if (query.sort) {
    options.order = query.sort.split(',').map(item => {
      const direction = item.startsWith('-') ? 'DESC' : 'ASC';
      const field = item.replace('-', '');
      return [field, direction];
    });
  }

  // Pagination Logic
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  options.limit = limit;
  options.offset = (page - 1) * limit;

  logger.debug(`[QueryHelper] Generated: ${JSON.stringify({ options, nestedWhere }, null, 2)}`);

  return { options, page, limit, nestedWhere };
};

module.exports = { parseQuery };
