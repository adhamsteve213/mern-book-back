import express from 'express';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/authMiddleware.js';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';
import Product from '../models/productSchema.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// multer setup
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadDir = 'uploads/';
		if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
		cb(null, uniqueName);
	}
});
const upload = multer({ storage });

// GET /products - public list
router.get('/', async (req, res) => {
	try {
		const products = await Product.find();
		res.status(200).json({ products });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
});

// GET /products/:id - public detail
router.get('/:id', async (req, res) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return res.status(400).json({ message: 'Invalid product ID' });
		}
		const product = await Product.findById(req.params.id);
		if (!product) return res.status(404).json({ message: 'Product not found' });
		res.status(200).json({ product });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
});

// POST /products - admin only
router.post('/', authMiddleware, adminAuthMiddleware, async (req, res) => {
	try {
		const { title, description, price, image, inStock, category } = req.body;
		const newProduct = new Product({ title, description, price, image, inStock, category });
		const saved = await newProduct.save();
		res.status(201).json({ product: saved });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
});

// POST /products/upload - admin only - upload image
router.post('/upload', authMiddleware, adminAuthMiddleware, upload.single('image'), async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
		// Returning path relative to server
		const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
		res.status(201).json({ imageUrl });
	} catch (err) {
		res.status(500).json({ message: 'Upload error', error: err.message });
	}
});

// PUT /products/:id - admin only
router.put('/:id', authMiddleware, adminAuthMiddleware, async (req, res) => {
	try {
		const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!updated) return res.status(404).json({ message: 'Product not found' });
		res.status(200).json({ product: updated });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
});

// DELETE /products/:id - admin only
router.delete('/:id', authMiddleware, adminAuthMiddleware, async (req, res) => {
	try {
		const deleted = await Product.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ message: 'Product not found' });
		res.status(200).json({ message: 'Product deleted' });
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
});

export default router;
