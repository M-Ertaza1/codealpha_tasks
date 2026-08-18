// routes/userRoutes.js
// Public profile lookups, plus follow/unfollow (requires login).

const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/users/:username
// @desc    Get a public profile by username, including their posts
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 }).populate("user", "name username avatar");

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      followerCount: user.followers.length,
      followingCount: user.following.length,
      followers: user.followers,
      posts,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching profile", error: err.message });
  }
});

// @route   POST /api/users/:id/follow
// @desc    Follow another user (toggles: follows if not following, unfollows if already following)
router.post("/:id/follow", protect, async (req, res) => {
  try {
    const targetId = req.params.id;

    if (targetId === String(req.user._id)) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: "User not found" });

    const me = await User.findById(req.user._id);
    const alreadyFollowing = me.following.some((id) => String(id) === targetId);

    if (alreadyFollowing) {
      me.following = me.following.filter((id) => String(id) !== targetId);
      target.followers = target.followers.filter((id) => String(id) !== String(me._id));
    } else {
      me.following.push(targetId);
      target.followers.push(me._id);
    }

    await me.save();
    await target.save();

    res.json({ following: !alreadyFollowing, followerCount: target.followers.length });
  } catch (err) {
    res.status(500).json({ message: "Server error updating follow status", error: err.message });
  }
});

// @route   PUT /api/users/me
// @desc    Update your own bio / avatar
router.put("/me", protect, async (req, res) => {
  try {
    const { bio, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    res.json({ _id: user._id, name: user.name, username: user.username, bio: user.bio, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: "Server error updating profile", error: err.message });
  }
});

module.exports = router;
