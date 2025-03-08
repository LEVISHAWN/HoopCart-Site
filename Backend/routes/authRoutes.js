const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db"); // Use the connection pool from db.js
const session = require("express-session");
require("dotenv").config();

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
    }
});

// ✅ Show Login Page
router.get("/login", (req, res) => {
    res.render("login", { message: "" });
});

// ✅ Handle User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        if (req.headers['content-type'] === 'application/json') {
            return res.status(400).json({ error: "Email and Password are required." });
        }
        return res.render("login", { message: "Email and Password are required." });
    }

    try {
        // Get user from database
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            if (req.headers['content-type'] === 'application/json') {
                return res.status(401).json({ error: "Invalid email or password" });
            }
            return res.render("login", { message: "Invalid email or password" });
        }

        const user = users[0];

        // Compare password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            if (req.headers['content-type'] === 'application/json') {
                return res.status(401).json({ error: "Invalid email or password" });
            }
            return res.render("login", { message: "Invalid email or password" });
        }

        // Set user session
        req.session.user = {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            phone: user.phone,
            isLoggedIn: true
        };

        if (req.headers['content-type'] === 'application/json') {
            return res.json({ message: "Login successful", user: req.session.user });
        }
        res.redirect("/account");
    } catch (err) {
        console.error("❌ Login Error:", err);
        if (req.headers['content-type'] === 'application/json') {
            return res.status(500).json({ error: "Error during login. Please try again!" });
        }
        res.render("login", { message: "Error during login. Please try again!" });
    }
});

// ✅ Handle Logout
router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("❌ Logout Error:", err);
            return res.status(500).json({ message: "Logout failed" });
        }
        res.redirect("/auth/login");
    });
});

module.exports = router;
