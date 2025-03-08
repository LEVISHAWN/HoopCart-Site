// ./db.js
const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Levi110404Rosa@",
    database: process.env.DB_NAME || "hoopcart",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// Test connection
pool.getConnection()
    .then(connection => {
        console.log("✅ Connected to MySQL Database");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Database Connection Failed:", err);
        process.exit(1); // Exit if we can't connect to the database
    });

module.exports = pool;
