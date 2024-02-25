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

exports.Editproducts = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["product_code"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { product_code, name, description, price, quantity_available, category_id, image_url } = userInput;


        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM products WHERE product_code = $1';
        const existingRecordValues = [product_code];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length > 0) {
            const query = `
            UPDATE products
            SET name = $1, description = $2, price = $3, quantity_available = $4, category_id = $5, image_url = $6, updated_at = NOW()
            WHERE product_code = $7
            RETURNING *`;
            const values = [name, description, price, quantity_available, category_id, image_url, product_code];
            const result = await client.query(query, values);

            if (result) {
                return APIRes.getFinalResponse(true, `Edit Product created successfully.`, [], res);
            }
        } else {
            return APIRes.getFinalResponse(false, `Product not exists`, [], res);
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

exports.getallProducts = async (req, res, next) => {
    let client;
    try {

        client = await getClient();
        const existingRecordQuery = 'SELECT * FROM products';

        const existingRecord = await client.query(existingRecordQuery);

        if (existingRecord.rows.length != 0) {
            return APIRes.getFinalResponse(true, `Successfully received product details.`, existingRecord.rows, res);
        } else {
            return APIRes.getFinalResponse(false, `No Product's`, [], res);
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

//Add the cart products
exports.addProductstoCartByUser = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["customer_id", "product_id", "quantity", "image_url", "price", "product_code"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { customer_id, product_id, quantity, created_at, updated_at, image_url, price, product_code } = userInput;

        created_at = new Date();
        updated_at = new Date();
        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM cart_items WHERE customer_id = $1 and product_code=$2';
        const existingRecordValues = [customer_id, product_code];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length === 0) {
            const query = `
                            INSERT INTO cart_items ( customer_id, product_id, quantity, created_at, updated_at, image_url, price, product_code)
                            VALUES ($1, $2, $3, $4, $5, $6,$7,$8)
                            RETURNING *;
                            `;
            const values = [customer_id, product_id, quantity, created_at, updated_at, image_url, price, product_code];
            const result = await client.query(query, values);

            if (result) {
                return APIRes.getFinalResponse(true, `Product add cart successfully.`, [], res);
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

//get the products on the cart based on the user
exports.getProductsByUser = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["customer_id"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }
        let { customer_id } = userInput;

        client = await getClient();
        const existingRecordQuery = 'SELECT * FROM cart_items WHERE customer_id = $1';
        const existingRecordValues = [customer_id];
        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);
        if (existingRecord.rows.length != 0) {
            return APIRes.getFinalResponse(true, `Successfully received product details.`, existingRecord.rows, res);
        } else {
            return APIRes.getFinalResponse(false, `Cart Product's are empty`, [], res);
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

exports.removeCartProducts = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["customer_id"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }
        let { customer_id, product_code } = userInput;

        client = await getClient();
        const existingRecordQuery = 'SELECT * FROM cart_items WHERE customer_id = $1';
        const existingRecordValues = [customer_id];
        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);
        if (existingRecord.rows.length === 0) {
            return APIRes.getFinalResponse(false, `Cart Products are empty`, [], res);
        } else {
            // Delete records for the given customer_id
            const deleteQuery = 'DELETE FROM cart_items WHERE customer_id = $1 and product_code=$2';
            const existingRecordValues = [customer_id, product_code]
            await client.query(deleteQuery, existingRecordValues);

            return APIRes.getFinalResponse(true, `Successfully deleted cart items for customer ID ${customer_id}`, [], res);
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