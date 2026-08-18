// js/post.js
// Renders post.html: the full post plus its comment thread, with a
// comment box for logged-in users.

const postRoot = document.getElementById("post-root");
if (postRoot) {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  async function loadPost() {
    if (!postId) {
      postRoot.innerHTML = `<p>No post specified.</p>`;
      return;
    }
    try {
      const [postRes, commentsRes] = await Promise.all([
        fetch(`${API_BASE}/posts/${postId}`),
        fetch(`${API_BASE}/posts/${postId}/comments`),
      ]);
      if (!postRes.ok) throw new Error("Not found");

      const post = await postRes.json();
      const comments = await commentsRes.json();
      render(post, comments);
    } catch (err) {
      postRoot.innerHTML = `<div class="empty-state"><h3>Post not found</h3><a href="index.html" class="btn btn-outline">Back to feed</a></div>`;
    }
  }

  function renderComment(comment) {
    return `
      <div class="comment">
        <img class="avatar" src="${comment.user.avatar}" alt="${comment.user.name}">
        <div class="bubble">
          <strong>${comment.user.name}</strong>
          <span class="timestamp"> · ${timeAgo(comment.createdAt)}</span>
          <p>${escapeHtml(comment.text)}</p>
        </div>
      </div>
    `;
  }

  function render(post, comments) {
    document.title = `${post.user.name}'s note — Fieldnote`;
    postRoot.innerHTML = `
      ${renderPostCard(post)}
      <div class="comment-section">
        <h3 style="font-family:'Lora',serif;color:var(--ink-blue);font-size:1.05rem;">
          ${comments.length} comment${comments.length === 1 ? "" : "s"}
        </h3>
        ${
          getAuth()
            ? `<div class="comment-composer">
                 <input type="text" id="comment-input" maxlength="300" placeholder="Add a comment…">
                 <button class="btn btn-primary btn-sm" id="comment-submit">Reply</button>
               </div>`
            : `<p class="form-note"><a href="login.html" style="color:var(--wine);font-weight:600;">Log in</a> to comment</p>`
        }
        <div id="comments-list">${comments.map(renderComment).join("")}</div>
      </div>
    `;

    attachLikeHandlers();

    const submitBtn = document.getElementById("comment-submit");
    if (submitBtn) {
      submitBtn.addEventListener("click", async () => {
        const input = document.getElementById("comment-input");
        const text = input.value.trim();
        if (!text) return;

        try {
          const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ text }),
          });
          const data = await res.json();
          if (!res.ok) return showToast(data.message || "Couldn't post comment");

          input.value = "";
          document.getElementById("comments-list").insertAdjacentHTML("beforeend", renderComment(data));
        } catch (err) {
          showToast("Couldn't reach the server");
        }
      });
    }
  }

  loadPost();
}
