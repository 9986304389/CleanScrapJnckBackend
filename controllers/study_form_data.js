
const Utils = require('../helperfun/utils');
const validateUserInput = require('../helperfun/validateUserInput');
const APIRes = require('../helperfun/result');
const { validationResult } = require("express-validator");

exports.study_form_data = async (req, res, next) => {

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors.array();
    }
    const userInput = Utils.getReqValues(req);
    console.log(userInput)
    const requiredFields = ["name", "email", "readinformation"];
    const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
    if (inputs !== true) {
        return APIRes.getNotExistsResult(`Required ${inputs}`, res);
    }


    let name = userInput.name;
    let email = userInput.email;
    let readinformation = userInput.readinformation;

    if (validateEmail(email)) {
        console.log("Email is valid");

    } else {
        console.log("Email is invalid");
        return APIRes.getFinalResponse(false, `Email is invalid`, [], res);
    }


    try {
        // Check if the email already exists
        const result = await pool.query('SELECT * FROM study_form_hdr WHERE email = $1', [email]);

        console.log(result.rows)
        if (result.rows.length > 0) {

            // If email exists, update the existing record with the new data
            const updateResult = await pool.query(
                'UPDATE study_form_hdr SET readinformation = readinformation || $1, modifieddate = $2 WHERE email = $3 RETURNING *',
                [readinformation, new Date(), email]
            );

            return APIRes.getFinalResponse(true, `Data save successfully.`, [], res);
        } else {
            let createddate = new Date();
            let modifieddate = new Date();
            // If email doesn't exist, insert a new record
            const insertResult = await pool.query(
                'INSERT INTO study_form_hdr (name, email, readinformation, createddate, modifieddate) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [name, email, readinformation, createddate, modifieddate]
            );

            return APIRes.getFinalResponse(true, `Data save successfully.`, [], res);
        }
    } catch (error) {
        console.error('Error executing database query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }


}


const validateEmail = (email) => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};