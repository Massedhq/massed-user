function nav(el,screen) {
  if(!screen) return;
  var prevScreen = _currentScreen;
  _currentScreen = screen;
  try {
    if(window.history && window.history.pushState && window.self === window.top) {
      window.history.pushState({screen:screen}, '', '#'+screen);
    }
    // Remove active only from the previous screen and nav item — not all 28
    if (prevScreen && prevScreen !== screen) {
      var prevEl = document.getElementById('screen-' + prevScreen);
      if (prevEl) prevEl.classList.remove('active');
    } else if (!prevScreen) {
      // First load — clear all just once
      document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
    }
    document.querySelectorAll('.nav-item').forEach(function(n){if(n)n.classList.remove('active');});
    if(el&&el.classList) el.classList.add('active');
    var target = document.getElementById('screen-' + screen);
    if(target) target.classList.add('active');
    var pt = document.getElementById('page-title');
    if(pt) pt.textContent = pageTitles[screen] || '';
    // Render dynamic screens
    if(screen==='switchprofile') setTimeout(function(){ spTab('posts', document.querySelector('.sp-tab')); renderSpFeed(); }, 50);
    if(screen==='bannedblocked') setTimeout(renderBannedBlocked, 50);
    if(screen==='gateway') setTimeout(gwInit, 50);
    if(screen==='sparkfounder') setTimeout(function(){ sfUpdateStats(); renderSparkFounders(); }, 50);
    // Close sidebar on mobile after navigating
    closeSidebar();
  } catch(e){ console.warn('nav error:',e); }
}

// ── SIDEBAR NAV GROUP TOGGLE ─────────────────────────────────────────────────
function toggleGroup(header) {
  var body = header.nextElementSibling;
  if (!body) return;
  var isOpen = !header.classList.contains('closed');
  if (isOpen) {
    header.classList.add('closed');
    body.style.maxHeight = '0';
  } else {
    header.classList.remove('closed');
    body.style.maxHeight = body.scrollHeight + 'px';
  }
}

// Global exposure
window.toggleGroup = toggleGroup;