
const Utils = require('../helperfun/utils');
const validateUserInput = require('../helperfun/validateUserInput');
const APIRes = require('../helperfun/result');
const { validationResult } = require("express-validator");
const { getClient } = require("../helperfun/postgresdatabase");

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

        let { name, email, phonenumber, password } = userInput;

        if (!validateEmail(email) || !validatePhoneNumber(phonenumber)) {
            return APIRes.getFinalResponse(false, `Email or Phone Number is invalid`, [], res);
        }

        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM userdetails WHERE phonenumber = $1';
        const existingRecordValues = [phonenumber];
        console.log(existingRecordQuery)
        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);
        console.log(existingRecord)
        if (existingRecord.rows.length === 0) {
            const insertQuery = 'INSERT INTO userdetails(name, email, phonenumber, password,usertype) VALUES ($1, $2, $3, $4,$5) RETURNING *';
            const insertValues = [name, email, phonenumber, password, '0'];
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


