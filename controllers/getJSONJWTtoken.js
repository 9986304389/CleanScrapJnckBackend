const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Importing crypto module
const Utils = require('../helperfun/utils');
const validateUserInput = require('../helperfun/validateUserInput');
const APIRes = require('../helperfun/result');
// Generate a random secret key
const secretKey = crypto.randomBytes(32).toString('base64');


exports.token = async (req, res, next) => {

    try {
        const userId = 'guest'; // Example: You might generate a guest user ID
        const username = 'guest';
        // Generate JWT token
        const token = jwt.sign({ id: userId, username: username }, secretKey, { expiresIn: '7d' });

        if (token) {
            return APIRes.getFinalResponse(true, `Get the token successfully.`, { token: token }, res);
        }
    } catch (error) {
        console.error('Error:', error);
        return APIRes.getFinalResponse(false, `Internal Server Error`, [], res);
    }
}