
// Import packages
const express = require("express");
const routers = require("./router/routers");
const { getClient } = require("./helperfun/postgresdatabase");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// Import blacklistedTokens set
const blacklistedTokens = require('./helperfun/blacklistedTokens');
// Middlewares
const app = express();
app.use(express.json());

// Generate a random secret key
const secretKey = crypto.randomBytes(32).toString('base64');

async function main() {
  try {
    const client = await getClient();
    console.log("Connected to the database");

  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

main();

// app.use('/images', express.static('images'));
//app.use('/api', save_user_login)
// Routes
app.use("/api", routers);

// Route to logout (blacklist) a user
app.post('/api/logout', (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(400).send({ message: 'No token provided.' });
  }

  // Split the token string and take the second part
  const tokenParts = token.split(' ');
  const tokenValue = tokenParts[1];

  // Ensure blacklistedTokens is a Set and then add the tokenValue
  if (blacklistedTokens instanceof Set) {
    console.log(tokenValue)
    blacklistedTokens.add(tokenValue);
  } else {
    console.error('blacklistedTokens is not a Set:', blacklistedTokens);
  }
  return res.status(200).send({ message: 'Logout successful.' });
});

// connection
const port = process.env.PORT || 9001;
app.listen(port, () => console.log(`Listening to port ${port}`));