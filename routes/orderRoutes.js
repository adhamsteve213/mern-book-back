import express from 'express';
import Order from '../models/orderSchema.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().populate('userId checkoutId items.productId');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get orders by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).populate('checkoutId items.productId');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get an order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('userId checkoutId items.productId');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new order
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { userId, checkoutId, items, totalAmount, shippingAddress } = req.body;
        if (!userId || !checkoutId || !items || !totalAmount || !shippingAddress) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const newOrder = new Order({ userId, checkoutId, items, totalAmount, shippingAddress });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update an order by ID
router.put('/:id', async (req, res) => {
    try {
        const { items, totalAmount, status, shippingAddress } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { items, totalAmount, status, shippingAddress },
            { new: true }
        ).populate('userId checkoutId items.productId');
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete an order by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
