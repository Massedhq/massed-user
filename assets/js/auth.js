// ================================
// GET USER FROM URL OR STORAGE
// ================================
function getUser() {
  console.log("🔍 getUser() called");

  const params = new URLSearchParams(window.location.search);
  const userParam = params.get("user");

  if (userParam) {
    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      console.log("✅ User from URL:", user);

      localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (e) {
      console.error("❌ Failed to parse user param", e);
    }
  }

  const stored = localStorage.getItem("user");
  console.log("📦 User from localStorage:", stored);

  return stored ? JSON.parse(stored) : null;
}

// ================================
// UPDATE UI (SIDEBAR + NAVBAR)
// ================================
function updateUI(user) {
  console.log("🎨 Updating UI with user:", user);

  // Sidebar
  const nameEl = document.getElementById("sidebar-name");
  const handleEl = document.getElementById("sidebar-handle");

  // Navbar (optional)
  const navName = document.getElementById("nav-username");

  if (nameEl) nameEl.textContent = user.full_name || "—";
  if (handleEl) handleEl.textContent = user.username ? "@" + user.username : "—";
  if (navName) navName.textContent = user.username || "";

  // Avatar initials (optional)
  const avatarEl = document.getElementById("sidebar-avatar");
  if (avatarEl && user.full_name) {
    const initials = user.full_name
      .split(" ")
      .map(w => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    avatarEl.textContent = initials;
  }
}

// ================================
// FETCH FRESH USER FROM DB (getMe)
// ================================
async function fetchCurrentUser(user) {
  try {
    console.log("🔄 Fetching user from DB:", user.id);

    const res = await fetch(
      `https://massed-web.vercel.app/api/get-me?user_id=${user.id}`
    );

    const data = await res.json();

    console.log("📦 getMe response:", data);

    if (!res.ok) {
      console.error("❌ getMe error:", data.error);
      return;
    }

    console.log("✅ Fresh user from DB:", data.user);

    // Update UI with latest data
    updateUI(data.user);

    // Update localStorage
    localStorage.setItem("user", JSON.stringify(data.user));

  } catch (err) {
    console.error("🔥 getMe failed:", err);
  }
}

// ================================
// INIT AUTH
// ================================
function initAuth() {
  console.log("🚀 initAuth() running");

  const user = getUser();

  console.log("👤 Final user:", user);

  if (!user) {
    console.log("❌ No user → redirecting");
    window.location.href = "https://massed-web.vercel.app/";
    return;
  }

  console.log("✅ User exists");

  // ✅ Step 1: Instant UI (fast)
  updateUI(user);

  // 🔥 Step 2: Refresh from DB
  fetchCurrentUser(user);

  // Clean URL (remove ?user=...)
  window.history.replaceState({}, document.title, "/");
}

// ================================
// AUTO RUN
// ================================
console.log("📜 auth.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("🌐 DOM loaded");
  initAuth();
});

// ================================
// LOGOUT
// ================================
function logout() {
  console.log("🚪 Logout clicked");

  localStorage.removeItem("user");
  window.location.href = "https://massed-web.vercel.app/";
}

window.logout = logout;