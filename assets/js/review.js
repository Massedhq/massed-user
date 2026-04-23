var reviewQCounter = 10;
function addReviewQuestion() {
  var q = { id: reviewQCounter++, q:'', type:'choice', choices:[''] };
  reviewQuestions.push(q);
  renderReviewQuestions();
}

function renderReviewQuestions() {
  var el = document.getElementById('review-questions-list');
  if (!el) return;
  el.innerHTML = reviewQuestions.map(function(q,i) {
    return '<div style="background:var(--cream);border-radius:10px;padding:12px;">'
      + '<div style="display:flex;gap:8px;margin-bottom:8px;">'
      + '<input type="text" value="'+q.q.replace(/"/g,'&quot;')+'" placeholder="Question '+( i+1)+'..." oninput="reviewQuestions['+i+'].q=this.value" style="flex:1;padding:8px 10px;border:1px solid var(--border);border-radius:8px;font-family:sans-serif;font-size:0.82rem;">'
      + '<button onclick="reviewQuestions.splice('+i+',1);renderReviewQuestions()" style="padding:6px 10px;background:#fee2e2;color:#dc2626;border:none;border-radius:7px;cursor:pointer;font-size:0.8rem;font-weight:700;">✕</button>'
      + '</div>'
      + '<input type="text" value="'+q.choices.join(', ')+'" placeholder="Answer choices separated by commas" oninput="reviewQuestions['+i+'].choices=this.value.split(\',\').map(function(c){return c.trim()})" style="width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.78rem;font-family:sans-serif;box-sizing:border-box;">'
      + '</div>';
  }).join('');
}

function saveReviewQuestionnaire() {
  toast('✓ Review questionnaire saved — ' + reviewQuestions.length + ' questions');
}

// renderReviewQuestions + badge called in boot sequence below

// ── MOBILE RESPONSIVE FIX ────────────────────────────────────────────────────
// Inline style= attributes can't be overridden by media queries — fix with JS
function applyMobileLayouts() {
  if (window.innerWidth > 1024) return;
  var isMobile = window.innerWidth <= 1024;
  var isSmall  = window.innerWidth <= 480;

  // Fix all inline grid containers that resist CSS media queries
  var fixes = [
    // [selector, mobile style, small style]
    ['#screen-dashboard .stats-row',         'grid-template-columns:1fr 1fr', null],
    ['#screen-salespayouts .stats-row',      'grid-template-columns:1fr 1fr', 'grid-template-columns:1fr'],
    ['#screen-analytics .stats-row',         'grid-template-columns:1fr 1fr', null],
    ['#screen-booking > div[style]',         null, null],
    ['#screen-scanner > div:nth-child(2)',   'grid-template-columns:1fr',     null],
    ['#physical-grid',                        'grid-template-columns:1fr',     null],
    ['#digital-grid',                         'grid-template-columns:1fr',     null],
    ['#courses-grid',                         'grid-template-columns:1fr',     null],
    ['#wl-links-list',                        'grid-template-columns:1fr',     null],
    ['#listings-grid',                        'grid-template-columns:1fr',     null],
    ['.profile-grid',                         'grid-template-columns:1fr',     null],
  ];

  fixes.forEach(function(fix) {
    var els = document.querySelectorAll(fix[0]);
    els.forEach(function(el) {
      if (fix[2] && isSmall) { el.style.gridTemplateColumns = fix[2].replace('grid-template-columns:',''); }
      else if (fix[1] && isMobile) { el.style.gridTemplateColumns = fix[1].replace('grid-template-columns:',''); }
    });
  });

  // Stack any 2-col inline flex/grid rows in modals
  if (isMobile) {
    document.querySelectorAll('.modal > div[style*="grid-template-columns:1fr 1fr"]').forEach(function(el) {
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.gap = '10px';
    });
    // Stack profile card inner grids
    document.querySelectorAll('.profile-card > div[style*="grid-template-columns"]').forEach(function(el) {
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.gap = '10px';
    });
  }
}

// applyMobileLayouts called in boot sequence below
window.addEventListener('resize', applyMobileLayouts);

// Patch nav() to also apply mobile layouts after each navigation
(function() {
  var _origNav = typeof nav === 'function' ? nav : null;
  if (_origNav) {
    var _patchedNav = function(el, screen) {
      _origNav(el, screen);
      setTimeout(applyMobileLayouts, 50);
    };
    // Nav patched in boot sequence below
  }
})();

function toggleReviewBuilder() {
  var builder = document.getElementById('bk-review-builder');
  var list = document.getElementById('bk-incoming-list');
  var btn = document.getElementById('bk-deleted-section');
  if (!builder) return;
  var isShowing = builder.style.display !== 'none';
  builder.style.display = isShowing ? 'none' : 'block';
  if (list) list.style.display = isShowing ? 'flex' : 'none';
}

// Global exposure
window.applyMobileLayouts = applyMobileLayouts;
window.renderReviewQuestions = renderReviewQuestions;