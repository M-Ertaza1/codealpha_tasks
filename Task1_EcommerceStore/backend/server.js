// server.js
// Entry point for the backend. Sets up Express, connects to MongoDB,
// and wires up the route files.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// --- Middleware ---
app.use(cors()); // allows the frontend (different origin) to call this API
app.use(express.json()); // parses incoming JSON request bodies into req.body

// --- Connect to MongoDB ---
connectDB();

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Simple health check — useful once you deploy, to confirm the server is up.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Basecamp Supply Co. API is running" });
});

// --- Serve the frontend (optional, for single-server deployment) ---
// If you deploy frontend and backend separately (recommended while learning),
// you can ignore/remove this block. It's here so the whole app also works
// from a single server if you prefer that later.
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

// --- Global error handler (catches anything that slips past route try/catch) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
