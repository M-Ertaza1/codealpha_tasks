// js/common.js
// Loaded on every page. Holds things every page needs:
// - the backend API base URL
// - reading/writing the logged-in user from localStorage
// - the cart (also stored in localStorage, keyed by product id)
// - a small toast notification helper
// - updating the header nav to reflect login state + cart count

// CHANGE THIS when you deploy the backend somewhere other than localhost.
const API_BASE = "http://localhost:5000/api";

// ---------- Auth state ----------
function getAuth() {
  const raw = localStorage.getItem("basecamp_auth");
  return raw ? JSON.parse(raw) : null; // { _id, name, email, token }
}

function setAuth(data) {
  localStorage.setItem("basecamp_auth", JSON.stringify(data));
}

function clearAuth() {
  localStorage.removeItem("basecamp_auth");
}

function authHeaders() {
  const auth = getAuth();
  return auth ? { Authorization: `Bearer ${auth.token}` } : {};
}

// ---------- Cart state ----------
// Cart shape: { [productId]: { productId, name, price, image, quantity, stock } }
function getCart() {
  const raw = localStorage.getItem("basecamp_cart");
  return raw ? JSON.parse(raw) : {};
}

function saveCart(cart) {
  localStorage.setItem("basecamp_cart", JSON.stringify(cart));
  updateCartCount();
}

function cartItemCount() {
  const cart = getCart();
  return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart[product._id];
  const newQty = (existing ? existing.quantity : 0) + quantity;

  cart[product._id] = {
    productId: product._id,
    name: product.name,
    price: product.price,
    image: product.image,
    stock: product.stock,
    quantity: Math.min(newQty, product.stock), // never exceed available stock
  };
  saveCart(cart);
}

// ---------- UI helpers ----------
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
}

function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (el) el.textContent = cartItemCount();
}

function updateNavAuthState() {
  const auth = getAuth();
  const slot = document.getElementById("nav-auth-slot");
  if (!slot) return;

  if (auth) {
    slot.innerHTML = `
      <a href="orders.html">Orders</a>
      <a href="#" id="logout-link">Log out (${auth.name.split(" ")[0]})</a>
    `;
    document.getElementById("logout-link").addEventListener("click", (e) => {
      e.preventDefault();
      clearAuth();
      showToast("Logged out");
      setTimeout(() => (window.location.href = "index.html"), 600);
    });
  } else {
    slot.innerHTML = `<a href="login.html">Log in</a>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  updateNavAuthState();
});
