// ═══════════════════════════════════════════════════════════════════════════
// MASSED API LAYER — connects every feature to the real backend
// ═══════════════════════════════════════════════════════════════════════════

var API_BASE = '/api';
var _currentUser = null;






// ── Core fetch wrapper ────────────────────────────────────────────────────
async function api(method, path, body) {
  var opts = {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  };
  if (body && method !== 'GET') opts.body = JSON.stringify(body);
  try {
    var res = await fetch(API_BASE + path, opts);
    var data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    console.error('API error (falling back to localStorage):', path, err.message);
    throw err;
  }
}

// ── AUTH ──────────────────────────────────────────────────────────────────
async function apiRegister(email, password, displayName) {
  var data = await api('POST', '/auth/register', { email, password, display_name: displayName });
  _currentUser = data.user;
  lsSaveUser(_currentUser);
  return data;
}

async function apiLogin(email, password) {
  var data = await api('POST', '/auth/login', { email, password });
  _currentUser = data.user;
  lsSaveUser(_currentUser);
  return data;
}

async function apiLogout() {
  await api('DELETE', '/auth/me');
  _currentUser = null;
  lsClearUser();
  showLoginScreen();
}

async function apiGetMe() {
  try {
    var user = await api('GET', '/auth/me');
    _currentUser = user;
    return user;
  } catch(e) { return null; }
}

// ── PROFILE ───────────────────────────────────────────────────────────────
async function apiSaveProfile(data) {
  return await api('PUT', '/profile', data);
}

// ── PRODUCTS ──────────────────────────────────────────────────────────────
async function apiGetProducts(type) {
  return await api('GET', '/products' + (type ? '?type=' + type : ''));
}
async function apiCreateProduct(data) {
  return await api('POST', '/products', data);
}
async function apiUpdateProduct(id, data) {
  return await api('PUT', '/products/' + id, data);
}
async function apiDeleteProduct(id) {
  return await api('DELETE', '/products/' + id);
}
async function apiToggleProductVisibility(id, visible) {
  return await api('PATCH', '/products/' + id, { visible });
}

// ── WEB LINKS ─────────────────────────────────────────────────────────────
async function apiGetWebLinks() {
  return await api('GET', '/weblinks');
}
async function apiCreateWebLink(data) {
  return await api('POST', '/weblinks', data);
}
async function apiUpdateWebLink(id, data) {
  return await api('PUT', '/weblinks/' + id, data);
}
async function apiDeleteWebLink(id) {
  return await api('DELETE', '/weblinks/' + id);
}

// ── LISTINGS ──────────────────────────────────────────────────────────────
async function apiGetListings(category) {
  return await api('GET', '/listings' + (category && category !== 'all' ? '?category=' + category : ''));
}
async function apiCreateListing(data) {
  return await api('POST', '/listings', data);
}
async function apiUpdateListing(id, data) {
  return await api('PUT', '/listings/' + id, data);
}
async function apiDeleteListing(id) {
  return await api('DELETE', '/listings/' + id);
}

// ── BOOKINGS ──────────────────────────────────────────────────────────────
async function apiGetBookings() {
  return await api('GET', '/bookings');
}
async function apiCreateService(data) {
  return await api('POST', '/bookings', data);
}
async function apiUpdateBooking(id, data) {
  return await api('PATCH', '/bookings/' + id, data);
}
async function apiDeleteBooking(id) {
  return await api('DELETE', '/bookings/' + id);
}