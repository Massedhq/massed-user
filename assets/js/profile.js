// Wrap saveProfile to also call API
var _origSaveProfile = saveProfile;
saveProfile = async function() {
  _origSaveProfile();
  // Always persist profile fields to localStorage immediately
  var nameEl = document.querySelector('#mptab-profile-content input[placeholder="Your name"]');
  var titleEl = document.querySelector('#mptab-profile-content input[placeholder="e.g. UGC Creator, Beauty Consultant"]');
  var bioEl = document.querySelector('#mptab-profile-content textarea');
  var profileData = {
    display_name: nameEl ? nameEl.value.trim() : undefined,
    title: titleEl ? titleEl.value.trim() : undefined,
    bio: bioEl ? bioEl.value.trim() : undefined,
  };
  if (_currentUser) { Object.assign(_currentUser, profileData); lsSaveUser(_currentUser); }
  lsSaveProfile(profileData);
  if (!_currentUser) return;
  try {
    var categoryEl = document.getElementById('mp-category');
    var emailEl = document.querySelector('#mptab-profile-content input[type="email"]');
    var phoneEl = document.querySelector('#mptab-profile-content input[type="tel"]');
    var websiteEl = document.querySelector('#mptab-profile-content input[type="url"]');
    await apiSaveProfile({
      display_name: profileData.display_name,
      title: profileData.title,
      bio: profileData.bio,
      category: categoryEl ? categoryEl.value : undefined,
      phone: phoneEl ? phoneEl.value.trim() : undefined,
      website: websiteEl ? websiteEl.value.trim() : undefined,
      email: emailEl ? emailEl.value.trim() : undefined,
    });
  } catch(e) { console.error('Profile save failed:', e); }
};




function showPublicProfileSetup() {
  var existing = document.getElementById('public-profile-setup');
  if (existing) { existing.style.display = 'flex'; return; }

  var overlay = document.createElement('div');
  overlay.id = 'public-profile-setup';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(44,26,14,0.55);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);';

  overlay.innerHTML = [
    '<div style="background:#fff;border-radius:20px;padding:32px;width:100%;max-width:460px;box-shadow:0 20px 60px rgba(44,26,14,0.2);" onclick="event.stopPropagation()">',
      '<div style="text-align:center;margin-bottom:24px;">',
        '<div style="width:52px;height:52px;background:var(--brown-bg2);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">',
          '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--brown)" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
        '</div>',
        '<div style="font-family:\'DM Serif Display\',serif;font-size:1.35rem;color:var(--text);margin-bottom:5px;">Create Your Public Profile</div>',
        '<div style="font-size:0.82rem;color:var(--text-dim);line-height:1.5;">This is your personal public presence on MASSED — separate from your business dashboard.</div>',
      '</div>',

      '<div style="margin-bottom:13px;">',
        '<label style="display:block;font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;">Display Name</label>',
        '<input id="pp-name" type="text" placeholder="Your name" style="width:100%;padding:11px 14px;background:var(--cream);border:1.5px solid var(--border);border-radius:9px;font-family:\'DM Sans\',sans-serif;font-size:0.88rem;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor=\'var(--brown)\'" onblur="this.style.borderColor=\'var(--border)\'">',
      '</div>',

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:13px;">',
        '<div>',
          '<label style="display:block;font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;">Location</label>',
          '<input id="pp-location" type="text" placeholder="City, State" style="width:100%;padding:11px 14px;background:var(--cream);border:1.5px solid var(--border);border-radius:9px;font-family:\'DM Sans\',sans-serif;font-size:0.88rem;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor=\'var(--brown)\'" onblur="this.style.borderColor=\'var(--border)\'">',
        '</div>',
        '<div>',
          '<label style="display:block;font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;">Astrology Sign</label>',
          '<select id="pp-astro" style="width:100%;padding:11px 14px;background:var(--cream);border:1.5px solid var(--border);border-radius:9px;font-family:\'DM Sans\',sans-serif;font-size:0.88rem;outline:none;box-sizing:border-box;">',
            '<option value="">Select sign</option>',
            '<option>♈ Aries</option><option>♉ Taurus</option><option>♊ Gemini</option>',
            '<option>♋ Cancer</option><option>♌ Leo</option><option>♍ Virgo</option>',
            '<option>♎ Libra</option><option>♏ Scorpio</option><option>♐ Sagittarius</option>',
            '<option>♑ Capricorn</option><option>♒ Aquarius</option><option>♓ Pisces</option>',
          '</select>',
        '</div>',
      '</div>',

      '<div style="margin-bottom:20px;">',
        '<label style="display:block;font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;">Bio</label>',
        '<textarea id="pp-bio" placeholder="Tell people about yourself..." rows="3" style="width:100%;padding:11px 14px;background:var(--cream);border:1.5px solid var(--border);border-radius:9px;font-family:\'DM Sans\',sans-serif;font-size:0.88rem;outline:none;resize:none;box-sizing:border-box;" onfocus="this.style.borderColor=\'var(--brown)\'" onblur="this.style.borderColor=\'var(--border)\'"></textarea>',
      '</div>',

      '<div style="display:flex;gap:10px;">',
        '<button onclick="cancelPublicProfileSetup()" style="flex:1;padding:11px;background:var(--cream);color:var(--text-mid);border:1px solid var(--border);border-radius:9px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-weight:600;font-size:0.88rem;">Cancel</button>',
        '<button onclick="savePublicProfile()" style="flex:2;padding:11px;background:linear-gradient(135deg,var(--brown-light),var(--brown-dark));color:#fff;border:none;border-radius:9px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-weight:700;font-size:0.88rem;">Create Profile →</button>',
      '</div>',
    '</div>',
  ].join('');

  document.body.appendChild(overlay);
}

function cancelPublicProfileSetup() {
  var el = document.getElementById('public-profile-setup');
  if (el) el.style.display = 'none';
  // Go back to wherever they came from
  nav(null, _prevScreenBeforeSwitch || 'dashboard');
}

function savePublicProfile() {
  var name     = (document.getElementById('pp-name')     || {}).value || '';
  var location = (document.getElementById('pp-location') || {}).value || '';
  var astro    = (document.getElementById('pp-astro')    || {}).value || '';
  var bio      = (document.getElementById('pp-bio')      || {}).value || '';

  if (!name.trim()) {
    toast('Please enter your display name');
    return;
  }

  // Store public profile data — completely independent
  window._publicProfile = { name: name.trim(), location: location.trim(), astro: astro, bio: bio.trim() };
  window._publicProfileSetup = true;

  // Update the Switch Profile screen with real data
  var nameEl     = document.getElementById('sp-name');
  var titleEl    = document.getElementById('sp-title');
  var locationEl = document.getElementById('sp-location');
  var astroEl    = document.getElementById('sp-astro');
  var bioEl      = document.getElementById('sp-bio');
  var aboutLoc   = document.getElementById('sp-about-location');
  var aboutAstro = document.getElementById('sp-about-astro');
  var avatarEl   = document.getElementById('sp-avatar');

  if (nameEl) nameEl.textContent = name.trim();
  if (locationEl) locationEl.textContent = location.trim() || '—';
  if (astroEl) astroEl.textContent = astro || '—';
  if (bioEl) bioEl.textContent = bio.trim() || '';
  if (aboutLoc) aboutLoc.textContent = location.trim() || '—';
  if (aboutAstro) aboutAstro.textContent = astro ? astro.split(' ').slice(1).join(' ') : '—';
  if (avatarEl) avatarEl.textContent = name.trim().charAt(0).toUpperCase();

  // Hide setup overlay
  var el = document.getElementById('public-profile-setup');
  if (el) el.style.display = 'none';

  toast('✓ Public profile created!');
}