// seed.js
// Populates the database with a few sample users and posts so the feed
// isn't empty on first run. Run with: npm run seed

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");

const sampleUsers = [
  {
    name: "Amara Osei",
    username: "amara",
    email: "amara@example.com",
    password: "password123",
    bio: "Notebooks, film photos, and long walks.",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=amara",
  },
  {
    name: "Kenji Watanabe",
    username: "kenji",
    email: "kenji@example.com",
    password: "password123",
    bio: "Collecting small moments before they disappear.",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=kenji",
  },
  {
    name: "Priya Nair",
    username: "priya",
    email: "priya@example.com",
    password: "password123",
    bio: "Field notes from a slow life.",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=priya",
  },
];

const samplePostText = [
  "Rain on the window all morning. Good excuse to stay in and read.",
  "Found a tiny used bookshop two streets over. Spent an hour there.",
  "First cup of coffee outside this year. Small win.",
  "Rewrote the same paragraph four times. Finally happy with it.",
  "Long walk, no destination. Best kind.",
];

async function seed() {
  await connectDB();

  await Comment.deleteMany({});
  await Post.deleteMany({});
  await User.deleteMany({});

  const createdUsers = [];
  for (const u of sampleUsers) {
    createdUsers.push(await User.create(u));
  }

  // Make them follow each other a bit, so the "followers" feature has data to show.
  createdUsers[0].following.push(createdUsers[1]._id);
  createdUsers[1].followers.push(createdUsers[0]._id);
  createdUsers[1].following.push(createdUsers[2]._id);
  createdUsers[2].followers.push(createdUsers[1]._id);
  for (const u of createdUsers) await u.save();

  const createdPosts = [];
  for (let i = 0; i < samplePostText.length; i++) {
    const author = createdUsers[i % createdUsers.length];
    createdPosts.push(await Post.create({ user: author._id, content: samplePostText[i] }));
  }

  // A couple of sample comments.
  await Comment.create({ post: createdPosts[0]._id, user: createdUsers[1]._id, text: "This is such a mood." });
  createdPosts[0].commentCount += 1;
  await createdPosts[0].save();

  console.log(`Seeded ${createdUsers.length} users and ${createdPosts.length} posts.`);
  console.log(`Sample login: amara@example.com / password123`);
  mongoose.connection.close();
}

seed();
