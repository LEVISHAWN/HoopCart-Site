const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
<<<<<<< HEAD
const db = require("../db"); // Use the connection pool from db.js
const session = require("express-session");
require("dotenv").config();

=======
const mysql = require("mysql2");
const session = require("express-session");
require("dotenv").config();

// ✅ MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Levi110404@",
    database: "hoopcart",
});

db.connect(err => {
    if (err) {
        console.error("❌ Database Connection Failed:", err);
        return;
    }
    console.log("✅ Connected to MySQL Database");
});

// ✅ Session Configuration (Move to `server.js`)
router.use(session({
    secret: process.env.SESSION_SECRET || "fallback_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set `true` if using HTTPS
}));

>>>>>>> 6325880f9ecfdfdda2b08c688fecae17ba045282
// ✅ Show Signup Page
router.get("/signup", (req, res) => {
    res.render("signup", { message: "" });
});

// ✅ Handle User Signup
router.post("/signup", async (req, res) => {
    const { full_name, email, phone, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.render("signup", { message: "Passwords do not match!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
<<<<<<< HEAD
        
        // Check if email already exists
        const [existingUsers] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.render("signup", { message: "Email already exists!" });
        }

        // Insert new user
        await db.query(
            "INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)",
            [full_name, email, phone, hashedPassword]
        );

        res.redirect("/auth/login");
    } catch (err) {
        console.error("❌ Database Error:", err);
        res.render("signup", { message: "Error creating account. Please try again!" });
=======

        db.query(
            "INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)",
            [full_name, email, phone, hashedPassword],
            (err, results) => {
                if (err) {
                    console.error("❌ Database Error:", err);
                    return res.render("signup", { message: "Error: Email or phone already exists!" });
                }
                res.redirect("/auth/login");
            }
        );
    } catch (err) {
        console.error("❌ Hashing Error:", err);
        res.render("signup", { message: "Something went wrong. Try again!" });
>>>>>>> 6325880f9ecfdfdda2b08c688fecae17ba045282
    }
});

// ✅ Show Login Page
router.get("/login", (req, res) => {
    res.render("login", { message: "" });
});

<<<<<<< HEAD
// ✅ Handle User Login
=======
// ✅ Handle User Login with JSON Response
>>>>>>> 6325880f9ecfdfdda2b08c688fecae17ba045282
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
<<<<<<< HEAD
        return res.render("login", { message: "Email and Password are required." });
    }

    try {
        // Get user from database
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.render("login", { message: "Invalid email or password" });
        }

        const user = users[0];

        // Compare password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render("login", { message: "Invalid email or password" });
        }

        // Set user session
=======
        return res.status(400).json({ error: "Email and Password are required." });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) {
            console.error("❌ Database Query Error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];

        // ✅ Compare hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // ✅ Store user session
>>>>>>> 6325880f9ecfdfdda2b08c688fecae17ba045282
        req.session.user = {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
<<<<<<< HEAD
            phone: user.phone,
            isLoggedIn: true
        };

        // Render success message with auto-redirect
        return res.render("login-success", {
            user: req.session.user,
            message: "Login successful! Redirecting to home page..."
        });
    } catch (err) {
        console.error("❌ Login Error:", err);
        res.render("login", { message: "Error during login. Please try again!" });
    }
=======
            phone: user.phone
        };

        return res.json({ message: "Login successful", user: req.session.user });
    });
>>>>>>> 6325880f9ecfdfdda2b08c688fecae17ba045282
});

// ✅ Handle Logout
router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
<<<<<<< HEAD
            console.error("❌ Logout Error:", err);
=======
>>>>>>> 6325880f9ecfdfdda2b08c688fecae17ba045282
            return res.status(500).json({ message: "Logout failed" });
        }
        res.redirect("/auth/login");
    });
});

module.exports = router;
