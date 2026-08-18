// routes/postRoutes.js
// The feed, creating posts, liking, and comments all live here since
// comments are always accessed in the context of a post.

const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/posts
// @desc    Get the feed — newest posts first. Optional ?user=<id> to filter
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.user) filter.user = req.query.user;

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "name username avatar")
      .limit(100);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching feed", error: err.message });
  }
});

// @route   GET /api/posts/:id
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user", "name username avatar");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching post", error: err.message });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
router.post("/", protect, async (req, res) => {
  try {
    const { content, image } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content can't be empty" });
    }

    const post = await Post.create({ user: req.user._id, content, image: image || null });
    const populated = await post.populate("user", "name username avatar");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error creating post", error: err.message });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete your own post (and its comments)
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (String(post.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting post", error: err.message });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Toggle a like on a post
router.post("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.some((id) => String(id) === String(req.user._id));

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => String(id) !== String(req.user._id));
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json({ liked: !alreadyLiked, likeCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: "Server error updating like", error: err.message });
  }
});

// @route   GET /api/posts/:id/comments
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: 1 })
      .populate("user", "name username avatar");
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching comments", error: err.message });
  }
});

// @route   POST /api/posts/:id/comments
router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment can't be empty" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({ post: post._id, user: req.user._id, text });
    post.commentCount += 1;
    await post.save();

    const populated = await comment.populate("user", "name username avatar");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error posting comment", error: err.message });
  }
});

module.exports = router;
