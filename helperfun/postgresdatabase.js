const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

module.exports.getClient = async () => {
    const client = new Client({
        user: 'postgres',
        host: 'restore-cleanscrap.cna4aw4omfk9.ap-south-1.rds.amazonaws.com',
        database: 'postgres',
        password: 'Cleanscrap123!',
        port: 5432, // Default PostgreSQL port
        
        ssl: {
            require: true, // This will help you. But you will see nwe error
            rejectUnauthorized: false // This line will fix new error
          }
      });
    await client.connect();
    return client;
};