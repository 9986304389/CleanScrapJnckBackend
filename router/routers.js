const express = require("express");
const jwt = require('jsonwebtoken');
const { secretKey } = require('../helperfun/jwtconfig');
const user_login = require('../controllers/user_login');
const getToken = require('../controllers/getJSONJWTtoken');
const user_validation = require('../controllers/user_validation');
const product = require('../controllers/Products/products')
const router = express.Router();

router.post('/usersiginup', user_login.usersiginup);
router.post('/login', user_validation.authenticateUser);
router.get('/getOTP', user_validation.otpGeneate);
router.get('/verifyOTP', user_validation.verifyOTP);
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
    // Token is valid, store decoded information in request object
    req.decoded = decoded;
    next();
  });
};


router.post('/addProduct', product.Addproducts);
router.post('/Editproducts', product.Editproducts);
router.post('/addProductstoCartByUser', product.addProductstoCartByUser);
router.post('/AddressAddAndEdit',product.AddressAddAndEdit);
router.post('/weBuyProductAddAndEdit',product.WeBuyProducts);
router.post('/placeorder',product.placeorder)
router.post('/updateOrderStatus',product.updateOrderStatus);
router.post('/getOrdersByStatus',product.getOrdersByStatus);

router.get("/getAllProducts", checkToken,product.getallProducts);
router.get("/getProductsByUser", product.getProductsByUser)
router.get('/gettoken', getToken.token);
router.get('/getAddressByUser', product.getAddressByUser);
router.get('/getAllWeBuyProducts',product.getAllWeBuyProducts)

router.delete('/removeCartProductByUser', product.removeCartProducts);
router.delete('/removeAddress', product.removeAddress);

router.get("/", async (req, res, next) => {
  return res.status(200).json({
    title: "Express Testing",
    message: "The app is working properly!",
  });
});

module.exports = router;