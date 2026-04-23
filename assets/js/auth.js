  
  // ================================
// GET USER FROM URL OR STORAGE
// ================================
function getUser() {

  const params = new URLSearchParams(window.location.search);
  const userParam = params.get("user");

  // ---------- FROM URL ----------
  if (userParam && userParam !== "undefined") {
    try {
      const user = JSON.parse(decodeURIComponent(userParam));

      localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (e) {
      console.error("❌ Failed to parse user param", e);
    }
  }

  // ---------- FROM LOCAL STORAGE ----------
  const stored = localStorage.getItem("user");

  if (!stored || stored === "undefined") {
    console.log("❌ No valid user in storage");
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("❌ Corrupted user in storage, clearing...");
    localStorage.removeItem("user");
    return null;
  }
}

// ================================
// UPDATE UI (SIDEBAR + NAVBAR)
// ================================
function updateUI(user) {

  // Sidebar
  const nameEl = document.getElementById("sidebar-name");
  const handleEl = document.getElementById("sidebar-handle");
  const avatarEl = document.getElementById("sidebar-avatar");

  // Topbar
  const profileLink = document.getElementById("nav-profile-link");

  // Name
  if (nameEl) nameEl.textContent = user.full_name || "User";

  // Username (sidebar)
  if (handleEl) handleEl.textContent = "@" + (user.username || "username");

  // Username (topbar link)
  if (profileLink) {
    profileLink.textContent = `massed.io/${user.username || "username"}`;
  }

  // Avatar initials
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

    const res = await fetch(
      `https://massed-web.vercel.app/api/get-me?user_id=${user.id}`
    );

    const data = await res.json();


    if (!res.ok) {
      console.error("❌ getMe error:", data.error);
      return;
    }


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

  let user = null;

  try {
    user = getUser();
  } catch (e) {
    console.error("❌ getUser crashed:", e);
    localStorage.removeItem("user");
  }


  // ❌ NO USER → redirect
  if (!user || !user.id) {
    console.log("❌ No valid user → redirecting");

    localStorage.removeItem("user"); // clean bad data
    window.location.href = "https://massed-web.vercel.app/";
    return;
  }


  // ✅ UI first (fast)
  updateUI(user);

  // 🔄 then refresh from DB
  fetchCurrentUser(user);

  // ✅ CLEAN URL (important: DON'T break path)
  if (window.location.search) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// ================================
// AUTO RUN
// ================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("🌐 DOM loaded");
  initAuth();
});

// ================================
// LOGOUT
// ================================
function logout() {

  localStorage.removeItem("user");
  window.location.href = "https://massed-web.vercel.app/";
}

window.logout = logout;

