// ── HELP MODAL SEARCH / JUMP TO ──────────────────────────────────────────────
var helpSections = [
  { id:'help-sec-mediaprofile',   label:'👤 Media Profile' },
  { id:'help-sec-mystore',        label:'🛍️ My Store' },
  { id:'help-sec-weblinks',       label:'🔗 Web Links' },
  { id:'help-sec-listings',       label:'📋 Listings' },
  { id:'help-sec-forms',          label:'📝 Forms' },
  { id:'help-sec-booking',        label:'📅 Booking / Your Services' },
  { id:'help-sec-sociallinks',    label:'📱 Social Links' },
  { id:'help-sec-video',          label:'🎬 Video' },
  { id:'help-sec-events',         label:'🎟️ Events / Tickets' },
  { id:'help-sec-golive',         label:'🔴 Go Live' },
  { id:'help-sec-sales',          label:'💰 Sales & Payouts' },
  { id:'help-sec-settings',       label:'⚙️ Settings' },
  { id:'help-sec-support',        label:'❓ Support Tab (inside Settings)' },
  { id:'help-sec-browsericon',    label:'🌐 Browser Icon' },
  { id:'help-sec-subs',           label:'💳 Subscriptions / Memberships' },
  { id:'help-sec-hearts',         label:'❤️ Hearts — Save Feature' },
  { id:'help-sec-custom',         label:'🔤 Other / Custom Fields' },
  { id:'help-sec-messages',       label:'💬 My Messages' },
  { id:'help-sec-switchprofile',  label:'👥 Switch Profile' },
  { id:'help-sec-banned',         label:'⛔🚫 Banned / Blocked' },
  { id:'help-sec-gateway',        label:'🚪 Gateway Room' },
  { id:'help-sec-reservations',   label:'🍽️ Reservations' },
  { id:'help-sec-sparkfounder',   label:'⚡ Spark Founder' }
];

function helpSearch(val) {
  var suggestions = document.getElementById('help-suggestions');
  if (!suggestions) return;
  var q = val.trim().toLowerCase();
  if (!q) { suggestions.style.display = 'none'; return; }
  var matches = helpSections.filter(function(s){
    return s.label.toLowerCase().indexOf(q) !== -1;
  });
  if (!matches.length) {
    suggestions.style.display = 'block';
    suggestions.innerHTML = '<div style="padding:10px 14px;font-size:0.82rem;color:var(--text-dim);">No sections found</div>';
    return;
  }
  suggestions.style.display = 'block';
  suggestions.innerHTML = matches.map(function(s) {
    return '<div onclick="helpJumpTo(\''+s.id+'\')" style="padding:10px 14px;font-size:0.85rem;font-weight:600;color:var(--text);cursor:pointer;border-bottom:1px solid var(--border);transition:background 0.15s;" onmouseover="this.style.background=\'var(--brown-bg)\'" onmouseout="this.style.background=\'#fff\'">'
      + s.label + '</div>';
  }).join('');
}

function helpJumpTo(sectionId) {
  var el = document.getElementById(sectionId);
  var scroll = document.getElementById('help-scroll-area');
  var input = document.getElementById('help-search');
  var suggestions = document.getElementById('help-suggestions');
  if (!el || !scroll) return;
  // Close dropdown
  if (suggestions) suggestions.style.display = 'none';
  if (input) input.value = '';
  // Scroll to section
  scroll.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
  // Flash highlight
  el.style.transition = 'box-shadow 0.3s';
  el.style.boxShadow = '0 0 0 3px rgba(192,122,80,0.5)';
  setTimeout(function(){ el.style.boxShadow = 'none'; }, 1400);
}

// Close suggestions when clicking outside the help search
document.addEventListener('click', function(e) {
  var bar = document.getElementById('help-search');
  var sug = document.getElementById('help-suggestions');
  if (sug && bar && !bar.contains(e.target) && !sug.contains(e.target)) {
    sug.style.display = 'none';
  }
});