// ── SUBSCRIPTIONS / MEMBERSHIPS ────────────────────────────────────────────────
var subsMembers = [
  { id:1, fname:'Ava', lname:'Thompson', email:'ava@email.com', engagement:'Active', subscription:'Premium — $39.99/mo', membership:'Platinum', billing:39.99, nextPayment:'Apr 15, 2026', balanceDue:0, fees:0, status:'active' },
  { id:2, fname:'Marcus', lname:'Lee', email:'marcus@email.com', engagement:'Active', subscription:'Standard — $19.99/mo', membership:'Gold', billing:19.99, nextPayment:'Apr 18, 2026', balanceDue:0, fees:0, status:'active' },
  { id:3, fname:'Jasmine', lname:'Rivera', email:'jasmine@email.com', engagement:'Inactive', subscription:'Basic — $9.99/mo', membership:'', billing:9.99, nextPayment:'Apr 10, 2026', balanceDue:9.99, fees:5, status:'late' },
  { id:4, fname:'Derek', lname:'Washington', email:'derek@email.com', engagement:'Active', subscription:'', membership:'Silver', billing:0, nextPayment:'—', balanceDue:0, fees:0, status:'subscriber' },
  { id:5, fname:'Priya', lname:'Patel', email:'priya@email.com', engagement:'Active', subscription:'Premium — $39.99/mo', membership:'Platinum', billing:39.99, nextPayment:'Apr 22, 2026', balanceDue:0, fees:0, status:'active' },
  { id:6, fname:'Tyrone', lname:'Brooks', email:'tyrone@email.com', engagement:'Paused', subscription:'Standard — $19.99/mo', membership:'Gold', billing:19.99, nextPayment:'May 1, 2026', balanceDue:39.98, fees:10, status:'late' },
  { id:7, fname:'Sofia', lname:'Martinez', email:'sofia@email.com', engagement:'Active', subscription:'Basic — $9.99/mo', membership:'', billing:9.99, nextPayment:'Apr 28, 2026', balanceDue:0, fees:0, status:'subscription' },
  { id:8, fname:'Jordan', lname:'Kim', email:'jordan@email.com', engagement:'Active', subscription:'', membership:'', billing:0, nextPayment:'—', balanceDue:0, fees:0, status:'subscriber' },
];
var subsMemberIdCounter = 20;
var subsActiveFilter = 'all';
var currentSubsMember = null;

function filterSubsTable(btn, filter) {
  document.querySelectorAll('.subs-filter').forEach(function(b) {
    b.style.background = b.classList.contains('subs-filter') && b.dataset.late ? '#fee2e2' : '#fff';
    b.style.color = 'var(--text-dim)';
    b.style.borderColor = 'var(--border)';
  });
  btn.style.background = filter === 'late' ? '#dc2626' : 'var(--brown)';
  btn.style.color = '#fff';
  btn.style.borderColor = filter === 'late' ? '#dc2626' : 'var(--brown)';
  subsActiveFilter = filter;
  renderSubsTable();
}

function renderSubsTable() {
  var tbody = document.getElementById('subs-table-body');
  if (!tbody) return;
  var filtered = subsMembers.filter(function(m) {
    if (subsActiveFilter === 'all') return true;
    if (subsActiveFilter === 'late') return m.status === 'late';
    if (subsActiveFilter === 'subscriber') return !m.subscription && !m.membership;
    if (subsActiveFilter === 'subscription') return !!m.subscription;
    if (subsActiveFilter === 'membership') return !!m.membership;
    return true;
  });
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="padding:32px;text-align:center;color:var(--text-dim);font-size:0.85rem;">No members found</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(function(m) {
    var engColor = m.engagement === 'Active' ? '#16a34a' : m.engagement === 'Paused' ? '#d97706' : '#6b7280';
    var engBg = m.engagement === 'Active' ? '#dcfce7' : m.engagement === 'Paused' ? '#fef3c7' : '#f3f4f6';
    var subBadge = m.subscription
      ? '<span style="font-size:0.72rem;font-weight:700;color:#16a34a;">'+m.subscription+'</span>'
      : '<span style="font-size:0.72rem;color:var(--text-dim);">—</span>';
    var memBadge = m.membership
      ? '<span style="padding:2px 8px;background:var(--brown-bg);color:var(--brown);border-radius:8px;font-size:0.7rem;font-weight:700;">'+m.membership+'</span>'
      : '<span style="font-size:0.72rem;color:var(--text-dim);">—</span>';
    var balanceColor = m.balanceDue > 0 ? '#dc2626' : 'var(--text-dim)';
    var lateBadge = m.fees > 0 ? ' <span style="font-size:0.65rem;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:6px;font-weight:700;">+$'+m.fees+' fee</span>' : '';
    return '<tr class="subs-row">'
      + '<td style="padding:14px;"><div style="font-weight:700;font-size:0.88rem;">'+m.fname+' '+m.lname+'</div><div style="font-size:0.72rem;color:var(--text-dim);">'+m.email+'</div></td>'
      + '<td style="padding:14px;"><span style="padding:3px 10px;background:'+engBg+';color:'+engColor+';border-radius:10px;font-size:0.72rem;font-weight:700;">'+m.engagement+'</span></td>'
      + '<td style="padding:14px;">'+subBadge+'</td>'
      + '<td style="padding:14px;">'+memBadge+'</td>'
      + '<td style="padding:14px;text-align:right;font-weight:700;font-size:0.88rem;">'+(m.billing > 0 ? '$'+m.billing.toFixed(2) : '—')+'</td>'
      + '<td style="padding:14px;font-size:0.82rem;color:var(--text-mid);">'+m.nextPayment+'</td>'
      + '<td style="padding:14px;text-align:right;font-weight:700;font-size:0.88rem;color:'+balanceColor+';">'+(m.balanceDue > 0 ? '$'+m.balanceDue.toFixed(2) : '$0.00')+lateBadge+'</td>'
      + '<td style="padding:14px;text-align:center;"><button onclick="openManageMember('+m.id+')" style="padding:6px 14px;background:var(--cream);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-family:sans-serif;font-weight:700;font-size:0.75rem;color:var(--text);">Manage</button></td>'
      + '</tr>';
  }).join('');
}

function openManageMember(id) {
  var m = subsMembers.find(function(x){ return x.id === id; });
  if (!m) return;
  currentSubsMember = m;
  document.getElementById('manage-member-name').textContent = m.fname + ' ' + m.lname;
  var metaParts = [m.email];
  if (m.subscription) metaParts.push(m.subscription);
  if (m.membership) metaParts.push(m.membership + ' Membership');
  document.getElementById('manage-member-meta').textContent = metaParts.join(' · ');

  var actionsEl = document.getElementById('manage-member-actions');
  var isMember = !!m.membership;
  var isSub = !!m.subscription && !m.membership;

  var btn = function(action, bg, color, border, icon, label) {
    return '<button class="mgmt-btn" data-action="'+action+'" style="padding:11px;background:'+bg+';color:'+color+';border:'+(border||'none')+';border-radius:10px;cursor:pointer;font-weight:700;font-size:0.8rem;width:100%;display:flex;align-items:center;justify-content:center;gap:7px;">'+icon+label+'</button>';
  };
  var ic = function(path) { return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">'+path+'</svg>'; };

  if (isMember) {
    actionsEl.innerHTML =
      '<div style="font-size:0.62rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--brown);margin-bottom:10px;">Membership Management</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">'
      + btn('addtoplan','linear-gradient(135deg,var(--brown-light),var(--brown-dark))','#fff','none',ic('<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>'), 'Add to Plan')
      + btn('changeplan','var(--cream)','var(--text)','1px solid var(--border)',ic('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>'), 'Change Plan')
      + btn('charge','var(--cream)','var(--text)','1px solid var(--border)',ic('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>'), 'Charge Now')
      + btn('invoice','var(--cream)','var(--text)','1px solid var(--border)',ic('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>'), 'Send Invoice')
      + btn('viewinvoices','var(--cream)','var(--text)','1px solid var(--border)',ic('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>'), 'View Invoices')
      + btn('editinfo','var(--cream)','var(--text)','1px solid var(--border)',ic('<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>'), 'Edit Info')
      + btn('pause','var(--cream)','var(--text)','1px solid var(--border)',ic('<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'), m.engagement==='Paused' ? 'Resume Service' : 'Pause Service')
      + btn('applyfee','#fef3c7','#92400e','1px solid #fde68a',ic('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>'), 'Apply Fee')
      + btn('waivefee','#f0fdf4','#16a34a','1px solid #bbf7d0',ic('<polyline points="20 6 9 17 4 12"/>'), 'Waive Fee')
      + '</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;border-top:1px solid var(--border);padding-top:8px;">'
      + btn('cancel','#fee2e2','#dc2626','1px solid #fecaca',ic('<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'), 'Cancel')
      + btn('delete','#fff','#dc2626','1.5px solid #fecaca',ic('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>'), 'Delete')
      + '</div>';

  } else if (isSub) {
    actionsEl.innerHTML =
      '<div style="font-size:0.62rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-dim);margin-bottom:10px;">Subscription Management</div>'
      + '<div style="display:flex;flex-direction:column;gap:8px;">'
      + btn('charge','var(--cream)','var(--text)','1px solid var(--border)',ic('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>'), 'Charge Now')
      + btn('changesubtype','var(--cream)','var(--text)','1px solid var(--border)',ic('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>'), 'Change Subscription Amount / Type')
      + btn('invoice','var(--cream)','var(--text)','1px solid var(--border)',ic('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>'), 'Send Invoice')
      + btn('viewinvoices','var(--cream)','var(--text)','1px solid var(--border)',ic('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>'), 'View Invoices')
      + btn('refund','#f0fdf4','#16a34a','1px solid #bbf7d0',ic('<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/>'), 'Refund Subscription')
      + btn('cancel','#fee2e2','#dc2626','1px solid #fecaca',ic('<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'), 'Cancel Subscription')
      + btn('delete','#fff','#dc2626','1.5px solid #fecaca',ic('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>'), 'Delete')
      + '</div>';

  } else {
    // Subscriber only
    actionsEl.innerHTML =
      '<div style="font-size:0.62rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-dim);margin-bottom:10px;">Subscriber Actions</div>'
      + '<div style="display:flex;flex-direction:column;gap:8px;">'
      + btn('delete','#fff','#dc2626','1.5px solid #fecaca',ic('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>'), 'Remove Subscriber')
      + '</div>';
  }

  actionsEl.querySelectorAll('.mgmt-btn').forEach(function(btn) {
    btn.onclick = function() { handleMemberAction(btn.dataset.action, m); };
  });
  openModal('modal-manage-member');
}

function handleMemberAction(action, m) {
  closeModal('modal-manage-member');
  if (action === 'charge')        { openChargeModal(m); }
  else if (action === 'refund')   { openRefundModal(m); }
  else if (action === 'invoice')  { openInvoiceModal(m); }
  else if (action === 'viewinvoices') { openViewInvoices(m); }
  else if (action === 'changeplan')   { openChangePlanModal(m); }
  else if (action === 'changesubtype'){ openChangeSubTypeModal(m); }
  else if (action === 'addtoplan')    { openAddToPlan(m); }
  else if (action === 'editinfo')     { toast('Edit info for ' + m.fname + ' — opening form'); }
  else if (action === 'applyfee') { openApplyFeeModal(m); }
  else if (action === 'waivefee') { openWaiveFeeModal(m); }
  else if (action === 'pause') {
    m.engagement = m.engagement === 'Paused' ? 'Active' : 'Paused';
    renderSubsTable();
    toast(m.engagement === 'Paused' ? m.fname + "'s service paused" : m.fname + "'s service resumed");
  }
  else if (action === 'cancel') {
    m.subscription = ''; m.membership = '';
    m.engagement = 'Inactive'; m.status = 'subscriber';
    renderSubsTable();
    toast('Service cancelled for ' + m.fname);
  }
  else if (action === 'delete') {
    subsMembers = subsMembers.filter(function(x){ return x.id !== m.id; });
    lsPersistSubsMembers();
    renderSubsTable();
    toast(m.fname + ' removed');
  }
}

function openChargeModal(m) {
  document.getElementById('charge-modal-name').textContent = m.fname + ' ' + m.lname;
  document.getElementById('charge-modal-email').textContent = m.email;
  document.getElementById('charge-amount-input').value = m.billing ? m.billing.toFixed(2) : '';
  document.getElementById('charge-modal-confirm').onclick = function() {
    var amt = parseFloat(document.getElementById('charge-amount-input').value);
    if (!amt || amt <= 0) { toast('Enter a valid amount'); return; }
    closeModal('modal-charge-now');
    toast('✓ $' + amt.toFixed(2) + ' charged to ' + m.fname + "'s account");
  };
  openModal('modal-charge-now');
}

function openRefundModal(m) {
  document.getElementById('refund-modal-name').textContent = m.fname + ' ' + m.lname;
  document.getElementById('refund-amount-input').value = m.billing ? m.billing.toFixed(2) : '';
  document.getElementById('refund-modal-confirm').onclick = function() {
    var amt = parseFloat(document.getElementById('refund-amount-input').value);
    if (!amt || amt <= 0) { toast('Enter a valid amount'); return; }
    closeModal('modal-refund');
    toast('✓ $' + amt.toFixed(2) + ' refund issued to ' + m.fname + ' — 3-5 business days');
  };
  openModal('modal-refund');
}

function openInvoiceModal(m) {
  document.getElementById('invoice-modal-name').textContent = m.fname + ' ' + m.lname;
  document.getElementById('invoice-modal-email').textContent = m.email;
  document.getElementById('invoice-amount-input').value = m.billing ? m.billing.toFixed(2) : '';
  document.getElementById('invoice-desc-input').value = m.subscription || m.membership || '';
  document.getElementById('invoice-modal-send').onclick = function() {
    var amt = parseFloat(document.getElementById('invoice-amount-input').value);
    if (!amt) { toast('Enter invoice amount'); return; }
    closeModal('modal-send-invoice');
    toast('✓ Invoice for $' + amt.toFixed(2) + ' sent to ' + m.email);
  };
  openModal('modal-send-invoice');
}

function openViewInvoices(m) {
  var list = document.getElementById('invoices-list');
  var invoices = [
    { date:'Mar 15, 2026', desc: m.subscription || m.membership || 'Service', amt: m.billing, status:'Paid' },
    { date:'Feb 15, 2026', desc: m.subscription || m.membership || 'Service', amt: m.billing, status:'Paid' },
    { date:'Jan 15, 2026', desc: m.subscription || m.membership || 'Service', amt: m.billing, status:'Paid' },
  ];
  document.getElementById('invoices-modal-name').textContent = m.fname + ' ' + m.lname + "'s Invoices";
  list.innerHTML = invoices.map(function(inv) {
    var color = inv.status === 'Paid' ? '#16a34a' : '#dc2626';
    var bg = inv.status === 'Paid' ? '#dcfce7' : '#fee2e2';
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border);">'
      + '<div><div style="font-weight:700;font-size:0.88rem;">' + inv.desc + '</div><div style="font-size:0.75rem;color:var(--text-dim);">' + inv.date + '</div></div>'
      + '<div style="display:flex;align-items:center;gap:10px;">'
      + '<span style="font-weight:800;">$' + (inv.amt||0).toFixed(2) + '</span>'
      + '<span style="padding:2px 8px;background:'+bg+';color:'+color+';border-radius:8px;font-size:0.7rem;font-weight:700;">' + inv.status + '</span>'
      + '</div></div>';
  }).join('');
  openModal('modal-view-invoices');
}

function openApplyFeeModal(m) {
  document.getElementById('applyfee-modal-name').textContent = m.fname + ' ' + m.lname;
  document.getElementById('applyfee-amount-input').value = '';
  document.getElementById('applyfee-modal-confirm').onclick = function() {
    var amt = parseFloat(document.getElementById('applyfee-amount-input').value);
    if (!amt || amt <= 0) { toast('Enter a fee amount'); return; }
    m.fees += amt; m.balanceDue += amt;
    renderSubsTable();
    closeModal('modal-apply-fee');
    toast('$' + amt.toFixed(2) + ' fee applied to ' + m.fname);
  };
  openModal('modal-apply-fee');
}

function openChangePlanModal(m) {
  document.getElementById('changeplan-modal-name').textContent = m.fname + ' ' + m.lname;
  document.getElementById('changeplan-current').textContent = m.membership || m.subscription || 'None';
  document.getElementById('changeplan-modal-confirm').onclick = function() {
    var plan = document.getElementById('changeplan-select').value;
    var newamt = parseFloat(document.getElementById('changeplan-newamt').value) || 0;
    m.membership = plan;
    if (newamt) m.billing = newamt;
    renderSubsTable();
    closeModal('modal-change-plan');
    toast('✓ ' + m.fname + " plan changed to " + plan + (newamt ? ' — $' + newamt.toFixed(2) + '/mo' : ''));
  };
  openModal('modal-change-plan');
}

function openChangeSubTypeModal(m) {
  document.getElementById('changesub-modal-name').textContent = m.fname + ' ' + m.lname;
  document.getElementById('changesub-current').textContent = m.subscription || 'None';
  document.getElementById('changesub-modal-confirm').onclick = function() {
    var newtype = document.getElementById('changesub-type').value;
    var newamt = parseFloat(document.getElementById('changesub-newamt').value) || 0;
    if (newtype) m.subscription = newtype;
    if (newamt) m.billing = newamt;
    renderSubsTable();
    closeModal('modal-change-sub-type');
    toast('✓ ' + m.fname + " subscription updated");
  };
  openModal('modal-change-sub-type');
}

function openSubscriberPreview(name, location, category, initials) {
  document.getElementById('sub-preview-initials').textContent = initials;
  document.getElementById('sub-preview-name').textContent = name;
  document.getElementById('sub-preview-location').textContent = location;
  document.getElementById('sub-preview-category').textContent = category;
  openModal('modal-subscriber-preview');
}

function addSubsMember() {
  var fname = document.getElementById('add-sub-fname').value.trim();
  var lname = document.getElementById('add-sub-lname').value.trim();
  var email = document.getElementById('add-sub-email').value.trim();
  var plan = document.getElementById('add-sub-plan').value;
  var tier = document.getElementById('add-sub-tier').value;
  if (!fname || !email) { toast('Please enter a name and email'); return; }
  var billing = plan ? parseFloat(plan.match(/\$([\d.]+)/)?.[1] || 0) : 0;
  subsMembers.push({
    id: subsMemberIdCounter++,
    fname: fname, lname: lname, email: email,
    engagement: 'Active',
    subscription: plan || '',
    membership: tier || '',
    billing: billing,
    nextPayment: plan ? 'Apr 30, 2026' : '—',
    balanceDue: 0, fees: 0,
    status: plan ? 'subscription' : (tier ? 'membership' : 'subscriber')
  });
  lsPersistSubsMembers();
  ['add-sub-fname','add-sub-lname','add-sub-email'].forEach(function(id){ document.getElementById(id).value=''; });
  document.getElementById('add-sub-plan').value = '';
  document.getElementById('add-sub-tier').value = '';
  closeModal('modal-add-subscriber');
  renderSubsTable();
  toast('✓ ' + fname + ' added!');
}

// renderSubsTable called in boot sequence below

function openAddToPlan(m) {
  var ctx = document.getElementById('add-to-plan-context');
  if (ctx) ctx.textContent = 'Adding member to ' + m.fname + ' ' + m.lname + "'s " + m.membership + ' Membership';
  var note = document.getElementById('atp-holder-name-note');
  if (note) note.textContent = m.fname + ' ' + m.lname;
  ['atp-member-name','atp-notes','atp-addon-amt'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
  openModal('modal-add-to-plan');
}

function saveAddToPlan() {
  var name = document.getElementById('atp-member-name').value.trim();
  var rel = document.getElementById('atp-relationship').value;
  var svc = document.getElementById('atp-service').value;
  var addon = parseFloat(document.getElementById('atp-addon-amt').value) || 0;
  var cycle = document.getElementById('atp-billing-cycle').value;
  if (!name) { toast('Please enter the member name'); return; }
  var m = currentSubsMember;
  if (addon > 0) {
    m.billing = (m.billing || 0) + addon;
    renderSubsTable();
  }
  closeModal('modal-add-to-plan');
  var msg = '✓ ' + name + ' (' + rel + ') added to ' + (m ? m.fname + "'s" : '') + ' plan';
  if (addon > 0) msg += ' · $' + addon.toFixed(2) + '/' + cycle.toLowerCase() + ' added · Updated billing notice sent';
  toast(msg);
}

function openWaiveFeeModal(m) {
  document.getElementById('waivefee-modal-name').textContent = m.fname + ' ' + m.lname;
  document.getElementById('waivefee-current').textContent = 'Current fees on account: $' + (m.fees || 0).toFixed(2);
  document.getElementById('waivefee-amount-input').value = m.fees > 0 ? m.fees.toFixed(2) : '';
  document.getElementById('waivefee-reason').value = '';
  document.getElementById('waivefee-confirm-btn').onclick = function() {
    var amt = parseFloat(document.getElementById('waivefee-amount-input').value);
    if (!amt || amt <= 0) { toast('Enter an amount to waive'); return; }
    var waived = Math.min(amt, m.fees);
    m.fees = Math.max(0, m.fees - waived);
    m.balanceDue = Math.max(0, m.balanceDue - waived);
    renderSubsTable();
    closeModal('modal-waive-fee');
    toast('$' + waived.toFixed(2) + ' in fees waived for ' + m.fname);
  };
  openModal('modal-waive-fee');
}

// Global exposure
window.renderSubsTable = renderSubsTable;