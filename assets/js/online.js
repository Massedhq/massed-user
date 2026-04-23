// ── ONLINE EVENT ACCESS ───────────────────────────────
function openOnlineAccess(evIdx) {
  const ev = events[evIdx];
  const streamLink = ev.onlineLink || ('https://stream.massed.io/' + ev.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
  document.getElementById('online-ev-name').textContent = ev.name;
  const dateStr = ev.date ? new Date(ev.date+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '';
  document.getElementById('online-ev-date').textContent = dateStr + (ev.time?' • '+ev.time:'');
  document.getElementById('online-ticket-input').value = '';
  document.getElementById('online-verify-result').style.display = 'none';
  document.getElementById('online-access-granted').style.display = 'none';
  document.getElementById('online-event-link-btn').href = streamLink;
  const displayEl = document.getElementById('online-stream-link-display');
  if (displayEl) displayEl.textContent = streamLink;
  openModal('modal-online-access');
}

function verifyOnlineAccess() {
  const val = document.getElementById('online-ticket-input').value.trim().toUpperCase();
  if (!val) { toast('Please enter your ticket number'); return; }
  const resultEl = document.getElementById('online-verify-result');
  resultEl.style.display = 'block';
  resultEl.innerHTML = '<div style="color:rgba(255,255,255,0.5);font-size:0.85rem;">🔍 Verifying...</div>';
  setTimeout(() => {
    const isValid = val.startsWith('TKT-') && val.length > 10;
    if (isValid) {
      resultEl.style.display = 'none';
      document.getElementById('online-access-granted').style.display = 'block';
    } else {
      resultEl.innerHTML = '<div style="color:#f87171;font-weight:600;">❌ Invalid ticket number. Please check and try again.</div>';
    }
  }, 1200);
}

function downloadOnlineLink() {
  toast('📥 Event access link downloaded!');
}