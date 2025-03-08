<<<<<<< HEAD
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
=======
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",            // Your MySQL username
    password: "Levi110404@", // Replace with your actual MySQL root password
    database: "hoopcart"   // Your database name
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        return;
    }
    console.log("✅ Connected to MySQL database");
});

module.exports = db;
>>>>>>> 6325880f9ecfdfdda2b08c688fecae17ba045282
