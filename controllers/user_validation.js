
const Utils = require('../helperfun/utils');
const validateUserInput = require('../helperfun/validateUserInput');
const APIRes = require('../helperfun/result');
const { validationResult } = require("express-validator");
const { getClient } = require("../helperfun/postgresdatabase");
const jwt = require('jsonwebtoken');
const { secretKey } = require('../helperfun/jwtconfig');
const otpGenerator = require('otp-generator');
const moment = require('moment');


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
    try {
        const result = await client.query(
            `SELECT * FROM userdetails WHERE phonenumber = '${phonenumber}' and password='${password}'`,
        );

        console.log(result.rows)
        if (result.rows.length === 0) {
            // User not found
            return APIRes.getFinalResponse(false, 'Invalid username or password', [], res);
        }

        const result_password = result.rows[0].password;
        const name = result.rows[0].name;
        const phoneNumber = result.rows[0].phonenumber;
        const email = result.rows[0].email;


        // Compare the entered password with the password from the database
        if (password === result_password && phoneNumber == phoneNumber) {
            // Set expiration time to 7 days (604,800 seconds)
            const token = jwt.sign({ id: phonenumber, username: password }, secretKey, { expiresIn: '7d' });

            // Passwords match, authentication successful
            return APIRes.getFinalResponse(true, 'Authentication successful', [{ name: name, phonenumber: phoneNumber, email: email, token: token }], res);
        } else {
            // Passwords don't match
            return APIRes.getFinalResponse(false, 'Invalid email or password', [], res);
        }
    } catch (error) {
        // Handle database query errors
        console.error(error);
        return APIRes.getFinalResponse(false, 'Internal server error', [], res);
    }
    finally {
        // Close the client connection
        if (client) {
            await client.end();
        }
    }
};

exports.otpGeneate = async (req, res, next) => {
    let client;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors.array();
    }
    const userInput = Utils.getReqValues(req);
    const requiredFields = ["phonenumber"];
    const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
    if (inputs !== true) {
        return APIRes.getNotExistsResult(`Required ${inputs}`, res);
    }
    const { phonenumber } = userInput;
    client = await getClient();
    try {
        let { otp, expirationTime } = await generateOTPWithExpiration();
        console.log('OTP:', otp);
        console.log('Expiration Time:', expirationTime.format('YYYY-MM-DD HH:mm:ss'));

        expirationTime = expirationTime.format('YYYY-MM-DD HH:mm:ss');
        const existingRecordQuery = 'SELECT * FROM userdetails WHERE phonenumber = $1';
        const existingRecordValues = [phonenumber];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length > 0) {
            const query = `
            UPDATE userdetails
            SET otp = $1,expirationTime=$2
            WHERE phonenumber = $3
            RETURNING *`;
            const values = [otp, expirationTime, phonenumber];
            const result = await client.query(query, values);
        }

        // Passwords match, authentication successful
        return APIRes.getFinalResponse(true, 'Authentication successful', [{ OTP: otp, expirationTime: expirationTime }], res);

    } catch (error) {
        // Handle database query errors
        console.error(error);
        return APIRes.getFinalResponse(false, 'Internal server error', [], res);
    }

};

const generateOTPWithExpiration = async () => {
    // Generate a random number between 100000 and 999999
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate expiration time
    const expirationTime = moment().add(1, 'minutes');

    return { otp, expirationTime };
}

exports.verifyOTP = async (req, res, next,) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["otp", "phonenumber"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { otp, phonenumber } = userInput;
        client = await getClient();
        const result = await client.query(
            `SELECT * FROM userdetails WHERE phonenumber = '${phonenumber}'`,
        );

        if (result.rows.length === 0) {
            // User not found
            return APIRes.getFinalResponse(false, 'Invalid user', [], res);
        }
        let expirationTime = result.rows[0].expirationtime;

        // Check if the provided OTP matches the generated OTP
        if (otp === result.rows[0].otp) {
            // Check if the OTP is still valid
            if (moment().isBefore(expirationTime)) {
                console.log('OTP is valid.');
                return APIRes.getFinalResponse(true, `OTP is valid.`, [], res);

            } else {
                console.log('OTP has expired.');
                return APIRes.getFinalResponse(true, `OTP has expired.`, [], res);

            }
        } else {
            return APIRes.getFinalResponse(true, `Invalid OTP.`, [], res);
        }

    } catch (error) {
        console.error('Error:', error);
        return APIRes.getFinalResponse(false, `Internal Server Error`, [], res);
    } finally {
        // Close the client connection
        if (client) {
            await client.end();
        }
    }
};



