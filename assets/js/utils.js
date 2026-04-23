// ================================
// SECURITY / UTILITIES
// ================================

// Escapes user input to prevent XSS attacks
function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}





function autoResizeMsgInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}


function handleMsgAttachment(event) {
  var file = event.target.files[0];
  if (!file) return;
  toast('📎 ' + file.name + ' attached');
}

function toggleEqualLink() {
  var btn = document.getElementById('sp-equal-link-btn');
  var icon = document.getElementById('sp-eq-icon');
  var label = document.getElementById('sp-eq-label');
  if (!btn) return;
  var linked = btn.getAttribute('data-linked') === 'true';
  if (linked) {
    // Unlink
    btn.setAttribute('data-linked','false');
    btn.style.background = 'rgba(255,255,255,0.08)';
    btn.style.borderColor = 'rgba(255,255,255,0.2)';
    btn.style.boxShadow = 'none';
    if (icon) { icon.style.opacity='0.55'; icon.style.filter='brightness(10) invert(1)'; }
    if (label) { label.textContent='OPEN TO LINK'; label.style.color='rgba(255,255,255,0.55)'; }
    toast('Equal Link disconnected');
  } else {
    // Link — animate and connect
    btn.setAttribute('data-linked','true');
    btn.style.background = 'rgba(192,122,80,0.25)';
    btn.style.borderColor = '#D4956E';
    btn.style.boxShadow = '0 0 14px rgba(212,149,110,0.5)';
    if (icon) { icon.style.opacity='1'; icon.style.filter='brightness(0) saturate(100%) invert(62%) sepia(43%) saturate(600%) hue-rotate(340deg) brightness(105%)'; }
    if (label) { label.textContent='LINKED'; label.style.color='#D4956E'; }
    toast('⚡ Equal Link activated — profiles are now linked!');
  }
}



function switchBackToCreator() {
  nav(document.querySelector('.nav-item[onclick*="' + _prevScreenBeforeSwitch + '"]') || document.querySelector('.nav-item'), _prevScreenBeforeSwitch);
  toast('✓ Switched back to your business dashboard');
}
