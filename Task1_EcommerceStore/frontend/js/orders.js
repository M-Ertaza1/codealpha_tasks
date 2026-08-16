// js/orders.js
// Fetches and renders the logged-in user's past orders on orders.html.

const ordersRoot = document.getElementById("orders-root");
if (ordersRoot) {
  async function loadOrders() {
    const auth = getAuth();
    if (!auth) {
      window.location.href = "login.html";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/orders/my`, { headers: authHeaders() });
      const orders = await res.json();

      if (orders.length === 0) {
        ordersRoot.innerHTML = `
          <div class="empty-state">
            <h3>No orders yet</h3>
            <p>Once you check out, your orders will show up here.</p>
            <a href="index.html" class="btn btn-primary">Browse products</a>
          </div>
        `;
        return;
      }

      ordersRoot.innerHTML = orders
        .map(
          (order) => `
        <div class="order-card">
          <div class="order-head">
            <div>
              <strong>Order #${order._id.slice(-6).toUpperCase()}</strong>
              <div style="font-size:0.85rem;color:#6b7160;">
                ${new Date(order.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
            <span class="status-badge">${order.status}</span>
          </div>
          ${order.items
            .map((item) => `<div class="summary-row"><span>${item.quantity} × ${item.name}</span><span>$${(item.price * item.quantity).toFixed(2)}</span></div>`)
            .join("")}
          <div class="summary-row total"><span>Total</span><span>$${order.totalAmount.toFixed(2)}</span></div>
        </div>
      `
        )
        .join("");
    } catch (err) {
      ordersRoot.innerHTML = `<div class="empty-state"><h3>Couldn't load orders</h3><p>Is the backend server running?</p></div>`;
    }
  }

  loadOrders();
}
