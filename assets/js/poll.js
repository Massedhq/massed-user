// ── POLL FUNCTIONS ──
var lpPollTimerInterval = null;
var lpPollVotes = [];

function lpLaunchPoll() {
  var q = (document.getElementById('lp-poll-question')||{}).value || '';
  var o1 = (document.getElementById('lp-poll-opt1')||{}).value || '';
  var o2 = (document.getElementById('lp-poll-opt2')||{}).value || '';
  var o3 = (document.getElementById('lp-poll-opt3')||{}).value || '';
  var o4 = (document.getElementById('lp-poll-opt4')||{}).value || '';
  if (!q.trim() || !o1.trim() || !o2.trim()) { toast('⚠️ Add a question and at least 2 options'); return; }
  var opts = [o1, o2];
  if (o3.trim()) opts.push(o3);
  if (o4.trim()) opts.push(o4);
  lpShowPollOnPhone(q, opts);
  toast('📊 Poll launched to your live!');
}

function launchPollFromModal() {
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
  lpShowPollOnPhone(q, opts, dur);
  closeModal('modal-create-poll');
  toast('📊 Poll launched to your live!');
}

function lpShowPollOnPhone(question, opts, durationSecs) {
  if (lpPollTimerInterval) { clearInterval(lpPollTimerInterval); lpPollTimerInterval = null; }
  lpPollVotes = opts.map(function(){ return Math.floor(Math.random()*18)+2; });
  var card = document.getElementById('phone-poll-card');
  var qEl = document.getElementById('phone-poll-question');
  var optsEl = document.getElementById('phone-poll-options');
  var timerEl = document.getElementById('phone-poll-timer');
  if (!card || !qEl || !optsEl) return;
  qEl.textContent = question;
  optsEl.innerHTML = '';
  renderPhonePollBars(opts, optsEl);
  card.style.display = 'block';
  // Simulate votes growing
  var voteInterval = setInterval(function() {
    var idx = Math.floor(Math.random() * lpPollVotes.length);
    lpPollVotes[idx] += Math.floor(Math.random() * 3) + 1;
    renderPhonePollBars(opts, optsEl);
  }, 1800);
  // Duration countdown
  if (durationSecs && durationSecs > 0) {
    var remaining = durationSecs;
    timerEl.textContent = formatPollTime(remaining);
    lpPollTimerInterval = setInterval(function() {
      remaining--;
      timerEl.textContent = formatPollTime(remaining);
      if (remaining <= 0) { clearInterval(lpPollTimerInterval); clearInterval(voteInterval); lpPollTimerInterval = null; lpEndPoll(); }
    }, 1000);
  } else {
    timerEl.textContent = '';
    // still clear vote sim after 5 min
    setTimeout(function(){ clearInterval(voteInterval); }, 300000);
  }
}

function renderPhonePollBars(opts, container) {
  var total = lpPollVotes.reduce(function(a,b){return a+b;},0) || 1;
  container.innerHTML = '';
  opts.forEach(function(opt, i) {
    var pct = Math.round((lpPollVotes[i]/total)*100);
    var bar = document.createElement('div');
    bar.style.cssText = 'position:relative;cursor:pointer;';
    bar.innerHTML = '<div style="position:absolute;left:0;top:0;bottom:0;width:'+pct+'%;background:rgba(192,122,80,0.28);border-radius:6px;transition:width 0.4s;"></div>'
      +'<div style="position:relative;display:flex;align-items:center;justify-content:space-between;padding:5px 8px;border:1px solid rgba(192,122,80,0.2);border-radius:6px;">'
      +'<span style="color:#fff;font-size:0.6rem;font-weight:600;">'+opt+'</span>'
      +'<span style="color:#D4956E;font-size:0.6rem;font-weight:800;">'+pct+'%</span>'
      +'</div>';
    bar.onclick = function() {
      lpPollVotes[i] += 1;
      renderPhonePollBars(opts, container);
    };
    container.appendChild(bar);
  });
}

function formatPollTime(secs) {
  var m = Math.floor(secs/60); var s = secs%60;
  return m+':'+(s<10?'0':'')+s;
}

function lpEndPoll() {
  if (lpPollTimerInterval) { clearInterval(lpPollTimerInterval); lpPollTimerInterval = null; }
  var card = document.getElementById('phone-poll-card');
  if (card) card.style.display = 'none';
  toast('Poll ended');
}

// ── CREATE POLL SCREEN ──
var cpSelectedDuration = 0;

function cpSetDuration(val, btn) {
  cpSelectedDuration = val;
  document.querySelectorAll('.cp-dur-btn').forEach(function(b) {
    b.style.border = '1.5px solid var(--border)';
    b.style.background = 'var(--cream)';
    b.style.color = 'var(--text-dim)';
  });
  btn.style.border = '1.5px solid var(--brown)';
  btn.style.background = 'var(--brown-bg2)';
  btn.style.color = 'var(--brown-dark)';
  // update timer label in phone preview
  var timerLabel = document.getElementById('cp-phone-timer-label');
  if (timerLabel) timerLabel.textContent = val > 0 ? formatPollTime(val) : '';
}

function cpUpdatePreview() {
  var q = (document.getElementById('cp-question')||{}).value || '';
  var o1 = (document.getElementById('cp-opt1')||{}).value || '';
  var o2 = (document.getElementById('cp-opt2')||{}).value || '';
  var o3 = (document.getElementById('cp-opt3')||{}).value || '';
  var o4 = (document.getElementById('cp-opt4')||{}).value || '';
  // character counter
  var counter = document.getElementById('cp-q-count');
  if (counter) counter.textContent = q.length;
  // phone preview question
  var qEl = document.getElementById('cp-phone-question');
  if (qEl) {
    qEl.textContent = q || 'Your question will appear here…';
    qEl.style.color = q ? '#fff' : 'rgba(255,255,255,0.4)';
    qEl.style.fontStyle = q ? 'normal' : 'italic';
  }
  // phone preview options
  var optsEl = document.getElementById('cp-phone-options');
  if (!optsEl) return;
  var opts = [o1, o2, o3, o4].filter(function(x){ return x.trim(); });
  if (opts.length === 0) opts = ['Option 1', 'Option 2'];
  optsEl.innerHTML = opts.map(function(opt, i) {
    var hasText = (i < 2) ? true : opt.trim();
    return '<div style="padding:5px 8px;border:1px solid rgba(255,255,255,' + (hasText ? '0.15' : '0.06') + ');border-radius:6px;font-size:0.58rem;color:rgba(255,255,255,' + (hasText ? '0.75' : '0.25') + ');">' + (opt || 'Option ' + (i+1)) + '</div>';
  }).join('');
}

function cpLaunchPoll() {
  var q = (document.getElementById('cp-question')||{}).value || '';
  var o1 = (document.getElementById('cp-opt1')||{}).value || '';
  var o2 = (document.getElementById('cp-opt2')||{}).value || '';
  var o3 = (document.getElementById('cp-opt3')||{}).value || '';
  var o4 = (document.getElementById('cp-opt4')||{}).value || '';
  if (!q.trim()) { toast('⚠️ Please add a poll question'); return; }
  if (!o1.trim() || !o2.trim()) { toast('⚠️ Please add at least 2 options'); return; }
  var opts = [o1, o2];
  if (o3.trim()) opts.push(o3);
  if (o4.trim()) opts.push(o4);
  lpShowPollOnPhone(q, opts, cpSelectedDuration);
  // Show live results panel on the page
  var status = document.getElementById('cp-active-status');
  if (status) {
    status.style.display = 'block';
    cpRenderResults(opts);
    // Simulate votes growing on screen
    var voteRefresh = setInterval(function() {
      if (document.getElementById('cp-active-status') && document.getElementById('cp-active-status').style.display !== 'none') {
        cpRenderResults(opts);
      } else {
        clearInterval(voteRefresh);
      }
    }, 2000);
  }
  toast('📊 Poll launched to your live!');
}

function cpRenderResults(opts) {
  var el = document.getElementById('cp-results-list');
  if (!el) return;
  var total = lpPollVotes.reduce(function(a,b){return a+b;},0) || 1;
  el.innerHTML = opts.map(function(opt, i) {
    var pct = Math.round(((lpPollVotes[i]||0)/total)*100);
    return '<div style="font-size:0.8rem;">'
      + '<div style="display:flex;justify-content:space-between;margin-bottom:3px;">'
      + '<span style="font-weight:600;color:var(--text);">' + opt + '</span>'
      + '<span style="font-weight:800;color:var(--brown);">' + pct + '%</span>'
      + '</div>'
      + '<div style="height:6px;background:var(--cream3);border-radius:4px;overflow:hidden;">'
      + '<div style="height:100%;width:' + pct + '%;background:var(--brown);border-radius:4px;transition:width 0.5s;"></div>'
      + '</div></div>';
  }).join('');
}

function cpEndPoll() {
  lpEndPoll();
  var status = document.getElementById('cp-active-status');
  if (status) status.style.display = 'none';
}