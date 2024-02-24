const Utils = require('../../helperfun/utils');
const validateUserInput = require('../../helperfun/validateUserInput');
const APIRes = require('../../helperfun/result');
const { validationResult } = require("express-validator");
const { getClient } = require("../../helperfun/postgresdatabase");

exports.Addproducts = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["product_code", "name", "description", "price", "quantity_available", "category_id", "image_url"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { product_code, name, description, price, quantity_available, category_id, image_url } = userInput;


        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM products WHERE product_code = $1';
        const existingRecordValues = [product_code];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length === 0) {
            const query = `
                            INSERT INTO products (product_code,name, description, price, quantity_available, category_id, image_url)
                            VALUES ($1, $2, $3, $4, $5, $6,$7)
                            RETURNING *;
                            `;
            const values = [product_code, name, description, price, quantity_available, category_id, image_url];
            const result = await client.query(query, values);

            if (result) {
                return APIRes.getFinalResponse(true, `Product created successfully.`, [], res);
            }
        } else {
            return APIRes.getFinalResponse(false, `Product already exists`, [], res);
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