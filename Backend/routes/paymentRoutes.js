const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const twilio = require("twilio");
require("dotenv").config();

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Twilio client setup
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Payment methods available
const paymentMethods = [
    { id: "mpesa", name: "M-PESA", description: "Pay with M-PESA mobile money" },
    { id: "card", name: "Credit/Debit Card", description: "Pay with card" },
    { id: "cash", name: "Cash on Delivery", description: "Pay when you receive your order" }
];

// Get available payment methods
router.get("/methods", (req, res) => {
    res.json(paymentMethods);
});

// Process payment
router.post("/process", async (req, res) => {
    const { paymentMethod, deliveryLocation, orderDetails } = req.body;
    const user = req.session.user;

    console.log('Received payment request:', {
        user: user ? { id: user.id, email: user.email } : null,
        paymentMethod,
        deliveryLocation,
        orderDetails
    });

    if (!user) {
        console.log('User not authenticated');
        return res.status(401).json({ error: "User not authenticated" });
    }

    if (!paymentMethod || !deliveryLocation || !orderDetails) {
        console.log('Missing required fields:', { paymentMethod, deliveryLocation, orderDetails });
        return res.status(400).json({ 
            error: "Missing required order details",
            details: {
                paymentMethod: !paymentMethod,
                deliveryLocation: !deliveryLocation,
                orderDetails: !orderDetails
            }
        });
    }

    if (!orderDetails.items || !Array.isArray(orderDetails.items) || orderDetails.items.length === 0) {
        console.log('Invalid order details:', orderDetails);
        return res.status(400).json({ 
            error: "Invalid order details",
            details: "Cart is empty or invalid"
        });
    }

    try {
        // Simulate payment processing
        const paymentStatus = "success";
        const orderNumber = `ORD-${Date.now()}`;

        console.log('Processing order:', {
            orderNumber,
            paymentStatus,
            itemsCount: orderDetails.items.length,
            total: orderDetails.total
        });

        // Send email confirmation
        try {
            const emailContent = `
                <h2>Order Confirmation</h2>
                <p>Dear ${user.fullName},</p>
                <p>Thank you for your order! Here are your order details:</p>
                <p>Order Number: ${orderNumber}</p>
                <p>Payment Method: ${paymentMethod}</p>
                <p>Delivery Location: ${deliveryLocation}</p>
                <p>Estimated Delivery: ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                <p>Order Details:</p>
                <pre>${JSON.stringify(orderDetails, null, 2)}</pre>
            `;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Order Confirmation - HoopCart",
                html: emailContent
            });
            console.log('Email sent successfully');
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Continue with order even if email fails
        }

        // Send SMS notification
        try {
            console.log('Attempting to send SMS to:', user.phone);
            console.log('Using Twilio number:', process.env.TWILIO_PHONE_NUMBER);
            
            const message = await twilioClient.messages.create({
                body: `Your HoopCart order #${orderNumber} has been confirmed. Estimated delivery: ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: user.phone.startsWith('+') ? user.phone : `+${user.phone}`
            });
            
            console.log('SMS sent successfully:', message.sid);
        } catch (smsError) {
            console.error('Failed to send SMS:', smsError);
            // Continue with order even if SMS fails
        }

        // Return success response
        return res.json({
            success: true,
            message: "Payment processed successfully",
            orderNumber,
            deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
    } catch (error) {
        console.error("Payment processing error:", error);
        return res.status(500).json({ 
            error: "Payment processing failed",
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;
