
const Utils = require('../helperfun/utils');
const validateUserInput = require('../helperfun/validateUserInput');
const APIRes = require('../helperfun/result');
const { validationResult } = require("express-validator");

exports.reset_password = async (req, res, next) => {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }
        const userInput = Utils.getReqValues(req);

        const requiredFields = ["password", "email"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let email = userInput.email;

        try {
            // Check if the provided email exists in the database
            const userResult = await pool.query('SELECT * FROM user_login_hdr WHERE email = $1', [email]);
            console.log(userResult.rows)
            if (userResult.rows.length === 0) {
                return APIRes.getFinalResponse(false, `User not found'`, [], res);
            }

            const user = userResult.rows[0];

            console.log(user);
            // Generate a new password hash
            const newPasswordHash = userInput.password;

            // Update the user's password in the database
            const updateResult = await pool.query(
                'UPDATE user_login_hdr SET password = $1 WHERE email = $2 RETURNING *',
                [newPasswordHash, email]
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

}
