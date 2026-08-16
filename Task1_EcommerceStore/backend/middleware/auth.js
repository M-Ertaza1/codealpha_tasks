// middleware/auth.js
// Protects routes that require a logged-in user.
// Expects a header:  Authorization: Bearer <token>

const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      token = authHeader.split(" ")[1];

      // Verify the token was signed by our server and hasn't expired.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user (minus password) to the request so later
      // route handlers know who's making the request.
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token provided" });
}

module.exports = { protect };
