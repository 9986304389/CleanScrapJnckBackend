
// Import packages
const express = require("express");
const routers = require("./router/routers");
const { getClient } = require("./helperfun/postgresdatabase");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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

//app.use('/api', save_user_login)
// Routes
app.use("/api", routers);

// connection
const port = process.env.PORT || 9001;
app.listen(port, () => console.log(`Listening to port ${port}`));