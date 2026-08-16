// routes/productRoutes.js
// Public routes for browsing products, plus a basic create route
// (any logged-in user can add a product for demo purposes — in a real
// app you'd restrict this to an "admin" role).

const express = require("express");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products, optionally filtered by category or search text
// Example: /api/products?category=Camping&search=tent
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" }; // case-insensitive

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching products", error: err.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get a single product's details
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching product", error: err.message });
  }
});

// @route   POST /api/products
// @desc    Create a new product (requires login)
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;
    const product = await Product.create({ name, description, price, category, image, stock });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: "Error creating product", error: err.message });
  }
});

module.exports = router;
