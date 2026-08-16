// routes/orderRoutes.js
// Handles checkout (creating an order) and viewing order history.
// All routes here require the user to be logged in.

const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/orders
// @desc    Place an order (checkout). Expects:
//          { items: [{ productId, quantity }], shippingAddress: {...} }
router.post("/", protect, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Rebuild each order line from the DATABASE, not from whatever the
    // client sent — this prevents someone from tampering with prices
    // in their browser before checking out.
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for "${product.name}"` });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });

      totalAmount += product.price * item.quantity;

      // Reduce stock now that the order is confirmed.
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error while placing order", error: err.message });
  }
});

// @route   GET /api/orders/my
// @desc    Get the logged-in user's own order history
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching orders", error: err.message });
  }
});

module.exports = router;
