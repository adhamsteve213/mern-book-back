import express from 'express';
import CartItem from '../models/cartSchema.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all cart items
router.get('/', async (req, res) => {
    try {
        const cartItems = await CartItem.find().populate('productId userId');
        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get cart items by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const cartItems = await CartItem.find({ userId: req.params.userId }).populate('productId');
        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get a cart item by ID
router.get('/:id', async (req, res) => {
    try {
        const cartItem = await CartItem.findById(req.params.id).populate('productId userId');
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        res.status(200).json(cartItem);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new cart item
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { productId, quantity, userId } = req.body;
        if (!productId || !quantity || !userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let cartItem = await CartItem.findOne({ userId, productId });

        if (cartItem) {
            // If item exists, update quantity
            cartItem.quantity += quantity;
            await cartItem.save();
            res.status(200).json(cartItem);
        } else {
            // If item does not exist, create it
            const newCartItem = new CartItem({ productId, quantity, userId });
            await newCartItem.save();
            res.status(201).json(newCartItem);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a cart item by ID
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { quantity, price } = req.body;
        const updatedCartItem = await CartItem.findByIdAndUpdate(
            req.params.id,
            { quantity, price },
            { new: true }
        ).populate('productId userId');
        if (!updatedCartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        res.status(200).json(updatedCartItem);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a cart item by ID
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const deletedCartItem = await CartItem.findByIdAndDelete(req.params.id);
        if (!deletedCartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        res.status(200).json({ message: 'Cart item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a cart item by user and product ID
router.delete('/user/:userId/product/:productId', authMiddleware, async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const deletedCartItem = await CartItem.findOneAndDelete({ userId, productId });
        if (!deletedCartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        res.status(200).json({ message: 'Cart item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
