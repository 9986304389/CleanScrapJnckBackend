// config.js

const crypto = require('crypto');

// Generate a random secret key for JWT signing
const secretKey = crypto.randomBytes(32).toString('base64');

module.exports = {
  secretKey
};
