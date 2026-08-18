// routes/authRoutes.js
// Handles registration and login. Same JWT pattern as Task 1, but users
// now also pick a username (used in profile URLs and @mentions-style display).

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
  };
}

// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const existing = await User.findOne({ $or: [{ email }, { username: username.toLowerCase() }] });
    if (existing) {
      return res.status(400).json({
        message: existing.email === email ? "An account with this email already exists" : "That username is taken",
      });
    }

    const user = await User.create({ name, username, email, password });

    res.status(201).json({ ...publicUser(user), token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: "Server error while registering", error: err.message });
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({ ...publicUser(user), token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: "Server error while logging in", error: err.message });
  }
});

module.exports = router;
