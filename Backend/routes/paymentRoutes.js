const express = require("express");
const router = express.Router();
const IntaSend = require("intasend-node"); // ✅ Correct SDK import
require("dotenv").config();

// ✅ Initialize IntaSend with proper API keys
const intasend = new IntaSend({
    publicKey: process.env.INTASEND_PUBLIC_KEY,
    privateKey: process.env.INTASEND_PRIVATE_KEY,
    test: true, // Change to false in production
});

// ✅ Fix function usage - `createPaymentRequest` instead of `paymentRequest`
router.post("/initiate", async (req, res) => {
    const { amount, email } = req.body;

    try {
        const response = await intasend.payment.createPaymentRequest({
            amount,
            currency: "KES",
            email,
            method: ["M-Pesa", "Card", "Bank"],
            redirect_url: "http://localhost:3000/payment/success",
            callback_url: "http://localhost:3000/payment/callback",
        });

        res.json({ checkout_url: response.checkout_url });
    } catch (error) {
        console.error("IntaSend Payment Error:", error);
        res.status(500).json({ error: "Payment request failed." });
    }
});

module.exports = router;
