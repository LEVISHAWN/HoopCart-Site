// ./db.js
const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise();

// Test connection
db.connect()
    .then(() => console.log("✅ Connected to MySQL Database"))
    .catch(err => {
        console.error("❌ Database Connection Failed:", err);
        return;
    });

module.exports = db;