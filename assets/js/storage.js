// ── LOCAL STORAGE PERSISTENCE LAYER ──────────────────────────────────────
// Acts as a fallback when the backend is unreachable.
// All reads check localStorage first; all writes save to localStorage AND
// attempt the real API. When the backend comes online, replace this layer
// with real API calls only.

var LS_PREFIX = 'massed_';



var _lsStore = {
  get: function(key) {
    try { var v = localStorage.getItem(LS_PREFIX + key); return v ? JSON.parse(v) : null; } catch(e) { return null; }
  },
  set: function(key, val) {
    try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(val)); } catch(e) {}
  },
  del: function(key) {
    try { localStorage.removeItem(LS_PREFIX + key); } catch(e) {}
  }
};

// Generate a simple unique ID for local records
function _lsId() { return Date.now() + '_' + Math.random().toString(36).slice(2,7); }

// ── localStorage-backed API stubs ─────────────────────────────────────────
// Each function mirrors the real apiXxx() signature.
// When backend is live, these are bypassed by the real api() fetch.

function lsGetProfile()          { return _lsStore.get('profile') || {}; }
function lsSaveProfile(data)     { var p = Object.assign(lsGetProfile(), data); _lsStore.set('profile', p); return p; }

function lsGetWebLinks()         { return _lsStore.get('webLinks') || []; }
function lsSaveWebLinks(arr)     { _lsStore.set('webLinks', arr); }

function lsGetListings()         { return _lsStore.get('listings') || []; }
function lsSaveListings(arr)     { _lsStore.set('listings', arr); }

function lsGetProducts()         { return _lsStore.get('products') || { physical:[], digital:[], courses:[] }; }
function lsSaveProducts(obj)     { _lsStore.set('products', obj); }

function lsGetBookingServices()  { return _lsStore.get('bookingServices') || null; }
function lsSaveBookingServices(arr) { _lsStore.set('bookingServices', arr); }

function lsGetPosts()            { return _lsStore.get('posts') || null; }
function lsSavePosts(arr)        { _lsStore.set('posts', arr); }

function lsGetSubsMembers()      { return _lsStore.get('subsMembers') || null; }
function lsSaveSubsMembers(arr)  { _lsStore.set('subsMembers', arr); }

function lsGetUser()             { return _lsStore.get('currentUser') || null; }
function lsSaveUser(u)           { _lsStore.set('currentUser', u); }
function lsClearUser()           { _lsStore.del('currentUser'); }

// ── Restore in-memory state from localStorage on page load ────────────────
function lsRestoreAll() {
  // Profile / user
  var savedUser = lsGetUser();
  if (savedUser) { _currentUser = savedUser; }

  // Web links
  var savedLinks = lsGetWebLinks();
  if (savedLinks.length) { webLinks = savedLinks; }

  // Listings
  var savedListings = lsGetListings();
  if (savedListings.length) { listingsData = savedListings; }

  // Products
  var savedProducts = lsGetProducts();
  if (savedProducts.physical.length || savedProducts.digital.length || savedProducts.courses.length) {
    storeProducts = savedProducts;
  }

  // Booking services
  var savedBk = lsGetBookingServices();
  if (savedBk) { bookingServices = savedBk; }

  // Posts
  var savedPosts = lsGetPosts();
  if (savedPosts) { spPosts = savedPosts; }

  // Subscribers
  var savedSubs = lsGetSubsMembers();
  if (savedSubs) { subsMembers = savedSubs; }
}

// ── Auto-save hooks — call these whenever in-memory data changes ──────────
// Drop these one-liners into any function that mutates the arrays.
function lsPersistWebLinks()     { lsSaveWebLinks(webLinks); }
function lsPersistListings()     { lsSaveListings(listingsData); }
function lsPersistProducts()     { lsSaveProducts(storeProducts); }
function lsPersistBookings()     { lsSaveBookingServices(bookingServices); }
function lsPersistPosts()        { lsSavePosts(spPosts); }
function lsPersistSubsMembers()  { lsSaveSubsMembers(subsMembers); }

// Global exposure
window.lsRestoreAll = lsRestoreAll;
