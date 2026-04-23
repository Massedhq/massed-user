// ── SPARK FOUNDER ─────────────────────────────────────────────────────────────
var sparkFounders = [];

function openSparkFounderModal() {
  document.getElementById('sf-step-1').style.display = '';
  document.getElementById('sf-step-2').style.display = 'none';
  document.getElementById('sf-email').value = '';
  document.getElementById('sf-relationship').value = '';
  document.getElementById('sf-note').value = '';
  openModal('modal-spark-founder');
}

function sfProceedToSend() {
  var email = document.getElementById('sf-email').value.trim();
  var relationship = document.getElementById('sf-relationship').value;
  var note = document.getElementById('sf-note').value.trim();
  if (!email || !email.includes('@')) { toast('Please enter a valid email address'); return; }

  // Create founder record
  var id = Date.now();
  var slug = 'founder-' + id.toString(36);
  var inviteLink = 'https://massed.app/join/spark/' + slug;
  var founder = {
    id: id,
    email: email,
    relationship: relationship || 'Founder',
    note: note,
    status: 'pending',           // pending → active → graduated → independent
    inviteLink: inviteLink,
    inviteSentAt: new Date().toISOString(),
    acceptedAt: null,
    urlSlug: null,
    displayName: null,
    stripeConnected: false,
    paymentsCompleted: 0,         // 0–12
    paymentHistory: [],
    freeHostingStartDate: null,
    freeHostingEndDate: null,
    independentSince: null,
    nextBillingDate: sfNextBillingDate(),
    monthlyFee: 15
  };

  sparkFounders.unshift(founder);
  sfUpdateStats();
  renderSparkFounders();

  // Show confirmation step
  document.getElementById('sf-step-1').style.display = 'none';
  document.getElementById('sf-step-2').style.display = '';
  document.getElementById('sf-confirm-email').textContent = email;

  // Simulate first payment record
  sfRecordPayment(id);
}

function sfRecordPayment(id) {
  var f = sparkFounders.find(function(x){ return x.id === id; });
  if (!f) return;
  f.paymentHistory.push({
    num: f.paymentsCompleted + 1,
    amount: 15,
    date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
    status: 'paid'
  });
  f.paymentsCompleted = Math.min(f.paymentsCompleted + 1, 12);
  f.nextBillingDate = sfNextBillingDate();

  // Status transitions
  if (f.status === 'pending') f.status = 'active';

  // 12th payment — trigger graduation
  if (f.paymentsCompleted >= 12 && f.status !== 'graduated' && f.status !== 'independent') {
    sfGraduate(id);
  }
  sfUpdateStats();
  renderSparkFounders();
}

function sfGraduate(id) {
  var f = sparkFounders.find(function(x){ return x.id === id; });
  if (!f) return;
  f.status = 'graduated';
  var start = new Date();
  var end = new Date();
  end.setFullYear(end.getFullYear() + 2);
  f.freeHostingStartDate = start.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  f.freeHostingEndDate = end.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});

  // After 2 years, they become independent (simulated)
  // In production: a scheduled job would trigger sfSetIndependent(id) at freeHostingEndDate

  // Show graduation toast
  setTimeout(function(){
    toast('🎓 ' + (f.displayName || f.email) + ' has graduated! 2-year free hosting activated.');
  }, 600);
}

function sfSetIndependent(id) {
  var f = sparkFounders.find(function(x){ return x.id === id; });
  if (!f || f.status !== 'graduated') return;
  f.status = 'independent';
  f.independentSince = new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  sfUpdateStats();
  renderSparkFounders();
}

function sfNextBillingDate() {
  var d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}

function sfFinish() {
  closeModal('modal-spark-founder');
  renderSparkFounders();
}

function sfUpdateStats() {
  var active = sparkFounders.filter(function(f){ return f.status === 'active'; }).length;
  var graduated = sparkFounders.filter(function(f){ return f.status === 'graduated' || f.status === 'independent'; }).length;
  var pending = sparkFounders.filter(function(f){ return f.status === 'pending'; }).length;
  var spend = sparkFounders.filter(function(f){ return f.status === 'active' || f.status === 'pending'; }).length * 15;

  var el = document.getElementById('sf-stat-active'); if(el) el.textContent = active;
  var el2 = document.getElementById('sf-stat-graduated'); if(el2) el2.textContent = graduated;
  var el3 = document.getElementById('sf-stat-spend'); if(el3) el3.textContent = '$' + spend;
  var el4 = document.getElementById('sf-stat-pending'); if(el4) el4.textContent = pending;
}

function renderSparkFounders() {
  var list = document.getElementById('sf-founders-list');
  var empty = document.getElementById('sf-empty');
  if (!list) return;

  if (sparkFounders.length === 0) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  list.innerHTML = sparkFounders.map(function(f) {
    var statusColors = {
      pending: { bg:'#fef3c7', text:'#92400e', label:'Pending Invite' },
      active: { bg:'#dcfce7', text:'#166534', label:'Active' },
      graduated: { bg:'#dbeafe', text:'#1e3a8a', label:'🎓 Graduated — Free Hosting' },
      independent: { bg:'#f3e8ff', text:'#4a1d96', label:'Independent Owner' }
    };
    var sc = statusColors[f.status] || statusColors.pending;
    var pct = Math.round((f.paymentsCompleted / 12) * 100);
    var initials = (f.displayName || f.email).substring(0,2).toUpperCase();

    return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;">'
      + '<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px;">'
        + '<div style="display:flex;align-items:center;gap:12px;">'
          + '<div style="width:44px;height:44px;border-radius:50%;background:var(--brown-bg2);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;color:var(--brown);flex-shrink:0;">' + initials + '</div>'
          + '<div>'
            + '<div style="font-weight:700;font-size:0.95rem;color:var(--text);">' + (f.displayName || 'Awaiting setup') + '</div>'
            + '<div style="font-size:0.78rem;color:var(--text-dim);">' + f.email + (f.relationship ? ' · ' + f.relationship : '') + '</div>'
            + (f.urlSlug ? '<div style="font-size:0.72rem;color:var(--brown);margin-top:1px;">massed.app/' + f.urlSlug + '</div>' : '')
          + '</div>'
        + '</div>'
        + '<span style="font-size:0.72rem;font-weight:700;padding:4px 10px;border-radius:20px;background:' + sc.bg + ';color:' + sc.text + ';">' + sc.label + '</span>'
      + '</div>'

      // 12-month graduation progress
      + '<div style="margin-bottom:14px;">'
        + '<div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text-dim);margin-bottom:5px;">'
          + '<span>Graduation Progress — ' + f.paymentsCompleted + ' of 12 payments</span>'
          + '<span style="font-weight:700;color:' + (pct >= 100 ? '#16a34a' : 'var(--brown)') + ';">' + pct + '%</span>'
        + '</div>'
        + '<div style="background:var(--cream3);border-radius:4px;height:8px;overflow:hidden;">'
          + '<div style="background:' + (pct >= 100 ? '#16a34a' : 'linear-gradient(90deg,var(--brown-light),var(--brown-dark))') + ';height:100%;width:' + pct + '%;border-radius:4px;transition:width 0.5s;"></div>'
        + '</div>'
        + (f.status === 'graduated' ? '<div style="font-size:0.72rem;color:#1e3a8a;margin-top:5px;">🎓 Free hosting: ' + f.freeHostingStartDate + ' → ' + f.freeHostingEndDate + '</div>' : '')
        + (f.status === 'independent' ? '<div style="font-size:0.72rem;color:#4a1d96;margin-top:5px;">⚡ Independent owner since ' + f.independentSince + '</div>' : '')
      + '</div>'

      // Billing info
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">'
        + '<div style="background:var(--cream);border-radius:9px;padding:9px 12px;">'
          + '<div style="font-size:0.62rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-dim);margin-bottom:3px;">Monthly Fee</div>'
          + '<div style="font-size:0.9rem;font-weight:700;color:var(--brown);">$' + f.monthlyFee + '/mo</div>'
        + '</div>'
        + '<div style="background:var(--cream);border-radius:9px;padding:9px 12px;">'
          + '<div style="font-size:0.62rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-dim);margin-bottom:3px;">'
            + (f.status === 'active' ? 'Next Billing' : f.status === 'graduated' ? 'Free Until' : 'Status')
          + '</div>'
          + '<div style="font-size:0.85rem;font-weight:600;color:var(--text);">'
            + (f.status === 'active' ? f.nextBillingDate : f.status === 'graduated' ? f.freeHostingEndDate : f.status === 'pending' ? 'Awaiting signup' : 'Independent')
          + '</div>'
        + '</div>'
      + '</div>'

      // Privacy notice
      + '<div style="background:var(--cream);border-radius:8px;padding:8px 12px;font-size:0.72rem;color:var(--text-dim);margin-bottom:12px;display:flex;align-items:center;gap:6px;">'
        + '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>'
        + 'Client data, messages, bookings &amp; revenue are private to your Founder'
      + '</div>'

      // Actions
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;">'
        + '<button onclick="sfViewDetail(' + f.id + ')" style="padding:8px 14px;background:var(--cream2);color:var(--text-mid);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;font-weight:700;">View Details</button>'
        + (f.status === 'active' ? '<button onclick="sfSimulatePayment(' + f.id + ')" style="padding:8px 14px;background:var(--brown-bg2);color:var(--brown-dark);border:1px solid var(--brown);border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;font-weight:700;">+ Record Payment</button>' : '')
        + (f.status === 'pending' ? '<button onclick="sfResendInvite(' + f.id + ')" style="padding:8px 14px;background:#fff;color:var(--text-mid);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;font-weight:700;">Resend Invite</button>' : '')
        + '<button onclick="sfCancelSeat(' + f.id + ')" style="padding:8px 14px;background:#fee2e2;color:#dc2626;border:1px solid #fca5a5;border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;font-weight:700;">Cancel Seat</button>'
      + '</div>'
      + '</div>';
  }).join('');
}

function sfSimulatePayment(id) {
  var f = sparkFounders.find(function(x){ return x.id === id; });
  if (!f) return;
  if (f.paymentsCompleted >= 12) { toast('All 12 payments completed — already graduated!'); return; }
  sfRecordPayment(id);
  toast('✓ Payment #' + f.paymentsCompleted + ' recorded for ' + (f.displayName || f.email));
}

function sfResendInvite(id) {
  var f = sparkFounders.find(function(x){ return x.id === id; });
  if (!f) return;
  toast('✓ Invite resent to ' + f.email);
}

function sfCancelSeat(id) {
  if (!confirm('Cancel this Spark Founder seat? This stops billing and their account will be suspended.')) return;
  sparkFounders = sparkFounders.filter(function(x){ return x.id !== id; });
  sfUpdateStats();
  renderSparkFounders();
  toast('Spark Founder seat cancelled.');
}

function sfViewDetail(id) {
  var f = sparkFounders.find(function(x){ return x.id === id; });
  if (!f) return;
  var title = document.getElementById('sf-detail-title');
  var body = document.getElementById('sf-detail-body');
  if (title) title.textContent = '⚡ ' + (f.displayName || f.email);

  var logHTML = f.paymentHistory.length > 0
    ? f.paymentHistory.map(function(p){
        return '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:0.82rem;">'
          + '<span style="color:var(--text-dim);">Payment #' + p.num + ' · ' + p.date + '</span>'
          + '<span style="font-weight:700;color:#16a34a;">+$' + p.amount + '</span>'
          + '</div>';
      }).join('')
    : '<div style="font-size:0.82rem;color:var(--text-dim);padding:10px 0;">No payments recorded yet.</div>';

  body.innerHTML = '<div style="display:flex;flex-direction:column;gap:14px;font-size:0.85rem;">'

    + '<div style="background:var(--cream);border-radius:10px;padding:12px 14px;">'
      + '<div style="font-size:0.62rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px;">Founder Info</div>'
      + '<div><strong>Email:</strong> ' + f.email + '</div>'
      + '<div style="margin-top:4px;"><strong>Relationship:</strong> ' + (f.relationship || '—') + '</div>'
      + (f.urlSlug ? '<div style="margin-top:4px;"><strong>URL:</strong> massed.app/' + f.urlSlug + '</div>' : '<div style="margin-top:4px;color:var(--text-dim);">URL not yet chosen</div>')
      + '<div style="margin-top:4px;"><strong>Stripe:</strong> ' + (f.stripeConnected ? '✓ Connected (their own account)' : 'Not connected yet') + '</div>'
      + '<div style="margin-top:4px;"><strong>Status:</strong> ' + f.status + '</div>'
    + '</div>'

    + '<div style="background:var(--cream);border-radius:10px;padding:12px 14px;">'
      + '<div style="font-size:0.62rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px;">12-Month Cycle — ' + f.paymentsCompleted + '/12 Payments</div>'
      + '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;">'
        + Array.from({length:12}).map(function(_,i){
            var done = i < f.paymentsCompleted;
            return '<div style="width:22px;height:22px;border-radius:4px;background:' + (done ? 'var(--brown)' : 'var(--cream3)') + ';border:1px solid ' + (done ? 'var(--brown-dark)' : 'var(--border)') + ';display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700;color:' + (done ? '#fff' : 'var(--text-dim)') + ';">' + (i+1) + '</div>';
          }).join('')
      + '</div>'
      + (f.status === 'graduated' ? '<div style="background:#dbeafe;border-radius:8px;padding:8px 10px;font-size:0.78rem;color:#1e3a8a;">🎓 Graduated — Free hosting active until ' + f.freeHostingEndDate + '</div>' : '')
      + (f.status === 'active' && f.paymentsCompleted < 12 ? '<div style="font-size:0.75rem;color:var(--text-dim);">Next billing: ' + f.nextBillingDate + ' · Graduates after payment #12</div>' : '')
    + '</div>'

    + '<div style="background:var(--cream);border-radius:10px;padding:12px 14px;">'
      + '<div style="font-size:0.62rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;">Payment History</div>'
      + logHTML
    + '</div>'

    + '<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:12px 14px;font-size:0.78rem;color:#166534;line-height:1.6;">'
      + '🔒 <strong>Privacy Firewall Active.</strong> You cannot view their client data, messages, booking details, or revenue. You only see billing status shown above.'
    + '</div>'
    + '</div>';

  openModal('modal-sf-detail');
}