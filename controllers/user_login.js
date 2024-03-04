
const Utils = require('../helperfun/utils');
const validateUserInput = require('../helperfun/validateUserInput');
const APIRes = require('../helperfun/result');
const { validationResult } = require("express-validator");
const { getClient } = require("../helperfun/postgresdatabase");
const moment = require('moment-timezone');
exports.usersiginup = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["name", "email", "phonenumber", "password"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { name, email, phonenumber, password,shipping_address,billing_address,created_at} = userInput;

        if (!validateEmail(email) || !validatePhoneNumber(phonenumber)) {
            return APIRes.getFinalResponse(false, `Email or Phone Number is invalid`, [], res);
        }

        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM userdetails WHERE phonenumber = $1';
        const existingRecordValues = [phonenumber];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length === 0) {
            const insertQuery = 'INSERT INTO userdetails(name, email, phonenumber, password,usertype,shipping_address,billing_address,created_at) VALUES ($1, $2, $3, $4,$5,$6,$7,$8) RETURNING *';
            const insertValues = [name, email, phonenumber, password, '0',shipping_address , billing_address,moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS')];
            const result = await client.query(insertQuery, insertValues);

            if (result) {
                return APIRes.getFinalResponse(true, `Profile created successfully.`, [], res);
            }
        } else {
            return APIRes.getFinalResponse(false, `user phone number already exists`, [], res);
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

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhoneNumber = (phoneNumber) => {
    // Regular expression to match a 10-digit numeric phone number
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
};


