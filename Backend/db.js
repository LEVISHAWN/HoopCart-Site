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
