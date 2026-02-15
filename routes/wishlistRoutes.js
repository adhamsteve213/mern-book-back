import express from 'express';
import Wishlist from '../models/wishlistSchema.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all wishlists
router.get('/', async (req, res) => {
    try {
        const wishlists = await Wishlist.find().populate('userId products.productId');
        res.status(200).json(wishlists);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get wishlist by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.params.userId }).populate('products.productId');
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get a wishlist by ID
router.get('/:id', async (req, res) => {
    try {
        const wishlist = await Wishlist.findById(req.params.id).populate('userId products.productId');
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new wishlist
router.post('/', async (req, res) => {
    try {
        const { userId, products } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const newWishlist = new Wishlist({ userId, products });
        await newWishlist.save();
        res.status(201).json(newWishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /wishlist/add - add a product to a user's wishlist
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;
        if (!productId) return res.status(400).json({ message: 'Missing productId' });
        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            wishlist = new Wishlist({ userId, products: [{ productId }] });
            await wishlist.save();
            return res.status(201).json(wishlist);
        }
        const exists = wishlist.products.find(p => p.productId.toString() === productId);
        if (exists) return res.status(200).json(wishlist);
        wishlist.products.push({ productId });
        await wishlist.save();
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /wishlist/remove - remove product from wishlist
router.post('/remove', authMiddleware, async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;
        if (!productId) return res.status(400).json({ message: 'Missing productId' });
        const wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
        wishlist.products = wishlist.products.filter(p => p.productId.toString() !== productId);
        await wishlist.save();
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a wishlist by ID (add/remove products)
router.put('/:id', async (req, res) => {
    try {
        const { products } = req.body;
        const updatedWishlist = await Wishlist.findByIdAndUpdate(
            req.params.id,
            { products },
            { new: true }
        ).populate('userId products.productId');
        if (!updatedWishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }
        res.status(200).json(updatedWishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a wishlist by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedWishlist = await Wishlist.findByIdAndDelete(req.params.id);
        if (!deletedWishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }
        res.status(200).json({ message: 'Wishlist deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
