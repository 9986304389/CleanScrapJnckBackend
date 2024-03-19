const express = require("express");
const jwt = require('jsonwebtoken');
const { secretKey } = require('../helperfun/jwtconfig');
const user_login = require('../controllers/user_login');
const user_validation = require('../controllers/user_validation');
const product = require('../controllers/Products/products')
const router = express.Router();
const app = express();
const cron = require('node-cron');
const axios = require('axios');
const userTokenCache = require('../helperfun/userTokenCache')
// Store blacklisted tokens
const blacklistedTokens = require('../helperfun/blacklistedTokens');



// Middleware function to check for JWT token in the Authorization header
const checkToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  // Verify token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    // Check if token is blacklisted
    if (blacklistedTokens.has(token)) {
      return res.status(401).send({ auth: false, message: 'Token is blacklisted.' });
    }

    // Token is valid, store decoded information in request object
    req.decoded = decoded;
    next();
  });
};

//Cron job to call the /logout route every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {

    let token = userTokenCache.get('userToken');

    // Make a POST request to the /logout route
    const response = await axios.post('https://clean-scrap-jnck-backend.vercel.app/api/logout', null, {
      headers: {
        'Authorization': `Bearer ${token}` // Replace with the token you want to blacklist
      }
    });
    console.log('Logout job ran successfully:', response.data.message);
  } catch (error) {
    console.error('Error during logout job:', error.response ? error.response.data : error.message);
  }
}, {
  timezone: 'Asia/Kolkata' // Set timezone if necessary
});


// // Get the current time
// const currentTime = new Date();
// // Schedule the cron job to run after 2 minutes from the current time
// const minutes = (currentTime.getMinutes() + 2) % 60; // Increment minutes by 2, wrap around if necessary
// const hours = currentTime.getHours();
// const cronSchedule = `${minutes} ${hours} * * *`;

// cron.schedule(cronSchedule, async () => {
//   try {
//     let token = userTokenCache.get('userToken');

//     // Construct the HTTP POST request to /api/logout endpoint
//     const response = await axios.post('http://localhost:9001/api/logout', null, {
//       headers: {
//         'Authorization': `Bearer ${token}` // Replace with the token you want to blacklist
//       }
//     });

//     console.log('Logout job ran successfully:', response.data.message);
//   } catch (error) {
//     console.error('Error during logout job:', error.response ? error.response.data : error.message);
//   }
// });

router.post('/usersiginup', user_login.usersiginup);
router.post('/login', user_validation.authenticateUser);
router.post('/addProduct', product.Addproducts);
router.post('/Editproducts', product.Editproducts);
router.post('/addProductstoCartByUser', product.addProductstoCartByUser);
router.post('/editCartProducts', product.editCartProducts);
router.post('/AddressAddAndEdit', product.AddressAddAndEdit);
router.post('/weBuyProductAddAndEdit', product.WeBuyProducts);
router.post('/placeorder', product.placeorder)
router.post('/updateOrderStatus', product.updateOrderStatus);
router.post('/getOrdersByStatus', product.getOrdersByStatus);
router.post('/editUserProfile', user_login.editUserProfile)

router.get('/getOTP', checkToken,user_validation.otpGeneate);
router.get('/verifyOTP',checkToken, user_validation.verifyOTP);
router.get('/getprofile', user_login.getprofile);
router.get("/getAllProducts", checkToken, product.getallProducts);
router.get("/getProductsByUser", product.getProductsByUser)

router.get('/getAddressByUser', product.getAddressByUser);
router.get('/getAllWeBuyProducts', product.getAllWeBuyProducts)

router.delete('/removeCartProductByUser', product.removeCartProducts);
router.delete('/removeAddress', product.removeAddress);

router.get("/", async (req, res, next) => {
  return res.status(200).json({
    title: "Express Testing",
    message: "The app is working properly!",
  });
});

module.exports = router;