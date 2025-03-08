const express = require("express");
const db = require("./db"); // Import database connection
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const authRoutes = require("./routes/authRoutes");
<<<<<<< HEAD
const checkAuth = require("./middleware/auth");
//const paymentRoutes = require("./routes/paymentRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
=======
const paymentRoutes = require("./routes/paymentRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;
>>>>>>> 6325880f9ecfdfdda2b08c688fecae17ba045282

// ✅ Enable CORS for frontend communication
app.use(
    cors({
        origin: "http://localhost:5500", // Adjust frontend URL if needed
        credentials: true,
    })
);

// ✅ Middleware for JSON and Sessions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || "fallback_secret_key",
    resave: false,
    saveUninitialized: true
}));

<<<<<<< HEAD
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || "fallback_secret_key",
    resave: false,
    saveUninitialized: true
}));

// Add auth middleware
app.use(checkAuth);

// ✅ Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Serve Static Frontend Files
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.static(path.join(__dirname, "public"))); // Ensure this is serving account.html

// ✅ Use auth routes
app.use("/auth", authRoutes);

// ✅ Serve the account page
app.get("/account", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/auth/login");
    }
    res.render("account", { user: req.session.user });
});

// API endpoint to check login status
app.get("/api/auth/status", (req, res) => {
    res.json({
        isLoggedIn: req.session.user?.isLoggedIn || false,
        user: req.session.user || null
    });
});
=======
// ✅ Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
>>>>>>> 6325880f9ecfdfdda2b08c688fecae17ba045282

// ✅ Use authentication and payment routes
app.use("/auth", authRoutes);
app.use("/payment", paymentRoutes);

// ✅ Serve Static Frontend Files
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.static(path.join(__dirname, "public"))); // Ensure this is serving account.html

// ✅ Serve the account page
app.get("/account", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "account.html"));
});

// ✅ Define product data file path
const productsFilePath = path.join(__dirname, "data", "products.json");

// ✅ Ensure the products file exists
if (!fs.existsSync(productsFilePath)) {
    fs.writeFileSync(productsFilePath, "[]");
}

// ✅ Load product data
let products = [];
try {
    const rawData = fs.readFileSync(productsFilePath, "utf8");
    products = JSON.parse(rawData);
} catch (error) {
    console.error("❌ Error loading products:", error);
}

// ✅ Default products if file is empty or invalid
if (!Array.isArray(products) || products.length === 0) {
    products = [
        {
            id: 1,
            name: "Portable Basketball Hoop",
            description: "High-quality portable basketball hoop for outdoor use.",
            price: 199.99,
            stock: 50,
            image: "images/hoop.jpg",
        },
        {
            id: 2,
            name: "Official Size Basketball",
            description: "Regulation size basketball for professional play.",
            price: 29.99,
            stock: 100,
            image: "images/basketball.jpg",
        },
    ];
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
}

let cart = [];

// ✅ Helper function to update product stock in file
function updateProductStock() {
    try {
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
    } catch (error) {
        console.error("❌ Error saving updated stock:", error);
    }
}

// ✅ API Endpoints
app.get("/api/products", (req, res) => {
    try {
        const rawData = fs.readFileSync(productsFilePath, "utf8");
        const products = JSON.parse(rawData);
        res.json(products);
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



app.put("/api/products", (req, res) => {
    const updatedProduct = req.body;
    const productIndex = products.findIndex((p) => p.id === updatedProduct.id);
    if (productIndex === -1) {
        return res.status(404).json({ error: "Product not found" });
    }
    products[productIndex] = updatedProduct;
    updateProductStock();
    res.json({ message: "Product stock updated", product: updatedProduct });
});

app.post("/api/cart", (req, res) => {
    const { productId, quantity } = req.body;
    const product = products.find((p) => p.id === parseInt(productId));
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.stock < quantity) return res.status(400).json({ error: "Insufficient stock" });
    product.stock -= quantity;
    updateProductStock();
    const existingItem = cart.find((item) => item.id === productId);
    if (existingItem) existingItem.quantity += quantity;
    else cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity });
    res.json({ message: "Added to cart", cart });
});

app.get("/api/cart", (req, res) => res.json(cart));

app.delete("/api/cart/:id", (req, res) => {
    const itemId = parseInt(req.params.id);
    const itemIndex = cart.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return res.status(404).json({ error: "Item not found in cart" });
    const removedItem = cart[itemIndex];
    const product = products.find((p) => p.id === removedItem.id);
    if (product) {
        product.stock += removedItem.quantity;
        updateProductStock();
    }
    cart.splice(itemIndex, 1);
    res.json({ message: "Removed from cart", cart });
});

app.post("/api/checkout", (req, res) => {
    const { deliveryLocation, paymentMethod } = req.body;
    if (!deliveryLocation || !paymentMethod) return res.status(400).json({ error: "Invalid checkout details" });
    if (cart.length === 0) return res.status(400).json({ error: "Cart is empty" });
    cart = [];
    res.json({ message: "Order placed successfully", deliveryLocation, paymentMethod });
});

app.post("/api/apply-coupon", (req, res) => {
    const { couponCode } = req.body;
    const validCoupons = ["MAROON10", "BLACK20", "BASKET30"];
    if (validCoupons.includes(couponCode)) res.json({ success: true, message: "Coupon applied successfully!" });
    else res.status(400).json({ success: false, message: "Invalid coupon code." });
});

// ✅ Logout Route
app.get("/auth/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.redirect("/auth/login");
    });
});

// ✅ Fetch Users (for Admin or Debugging)
app.get("/users", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).send("Database error");
        res.json(results);
    });
});
app.get("/api/user", (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.status(401).json({ loggedIn: false, message: "User not logged in." });
    }
});
<<<<<<< HEAD

// ✅ Logout Route
app.get("/auth/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.redirect("/auth/login");
    });
});

// ✅ Fetch Users (for Admin or Debugging)
app.get("/users", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).send("Database error");
        res.json(results);
    });
});
app.get("/api/user", (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.status(401).json({ loggedIn: false, message: "User not logged in." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
=======
app.get("/account", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/auth/login");
    }
    res.render("account", { user: req.session.user });
});


// ✅ Start Server
const server = app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`)).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        const newServer = app.listen(0, () => console.log(`🚀 Server running on http://localhost:${newServer.address().port}`));
    } else console.error("❌ Server failed to start:", err);
>>>>>>> 6325880f9ecfdfdda2b08c688fecae17ba045282
});
