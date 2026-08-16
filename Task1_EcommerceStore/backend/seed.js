// seed.js
// Run this once (npm run seed) to fill your database with sample products
// so the store isn't empty when you demo it.

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");

const sampleProducts = [
  {
    name: "Ridgeline 40L Backpack",
    description: "A rugged 40-liter backpack built for multi-day trail trips, with a padded hip belt and rain cover.",
    price: 129.99,
    category: "Backpacks",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
    stock: 25,
  },
  {
    name: "2-Person Dome Tent",
    description: "Lightweight, weatherproof dome tent that sets up in under 5 minutes. Perfect for weekend campers.",
    price: 89.5,
    category: "Camping",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600",
    stock: 15,
  },
  {
    name: "Trailblazer Hiking Boots",
    description: "Waterproof leather hiking boots with reinforced ankle support for uneven terrain.",
    price: 149.0,
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600",
    stock: 30,
  },
  {
    name: "Insulated Flask 750ml",
    description: "Keeps drinks hot for 12 hours or cold for 24. Stainless steel, leak-proof lid.",
    price: 24.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600",
    stock: 60,
  },
  {
    name: "All-Weather Softshell Jacket",
    description: "Breathable, windproof softshell jacket designed for cold-weather hikes.",
    price: 99.99,
    category: "Apparel",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
    stock: 20,
  },
  {
    name: "Compact Camping Stove",
    description: "Foldable single-burner stove, boils water in under 3 minutes. Fits in one hand.",
    price: 34.5,
    category: "Camping",
    image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600",
    stock: 18,
  },
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log(`Seeded ${sampleProducts.length} products.`);
  mongoose.connection.close();
}

seed();
