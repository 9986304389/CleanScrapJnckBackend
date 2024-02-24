const express = require("express");
const user_login = require('../controllers/user_login');
const getToken = require('../controllers/getJSONJWTtoken');
const user_validation = require('../controllers/user_validation');
const product = require('../controllers/Products/products')
const router = express.Router();

router.post('/usersiginup', user_login.usersiginup);
router.post('/login', user_validation.authenticateUser);
router.post('/addProduct', product.Addproducts);
router.get('/gettoken', getToken.token);
router.get("/", async (req, res, next) => {
  return res.status(200).json({
    title: "Express Testing",
    message: "The app is working properly!",
  });
});

module.exports = router;