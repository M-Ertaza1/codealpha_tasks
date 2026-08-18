// js/feed.js
// Renders the home feed (index.html): a "new post" composer (if logged in)
// followed by every post, newest first. renderPostCard, escapeHtml, and
// attachLikeHandlers are shared helpers defined in common.js.

const feedRoot = document.getElementById("feed-root");
if (feedRoot) {
  async function loadFeed() {
    feedRoot.innerHTML = `<p>Loading feed…</p>`;
    try {
      const res = await fetch(`${API_BASE}/posts`);
      const posts = await res.json();

      if (posts.length === 0) {
        feedRoot.innerHTML = `<div class="empty-state"><h3>No posts yet</h3><p>Be the first to write something.</p></div>`;
        return;
      }
      feedRoot.innerHTML = posts.map(renderPostCard).join("");
      attachLikeHandlers();
    } catch (err) {
      feedRoot.innerHTML = `<div class="empty-state"><h3>Couldn't load the feed</h3><p>Is the backend running on ${API_BASE}?</p></div>`;
    }
  }

  // ---------- Composer ----------
  const composerRoot = document.getElementById("composer-root");
  function renderComposer() {
    const auth = getAuth();
    if (!composerRoot) return;

    if (!auth) {
      composerRoot.innerHTML = `
        <div class="composer">
          <p style="margin:0;">Log in to share a note. <a href="login.html" style="color:var(--wine);font-weight:600;">Log in</a></p>
        </div>
      `;
      return;
    }

    composerRoot.innerHTML = `
      <div class="composer">
        <textarea id="post-content" maxlength="500" placeholder="What are you noticing today?"></textarea>
        <div class="composer-foot">
          <span class="char-count"><span id="char-count">0</span>/500</span>
          <button class="btn btn-primary" id="post-submit-btn">Post</button>
        </div>
      </div>
    `;

    const textarea = document.getElementById("post-content");
    textarea.addEventListener("input", () => {
      document.getElementById("char-count").textContent = textarea.value.length;
    });

    document.getElementById("post-submit-btn").addEventListener("click", async () => {
      const content = textarea.value.trim();
      if (!content) return;

      try {
        const res = await fetch(`${API_BASE}/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ content }),
        });
        const data = await res.json();
        if (!res.ok) return showToast(data.message || "Couldn't post");

        textarea.value = "";
        document.getElementById("char-count").textContent = "0";
        showToast("Posted!");
        loadFeed();
      } catch (err) {
        showToast("Couldn't reach the server");
      }
    });
  }

  renderComposer();
  loadFeed();
}
