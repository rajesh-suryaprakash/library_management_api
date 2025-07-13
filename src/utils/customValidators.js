// src/utils/customValidators.js

/**
 * Validates an ISBN-10 or ISBN-13 number.
 * This function first removes all hyphens and spaces, then checks the length
 * and uses a checksum algorithm to verify its integrity.
 * @param {string} isbn The ISBN string to validate.
 * @returns {boolean} True if the ISBN is valid, false otherwise.
 */
function isValidISBN (isbn) {
  if (!isbn || typeof isbn !== 'string') {
    return false;
  }

  // Remove hyphens and spaces
  const sanitizedIsbn = isbn.replace(/[-\s]/g, '');
  const len = sanitizedIsbn.length;

  if (len === 10) {
    // Validate ISBN-10
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      if (isNaN(sanitizedIsbn[i])) return false;
      sum += parseInt(sanitizedIsbn[i], 10) * (10 - i);
    }
    const lastChar = sanitizedIsbn[9].toUpperCase();
    if (lastChar === 'X') {
      sum += 10;
    } else if (!isNaN(lastChar)) {
      sum += parseInt(lastChar, 10);
    } else {
      return false;
    }
    return sum % 11 === 0;
  } else if (len === 13) {
    // Validate ISBN-13
    if (isNaN(sanitizedIsbn)) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(sanitizedIsbn[i], 10);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const checksum = (10 - (sum % 10)) % 10;
    return checksum === parseInt(sanitizedIsbn[12], 10);
  }

  return false;
}

module.exports = { isValidISBN };
