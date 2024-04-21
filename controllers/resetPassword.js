
const Utils = require('../helperfun/utils');
const validateUserInput = require('../helperfun/validateUserInput');
const APIRes = require('../helperfun/result');
const { validationResult } = require("express-validator");
const { getClient } = require("../helperfun/postgresdatabase");

exports.reset_password = async (req, res, next) => {
    let client;
    try {
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

        let phonenumber = userInput.phonenumber;

        try {

            client = await getClient();

            // Check if the provided phonenumber exists in the database
            const userResult = await client.query('SELECT * FROM userdetails WHERE phonenumber = $1', [phonenumber]);
            console.log(userResult.rows)
            if (userResult.rows.length === 0) {
                return APIRes.getFinalResponse(false, `User not found'`, [], res);
            }

            const user = userResult.rows[0];

            console.log(user);
            // Generate a new password hash
            const newPasswordHash = userInput.password;

            const checkpassword = checkPasswordStrength(newPasswordHash)
            //Password check
            if (checkpassword != true) {
                return APIRes.getFinalResponse(false, checkpassword, [], res);
            }

            // Update the user's password in the database
            const updateResult = await client.query(
                'UPDATE userdetails SET password = $1 WHERE phonenumber = $2 RETURNING *',
                [newPasswordHash, phonenumber]
            );
            return APIRes.getFinalResponse(true, `Password reset successful.`, [], res);
        }
        catch (err) {
            return APIRes.getFinalResponse(false, `Password reset fail.`, [], res);
        }
    } catch (error) {
        console.error('Error executing database query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        // Close the client connection
        if (client) {
            await client.end();
        }
    }

}


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