var paymentReceipts = {
  '@lashartist': {
    id: 'RCP-001823',
    handle: '@lashartist',
    amount: '$80',
    sentTo: '@lashartist (Stripe — bank on file)',
    date: 'April 20, 2026',
    time: '5:34 PM',
    status: 'Completed'
  }
};

function payCreator(btn, handle, amount) {
  btn.textContent = 'Paying...';
  btn.disabled = true;
  btn.style.background = 'var(--cream2)';
  btn.style.color = 'var(--text-dim)';
  setTimeout(function() {
    var now = new Date();
    var receiptId = 'RCP-' + Date.now().toString().slice(-6);
    var sentTo = handle + ' (Stripe — bank on file)';
    paymentReceipts[handle] = {
      id: receiptId,
      handle: handle,
      amount: amount,
      sentTo: sentTo,
      date: now.toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'}),
      time: now.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
      status: 'Completed'
    };
    // Update Pay Now → Paid
    btn.textContent = 'Paid';
    btn.style.border = '1px solid var(--border)';
    // Update badge
    var row = btn.closest('div[style*="gap:8px"]');
    if (row) {
      var badge = row.querySelector('span');
      if (badge) {
        badge.textContent = 'Paid';
        badge.style.background = '#dcfce7';
        badge.style.color = '#16a34a';
      }
      // Add View Receipt button
      var receiptBtn = document.createElement('button');
      receiptBtn.textContent = 'View Receipt';
      receiptBtn.style.cssText = 'padding:5px 10px;background:var(--brown-bg);color:var(--brown);border:1px solid var(--border);border-radius:7px;cursor:pointer;font-size:0.72rem;font-weight:700;white-space:nowrap;';
      receiptBtn.onclick = function() { viewPaymentReceipt(handle); };
      row.appendChild(receiptBtn);
    }
    toast('✓ ' + amount + ' paid to ' + handle + '!');
  }, 1200);
}



function viewPaymentReceipt(handle) {
  var r = paymentReceipts[handle];
  if (!r) { toast('No receipt found'); return; }
  document.getElementById('receipt-id').textContent = r.id;
  document.getElementById('receipt-handle').textContent = r.handle;
  document.getElementById('receipt-amount').textContent = r.amount;
  document.getElementById('receipt-sent-to').textContent = r.sentTo;
  document.getElementById('receipt-date').textContent = r.date + ' at ' + r.time;
  document.getElementById('receipt-status').textContent = r.status;
  openModal('modal-payment-receipt');
}



function updatePaymentMethod() {
  var name = document.getElementById('upm-name');
  var num = document.getElementById('upm-number');
  var exp = document.getElementById('upm-expiry');
  var cvv = document.getElementById('upm-cvv');
  if (!name || !name.value.trim()) { toast('Please enter cardholder name'); return; }
  if (!num || num.value.replace(/\s/g,'').length < 15) { toast('Please enter a valid card number'); return; }
  if (!exp || !exp.value.trim()) { toast('Please enter expiry date'); return; }
  if (!cvv || cvv.value.length < 3) { toast('Please enter CVV'); return; }
  closeModal('modal-update-payment');
  if (name) name.value = '';
  if (num) num.value = '';
  if (exp) exp.value = '';
  if (cvv) cvv.value = '';
  toast('✓ Payment method updated!');
}


function saveApiKey(service) {
  var key=document.getElementById('api-'+service);
  if(!key||!key.value.trim()){toast('Please enter an API key');return;}
  toast('✓ '+service.charAt(0).toUpperCase()+service.slice(1)+' connected!');
}
function saveCustomApi() {
  var name=document.getElementById('api-custom-name');
  var key=document.getElementById('api-custom-key');
  if(!name||!name.value.trim()){toast('Please enter a service name');return;}
  if(!key||!key.value.trim()){toast('Please enter an API key');return;}
  toast('✓ '+name.value+' API connected!');
}



function savePaymentMethod() {
  var name = document.getElementById('pm-name');
  var num = document.getElementById('pm-number');
  var exp = document.getElementById('pm-expiry');
  var cvv = document.getElementById('pm-cvv');
  if (!name || !name.value.trim()) { toast('Please enter cardholder name'); return; }
  if (!num || num.value.replace(/\s/g,'').length < 16) { toast('Please enter a valid card number'); return; }
  if (!exp || !exp.value.trim()) { toast('Please enter expiry date'); return; }
  if (!cvv || cvv.value.length < 3) { toast('Please enter CVV'); return; }
  closeModal('modal-add-payment');
  if (name) name.value = '';
  if (num) num.value = '';
  if (exp) exp.value = '';
  if (cvv) cvv.value = '';
  toast('✓ Payment method added successfully!');
}