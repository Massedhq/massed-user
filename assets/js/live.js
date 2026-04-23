function openGoLive() { openModal('modal-golive'); }

// ── LIVE PREVIEW SCREEN CONTROLS ─────────────────────────────────────────────
var lpTimerInterval = null;
var lpTimerSecs = 0;

function lpUpdateProduct() {
  var sel = document.getElementById('lp-product');
  var nameEl = document.getElementById('phone-pname');
  var saleEl = document.getElementById('phone-sale');
  var origEl = document.getElementById('phone-orig');
  var discEl = document.getElementById('phone-disc');
  var card = document.getElementById('phone-product-card');
  if (!sel || !sel.value) {
    if (card) card.style.display = 'none';
    return;
  }
  var parts = sel.value.split('|');
  var name = parts[0] || '';
  var price = parseFloat(parts[1]) || 0;
  if (nameEl) nameEl.textContent = name;
  if (saleEl) saleEl.textContent = '$' + price.toFixed(2);
  if (origEl) origEl.textContent = '$' + (price * 1.3).toFixed(2);
  var pct = Math.round(((price * 1.3 - price) / (price * 1.3)) * 100);
  if (discEl) discEl.textContent = pct + '% OFF';
  if (card) card.style.display = 'block';
}

function lpUpdatePrice() {
  var input = document.getElementById('lp-sale-input');
  var saleEl = document.getElementById('phone-sale');
  if (input && saleEl && input.value) saleEl.textContent = '$' + parseFloat(input.value).toFixed(2);
}

function lpStartTimer() {
  var sel = document.getElementById('lp-timer-sel');
  var timerEl = document.getElementById('phone-timer');
  if (!sel) return;
  var mins = parseInt(sel.value) || 0;
  if (lpTimerInterval) { clearInterval(lpTimerInterval); lpTimerInterval = null; }
  if (mins === 0) { if (timerEl) timerEl.textContent = ''; return; }
  lpTimerSecs = mins * 60;
  var updateTimer = function() {
    if (!timerEl) return;
    var m = Math.floor(lpTimerSecs / 60), s = lpTimerSecs % 60;
    timerEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    if (lpTimerSecs <= 0) { clearInterval(lpTimerInterval); lpTimerInterval = null; timerEl.textContent = 'ENDED'; }
    lpTimerSecs--;
  };
  updateTimer();
  lpTimerInterval = setInterval(updateTimer, 1000);
}

function lpCloseProduct() {
  var card = document.getElementById('phone-product-card');
  if (card) card.style.display = 'none';
  if (lpTimerInterval) { clearInterval(lpTimerInterval); lpTimerInterval = null; }
  toast('Product closed from live view');
}

function lpBringBack() {
  var card = document.getElementById('phone-product-card');
  if (card) card.style.display = 'block';
  lpUpdateProduct();
  toast('Product brought back');
}




var liveMode = null;

function pickMode(mode) {
  liveMode = mode;
  var optLive = document.getElementById('opt-live');
  var optSell = document.getElementById('opt-sell');
  var optPoll = document.getElementById('opt-poll');
  var btnNext = document.getElementById('btn-next');
  if (optLive) optLive.style.border = mode === 'live' ? '2px solid var(--brown)' : '2px solid var(--border)';
  if (optSell) optSell.style.border = mode === 'sell' ? '2px solid var(--brown)' : '2px solid var(--border)';
  if (optPoll) optPoll.style.border = mode === 'poll' ? '2px solid var(--brown)' : '2px solid var(--border)';
  if (btnNext) btnNext.disabled = false;
}

// ── LIVE SESSION ──────────────────────────────────────────────────────────────
var liveDurationInterval = null;
var liveViewerInterval = null;
var liveDurationSecs = 0;
var lpCountdownInterval = null;

function populateLiveProfile() {
  // Pull real display name & handle from Media Profile
  var nameInput = document.querySelector('#mptab-profile-content input[placeholder="Your name"]');
  var displayName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Your Name';
  var handle = displayName.toLowerCase().replace(/\s+/g, '') || 'username';

  var nameEl = document.getElementById('lp-display-name');
  var handleEl = document.getElementById('lp-handle');
  var urlEl = document.getElementById('lp-url-display');
  if (nameEl) nameEl.textContent = displayName;
  if (handleEl) handleEl.textContent = 'massed.io/' + handle;
  if (urlEl) urlEl.textContent = 'massed.io/' + handle;

  // Pull profile photo if set
  var avatarEl = document.getElementById('lp-avatar');
  var profileImg = document.querySelector('.avatar-upload img');
  if (avatarEl && profileImg && profileImg.src) {
    avatarEl.innerHTML = '<img src="' + profileImg.src + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
  }
}

function startLiveDuration() {
  liveDurationSecs = 0;
  if (liveDurationInterval) clearInterval(liveDurationInterval);
  liveDurationInterval = setInterval(function() {
    liveDurationSecs++;
    var m = Math.floor(liveDurationSecs / 60), s = liveDurationSecs % 60;
    var el = document.getElementById('lp-duration');
    if (el) el.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }, 1000);

  // Simulate viewer count gently fluctuating
  if (liveViewerInterval) clearInterval(liveViewerInterval);
  var viewers = 142;
  liveViewerInterval = setInterval(function() {
    viewers += Math.floor(Math.random() * 5) - 1;
    if (viewers < 1) viewers = 1;
    var el = document.getElementById('lp-viewer-count');
    var el2 = document.getElementById('lp-viewers');
    if (el) el.textContent = viewers;
    if (el2) el2.textContent = viewers;
  }, 4000);
}

function liveNext() {
  if (!liveMode) return;
  closeModal('modal-golive');
  if (liveMode === 'sell') {
    openModal('modal-sell');
  } else if (liveMode === 'poll') {
    // Clear poll modal fields fresh
    ['poll-modal-question','poll-modal-opt1','poll-modal-opt2','poll-modal-opt3','poll-modal-opt4'].forEach(function(id){
      var el = document.getElementById(id); if (el) el.value = '';
    });
    var prev = document.getElementById('poll-modal-preview'); if (prev) prev.style.display = 'none';
    // Swap launch button to also start the live session
    var btn = document.getElementById('poll-modal-launch');
    if (btn) btn.setAttribute('onclick','launchPollFromGoLive()');
    openModal('modal-create-poll');
  } else {
    // Go Live (no product)
    var banner = document.getElementById('live-banner');
    if (banner) banner.style.display = 'block';
    var card = document.getElementById('phone-product-card');
    if (card) card.style.display = 'none';
    populateLiveProfile();
    var lpNav = document.querySelector('[onclick*="livepreview"]');
    nav(lpNav || null, 'livepreview');
    startLiveDuration();
    toast('🔴 You are now live!');
    liveMode = null;
  }
}

function launchPollFromGoLive() {
  var q = (document.getElementById('poll-modal-question')||{}).value || '';
  var o1 = (document.getElementById('poll-modal-opt1')||{}).value || '';
  var o2 = (document.getElementById('poll-modal-opt2')||{}).value || '';
  var o3 = (document.getElementById('poll-modal-opt3')||{}).value || '';
  var o4 = (document.getElementById('poll-modal-opt4')||{}).value || '';
  var dur = parseInt((document.getElementById('poll-modal-duration')||{}).value || '0');
  if (!q.trim() || !o1.trim() || !o2.trim()) { toast('⚠️ Add a question and at least 2 options'); return; }
  var opts = [o1, o2];
  if (o3.trim()) opts.push(o3);
  if (o4.trim()) opts.push(o4);
  closeModal('modal-create-poll');
  // Start live session
  var banner = document.getElementById('live-banner');
  if (banner) banner.style.display = 'block';
  var card = document.getElementById('phone-product-card');
  if (card) card.style.display = 'none';
  populateLiveProfile();
  var lpNav = document.querySelector('[onclick*="livepreview"]');
  nav(lpNav || null, 'livepreview');
  startLiveDuration();
  // Launch poll after a brief delay so screen transition completes
  setTimeout(function(){ lpShowPollOnPhone(q, opts, dur); }, 300);
  toast('🔴 You are now live with a poll!');
  // Reset launch button back to normal
  var btn = document.getElementById('poll-modal-launch');
  if (btn) btn.setAttribute('onclick','launchPollFromModal()');
  liveMode = null;
}

function startLiveAndSell() {
  var sel = document.getElementById('sell-product');
  var saleInput = document.getElementById('sell-sale');
  if (!sel || !sel.value) { toast('Please select a product'); return; }

  var productName = sel.value;
  var salePrice = saleInput ? parseFloat(saleInput.value) || 0 : 0;
  var opt = sel.options[sel.selectedIndex];
  var origPrice = parseFloat(opt ? opt.getAttribute('data-price') : 0) || salePrice;
  if (!salePrice) salePrice = origPrice;

  var timerSel = document.getElementById('sell-timer');
  var timerMins = timerSel ? parseInt(timerSel.value) : 0;

  closeModal('modal-sell');
  closeModal('modal-golive');

  // ── Show live banner with all 3 pieces (product + price + timer) ──
  var banner = document.getElementById('live-banner');
  if (banner) banner.style.display = 'block';
  var bannerProduct = document.getElementById('banner-product');
  var bannerPname = document.getElementById('banner-pname');
  var bannerPrice = document.getElementById('banner-price');
  var bannerTimerWrap = document.getElementById('banner-timer-wrap');
  var bannerTimer = document.getElementById('banner-timer');
  var btnCloseProd = document.getElementById('btn-close-prod');
  if (bannerProduct) bannerProduct.style.display = 'flex';
  if (bannerPname) bannerPname.textContent = productName;
  if (bannerPrice) bannerPrice.textContent = '$' + salePrice.toFixed(2);
  if (bannerTimerWrap) bannerTimerWrap.style.display = timerMins > 0 ? 'block' : 'none';
  if (btnCloseProd) btnCloseProd.style.display = 'inline-flex';

  // ── Sync phone mockup on Live Preview screen ──
  var phoneCard = document.getElementById('phone-product-card');
  var phoneName = document.getElementById('phone-pname');
  var phoneSale = document.getElementById('phone-sale');
  var phoneOrig = document.getElementById('phone-orig');
  var phoneDisc = document.getElementById('phone-disc');
  var phoneTimer = document.getElementById('phone-timer');

  if (phoneCard) phoneCard.style.display = 'block';
  if (phoneName) phoneName.textContent = productName;
  if (phoneSale) phoneSale.textContent = '$' + salePrice.toFixed(2);

  if (origPrice > salePrice) {
    if (phoneOrig) { phoneOrig.style.display = 'inline'; phoneOrig.textContent = '$' + origPrice.toFixed(2); }
    var pct = Math.round(((origPrice - salePrice) / origPrice) * 100);
    if (phoneDisc && pct > 0) { phoneDisc.style.display = 'inline'; phoneDisc.textContent = pct + '% OFF'; }
  }

  // ── Sync LP product dropdown + sale price ──
  var lpSel = document.getElementById('lp-product');
  if (lpSel) {
    for (var i = 0; i < lpSel.options.length; i++) {
      if (lpSel.options[i].value.split('|')[0] === productName) { lpSel.selectedIndex = i; break; }
    }
  }
  var lpSaleInput = document.getElementById('lp-sale-input');
  if (lpSaleInput) lpSaleInput.value = salePrice.toFixed(2);
  var lpTimerSel = document.getElementById('lp-timer-sel');
  if (lpTimerSel && timerMins > 0) {
    for (var j = 0; j < lpTimerSel.options.length; j++) {
      if (parseInt(lpTimerSel.options[j].value) === timerMins) { lpTimerSel.selectedIndex = j; break; }
    }
  }

  // ── Populate real profile data ──
  populateLiveProfile();

  // ── Navigate to Live Preview screen ──
  var lpNav = document.querySelector('[onclick*="livepreview"]');
  nav(lpNav || null, 'livepreview');
  startLiveDuration();

  // ── Start countdown timer ──
  if (timerMins > 0) {
    var secs = timerMins * 60;
    if (phoneTimer) { phoneTimer.style.display = 'inline'; phoneTimer.textContent = timerMins + ':00'; }
    if (bannerTimer) bannerTimer.textContent = timerMins + ':00';
    if (lpCountdownInterval) clearInterval(lpCountdownInterval);
    lpCountdownInterval = setInterval(function() {
      secs--;
      var m2 = Math.floor(secs / 60), s2 = secs % 60;
      var t = m2 + ':' + (s2 < 10 ? '0' : '') + s2;
      if (phoneTimer) phoneTimer.textContent = t;
      if (bannerTimer) bannerTimer.textContent = t;
      if (secs <= 0) {
        clearInterval(lpCountdownInterval);
        if (phoneTimer) phoneTimer.style.display = 'none';
        if (bannerTimerWrap) bannerTimerWrap.style.display = 'none';
        stopLive();
        toast('⏰ Sale timer ended — live session closed.');
      }
    }, 1000);
  }

  toast('🔴 You are now live & selling ' + productName + '!');
  liveMode = null;
}

function stopLive() {
  var banner = document.getElementById('live-banner');
  if (banner) banner.style.display = 'none';
  if (liveDurationInterval) { clearInterval(liveDurationInterval); liveDurationInterval = null; }
  if (liveViewerInterval) { clearInterval(liveViewerInterval); liveViewerInterval = null; }
  if (lpCountdownInterval) { clearInterval(lpCountdownInterval); lpCountdownInterval = null; }
  if (lpTimerInterval) { clearInterval(lpTimerInterval); lpTimerInterval = null; }
  var card = document.getElementById('phone-product-card');
  if (card) card.style.display = 'none';
  toast('Live session ended.');
  liveMode = null;
}

function onSellProduct() {
  var sel = document.getElementById('sell-product');
  var btnGo = document.getElementById('btn-go-sell');
  var details = document.getElementById('sell-details');
  if (!sel || !sel.value) {
    if (details) details.style.display = 'none';
    if (btnGo) btnGo.disabled = true;
    return;
  }
  var opt = sel.options[sel.selectedIndex];
  var price = opt.getAttribute('data-price');
  var origInput = document.getElementById('sell-orig');
  var saleInput = document.getElementById('sell-sale');
  if (origInput && price) origInput.value = price;
  if (saleInput && price) saleInput.value = price;
  if (details) details.style.display = 'block';
  if (btnGo) btnGo.disabled = false;
}


function endLive() {
  if (!confirm('Are you sure you want to end your live session?')) return;
  stopLive();
}

function togglePause() {
  var btn = document.getElementById('btn-pause');
  var banner = document.getElementById('live-banner');
  if (!btn) return;
  var isPaused = btn.getAttribute('data-paused') === 'true';
  if (isPaused) {
    btn.setAttribute('data-paused', 'false');
    btn.textContent = '⏸ Pause';
    btn.style.background = '#fef3c7';
    btn.style.color = '#d97706';
    if (banner) banner.style.opacity = '1';
    toast('▶ Live resumed');
  } else {
    btn.setAttribute('data-paused', 'true');
    btn.textContent = '▶ Resume';
    btn.style.background = '#dcfce7';
    btn.style.color = '#16a34a';
    if (banner) banner.style.opacity = '0.6';
    toast('⏸ Live paused');
  }
}

// Global exposure
window.openGoLive = openGoLive;