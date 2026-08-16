// js/products.js
// Handles two things depending on which page it's loaded on:
// 1. The product grid + category filters on index.html
// 2. The single-product detail view on product.html

function renderProductCard(product) {
  return `
    <a class="card" href="product.html?id=${product._id}">
      <div class="thumb"><img src="${product.image}" alt="${product.name}" loading="lazy"></div>
      <div class="card-body">
        <span class="tag">${product.category}</span>
        <h3>${product.name}</h3>
        <div class="price">$${product.price.toFixed(2)}</div>
      </div>
    </a>
  `;
}

// ---------- Home page: product grid ----------
const grid = document.getElementById("product-grid");
if (grid) {
  let allProducts = [];

  async function loadProducts(category = "") {
    grid.innerHTML = `<p>Loading products…</p>`;
    try {
      const url = category
        ? `${API_BASE}/products?category=${encodeURIComponent(category)}`
        : `${API_BASE}/products`;
      const res = await fetch(url);
      const products = await res.json();
      allProducts = products;

      if (products.length === 0) {
        grid.innerHTML = `<div class="empty-state"><h3>No products found</h3><p>Try a different filter.</p></div>`;
        return;
      }
      grid.innerHTML = products.map(renderProductCard).join("");
    } catch (err) {
      grid.innerHTML = `<div class="empty-state"><h3>Couldn't load products</h3><p>Is the backend server running on ${API_BASE}?</p></div>`;
    }
  }

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      loadProducts(chip.dataset.category);
    });
  });

  loadProducts();
}

// ---------- Product detail page ----------
const detailRoot = document.getElementById("product-detail");
if (detailRoot) {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  let currentProduct = null;
  let quantity = 1;

  async function loadProduct() {
    if (!productId) {
      detailRoot.innerHTML = `<p>No product specified.</p>`;
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/products/${productId}`);
      if (!res.ok) throw new Error("Not found");
      currentProduct = await res.json();
      renderDetail();
    } catch (err) {
      detailRoot.innerHTML = `<div class="empty-state"><h3>Product not found</h3><a href="index.html" class="btn btn-outline">Back to shop</a></div>`;
    }
  }

  function renderDetail() {
    const p = currentProduct;
    document.title = `${p.name} — Basecamp Supply Co.`;
    detailRoot.innerHTML = `
      <div class="detail-image"><img src="${p.image}" alt="${p.name}"></div>
      <div>
        <span class="tag">${p.category}</span>
        <h1>${p.name}</h1>
        <p>${p.description}</p>
        <div class="price">$${p.price.toFixed(2)}</div>
        <div class="qty-control">
          <button id="qty-minus" aria-label="Decrease quantity">−</button>
          <span id="qty-value">1</span>
          <button id="qty-plus" aria-label="Increase quantity">+</button>
        </div>
        <div class="stock-note">${p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}</div>
        <br>
        <button class="btn btn-primary" id="add-to-cart-btn" ${p.stock === 0 ? "disabled" : ""}>
          Add to cart
        </button>
      </div>
    `;

    document.getElementById("qty-minus").addEventListener("click", () => {
      if (quantity > 1) quantity--;
      document.getElementById("qty-value").textContent = quantity;
    });
    document.getElementById("qty-plus").addEventListener("click", () => {
      if (quantity < currentProduct.stock) quantity++;
      document.getElementById("qty-value").textContent = quantity;
    });
    document.getElementById("add-to-cart-btn").addEventListener("click", () => {
      addToCart(currentProduct, quantity);
      showToast(`Added ${quantity} × ${currentProduct.name} to cart`);
    });
  }

  loadProduct();
}
