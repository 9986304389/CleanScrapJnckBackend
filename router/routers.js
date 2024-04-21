const express = require("express");
const jwt = require('jsonwebtoken');
const { secretKey } = require('../helperfun/jwtconfig');
const user_login = require('../controllers/user_login');
const user_validation = require('../controllers/user_validation');
const resetPassword = require('../controllers/resetPassword');
const product = require('../controllers/Products/products')
const router = express.Router();
const app = express();
const cron = require('node-cron');
const axios = require('axios');
const userTokenCache = require('../helperfun/userTokenCache')
const APIRes = require('../helperfun/result')
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
    // console.log(token)
    // if (err) {
    //   //return res.status(403).json({ message: 'Failed to authenticate token' });
    //   return APIRes.getFinalResponse(false, `Failed to authenticate token`, [], res);
    // }
    // // Check if token is blacklisted
    // if (blacklistedTokens.has(token)) {
    //   return APIRes.getFinalResponse(false, `Token is blacklisted.`, [], res);
    //   //return res.status(401).send({ auth: false, message: 'Token is blacklisted.' });
    // }

    // // Token is valid, store decoded information in request object
    // req.decoded = decoded;
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
router.post('/addProduct', checkToken, product.Addproducts);
router.post('/Editproducts', checkToken, product.Editproducts);
router.post('/addProductstoCartByUser', checkToken, product.addProductstoCartByUser);
router.post('/editCartProducts', checkToken, product.editCartProducts);
router.post('/AddressAddAndEdit', checkToken, product.AddressAddAndEdit);
router.post('/weBuyProductAddAndEdit', checkToken, product.WeBuyProducts);
router.post('/placeorder', product.placeorder)
router.post('/updateOrderStatus', checkToken, product.updateOrderStatus);
router.post('/getOrdersByStatus', checkToken, product.getOrdersByStatus);
router.post('/editUserProfile', checkToken, user_login.editUserProfile)
router.post('/addProductsScrapMarket', checkToken, product.add_products_scrap_market);
router.post('/EditproductsScrapMarket', checkToken, product.Editproducts_scrap_market);
router.post('/addProductsPriceScrapMarket', checkToken, product.add_products_price_scrap_market);
router.post('/EditproductsPriceScrapMarket', checkToken, product.Editproducts_price_scrap_market);
router.post('/Addofferandeditoffer', checkToken, product.Addofferandeditoffer);
router.post('/sendPlaceorderemail', checkToken, product.placeordersendtoemail);
router.post('/resetPassword', resetPassword.reset_password);

router.get('/getOTP', checkToken, user_validation.otpGeneate);
router.get('/verifyOTP', checkToken, user_validation.verifyOTP);
router.get('/getprofile', checkToken, user_login.getprofile);
router.get("/getAllProducts", checkToken, product.getallProducts);
router.get("/getProductsByUser", checkToken, product.getProductsByUser);
router.get("/getallScrapProducts", checkToken, product.getallScrapProducts);
router.get("/getallScrapProductsPrice", checkToken, product.getallScrapProductsPrice);

router.get('/getAddressByUser', checkToken, product.getAddressByUser);
router.get('/getAllWeBuyProducts', checkToken, product.getAllWeBuyProducts)
router.get('/getAllofferProducts', checkToken, product.getalloffers);

router.delete('/removeCartProductByUser', checkToken, product.removeCartProducts);
router.delete('/removeAddress', checkToken, product.removeAddress);
router.delete('/removeOffer', checkToken, product.removeoffers);

router.get("/", async (req, res, next) => {
  return res.status(200).json({
    title: "Express Testing",
    message: "The app is working properly!",
  });
});

module.exports = router;