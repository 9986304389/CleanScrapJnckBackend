const Utils = require('../../helperfun/utils');
const validateUserInput = require('../../helperfun/validateUserInput');
const APIRes = require('../../helperfun/result');
const { validationResult } = require("express-validator");
const { getClient } = require("../../helperfun/postgresdatabase");
const sharp = require('sharp');
const path = require('path');
const moment = require('moment-timezone');
const template = require('../emailTemplate/emailtemplate');
const nodemailer = require('nodemailer');

exports.Addproducts = async (req, res, next) => {
    let client;

    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["product_code", "name", "description", "price", "quantity_available", "category_id", "type", "typeofproduct"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { product_code, name, description, price, quantity_available, category_id, image_url, type, typeofproduct } = userInput;

        //image_url = `${process.env.DOMAIN + image_url}`;

        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM products WHERE product_code = $1';
        const existingRecordValues = [product_code];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length === 0) {
            const query = `
                            INSERT INTO products (product_code,name,description, price, quantity_available, category_id, image_url,created_at,type,typeofproduct)
                            VALUES ($1, $2, $3, $4, $5, $6,$7,$8,$9,$10)
                            RETURNING *;
                            `;
            const values = [product_code, name, description, price, quantity_available, category_id, image_url, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), type, typeofproduct];
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
        const requiredFields = ["product_code", "product_id"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { product_id, product_code, name, description, price, quantity_available, category_id, image_url, product_status, type } = userInput;


        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM products WHERE product_code = $1';
        const existingRecordValues = [product_code];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length > 0) {
            const query = `
            UPDATE products
            SET name = $1, description = $2, price = $3, updated_at = $4
            WHERE product_id = '${product_id}'
            RETURNING *`;

            const values = [name, description, price, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS')];
            const result = await client.query(query, values);

            if (result) {
                return APIRes.getFinalResponse(true, `Edit Product successfully.`, [], res);
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
        const userInput = Utils.getReqValues(req);
        const { product_code, Active_Status, type } = userInput;
        client = await getClient();
        let query = `SELECT * FROM products WHERE 1=1`

        if (product_code) {
            query = query + ` and product_code = '${product_code}'`; // Ensure proper spacing and quoting for the condition
        }
        if (Active_Status) {
            query = query + ` and product_status = '${Active_Status}'`
        }
        if (type) {
            query = query + ` and type = '${type}'`
        }

        const existingRecord = await client.query(query);

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
        const requiredFields = ["customer_id", "product_id", "quantity", "image_url", "price", "product_code", "name"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { customer_id, product_id, quantity, created_at, updated_at, image_url, price, product_code, name } = userInput;

        created_at = moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS');
        updated_at = moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS');
        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM cart_items WHERE customer_id = $1 and product_code=$2';
        const existingRecordValues = [customer_id, product_code];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length === 0) {
            const query = `
                            INSERT INTO cart_items ( customer_id, product_id, quantity, created_at, updated_at, image_url, price, product_code,name)
                            VALUES ($1, $2, $3, $4, $5, $6,$7,$8,$9)
                            RETURNING *;
                            `;
            const values = [customer_id, product_id, quantity, created_at, updated_at, image_url, price, product_code, name];
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

//Add the cart products
exports.editCartProducts = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["customer_id", "product_code"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { customer_id, product_id, quantity, created_at, updated_at, image_url, price, product_code } = userInput;


        updated_at = moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS');
        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM cart_items WHERE customer_id = $1 and product_code=$2';
        const existingRecordValues = [customer_id, product_code];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length != 0) {
            const query = `
            UPDATE cart_items
            SET quantity=$2,updated_at=$3
            WHERE customer_id = $1 and product_code=$4
            RETURNING *;`
            const values = [customer_id, quantity, updated_at, product_code];
            const result = await client.query(query, values);

            if (result) {
                return APIRes.getFinalResponse(true, ` Product edit cart successfully.`, [], res);
            }
        } else {
            return APIRes.getFinalResponse(false, ` Invalid Product`, [], res);
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

exports.AddressAddAndEdit = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["name", "customer_id", "address_line1", "address_line2", "city", "state", "postal_code"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { address_id, customer_id, address_line1, address_line2, city, state, postal_code, country, name } = userInput;

        client = await getClient();

        if (address_id) {

            // If address_id is not provided, it's an add operation
            const checkAddressQuery = `
               SELECT * FROM addresses
               WHERE customer_id = $1
               AND address_id = $2;
           `;

            const checkAddressValues = [customer_id, address_id];
            const addressExists = await client.query(checkAddressQuery, checkAddressValues);

            if (addressExists.rows.length > 0) {
                // If address_id is provided, it's an edit operation
                const updateQuery = `
                UPDATE addresses
                SET customer_id = $1, address_line1 = $2, address_line2 = $3, city = $4, state = $5, postal_code = $6, country = $7, name = $8
                WHERE address_id = $9
                RETURNING *;
            `;
                const updateValues = [customer_id, address_line1, address_line2, city, state, postal_code, country, name, address_id];
                const result = await client.query(updateQuery, updateValues);

                if (result.rows.length > 0) {
                    return APIRes.getFinalResponse(true, `Address updated successfully.`, result.rows, res);
                } else {
                    return APIRes.getFinalResponse(false, `Address with ID ${address_id} not found.`, [], res);
                }
            }
            else {
                return APIRes.getFinalResponse(false, `Address with ID ${address_id} not found.`, [], res);
            }
        } else {
            // If address_id is not provided, it's an add operation
            const checkAddressQuery = `
                SELECT * FROM addresses
                WHERE customer_id = $1
               
            `;

            const checkAddressValues = [customer_id];
            const addressExists = await client.query(checkAddressQuery, checkAddressValues);
            console.log(addressExists.rows.length)
            if (addressExists.rows.length <= 9) {
                // if (addressExists.rows.length > 0) {
                //     return APIRes.getFinalResponse(false, `Address already exists for the customer.`, [], res);
                // } else {
                const insertQuery = `
                    INSERT INTO addresses (customer_id, address_line1, address_line2, city, state, postal_code, country, name)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *;
                `;
                const insertValues = [customer_id, address_line1, address_line2, city, state, postal_code, country, name];
                const result = await client.query(insertQuery, insertValues);

                if (result.rows.length > 0) {
                    return APIRes.getFinalResponse(true, `Address added successfully.`, result.rows, res);
                }
                //}
            }
            else {
                return APIRes.getFinalResponse(true, `Address per person is ten.`, [], res);
            }
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


exports.removeAddress = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["address_id"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }
        let { customer_id, address_id } = userInput;

        client = await getClient();
        const existingRecordQuery = 'SELECT * FROM addresses WHERE address_id = $1 and  customer_id=$2';
        const existingRecordValues = [address_id, customer_id];
        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);
        if (existingRecord.rows.length === 0) {
            return APIRes.getFinalResponse(false, `Address does not exist for this user.`, [], res);
        } else {
            // Delete records for the given customer_id
            const deleteQuery = 'DELETE FROM addresses WHERE address_id = $1 and customer_id=$2';
            const existingRecordValues = [address_id, customer_id]
            const result = await client.query(deleteQuery, existingRecordValues);

            return APIRes.getFinalResponse(true, `Successfully deleted address for address_id:${address_id}`, [], res);

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

exports.getAddressByUser = async (req, res, next) => {
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
        const existingRecordQuery = 'SELECT * FROM addresses WHERE customer_id = $1';
        const existingRecordValues = [customer_id];
        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);
        if (existingRecord.rows.length === 0) {
            return APIRes.getFinalResponse(false, `No address empty`, [], res);
        } else {

            return APIRes.getFinalResponse(true, `Successfully get address`, existingRecord.rows, res);
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

//We buy products 
exports.WeBuyProducts = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);

        console.log(userInput.product_id)
        if (userInput.product_id == undefined) {
            const requiredFields = ["name", "description", "price", "quantity_available", "image_url", "product_code", "type", "typeofproduct"];
            const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
            if (inputs !== true) {
                return APIRes.getNotExistsResult(`Required ${inputs}`, res);
            }
        }
        let { product_id, name, description, price, quantity_available, category_id, created_at, updated_at, image_url, product_code, type, typeofproduct } = userInput;

        client = await getClient();

        if (product_id) {

            // If address_id is not provided, it's an add operation
            const checkAddressQuery = `
               SELECT * FROM webyproducts
               WHERE product_id = $1 and product_code= $2`;

            const checkAddressValues = [product_id, product_code];
            const addressExists = await client.query(checkAddressQuery, checkAddressValues);

            if (addressExists.rows.length > 0) {
                // If address_id is provided, it's an edit operation
                const updateQuery = `
                UPDATE webyproducts
                SET name = $1, description = $2, price = $3, updated_at = $4
                WHERE product_id = '${product_id}' and product_code= '${product_code}'
                RETURNING *;
            `;
                const updateValues = [name, description, price, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS')];
                const result = await client.query(updateQuery, updateValues);

                if (result.rows.length > 0) {
                    return APIRes.getFinalResponse(true, `Product updated successfully.`, result.rows, res);
                } else {
                    return APIRes.getFinalResponse(false, `Products with ID ${product_id} not found.`, [], res);
                }
            }
            else {
                return APIRes.getFinalResponse(false, `Products with ID ${product_id} not found. or Products code not found`, [], res);
            }
        } else {
            // If address_id is not provided, it's an add operation
            const checkAddressQuery = `
                SELECT * FROM webyproducts
                WHERE  product_code = $1
                
            `;

            const checkAddressValues = [product_code];
            const webuyproductExists = await client.query(checkAddressQuery, checkAddressValues);

            if (webuyproductExists.rows.length != 0) {
                return APIRes.getFinalResponse(false, `Product already exists.`, [], res);
            } else {
                const insertQuery = `
                    INSERT INTO webyproducts (name, description, price, quantity_available, category_id, created_at,updated_at, image_url, product_code, type,typeofproduct)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11)
                    RETURNING *;
                `;
                const insertValues = [name, description, price, quantity_available, category_id, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), image_url, product_code, type, typeofproduct];
                const result = await client.query(insertQuery, insertValues);

                if (result.rows.length > 0) {
                    return APIRes.getFinalResponse(true, `Product added successfully.`, result.rows, res);
                }
            }
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

exports.getAllWeBuyProducts = async (req, res, next) => {
    let client;
    try {

        client = await getClient();
        const existingRecordQuery = 'SELECT * FROM webyproducts';
        const existingRecord = await client.query(existingRecordQuery);
        if (existingRecord.rows.length === 0) {
            return APIRes.getFinalResponse(false, `No Products`, [], res);
        } else {

            return APIRes.getFinalResponse(true, `Successfully get products`, existingRecord.rows, res);
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

//Place order
// exports.placeorder = async (req, res, next) => {
//     let client;
//     try {
//         let errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             throw errors.array();
//         }

//         const userInput = Utils.getReqValues(req);
//         const requiredFields = ["customer_id", "status", "total_amount", "product_code", "payment_method", "address"];
//         const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
//         if (inputs !== true) {
//             return APIRes.getNotExistsResult(`Required ${inputs}`, res);
//         }

//         let { customer_id, order_date, status, total_amount, created_at, updated_at, product_code, image_url, payment_method, address } = userInput;


//         client = await getClient();

//         const query_getproduct = `select * from products
//         where product_code='${product_code}'`;

//         const result_product = await client.query(query_getproduct);

//         if (result_product.rows.length != 0) {

//             image_url = result_product.rows[0].image_url;
//             console.log(customer_id.length)
//             const query = `INSERT INTO orders (customer_id, order_date, status, total_amount, created_at, updated_at, img_url, product_code,address)
//                             VALUES ($1, $2, $3, $4, $5, $6,$7,$8,$9)
//                             RETURNING *;
//                             `;
//             const values = [customer_id, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), status, total_amount, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), image_url, product_code,address];
//             const result = await client.query(query, values);
//             const orderId = result.rows[0].order_id;

//             // Insert payment
//             const paymentQuery = `
//                 INSERT INTO payments (order_id, amount, payment_date, payment_method, status, created_at, updated_at)
//                 VALUES ($1, $2, $3, $4, $5, $6, $7);
//             `;
//             const paymentValues = [orderId, total_amount, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), payment_method, "success", moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS')];
//             await client.query(paymentQuery, paymentValues);


//             if (result) {
//                 return APIRes.getFinalResponse(true, `Order placed successfully.`, [], res);
//             }
//         }
//         else {
//             return APIRes.getFinalResponse(false, `No Product exit`, [], res);
//         }

//     } catch (error) {
//         console.error('Error:', error);
//         return APIRes.getFinalResponse(false, `Internal Server Error`, [], res);
//     } finally {
//         // Close the client connection
//         if (client) {
//             await client.end();
//         }
//     }
// };

exports.placeorder = async (req, res, next) => {
    console.log("hey")
    let client;
    try {
        // let errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     throw errors.array();
        // }

        const userInput = Utils.getReqValues(req);
        // const requiredFields = ["customer_id", "status", "total_amount", "product_code", "payment_method", "address"];
        // const inputs = validateUserInput.validateUserInput(userInput.products, requiredFields);
        // if (inputs !== true) {
        //     return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        // }


        const orders = userInput.products;

        client = await getClient();

        for (const order of orders) {
            const { product_code, total_amount, name } = order;
            let { customer_id, status, payment_method, address } = order;

            let query_getproduct = `SELECT * FROM products WHERE product_code='${product_code}'`;
            let result_product = await client.query(query_getproduct);

            if (result_product.rows.length == 0) {
                query_getproduct = `SELECT * FROM webyproducts WHERE product_code='${product_code}'`;
                result_product = await client.query(query_getproduct);
            }
            if (result_product.rows.length !== 0) {
                const image_url = result_product.rows[0].image_url;
                const query = `INSERT INTO orders (customer_id, order_date, status, total_amount, created_at, updated_at, img_url, product_code, address,name)
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10)
                                RETURNING order_id;`;
                const values = [customer_id, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), status, total_amount, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), image_url, product_code, address, name];
                const result = await client.query(query, values);
                const orderId = result.rows[0].order_id;

                // Insert payment
                const paymentQuery = `
                    INSERT INTO payments (order_id, amount, payment_date, payment_method, status, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `;
                const paymentValues = [orderId, total_amount, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), payment_method, "success", moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS')];
                await client.query(paymentQuery, paymentValues);
            } else {
                return APIRes.getFinalResponse(false, `No Product exists for product code ${product_code}`, [], res);
            }
        }

        return APIRes.getFinalResponse(true, `Orders placed successfully.`, [], res);

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

exports.placeordersendtoemail = async (req, res, next) => {

    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        // const requiredFields = ["userdetails", "orderdetails"];
        // const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        // if (inputs !== true) {
        //     return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        // }

        let { userdetails, orderdetails, address, totalAmount } = userInput;

        let email_send = await SendEmailToUser(userdetails, orderdetails, address, totalAmount);

        if (email_send) {
            return APIRes.getFinalResponse(true, `Orders placed successfully.`, [], res);

        }
        else {
            return APIRes.getFinalResponse(false, `Unable to place Orders.`, [], res);
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

const SendEmailToUser = async (userdetails, orderdetails, address, totalAmount) => {
    // Create a transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com', // Your SMTP server hostname
        port: 465, // Your SMTP port
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'help@cleanscrapjunk.com', // Your email address
            pass: 'Help@123' // Your email password
        }
    });

    // console.log(template.template)
    // let htmlcontent=template.Body.toString('utf-8');
    // Define email content

    console.log(userdetails)
    console.log(address)
    let sgst = ((totalAmount * 9) / 100)
    const modifytemp = template.template.replace('{nameofreceiver}', userdetails.name)
        .replace('{addressofreceiver}', `${address.address_line1} ${address.address_line2} ${address.city} ${address.state} ${address.postal_code}`)
        .replace('{cell}', userdetails.phoneNumber)
        .replace('{email}', userdetails.email)
        .replace('{GSTIn}', " ")
        .replace('{items-table}', orderdetails.map((item, index) =>
            `<tr>
                <td style="padding: 20px 0 10px;">${index + 1}</td>
                <td style="padding: 20px 0 10px;">${item?.description}</td>
                <td style="padding: 20px 0 10px;">${item?.quantity}</td>
                <td style="padding: 20px 0 10px;">${item?.quantity}</td>
                <td style="padding: 20px 0 10px;">${item?.price}</td>
                <td style="padding: 20px 0 10px;">${item?.price}</td>
                </tr>`).join('') ?? '')
        .replace('{totalAmount}', totalAmount)
        .replace('{withsgst}', sgst)
        .replace('{withCGST}', sgst)

    let mailOptions = {
        from: 'help@cleanscrapjunk.com', // Sender address
        to:'kavithaec1431@gmail.com', // List of recipients
        subject: 'Quotation', // Subject line
        html: modifytemp
        // html: '<h1>This is a test email</h1><p>Sent from Node.js</p>'
    };

    try {
        // Send email and wait for the result
        const sendEmailResult = await email_send(transporter, mailOptions);
        console.log(sendEmailResult); // Log the result
        return sendEmailResult; // Return the result
    } catch (error) {
        console.error('Error sending email:', error);
        return false; // Return false if there's an error
    }
};

const email_send = async (transporter, mailOptions) => {
    // Return a Promise that resolves when the email is sent or rejects if there's an error
    return new Promise((resolve, reject) => {
        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                reject(false); // Reject the Promise with false if there's an error
            } else {
                console.log('Email sent:', info.response);
                resolve(true); // Resolve the Promise with true if the email is sent successfully
            }
        });
    });
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["order_id", "status"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { order_id, status } = userInput;

        client = await getClient();

        // Check if the order exists
        const checkOrderQuery = `SELECT * FROM orders WHERE order_id = $1`;
        const checkOrderValues = [order_id];
        const orderExists = await client.query(checkOrderQuery, checkOrderValues);

        if (orderExists.rows.length === 0) {
            return APIRes.getFinalResponse(false, `Order with ID ${order_id} does not exist.`, [], res);
        }

        // Update the order status
        const updateStatusQuery = `UPDATE orders SET status = $1 WHERE order_id = $2`;
        const updateStatusValues = [status, order_id];
        const result = await client.query(updateStatusQuery, updateStatusValues);

        if (result.rowCount > 0) {
            return APIRes.getFinalResponse(true, `Order status updated successfully.`, [], res);
        } else {
            return APIRes.getFinalResponse(false, `Failed to update order status.`, [], res);
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

// Get orders by status
exports.getOrdersByStatus = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["customer_id", "status"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }
        const { status, customer_id } = userInput;

        client = await getClient();

        // Query to get orders by status
        const query = `
            SELECT * FROM orders
            WHERE status = $1 and customer_id=$2;
        `;
        const values = [status, customer_id];
        const result = await client.query(query, values);

        if (result.rows.length > 0) {
            return APIRes.getFinalResponse(true, `Orders with status ${status} retrieved successfully.`, result.rows, res);
        } else {
            return APIRes.getFinalResponse(false, `No orders found with status ${status}.`, [], res);
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

exports.add_products_scrap_market = async (req, res, next) => {
    let client;

    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["product_code", "name", "description", "price", "quantity_available", "category_id", "type", "location", "discount_price"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { product_code, name, description, price, quantity_available, category_id, image_url, type, location, discount_price } = userInput;

        //image_url = `${process.env.DOMAIN + image_url}`;

        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM products_scrap_market WHERE product_code = $1';
        const existingRecordValues = [product_code];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length === 0) {
            const query = `
                            INSERT INTO products_scrap_market (product_code,name, description, price, quantity_available, category_id, image_url,created_at,type,location, discount_price)
                            VALUES ($1, $2, $3, $4, $5, $6,$7,$8,$9,$10,$11)
                            RETURNING *;
                            `;
            const values = [product_code, name, description, price, quantity_available, category_id, image_url, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), type, location, discount_price];
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

exports.Editproducts_scrap_market = async (req, res, next) => {
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

        let { product_code, name, description, price, quantity_available, category_id, image_url, product_status, type, location, discount_price } = userInput;


        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM products_scrap_market WHERE product_code = $1';
        const existingRecordValues = [product_code];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length > 0) {
            const query = `
            UPDATE products_scrap_market
            SET name = $1, description = $2, price = $3, quantity_available = $4, category_id = $5, image_url = $6, updated_at = $8,product_status=$9,type=$10,location=$11,discount_price=$12
            WHERE product_code = $7
            RETURNING *`;
            const values = [name, description, price, quantity_available, category_id, image_url, product_code, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), product_status, type, location, discount_price];
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

exports.getallScrapProducts = async (req, res, next) => {
    let client;
    try {
        const userInput = Utils.getReqValues(req);
        const { product_code, Active_Status, type } = userInput;
        client = await getClient();
        let query = `SELECT * FROM products_scrap_market WHERE 1=1`

        if (product_code) {
            query = query + ` and product_code = '${product_code}'`; // Ensure proper spacing and quoting for the condition
        }
        if (Active_Status) {
            query = query + ` and product_status = '${Active_Status}'`
        }
        if (type) {
            query = query + ` and type = '${type}'`
        }

        const existingRecord = await client.query(query);

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

exports.add_products_price_scrap_market = async (req, res, next) => {
    let client;

    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["product_code", "name", "description", "price", "quantity_available", "category_id", "type", "location", "discount_price"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { product_code, name, description, price, quantity_available, category_id, image_url, type, location, discount_price } = userInput;

        //image_url = `${process.env.DOMAIN + image_url}`;

        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM price_scrap_market WHERE product_code = $1';
        const existingRecordValues = [product_code];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length === 0) {
            const query = `
                            INSERT INTO price_scrap_market (product_code,name, description, price, quantity_available, category_id, image_url,created_at,type,location, discount_price)
                            VALUES ($1, $2, $3, $4, $5, $6,$7,$8,$9,$10,$11)
                            RETURNING *;
                            `;
            const values = [product_code, name, description, price, quantity_available, category_id, image_url, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), type, location, discount_price];
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

exports.Editproducts_price_scrap_market = async (req, res, next) => {
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

        let { product_code, name, description, price, quantity_available, category_id, image_url, product_status, type, location, discount_price } = userInput;


        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM price_scrap_market WHERE product_code = $1';
        const existingRecordValues = [product_code];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length > 0) {
            const query = `
            UPDATE price_scrap_market
            SET name = $1, description = $2, price = $3, quantity_available = $4, category_id = $5, image_url = $6, updated_at = $8,product_status=$9,type=$10,location=$11,discount_price=$12
            WHERE product_code = $7
            RETURNING *`;
            const values = [name, description, price, quantity_available, category_id, image_url, product_code, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), product_status, type, location, discount_price];
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

exports.getallScrapProductsPrice = async (req, res, next) => {
    let client;
    try {
        const userInput = Utils.getReqValues(req);
        const { product_code, Active_Status, type } = userInput;
        client = await getClient();
        let query = `SELECT * FROM price_scrap_market WHERE 1=1`

        if (product_code) {
            query = query + ` and product_code = '${product_code}'`; // Ensure proper spacing and quoting for the condition
        }
        if (Active_Status) {
            query = query + ` and product_status = '${Active_Status}'`
        }
        if (type) {
            query = query + ` and type = '${type}'`
        }

        const existingRecord = await client.query(query);

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


//add offers
exports.Addofferandeditoffer = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["product_name", "rate", "size", "quantity", "product_code", "description"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { id, product_name, rate, size, quantity, product_code, description } = userInput;

        client = await getClient();

        if (id) {

            // If address_id is not provided, it's an add operation
            const checkofferQuery = `
               SELECT * FROM offers
               WHERE id = $1 and product_code=$2
               
           `;

            const checkofferValues = [id, product_code];
            const addressExists = await client.query(checkofferQuery, checkofferValues);

            console.log(addressExists)
            if (addressExists.rows.length > 0) {
                // If address_id is provided, it's an edit operation
                const updateQuery = `
                UPDATE offers
                SET id = $1, product_name = $2, rate = $3, size = $4, quantity = $5, product_code=$6,description=$7
                WHERE id = $1
                RETURNING *;
            `;
                const updateValues = [id, product_name, rate, size, quantity, product_code, description];
                const result = await client.query(updateQuery, updateValues);

                if (result.rows.length > 0) {
                    return APIRes.getFinalResponse(true, `offer updated successfully.`, result.rows, res);
                } else {
                    return APIRes.getFinalResponse(false, `offer with ID ${id} not found.`, [], res);
                }
            }
            else {
                return APIRes.getFinalResponse(false, `offer with ID ${id} not found.`, [], res);
            }
        } else {
            // If address_id is not provided, it's an add operation
            const checkAddressQuery = `
                SELECT * FROM offers
                WHERE product_code = $1
               
            `;

            const checkAddressValues = [product_code];
            const addressExists = await client.query(checkAddressQuery, checkAddressValues);
            console.log(addressExists)
            console.log(addressExists.rows.length)
            if (addressExists.rows.length == 0) {
                const insertQuery = `
                    INSERT INTO offers (product_name, rate, size, quantity,product_code,description)
                    VALUES ($1, $2, $3, $4,$5,$6)
                    RETURNING *;
                `;
                const insertValues = [product_name, rate, size, quantity, product_code, description];
                const result = await client.query(insertQuery, insertValues);

                if (result.rows.length > 0) {
                    return APIRes.getFinalResponse(true, `offer added successfully.`, result.rows, res);
                }
            }
            else {
                return APIRes.getFinalResponse(false, `offer exist.`, [], res);
            }
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


exports.removeoffers = async (req, res, next) => {
    let client;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["id"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }
        let { id } = userInput;

        client = await getClient();
        const existingRecordQuery = 'SELECT * FROM offers WHERE id = $1';
        const existingRecordValues = [id];
        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);
        if (existingRecord.rows.length === 0) {
            return APIRes.getFinalResponse(false, ` offer id does not exist.`, [], res);
        } else {
            // Delete records for the given customer_id
            const deleteQuery = 'DELETE FROM offers WHERE id = $1';
            const existingRecordValues = [id]
            const result = await client.query(deleteQuery, existingRecordValues);

            return APIRes.getFinalResponse(true, `Successfully deleted offer for id:${id}`, [], res);

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

exports.getalloffers = async (req, res, next) => {
    let client;
    try {
        const userInput = Utils.getReqValues(req);
        const { product_code, Active_Status, type } = userInput;
        client = await getClient();
        let query = `SELECT * FROM offers WHERE 1=1`


        const existingRecord = await client.query(query);

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