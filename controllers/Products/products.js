const Utils = require('../../helperfun/utils');
const validateUserInput = require('../../helperfun/validateUserInput');
const APIRes = require('../../helperfun/result');
const { validationResult } = require("express-validator");
const { getClient } = require("../../helperfun/postgresdatabase");
const sharp = require('sharp');
const path = require('path');
const moment = require('moment-timezone');

exports.Addproducts = async (req, res, next) => {
    let client;

    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw errors.array();
        }

        const userInput = Utils.getReqValues(req);
        const requiredFields = ["product_code", "name", "description", "price", "quantity_available", "category_id"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { product_code, name, description, price, quantity_available, category_id, image_url } = userInput;

        //image_url = `${process.env.DOMAIN + image_url}`;

        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM products WHERE product_code = $1';
        const existingRecordValues = [product_code];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length === 0) {
            const query = `
                            INSERT INTO products (product_code,name, description, price, quantity_available, category_id, image_url,created_at)
                            VALUES ($1, $2, $3, $4, $5, $6,$7,$8)
                            RETURNING *;
                            `;
            const values = [product_code, name, description, price, quantity_available, category_id, image_url, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS')];
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

        let { product_code, name, description, price, quantity_available, category_id, image_url, product_status } = userInput;


        client = await getClient();

        const existingRecordQuery = 'SELECT * FROM products WHERE product_code = $1';
        const existingRecordValues = [product_code];

        const existingRecord = await client.query(existingRecordQuery, existingRecordValues);

        if (existingRecord.rows.length > 0) {
            const query = `
            UPDATE products
            SET name = $1, description = $2, price = $3, quantity_available = $4, category_id = $5, image_url = $6, updated_at = $8,product_status=$9
            WHERE product_code = $7
            RETURNING *`;
            const values = [name, description, price, quantity_available, category_id, image_url, product_code, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), product_status];
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
        const userInput = Utils.getReqValues(req);
        const { product_code, Active_Status } = userInput;
        client = await getClient();
        let query = `SELECT * FROM products WHERE 1=1`

        if (product_code) {
            query = query + ` and product_code = '${product_code}'`; // Ensure proper spacing and quoting for the condition
        }
        if (Active_Status) {
            query = query + ` and product_status = '${Active_Status}'`
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
        const requiredFields = ["customer_id", "product_id", "quantity", "image_url", "price", "product_code"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { customer_id, product_id, quantity, created_at, updated_at, image_url, price, product_code } = userInput;

        created_at = moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS');
        updated_at = moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS');
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
        const requiredFields = ["product_name", "description", "price", "quantity_available", "image_url", "product_code", "type"];
        const inputs = validateUserInput.validateUserInput(userInput, requiredFields);
        if (inputs !== true) {
            return APIRes.getNotExistsResult(`Required ${inputs}`, res);
        }

        let { webyproducts_id, product_name, description, price, quantity_available, category_id, created_at, updated_at, image_url, product_code, type } = userInput;

        client = await getClient();

        if (webyproducts_id) {

            // If address_id is not provided, it's an add operation
            const checkAddressQuery = `
               SELECT * FROM webyproducts
               WHERE webyproducts_id = $1`;

            const checkAddressValues = [webyproducts_id];
            const addressExists = await client.query(checkAddressQuery, checkAddressValues);

            if (addressExists.rows.length > 0) {
                // If address_id is provided, it's an edit operation
                const updateQuery = `
                UPDATE webyproducts
                SET product_name = $1, description = $2, price = $3, quantity_available = $4, category_id = $5, created_at = $6, updated_at = $7, image_url = $8,product_code=$9,type=$10
                WHERE webyproducts_id = '${webyproducts_id}'
                RETURNING *;
            `;
                const updateValues = [product_name, description, price, quantity_available, category_id, addressExists.rows[0].created_at, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), image_url, product_code, type];
                const result = await client.query(updateQuery, updateValues);

                if (result.rows.length > 0) {
                    return APIRes.getFinalResponse(true, `Prodct updated successfully.`, result.rows, res);
                } else {
                    return APIRes.getFinalResponse(false, `Products with ID ${webyproducts_id} not found.`, [], res);
                }
            }
            else {
                return APIRes.getFinalResponse(false, `Products with ID ${webyproducts_id} not found.`, [], res);
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
                    INSERT INTO webyproducts (product_name, description, price, quantity_available, category_id, created_at,updated_at, image_url, product_code, type)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10)
                    RETURNING *;
                `;
                const insertValues = [product_name, description, price, quantity_available, category_id, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), image_url, product_code, type];
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
            const { product_code, total_amount } = order;
            let { customer_id, status, payment_method, address } = order;
            const query_getproduct = `SELECT * FROM products WHERE product_code='${product_code}'`;
            const result_product = await client.query(query_getproduct);

            if (result_product.rows.length !== 0) {
                const image_url = result_product.rows[0].image_url;
                const query = `INSERT INTO orders (customer_id, order_date, status, total_amount, created_at, updated_at, img_url, product_code, address)
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                                RETURNING order_id;`;
                const values = [customer_id, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), status, total_amount, moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), moment().tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm:ss.SSS'), image_url, product_code, address];
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
                // return APIRes.getFinalResponse(false, `No Product exists for product code ${product_code}`, [], res);
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


