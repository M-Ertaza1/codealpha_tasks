// server.js
// Entry point for the backend. Sets up Express, connects to MongoDB,
// and wires up the route files.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Fieldnote API is running" });
});

// Optional: serve the frontend from the same server if you don't split deployment.
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
