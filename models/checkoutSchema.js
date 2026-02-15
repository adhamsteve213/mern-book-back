import express from 'express';
import mongoose from 'mongoose';
const checkoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    FirstName: {
        type: String,
        required: true,
    },
    MiddleName: {
        type: String,
        required: false,
    },
    LastName: {
        type: String,
        required: true,
    },
        Address: {
            type: String,
            required: true,
        },
        ZipCode: {
            type: String,
            required: true,
        },
        PhoneNumber: {
            type: String,
            required: true,
        },
    PaymentMethod : {
        type: String,
        required: true,
        enum: ['Cash on Delivery', 'Credit Card', 'Debit Card', 'PayPal', 'Cash'],
    },
    creditCard: {
        cardNumber: {
            type: String,
        },
        expiryDate: {
            type: String,
        },
        cvv: {
            type: String,
        },
        cardHolderName: {
            type: String,
        },
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    items: [
        {
            productId: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Checkout', checkoutSchema);