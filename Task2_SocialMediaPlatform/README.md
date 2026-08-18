# Fieldnote — Mini Social Media Platform
### CodeAlpha Full Stack Development — Task 2

A working social app: user profiles with follow/unfollow, a feed of
short posts, likes, and comments. Same stack as Task 1 (Node.js/Express +
MongoDB + plain HTML/CSS/JS) — most of the auth code is carried over
almost unchanged, since you already built and understand it.

---

## 1. What's new compared to Task 1

Task 1 taught you CRUD (create/read/update/delete) on products and orders.
Task 2 adds a genuinely new concept: **relationships between users** —
who follows whom, and who liked what. A few things worth understanding:

- **Followers/following** are stored as arrays of user IDs directly on
  the `User` document (see `models/User.js`). For a small app like this,
  that's simpler than a separate "Follow" collection — but note it means
  every follow/unfollow touches *two* user documents (you, and the
  person you're following). See `routes/userRoutes.js`'s `/follow` route.
- **Likes** work the same way, but on `Post` instead of `User` — an
  array of user IDs on each post. Checking "did I already like this"
  is just an array search, no extra query needed.
- **Comments are their own collection**, not embedded inside `Post`,
  because a popular post could have hundreds of comments — embedding
  them would make the post document huge every time you just want the
  post text. Instead we keep a running `commentCount` on the post (fast
  to display) and only fetch actual comments when someone opens the post.

## 2. Project structure

```
Task2_SocialMediaPlatform/
├── backend/
│   ├── config/db.js
│   ├── models/          → User (with followers/following), Post, Comment
│   ├── routes/           → auth, users (profile + follow), posts (feed + likes + comments)
│   ├── middleware/auth.js
│   ├── seed.js            → 3 sample users, posts, and one comment
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── index.html          → feed + "new post" composer
    ├── profile.html         → bio, stats, follow button, their posts
    ├── post.html             → single post + comment thread
    ├── login.html / register.html
    ├── css/style.css
    └── js/
        ├── common.js          → API config, auth storage, and SHARED post-card rendering
        ├── auth.js
        ├── feed.js
        ├── profile.js
        └── post.js
```

Notice `common.js` carries more weight here than in Task 1 — `renderPostCard`,
`escapeHtml`, and `attachLikeHandlers` live there because the feed,
profile, and single-post pages all need to render post cards the same way.
This is a good habit: when you catch yourself copy-pasting a chunk of
rendering logic across pages, that's the signal to pull it into a shared file.

## 3. Running it locally

### Step 1 — MongoDB
You can reuse the **same** Atlas cluster from Task 1 — just point
`MONGO_URI` at a different database name (`fieldnote_social` instead of
`basecamp_store`) so the data doesn't mix.

### Step 2 — Backend
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `MONGO_URI` and `JWT_SECRET` in `.env`. Note the default `PORT`
is **5001** (not 5000) so you can run this alongside Task 1 if you want.

```bash
npm run seed     # 3 users, 5 posts, 1 comment
npm run dev
```
Visit `http://localhost:5001/api/health` to confirm it's running.

### Step 3 — Frontend
```bash
cd frontend
npx serve .
```
Open the URL it gives you. `frontend/js/common.js` has
`const API_BASE = "http://localhost:5001/api"` — update this if you
change the backend port or deploy it elsewhere.

**Try logging in with a seeded account:** `amara@example.com` / `password123`
(or `kenji@...` / `priya@...`, same password) to see follows and a comment
already in place, or just register your own.

## 4. What to test before submitting

- [ ] Register a new account (try a duplicate username — should be rejected)
- [ ] Post something from the composer, see it appear in the feed
- [ ] Like a post, refresh the page, confirm the like persisted
- [ ] Visit another user's profile, follow them, confirm follower count updates
- [ ] Open a post's detail page, add a comment, confirm it appears immediately
- [ ] Confirm you can't follow yourself (try visiting your own profile)

## 5. Ideas to extend it (optional)

- Let users edit their bio/avatar (the backend route `PUT /api/users/me`
  already exists — you'd just need a settings page in the frontend)
- Add a "following feed" toggle (posts only from people you follow) —
  hint: `GET /api/posts?user=<id>` already supports filtering by one
  user, you'd extend it to accept a list
- Add image uploads for posts instead of URL-only
- Add pagination instead of the current `.limit(100)` cap

## 6. Deployment
Same approach as Task 1 — Render/Railway for the backend, Vercel/Netlify
for the frontend. Remember to update `API_BASE` in `common.js` before
deploying the frontend.

---

*Built as a learning project for the CodeAlpha Full Stack Development internship.*
