
const Utils = require('../helperfun/utils');
const validateUserInput = require('../helperfun/validateUserInput');
const APIRes = require('../helperfun/result');
const { validationResult } = require("express-validator");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { getClient } = require("../helperfun/postgresdatabase");
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Importing crypto module
const {secretKey} = require('../helperfun/jwtconfig');

exports.authenticateUser = async (req, res, next) => {
    let client;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors.array();
    }
    const userInput = Utils.getReqValues(req);
    const requiredFields = ["phonenumber", "password"];
    const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
    if (inputs !== true) {
        return APIRes.getNotExistsResult(`Required ${inputs}`, res);
    }
    const { phonenumber, password } = userInput;
    client = await getClient();
    // try {
    //     const result = await client.query(
    //         `SELECT * FROM userdetails WHERE phonenumber = '${phonenumber}' and password='${password}'`,
    //     );

    //     console.log(result.rows)
    //     if (result.rows.length === 0) {
    //         // User not found
    //         return APIRes.getFinalResponse(false, 'Invalid username or password', [], res);
    //     }

    //     const result_password = result.rows[0].password;
    //     const name = result.rows[0].name;
    //     const phoneNumber = result.rows[0].phonenumber;
    //     const email = result.rows[0].email;


    //     // Compare the entered password with the password from the database
    //     if (password === result_password && phoneNumber == phoneNumber) {
    //         // Set expiration time to 7 days (604,800 seconds)
    //         const token = jwt.sign({ id: phonenumber, username: password }, secretKey, { expiresIn: '7d' });
    //         // Passwords match, authentication successful
    //         return APIRes.getFinalResponse(true, 'Authentication successful', [{ name: name, phonenumber: phoneNumber, email: email, token: token }], res);
    //     } else {
    //         // Passwords don't match
    //         return APIRes.getFinalResponse(false, 'Invalid email or password', [], res);
    //     }
    // } catch (error) {
    //     // Handle database query errors
    //     console.error(error);
    //     return APIRes.getFinalResponse(false, 'Internal server error', [], res);
    // }
    // finally {
    //     // Close the client connection
    //     if (client) {
    //         await client.end();
    //     }
    // }
};

// exports.get_all_users_profiles = async (req, res, next) => {
//     let client;
//     let errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         throw errors.array();
//     }

//     client = await getClient();
//     try {
//         const result = await client.query(
//             `SELECT  empcode, name, username, email, phonenumber FROM user_details_hdr`,
//         );

//         if (result.rows.length === 0) {
//             // User not found
//             return APIRes.getFinalResponse(false, 'Invalid employee', [], res);
//         }

//         return APIRes.getFinalResponse(true, 'get employees successful', [result.rows], res);

//     } catch (error) {
//         // Handle database query errors
//         console.error(error);
//         return APIRes.getFinalResponse(false, 'Internal server error', [], res);
//     }
//     finally {
//         // Close the client connection
//         if (client) {
//             await client.end();
//         }
//     }
// };



