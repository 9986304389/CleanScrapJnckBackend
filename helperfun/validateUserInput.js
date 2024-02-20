module.exports = {

    validateUserInput: function (userInput, requiredFields) {

        for (const field of requiredFields) {

            if (!userInput[field]) {
                return field;
            }
        }

        // All required fields are present
        return true;

    }
}


