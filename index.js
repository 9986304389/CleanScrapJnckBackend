
// Import packages
const express = require("express");
const routers = require("./router/routers");
const { getClient } = require("./helperfun/postgresdatabase");
// Middlewares
const app = express();
app.use(express.json());


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