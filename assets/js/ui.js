// ================================
// UI INTERACTIONS / NAVIGATION
// ================================

// Handles browser back/forward navigation between screens
window.addEventListener('popstate', function(e) {
  if(e.state && e.state.screen) {
    var screens = document.querySelectorAll('.screen');
    screens.forEach(function(s){ s.classList.remove('active'); });

    var target = document.getElementById('screen-' + e.state.screen);
    if(target) target.classList.add('active');

    var pt = document.getElementById('page-title');
    if(pt && pageTitles) pt.textContent = pageTitles[e.state.screen] || '';

    // Close sidebar if open
    var sb = document.getElementById('main-sidebar');
    var ov = document.getElementById('sidebar-overlay');

    if(sb) sb.classList.remove('open');
    if(ov) { ov.classList.remove('open'); ov.style.display='none'; }

  } else {
    // Fallback to dashboard
    nav(null, 'dashboard');
  }
});


// Initializes mobile UI interactions (hamburger + sidebar behavior)
document.addEventListener('DOMContentLoaded', function() {

  // Handle mobile hamburger button (prevent double click on touch devices)
  var hbtn = document.getElementById('hamburger-btn');

  if (hbtn) {
    var _lastTouch = 0;

    hbtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      _lastTouch = Date.now();
      toggleSidebar();
    }, { passive: false });

    hbtn.addEventListener('click', function(e) {
      if (Date.now() - _lastTouch < 400) return;
      toggleSidebar();
    });
  }

  // Close sidebar when overlay is tapped
  var ov = document.getElementById('sidebar-overlay');

  if (ov) {
    ov.addEventListener('touchend', function(e) {
      e.preventDefault();
      closeSidebar();
    }, { passive: false });
  }
});




// ================================
// EVENT FORM LOGIC
// ================================

// ── ONLINE EVENT FIELD TOGGLE ─────────────────────────
function toggleOtherField(showCondition, wrapId) {
  var wrap = document.getElementById(wrapId);
  if (!wrap) return;
  // showCondition can be boolean or string 'Other'
  var show = showCondition === true || showCondition === 'Other';
  wrap.style.display = show ? 'block' : 'none';
  if (!show) {
    // Clear the input when hidden
    var input = wrap.querySelector('input');
    if (input) input.value = '';
  }
}

function toggleOnlineField(val) {
  const section = document.getElementById('online-link-section');
  section.style.display = val === 'Online' ? 'block' : 'none';
  if (val === 'Online') updateStreamLink();
}

function toggleRsvpFields(val) {
  document.getElementById('rsvp-fields').style.display = val === 'yes' ? 'block' : 'none';
}

function updateStreamLink() {
  const name = document.getElementById('ev-name').value.trim();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'my-event';
  const link = 'https://stream.massed.io/' + slug;
  const el = document.getElementById('auto-stream-link');
  if (el) el.textContent = link;
  return link;
}

function copyStreamLink() {
  const link = updateStreamLink();
  navigator.clipboard.writeText(link).then(() => toast('✓ Stream link copied!'));
}






function toggleFaq(btn) {
  var body = btn.nextElementSibling;
  var arrow = btn.querySelector('.faq-arrow');
  var isOpen = body.style.display === 'block';
  body.style.display = isOpen ? 'none' : 'block';
  if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
}




function toggleSocialVisibility(wrap, sid) {
  var toggle = document.getElementById('sl-' + sid);
  var label = document.getElementById('sl-' + sid + '-label');
  if (!toggle) return;
  var isOn = toggle.classList.contains('on');
  if (isOn) {
    toggle.classList.remove('on');
    if (label) label.textContent = 'Hidden from profile';
  } else {
    toggle.classList.add('on');
    if (label) label.textContent = 'Shown on profile';
  }
}


function handleFaviconUpload(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    var src = ev.target.result;
    // Update large preview
    var prev = document.getElementById('favicon-preview-large');
    var wrap = document.getElementById('favicon-preview-wrap');
    var icon = document.getElementById('favicon-upload-icon');
    var txt = document.getElementById('favicon-upload-text');
    if (prev) { prev.src = src; }
    if (wrap) wrap.style.display = 'block';
    if (icon) icon.style.display = 'none';
    if (txt) txt.textContent = file.name;
    // Update tab preview
    var tabImg = document.getElementById('tab-favicon-img');
    var tabDefault = document.getElementById('tab-favicon-default');
    if (tabImg) { tabImg.src = src; tabImg.style.display = 'block'; }
    if (tabDefault) tabDefault.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function saveFavicon() {
  var file = document.getElementById('favicon-file-input').files[0];
  var title = document.getElementById('favicon-tab-title').value.trim();
  if (!file) { toast('Please upload an icon first'); return; }
  toast('✓ Browser icon applied to your MASSED page!');
}




function selectLanguage(el, code) {
  document.querySelectorAll('.lang-option').forEach(function(opt) {
    opt.style.background = 'var(--cream)';
    opt.style.border = '1px solid var(--border)';
    var label = opt.querySelector('span:last-child');
    if (label && !label.querySelector) {
      label.style.color = 'var(--text-dim)';
      label.style.fontWeight = '400';
      if (label.textContent === '✓ Selected') label.textContent = opt.getAttribute('data-lang-name') || '';
    }
  });
  el.style.background = 'var(--brown-bg)';
  el.style.border = '2px solid var(--brown)';
  var selLabel = el.querySelector('span:last-child');
  if (selLabel) { selLabel.textContent = '✓ Selected'; selLabel.style.color = 'var(--brown)'; selLabel.style.fontWeight = '700'; }
  toast('✓ Language updated');
}

function selectPayoutSpeed(el, type) {
  ['standard','instant'].forEach(function(t) {
    var row = document.getElementById('speed-dot-'+t).closest('div[style*="padding:16px"]');
    var dot = document.getElementById('speed-dot-'+t);
    if (t === type) {
      row.style.border = '2px solid var(--brown)';
      row.style.background = 'var(--brown-bg)';
      dot.style.background = 'var(--brown)';
      dot.style.border = '2px solid var(--brown)';
      dot.innerHTML = '<div style="width:8px;height:8px;border-radius:50%;background:#fff;"></div>';
    } else {
      row.style.border = '1px solid var(--border)';
      row.style.background = 'var(--cream)';
      dot.style.background = '#fff';
      dot.style.border = '2px solid var(--border)';
      dot.innerHTML = '';
    }
  });
}



function toggleMoreMenu() {
  const menu = document.getElementById('more-menu');
  const isOpen = menu.style.display === 'block';
  menu.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) setTimeout(() => document.addEventListener('click', closeMoreMenuOutside), 10);
}


function closeMoreMenu() {
  const menu = document.getElementById('more-menu');
  if (menu) menu.style.display = 'none';
  document.removeEventListener('click', closeMoreMenuOutside);
}


function closeMoreMenuOutside(e) {
  const menu = document.getElementById('more-menu');
  const trigger = document.getElementById('btn-more-trigger');
  if (menu && !menu.contains(e.target) && trigger && !trigger.contains(e.target)) closeMoreMenu();
}


function goToLivePreview() {
  closeMoreMenu();
  nav(null, 'livepreview');
}




// ── CORE NAV & UI ─────────────────────────────────────────────────────────────
function toggleSidebar() {
  var sb = document.getElementById('main-sidebar');
  var ov = document.getElementById('sidebar-overlay');
  if (!sb) return;
  if (sb.classList.contains('open')) {
    sb.classList.remove('open');
    if (ov) {
      ov.classList.remove('open');
      setTimeout(function(){ if (ov && !ov.classList.contains('open')) ov.style.visibility = 'hidden'; }, 280);
    }
  } else {
    if (ov) { ov.style.visibility = 'visible'; }
    // Force reflow before adding open class so CSS transition fires
    requestAnimationFrame(function() {
      sb.classList.add('open');
      if (ov) ov.classList.add('open');
    });
  }
}
function closeSidebar() {
  var sb = document.getElementById('main-sidebar');
  var ov = document.getElementById('sidebar-overlay');
  if (sb) sb.classList.remove('open');
  if (ov) {
    ov.classList.remove('open');
    setTimeout(function(){ if (ov && !ov.classList.contains('open')) ov.style.visibility = 'hidden'; }, 280);
  }
}

function openModal(id) { var el=document.getElementById(id); if(el) el.classList.add('open'); }
function closeModal(id) { var el=document.getElementById(id); if(el) el.classList.remove('open'); }

// Dual-link: lights up the chain icon, opens public page in new tab, AND switches dashboard to Public View
function dualLinkOpen(el) {
  el.classList.add('linking');
  el.classList.add('linked');
  setTimeout(function(){ el.classList.remove('linking'); }, 700);
  // Open the public page URL in a new tab
  var username = el.textContent.trim();
  window.open('https://' + username, '_blank');
  // Also switch this dashboard to the Switch Profile (public view) screen
  if(typeof nav === 'function') {
    nav(null, 'switchprofile');
  }
  toast('🔗 Linked! Public page opened + switched to Public View');
}

function toast(msg) {
  var t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg; t.classList.add('show');
  setTimeout(function(){ if(t) t.classList.remove('show'); },3000);
}
var pageTitles={dashboard:'Dashboard',signals:'Signals',vault:'My Vault',bannedblocked:'Banned / Blocked',gateway:'Gateway Room',showcase:'Showcase',mystore:'My Store',mydigital:'My Store — Digital Products',myphysical:'My Store — Physical Products',mycourses:'My Store — Courses',listings:'Listings',createpoll:'Create Poll',forms:'Forms',weblinks:'Web Links',mediaprofile:'Media Profile',sociallinks:'Social Links',video:'Video',analytics:'Analytics',reviews:'Reviews',tickets:'Events / Tickets',scanner:'Ticket Scanner',livepreview:'Live Preview',promo:'Promo / Referrals / Affiliates',settings:'Settings',billing:'Billing',salespayouts:'Sales & Payouts',booking:'Your Booking Services',subs:'Subscriptions / Subscribers / Memberships',browsericon:'Branding / Browser Icon',payoutsettings:'My Payout Earnings',messages:'My Messages',switchprofile:'',coming:'Coming Soon',sparkfounder:'Spark Founder'};

function navStoreTab(el, tab) {
  nav(el, 'mystore');
  setTimeout(function(){ storeTab(tab); }, 30);
  var pt = document.getElementById('page-title');
  var tabNames = { physical:'My Store — Physical Products', digital:'My Store — Digital Products', courses:'My Store — Courses' };
  if (pt) pt.textContent = tabNames[tab] || 'My Store';
}

function storeTab(tab) {
  ['physical','digital','courses','visibility'].forEach(function(t) {
    var el = document.getElementById('store-'+t+'-content');
    var btn = document.getElementById('stab-'+t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) {
      btn.style.background = t === tab ? 'var(--brown)' : 'transparent';
      btn.style.color = t === tab ? '#fff' : 'var(--text-dim)';
    }
  });
}


// ── STORE LIVE TOGGLE ─────────────────────────────────────────────────────────
function toggleStoreLive(cb) {
  var track = document.getElementById('store-live-track');
  var thumb = document.getElementById('store-live-thumb');
  var label = document.getElementById('store-live-label');
  if (cb.checked) {
    if (track) track.style.background = 'var(--brown)';
    if (thumb) thumb.style.left = '27px';
    if (label) label.textContent = 'Store is Live';
    toast('✓ Your store is now live!');
  } else {
    if (track) track.style.background = '#e5e7eb';
    if (thumb) thumb.style.left = '3px';
    if (label) label.textContent = 'Store is Off';
    toast('Store is now hidden from your page');
  }
}

// ── CARD INPUT FORMATTERS ─────────────────────────────────────────────────────
function formatCard(input) {
  var v = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = v.replace(/(.{4})/g, '$1  ').trim();
}
function formatExpiry(input) {
  var v = input.value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 3) v = v.slice(0,2) + ' / ' + v.slice(2);
  input.value = v;
}

// ── LIVE BANNER PRODUCT CONTROLS ─────────────────────────────────────────────
function closeProduct() {
  var info = document.getElementById('banner-product');
  var btnClose = document.getElementById('btn-close-prod');
  var btnBring = document.getElementById('btn-bring-back');
  if (info) info.style.display = 'none';
  if (btnClose) btnClose.style.display = 'none';
  if (btnBring) btnBring.style.display = 'inline-flex';
  toast('Product hidden from live view');
}

function bringBackProduct() {
  var info = document.getElementById('banner-product');
  var btnClose = document.getElementById('btn-close-prod');
  var btnBring = document.getElementById('btn-bring-back');
  if (info) info.style.display = 'flex';
  if (btnClose) btnClose.style.display = 'inline-flex';
  if (btnBring) btnBring.style.display = 'none';
  toast('Product brought back to live view');
}




function salesTab(tab) {
  var isS=tab==='sales';
  var s=document.getElementById('sp-sales'); var p=document.getElementById('sp-payout');
  if(s) s.style.display=isS?'block':'none';
  if(p) p.style.display=isS?'none':'block';
  var sb=document.getElementById('sp-tab-sales'); var pb=document.getElementById('sp-tab-payout');
  if(sb){sb.style.background=isS?'var(--brown)':'transparent';sb.style.color=isS?'#fff':'var(--text-dim)';}
  if(pb){pb.style.background=isS?'transparent':'var(--brown)';pb.style.color=isS?'var(--text-dim)':'#fff';}
}
function spSubTab(sub) {
  var isP=sub==='payout';
  var pc=document.getElementById('sp-payout-content'); var ac=document.getElementById('sp-affiliate-content');
  if(pc) pc.style.display=isP?'block':'none';
  if(ac) ac.style.display=isP?'none':'block';
  var pb=document.getElementById('sp-sub-payout'); var ab=document.getElementById('sp-sub-affiliate');
  if(pb){pb.style.background=isP?'var(--brown)':'transparent';pb.style.color=isP?'#fff':'var(--text-dim)';}
  if(ab){ab.style.background=isP?'transparent':'var(--brown)';ab.style.color=isP?'var(--text-dim)':'#fff';}
}

function settingsTab(tab) {
  ['settings','billing','stripe','support','api'].forEach(function(t){
    var c=document.getElementById('stab-'+t+'-content');
    var b=document.getElementById('stab-'+t);
    if(c) c.style.display=t===tab?'flex':'none';
    if(b){b.style.background=t===tab?'var(--brown)':'transparent';b.style.color=t===tab?'#fff':'var(--text-dim)';}
  });
}

function mpTab(tab) {
  var pc=document.getElementById('mptab-profile-content');
  var cc=document.getElementById('mptab-collab-content');
  var hc=document.getElementById('mptab-hearts-content');
  if(pc) pc.style.display=tab==='profile'?'block':'none';
  if(cc) cc.style.display=tab==='collab'?'block':'none';
  if(hc) hc.style.display=tab==='hearts'?'block':'none';
  var pb=document.getElementById('mptab-profile'); var cb=document.getElementById('mptab-collab'); var hb=document.getElementById('mptab-hearts');
  if(pb){pb.style.background=tab==='profile'?'var(--brown)':'transparent';pb.style.color=tab==='profile'?'#fff':'var(--text-dim)';}
  if(cb){cb.style.background=tab==='collab'?'var(--brown)':'transparent';cb.style.color=tab==='collab'?'#fff':'var(--text-dim)';}
  if(hb){hb.style.background=tab==='hearts'?'var(--brown)':'transparent';hb.style.color=tab==='hearts'?'#fff':'var(--text-dim)';}
  if(tab==='collab') renderCollabGrid('all');
}

function collabSubTab(tab) {
  ['browse','incoming','active','docs'].forEach(function(t){
    var c=document.getElementById('csub-'+t+'-content');
    var b=document.getElementById('csub-'+t);
    if(c) c.style.display=t===tab?'block':'none';
    if(b){b.style.background=t===tab?'var(--brown)':'transparent';b.style.color=t===tab?'#fff':'var(--text-dim)';}
  });
  if(tab==='incoming') renderIncoming();
  if(tab==='active') renderActive();
  if(tab==='docs') renderDocs();
}

// Global exposure
window.closeModal = closeModal;
window.closeMoreMenu = closeMoreMenu;
window.closeSidebar = closeSidebar;
window.dualLinkOpen = dualLinkOpen;
window.goToLivePreview = goToLivePreview;
window.mpTab = mpTab;
window.navStoreTab = navStoreTab;
window.openModal = openModal;
window.toast = toast;
window.toggleMoreMenu = toggleMoreMenu;
window.toggleSidebar = toggleSidebar;