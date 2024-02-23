const express = require("express");
const user_login = require('../controllers/user_login');
const router = express.Router();

router.post('/usersiginup', user_login.usersiginup);
router.get("/", async (req, res, next) => {
  return res.status(200).json({
    title: "Express Testing",
    message: "The app is working properly!",
  });
});

module.exports = router;