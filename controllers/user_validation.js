
const Utils = require('../helperfun/utils');
const validateUserInput = require('../helperfun/validateUserInput');
const APIRes = require('../helperfun/result');
const { validationResult } = require("express-validator");
const { getClient } = require("../helperfun/postgresdatabase");
const jwt = require('jsonwebtoken');
const { secretKey } = require('../helperfun/jwtconfig');
const otpGenerator = require('otp-generator');
const moment = require('moment');
const axios = require('axios');

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
        console.log('Expiration Time:', expirationTime);

        expirationTime = expirationTime;
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
        const sendSMS = await SendSMSToUser(otp, expirationTime, phonenumber);
        console.log(sendSMS)
        if (sendSMS) {
            // Passwords match, authentication successful
            return APIRes.getFinalResponse(true, 'Get OTP successfully', [], res);
        }
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
    const expirationTime = moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS');

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

        console.log(expirationTime)
        // Check if the provided OTP matches the generated OTP
        if (otp === result.rows[0].otp) {
            // Check if the OTP is still valid
            const currentTime = moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS');

            if (moment(expirationTime).isAfter(currentTime)) {
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
        //console.error('Error:', error);
        return APIRes.getFinalResponse(false, `Internal Server Error`, [], res);
    } finally {
        // Close the client connection
        if (client) {
            await client.end();
        }
    }
};


const SendSMSToUser = async (otp, expirationTime, phonenumber) => {
    const apiUrl = 'https://bulksmsapi.vispl.in/';
    const username = 'NaviaTrn1';
    const password = 'NaviaTrn1@123';
    const messageType = 'text';
    const mobile = phonenumber;
    const senderId = 'TRADES';
    const ContentID = '1707168751856183385';
    const EntityID = '1701158079989448514';
    //  const message = `${otp} this OTP to login your cleanscrapjunk account.it will expir in 1 min DO NOT share this code with anyone`;
    const message = 'Dear Customer, To download the Handytrader app , click on the below link Google Play store- {#var#} Apple store - {#var#} By Tradeplus Team';
    const params = {
        username,
        password,
        messageType,
        mobile,
        senderId,
        ContentID,
        EntityID,
        message: message
    };

    try {
        const response = await axios.get(apiUrl, { params });
        console.log('SMS sent successfully:', response.data);
        return true;
    } catch (error) {
        console.error('Error sending SMS:', error);
        return false;
    }
}
