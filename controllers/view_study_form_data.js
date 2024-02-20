
const Utils = require('../helperfun/utils');
const validateUserInput = require('../helperfun/validateUserInput');
const APIRes = require('../helperfun/result');
const { validationResult } = require("express-validator");

exports.view_study_form_data = async (req, res, next) => {

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors.array();
    }
    const userInput = Utils.getReqValues(req);
    console.log(userInput)
    const requiredFields = ["email"];
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
        if (userInput.email == 'admin@gmail.com') {
            // Check if the email already exists
            const result = await pool.query('SELECT * FROM study_form_hdr');
            console.log(result.rows)
            let data = result.rows;
            return APIRes.getFinalResponse(true, `Get Data successfully.`, data, res);

        } else {
            // Check if the email already exists
            const result = await pool.query('SELECT * FROM study_form_hdr WHERE email = $1', [email]);

            console.log(result.rows);
            let data = result.rows;
            return APIRes.getFinalResponse(true, `Get Data successfully.`, data, res);

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