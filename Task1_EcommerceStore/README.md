# Basecamp Supply Co. — Simple E-commerce Store
### CodeAlpha Full Stack Development — Task 1

A working e-commerce store: product listing, product detail, cart, user
registration/login, and order checkout. Built with Node.js/Express +
MongoDB on the backend, and plain HTML/CSS/JavaScript on the frontend
(no framework — deliberately, so you can see exactly what's happening).

---

## 1. Project structure

```
CodeAlpha_EcommerceStore/
├── backend/
│   ├── config/db.js          → MongoDB connection
│   ├── models/                → Mongoose schemas (User, Product, Order)
│   ├── routes/                → Express route handlers (auth, products, orders)
│   ├── middleware/auth.js     → JWT "protect" middleware for logged-in-only routes
│   ├── seed.js                → fills the DB with sample products
│   ├── server.js              → app entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html              → home page / product grid
    ├── product.html            → single product detail
    ├── cart.html                → cart + checkout
    ├── login.html / register.html
    ├── orders.html              → order history
    ├── css/style.css
    └── js/
        ├── common.js            → shared: API base URL, auth/cart storage, nav, toast
        ├── auth.js              → register/login form handling
        ├── products.js          → product grid + detail page
        ├── cart.js               → cart rendering + checkout
        └── orders.js             → order history page
```

## 2. How the pieces fit together (read this before coding)

- **MongoDB** stores three collections: `users`, `products`, `orders`.
- **Express routes** are the API — they're just URLs your frontend calls
  with `fetch()`. E.g. `GET /api/products` returns JSON, it does not
  return HTML.
- **JWT (JSON Web Token)** is how the backend "remembers" you're logged
  in without storing sessions. On login, the server hands your browser
  a signed token. Your browser stores it (in `localStorage`) and sends
  it back in an `Authorization: Bearer <token>` header on every request
  that needs to know who you are (checkout, order history).
- **The cart lives entirely in the browser** (`localStorage`), not the
  database — that's normal for e-commerce sites. It only becomes a real
  database record (an `Order`) at checkout.
- **Stock and prices are re-checked server-side at checkout** (see
  `orderRoutes.js`) — never trust prices sent from the browser, since a
  user could edit them in dev tools.

## 3. Running it locally

### Step 1 — Get a MongoDB database (free)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free "M0" cluster.
3. Under **Database Access**, create a user with a password.
4. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) for development.
5. Click **Connect → Drivers**, copy the connection string — it looks like
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`

### Step 2 — Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Open `.env` and paste your MongoDB connection string into `MONGO_URI`
(add a database name at the end, e.g. `.../basecamp_store?retryWrites=true`).
Set `JWT_SECRET` to any long random string.

```bash
npm run seed     # adds 6 sample products to your database
npm run dev      # starts the server with auto-restart (needs nodemon, already in package.json)
```
You should see `Server running on http://localhost:5000` and
`MongoDB connected: ...`. Visit `http://localhost:5000/api/health` in
your browser — you should see a small JSON response confirming it's alive.

### Step 3 — Frontend
The frontend is plain static files — no build step. Easiest way to run it:

```bash
cd frontend
npx serve .
```
(or use the VS Code "Live Server" extension, or Python's
`python3 -m http.server 5500`). Then open the URL it gives you
(e.g. `http://localhost:5500` or `http://localhost:3000`).

**Important:** `frontend/js/common.js` has `const API_BASE = "http://localhost:5000/api"`.
If your backend runs on a different port or you deploy it elsewhere,
update this one line.

## 4. What to test manually before submitting

- [ ] Register a new account
- [ ] Log in / log out
- [ ] Browse products, filter by category
- [ ] View a product's detail page, change quantity, add to cart
- [ ] View cart, adjust quantities, remove an item
- [ ] Check out (only works when logged in) — confirm the order appears
      in **Orders**
- [ ] Confirm stock decreases in the database after an order (check
      Atlas's "Browse Collections" view)

## 5. Ideas to extend it (optional, but strengthens your submission)

- Add an "admin" flag to `User` and restrict `POST /api/products` to admins only
- Add product image upload instead of URLs (using `multer`)
- Add pagination to the product grid
- Add a simple order-status update endpoint (Pending → Shipped) for admins
- Add input validation with a library like `express-validator`

## 6. Deployment (for your submission video/repo)

- **Backend:** [Render.com](https://render.com) or [Railway.app](https://railway.app) — both have free tiers,
  connect your GitHub repo, set the same environment variables from `.env`.
- **Frontend:** [Vercel](https://vercel.com) or [Netlify](https://netlify.com) — drag-and-drop the `frontend` folder,
  or connect the repo. Remember to update `API_BASE` in `common.js` to
  your deployed backend URL before deploying the frontend.

## 7. CodeAlpha submission checklist

Per the internship instructions PDF:
- [ ] Push this project to a GitHub repo named `CodeAlpha_EcommerceStore`
- [ ] Record a short video walking through the app (register → browse →
      cart → checkout → order history) and explaining your code
- [ ] Post the video on LinkedIn, tagging **@CodeAlpha**, with your GitHub link
- [ ] Submit through the form shared in your WhatsApp group
- [ ] Remember: you need **2–3 completed tasks total** for the certificate —
      this is Task 1. Task 2 (Social Media Platform) reuses your auth
      code almost entirely, so it'll go faster.

---

*Built as a learning project for the CodeAlpha Full Stack Development internship.*
