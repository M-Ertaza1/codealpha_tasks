// js/common.js
// Loaded on every page. Same role as Task 1's common.js: API base URL,
// reading/writing the logged-in user, a toast helper, and keeping the
// header nav in sync with login state.

// CHANGE THIS when you deploy the backend somewhere other than localhost.
const API_BASE = "http://localhost:5001/api";

function getAuth() {
  const raw = localStorage.getItem("fieldnote_auth");
  return raw ? JSON.parse(raw) : null; // { _id, name, username, email, avatar, token }
}

function setAuth(data) {
  localStorage.setItem("fieldnote_auth", JSON.stringify(data));
}

function clearAuth() {
  localStorage.removeItem("fieldnote_auth");
}

function authHeaders() {
  const auth = getAuth();
  return auth ? { Authorization: `Bearer ${auth.token}` } : {};
}

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

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  const units = [
    ["year", 31536000], ["month", 2592000], ["day", 86400],
    ["hour", 3600], ["minute", 60],
  ];
  for (const [name, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function updateNavAuthState() {
  const auth = getAuth();
  const slot = document.getElementById("nav-auth-slot");
  if (!slot) return;

  if (auth) {
    slot.innerHTML = `
      <a href="profile.html?username=${auth.username}">${auth.name.split(" ")[0]}</a>
      <a href="#" id="logout-link">Log out</a>
    `;
    document.getElementById("logout-link").addEventListener("click", (e) => {
      e.preventDefault();
      clearAuth();
      showToast("Logged out");
      setTimeout(() => (window.location.href = "index.html"), 500);
    });
  } else {
    slot.innerHTML = `<a href="login.html">Log in</a>`;
  }
}

// Minimal HTML-escaping so post/comment content can't inject markup.
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Shared post card markup — used on the feed, profile, and (in a
// slightly larger form) the single-post page.
function renderPostCard(post) {
  const auth = getAuth();
  const liked = auth && post.likes.includes(auth._id);

  return `
    <div class="post-card" data-id="${post._id}">
      <div class="postmark">FIELD<br>NOTE</div>
      <div class="post-head">
        <img class="avatar" src="${post.user.avatar}" alt="${post.user.name}">
        <div class="who">
          <a href="profile.html?username=${post.user.username}">${post.user.name}</a>
          <span class="timestamp">@${post.user.username} · ${timeAgo(post.createdAt)}</span>
        </div>
      </div>
      <div class="post-content">${escapeHtml(post.content)}</div>
      ${post.image ? `<div class="post-image"><img src="${post.image}" alt=""></div>` : ""}
      <div class="post-actions">
        <button class="action-btn like-btn ${liked ? "liked" : ""}" data-id="${post._id}">
          ${liked ? "♥" : "♡"} <span class="like-count">${post.likes.length}</span>
        </button>
        <a class="action-btn" href="post.html?id=${post._id}">💬 <span>${post.commentCount}</span></a>
      </div>
    </div>
  `;
}

// Attaches click handlers to every .like-btn currently in the DOM.
// Call this again after re-rendering a list of posts.
function attachLikeHandlers() {
  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!getAuth()) {
        showToast("Log in to like posts");
        return;
      }
      const id = btn.dataset.id;
      try {
        const res = await fetch(`${API_BASE}/posts/${id}/like`, {
          method: "POST",
          headers: authHeaders(),
        });
        const data = await res.json();
        if (!res.ok) return showToast(data.message || "Something went wrong");

        btn.classList.toggle("liked", data.liked);
        btn.innerHTML = `${data.liked ? "♥" : "♡"} <span class="like-count">${data.likeCount}</span>`;
      } catch (err) {
        showToast("Couldn't reach the server");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", updateNavAuthState);
