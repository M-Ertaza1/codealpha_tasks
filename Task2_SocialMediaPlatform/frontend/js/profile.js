// js/profile.js
// Renders profile.html: a user's bio + stats, a follow/unfollow button
// (hidden on your own profile), and their posts.

const profileRoot = document.getElementById("profile-root");
if (profileRoot) {
  const params = new URLSearchParams(window.location.search);
  const username = params.get("username");

  async function loadProfile() {
    if (!username) {
      profileRoot.innerHTML = `<p>No profile specified.</p>`;
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/users/${username}`);
      if (!res.ok) throw new Error("Not found");
      const profile = await res.json();
      renderProfile(profile);
    } catch (err) {
      profileRoot.innerHTML = `<div class="empty-state"><h3>Profile not found</h3><a href="index.html" class="btn btn-outline">Back to feed</a></div>`;
    }
  }

  function renderProfile(profile) {
    document.title = `${profile.name} (@${profile.username}) — Fieldnote`;
    const auth = getAuth();
    const isMe = auth && auth._id === profile._id;
    const isFollowing = auth && profile.followers.some((id) => id === auth._id || id?._id === auth._id);

    profileRoot.innerHTML = `
      <div class="profile-head">
        <img class="avatar" src="${profile.avatar}" alt="${profile.name}">
        <div>
          <h2>${profile.name}</h2>
          <div class="username">@${profile.username}</div>
          <p class="profile-bio">${escapeHtml(profile.bio || "No bio yet.")}</p>
          <div class="profile-stats">
            <span><strong>${profile.followerCount}</strong> followers</span>
            <span><strong>${profile.followingCount}</strong> following</span>
          </div>
          ${
            isMe
              ? ""
              : auth
              ? `<button class="btn ${isFollowing ? "btn-outline" : "btn-primary"} btn-sm" id="follow-btn" style="margin-top:12px;">${isFollowing ? "Following" : "Follow"}</button>`
              : `<a href="login.html" class="btn btn-outline btn-sm" style="margin-top:12px;">Log in to follow</a>`
          }
        </div>
      </div>

      <h3 style="font-family:'Lora',serif;color:var(--ink-blue);">Posts</h3>
      <div id="profile-posts">
        ${profile.posts.length === 0 ? `<div class="empty-state"><p>No posts yet.</p></div>` : profile.posts.map(renderPostCard).join("")}
      </div>
    `;

    attachLikeHandlers();

    const followBtn = document.getElementById("follow-btn");
    if (followBtn) {
      followBtn.addEventListener("click", async () => {
        try {
          const res = await fetch(`${API_BASE}/users/${profile._id}/follow`, {
            method: "POST",
            headers: authHeaders(),
          });
          const data = await res.json();
          if (!res.ok) return showToast(data.message || "Something went wrong");

          followBtn.textContent = data.following ? "Following" : "Follow";
          followBtn.classList.toggle("btn-primary", !data.following);
          followBtn.classList.toggle("btn-outline", data.following);
          document.querySelector(".profile-stats strong").textContent = data.followerCount;
        } catch (err) {
          showToast("Couldn't reach the server");
        }
      });
    }
  }

  loadProfile();
}
