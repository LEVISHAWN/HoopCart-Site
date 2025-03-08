const express = require('express');
const router = express.Router();
const db = require('../db');
const isAdmin = require('../middleware/isAdmin');

// Get dashboard analytics
router.get('/analytics', isAdmin, async (req, res) => {
    try {
        // Get total sales
        const [sales] = await db.promise().query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(DISTINCT id) as order_count,
                SUM(total_amount) as revenue
            FROM orders
            WHERE status = 'completed'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        `);

        // Get top selling products
        const [topProducts] = await db.promise().query(`
            SELECT 
                p.id,
                p.name,
                p.price,
                SUM(oi.quantity) as total_sold,
                SUM(oi.quantity * oi.price) as revenue
            FROM products p
            JOIN order_items oi ON p.id = oi.product_id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'completed'
            GROUP BY p.id
            ORDER BY total_sold DESC
            LIMIT 10
        `);

        // Get low stock alerts
        const [lowStock] = await db.promise().query(`
            SELECT id, name, stock
            FROM products
            WHERE stock <= reorder_point
            ORDER BY stock ASC
        `);

        // Get customer statistics
        const [customerStats] = await db.promise().query(`
            SELECT 
                COUNT(DISTINCT user_id) as total_customers,
                AVG(total_amount) as avg_order_value,
                COUNT(*) / COUNT(DISTINCT user_id) as avg_orders_per_customer
            FROM orders
            WHERE status = 'completed'
        `);

        res.json({
            sales,
            topProducts,
            lowStock,
            customerStats: customerStats[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Inventory management
router.get('/inventory', isAdmin, async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;
    try {
        let sql = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (search) {
            sql += ' AND (name LIKE ? OR sku LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const offset = (page - 1) * limit;
        sql += ' ORDER BY name LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [products] = await db.promise().query(sql, params);
        const [total] = await db.promise().query('SELECT COUNT(*) as count FROM products');

        res.json({
            products,
            pagination: {
                total: total[0].count,
                page: parseInt(page),
                pages: Math.ceil(total[0].count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update inventory
router.put('/inventory/:productId', isAdmin, async (req, res) => {
    const { productId } = req.params;
    const { stock, reorder_point, price } = req.body;

    try {
        await db.promise().query(
            'UPDATE products SET stock = ?, reorder_point = ?, price = ? WHERE id = ?',
            [stock, reorder_point, price, productId]
        );

        // If stock is low, send notification
        if (stock <= reorder_point) {
            // TODO: Implement notification system
            console.log(`Low stock alert for product ${productId}`);
        }

        res.json({ message: 'Inventory updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get order management dashboard
router.get('/orders', isAdmin, async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    
    try {
        let sql = `
            SELECT o.*,
                   u.email as customer_email,
                   COUNT(oi.id) as item_count,
                   SUM(oi.quantity * oi.price) as total_amount
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON o.id = oi.order_id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            sql += ' AND o.status = ?';
            params.push(status);
        }

        sql += ' GROUP BY o.id ORDER BY o.created_at DESC';
        
        const offset = (page - 1) * limit;
        sql += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [orders] = await db.promise().query(sql, params);
        const [total] = await db.promise().query(
            'SELECT COUNT(DISTINCT id) as count FROM orders' + (status ? ' WHERE status = ?' : ''),
            status ? [status] : []
        );

        res.json({
            orders,
            pagination: {
                total: total[0].count,
                page: parseInt(page),
                pages: Math.ceil(total[0].count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get customer management dashboard
router.get('/customers', isAdmin, async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;

    try {
        let sql = `
            SELECT u.*,
                   COUNT(o.id) as total_orders,
                   SUM(CASE WHEN o.status = 'completed' THEN oi.quantity * oi.price ELSE 0 END) as total_spent
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += ' AND (u.email LIKE ? OR u.username LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ' GROUP BY u.id ORDER BY total_spent DESC';
        
        const offset = (page - 1) * limit;
        sql += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [customers] = await db.promise().query(sql, params);
        const [total] = await db.promise().query('SELECT COUNT(*) as count FROM users');

        res.json({
            customers,
            pagination: {
                total: total[0].count,
                page: parseInt(page),
                pages: Math.ceil(total[0].count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;