// js/auth.js
// Handles the register and login forms.

function showFormError(message) {
  const el = document.getElementById("form-error");
  el.textContent = message;
  el.classList.add("visible");
}

const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim().toLowerCase();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });
      const data = await res.json();

      if (!res.ok) return showFormError(data.message || "Registration failed");

      setAuth(data);
      showToast(`Welcome, ${data.name.split(" ")[0]}!`);
      setTimeout(() => (window.location.href = "index.html"), 500);
    } catch (err) {
      showFormError("Couldn't reach the server. Is the backend running?");
    }
  });
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) return showFormError(data.message || "Login failed");

      setAuth(data);
      showToast(`Welcome back, ${data.name.split(" ")[0]}!`);
      setTimeout(() => (window.location.href = "index.html"), 500);
    } catch (err) {
      showFormError("Couldn't reach the server. Is the backend running?");
    }
  });
}
