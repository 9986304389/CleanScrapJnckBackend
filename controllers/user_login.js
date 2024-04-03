
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


        let { name, email, phonenumber, password, shipping_address, billing_address, created_at } = userInput;

        //Email and phonenumber check     
        if (!validateEmail(email) || !validatePhoneNumber(phonenumber)) {
            return APIRes.getFinalResponse(false, `Email or Phone Number is invalid`, [], res);
        }

        const checkpassword = checkPasswordStrength(password)
        //Password check
        if (checkpassword != true) {
            return APIRes.getFinalResponse(false, checkpassword, [], res);
        }

        client = await getClient();

        //email validation and phonenumber ------
        const existingRecordQuery = 'SELECT * FROM userdetails WHERE phonenumber = $1 or email =$2';
        const existingRecordValues = [phonenumber, email];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length === 0) {
            const insertQuery = 'INSERT INTO userdetails(name, email, phonenumber, password,usertype,shipping_address,billing_address,created_at) VALUES ($1, $2, $3, $4,$5,$6,$7,$8) RETURNING *';
            const insertValues = [name, email, phonenumber, password, '0', shipping_address, billing_address, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS')];
            const result = await client.query(insertQuery, insertValues);

            if (result) {
                return APIRes.getFinalResponse(true, `Profile created successfully.`, [], res);
            }
        } else {
            return APIRes.getFinalResponse(false, `user phone number or email id already exists`, [], res);
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


function checkPasswordStrength(password) {
    const lowercaseRegex = /[a-z]/;
    const uppercaseRegex = /[A-Z]/;
    const numericRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    if (password.length < 8) {
        return "Password must be at least 8 characters long";
    }
    if (!lowercaseRegex.test(password)) {
        return "Password must contain at least one lowercase letter";
    }
    if (!uppercaseRegex.test(password)) {
        return "Password must contain at least one uppercase letter";
    }
    if (!numericRegex.test(password)) {
        return "Password must contain at least one numeric digit";
    }
    if (!specialCharRegex.test(password)) {
        return "Password must contain at least one special character";
    }

    return true;
}

exports.getprofile = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["email", "phonenumber"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }


        let { email, phonenumber } = userInput;

        //Email and phonenumber check     
        if (!validateEmail(email) || !validatePhoneNumber(phonenumber)) {
            return APIRes.getFinalResponse(false, `Email or Phone Number is invalid`, [], res);
        }



        client = await getClient();

        //email validation and phonenumber ------
        const existingRecordQuery = 'SELECT id,name,email,phonenumber,shipping_address,billing_address FROM userdetails WHERE phonenumber = $1 and email =$2';
        const existingRecordValues = [phonenumber, email];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length != 0) {

            return APIRes.getFinalResponse(true, `Get user info successfully`, existingRecord.rows, res);
        }
        else {
            return APIRes.getFinalResponse(false, `user not exists`, [], res);
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
}

exports.editUserProfile = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["phonenumber", "email"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { name, email, phonenumber, password, shipping_address, billing_address, created_at } = userInput;

        if (!validateEmail(email) || !validatePhoneNumber(phonenumber)) {
            return APIRes.getFinalResponse(false, `Email or Phone Number is invalid`, [], res);
        }

        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM userdetails WHERE phonenumber = $1 and email=$2';
        const existingRecordValues = [phonenumber, email];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length != 0) {
            const updateQuery = `
            UPDATE userdetails 
            SET name = $1, 
            email=$2,
            shipping_address = $3, 
            billing_address = $4    
            WHERE email = '${email}' AND phonenumber = '${phonenumber}'
            RETURNING *`;

            const updateValues = [
                name,
                email,
                shipping_address,
                billing_address
            ];

            const result = await client.query(updateQuery, updateValues);

            if (result) {
                return APIRes.getFinalResponse(true, `Edit profile successfully.`, [], res);
            }
        } else {
            return APIRes.getFinalResponse(false, `user not exists`, [], res);
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