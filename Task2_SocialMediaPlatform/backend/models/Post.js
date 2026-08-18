// models/Post.js
// A single post in the feed. Keeps a like-count-friendly array of user ids
// (so we can check "did this user already like this post" cheaply) and a
// denormalized commentCount so the feed doesn't need to count comments
// separately for every post.

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 500 },
    image: { type: String, default: null }, // optional image URL
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
