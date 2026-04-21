// ================================
// GET USER FROM URL OR STORAGE
// ================================
function getUser() {
  console.log("🔍 getUser() called");

  const params = new URLSearchParams(window.location.search);
  const userParam = params.get("user");

  console.log("URL PARAM:", userParam);

  if (userParam) {
    const user = JSON.parse(decodeURIComponent(userParam));

    console.log("✅ User from URL:", user);

    localStorage.setItem("user", JSON.stringify(user));
    return user;
  }

  const stored = localStorage.getItem("user");
  console.log("📦 User from localStorage:", stored);

  return stored ? JSON.parse(stored) : null;
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

  console.log("✅ User exists, updating UI");

  const nameEl = document.getElementById("sidebar-name");
  const handleEl = document.getElementById("sidebar-handle");

  console.log("DOM elements:", nameEl, handleEl);

  if (nameEl) nameEl.textContent = user.full_name;
  if (handleEl) handleEl.textContent = "@" + user.username;

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