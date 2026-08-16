// config/db.js
// Handles the connection to MongoDB using Mongoose.
// Kept in its own file so server.js stays clean and this logic is reusable.

const mongoose = require("mongoose");

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    // Exit the process if we can't connect to the DB — the app is useless without it.
    process.exit(1);
  }
}

module.exports = connectDB;
