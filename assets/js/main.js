
var _currentUser = null;

try {
  const raw = localStorage.getItem("user");

  if (raw && raw !== "undefined") {
    _currentUser = JSON.parse(raw);
  }
} catch (e) {
  console.warn("Invalid user in localStorage, clearing...");
  localStorage.removeItem("user");
}


// ================================
// GLOBAL STATE
// ================================
var _prevScreenBeforeSwitch = 'dashboard';
var _currentScreen = 'dashboard';


// ================================
// NAVIGATION OVERRIDE (MERGED + FIXED)
// ================================
var _origNav = nav;

nav = function(el, screen) {

  // Track previous screen
  if (screen === 'switchprofile') {
    _prevScreenBeforeSwitch = _currentScreen || 'dashboard';

    setTimeout(function() {
      if (window._publicProfileSetup !== true) {
        showPublicProfileSetup();
      }
    }, 60);
  }

  // Stop camera when leaving scanner
  try {
    if (typeof cameraStream !== 'undefined' && cameraStream && screen !== 'scanner') {
      stopCamera();
    }
  } catch(e) {}

  _origNav(el, screen);

  // ✅ FIX: update current screen
  _currentScreen = screen;

  // Messages init
  if (screen === 'messages') {
    setTimeout(renderConvoList, 50);
  }

  // Switch profile init
  if (screen === 'switchprofile') {
    setTimeout(function() {
      spTab('posts', document.querySelector('.sp-tab'));
      renderSpFeed();
    }, 50);
  }

  // Mobile layout fix
  if (window.innerWidth <= 1024) {
    requestAnimationFrame(applyMobileLayouts);
  }
};


// ================================
// POLL PREVIEW
// ================================
function pollModalPreview() {
  var q = (document.getElementById('poll-modal-question')||{}).value || '';
  var o1 = (document.getElementById('poll-modal-opt1')||{}).value || '';
  var o2 = (document.getElementById('poll-modal-opt2')||{}).value || '';
  var o3 = (document.getElementById('poll-modal-opt3')||{}).value || '';
  var o4 = (document.getElementById('poll-modal-opt4')||{}).value || '';

  var prev = document.getElementById('poll-modal-preview');
  var pq = document.getElementById('poll-preview-q');
  var po = document.getElementById('poll-preview-opts');

  if (!prev || !pq || !po) return;

  if (!q.trim() && !o1.trim()) {
    prev.style.display = 'none';
    return;
  }

  prev.style.display = 'block';
  pq.textContent = q || 'Your question…';

  var opts = [o1,o2,o3,o4].filter(function(x){return x.trim();});

  po.innerHTML = opts.map(function(o){
    return `<div style="padding:7px 10px;background:var(--cream2);border-radius:8px;font-size:0.82rem;color:var(--text);font-weight:500;">${o}</div>`;
  }).join('');
}


// ================================
// REFUNDS
// ================================
var refundHistory = [];

function issueRefund() {
  var client = document.getElementById('refund-client')?.value || '';
  var amount = document.getElementById('refund-amount')?.value || '';
  var reason = document.getElementById('refund-reason')?.value || '';

  if (!client || !amount) {
    toast('Enter client and amount');
    return;
  }

  var id = Date.now();
  var dateStr = new Date().toLocaleDateString('en-US', {
    month:'short', day:'numeric', year:'numeric'
  });

  refundHistory.unshift({
    id,
    client,
    amount: parseFloat(amount).toFixed(2),
    reason: reason || '—',
    date: dateStr
  });

  var list = document.getElementById('refund-history-list');

  if (list) {
    list.innerHTML = '';
    refundHistory.forEach(function(r) {
      var row = document.createElement('div');
      row.style.cssText =
        'display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--cream2);gap:12px;flex-wrap:wrap;';

      row.innerHTML = `
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:0.88rem;">${r.client}</div>
          <div style="font-size:0.75rem;color:var(--text-dim);">
            ${r.reason} · ${r.date}
          </div>
        </div>
        <span style="font-weight:800;color:#dc2626;font-size:0.95rem;">−$${r.amount}</span>
        <span style="font-size:0.68rem;background:#fee2e2;color:#dc2626;padding:3px 8px;border-radius:8px;font-weight:700;">Refunded</span>
      `;

      list.appendChild(row);
    });
  }

  toast(`✓ Refund of $${parseFloat(amount).toFixed(2)} processed for ${client}`);

  ['refund-client','refund-amount','refund-reason','refund-ref'].forEach(function(fid){
    var el = document.getElementById(fid);
    if(el) el.value = '';
  });
}


// ================================
// VIDEO PLAYER
// ================================
function closeVideoPlayer() {
  var modal = document.getElementById('video-player-modal');
  var player = document.getElementById('video-player-el');

  if (player) {
    player.pause();
    player.src = '';
  }

  if (modal) modal.classList.remove('open');
}


// ================================
// SUPPORT TICKET
// ================================
function submitSupportTicket() {
  var subject = document.getElementById('support-subject');
  var message = document.getElementById('support-message');
  var email = document.getElementById('support-email');

  if (!subject?.value) return toast('Please select a subject');
  if (!message?.value.trim()) return toast('Please enter a message');
  if (!email?.value.trim()) return toast('Please enter your email');

  closeModal('modal-contact-support');

  subject.value = '';
  message.value = '';
  email.value = '';

  toast('✓ Support message sent! We will reply within 24-48 hours.');
}


// ================================
// SHOWCASE PREVIEW
// ================================
function openFullPagePreview() {
  var modal = document.getElementById('modal-full-page-preview');
  var content = document.getElementById('full-page-preview-content');

  if (!modal || !content) return;

  var t = TEMPLATES[SHOWCASE_ACTIVE];
  if (t) content.innerHTML = t.render();

  modal.classList.add('open');
}


// ================================
// LOAD ALL DATA
// ================================
async function loadAllData() {
  if (!_currentUser) return;

  await loadProfile();
  await loadWebLinks();
  await loadListings();
  await loadProducts();
  await loadBookings();

  toast(`✓ Welcome back, ${_currentUser.display_name || 'creator'}!`);

  setTimeout(() => {
    nav(document.querySelector('.nav-item'), 'dashboard');
  }, 100);
}


// ================================
// BOOT
// ================================
document.addEventListener('DOMContentLoaded', function() {

  // Restore local data
  lsRestoreAll();

  // Map tooltips
  var tooltip = document.getElementById('map-tooltip');

  if (tooltip) {
    document.querySelectorAll('.us-state').forEach(function(s) {
      s.style.cursor = 'pointer';

      s.addEventListener('mouseenter', function() {
        tooltip.style.display = 'block';
        tooltip.textContent =
          `${s.getAttribute('data-state')} — ${s.getAttribute('data-traffic')}`;
      });

      s.addEventListener('mousemove', function(e) {
        var rect = s.closest('svg').parentElement.getBoundingClientRect();
        tooltip.style.left = (e.clientX - rect.left + 8) + 'px';
        tooltip.style.top  = (e.clientY - rect.top - 30) + 'px';
      });

      s.addEventListener('mouseleave', function() {
        tooltip.style.display = 'none';
      });
    });
  }

  // Initialize app
  requestAnimationFrame(function() {

    nav(document.querySelector('.nav-item'), 'dashboard');

    renderBookingServices();
    renderReviewQuestions();
    renderSubsTable();
    buildShowcaseCards();

    if (typeof bioAddQuestion === 'function') bioAddQuestion();

    if (_currentUser) {
      renderWebLinks();
      renderListings('all');

      ['physical','digital','courses'].forEach(function(t) {
        var grid = document.getElementById('store-' + t + '-grid');
        if (grid) renderStoreGrid(t);
      });
    }

    applyMobileLayouts();

    document.body.style.visibility = 'visible';
  });

});