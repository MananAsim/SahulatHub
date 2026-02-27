const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for a user
 * @param {Object} payload - The data to encode (e.g., { id, role })
 * @returns {string} signed JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

module.exports = generateToken;
