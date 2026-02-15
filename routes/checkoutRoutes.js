import express from 'express';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import Checkout from '../models/checkoutSchema.js';
import authMiddleware from '../middleware/authMiddleware.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Create a payment intent for credit card payments (must be before /:id route)
router.post('/payment-intent', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body; // amount in cents
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
  }
});

// Get all checkouts
router.get('/', async (req, res) => {
  try {
    const checkouts = await Checkout.find().populate('userId items.productId');
    res.status(200).json(checkouts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get checkouts by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const checkouts = await Checkout.find({ userId: req.params.userId }).populate('items.productId');
    res.status(200).json(checkouts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a checkout by ID
router.get('/:id', async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id).populate('userId items.productId');
    if (!checkout) {
      return res.status(404).json({ message: 'Checkout not found' });
    }
    res.status(200).json(checkout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new checkout
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      userId,
      FirstName,
      MiddleName,
      LastName,
      Address,
      ZipCode,
      PhoneNumber,
      PaymentMethod,
      totalAmount,
      items
    } = req.body;

    // Basic validation
    if (!userId || !FirstName || !LastName || !Address || !ZipCode || !PhoneNumber || !PaymentMethod || !items) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid total amount' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array cannot be empty' });
    }
    for (let item of items) {
      if (!item.productId) {
        return res.status(400).json({ message: 'Missing productId in items.' });
      }
    }

    const newCheckout = new Checkout({
      userId,
      FirstName,
      MiddleName,
      LastName,
      Address,
      ZipCode,
      PhoneNumber,
      PaymentMethod,
      totalAmount,
      items
    });
    await newCheckout.save();
    res.status(201).json(newCheckout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a checkout by ID
router.put('/:id', async (req, res) => {
  try {
    const { FirstName, MiddleName, LastName, Address, PhoneNumber, PaymentMethod, totalAmount, items } = req.body;
    const updatedCheckout = await Checkout.findByIdAndUpdate(
      req.params.id,
      { FirstName, MiddleName, LastName, Address, PhoneNumber, PaymentMethod, totalAmount, items },
      { new: true }
    ).populate('userId items.productId');

    if (!updatedCheckout) {
      return res.status(404).json({ message: 'Checkout not found' });
    }
    res.status(200).json(updatedCheckout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a checkout by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedCheckout = await Checkout.findByIdAndDelete(req.params.id);
    if (!deletedCheckout) {
      return res.status(404).json({ message: 'Checkout not found' });
    }
    res.status(200).json({ message: 'Checkout deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;