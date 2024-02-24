const express = require("express");
const user_login = require('../controllers/user_login');
const user_validation = require('../controllers/user_validation')
const router = express.Router();

router.post('/usersiginup', user_login.usersiginup);
// router.post('/login', user_validation.authenticateUser);
router.get("/", async (req, res, next) => {
  return res.status(200).json({
    title: "Express Testing",
    message: "The app is working properly!",
  });
});

module.exports = router;