// ================================
// USER SETTINGS / ACCOUNT
// ================================


function submitWithdrawal() {
  var amt = document.getElementById('withdraw-amount');
  if (!amt || !amt.value || parseFloat(amt.value) <= 0) { toast('Please enter an amount to withdraw'); return; }
  if (parseFloat(amt.value) > 1250) { toast('Amount exceeds available balance'); return; }
  closeModal('modal-withdraw-funds');
  if (amt) amt.value = '';
  toast('✓ Withdrawal of $' + parseFloat(document.getElementById('withdraw-amount') ? 0 : 0).toFixed(2) + ' initiated! Arrives in 3-5 business days.');
}

function sendPasswordCode() {
  var phone = document.getElementById('acct-phone');
  var pass = document.getElementById('acct-new-pass');
  if (!phone || !phone.value.trim()) { toast('Please enter your phone number first'); return; }
  if (!pass || !pass.value.trim()) { toast('Please enter a new password'); return; }
  document.getElementById('pass-code-wrap').style.display = 'block';
  toast('✓ 6-digit code sent to ' + phone.value.replace(/\d(?=\d{4})/g,'*'));
}

function verifyPasswordCode() {
  var code = document.getElementById('acct-code');
  if (!code || code.value.length < 6) { toast('Please enter the 6-digit code'); return; }
  document.getElementById('pass-code-wrap').style.display = 'none';
  if (document.getElementById('acct-new-pass')) document.getElementById('acct-new-pass').value = '';
  if (document.getElementById('acct-code')) document.getElementById('acct-code').value = '';
  toast('✓ Password updated successfully!');
}

function toggle2FA(cb) {
  var track = document.getElementById('2fa-track');
  var thumb = document.getElementById('2fa-thumb');
  if (cb.checked) {
    track.style.background = 'var(--brown)';
    thumb.style.left = '23px';
    toast('✓ Two-factor authentication enabled');
  } else {
    track.style.background = '#e5e7eb';
    thumb.style.left = '3px';
    toast('Two-factor authentication disabled');
  }
}

function saveAccount() {
  toast('✓ Account updated!');
}

// ── ACCOUNT RECOVERY MODAL ────────────────────────────────────────────────────
var _recoveryChoice = null;
function selectRecoveryOption(opt) {
  _recoveryChoice = opt;
  var payEl = document.getElementById('recovery-option-pay');
  var autoEl = document.getElementById('recovery-option-auto');
  var btn = document.getElementById('recovery-confirm-btn');
  if (payEl) payEl.style.border = opt === 'pay' ? '2px solid rgba(196,154,108,0.9)' : '2px solid rgba(196,154,108,0.4)';
  if (autoEl) autoEl.style.border = opt === 'auto' ? '2px solid rgba(99,102,241,0.8)' : '2px solid rgba(99,102,241,0.25)';
  if (btn) {
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    btn.textContent = opt === 'pay' ? 'Pay $30.00 & Restore Account →' : 'Start Auto-Recovery →';
  }
}

function confirmRecovery() {
  if (!_recoveryChoice) return;
  var msg = _recoveryChoice === 'pay'
    ? '✓ Payment processed! Your account has been fully restored.'
    : '✓ Auto-Recovery activated! 20% of each sale will clear your balance automatically.';
  toast(msg);
  // Close any overlay parent
  var overlay = document.getElementById('recovery-overlay');
  if (overlay) overlay.style.display = 'none';
  _recoveryChoice = null;
}

// Global exposure
window.selectRecoveryOption = selectRecoveryOption;
window.confirmRecovery = confirmRecovery;




