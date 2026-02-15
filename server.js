import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
// Removed passport/session (OAuth) support as we use manual JWT login now
// './config/passport.js' is no longer required after removing OAuth support
import ConnectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
dotenv.config();

const app = express();

// Connect to the database
ConnectDB()
  .then(() => {
    console.log("Connected to the database");

    // Enable CORS
    app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Parse JSON requests
    app.use(express.json());

    // Serve uploaded files statically
    app.use('/uploads', express.static('uploads'));

    // No session or passport middleware - manual JWT authentication only

    const port = process.env.PORT || 5000;
    
    // Routes
    app.use("/users", userRoutes);
    app.use("/products", productRoutes);
    app.use("/cart", cartRoutes);
    app.use("/checkout", checkoutRoutes);
    app.use("/orders", orderRoutes);
    app.use("/wishlist", wishlistRoutes);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });