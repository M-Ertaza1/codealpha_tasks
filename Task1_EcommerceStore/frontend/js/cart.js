// js/cart.js
// Renders the cart page (cart.html) from localStorage, lets the user
// adjust quantities or remove items, and submits the checkout form
// to the backend to create a real Order.

const cartRoot = document.getElementById("cart-root");
if (cartRoot) {
  function renderCart() {
    const cart = getCart();
    const items = Object.values(cart);

    if (items.length === 0) {
      cartRoot.innerHTML = `
        <div class="empty-state">
          <h3>Your cart is empty</h3>
          <p>Find something for your next trip.</p>
          <a href="index.html" class="btn btn-primary">Browse products</a>
        </div>
      `;
      return;
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    cartRoot.innerHTML = `
      <div class="cart-layout">
        <div>
          ${items
            .map(
              (item) => `
            <div class="cart-item" data-id="${item.productId}">
              <img src="${item.image}" alt="${item.name}">
              <div class="info">
                <strong>${item.name}</strong>
                <div class="qty-control" style="margin: 8px 0;">
                  <button class="dec" aria-label="Decrease quantity">−</button>
                  <span>${item.quantity}</span>
                  <button class="inc" aria-label="Increase quantity">+</button>
                </div>
                <button class="remove-btn">Remove</button>
              </div>
              <div class="price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          `
            )
            .join("")}
        </div>

        <div class="summary-box">
          <h3>Order summary</h3>
          <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
          <div class="summary-row"><span>Shipping</span><span>Free</span></div>
          <div class="summary-row total"><span>Total</span><span>$${subtotal.toFixed(2)}</span></div>

          ${
            getAuth()
              ? `<button id="checkout-btn" class="btn btn-primary btn-block">Proceed to checkout</button>`
              : `<p class="form-note" style="margin-top:0">
                   <a href="login.html" class="btn btn-outline btn-block">Log in to checkout</a>
                 </p>`
          }
        </div>
      </div>

      <div id="checkout-modal" style="display:none;">
        <div class="auth-shell">
          <h2>Shipping details</h2>
          <div id="form-error" class="form-error"></div>
          <form id="checkout-form">
            <div class="form-group">
              <label for="fullName">Full name</label>
              <input id="fullName" required>
            </div>
            <div class="form-group">
              <label for="street">Street address</label>
              <input id="street" required>
            </div>
            <div class="form-group">
              <label for="city">City</label>
              <input id="city" required>
            </div>
            <div class="form-group">
              <label for="postalCode">Postal code</label>
              <input id="postalCode" required>
            </div>
            <div class="form-group">
              <label for="country">Country</label>
              <input id="country" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Place order — $${subtotal.toFixed(2)}</button>
          </form>
        </div>
      </div>
    `;

    attachCartItemHandlers();

    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        document.getElementById("checkout-modal").style.display = "block";
        checkoutBtn.scrollIntoView({ behavior: "smooth" });
      });
    }

    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) checkoutForm.addEventListener("submit", handleCheckout);
  }

  function attachCartItemHandlers() {
    document.querySelectorAll(".cart-item").forEach((row) => {
      const id = row.dataset.id;
      const cart = getCart();
      const item = cart[id];

      row.querySelector(".inc").addEventListener("click", () => {
        if (item.quantity < item.stock) {
          item.quantity++;
          saveCart(cart);
          renderCart();
        } else {
          showToast("No more stock available");
        }
      });
      row.querySelector(".dec").addEventListener("click", () => {
        item.quantity = Math.max(1, item.quantity - 1);
        saveCart(cart);
        renderCart();
      });
      row.querySelector(".remove-btn").addEventListener("click", () => {
        delete cart[id];
        saveCart(cart);
        renderCart();
      });
    });
  }

  async function handleCheckout(e) {
    e.preventDefault();
    const cart = getCart();
    const items = Object.values(cart).map((i) => ({ productId: i.productId, quantity: i.quantity }));

    const shippingAddress = {
      fullName: document.getElementById("fullName").value.trim(),
      street: document.getElementById("street").value.trim(),
      city: document.getElementById("city").value.trim(),
      postalCode: document.getElementById("postalCode").value.trim(),
      country: document.getElementById("country").value.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ items, shippingAddress }),
      });
      const data = await res.json();

      if (!res.ok) {
        const err = document.getElementById("form-error");
        err.textContent = data.message || "Checkout failed";
        err.classList.add("visible");
        return;
      }

      localStorage.removeItem("basecamp_cart");
      showToast("Order placed! Check your order history.");
      setTimeout(() => (window.location.href = "orders.html"), 700);
    } catch (err) {
      showToast("Couldn't reach the server. Is the backend running?");
    }
  }

  renderCart();
}
