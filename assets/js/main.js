
// ── XSS SANITIZER ─────────────────────────────────────
function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── ONLINE EVENT FIELD TOGGLE ─────────────────────────
function toggleOtherField(showCondition, wrapId) {
  var wrap = document.getElementById(wrapId);
  if (!wrap) return;
  // showCondition can be boolean or string 'Other'
  var show = showCondition === true || showCondition === 'Other';
  wrap.style.display = show ? 'block' : 'none';
  if (!show) {
    // Clear the input when hidden
    var input = wrap.querySelector('input');
    if (input) input.value = '';
  }
}

function toggleOnlineField(val) {
  const section = document.getElementById('online-link-section');
  section.style.display = val === 'Online' ? 'block' : 'none';
  if (val === 'Online') updateStreamLink();
}

function toggleRsvpFields(val) {
  document.getElementById('rsvp-fields').style.display = val === 'yes' ? 'block' : 'none';
}

function updateStreamLink() {
  const name = document.getElementById('ev-name').value.trim();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'my-event';
  const link = 'https://stream.massed.io/' + slug;
  const el = document.getElementById('auto-stream-link');
  if (el) el.textContent = link;
  return link;
}

function copyStreamLink() {
  const link = updateStreamLink();
  navigator.clipboard.writeText(link).then(() => toast('✓ Stream link copied!'));
}

// ── CHECKOUT ─────────────────────────────────────────
let checkoutData = {};
let paymentType = 'full';

function setPaymentType(type) {
  paymentType = type;
  document.getElementById('full-payment-form').style.display = type==='full'?'block':'none';
  document.getElementById('split-payment-form').style.display = type==='split'?'block':'none';
  document.getElementById('pay-full-btn').style.background = type==='full'?'var(--brown)':'rgba(255,255,255,0.06)';
  document.getElementById('pay-full-btn').style.color = type==='full'?'#fff':'rgba(255,255,255,0.45)';
  document.getElementById('pay-full-btn').style.border = type==='full'?'none':'1px solid rgba(255,255,255,0.1)';
  document.getElementById('pay-split-btn').style.background = type==='split'?'var(--brown)':'rgba(255,255,255,0.06)';
  document.getElementById('pay-split-btn').style.color = type==='split'?'#fff':'rgba(255,255,255,0.45)';
  document.getElementById('pay-split-btn').style.border = type==='split'?'none':'1px solid rgba(255,255,255,0.1)';
  if (type==='split') updateSplitPreview();
}

function updateSplitPreview() {
  const count = parseInt(document.getElementById('split-count').value) || 2;
  const total = window._cart ? window._cart.total : 0;
  const perPerson = total === 0 ? 0 : total / count;
  const eventName = window._cart && window._cart.ev ? window._cart.ev.name : 'Event';
  document.getElementById('split-per-person').textContent = total===0 ? 'Free each' : `$${perPerson.toFixed(2)} each`;

  const splitId = 'SPL-' + Math.random().toString(36).substring(2,8).toUpperCase();
  const payLink = 'pay.massed.io/' + splitId;
  window._splitData = { count, total, perPerson, splitId, payLink, eventName };

  const preview = document.getElementById('split-links-preview');
  if (!preview) return;
  preview.innerHTML = `
    <div style="margin-top:14px;">
      <div style="font-size:0.62rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px;">Payment Card Preview</div>
      <!-- Card preview -->
      <div id="split-preview-card" style="background:linear-gradient(135deg,#2d1500,#1a0a00);border-radius:14px;padding:18px;margin-bottom:12px;text-align:center;border:1px solid rgba(192,122,80,0.2);">
        <div style="font-size:0.58rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:6px;">Split Payment Request</div>
        <div style="font-family:'DM Serif Display',serif;color:#fff;font-size:1rem;margin-bottom:3px;">${eventName}</div>
        <div style="color:var(--brown-light);font-size:0.78rem;font-weight:700;margin-bottom:14px;">${count} people · ${total===0?'Free':'$'+perPerson.toFixed(2)+' each'}</div>
        <div style="background:#fff;border-radius:10px;padding:10px;display:inline-block;margin-bottom:10px;">
          <svg id="split-preview-qr" viewBox="0 0 80 80" width="90" height="90" xmlns="http://www.w3.org/2000/svg"></svg>
        </div>
        <div style="font-family:monospace;font-size:0.72rem;color:var(--brown-light);font-weight:600;margin-bottom:8px;">${payLink}</div>
        <div style="font-size:0.65rem;color:rgba(255,255,255,0.3);line-height:1.5;">Scan or click · Enter name, email, phone & pay · Ticket sent when all ${count} pay</div>
      </div>
      <!-- Download button in preview -->
      <button onclick="downloadSplitCard('preview')" style="width:100%;padding:11px;background:rgba(192,122,80,0.15);border:1px solid rgba(192,122,80,0.3);color:var(--brown-light);border-radius:10px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.82rem;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download Payment Card
      </button>
    </div>
  `;
  setTimeout(()=>generateQR(payLink,'split-preview-qr'),60);
}

function goCheckoutStep(step) {
  [1,2,3].forEach(s => {
    document.getElementById('checkout-step-'+s).style.display = s===step?'block':'none';
    const btn = document.getElementById('step-btn-'+s);
    btn.style.background = s===step?'var(--brown)':'transparent';
    btn.style.color = s===step?'#fff':'rgba(255,255,255,0.35)';
  });
  if (step === 2) { setPaymentType('full'); }
  if (step === 3) {
    const d = window._cart || {};
    const isSplit = paymentType === 'split';
    const splitCount = isSplit ? (parseInt(document.getElementById('split-count').value)||2) : 0;
    const perPerson = isSplit && d.total ? (d.total/splitCount).toFixed(2) : 0;

    document.getElementById('checkout-review-block').innerHTML = `
      <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="font-size:0.62rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px;">Attendee</div>
        <div style="color:#fff;font-size:0.9rem;">${document.getElementById('co-name').value||'—'}</div>
        <div style="color:rgba(255,255,255,0.45);font-size:0.8rem;">${document.getElementById('co-email').value||'—'}</div>
      </div>
      <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="font-size:0.62rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px;">Tickets</div>
        ${(d.cartItems||[]).map(item=>`<div style="color:#fff;font-size:0.85rem;margin-bottom:4px;">${item.tier.type} × ${item.qty} — ${item.price===0?'Free':'$'+(item.price*item.qty).toFixed(2)}</div>`).join('')}
      </div>
      <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="font-size:0.62rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px;">Payment Method</div>
        <div style="color:#fff;font-size:0.85rem;">${isSplit?`🤝 Split Payment — ${splitCount} people × $${perPerson} each`:`💳 Card ending in ${(document.getElementById('co-card').value.replace(/\s/g,'')||'0000').slice(-4)}`}</div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:rgba(255,255,255,0.5);font-size:0.85rem;">Total</span>
        <span style="color:#fff;font-weight:800;font-size:1.1rem;font-family:'DM Serif Display',serif;">${d.total===0?'Free':'$'+(d.total||0).toFixed(2)}</span>
      </div>
    `;

    // Show split download card in confirm step if split payment
    const splitFinal = document.getElementById('split-links-final');
    if (isSplit && splitFinal) {
      splitFinal.style.display = 'block';
      const count = splitCount;
      const perP = d.total ? (d.total/count).toFixed(2) : '0.00';
      const linkId = 'SPL-' + Date.now().toString().slice(-6);
      const payLink = 'pay.massed.io/' + linkId;
      window._splitLinkId = linkId;
      window._splitPayLink = payLink;
      window._splitPerP = perP;
      splitFinal.innerHTML = `
        <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:16px;">
          <div style="font-size:0.62rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:14px;">🤝 Split Payment Card</div>

          <!-- The downloadable card preview -->
          <div id="split-card-preview" style="background:linear-gradient(135deg,#2d1500,#1a0a00);border-radius:16px;padding:20px;margin-bottom:14px;text-align:center;border:1px solid rgba(192,122,80,0.2);">
            <div style="font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:6px;">Split Payment Request</div>
            <div style="font-family:'DM Serif Display',serif;color:#fff;font-size:1.1rem;margin-bottom:4px;">${d.ev?d.ev.name:''}</div>
            <div style="color:rgba(255,255,255,0.4);font-size:0.75rem;margin-bottom:16px;">${count} people · $${perP} each</div>
            <!-- QR Code -->
            <div style="background:#fff;border-radius:12px;padding:12px;display:inline-block;margin-bottom:12px;">
              <svg id="split-qr" viewBox="0 0 100 100" width="110" height="110" xmlns="http://www.w3.org/2000/svg"></svg>
            </div>
            <div style="font-family:monospace;font-size:0.78rem;color:var(--brown-light);font-weight:600;margin-bottom:6px;">${payLink}</div>
            <div style="font-size:0.7rem;color:rgba(255,255,255,0.3);line-height:1.5;">Each person scans or clicks the link, enters their name, email, phone and pays $${perP}. Your ticket is sent once all ${count} payments are collected.</div>
          </div>

          <!-- Actions -->
          <div style="display:flex;gap:8px;">
            <button onclick="downloadSplitCard()" style="flex:1;padding:11px;background:linear-gradient(135deg,var(--brown-light),var(--brown-dark));color:#fff;border:none;border-radius:10px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.82rem;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Card
            </button>
            <button onclick="copySplitLink()" style="flex:1;padding:11px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.1);border-radius:10px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.82rem;font-weight:700;">
              Copy Link
            </button>
          </div>
          <div style="margin-top:10px;font-size:0.72rem;color:rgba(255,255,255,0.3);line-height:1.5;text-align:center;">Tickets generate automatically once all ${count} payments are received.</div>
        </div>
      `;
      // Generate QR for the split link
      setTimeout(() => generateQR(payLink, 'split-qr'), 80);
      document.getElementById('complete-purchase-btn').textContent = 'Generate Payment Card';
    } else if (splitFinal) {
      splitFinal.style.display = 'none';
      document.getElementById('complete-purchase-btn').textContent = 'Complete Purchase';
    }
  }
}

function copySplitLink() {
  const link = 'https://' + (window._splitPayLink || 'pay.massed.io/SPL-000000');
  navigator.clipboard.writeText(link).then(() => toast('✓ Payment link copied!'));
}

function downloadSplitCard(source) {
  const d = window._splitData || {};
  const cart = window._cart || {};
  const ev = cart.ev || {};
  const count = d.count || 2;
  const perP = d.perPerson ? d.perPerson.toFixed(2) : '0.00';
  const payLink = d.payLink || window._splitPayLink || 'pay.massed.io/SPL-000000';
  const eventName = d.eventName || ev.name || 'Event';

  const canvas = document.createElement('canvas');
  canvas.width = 600; canvas.height = 780;
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0,0,0,780);
  grad.addColorStop(0,'#2d1500'); grad.addColorStop(1,'#1a0a00');
  ctx.fillStyle = grad; ctx.fillRect(0,0,600,780);

  // Border
  ctx.strokeStyle = 'rgba(192,122,80,0.4)'; ctx.lineWidth = 1.5;
  ctx.roundRect ? ctx.roundRect(10,10,580,760,16) : ctx.strokeRect(10,10,580,760);
  ctx.stroke();

  // Header
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '500 11px monospace'; ctx.textAlign = 'center';
  ctx.fillText('SPLIT PAYMENT REQUEST', 300, 55);

  // Event name
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px Georgia';
  ctx.fillText(eventName, 300, 100);

  // Split info
  ctx.fillStyle = '#D4956E';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText(`${count} people  ·  $${perP} each`, 300, 135);

  // QR Code
  const qrSvg = source === 'preview'
    ? document.getElementById('split-preview-qr')
    : (document.getElementById('split-qr') || document.getElementById('split-preview-qr'));
  const qrSize = 200, qrX = 200, qrY = 165;
  ctx.fillStyle = '#fff';
  ctx.fillRect(qrX-14, qrY-14, qrSize+28, qrSize+28);
  if (qrSvg) {
    const scale = qrSize / 80;
    qrSvg.querySelectorAll('rect').forEach(r => {
      const rx = parseFloat(r.getAttribute('x'))*scale + qrX;
      const ry = parseFloat(r.getAttribute('y'))*scale + qrY;
      const rw = parseFloat(r.getAttribute('width'))*scale;
      const rh = parseFloat(r.getAttribute('height'))*scale;
      ctx.fillStyle = r.getAttribute('fill')==='#fff'?'#fff':'#111';
      ctx.fillRect(rx,ry,rw,rh);
    });
  }

  // Payment link
  ctx.fillStyle = '#D4956E';
  ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center';
  ctx.fillText(payLink, 300, 415);

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.setLineDash([6,6]);
  ctx.beginPath(); ctx.moveTo(50,440); ctx.lineTo(550,440); ctx.stroke();
  ctx.setLineDash([]);

  // Instructions
  ctx.textAlign = 'left';
  const steps = [
    ['1.', 'Scan the QR code or visit the link above'],
    ['2.', 'Enter your name, email & phone number'],
    ['3.', `Pay your share: $${perP}`],
    ['4.', `Your ticket will be sent once all ${count} people have paid`],
  ];
  steps.forEach(([num, text], i) => {
    const y = 476 + i * 48;
    ctx.fillStyle = i===2?'#D4956E':'rgba(255,255,255,0.25)';
    ctx.font = 'bold 14px sans-serif'; ctx.fillText(num, 54, y);
    ctx.fillStyle = i===2?'#D4956E':'rgba(255,255,255,0.6)';
    ctx.font = '14px sans-serif'; ctx.fillText(text, 80, y);
  });

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Powered by Massed · massed.io', 300, 755);

  const a = document.createElement('a');
  a.download = 'split-payment-'+payLink.split('/').pop()+'.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
  toast('✓ Payment card downloaded! Share via text or email.');
}

function completeCheckout() {
  const btn = document.getElementById('complete-purchase-btn');
  const isSplit = paymentType === 'split';
  btn.textContent = isSplit ? 'Generating Card...' : 'Processing...';
  btn.disabled = true;
  setTimeout(() => {
    closeModal('modal-checkout');
    btn.disabled = false;
    if (isSplit) {
      // Auto-download the split card
      downloadSplitCard();
      toast('🤝 Payment card ready! Download it and share with your group.');
    } else {
      const cart = window._cart;
      if (cart && cart.ev) {
        cart.ev._selectedCart = cart.cartItems;
        currentEventIndex = events.indexOf(cart.ev);
        openTicketViewFromCart();
      }
      toast('🎉 Purchase complete! Your tickets are ready.');
    }
  }, 2000);
}


function openTicketViewFromCart() {
  const ev = events[currentEventIndex];
  if (!ev) return;
  const cart = ev._selectedCart || [];
  const dateStr = ev.date ? new Date(ev.date+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : 'Date TBD';
  const isOnline = ev.type === 'Online';

  // Build all tickets for all tiers in cart
  let allTickets = [];
  cart.forEach(item => {
    for (let i=0; i<item.qty; i++) {
      allTickets.push({ tier: item.tier, index: allTickets.length+1 });
    }
  });

  const totalTickets = allTickets.length;
  const ticketsHTML = allTickets.map((t, idx) => {
    const ticketNum = generateTicketNumber(ev.id, t.tier.type, idx+1);
    const price = parseFloat(t.tier.price)||0;
    return `
      <div style="background:linear-gradient(135deg,#2d1500,#1a0a00);border-radius:16px;padding:20px;margin-bottom:16px;text-align:center;position:relative;">
        <div style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);font-size:0.65rem;font-weight:700;padding:3px 8px;border-radius:20px;">Ticket ${idx+1} of ${totalTickets}</div>
        <h3 style="font-family:'DM Serif Display',serif;color:#fff;font-size:1.1rem;margin-bottom:6px;padding-right:60px;text-align:left;">${ev.name}</h3>
        <div style="text-align:left;margin-bottom:4px;">
          <span style="background:rgba(192,122,80,0.3);color:var(--brown-light);font-size:0.7rem;font-weight:800;padding:3px 10px;border-radius:20px;">${t.tier.type}</span>
          ${isOnline?'<span style="background:rgba(37,99,235,0.2);color:#60a5fa;font-size:0.7rem;font-weight:800;padding:3px 10px;border-radius:20px;margin-left:6px;">🌐 Online</span>':''}
        </div>
        <p style="color:rgba(255,255,255,0.4);font-size:0.72rem;margin-bottom:14px;text-align:left;">${isOnline?'Use your ticket number to access the event':'Show QR code at entrance'}</p>
        <div style="background:#fff;border-radius:12px;padding:12px;display:inline-block;margin-bottom:12px;">
          <svg id="qr-${idx}" viewBox="0 0 100 100" width="130" height="130" xmlns="http://www.w3.org/2000/svg"></svg>
        </div>
        <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:8px 12px;display:inline-block;margin-bottom:14px;">
          <div style="color:rgba(255,255,255,0.35);font-size:0.58rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;">Ticket Number</div>
          <div style="color:var(--brown-light);font-family:monospace;font-size:0.88rem;font-weight:800;letter-spacing:0.08em;">${ticketNum}</div>
        </div>
        <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:12px;text-align:left;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div><div style="font-size:0.58rem;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;">Venue</div><div style="font-size:0.8rem;color:#fff;font-weight:600;">${isOnline?'Online Event':ev.location||'TBD'}</div></div>
            <div><div style="font-size:0.58rem;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;">Date & Time</div><div style="font-size:0.78rem;color:#fff;font-weight:600;">${dateStr}${ev.time?' • '+ev.time:''}</div></div>
            <div><div style="font-size:0.58rem;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;">Type</div><div style="font-size:0.8rem;color:var(--brown-light);font-weight:700;">${t.tier.type}</div></div>
            <div><div style="font-size:0.58rem;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;">Price</div><div style="font-size:0.8rem;color:var(--brown-light);font-weight:800;">${price===0?'Free':'$'+price.toFixed(2)}</div></div>
          </div>
          ${t.tier.description?`<div style="padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);margin-top:10px;"><div style="font-size:0.58rem;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Includes</div><div style="font-size:0.75rem;color:rgba(255,255,255,0.6);line-height:1.5;">${t.tier.description}</div></div>`:''}
          ${isOnline?`<div style="padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);margin-top:10px;"><div style="font-size:0.58rem;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Massed Stream Link</div><div style="background:rgba(192,122,80,0.12);border:1px solid rgba(192,122,80,0.25);border-radius:8px;padding:10px;"><div style="color:rgba(255,255,255,0.5);font-size:0.72rem;margin-bottom:6px;">Enter ticket number <strong style="color:var(--brown-light);">${ticketNum}</strong></div><div style="color:var(--brown-light);font-family:monospace;font-size:0.78rem;font-weight:600;word-break:break-all;">${ev.onlineLink||'https://stream.massed.io/'+ev.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}</div></div></div>`:''}
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('multi-ticket-container').innerHTML = ticketsHTML;
  document.getElementById('multi-ticket-title').textContent = totalTickets > 1 ? `Your ${totalTickets} Tickets` : 'Your Ticket';
  document.getElementById('multi-ticket-total').textContent = '';

  allTickets.forEach((t, idx) => {
    const ticketNum = generateTicketNumber(ev.id, t.tier.type, idx+1);
    setTimeout(()=>generateQR(ticketNum,'qr-'+idx), 80+idx*30);
  });

  openModal('modal-your-ticket');
}




// ── SCANNER ───────────────────────────────────────────
let scanStats = {total:0, valid:0, invalid:0};
let checkedInList = [];
let cameraStream = null;
let scanInterval = null;
let torchOn = false;
let lastScanned = null;
let lastScannedTime = 0;

// Load jsQR library dynamically
function loadJsQR(callback) {
  if (window.jsQR) { callback(); return; }
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js';
  script.onload = callback;
  script.onerror = () => toast('Failed to load QR scanner library');
  document.head.appendChild(script);
}

function startCamera() {
  // Check API support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    var statusEl = document.getElementById('scan-status');
    if (statusEl) statusEl.textContent = '⚠️ Camera not supported on this browser. Try Chrome or Safari.';
    toast('⚠️ Camera not supported on this browser');
    return;
  }

  var statusEl = document.getElementById('scan-status');
  if (statusEl) statusEl.textContent = '⏳ Requesting camera access…';

  loadJsQR(() => {
    // Try back camera first, fall back to any camera
    const tryStart = (constraints) => {
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          cameraStream = stream;
          const video = document.getElementById('camera-feed');
          if (!video) return;

          // Revoke any old stream
          video.srcObject = null;
          video.srcObject = stream;

          // Ensure play works on iOS/Android
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Autoplay blocked — still try to show the frame
            });
          }

          // Show camera UI
          const placeholder = document.getElementById('camera-placeholder');
          const overlay = document.getElementById('scan-frame-overlay');
          const btnStart = document.getElementById('btn-start-camera');
          const btnStop = document.getElementById('btn-stop-camera');
          if (placeholder) placeholder.style.display = 'none';
          if (overlay) overlay.style.display = 'block';
          if (btnStart) btnStart.style.display = 'none';
          if (btnStop) { btnStop.style.display = 'flex'; }

          // Show torch button if device supports it
          const track = stream.getVideoTracks()[0];
          if (track && track.getCapabilities) {
            try {
              const caps = track.getCapabilities();
              if (caps && caps.torch) {
                const btnTorch = document.getElementById('btn-torch');
                if (btnTorch) btnTorch.style.display = 'flex';
              }
            } catch(e) {}
          }

          if (statusEl) statusEl.textContent = '🟢 Scanning — point at a QR code';
          const scanResult = document.getElementById('scan-result');
          if (scanResult) scanResult.style.display = 'none';

          // Wait for video metadata before scanning
          const onReady = () => {
            if (video.videoWidth > 0) {
              startFrameScan(video);
            } else {
              video.addEventListener('loadeddata', () => startFrameScan(video), { once: true });
            }
          };
          if (video.readyState >= 2) {
            onReady();
          } else {
            video.addEventListener('loadedmetadata', onReady, { once: true });
          }
        })
        .catch(err => {
          // If back camera failed, retry with any camera
          if (constraints.video && constraints.video.facingMode && err.name !== 'NotAllowedError' && err.name !== 'SecurityError') {
            tryStart({ video: true, audio: false });
            return;
          }
          let msg = 'Camera access denied.';
          if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') msg = 'No camera found on this device.';
          else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') msg = 'Camera permission denied. Tap the camera icon in your browser address bar to allow access.';
          else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') msg = 'Camera is in use by another app. Close other apps and try again.';
          else if (err.name === 'OverconstrainedError') msg = 'Camera constraints not supported. Trying default camera.';
          else if (err.name === 'SecurityError') msg = 'Camera blocked. This page must be served over HTTPS.';
          if (statusEl) statusEl.textContent = '⚠️ ' + msg;
          toast('⚠️ ' + msg);
        });
    };

    // Start with rear camera preferred
    tryStart({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
  });
}

function startFrameScan(video) {
  if (scanInterval) { clearInterval(scanInterval); scanInterval = null; }
  const canvas = document.getElementById('camera-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  scanInterval = setInterval(() => {
    // Guard: video must be playing with real dimensions
    if (!video || video.paused || video.ended || video.readyState < 2) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;
    if (!cameraStream) { clearInterval(scanInterval); return; }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    try { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); }
    catch(e) { return; }

    let imageData;
    try { imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); }
    catch(e) { return; }

    if (!window.jsQR) return;
    const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });
    if (code && code.data) {
      const now = Date.now();
      if (code.data !== lastScanned || now - lastScannedTime > 3000) {
        lastScanned = code.data;
        lastScannedTime = now;
        processScannedTicket(code.data, false);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
    }
  }, 250);
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  clearInterval(scanInterval);
  scanInterval = null;
  const video = document.getElementById('camera-feed');
  video.srcObject = null;
  document.getElementById('camera-placeholder').style.display = 'flex';
  document.getElementById('scan-frame-overlay').style.display = 'none';
  document.getElementById('btn-start-camera').style.display = 'flex';
  document.getElementById('btn-stop-camera').style.display = 'none';
  document.getElementById('btn-torch').style.display = 'none';
  document.getElementById('scan-status').textContent = 'Click Start Camera to begin scanning';
  torchOn = false;
}

function toggleTorch() {
  if (!cameraStream) return;
  const track = cameraStream.getVideoTracks()[0];
  if (!track) return;
  torchOn = !torchOn;
  track.applyConstraints({ advanced: [{ torch: torchOn }] })
    .then(() => {
      document.getElementById('btn-torch').style.background = torchOn ? '#fef3c7' : 'var(--cream2)';
    })
    .catch(() => toast('Torch not supported on this device'));
}

function verifyTicket() {
  const val = document.getElementById('manual-ticket-input').value.trim().toUpperCase();
  if (!val) { toast('Please enter a ticket number'); return; }
  processScannedTicket(val, true);
}

function processScannedTicket(ticketId, isManual) {
  // Check against locally created tickets
  let foundEvent = null, foundTier = null;
  events.forEach(ev => {
    if (!ev.tiers) return;
    ev.tiers.forEach(t => {
      // Match any ticket number that belongs to this event + tier
      const prefix = 'TKT-' + ev.id.toString().slice(-5) + '-' + t.type.replace(/[^A-Z]/gi,'').substring(0,3).toUpperCase().padEnd(3,'X');
      if (ticketId.startsWith(prefix) || ticketId.startsWith('TKT-'+ev.id.toString().slice(-5))) {
        foundEvent = ev; foundTier = t;
      }
    });
  });

  const isValid = foundEvent !== null && ticketId.startsWith('TKT-') && ticketId.length >= 10;
  const resultEl = document.getElementById(isManual ? 'verify-result' : 'scan-result');

  scanStats.total++;
  if (isValid) {
    scanStats.valid++;
    checkedInList.unshift({ id: ticketId, name: foundEvent.name, tier: foundTier ? foundTier.type : '', time: new Date().toLocaleTimeString(), valid: true });
    resultEl.style.cssText = 'display:block;padding:14px;border-radius:10px;background:rgba(22,163,74,0.1);border:1px solid rgba(22,163,74,0.3);margin-top:12px;';
    resultEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:2rem;">✅</span>
        <div>
          <div style="font-weight:700;color:#16a34a;font-size:0.95rem;">Valid Ticket</div>
          <div style="font-size:0.78rem;color:var(--text-mid);margin-top:2px;">${ticketId}</div>
          <div style="font-size:0.78rem;color:var(--text-mid);">${foundEvent.name} · ${foundTier ? foundTier.type : ''}</div>
        </div>
      </div>`;
    if (!isManual) document.getElementById('scan-status').textContent = '✅ Valid — keep scanning';
  } else {
    scanStats.invalid++;
    checkedInList.unshift({ id: ticketId, time: new Date().toLocaleTimeString(), valid: false });
    resultEl.style.cssText = 'display:block;padding:14px;border-radius:10px;background:#fff1f2;border:1px solid #fecaca;margin-top:12px;';
    resultEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:2rem;">❌</span>
        <div>
          <div style="font-weight:700;color:#dc2626;font-size:0.95rem;">Invalid Ticket</div>
          <div style="font-size:0.78rem;color:var(--text-mid);margin-top:2px;">${ticketId}</div>
          <div style="font-size:0.78rem;color:var(--text-dim);">Not found in system</div>
        </div>
      </div>`;
    if (!isManual) document.getElementById('scan-status').textContent = '❌ Invalid — keep scanning';
  }

  // Update stats
  document.getElementById('scan-total').textContent = scanStats.total;
  document.getElementById('scan-valid').textContent = scanStats.valid;
  document.getElementById('scan-invalid').textContent = scanStats.invalid;

  // Update checked-in list
  document.getElementById('checked-in-list').innerHTML = checkedInList.slice(0,6).map(c => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--cream);border-radius:8px;margin-bottom:6px;">
      <div>
        <div style="font-family:monospace;font-size:0.7rem;color:var(--text);font-weight:600;">${c.id}</div>
        ${c.name ? `<div style="font-size:0.65rem;color:var(--text-dim);">${c.name}${c.tier?' · '+c.tier:''}</div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
        <span style="font-size:0.65rem;color:var(--text-dim);">${c.time}</span>
        <span style="font-size:1rem;">${c.valid ? '✅' : '❌'}</span>
      </div>
    </div>
  `).join('') || '<div style="text-align:center;padding:20px;color:var(--text-dim);font-size:0.82rem;">No check-ins yet</div>';

  // Auto-clear result after 4 seconds when using camera
  if (!isManual) setTimeout(() => { if (resultEl) resultEl.style.display = 'none'; }, 4000);
}

// Stop camera when leaving scanner screen

function goCheckoutStep2() {
  var step1 = document.getElementById('checkout-step-1');
  var step2 = document.getElementById('checkout-step-2');
  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'block';
}

function submitWithdrawal() {
  var amt = document.getElementById('withdraw-amount');
  if (!amt || !amt.value || parseFloat(amt.value) <= 0) { toast('Please enter an amount to withdraw'); return; }
  if (parseFloat(amt.value) > 1250) { toast('Amount exceeds available balance'); return; }
  closeModal('modal-withdraw-funds');
  if (amt) amt.value = '';
  toast('✓ Withdrawal of $' + parseFloat(document.getElementById('withdraw-amount') ? 0 : 0).toFixed(2) + ' initiated! Arrives in 3-5 business days.');
}

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

function selectLanguage(el, code) {
  document.querySelectorAll('.lang-option').forEach(function(opt) {
    opt.style.background = 'var(--cream)';
    opt.style.border = '1px solid var(--border)';
    var label = opt.querySelector('span:last-child');
    if (label && !label.querySelector) {
      label.style.color = 'var(--text-dim)';
      label.style.fontWeight = '400';
      if (label.textContent === '✓ Selected') label.textContent = opt.getAttribute('data-lang-name') || '';
    }
  });
  el.style.background = 'var(--brown-bg)';
  el.style.border = '2px solid var(--brown)';
  var selLabel = el.querySelector('span:last-child');
  if (selLabel) { selLabel.textContent = '✓ Selected'; selLabel.style.color = 'var(--brown)'; selLabel.style.fontWeight = '700'; }
  toast('✓ Language updated');
}

function selectPayoutSpeed(el, type) {
  ['standard','instant'].forEach(function(t) {
    var row = document.getElementById('speed-dot-'+t).closest('div[style*="padding:16px"]');
    var dot = document.getElementById('speed-dot-'+t);
    if (t === type) {
      row.style.border = '2px solid var(--brown)';
      row.style.background = 'var(--brown-bg)';
      dot.style.background = 'var(--brown)';
      dot.style.border = '2px solid var(--brown)';
      dot.innerHTML = '<div style="width:8px;height:8px;border-radius:50%;background:#fff;"></div>';
    } else {
      row.style.border = '1px solid var(--border)';
      row.style.background = 'var(--cream)';
      dot.style.background = '#fff';
      dot.style.border = '2px solid var(--border)';
      dot.innerHTML = '';
    }
  });
}

function handleFaviconUpload(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    var src = ev.target.result;
    // Update large preview
    var prev = document.getElementById('favicon-preview-large');
    var wrap = document.getElementById('favicon-preview-wrap');
    var icon = document.getElementById('favicon-upload-icon');
    var txt = document.getElementById('favicon-upload-text');
    if (prev) { prev.src = src; }
    if (wrap) wrap.style.display = 'block';
    if (icon) icon.style.display = 'none';
    if (txt) txt.textContent = file.name;
    // Update tab preview
    var tabImg = document.getElementById('tab-favicon-img');
    var tabDefault = document.getElementById('tab-favicon-default');
    if (tabImg) { tabImg.src = src; tabImg.style.display = 'block'; }
    if (tabDefault) tabDefault.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function saveFavicon() {
  var file = document.getElementById('favicon-file-input').files[0];
  var title = document.getElementById('favicon-tab-title').value.trim();
  if (!file) { toast('Please upload an icon first'); return; }
  toast('✓ Browser icon applied to your MASSED page!');
}

function saveAccount() {
  toast('✓ Account updated!');
}

function toggleFaq(btn) {
  var body = btn.nextElementSibling;
  var arrow = btn.querySelector('.faq-arrow');
  var isOpen = body.style.display === 'block';
  body.style.display = isOpen ? 'none' : 'block';
  if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
}

function toggleSocialVisibility(wrap, sid) {
  var toggle = document.getElementById('sl-' + sid);
  var label = document.getElementById('sl-' + sid + '-label');
  if (!toggle) return;
  var isOn = toggle.classList.contains('on');
  if (isOn) {
    toggle.classList.remove('on');
    if (label) label.textContent = 'Hidden from profile';
  } else {
    toggle.classList.add('on');
    if (label) label.textContent = 'Shown on profile';
  }
}


// Handle browser back/forward buttons
window.addEventListener('popstate', function(e) {
  if(e.state && e.state.screen) {
    var screens = document.querySelectorAll('.screen');
    screens.forEach(function(s){ s.classList.remove('active'); });
    var target = document.getElementById('screen-' + e.state.screen);
    if(target) target.classList.add('active');
    var pt = document.getElementById('page-title');
    if(pt && pageTitles) pt.textContent = pageTitles[e.state.screen] || '';
    // Close sidebar if open
    var sb = document.getElementById('main-sidebar');
    var ov = document.getElementById('sidebar-overlay');
    if(sb) sb.classList.remove('open');
    if(ov) { ov.classList.remove('open'); ov.style.display='none'; }
  } else {
    // No state means we're back at the start — go to dashboard
    nav(null, 'dashboard');
  }
});

document.addEventListener('DOMContentLoaded', function() {
  // On Android, touchstart fires before click. Use a timed guard instead of
  // stopPropagation (which is ignored on passive listeners) to prevent double-fire.
  var hbtn = document.getElementById('hamburger-btn');
  if (hbtn) {
    var _lastTouch = 0;
    hbtn.addEventListener('touchend', function(e) {
      e.preventDefault(); // prevent the ghost click entirely
      _lastTouch = Date.now();
      toggleSidebar();
    }, { passive: false });
    hbtn.addEventListener('click', function(e) {
      // Suppress click if it fired within 400ms of a touch (ghost click)
      if (Date.now() - _lastTouch < 400) return;
      toggleSidebar();
    });
  }
  // Close sidebar when overlay is tapped on mobile
  var ov = document.getElementById('sidebar-overlay');
  if (ov) {
    ov.addEventListener('touchend', function(e) {
      e.preventDefault();
      closeSidebar();
    }, { passive: false });
  }
});
// Camera stop on nav — patched in boot sequence below

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

// ── TICKET NUMBER GENERATION ──────────────────────────
function generateTicketNumber(evId, tierType, index) {
  const evPart = evId.toString().slice(-5).toUpperCase();
  const tierPart = tierType.replace(/[^A-Z]/gi,'').substring(0,3).toUpperCase().padEnd(3,'X');
  const numPart = String(index).padStart(4,'0');
  return `TKT-${evPart}-${tierPart}-${numPart}`;
}
// ── MORE MENU ─────────────────────────────────────────
function toggleMoreMenu() {
  const menu = document.getElementById('more-menu');
  const isOpen = menu.style.display === 'block';
  menu.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) setTimeout(() => document.addEventListener('click', closeMoreMenuOutside), 10);
}
function closeMoreMenu() {
  const menu = document.getElementById('more-menu');
  if (menu) menu.style.display = 'none';
  document.removeEventListener('click', closeMoreMenuOutside);
}
function closeMoreMenuOutside(e) {
  const menu = document.getElementById('more-menu');
  const trigger = document.getElementById('btn-more-trigger');
  if (menu && !menu.contains(e.target) && trigger && !trigger.contains(e.target)) closeMoreMenu();
}
function goToLivePreview() {
  closeMoreMenu();
  nav(null, 'livepreview');
}

// ── COLLABORATION ─────────────────────────────────────────────────────────────
const collabProfiles = [
  {name:'Avy Adore',tagline:'Beauty & Real Estate Creator',genres:['Beauty','Real Estate','Wellness'],color:'#8B6040',initials:'AA',bio:'Looking to collab with wellness and beauty brands for UGC and brand deals.'},
  {name:'Shanay Evans',tagline:'Lash Tech & MUA Artist',genres:['Lash Tech','MUA Artist','Beauty'],color:'#d6249f',initials:'SE',bio:'Lash artist open to beauty collabs, product reviews and tutorials.'},
  {name:'Erica Love',tagline:'Nail Tech & Apparel',genres:['Nail Tech','Apparel'],color:'#7c3aed',initials:'EL',bio:'Nail tech creating content around nail art and fashion styling.'},
  {name:'Jordan Miles',tagline:'Fitness Coach & Speaker',genres:['Fitness','Speaker','Coaching'],color:'#2563eb',initials:'JM',bio:'Certified fitness coach looking for wellness and supplement brand collabs.'},
  {name:'Nova Belle',tagline:'Hair Products & Beauty',genres:['Hair Products','Beauty','Apparel'],color:'#16a34a',initials:'NB',bio:'Natural hair creator open to product collaborations.'},
  {name:'Kai Monroe',tagline:'Real Estate & Finance',genres:['Real Estate','Finance','Consulting'],color:'#ca8a04',initials:'KM',bio:'Real estate investor looking for finance and wealth collab opportunities.'},
  {name:'Sara West',tagline:'Esthetician & Wellness',genres:['Esthetician','Wellness','Beauty'],color:'#db2777',initials:'SW',bio:'Licensed esthetician open to skincare and wellness brand collabs.'},
  {name:'Marcus Bell',tagline:'Digital Ebooks & Coaching',genres:['Digital Ebooks','Coaching','Consulting'],color:'#0891b2',initials:'MB',bio:'Author and business coach looking for digital product collabs.'},
];

let activeCollabFilter = 'all';

function toggleGenre(el) {
  el.classList.toggle('selected');
}

function toggleOpenToConnect(cb) {
  var track = document.getElementById('connect-track');
  var thumb = document.getElementById('connect-thumb');
  var status = document.getElementById('connect-status');
  if (cb.checked) {
    if (track) track.style.background = 'var(--brown)';
    if (thumb) thumb.style.left = '27px';
    if (status) { status.style.display = 'flex'; }
    toast('✓ Equal Link is now showing on your profile');
  } else {
    if (track) track.style.background = '#e5e7eb';
    if (thumb) thumb.style.left = '3px';
    if (status) status.style.display = 'none';
    toast('Equal Link turned off');
  }
}

function toggleCollab(cb) {
  var track = document.getElementById('collab-track');
  var thumb = document.getElementById('collab-thumb');
  if (cb.checked) {
    track.style.background = 'var(--brown)';
    thumb.style.left = '25px';
    toast('✓ You are now visible to collaborators!');
  } else {
    track.style.background = '#e5e7eb';
    thumb.style.left = '3px';
    toast('Collaboration visibility turned off');
  }
}

function saveProfile() {
  // Read fields
  var nameEl = document.querySelector('#mptab-profile-content input[placeholder="Your name"]');
  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) { toast('Please enter your display name to save your profile'); if (nameEl) nameEl.focus(); return; }

  // Update dashboard
  var dbAvatar = document.getElementById('db-avatar');
  var dbName = document.getElementById('db-name');
  var dbLink = document.getElementById('db-link');
  if (dbAvatar) dbAvatar.textContent = name.charAt(0).toUpperCase();
  if (dbName) dbName.textContent = name;
  // Generate username from name
  var username = name.toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,'');
  if (dbLink) dbLink.textContent = 'massed.io/' + username;

  // Show established dashboard, hide welcome
  var welcome = document.getElementById('dashboard-welcome');
  var main = document.getElementById('dashboard-main');
  if (welcome) welcome.style.display = 'none';
  if (main) main.style.display = 'block';

  toast('✓ Profile saved! Your dashboard is ready.');
  // Navigate to dashboard
  nav(document.querySelector('.nav-item'), 'dashboard');
}

function saveCollabProfile() {
  var name = document.getElementById('collab-name').value.trim();
  var selected = Array.from(document.querySelectorAll('.collab-genre-tag.selected')).map(t => t.textContent);
  if (!name) { toast('Please enter your display name'); return; }
  if (selected.length === 0) { toast('Please select at least one genre'); return; }
  toast('✓ Collaboration profile saved! (' + selected.length + ' genres selected)');
}

function filterCollabs(btn, genre) {
  document.querySelectorAll('.collab-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCollabFilter = genre;
  renderCollabGrid(genre);
}

function renderCollabGrid(genre) {
  var grid = document.getElementById('collab-grid');
  if (!grid) return;
  var filtered = genre === 'all' ? collabProfiles : collabProfiles.filter(p => p.genres.includes(genre));
  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-dim);font-size:0.85rem;">No collaborators found for this genre yet.</div>';
    return;
  }
  grid.innerHTML = filtered.map(p => `
    <div class="collab-card">
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="collab-card-avatar" style="background:${p.color};">${p.initials}</div>
        <div>
          <div class="collab-card-name">${p.name}</div>
          <div class="collab-card-tagline">${p.tagline}</div>
        </div>
      </div>
      <div style="font-size:0.78rem;color:var(--text-dim);line-height:1.5;">${p.bio}</div>
      <div class="collab-card-genres">${p.genres.map(g => `<span class="collab-card-genre">${g}</span>`).join('')}</div>
      <button class="collab-connect-btn" onclick="toast('Connection request sent to ${p.name}! 🤝')">Connect →</button>
    </div>
  `).join('');
}

// ── COLLABORATION FULL SYSTEM ─────────────────────────────────────────────────
const incomingRequests = [
  {id:1, name:'Nova Belle', tagline:'Hair Products & Beauty', genres:['Hair Products','Beauty'], color:'#16a34a', initials:'NB', message:'Hi! I love your content. Would love to collaborate on a beauty series!'},
  {id:2, name:'Marcus Bell', tagline:'Digital Ebooks & Coaching', genres:['Digital Ebooks','Coaching'], color:'#0891b2', initials:'MB', message:'Hey! Thinking we could do a joint digital product together. Let me know!'},
];
let activeCollabs = [];
let currentDeclineId = null;
let currentActiveCollab = null;
let ndaSigned = false;
let signedDocuments = [];
let collabMessages = {};

function renderIncoming() {
  var list = document.getElementById('incoming-list');
  if (!list) return;
  if (incomingRequests.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-dim);font-size:0.85rem;">No incoming requests yet.</div>';
    return;
  }
  list.innerHTML = incomingRequests.map(function(r) {
    return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:12px;">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">' +
        '<div style="width:44px;height:44px;border-radius:50%;background:' + r.color + ';display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:0.9rem;flex-shrink:0;">' + r.initials + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-weight:800;font-size:0.9rem;">' + r.name + '</div>' +
          '<div style="font-size:0.72rem;color:var(--text-dim);">' + r.tagline + '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;">' + r.genres.map(function(g){return '<span style="padding:2px 8px;border-radius:10px;font-size:0.65rem;font-weight:700;background:var(--brown-bg);color:var(--brown);">' + g + '</span>';}).join('') + '</div>' +
        '</div>' +
      '</div>' +
      (r.message ? '<div style="background:var(--cream);border-radius:8px;padding:10px 12px;font-size:0.8rem;color:var(--text);margin-bottom:12px;font-style:italic;">"' + r.message + '"</div>' : '') +
      '<div style="display:flex;gap:8px;">' +
        '<button onclick="declineRequest(' + r.id + ')" data-name="' + r.name + '" style="flex:1;padding:9px;background:#fee2e2;color:#dc2626;border:1px solid #fecaca;border-radius:9px;cursor:pointer;font-weight:700;font-size:0.82rem;">&#10005; Decline</button>' +
        '<button onclick="acceptRequest(' + r.id + ')" style="flex:2;padding:9px;background:linear-gradient(135deg,var(--brown-light),var(--brown-dark));color:#fff;border:none;border-radius:9px;cursor:pointer;font-weight:700;font-size:0.82rem;">&#10003; Accept Collaboration</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function acceptRequest(id) {
  var req = incomingRequests.find(function(r){ return r.id === id; });
  if (!req) return;
  // Remove from incoming
  var idx = incomingRequests.findIndex(function(r){ return r.id === id; });
  incomingRequests.splice(idx, 1);
  // Add to active
  activeCollabs.push(req);
  collabMessages[id] = [];
  // Update badge
  var badge = document.getElementById('incoming-badge');
  if (badge) badge.textContent = incomingRequests.length;
  toast('✓ Collaboration with ' + req.name + ' accepted! 🎉');
  collabSubTab('active');
}

function declineRequest(id) {
  currentDeclineId = id;
  var req = incomingRequests.find(function(r){ return r.id === id; });
  document.getElementById('decline-name').textContent = req ? req.name : '';
  document.getElementById('decline-message').value = '';
  openModal('modal-collab-decline');
}

function confirmDecline() {
  var msg = document.getElementById('decline-message').value.trim();
  var req = incomingRequests.find(function(r){ return r.id === currentDeclineId; });
  var idx = incomingRequests.findIndex(function(r){ return r.id === currentDeclineId; });
  if (idx > -1) incomingRequests.splice(idx, 1);
  var badge = document.getElementById('incoming-badge');
  if (badge) badge.textContent = incomingRequests.length;
  closeModal('modal-collab-decline');
  toast(msg ? 'Request declined with message sent.' : 'Request declined.');
  renderIncoming();
}

function renderActive() {
  var list = document.getElementById('active-list');
  if (!list) return;
  if (activeCollabs.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-dim);font-size:0.85rem;">No active collaborations yet. Accept an incoming request to get started!</div>';
    return;
  }
  list.innerHTML = activeCollabs.map(function(c) {
    var msgs = collabMessages[c.id] || [];
    var lastMsg = msgs.length ? msgs[msgs.length-1].text : 'No messages yet';
    return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:12px;cursor:pointer;" onclick="openActiveCollab(' + c.id + ')">' +
      '<div style="display:flex;align-items:center;gap:12px;">' +
        '<div style="width:44px;height:44px;border-radius:50%;background:' + c.color + ';display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:0.9rem;flex-shrink:0;">' + c.initials + '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-weight:800;font-size:0.9rem;">' + c.name + '</div>' +
          '<div style="font-size:0.72rem;color:var(--text-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + lastMsg + '</div>' +
        '</div>' +
        '<div style="flex-shrink:0;"><span style="font-size:0.65rem;background:#dcfce7;color:#16a34a;padding:3px 8px;border-radius:10px;font-weight:700;">Active</span></div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function openActiveCollab(id) {
  var c = activeCollabs.find(function(x){ return x.id === id; });
  if (!c) return;
  currentActiveCollab = c;
  ndaSigned = false;
  document.getElementById('active-modal-avatar').style.background = c.color;
  document.getElementById('active-modal-avatar').textContent = c.initials;
  document.getElementById('active-modal-name').textContent = c.name;
  document.getElementById('nda-btn').textContent = 'View & Send NDA';
  document.getElementById('nda-status-text').textContent = 'Protect your collaboration. Send an NDA for both parties to sign.';
  document.getElementById('nda-btn').style.background = '#6366f1';
  // Render messages
  var thread = document.getElementById('collab-msg-thread');
  var msgs = collabMessages[id] || [];
  renderMsgThread(thread, msgs);
  openModal('modal-collab-active');
}

function renderMsgThread(thread, msgs) {
  if (msgs.length === 0) {
    thread.innerHTML = '<div style="text-align:center;font-size:0.72rem;color:var(--text-dim);">Collaboration started — say hello! 👋</div>';
    return;
  }
  thread.innerHTML = msgs.map(function(m) {
    var isMe = m.sender === 'me';
    return '<div style="display:flex;justify-content:' + (isMe?'flex-end':'flex-start') + ';">' +
      '<div style="max-width:75%;background:' + (isMe?'var(--brown)':'#fff') + ';color:' + (isMe?'#fff':'var(--text)') + ';padding:8px 12px;border-radius:' + (isMe?'14px 14px 4px 14px':'14px 14px 14px 4px') + ';font-size:0.82rem;border:' + (isMe?'none':'1px solid var(--border)') + ';">' +
        (m.isDoc ? '<div style="display:flex;align-items:center;gap:6px;"><span>📄</span><span style="font-weight:700;">' + m.text + '</span></div>' : m.text) +
      '</div></div>';
  }).join('');
  thread.scrollTop = thread.scrollHeight;
}

function sendCollabMsg() {
  if (!currentActiveCollab) return;
  var input = document.getElementById('collab-msg-input');
  var text = input.value.trim();
  if (!text) return;
  if (!collabMessages[currentActiveCollab.id]) collabMessages[currentActiveCollab.id] = [];
  collabMessages[currentActiveCollab.id].push({sender:'me', text:text});
  input.value = '';
  var thread = document.getElementById('collab-msg-thread');
  renderMsgThread(thread, collabMessages[currentActiveCollab.id]);
  // Simulate reply after 1.5s
  setTimeout(function() {
    collabMessages[currentActiveCollab.id].push({sender:'them', text:'Thanks for your message! Looking forward to working together 🙌'});
    renderMsgThread(thread, collabMessages[currentActiveCollab.id]);
    renderActive();
  }, 1500);
}

function showNDA() {
  if (currentActiveCollab) {
    document.getElementById('nda-signer-a').textContent = 'You (MASSED User)';
    document.getElementById('nda-date-a').textContent = ndaSigned ? '✓ Signed ' + new Date().toLocaleDateString() : 'Pending signature';
    document.getElementById('nda-signer-b').textContent = currentActiveCollab.name;
    document.getElementById('nda-date-b').textContent = 'Pending signature';
    var signBtn = document.getElementById('nda-sign-btn');
    if (ndaSigned) {
      signBtn.textContent = '✓ You have signed — awaiting other party';
      signBtn.style.background = '#16a34a';
      signBtn.disabled = true;
    } else {
      signBtn.textContent = '✍️ I Agree & Sign';
      signBtn.style.background = '#6366f1';
      signBtn.disabled = false;
    }
  }
  openModal('modal-nda');
}

function signNDA() {
  ndaSigned = true;
  var signedDate = new Date();
  document.getElementById('nda-date-a').textContent = '✓ Signed ' + signedDate.toLocaleDateString();
  var signBtn = document.getElementById('nda-sign-btn');
  signBtn.textContent = '✓ Signed — awaiting ' + (currentActiveCollab ? currentActiveCollab.name : 'other party');
  signBtn.style.background = '#16a34a';
  signBtn.disabled = true;
  document.getElementById('nda-status-text').textContent = '✓ You signed — waiting for ' + (currentActiveCollab ? currentActiveCollab.name : 'other party') + ' to sign.';
  document.getElementById('nda-btn').textContent = '📄 NDA Pending';
  document.getElementById('nda-btn').style.background = '#f59e0b';
  if (currentActiveCollab) {
    if (!collabMessages[currentActiveCollab.id]) collabMessages[currentActiveCollab.id] = [];
    collabMessages[currentActiveCollab.id].push({sender:'me', text:'NDA sent — please review and sign', isDoc:true});
    var thread = document.getElementById('collab-msg-thread');
    if (thread) renderMsgThread(thread, collabMessages[currentActiveCollab.id]);
    // Simulate other party signing after 2 seconds — adds to documents
    setTimeout(function() {
      var doc = {
        id: Date.now(),
        type: 'NDA',
        collaborator: currentActiveCollab.name,
        initials: currentActiveCollab.initials,
        color: currentActiveCollab.color,
        dateSigned: signedDate,
        status: 'Fully Executed',
        content: generateNDAText(currentActiveCollab.name, signedDate)
      };
      signedDocuments.push(doc);
      // Update dropdown
      populateDocFilter();
      // Update NDA banner to fully signed
      document.getElementById('nda-status-text').textContent = '✓ Both parties have signed — document saved to Documents tab.';
      document.getElementById('nda-btn').textContent = '✅ NDA Executed';
      document.getElementById('nda-btn').style.background = '#16a34a';
      toast('🎉 ' + currentActiveCollab.name + ' signed the NDA! Document saved to Documents tab.');
      if (collabMessages[currentActiveCollab.id]) {
        collabMessages[currentActiveCollab.id].push({sender:'them', text:'I have signed the NDA ✍️', isDoc:false});
        if (thread) renderMsgThread(thread, collabMessages[currentActiveCollab.id]);
        renderActive();
      }
    }, 2000);
  }
  toast('✓ NDA signed and sent to ' + (currentActiveCollab ? currentActiveCollab.name : 'collaborator') + '!');
  setTimeout(function(){ closeModal('modal-nda'); }, 800);
}

function generateNDAText(name, date) {
  var dateStr = date.toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'});
  var timeStr = date.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
  return 'NON-DISCLOSURE AGREEMENT\n\n' +
    'Document ID: NDA-' + date.getTime().toString().slice(-8) + '\n' +
    'Effective Date: ' + dateStr + '\n' +
    'Platform: MASSED (massed.io)\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '1. PARTIES\n\n' +
    'This Non-Disclosure Agreement ("Agreement") is entered into as of ' + dateStr + ', by and between:\n\n' +
    '   Party A: MASSED User (You) — the Creator initiating this collaboration\n' +
    '   Party B: ' + name + ' — the Collaborating Creator\n\n' +
    'Both parties are collectively referred to herein as the "Parties."\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '2. PURPOSE\n\n' +
    'The Parties wish to explore a potential business collaboration through the MASSED platform. In connection with this collaboration, each Party may disclose to the other certain confidential and proprietary information. This Agreement sets forth the terms under which such information will be protected.\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '3. CONFIDENTIAL INFORMATION\n\n' +
    '"Confidential Information" means any and all information or data that has or could have commercial value or other utility in the business in which the disclosing Party is engaged. This includes, but is not limited to:\n\n' +
    '   • Business strategies, plans, and financial information\n' +
    '   • Creative works, content, brand assets, and intellectual property\n' +
    '   • Personal brand information, audience data, and analytics\n' +
    '   • Product ideas, service offerings, and pricing structures\n' +
    '   • Contact lists, partnership agreements, and affiliate relationships\n' +
    '   • Any other information designated as confidential by either Party\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '4. OBLIGATIONS\n\n' +
    'Each Party agrees to:\n\n' +
    '   a) Hold all Confidential Information in strict confidence\n' +
    '   b) Not disclose Confidential Information to any third party without prior written consent\n' +
    '   c) Use Confidential Information solely for the purpose of evaluating the collaboration\n' +
    '   d) Protect the Confidential Information with at least the same degree of care used to protect its own confidential information\n' +
    '   e) Promptly notify the other Party of any unauthorized disclosure or use\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '5. TERM\n\n' +
    'This Agreement shall remain in effect for a period of two (2) years from the Effective Date unless terminated earlier by mutual written consent of both Parties.\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '6. GOVERNING LAW\n\n' +
    'This Agreement shall be governed by and construed in accordance with applicable law. Any disputes arising from this Agreement shall be resolved through binding arbitration.\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '7. DIGITAL SIGNATURES\n\n' +
    'Both Parties have reviewed and agreed to this Agreement. The digital signatures below, recorded through the MASSED platform, are legally binding and equivalent to physical signatures.\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    'SIGNATURE — PARTY A\n\n' +
    '   Name:        MASSED User (You)\n' +
    '   Signed:      ✓ Digitally Signed via MASSED Platform\n' +
    '   Date:        ' + dateStr + '\n' +
    '   Time:        ' + timeStr + ' (local)\n' +
    '   IP Platform: massed.io\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    'SIGNATURE — PARTY B\n\n' +
    '   Name:        ' + name + '\n' +
    '   Signed:      ✓ Digitally Signed via MASSED Platform\n' +
    '   Date:        ' + dateStr + '\n' +
    '   Time:        ' + timeStr + ' (local)\n' +
    '   IP Platform: massed.io\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    'CERTIFICATE OF COMPLETION\n\n' +
    'This document certifies that the Non-Disclosure Agreement between the above named parties was fully executed on ' + dateStr + ' at ' + timeStr + ' through the MASSED collaboration platform. Both digital signatures have been verified and recorded. This document is legally binding.\n\n' +
    'Document ID: NDA-' + date.getTime().toString().slice(-8) + '\n' +
    'Issued by: MASSED Platform — massed.io\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
}

// ── CORE NAV & UI ─────────────────────────────────────────────────────────────
function toggleSidebar() {
  var sb = document.getElementById('main-sidebar');
  var ov = document.getElementById('sidebar-overlay');
  if (!sb) return;
  if (sb.classList.contains('open')) {
    sb.classList.remove('open');
    if (ov) {
      ov.classList.remove('open');
      setTimeout(function(){ if (ov && !ov.classList.contains('open')) ov.style.visibility = 'hidden'; }, 280);
    }
  } else {
    if (ov) { ov.style.visibility = 'visible'; }
    // Force reflow before adding open class so CSS transition fires
    requestAnimationFrame(function() {
      sb.classList.add('open');
      if (ov) ov.classList.add('open');
    });
  }
}
function closeSidebar() {
  var sb = document.getElementById('main-sidebar');
  var ov = document.getElementById('sidebar-overlay');
  if (sb) sb.classList.remove('open');
  if (ov) {
    ov.classList.remove('open');
    setTimeout(function(){ if (ov && !ov.classList.contains('open')) ov.style.visibility = 'hidden'; }, 280);
  }
}

function openModal(id) { var el=document.getElementById(id); if(el) el.classList.add('open'); }
function closeModal(id) { var el=document.getElementById(id); if(el) el.classList.remove('open'); }

// Dual-link: lights up the chain icon, opens public page in new tab, AND switches dashboard to Public View
function dualLinkOpen(el) {
  el.classList.add('linking');
  el.classList.add('linked');
  setTimeout(function(){ el.classList.remove('linking'); }, 700);
  // Open the public page URL in a new tab
  var username = el.textContent.trim();
  window.open('https://' + username, '_blank');
  // Also switch this dashboard to the Switch Profile (public view) screen
  if(typeof nav === 'function') {
    nav(null, 'switchprofile');
  }
  toast('🔗 Linked! Public page opened + switched to Public View');
}

function toast(msg) {
  var t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg; t.classList.add('show');
  setTimeout(function(){ if(t) t.classList.remove('show'); },3000);
}
var pageTitles={dashboard:'Dashboard',signals:'Signals',vault:'My Vault',bannedblocked:'Banned / Blocked',gateway:'Gateway Room',showcase:'Showcase',mystore:'My Store',mydigital:'My Store — Digital Products',myphysical:'My Store — Physical Products',mycourses:'My Store — Courses',listings:'Listings',createpoll:'Create Poll',forms:'Forms',weblinks:'Web Links',mediaprofile:'Media Profile',sociallinks:'Social Links',video:'Video',analytics:'Analytics',reviews:'Reviews',tickets:'Events / Tickets',scanner:'Ticket Scanner',livepreview:'Live Preview',promo:'Promo / Referrals / Affiliates',settings:'Settings',billing:'Billing',salespayouts:'Sales & Payouts',booking:'Your Booking Services',subs:'Subscriptions / Subscribers / Memberships',browsericon:'Branding / Browser Icon',payoutsettings:'My Payout Earnings',messages:'My Messages',switchprofile:'',coming:'Coming Soon',sparkfounder:'Spark Founder'};

function navStoreTab(el, tab) {
  nav(el, 'mystore');
  setTimeout(function(){ storeTab(tab); }, 30);
  var pt = document.getElementById('page-title');
  var tabNames = { physical:'My Store — Physical Products', digital:'My Store — Digital Products', courses:'My Store — Courses' };
  if (pt) pt.textContent = tabNames[tab] || 'My Store';
}

function storeTab(tab) {
  ['physical','digital','courses','visibility'].forEach(function(t) {
    var el = document.getElementById('store-'+t+'-content');
    var btn = document.getElementById('stab-'+t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) {
      btn.style.background = t === tab ? 'var(--brown)' : 'transparent';
      btn.style.color = t === tab ? '#fff' : 'var(--text-dim)';
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MASSED SHOWCASE — Single-source template system
// render(opts) → real profile HTML used by card, phone & public page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
var SHOWCASE_ACTIVE = 'classic';

// Helper: read live profile data
function _pd() {
  var nameEl  = document.querySelector('#mptab-profile-content input[placeholder="Your name"]');
  var titleEl = document.querySelector('#mptab-profile-content input[placeholder="e.g. UGC Creator, Beauty Consultant"]');
  var bioEl   = document.querySelector('#mptab-profile-content textarea');
  return {
    name:   (nameEl  && nameEl.value.trim())  || 'Avy Adore',
    title:  (titleEl && titleEl.value.trim()) || 'Beauty · Wellness · Real Estate & More',
    bio:    (bioEl   && bioEl.value.trim())   || 'Sign up to get updates directly from me.',
    handle: ((nameEl && nameEl.value.trim()) || 'avyadore').toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,''),
    rating: '4.9', reviews: '884'
  };
}

// ── SOCIAL ICON ROW (shared) ──────────────────────────────
function _socialBar(fg, bg) {
  var icons = [
    // TikTok
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="'+fg+'"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.7a4.85 4.85 0 01-1.01-.01z"/></svg>',
    // Snapchat
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="'+fg+'"><path d="M12.166 2C8.756 2 6 4.756 6 8.166v.523l-.832.222a.73.73 0 00-.535.777l.1.556a.73.73 0 00.612.6l.29.04-.168.39C4.78 12.07 3.5 13.15 2.8 13.15a.73.73 0 00-.73.73v.17a.73.73 0 00.73.73c.9 0 2.96.78 4 2.55.63 1.07 1.84 1.84 3.72 1.84.47 0 .96-.06 1.48-.18l.17-.04.17.04c.52.12 1.01.18 1.48.18 1.88 0 3.09-.77 3.72-1.84 1.04-1.77 3.1-2.55 4-2.55a.73.73 0 00.73-.73v-.17a.73.73 0 00-.73-.73c-.7 0-1.98-1.08-2.667-2.743l-.168-.39.29-.04a.73.73 0 00.612-.6l.1-.556a.73.73 0 00-.535-.777L21 8.69v-.523C21 4.756 18.244 2 14.834 2h-2.668z"/></svg>',
    // Instagram
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="'+fg+'" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="'+fg+'"/></svg>',
    // Facebook
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="'+fg+'"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>',
    // YouTube
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="'+fg+'"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 001.95-1.97A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>',
    // Amazon
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="'+fg+'"><path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705a.661.661 0 01-.77.074c-1.079-.895-1.271-1.311-1.865-2.165-1.782 1.815-3.044 2.36-5.353 2.36-2.737 0-4.863-1.688-4.863-5.073 0-2.641 1.431-4.441 3.471-5.321 1.768-.782 4.237-.92 6.127-1.134v-.422c0-.778.06-1.698-.396-2.372-.397-.602-1.162-.85-1.833-.85-1.245 0-2.357.639-2.629 1.962-.056.297-.274.59-.576.604l-3.229-.349c-.272-.062-.576-.281-.499-.699.743-3.912 4.28-5.09 7.447-5.09 1.622 0 3.742.432 5.021 1.66 1.622 1.519 1.467 3.542 1.467 5.748v5.206c0 1.567.649 2.253 1.259 3.099.215.302.261.664-.01.89l-2.569 2.222zm2.574 3.338C17.344 22.05 14.77 22.5 12.5 22.5c-3.508 0-6.709-1.293-9.113-3.434-.378-.332-.041-.784.414-.527 2.593 1.513 5.798 2.417 9.109 2.417 2.232 0 4.685-.463 6.942-1.423.341-.146.627.223.286.6z"/></svg>'
  ];
  return '<div style="display:flex;align-items:center;gap:7px;padding:10px 14px 7px;">'
    + icons.map(function(i){ return '<div style="width:26px;height:26px;background:'+bg+';border-radius:7px;display:flex;align-items:center;justify-content:center;">'+i+'</div>'; }).join('')
    + '<div style="margin-left:auto;cursor:pointer;"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="'+fg+'" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></div>'
    + '</div>';
}

// ── SECTION TILE GRID (shared: classic/cream) ─────────────
function _sectionGrid(accent, border, bg, text) {
  var tiles = [
    ['📦','Shop'],['🎓','Courses'],['🎟️','Events'],
    ['📅','Booking'],['🎫','Tickets'],['💳','Members'],
    ['📚','Ebooks'],['⭐','Reviews'],['👤','My Profile']
  ];
  var html = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:0 12px 8px;">';
  tiles.forEach(function(t) {
    html += '<div style="background:'+bg+';border:1.5px solid '+border+';border-radius:10px;padding:10px 4px 8px;text-align:center;cursor:pointer;">'
      + '<div style="font-size:18px;margin-bottom:4px;">'+t[0]+'</div>'
      + '<div style="font-size:7px;font-weight:700;color:'+text+';line-height:1.3;">'+t[1]+'</div>'
      + '</div>';
  });
  html += '</div>';
  // Collaborate + CTA row
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 12px 10px;">';
  html += '<div style="background:'+bg+';border:1.5px solid '+border+';border-radius:10px;padding:10px 4px 8px;text-align:center;cursor:pointer;">'
    + '<div style="font-size:18px;margin-bottom:4px;">🤝</div>'
    + '<div style="font-size:7px;font-weight:700;color:'+text+';">Collaborate</div>'
    + '</div>';
  html += '<div style="background:'+accent+';border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;">'
    + '<div style="font-size:7.5px;font-weight:800;color:#fff;text-align:center;line-height:1.4;">Create My<br>Own Link</div>'
    + '</div>';
  html += '</div>';
  return html;
}

// ── SUBSCRIBE FORM (shared) ───────────────────────────────
function _subscribeForm(btnBg, btnText, borderBg, label) {
  return '<div style="padding:0 12px 8px;">'
    + '<div style="font-size:9px;font-weight:800;color:'+btnBg+';margin-bottom:5px;letter-spacing:0.04em;">'+label+'</div>'
    + '<div style="height:22px;background:'+borderBg+';border:1px solid rgba(0,0,0,0.1);border-radius:6px;margin-bottom:4px;display:flex;align-items:center;padding:0 9px;"><span style="font-size:7.5px;color:#aaa;">First Name</span></div>'
    + '<div style="height:22px;background:'+borderBg+';border:1px solid rgba(0,0,0,0.1);border-radius:6px;margin-bottom:4px;display:flex;align-items:center;padding:0 9px;"><span style="font-size:7.5px;color:#aaa;">Email</span></div>'
    + '<div style="height:22px;background:'+borderBg+';border:1px solid rgba(0,0,0,0.1);border-radius:6px;margin-bottom:7px;display:flex;align-items:center;padding:0 9px;"><span style="font-size:7.5px;color:#aaa;">Phone Number</span></div>'
    + '<div style="height:24px;background:'+btnBg+';border-radius:6px;display:flex;align-items:center;justify-content:center;margin-bottom:5px;cursor:pointer;">'
    + '<span style="color:'+btnText+';font-size:8px;font-weight:800;">Subscribe</span>'
    + '</div>'
    + '<div style="height:24px;background:transparent;border:1.5px solid '+btnBg+';border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;margin-bottom:8px;">'
    + '<span style="color:'+btnBg+';font-size:8px;font-weight:800;">Message Me</span>'
    + '</div></div>';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEMPLATE DEFINITIONS — each render() is the real profile page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
var TEMPLATES = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. MASSED CLASSIC — exact Image 1 Canva layout
  //    Half-portrait hero · social icons · stars · subscribe
  //    form · horizontal image cards · 3-col section grid
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  classic: {
    label: 'MASSED Classic',
    mood:  'Full Profile · Grid Sections · Editorial',
    accent:'#2C1A0E',
    render: function() {
      var p = _pd();

      // Real SVG social platform icons (not letter abbreviations)
      function sIcon(svg, bg) {
        return '<div style="width:28px;height:28px;background:'+(bg||'rgba(44,26,14,0.1)')+';border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+svg+'</div>';
      }
      var ttSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="#2C1A0E"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.7a4.85 4.85 0 01-1.01-.01z"/></svg>';
      var scSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="#2C1A0E"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
      var igSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2C1A0E" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="#2C1A0E" stroke="none"/></svg>';
      var fbSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="#2C1A0E"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>';
      var ytSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="#2C1A0E"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45a2.78 2.78 0 00-1.95 1.97A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 001.95-1.97A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>';
      var amzSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="#2C1A0E"><path d="M15.93 17.09c-2.93 1.97-7.17 3.02-10.82 1.6C2.36 17.5.5 15.55.5 12.5c0-5.24 4.27-9.5 9.5-9.5 2.65 0 5.05 1.08 6.78 2.82M15 9l2 2-2 2M17 11H9"/></svg>';
      var shareSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2C1A0E" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';

      // Trusted source badge (shield + checkmark like Image 1)
      var trustedBadge = '<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;">'
        + '<svg viewBox="0 0 24 24" width="16" height="16" fill="#2C1A0E"><path d="M12 2L3 7l.01 5c0 4.52 3.8 8.76 8.99 9.99C17.2 20.76 21 16.52 21 12V7L12 2z"/></svg>'
        + '<span style="font-size:7px;font-weight:700;color:#2C1A0E;letter-spacing:0.06em;text-transform:uppercase;">Trusted Source</span>'
        + '</div>';

      return '<div style="background:#f5ede8;min-height:700px;font-family:\'DM Sans\',sans-serif;">'

        // ── Social icon row ──────────────────────────────────
        + '<div style="display:flex;align-items:center;gap:6px;padding:10px 12px 8px;">'
        + sIcon(ttSvg) + sIcon(scSvg) + sIcon(igSvg) + sIcon(fbSvg) + sIcon(ytSvg) + sIcon(amzSvg)
        + '<div style="margin-left:auto;">'+shareSvg+'</div>'
        + '</div>'

        // ── Hero: real photo left, profile info right ────────
        // Photo uses a full-bleed portrait-style image
        + '<div style="display:flex;height:160px;">'
          // Photo panel — real image, not a gradient
          + '<div style="width:46%;position:relative;overflow:hidden;">'
          + '<img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=320&fit=crop&crop=face&auto=format" style="width:100%;height:100%;object-fit:cover;object-position:top center;" onerror="this.style.background=\'linear-gradient(170deg,#8B6558,#C4956A)\';this.src=\'\';">'
          + '</div>'
          // Info panel
          + '<div style="flex:1;padding:12px 10px 10px;display:flex;flex-direction:column;justify-content:flex-start;gap:2px;">'
          + trustedBadge
          + '<div style="font-size:15px;font-weight:900;color:#2C1A0E;letter-spacing:-0.3px;line-height:1.1;margin-bottom:3px;">'+p.name+'</div>'
          + '<div style="color:#C07A50;font-size:10px;margin-bottom:3px;letter-spacing:0.5px;">★★★★★ <span style="color:#999;font-size:8px;">('+p.reviews+')</span></div>'
          + '<div style="font-size:7.5px;font-weight:600;color:#3a2a1e;line-height:1.55;">'+p.title+'</div>'
          + '<div style="margin-top:5px;border-top:1px solid rgba(44,26,14,0.1);padding-top:5px;">'
          + '<div style="font-size:8px;font-weight:800;color:#2C1A0E;">Subscribe to '+p.handle+'</div>'
          + '<div style="font-size:7px;color:#888;margin-top:1px;">Get email updates directly from me</div>'
          + '</div></div>'
        + '</div>'

        // ── Subscribe form ───────────────────────────────────
        + '<div style="padding:12px 12px 8px;">'
        + ['First Name','Email','Phone Number'].map(function(ph){
          return '<div style="height:26px;background:#fff;border:1px solid #ddd;border-radius:7px;margin-bottom:5px;display:flex;align-items:center;padding:0 10px;">'
            + '<span style="font-size:8px;color:#bbb;">'+ph+'</span></div>';
        }).join('')
        + '<div style="height:30px;background:#2C1A0E;border-radius:7px;display:flex;align-items:center;justify-content:center;margin-bottom:5px;cursor:pointer;">'
        + '<span style="color:#fff;font-size:9px;font-weight:800;letter-spacing:0.04em;">Subscribe to '+p.handle+'</span>'
        + '</div>'
        + '<div style="height:30px;background:transparent;border:1.5px solid #2C1A0E;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;">'
        + '<span style="color:#2C1A0E;font-size:9px;font-weight:800;">Message Me</span>'
        + '</div></div>'

        // ── Horizontal image-card link row ───────────────────
        + '<div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:10px 12px;">'
        + [
            ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=140&fit=crop&auto=format', 'Oi: Body Chemistry'],
            ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=140&fit=crop&crop=face&auto=format', p.handle+'.com'],
            ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=140&fit=crop&auto=format', 'TikTok']
          ].map(function(c){
            return '<div style="flex-shrink:0;width:96px;height:68px;border-radius:10px;overflow:hidden;position:relative;border:1px solid rgba(0,0,0,0.07);">'
              + '<img src="'+c[0]+'" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'linear-gradient(135deg,#8B6558,#C07A50)\';this.remove();">'
              + '<div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(0,0,0,0.65));"></div>'
              + '<div style="position:absolute;bottom:0;left:0;right:0;padding:5px 7px;">'
              + '<span style="color:#fff;font-size:7px;font-weight:700;line-height:1.2;display:block;">'+c[1]+'</span>'
              + '</div></div>';
          }).join('')
        + '</div>'

        // ── 3-col section grid ───────────────────────────────
        + (function(){
          var sections = [
            {icon:'🛍️',label:'Shop'},
            {icon:'🎓',label:'Courses'},
            {icon:'🎟️',label:'Events'},
            {icon:'📅',label:'Booking'},
            {icon:'🎫',label:'Tickets'},
            {icon:'💳',label:'Members/\nSubs'},
            {icon:'📚',label:'Ebooks'},
            {icon:'⭐',label:'Reviews'},
            {icon:'👤',label:'My Media\nProfile'}
          ];
          var imgs = [
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=80&fit=crop&crop=face&auto=format'
          ];
          var g = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:0 12px 6px;">';
          sections.forEach(function(s, i){
            g += '<div style="background:#fff;border:1.5px solid #e8dcd4;border-radius:10px;overflow:hidden;cursor:pointer;">'
              + '<div style="height:44px;overflow:hidden;position:relative;">'
              + '<img src="'+imgs[i]+'" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'#e8dcd4\';this.remove();">'
              + '</div>'
              + '<div style="padding:5px 4px 6px;text-align:center;">'
              + '<div style="font-size:7px;font-weight:700;color:#2C1A0E;white-space:pre-line;line-height:1.3;">'+s.label+'</div>'
              + '</div></div>';
          });
          g += '</div>';
          // Bottom row: Collaborate + CTA
          g += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 12px 16px;">';
          g += '<div style="background:#fff;border:1.5px solid #e8dcd4;border-radius:10px;overflow:hidden;cursor:pointer;">'
            + '<div style="height:44px;overflow:hidden;background:linear-gradient(135deg,#8B6558,#C07A50);display:flex;align-items:center;justify-content:center;font-size:22px;">🤝</div>'
            + '<div style="padding:5px 4px 6px;text-align:center;"><div style="font-size:7px;font-weight:700;color:#2C1A0E;">Collaborate\nWith Me</div></div>'
            + '</div>';
          g += '<div style="background:#2C1A0E;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:8px;">'
            + '<div style="font-size:8.5px;font-weight:800;color:#fff;text-align:center;line-height:1.5;">Create My<br>Own Link</div>'
            + '</div>';
          g += '</div>';
          return g;
        })()

        + '</div>'; // end outer
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. DARK MINIMAL — exact Image 2 Canva layout
  //    Full-bleed dark bg · real photo backdrop · circular
  //    portrait · cursive first/last name flanking avatar ·
  //    white pill buttons · bottom free-download CTA card
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  dark: {
    label: 'Dark Minimal',
    mood:  'Bold · Cinematic · Pill Links',
    accent:'#ffffff',
    render: function() {
      var p = _pd();
      var names = p.name.trim().split(/\s+/);
      var first = names[0] || p.name;
      var last  = names.slice(1).join(' ') || '';

      return '<div style="background:#0a0a0a;min-height:700px;font-family:\'DM Sans\',sans-serif;position:relative;overflow:hidden;">'

        // Full-bleed real photo background (top half)
        + '<div style="position:absolute;top:0;left:0;right:0;height:220px;overflow:hidden;">'
        + '<img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop&auto=format" style="width:100%;height:100%;object-fit:cover;opacity:0.35;" onerror="this.remove();">'
        + '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.2) 0%,rgba(10,10,10,1) 100%);"></div>'
        + '</div>'

        // Content layer above bg
        + '<div style="position:relative;z-index:2;">'

          // Top social bar (subtle on dark)
          + '<div style="display:flex;align-items:center;justify-content:flex-end;padding:12px 14px 0;">'
          + '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
          + '</div>'

          // Name + circular portrait + name layout (Image 2 exact)
          + '<div style="display:flex;align-items:center;justify-content:center;gap:0;padding:70px 16px 0;">'
            // Left: first name in cursive italic
            + '<div style="flex:1;text-align:right;padding-right:10px;">'
            + '<span style="font-family:Georgia,serif;font-size:20px;font-style:italic;font-weight:700;color:rgba(255,255,255,0.95);letter-spacing:0.01em;text-shadow:0 2px 12px rgba(0,0,0,0.8);">'+first+'</span>'
            + '</div>'
            // Centre: circular real portrait
            + '<div style="width:90px;height:90px;border-radius:50%;border:3px solid #fff;overflow:hidden;flex-shrink:0;box-shadow:0 8px 32px rgba(0,0,0,0.7);">'
            + '<img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face&auto=format" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'linear-gradient(145deg,#555,#999)\';this.remove();">'
            + '</div>'
            // Right: last name in cursive italic
            + '<div style="flex:1;padding-left:10px;">'
            + '<span style="font-family:Georgia,serif;font-size:20px;font-style:italic;font-weight:700;color:rgba(255,255,255,0.95);letter-spacing:0.01em;text-shadow:0 2px 12px rgba(0,0,0,0.8);">'+last+'</span>'
            + '</div>'
          + '</div>'

          // Title — bold centred
          + '<div style="text-align:center;margin-top:14px;padding:0 16px;">'
          + '<div style="font-size:17px;font-weight:900;color:#fff;letter-spacing:0.06em;margin-bottom:4px;">'+p.title.toUpperCase().replace(/[·•]/g,'|').substring(0,24)+'</div>'
          + '<div style="font-size:8px;color:rgba(255,255,255,0.5);line-height:1.65;max-width:200px;margin:0 auto 18px;">'+p.bio.substring(0,80)+'</div>'
          + '</div>'

          // Pill buttons — white rounded (exact Image 2)
          + '<div style="padding:0 16px;display:flex;flex-direction:column;gap:8px;margin-bottom:18px;">'
          + ['ABOUT ME','PORTFOLIO','MY SERVICES','WORK WITH ME','BOOK A CALL'].map(function(lbl){
              return '<div style="background:#fff;border-radius:32px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 14px rgba(255,255,255,0.1);cursor:pointer;">'
                + '<span style="font-size:9.5px;font-weight:800;color:#0a0a0a;letter-spacing:0.16em;">'+lbl+'</span>'
                + '</div>';
            }).join('')
          + '</div>'

          // Bottom CTA card (Image 2 lower section — free download)
          + '<div style="margin:0 12px 16px;background:#f5ede8;border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 28px rgba(0,0,0,0.6);">'
          + '<div style="flex:1;">'
          + '<div style="font-size:10px;font-weight:900;color:#2C1A0E;font-style:italic;margin-bottom:3px;line-height:1.3;font-family:Georgia,serif;">Get your free download!</div>'
          + '<div style="font-size:7px;color:#666;line-height:1.6;margin-bottom:8px;">The ultimate guide to boost your sales with UGC.</div>'
          + '<div style="display:inline-flex;height:18px;border:1.5px solid #2C1A0E;border-radius:20px;align-items:center;padding:0 10px;cursor:pointer;">'
          + '<span style="font-size:7px;font-weight:800;color:#2C1A0E;letter-spacing:0.12em;">SEE NOW</span>'
          + '</div></div>'
          // Real product image thumbnail
          + '<div style="width:54px;height:68px;border-radius:8px;overflow:hidden;flex-shrink:0;">'
          + '<img src="https://images.unsplash.com/photo-1546961342-ea5f62d5a27b?w=120&h=160&fit=crop&auto=format" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'#ccc\';this.remove();">'
          + '</div>'
          + '</div>'

        + '</div>'
      + '</div>';
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. CREAM EDITORIAL — magazine / fashion editorial
  //    Dark masthead banner · cream body · hero strip ·
  //    subscribe card · refined pill CTAs
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cream: {
    label: 'Cream Editorial',
    mood:  'Warm · Refined · Magazine',
    accent:'#C07A50',
    render: function() {
      var p = _pd();
      return '<div style="background:#FDFAF6;min-height:700px;font-family:\'DM Sans\',sans-serif;">'

        // Dark masthead with real photo avatar
        + '<div style="background:#2C1A0E;padding:12px 14px 12px;display:flex;align-items:center;justify-content:space-between;">'
        + '<div style="width:48px;height:48px;border-radius:50%;overflow:hidden;border:2px solid rgba(192,122,80,0.5);flex-shrink:0;">'
        + '<img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face&auto=format" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'#8B6558\';this.remove();">'
        + '</div>'
        + '<div style="flex:1;padding:0 12px;">'
        + '<div style="font-size:13px;font-weight:900;color:#fff;letter-spacing:0.03em;line-height:1.2;">'+p.name+'</div>'
        + '<div style="font-size:7px;color:#C07A50;letter-spacing:0.12em;text-transform:uppercase;margin-top:2px;">'+p.title.substring(0,30)+'</div>'
        + '</div>'
        + '<div style="font-size:11px;color:#C07A50;letter-spacing:1px;">★★★★★</div>'
        + '</div>'

        // Full-bleed editorial hero image strip
        + '<div style="height:100px;position:relative;overflow:hidden;">'
        + '<img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=200&fit=crop&auto=format" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'linear-gradient(135deg,#C4956A,#8B6558)\';this.remove();">'
        + '<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(44,26,14,0.7) 0%,rgba(44,26,14,0.2) 60%,transparent);"></div>'
        + '<div style="position:absolute;inset:0;display:flex;align-items:center;padding:0 18px;">'
        + '<div>'
        + '<div style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#fff;font-style:italic;line-height:1.1;">'+p.name.split(' ')[0]+'\'s World</div>'
        + '<div style="font-size:7px;color:rgba(255,255,255,0.7);letter-spacing:0.2em;text-transform:uppercase;margin-top:3px;">your go-to creator</div>'
        + '</div></div></div>'

        // Subscribe card
        + '<div style="background:#fff;margin:10px 12px;border-radius:14px;padding:14px;box-shadow:0 4px 20px rgba(44,26,14,0.1);border:1px solid #e8dcd4;">'
        + '<div style="font-size:9.5px;font-weight:800;color:#2C1A0E;text-align:center;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:9px;">Join the Inner Circle</div>'
        + ['Your Name','Email Address','Phone Number'].map(function(ph){
          return '<div style="height:24px;border:1px solid #e0d5cc;border-radius:7px;margin-bottom:5px;display:flex;align-items:center;padding:0 10px;background:#FDFAF6;">'
            + '<span style="font-size:7.5px;color:#bbb;">'+ph+'</span></div>';
        }).join('')
        + '<div style="height:26px;background:linear-gradient(135deg,#C07A50,#8B5030);border-radius:7px;display:flex;align-items:center;justify-content:center;margin-top:4px;cursor:pointer;">'
        + '<span style="color:#fff;font-size:8.5px;font-weight:700;letter-spacing:0.1em;">SUBSCRIBE NOW</span>'
        + '</div></div>'

        // Action links with real images
        + '<div style="padding:0 12px;display:flex;flex-direction:column;gap:7px;margin-bottom:12px;">'
        + [
          ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=60&h=40&fit=crop&auto=format','#2C1A0E','#fff','🛍️  Shop My Collection'],
          ['https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=60&h=40&fit=crop&auto=format','#C07A50','#fff','📅  Book a Session'],
          [null,'transparent','#2C1A0E','🎓  My Courses'],
          [null,'transparent','#2C1A0E','⭐  Reviews']
          ].map(function(b){
            return '<div style="height:30px;background:'+b[1]+';border:1.5px solid '+(b[1]==='transparent'?'#d4b99a':'transparent')+';border-radius:9px;display:flex;align-items:center;padding:0 10px;gap:8px;overflow:hidden;position:relative;cursor:pointer;">'
              + (b[0]?'<img src="'+b[0]+'" style="position:absolute;left:0;top:0;height:100%;width:50px;object-fit:cover;opacity:0.35;" onerror="this.remove();">':'')
              + '<span style="font-size:9px;font-weight:700;color:'+b[2]+';letter-spacing:0.03em;position:relative;">'+b[3]+'</span>'
              + '</div>';
          }).join('')
        + '</div>'

        // Social strip (real icon SVGs)
        + '<div style="display:flex;justify-content:center;gap:8px;padding:4px 0 14px;">'
        + ['TT','IG','FB','YT'].map(function(s){
          return '<div style="width:26px;height:26px;background:#2C1A0E;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;color:#C07A50;">'+s+'</div>';
        }).join('')
        + '</div>'
      + '</div>';
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. MIDNIGHT — deep indigo / neon glow / stats bar
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  midnight: {
    label: 'Midnight',
    mood:  'Dark Indigo · Stats · Vibrant',
    accent:'#6366f1',
    render: function() {
      var p = _pd();
      return '<div style="background:#07071a;min-height:700px;font-family:\'DM Sans\',sans-serif;">'

        // Hero with real image + indigo overlay
        + '<div style="height:160px;position:relative;overflow:hidden;">'
        + '<img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=260&fit=crop&auto=format" style="width:100%;height:100%;object-fit:cover;opacity:0.4;" onerror="this.remove();">'
        + '<div style="position:absolute;inset:0;background:linear-gradient(160deg,rgba(49,46,129,0.85),rgba(7,7,26,0.98));"></div>'
        // Glow orb
        + '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:180px;height:180px;background:radial-gradient(circle,rgba(99,102,241,0.4),transparent 70%);"></div>'
        // Avatar on hero
        + '<div style="position:absolute;bottom:-28px;left:50%;transform:translateX(-50%);">'
        + '<div style="width:56px;height:56px;border-radius:50%;overflow:hidden;border:3px solid #6366f1;box-shadow:0 0 20px rgba(99,102,241,0.8);">'
        + '<img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face&auto=format" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'linear-gradient(135deg,#6366f1,#8b5cf6)\';this.remove();">'
        + '</div></div></div>'

        // Name + title
        + '<div style="text-align:center;padding:36px 14px 10px;">'
        + '<div style="font-size:16px;font-weight:900;color:#fff;letter-spacing:0.05em;margin-bottom:3px;">'+p.name+'</div>'
        + '<div style="font-size:8px;color:#a5b4fc;letter-spacing:0.15em;text-transform:uppercase;">'+p.title.substring(0,30)+'</div>'
        + '</div>'

        // Glow divider
        + '<div style="height:1px;background:linear-gradient(90deg,transparent,#6366f1,transparent);margin:0 0 0;"></div>'

        // Stats bar
        + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;background:#0f0f2d;border-bottom:1px solid rgba(99,102,241,0.2);">'
        + [['12K','Followers'],[p.reviews,'Reviews'],['★ '+p.rating,'Rating']].map(function(s){
          return '<div style="text-align:center;padding:10px 0;border-right:1px solid rgba(99,102,241,0.12);">'
            + '<div style="font-size:13px;font-weight:900;color:#6366f1;line-height:1;">'+s[0]+'</div>'
            + '<div style="font-size:6.5px;color:#4b5563;letter-spacing:0.1em;text-transform:uppercase;margin-top:2px;">'+s[1]+'</div>'
            + '</div>';
        }).join('')
        + '</div>'

        // Nav buttons with hover-style
        + '<div style="padding:12px 14px;display:flex;flex-direction:column;gap:6px;">'
        + [
          ['🛍️','SHOP','#6366f1','#fff','linear-gradient(135deg,#6366f1,#4f46e5)'],
          ['📅','BOOK A SESSION','rgba(99,102,241,0.13)','#a5b4fc',''],
          ['🎓','COURSES','rgba(99,102,241,0.13)','#a5b4fc',''],
          ['🤝','COLLABORATE','rgba(139,92,246,0.13)','#c4b5fd',''],
          ['📩','SUBSCRIBE','rgba(99,102,241,0.1)','#818cf8','']
          ].map(function(r){
            return '<div style="height:30px;background:'+(r[4]||r[2])+';border:1px solid rgba(99,102,241,0.3);border-radius:9px;display:flex;align-items:center;padding:0 12px;gap:9px;cursor:pointer;">'
              + '<span style="font-size:13px;line-height:1;">'+r[0]+'</span>'
              + '<span style="font-size:8.5px;font-weight:800;color:'+r[3]+';letter-spacing:0.1em;">'+r[1]+'</span>'
              + '<span style="margin-left:auto;color:'+r[3]+';opacity:0.45;font-size:12px;">›</span>'
              + '</div>';
          }).join('')
        + '</div>'

        // Social
        + '<div style="display:flex;justify-content:center;gap:8px;padding:4px 0 14px;">'
        + ['TT','IG','YT','X'].map(function(s){
          return '<div style="width:28px;height:28px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.4);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:7.5px;font-weight:800;color:#a5b4fc;">'+s+'</div>';
        }).join('')
        + '</div>'
      + '</div>';
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. BLUSH ROSE — pink gradient / fashion / feminine
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  blush: {
    label: 'Blush Rose',
    mood:  'Pink · Feminine · Fashion',
    accent:'#ec4899',
    render: function() {
      var p = _pd();
      return '<div style="background:linear-gradient(165deg,#fff0f8,#fce7f3);min-height:700px;font-family:\'DM Sans\',sans-serif;">'

        // Pink hero with real fashion photo
        + '<div style="height:170px;position:relative;overflow:hidden;">'
        + '<img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=280&fit=crop&auto=format" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'linear-gradient(135deg,#be185d,#ec4899)\';this.remove();">'
        + '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(190,24,93,0.55) 0%,rgba(236,72,153,0.7) 60%,rgba(252,231,243,1) 100%);"></div>'
        // Circular portrait on hero
        + '<div style="position:absolute;bottom:-24px;left:50%;transform:translateX(-50%);">'
        + '<div style="width:60px;height:60px;border-radius:50%;overflow:hidden;border:3px solid #fff;box-shadow:0 4px 18px rgba(190,24,93,0.4);">'
        + '<img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=130&h=130&fit=crop&crop=face&auto=format" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'linear-gradient(135deg,#f9a8d4,#ec4899)\';this.remove();">'
        + '</div></div>'
        // Name over image (bottom of hero)
        + '<div style="position:absolute;top:14px;left:0;right:0;text-align:center;">'
        + '<div style="font-family:Georgia,serif;font-size:16px;font-style:italic;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.3);">'+p.name+'</div>'
        + '</div></div>'

        // Title row
        + '<div style="text-align:center;padding:32px 14px 8px;">'
        + '<div style="font-size:8.5px;color:#ec4899;letter-spacing:0.15em;text-transform:uppercase;font-weight:700;margin-bottom:3px;">'+p.title.substring(0,30)+'</div>'
        + '<div style="display:flex;justify-content:center;gap:2px;margin-bottom:4px;">'
        + [1,2,3,4,5].map(function(){ return '<span style="color:#ec4899;font-size:11px;">★</span>'; }).join('')
        + '<span style="color:#d1a3c0;font-size:8px;margin-left:3px;">('+p.reviews+')</span>'
        + '</div>'
        + '<div style="font-size:7.5px;color:#9d174d;font-style:italic;max-width:180px;margin:0 auto;">'+p.bio.substring(0,70)+' 💕</div>'
        + '</div>'

        // Subscribe card
        + '<div style="background:#fff;margin:8px 12px;border-radius:14px;padding:13px;box-shadow:0 4px 18px rgba(236,72,153,0.12);border:1px solid #fbcfe8;">'
        + '<div style="font-size:9px;font-weight:800;color:#831843;text-align:center;letter-spacing:0.08em;margin-bottom:8px;">💌 Join My World</div>'
        + ['Your Name','Email','Phone Number'].map(function(ph){
          return '<div style="height:23px;border:1px solid #fbcfe8;border-radius:7px;margin-bottom:5px;display:flex;align-items:center;padding:0 10px;">'
            + '<span style="font-size:7.5px;color:#d1a3c0;">'+ph+'</span></div>';
        }).join('')
        + '<div style="height:26px;background:linear-gradient(135deg,#ec4899,#be185d);border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;margin-top:2px;">'
        + '<span style="color:#fff;font-size:8.5px;font-weight:700;letter-spacing:0.1em;">SUBSCRIBE</span>'
        + '</div></div>'

        // Action buttons
        + '<div style="padding:0 12px;display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">'
        + [
          ['linear-gradient(135deg,#ec4899,#db2777)','#fff','💄  Shop My Looks'],
          ['transparent','#831843','📅  Book a Session'],
          ['transparent','#831843','🎓  My Courses'],
          ['transparent','#831843','⭐  Reviews']
          ].map(function(b){
            return '<div style="height:28px;background:'+b[0]+';border:1.5px solid '+(b[0]==='transparent'?'#fbcfe8':'transparent')+';border-radius:9px;display:flex;align-items:center;padding:0 12px;cursor:pointer;">'
              + '<span style="font-size:9px;font-weight:700;color:'+b[1]+';letter-spacing:0.03em;">'+b[2]+'</span>'
              + '</div>';
          }).join('')
        + '</div>'

        // Social strip
        + '<div style="display:flex;justify-content:center;gap:8px;padding:4px 0 14px;">'
        + ['TT','IG','YT','PIN'].map(function(s){
          return '<div style="width:26px;height:26px;background:linear-gradient(135deg,#ec4899,#be185d);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:7.5px;font-weight:800;color:#fff;">'+s+'</div>';
        }).join('')
        + '</div>'
      + '</div>';
    }
  }

};

// ── Build showcase card grid ──────────────────────────────
function buildShowcaseCards() {
  var grid = document.getElementById('showcase-card-grid');
  if (!grid) return;
  grid.innerHTML = '';
  Object.keys(TEMPLATES).forEach(function(key) {
    var t = TEMPLATES[key];
    var isSelected = key === SHOWCASE_ACTIVE;

    // Wrapper card
    var wrapper = document.createElement('div');
    wrapper.className = 'template-card' + (isSelected ? ' selected' : '');
    wrapper.style.cssText = 'cursor:pointer;border-radius:16px;border:2px solid '+(isSelected?'var(--brown)':'var(--border)')+';overflow:hidden;transition:all 0.2s;'+(isSelected?'box-shadow:0 0 0 3px rgba(192,122,80,0.2);':'');
    wrapper.setAttribute('data-tpl', key);
    wrapper.onclick = function() { pickTemplate(this, key); };

    // Thumbnail: real template scaled to 0.35x inside iframe-like container
    var thumb = document.createElement('div');
    thumb.style.cssText = 'height:220px;overflow:hidden;position:relative;background:#f5ede8;';

    var scaler = document.createElement('div');
    scaler.style.cssText = 'position:absolute;top:0;left:0;transform-origin:top left;transform:scale(0.35);width:286%;pointer-events:none;';
    scaler.innerHTML = t.render();
    thumb.appendChild(scaler);

    // Selection overlay badge
    if (isSelected) {
      var badge = document.createElement('div');
      badge.style.cssText = 'position:absolute;top:8px;right:8px;background:var(--brown);color:#fff;font-size:7px;font-weight:800;padding:3px 9px;border-radius:10px;letter-spacing:0.08em;text-transform:uppercase;';
      badge.textContent = 'SELECTED';
      thumb.appendChild(badge);
    }

    // Label row
    var info = document.createElement('div');
    info.style.cssText = 'padding:10px 12px 12px;background:#fff;';
    info.innerHTML = '<div style="font-size:11px;font-weight:800;color:var(--text);margin-bottom:2px;">'+t.label+'</div>'
      + '<div style="font-size:9px;color:var(--text-dim);">'+t.mood+'</div>'
      + '<div style="margin-top:6px;width:16px;height:3px;background:'+t.accent+';border-radius:2px;"></div>';

    wrapper.appendChild(thumb);
    wrapper.appendChild(info);
    grid.appendChild(wrapper);
  });
}

function pickTemplate(card, key) {
  SHOWCASE_ACTIVE = key;
  // Rebuild cards so selected state is correct
  buildShowcaseCards();
  // Update phone preview with the real rendered template
  var screen = document.getElementById('showcase-phone-screen');
  if (screen && TEMPLATES[key]) {
    screen.innerHTML = TEMPLATES[key].render();
  }
  var label = document.getElementById('showcase-applied-label');
  if (label) label.style.display = 'none';
}

function applyTemplate() {
  var t = TEMPLATES[SHOWCASE_ACTIVE];
  toast('✓ "' + (t ? t.label : SHOWCASE_ACTIVE) + '" applied to your public MASSED page!');
  var label = document.getElementById('showcase-applied-label');
  if (label) { label.textContent = '✓ "' + (t ? t.label : '') + '" applied!'; label.style.display = 'inline'; }
}

// Init when showcase screen is first viewed
// buildShowcaseCards called in boot sequence below

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

// ── STORE LIVE TOGGLE ─────────────────────────────────────────────────────────
function toggleStoreLive(cb) {
  var track = document.getElementById('store-live-track');
  var thumb = document.getElementById('store-live-thumb');
  var label = document.getElementById('store-live-label');
  if (cb.checked) {
    if (track) track.style.background = 'var(--brown)';
    if (thumb) thumb.style.left = '27px';
    if (label) label.textContent = 'Store is Live';
    toast('✓ Your store is now live!');
  } else {
    if (track) track.style.background = '#e5e7eb';
    if (thumb) thumb.style.left = '3px';
    if (label) label.textContent = 'Store is Off';
    toast('Store is now hidden from your page');
  }
}

// ── CARD INPUT FORMATTERS ─────────────────────────────────────────────────────
function formatCard(input) {
  var v = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = v.replace(/(.{4})/g, '$1  ').trim();
}
function formatExpiry(input) {
  var v = input.value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 3) v = v.slice(0,2) + ' / ' + v.slice(2);
  input.value = v;
}

// ── LIVE BANNER PRODUCT CONTROLS ─────────────────────────────────────────────
function closeProduct() {
  var info = document.getElementById('banner-product');
  var btnClose = document.getElementById('btn-close-prod');
  var btnBring = document.getElementById('btn-bring-back');
  if (info) info.style.display = 'none';
  if (btnClose) btnClose.style.display = 'none';
  if (btnBring) btnBring.style.display = 'inline-flex';
  toast('Product hidden from live view');
}

function bringBackProduct() {
  var info = document.getElementById('banner-product');
  var btnClose = document.getElementById('btn-close-prod');
  var btnBring = document.getElementById('btn-bring-back');
  if (info) info.style.display = 'flex';
  if (btnClose) btnClose.style.display = 'inline-flex';
  if (btnBring) btnBring.style.display = 'none';
  toast('Product brought back to live view');
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

// ── MY MESSAGES ──────────────────────────────────────────────────────────────
var msgConversations = [
  { id:1, name:'@maya_j', initials:'MJ', color:'#7c3aed', preview:'omg this is amazing 🔥', time:'2m', unread:2, status:'Online', messages:[
    {from:'them',text:'Hey! I just saw your new product drop 🔥',time:'10:22 AM'},
    {from:'them',text:'omg this is amazing 🔥',time:'10:23 AM'},
    {from:'me',text:'Thank you so much! It means a lot 💛',time:'10:25 AM'},
  ]},
  { id:2, name:'@sarah_k', initials:'SK', color:'#0891b2', preview:'where can I buy??', time:'14m', unread:1, status:'Away', messages:[
    {from:'them',text:'where can I buy??',time:'9:50 AM'},
    {from:'me',text:'Check my store link in bio!',time:'9:52 AM'},
  ]},
  { id:3, name:'@jones_r', initials:'JR', color:'#16a34a', preview:'just grabbed it! 🛒', time:'1h', unread:0, status:'Offline', messages:[
    {from:'them',text:'just grabbed it! 🛒',time:'Yesterday'},
    {from:'me',text:'You\'re going to love it!',time:'Yesterday'},
    {from:'them',text:'Can\'t wait for it to arrive',time:'Yesterday'},
  ]},
  { id:4, name:'@beauty.brand', initials:'BB', color:'#d97706', preview:'Collab opportunity?', time:'3h', unread:0, status:'Online', messages:[
    {from:'them',text:'Hi! We\'d love to collab with you on our new skincare line',time:'Yesterday'},
    {from:'me',text:'I\'d love to hear more! Send me the details.',time:'Yesterday'},
    {from:'them',text:'Collab opportunity?',time:'Today'},
  ]},
];
var activeMsgId = null;
var msgFilter = 'all';
var spMediaAttachment = null;

function renderConvoList() {
  var list = document.getElementById('convo-list');
  if (!list) return;
  var filtered = msgConversations.filter(function(c) {
    if (msgFilter === 'unread') return c.unread > 0;
    if (msgFilter === 'requests') return c.id === 4;
    return true;
  });
  var search = (document.getElementById('msg-search') || {}).value || '';
  if (search) filtered = filtered.filter(function(c){ return c.name.toLowerCase().includes(search.toLowerCase()) || c.preview.toLowerCase().includes(search.toLowerCase()); });
  list.innerHTML = filtered.map(function(c) {
    var active = c.id === activeMsgId;
    return '<div onclick="openConvo('+c.id+')" style="display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;background:'+(active?'var(--cream)':'#fff')+';border-bottom:1px solid var(--border);transition:background 0.15s;" onmouseover="if('+c.id+'!==activeMsgId)this.style.background=\'var(--cream)\'" onmouseout="if('+c.id+'!==activeMsgId)this.style.background=\'#fff\'">'
      + '<div style="position:relative;flex-shrink:0;">'
        + '<div style="width:40px;height:40px;border-radius:50%;background:'+c.color+';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:0.8rem;">'+c.initials+'</div>'
        + '<div style="position:absolute;bottom:1px;right:1px;width:9px;height:9px;border-radius:50%;background:'+(c.status==='Online'?'#22c55e':c.status==='Away'?'#f59e0b':'#9ca3af')+';border:1.5px solid #fff;"></div>'
      + '</div>'
      + '<div style="flex:1;min-width:0;">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">'
          + '<div style="font-weight:'+(c.unread?'800':'600')+';font-size:0.85rem;color:var(--text);">'+esc(c.name)+'</div>'
          + '<div style="font-size:0.7rem;color:var(--text-dim);">'+c.time+'</div>'
        + '</div>'
        + '<div style="display:flex;align-items:center;justify-content:space-between;">'
          + '<div style="font-size:0.78rem;color:var(--text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;">'+esc(c.preview)+'</div>'
          + (c.unread ? '<div style="background:var(--brown);color:#fff;font-size:0.6rem;font-weight:800;padding:2px 6px;border-radius:20px;min-width:18px;text-align:center;">'+c.unread+'</div>' : '')
        + '</div>'
      + '</div>'
    + '</div>';
  }).join('') || '<div style="padding:32px;text-align:center;color:var(--text-dim);font-size:0.82rem;">No messages found</div>';
}

function openConvo(id) {
  activeMsgId = id;
  var c = msgConversations.find(function(x){return x.id===id;});
  if (!c) return;
  c.unread = 0;
  // Update badge
  var totalUnread = msgConversations.reduce(function(s,x){return s+x.unread;},0);
  var badge = document.getElementById('msg-badge');
  if (badge) { badge.textContent = totalUnread; badge.style.display = totalUnread ? 'inline-block' : 'none'; }
  // Update header
  var nameEl = document.getElementById('msg-active-name');
  var statusEl = document.getElementById('msg-active-status');
  var avatarEl = document.getElementById('msg-active-avatar');
  if (nameEl) nameEl.textContent = c.name;
  if (statusEl) statusEl.textContent = c.status;
  if (avatarEl) { avatarEl.textContent = c.initials; avatarEl.style.background = c.color; avatarEl.style.color = '#fff'; }
  // Render thread
  renderThread(c);
  renderConvoList();
}

function renderThread(c) {
  var thread = document.getElementById('msg-thread');
  var emptyEl = document.getElementById('msg-thread-empty');
  if (!thread) return;
  if (emptyEl) emptyEl.style.display = 'none';
  var msgEls = thread.querySelectorAll('.msg-bubble-row');
  msgEls.forEach(function(el){el.remove();});
  c.messages.forEach(function(msg) {
    var isMe = msg.from === 'me';
    var row = document.createElement('div');
    row.className = 'msg-bubble-row';
    row.style.cssText = 'display:flex;justify-content:'+(isMe?'flex-end':'flex-start')+';';
    row.innerHTML = '<div style="max-width:72%;padding:10px 14px;border-radius:'+(isMe?'14px 4px 14px 14px':'4px 14px 14px 14px')+';background:'+(isMe?'linear-gradient(135deg,var(--brown-light),var(--brown-dark))':'#fff')+';color:'+(isMe?'#fff':'var(--text)')+';font-size:0.85rem;line-height:1.5;box-shadow:0 1px 4px rgba(44,26,14,0.08);">'
      + '<div>'+esc(msg.text)+'</div>'
      + '<div style="font-size:0.65rem;opacity:0.6;margin-top:4px;text-align:'+(isMe?'right':'left')+';">'+msg.time+'</div>'
    + '</div>';
    thread.appendChild(row);
  });
  thread.scrollTop = thread.scrollHeight;
}

function filterConversations(val) { renderConvoList(); }

function setMsgFilter(filter, btn) {
  msgFilter = filter;
  document.querySelectorAll('.msg-filter-btn').forEach(function(b){
    b.style.color = 'var(--text-dim)'; b.style.borderBottomColor = 'transparent'; b.style.fontWeight = '600';
  });
  if (btn) { btn.style.color = 'var(--brown)'; btn.style.borderBottomColor = 'var(--brown)'; btn.style.fontWeight = '700'; }
  renderConvoList();
}

function autoResizeMsgInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

function sendMessage() {
  var input = document.getElementById('msg-input');
  if (!input || !input.value.trim() || !activeMsgId) return;
  var c = msgConversations.find(function(x){return x.id===activeMsgId;});
  if (!c) return;
  var now = new Date();
  var timeStr = now.getHours()+':'+(now.getMinutes()<10?'0':'')+now.getMinutes()+' '+(now.getHours()<12?'AM':'PM');
  c.messages.push({ from:'me', text:input.value.trim(), time:timeStr });
  c.preview = input.value.trim();
  c.time = 'Just now';
  input.value = '';
  input.style.height = 'auto';
  renderThread(c);
  renderConvoList();
  // Simulate reply after 1.5s
  setTimeout(function(){
    var replies = ['Got it! 👍','Thanks for reaching out!','I\'ll get back to you soon.','That sounds great! 🙌'];
    c.messages.push({ from:'them', text:replies[Math.floor(Math.random()*replies.length)], time:timeStr });
    c.preview = c.messages[c.messages.length-1].text;
    renderThread(c);
    renderConvoList();
  }, 1500);
}

function handleMsgAttachment(event) {
  var file = event.target.files[0];
  if (!file) return;
  toast('📎 ' + file.name + ' attached');
}

function msgAction(action) {
  if (!activeMsgId) { toast('Select a conversation first'); return; }
  var c = msgConversations.find(function(x){return x.id===activeMsgId;});
  if (action === 'mute') { toast('🔇 ' + (c?c.name:'Conversation') + ' muted'); }
  else if (action === 'block') { if(confirm('Block '+(c?c.name:'this user')+'? They will no longer be able to message you.')) { msgConversations = msgConversations.filter(function(x){return x.id!==activeMsgId;}); activeMsgId=null; renderConvoList(); document.getElementById('msg-active-name').textContent='Select a conversation'; document.getElementById('msg-thread-empty').style.display='flex'; toast('User blocked'); } }
  else if (action === 'delete') { if(confirm('Delete this conversation? This cannot be undone.')) { msgConversations = msgConversations.filter(function(x){return x.id!==activeMsgId;}); activeMsgId=null; renderConvoList(); document.getElementById('msg-active-name').textContent='Select a conversation'; document.getElementById('msg-thread-empty').style.display='flex'; toast('Conversation deleted'); } }
}

var _prevScreenBeforeSwitch = 'dashboard';
var _currentScreen = 'dashboard';

// Init messages screen on nav
var _origNav = nav;
nav = function(el, screen) {
  // Track where we came from before switching to public profile
  if (screen === 'switchprofile') {
    _prevScreenBeforeSwitch = _currentScreen || 'dashboard';
    // Check if public profile has been set up (independent of business/media profile)
    setTimeout(function() {
      var hasPublicProfile = window._publicProfileSetup === true;
      if (!hasPublicProfile) {
        showPublicProfileSetup();
      }
    }, 60);
  }
  _origNav(el, screen);
  if (screen === 'messages') { setTimeout(renderConvoList, 50); }
  if (screen === 'switchprofile') { setTimeout(function(){ spTab('posts', document.querySelector('.sp-tab')); renderSpFeed(); }, 50); }
};

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

function showPublicProfileSetup() {
  var existing = document.getElementById('public-profile-setup');
  if (existing) { existing.style.display = 'flex'; return; }

  var overlay = document.createElement('div');
  overlay.id = 'public-profile-setup';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(44,26,14,0.55);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);';

  overlay.innerHTML = [
    '<div style="background:#fff;border-radius:20px;padding:32px;width:100%;max-width:460px;box-shadow:0 20px 60px rgba(44,26,14,0.2);" onclick="event.stopPropagation()">',
      '<div style="text-align:center;margin-bottom:24px;">',
        '<div style="width:52px;height:52px;background:var(--brown-bg2);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">',
          '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--brown)" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
        '</div>',
        '<div style="font-family:\'DM Serif Display\',serif;font-size:1.35rem;color:var(--text);margin-bottom:5px;">Create Your Public Profile</div>',
        '<div style="font-size:0.82rem;color:var(--text-dim);line-height:1.5;">This is your personal public presence on MASSED — separate from your business dashboard.</div>',
      '</div>',

      '<div style="margin-bottom:13px;">',
        '<label style="display:block;font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;">Display Name</label>',
        '<input id="pp-name" type="text" placeholder="Your name" style="width:100%;padding:11px 14px;background:var(--cream);border:1.5px solid var(--border);border-radius:9px;font-family:\'DM Sans\',sans-serif;font-size:0.88rem;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor=\'var(--brown)\'" onblur="this.style.borderColor=\'var(--border)\'">',
      '</div>',

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:13px;">',
        '<div>',
          '<label style="display:block;font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;">Location</label>',
          '<input id="pp-location" type="text" placeholder="City, State" style="width:100%;padding:11px 14px;background:var(--cream);border:1.5px solid var(--border);border-radius:9px;font-family:\'DM Sans\',sans-serif;font-size:0.88rem;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor=\'var(--brown)\'" onblur="this.style.borderColor=\'var(--border)\'">',
        '</div>',
        '<div>',
          '<label style="display:block;font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;">Astrology Sign</label>',
          '<select id="pp-astro" style="width:100%;padding:11px 14px;background:var(--cream);border:1.5px solid var(--border);border-radius:9px;font-family:\'DM Sans\',sans-serif;font-size:0.88rem;outline:none;box-sizing:border-box;">',
            '<option value="">Select sign</option>',
            '<option>♈ Aries</option><option>♉ Taurus</option><option>♊ Gemini</option>',
            '<option>♋ Cancer</option><option>♌ Leo</option><option>♍ Virgo</option>',
            '<option>♎ Libra</option><option>♏ Scorpio</option><option>♐ Sagittarius</option>',
            '<option>♑ Capricorn</option><option>♒ Aquarius</option><option>♓ Pisces</option>',
          '</select>',
        '</div>',
      '</div>',

      '<div style="margin-bottom:20px;">',
        '<label style="display:block;font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;">Bio</label>',
        '<textarea id="pp-bio" placeholder="Tell people about yourself..." rows="3" style="width:100%;padding:11px 14px;background:var(--cream);border:1.5px solid var(--border);border-radius:9px;font-family:\'DM Sans\',sans-serif;font-size:0.88rem;outline:none;resize:none;box-sizing:border-box;" onfocus="this.style.borderColor=\'var(--brown)\'" onblur="this.style.borderColor=\'var(--border)\'"></textarea>',
      '</div>',

      '<div style="display:flex;gap:10px;">',
        '<button onclick="cancelPublicProfileSetup()" style="flex:1;padding:11px;background:var(--cream);color:var(--text-mid);border:1px solid var(--border);border-radius:9px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-weight:600;font-size:0.88rem;">Cancel</button>',
        '<button onclick="savePublicProfile()" style="flex:2;padding:11px;background:linear-gradient(135deg,var(--brown-light),var(--brown-dark));color:#fff;border:none;border-radius:9px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-weight:700;font-size:0.88rem;">Create Profile →</button>',
      '</div>',
    '</div>',
  ].join('');

  document.body.appendChild(overlay);
}

function cancelPublicProfileSetup() {
  var el = document.getElementById('public-profile-setup');
  if (el) el.style.display = 'none';
  // Go back to wherever they came from
  nav(null, _prevScreenBeforeSwitch || 'dashboard');
}

function savePublicProfile() {
  var name     = (document.getElementById('pp-name')     || {}).value || '';
  var location = (document.getElementById('pp-location') || {}).value || '';
  var astro    = (document.getElementById('pp-astro')    || {}).value || '';
  var bio      = (document.getElementById('pp-bio')      || {}).value || '';

  if (!name.trim()) {
    toast('Please enter your display name');
    return;
  }

  // Store public profile data — completely independent
  window._publicProfile = { name: name.trim(), location: location.trim(), astro: astro, bio: bio.trim() };
  window._publicProfileSetup = true;

  // Update the Switch Profile screen with real data
  var nameEl     = document.getElementById('sp-name');
  var titleEl    = document.getElementById('sp-title');
  var locationEl = document.getElementById('sp-location');
  var astroEl    = document.getElementById('sp-astro');
  var bioEl      = document.getElementById('sp-bio');
  var aboutLoc   = document.getElementById('sp-about-location');
  var aboutAstro = document.getElementById('sp-about-astro');
  var avatarEl   = document.getElementById('sp-avatar');

  if (nameEl) nameEl.textContent = name.trim();
  if (locationEl) locationEl.textContent = location.trim() || '—';
  if (astroEl) astroEl.textContent = astro || '—';
  if (bioEl) bioEl.textContent = bio.trim() || '';
  if (aboutLoc) aboutLoc.textContent = location.trim() || '—';
  if (aboutAstro) aboutAstro.textContent = astro ? astro.split(' ').slice(1).join(' ') : '—';
  if (avatarEl) avatarEl.textContent = name.trim().charAt(0).toUpperCase();

  // Hide setup overlay
  var el = document.getElementById('public-profile-setup');
  if (el) el.style.display = 'none';

  toast('✓ Public profile created!');
}

function switchBackToCreator() {
  nav(document.querySelector('.nav-item[onclick*="' + _prevScreenBeforeSwitch + '"]') || document.querySelector('.nav-item'), _prevScreenBeforeSwitch);
  toast('✓ Switched back to your business dashboard');
}

// ── SWITCH PROFILE ────────────────────────────────────────────────────────────
var spPosts = [
  { id:1, text:'💡 Tip: The best time to post Reels is between 6–9 AM and 7–10 PM. Consistency is more important than perfection. Show up daily and watch your engagement grow.', type:'text', time:'2 hours ago', sparks:247, comments:[{user:'@maya_j',text:'This is so helpful! Thank you 🙏'},{user:'@jones_r',text:'Been doing this for a week and already seeing results!'}], shared:34 },
  { id:2, text:'🌱 Knowledge drop: Astrological compatibility isn\'t just about sun signs — your Venus sign determines how you give and receive love. What\'s your Venus sign? Drop it below 👇', type:'text', time:'Yesterday', sparks:521, comments:[{user:'@sarah_k',text:'Venus in Scorpio here! 🦂'},{user:'@beauty.brand',text:'Venus in Libra! Makes so much sense now'}], shared:89 },
];
var spMediaPreviews = {};

function spTab(tab, btn) {
  ['posts','about','store','media','signals','vault','messages'].forEach(function(t){
    var el = document.getElementById('sp-tab-'+t);
    if (el) el.style.display = t===tab ? 'block' : 'none';
  });
  document.querySelectorAll('.sp-tab').forEach(function(b){
    b.style.color = 'rgba(255,255,255,0.45)';
    b.style.borderBottomColor = 'transparent';
    b.style.fontWeight = '600';
  });
  if (btn) { btn.style.color = '#D4956E'; btn.style.borderBottomColor = '#D4956E'; btn.style.fontWeight = '700'; }
  if (tab === 'posts') renderSpFeed();
  if (tab === 'signals') renderSignalsTab();
  if (tab === 'vault') renderVault();
  if (tab === 'messages') spMsgInit();
}

function renderSpFeed() {
  var feed = document.getElementById('sp-posts-feed');
  if (!feed) return;
  feed.innerHTML = spPosts.map(function(post) {
    return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:16px;" id="sp-post-'+post.id+'">'
      + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">'
        + '<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#D4956E,#8B5E3C);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:0.85rem;flex-shrink:0;">L</div>'
        + '<div><div style="font-weight:700;font-size:0.88rem;">Luk Like</div><div style="font-size:0.72rem;color:var(--text-dim);">'+post.time+'</div></div>'
      + '</div>'
      + '<div style="font-size:0.88rem;color:var(--text);line-height:1.65;margin-bottom:14px;">'+esc(post.text)+'</div>'
      + (spMediaPreviews[post.id] ? '<div style="margin-bottom:14px;">'+spMediaPreviews[post.id]+'</div>' : '')
      + '<div style="display:flex;align-items:center;gap:16px;padding-top:12px;border-top:1px solid var(--border);">'
        + '<button onclick="spLightIt('+post.id+',this)" data-lit="false" style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;color:var(--text-mid);font-weight:600;padding:6px 10px;border-radius:8px;transition:all 0.15s;" onmouseover="this.style.background=\'var(--cream)\'" onmouseout="this.style.background=\'none\'">'
          + '<svg class="bulb-icon-'+post.id+'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 01-1 1H9a1 1 0 01-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/></svg>'
          + '<span class="spark-count-'+post.id+'">'+post.sparks+'</span> Light it'
        + '</button>'
        + '<button onclick="spToggleComments('+post.id+')" style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;color:var(--text-mid);font-weight:600;padding:6px 10px;border-radius:8px;transition:all 0.15s;" onmouseover="this.style.background=\'var(--cream)\'" onmouseout="this.style.background=\'none\'">'
          + '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>'
          + post.comments.length + ' Comments'
        + '</button>'
        + '<button onclick="spSharePost('+post.id+')" style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;color:var(--text-mid);font-weight:600;padding:6px 10px;border-radius:8px;transition:all 0.15s;" onmouseover="this.style.background=\'var(--cream)\'" onmouseout="this.style.background=\'none\'">'
          + '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
          + post.shared + ' Shared'
        + '</button>'
        + '<button onclick="spAddToVault('+post.id+')" style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;color:var(--text-mid);font-weight:600;padding:6px 10px;border-radius:8px;transition:all 0.15s;margin-left:auto;" onmouseover="this.style.background=\'var(--cream)\'" onmouseout="this.style.background=\'none\'">'
          + '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>'
          + 'Add to Vault'
        + '</button>'
      + '</div>'
      + '<div id="sp-comments-'+post.id+'" style="display:none;margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">'
        + post.comments.map(function(c){ return '<div style="display:flex;gap:8px;margin-bottom:10px;"><div style="width:28px;height:28px;border-radius:50%;background:var(--brown-bg2);display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:var(--brown);flex-shrink:0;">'+c.user.slice(1,3).toUpperCase()+'</div><div style="flex:1;background:var(--cream);border-radius:8px;padding:8px 12px;"><div style="font-size:0.75rem;font-weight:700;color:var(--brown);margin-bottom:2px;">'+c.user+'</div><div style="font-size:0.82rem;color:var(--text);">'+c.text+'</div></div></div>'; }).join('')
        + '<div style="display:flex;gap:8px;margin-top:8px;">'
          + '<input id="sp-comment-input-'+post.id+'" type="text" placeholder="Add a comment..." style="flex:1;padding:8px 12px;background:var(--cream);border:1px solid var(--border);border-radius:8px;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;outline:none;" onkeydown="if(event.key===\'Enter\')spAddComment('+post.id+')">'
          + '<button onclick="spAddComment('+post.id+')" style="padding:8px 14px;background:var(--brown);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:700;">Post</button>'
        + '</div>'
      + '</div>'
    + '</div>';
  }).join('') || '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:40px;text-align:center;color:var(--text-dim);">No Signals yet. Create your first Signal above!</div>';
}

function spLightIt(postId, btn) {
  var post = spPosts.find(function(p){return p.id===postId;});
  if (!post) return;
  var lit = btn.getAttribute('data-lit') === 'true';
  var bulb = btn.querySelector('.bulb-icon-'+postId);

  if (lit) {
    // Un-light: go back to outlined, neutral color
    post.sparks--;
    btn.setAttribute('data-lit','false');
    btn.style.color = 'var(--text-mid)';
    btn.style.background = 'none';
    if (bulb) {
      bulb.setAttribute('fill','none');
      bulb.setAttribute('stroke','currentColor');
      bulb.style.filter = '';
      bulb.style.color = '';
    }
  } else {
    // Light it: fully filled yellow bulb with glow
    post.sparks++;
    btn.setAttribute('data-lit','true');
    btn.style.color = '#f59e0b';
    if (bulb) {
      bulb.setAttribute('fill','#fbbf24');
      bulb.setAttribute('stroke','#f59e0b');
      bulb.style.filter = 'drop-shadow(0 0 6px rgba(251,191,36,0.8))';
    }
    toast('💡 You lit this post!');
  }

  var countEl = document.querySelector('.spark-count-'+postId);
  if (countEl) countEl.textContent = post.sparks;
  // Update profile header sparks total
  var sparksEl = document.getElementById('sp-sparks');
  if (sparksEl) {
    var totalSparks = spPosts.reduce(function(s,p){return s+p.sparks;},0);
    sparksEl.textContent = totalSparks.toLocaleString() + ' Sparks';
  }
}

function spToggleComments(postId) {
  var el = document.getElementById('sp-comments-'+postId);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function spAddComment(postId) {
  var input = document.getElementById('sp-comment-input-'+postId);
  if (!input || !input.value.trim()) return;
  var post = spPosts.find(function(p){return p.id===postId;});
  if (!post) return;
  post.comments.push({ user:'@you', text:input.value.trim() });
  input.value = '';
  renderSpFeed();
  setTimeout(function(){ spToggleComments(postId); }, 50);
}

function spSharePost(postId) {
  var post = spPosts.find(function(p){return p.id===postId;});
  if (post) { post.shared++; toast('🔗 Signal link copied!'); renderSpFeed(); }
}

// ── VAULT ──
var vaultItems = [];
var vaultCurrentTab = 'all';

function vaultTab(cat, btn) {
  vaultCurrentTab = cat;
  document.querySelectorAll('.vault-tab-btn').forEach(function(b) {
    b.style.background = 'var(--cream)';
    b.style.borderColor = 'var(--border)';
    b.style.color = 'var(--text-mid)';
    b.style.fontWeight = '600';
  });
  if (btn) {
    btn.style.background = 'var(--brown)';
    btn.style.borderColor = 'var(--brown)';
    btn.style.color = '#fff';
    btn.style.fontWeight = '700';
  }
  renderVault();
}

function vaultSave() {
  var title = document.getElementById('vault-title-input');
  var notes = document.getElementById('vault-notes-input');
  var cat = document.getElementById('vault-cat-select');
  if (!title || !title.value.trim()) { toast('Please enter a title to save'); return; }
  var catIcons = { all:'📁', services:'🛠️', products:'📦', listings:'📋', people:'👤', opportunities:'⚡' };
  vaultItems.unshift({ id: Date.now(), title: title.value.trim(), notes: (notes ? notes.value.trim() : ''), category: (cat ? cat.value : 'all'), time: 'Just now' });
  title.value = ''; if (notes) notes.value = '';
  renderVault();
  renderSignalsTab();
  toast('🔒 Saved to Vault!');
}

function vaultDelete(id) {
  vaultItems = vaultItems.filter(function(v){return v.id !== id;});
  renderVault();
}

function renderVault() {
  var container = document.getElementById('vault-entries');
  if (!container) return;
  var catIcons = { all:'📁', services:'🛠️', products:'📦', listings:'📋', people:'👤', opportunities:'⚡' };
  var catLabels = { all:'All', services:'Services', products:'Products', listings:'Listings', people:'People', opportunities:'Opportunities' };
  var filtered = vaultCurrentTab === 'all' ? vaultItems : vaultItems.filter(function(v){ return v.category === vaultCurrentTab; });
  if (!filtered.length) {
    container.innerHTML = '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:40px;text-align:center;color:var(--text-dim);">'
      + '<div style="font-size:2rem;margin-bottom:10px;">🔒</div>'
      + '<div style="font-weight:700;font-size:0.92rem;margin-bottom:6px;">Your vault is empty</div>'
      + '<div style="font-size:0.82rem;">Save information using the form above or click "Add to Vault" on any Signal.</div></div>';
    return;
  }
  container.innerHTML = filtered.map(function(v) {
    return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px 18px;display:flex;align-items:flex-start;gap:14px;">'
      + '<div style="width:40px;height:40px;border-radius:10px;background:var(--brown-bg2);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">'+(catIcons[v.category]||'📁')+'</div>'
      + '<div style="flex:1;min-width:0;">'
        + '<div style="font-weight:700;font-size:0.9rem;color:var(--text);">'+v.title+'</div>'
        + (v.notes ? '<div style="font-size:0.8rem;color:var(--text-mid);margin-top:3px;line-height:1.5;">'+v.notes+'</div>' : '')
        + '<div style="display:flex;align-items:center;gap:8px;margin-top:6px;">'
          + '<span style="font-size:0.68rem;font-weight:700;background:var(--brown-bg);color:var(--brown);padding:2px 8px;border-radius:20px;">'+(catLabels[v.category]||'All')+'</span>'
          + '<span style="font-size:0.7rem;color:var(--text-dim);">'+v.time+'</span>'
        + '</div>'
      + '</div>'
      + '<button onclick="vaultDelete('+v.id+')" style="background:none;border:none;cursor:pointer;padding:4px;color:var(--text-dim);flex-shrink:0;" title="Remove">'
        + '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>'
      + '</button>'
    + '</div>';
  }).join('');
}

function spAddToVault(postId) {
  var post = spPosts.find(function(p){return p.id===postId;});
  if (!post) return;
  // Store pending post id and pre-fill title
  document.getElementById('vault-modal-post-id').value = postId;
  var title = post.text.length > 70 ? post.text.slice(0,70)+'…' : post.text;
  document.getElementById('vault-modal-title').value = title;
  document.getElementById('vault-modal-notes').value = '';
  // Reset category selection
  document.querySelectorAll('.vault-modal-cat').forEach(function(b){ b.classList.remove('selected'); b.style.background='var(--cream)'; b.style.borderColor='var(--border)'; b.style.color='var(--text-mid)'; });
  document.getElementById('vault-modal-selected-cat').value = 'all';
  openModal('modal-add-to-vault');
}

function vaultModalSelectCat(cat, btn) {
  document.getElementById('vault-modal-selected-cat').value = cat;
  document.querySelectorAll('.vault-modal-cat').forEach(function(b){ b.style.background='var(--cream)'; b.style.borderColor='var(--border)'; b.style.color='var(--text-mid)'; b.style.fontWeight='600'; });
  btn.style.background='var(--brown)'; btn.style.borderColor='var(--brown)'; btn.style.color='#fff'; btn.style.fontWeight='700';
}

function vaultModalSave() {
  var cat = document.getElementById('vault-modal-selected-cat').value || 'all';
  var title = document.getElementById('vault-modal-title').value.trim();
  var notes = document.getElementById('vault-modal-notes').value.trim();
  if (!title) { toast('Please enter a title'); return; }
  var catLabels = { all:'All', services:'Services', products:'Products', listings:'Listings', people:'People', opportunities:'Opportunities' };
  vaultItems.unshift({ id: Date.now(), title: title, notes: notes || 'Saved from Signal', category: cat, time: 'Just now' });
  closeModal('modal-add-to-vault');
  toast('🔒 Saved to ' + (catLabels[cat]||'Vault') + '!');
}

// ── SIGNALS ──
function renderSignalsTab() {
  var feed = document.getElementById('sptab-signals-feed');
  if (!feed) return;
  var countEl = document.getElementById('sptab-signals-count');
  var sharedEl = document.getElementById('sptab-shared-count');
  var sparksEl2 = document.getElementById('sptab-sparks-count');
  if (countEl) countEl.textContent = spPosts.length;
  if (sharedEl) sharedEl.textContent = spPosts.reduce(function(s,p){return s+p.shared;},0);
  if (sparksEl2) sparksEl2.textContent = spPosts.reduce(function(s,p){return s+p.sparks;},0);
  if (!spPosts.length) {
    feed.innerHTML = '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:40px;text-align:center;color:var(--text-dim);">No Signals yet. Post your first Signal from the Posts tab.</div>';
    return;
  }
  feed.innerHTML = spPosts.map(function(post) {
    return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px;">'
      + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">'
        + '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#D4956E,#8B5E3C);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:0.82rem;flex-shrink:0;">L</div>'
        + '<div style="flex:1;"><div style="font-weight:700;font-size:0.85rem;">Luk Like</div><div style="font-size:0.7rem;color:var(--text-dim);">'+post.time+'</div></div>'
        + '<span style="font-size:0.68rem;font-weight:700;background:var(--brown-bg);color:var(--brown);padding:2px 10px;border-radius:20px;">Shared</span>'
      + '</div>'
      + '<div style="font-size:0.88rem;color:var(--text);line-height:1.65;margin-bottom:12px;">'+esc(post.text)+'</div>'
      + '<div style="display:flex;align-items:center;gap:14px;padding-top:10px;border-top:1px solid var(--border);font-size:0.78rem;color:var(--text-dim);flex-wrap:wrap;">'
        + '<span>💡 '+post.sparks+' Sparks</span>'
        + '<span>💬 '+post.comments.length+' Comments</span>'
        + '<span>🔗 '+post.shared+' Shared</span>'
      + '</div>'
    + '</div>';
  }).join('');
}


function spPublishPost() {
  var textarea = document.getElementById('sp-post-text');
  if (!textarea || !textarea.value.trim()) { toast('Please write something to signal'); return; }
  var now = new Date();
  var newPost = { id:Date.now(), text:textarea.value.trim(), type:'text', time:'Just now', sparks:0, comments:[], shared:0 };
  spPosts.unshift(newPost);
  lsPersistPosts();
  textarea.value = '';
  spMediaAttachment = null;
  var prev = document.getElementById('sp-media-preview');
  if (prev) { prev.style.display = 'none'; prev.innerHTML = ''; }
  renderSpFeed();
  toast('✓ Signal posted!');
}

// ── PROFILE MESSAGES TAB ─────────────────────────────────────────────────────
var spMsgConversations = [
  { id:1, name:'Jordan Lee', handle:'@jordanlee', avatar:'JL', unread:2, type:'all', muted:false, blocked:false,
    messages:[
      {from:'them', text:'Hey! Love your content on MASSED 🔥', time:'2:14 PM'},
      {from:'them', text:'Would love to collab on something soon', time:'2:15 PM'},
      {from:'me', text:'Thank you so much! I\'d definitely be open to that 🙌', time:'2:20 PM'},
      {from:'them', text:'Amazing, let me know when you\'re free', time:'2:21 PM'},
      {from:'them', text:'Also just bought your digital product — it\'s 🔥🔥', time:'2:22 PM'}
    ]
  },
  { id:2, name:'Maya Stone', handle:'@mayastone', avatar:'MS', unread:0, type:'all', muted:false, blocked:false,
    messages:[
      {from:'me', text:'Hey Maya! Did you get a chance to look at the proposal?', time:'Yesterday'},
      {from:'them', text:'Yes! Everything looks great, sending you feedback today', time:'Yesterday'},
      {from:'me', text:'Perfect, looking forward to it!', time:'Yesterday'}
    ]
  },
  { id:3, name:'Chris Vibe', handle:'@chrisvibe', avatar:'CV', unread:1, type:'requests', muted:false, blocked:false,
    messages:[
      {from:'them', text:'Hi there! I found you through the MASSED explore page.', time:'Mon'},
      {from:'them', text:'I run a brand and would love to work together 🤝', time:'Mon'}
    ]
  },
  { id:4, name:'Aisha Bright', handle:'@aishabright', avatar:'AB', unread:0, type:'all', muted:false, blocked:false,
    messages:[
      {from:'them', text:'Your Sparks are going up so fast omg', time:'Sun'},
      {from:'me', text:'Haha thank you!! The community has been amazing 💛', time:'Sun'}
    ]
  }
];
var spMsgActiveId = null;
var spMsgCurrentFilter = 'all';
var spMsgSearchTerm = '';

function spMsgInit() {
  spMsgRenderList();
  spMsgOpenConvo(spMsgConversations[0].id);
}

function spMsgFilter(type, btn) {
  spMsgCurrentFilter = type;
  document.querySelectorAll('.sp-msg-filter').forEach(function(b){
    b.style.borderBottomColor = 'transparent';
    b.style.color = 'var(--text-dim)';
    b.style.fontWeight = '600';
  });
  if (btn) { btn.style.borderBottomColor = 'var(--brown)'; btn.style.color = 'var(--brown)'; btn.style.fontWeight = '700'; }
  // Clear thread when switching to blocked tab — no conversations to open there
  if (type === 'blocked') spMsgResetThread();
  spMsgRenderList();
}

function spMsgSearch(val) {
  spMsgSearchTerm = val.toLowerCase();
  spMsgRenderList();
}

function spMsgRenderList() {
  var list = document.getElementById('sp-msg-conversations');
  if (!list) return;

  // BLOCKED tab — show blocked users with unblock option
  if (spMsgCurrentFilter === 'blocked') {
    var blocked = spMsgConversations.filter(function(c){ return c.blocked; });
    if (!blocked.length) {
      list.innerHTML = '<div style="padding:28px 14px;text-align:center;color:var(--text-dim);font-size:0.82rem;line-height:1.6;">No blocked users.<br>Block someone from a conversation to see them here.</div>';
      return;
    }
    list.innerHTML = blocked.map(function(c) {
      return '<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--border);background:#fff;">'
        + '<div style="width:38px;height:38px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-weight:800;font-size:0.75rem;flex-shrink:0;">' + c.avatar + '</div>'
        + '<div style="flex:1;min-width:0;">'
          + '<div style="font-weight:700;font-size:0.85rem;color:var(--text);">' + esc(c.name) + '</div>'
          + '<div style="font-size:0.72rem;color:var(--text-dim);">' + esc(c.handle) + '</div>'
        + '</div>'
        + '<button onclick="spMsgUnblock('+c.id+')" style="padding:5px 12px;background:var(--cream);border:1.5px solid var(--border);border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.72rem;font-weight:700;color:var(--text-mid);white-space:nowrap;transition:all 0.15s;" onmouseover="this.style.borderColor=\'var(--brown)\';this.style.color=\'var(--brown)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--text-mid)\'">Unblock</button>'
      + '</div>';
    }).join('');
    return;
  }

  var filtered = spMsgConversations.filter(function(c) {
    if (c.blocked) return false;
    if (spMsgCurrentFilter === 'unread' && c.unread === 0) return false;
    if (spMsgCurrentFilter === 'requests' && c.type !== 'requests') return false;
    if (spMsgSearchTerm && c.name.toLowerCase().indexOf(spMsgSearchTerm) === -1) return false;
    return true;
  });
  if (!filtered.length) {
    list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-dim);font-size:0.82rem;">No conversations found</div>';
    return;
  }
  list.innerHTML = filtered.map(function(c) {
    var last = c.messages[c.messages.length - 1];
    var isActive = c.id === spMsgActiveId;
    var preview = last ? (last.from === 'me' ? 'You: ' : '') + last.text : '';
    if (preview.length > 38) preview = preview.slice(0,38) + '…';
    return '<div onclick="spMsgOpenConvo('+c.id+')" style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;border-bottom:1px solid var(--border);background:'+(isActive?'var(--brown-bg)':'#fff')+';transition:background 0.15s;" onmouseover="if('+(!isActive)+')this.style.background=\'var(--cream)\'" onmouseout="if('+(!isActive)+')this.style.background=\''+(isActive?'var(--brown-bg)':'#fff')+'\';">'
      + '<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--brown-light),var(--brown-dark));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:0.75rem;flex-shrink:0;">' + c.avatar + '</div>'
      + '<div style="flex:1;min-width:0;">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">'
          + '<div style="font-weight:'+(c.unread?'800':'600')+';font-size:0.85rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(c.name) + '</div>'
          + (c.unread ? '<span style="background:var(--brown);color:#fff;font-size:0.6rem;font-weight:800;padding:2px 6px;border-radius:20px;flex-shrink:0;">' + c.unread + '</span>' : '')
        + '</div>'
        + '<div style="font-size:0.75rem;color:var(--text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;">' + preview + '</div>'
      + '</div>'
    + '</div>';
  }).join('');
}

function spMsgOpenConvo(id) {
  spMsgActiveId = id;
  var convo = spMsgConversations.find(function(c){return c.id===id;});
  if (!convo) return;
  convo.unread = 0;

  // Update header
  var nameEl = document.getElementById('sp-msg-thread-name');
  var actionsEl = document.getElementById('sp-msg-thread-actions');
  if (nameEl) nameEl.innerHTML = '<div style="font-weight:700;font-size:0.9rem;">' + esc(convo.name) + '</div><div style="font-size:0.72rem;color:var(--text-dim);">' + esc(convo.handle) + '</div>';
  if (actionsEl) actionsEl.style.display = 'flex';

  // Enable compose
  var input = document.getElementById('sp-msg-input');
  if (input) {
    input.placeholder = 'Reply to ' + convo.name + '…';
    input.disabled = false;
    input.style.background = '#fff';
  }

  // Render thread
  var thread = document.getElementById('sp-msg-thread');
  if (thread) {
    thread.innerHTML = convo.messages.map(function(m) {
      var isMe = m.from === 'me';
      return '<div style="display:flex;justify-content:'+(isMe?'flex-end':'flex-start')+';margin-bottom:2px;">'
        + '<div style="max-width:72%;padding:9px 13px;border-radius:'+(isMe?'14px 14px 4px 14px':'14px 14px 14px 4px')+';background:'+(isMe?'linear-gradient(135deg,var(--brown-light),var(--brown-dark))':'#fff')+';color:'+(isMe?'#fff':'var(--text)')+';font-size:0.85rem;line-height:1.5;box-shadow:0 1px 4px rgba(0,0,0,0.08);">'
          + esc(m.text)
          + '<div style="font-size:0.62rem;opacity:0.65;margin-top:4px;text-align:'+(isMe?'right':'left')+';"> ' + esc(m.time) + '</div>'
        + '</div></div>';
    }).join('');
    setTimeout(function(){ thread.scrollTop = thread.scrollHeight; }, 50);
  }

  spMsgRenderList();
}

function spMsgResetThread() {
  spMsgActiveId = null;
  var thread = document.getElementById('sp-msg-thread');
  var nameEl = document.getElementById('sp-msg-thread-name');
  var actionsEl = document.getElementById('sp-msg-thread-actions');
  var input = document.getElementById('sp-msg-input');
  if (thread) thread.innerHTML = '<div style="text-align:center;color:var(--text-dim);font-size:0.82rem;margin-top:40px;">Select a conversation to start messaging</div>';
  if (nameEl) nameEl.textContent = 'Select a conversation';
  if (actionsEl) actionsEl.style.display = 'none';
  if (input) { input.placeholder = 'Select a conversation to reply…'; input.disabled = false; input.style.background = 'var(--cream)'; }
  spMsgRenderList();
}

function spMsgUnblock(id) {
  var convo = spMsgConversations.find(function(c){return c.id===id;});
  if (!convo) return;
  convo.blocked = false;
  spMsgRenderList();
  toast('✓ ' + convo.name + ' has been unblocked');
}

// ── BANNED / BLOCKED SCREEN ──────────────────────────────────────────────────
var bbCurrentTab = 'banned';

// Banned clients pulled from booking data (people banned via Manage Booking → Ban)
var bbBannedClients = [
  { id:1, name:'Tyler James', email:'tyler@email.com', reason:'No-show x3', date:'Mar 12, 2026', type:'booking' },
  { id:2, name:'Keisha Brown', email:'keisha@email.com', reason:'Repeated cancellations', date:'Feb 28, 2026', type:'booking' }
];

// Blocked users pulled from messages (people blocked via Messages → Block)
var bbBlockedUsers = [];

function bbTab(tab, btn) {
  bbCurrentTab = tab;
  document.querySelectorAll('#bb-tab-banned,#bb-tab-blocked').forEach(function(b){
    b.style.borderBottomColor = 'transparent';
    b.style.color = 'var(--text-dim)';
    b.style.fontWeight = '600';
  });
  btn.style.borderBottomColor = 'var(--brown)';
  btn.style.color = 'var(--brown)';
  btn.style.fontWeight = '700';
  document.getElementById('bb-banned-list').style.display = tab === 'banned' ? 'block' : 'none';
  document.getElementById('bb-blocked-list').style.display = tab === 'blocked' ? 'block' : 'none';
}

function renderBannedBlocked() {
  // Sync blocked users from messages
  bbBlockedUsers = spMsgConversations.filter(function(c){ return c.blocked; }).map(function(c){
    return { id: c.id, name: c.name, handle: c.handle, avatar: c.avatar, source: 'Messages' };
  });
  renderBannedList();
  renderBlockedList();
}

function renderBannedList() {
  var el = document.getElementById('bb-banned-list');
  if (!el) return;
  if (!bbBannedClients.length) {
    el.innerHTML = '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:48px;text-align:center;"><div style="font-size:2rem;margin-bottom:10px;">⛔</div><div style="font-weight:700;font-size:0.95rem;margin-bottom:6px;">No banned clients</div><div style="font-size:0.82rem;color:var(--text-dim);">Clients banned from booking will appear here.</div></div>';
    return;
  }
  el.innerHTML = '<div style="display:flex;flex-direction:column;gap:12px;">'
    + bbBannedClients.map(function(b) {
      return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px 18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">'
        + '<div style="width:44px;height:44px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;color:#dc2626;flex-shrink:0;">' + b.name.split(' ').map(function(n){return n[0];}).join('') + '</div>'
        + '<div style="flex:1;min-width:0;">'
          + '<div style="font-weight:700;font-size:0.9rem;color:var(--text);">' + b.name + '</div>'
          + '<div style="font-size:0.75rem;color:var(--text-dim);">' + b.email + '</div>'
          + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:5px;">'
            + '<span style="font-size:0.68rem;background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:6px;font-weight:700;">⛔ Banned from Booking</span>'
            + (b.reason ? '<span style="font-size:0.68rem;background:var(--cream);color:var(--text-mid);padding:2px 8px;border-radius:6px;">Reason: ' + b.reason + '</span>' : '')
            + '<span style="font-size:0.68rem;color:var(--text-dim);">Since ' + b.date + '</span>'
          + '</div>'
        + '</div>'
        + '<button onclick="bbUnban(' + b.id + ')" style="padding:7px 16px;background:var(--cream);border:1.5px solid var(--border);border-radius:9px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;font-weight:700;color:var(--text-mid);white-space:nowrap;transition:all 0.15s;flex-shrink:0;" onmouseover="this.style.borderColor=\'var(--brown)\';this.style.color=\'var(--brown)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--text-mid)\'">Unban</button>'
      + '</div>';
    }).join('')
  + '</div>';
}

function renderBlockedList() {
  var el = document.getElementById('bb-blocked-list');
  if (!el) return;
  if (!bbBlockedUsers.length) {
    el.innerHTML = '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:48px;text-align:center;"><div style="font-size:2rem;margin-bottom:10px;">🚫</div><div style="font-weight:700;font-size:0.95rem;margin-bottom:6px;">No blocked users</div><div style="font-size:0.82rem;color:var(--text-dim);">Users you block from Messages will appear here.</div></div>';
    return;
  }
  el.innerHTML = '<div style="display:flex;flex-direction:column;gap:12px;">'
    + bbBlockedUsers.map(function(u) {
      return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px 18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">'
        + '<div style="width:44px;height:44px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;color:#9ca3af;flex-shrink:0;">' + u.avatar + '</div>'
        + '<div style="flex:1;min-width:0;">'
          + '<div style="font-weight:700;font-size:0.9rem;color:var(--text);">' + u.name + '</div>'
          + '<div style="font-size:0.75rem;color:var(--text-dim);">' + u.handle + '</div>'
          + '<div style="margin-top:5px;"><span style="font-size:0.68rem;background:#f3f4f6;color:#6b7280;padding:2px 8px;border-radius:6px;font-weight:700;">🚫 Blocked via ' + u.source + '</span></div>'
        + '</div>'
        + '<button onclick="bbUnblock(' + u.id + ')" style="padding:7px 16px;background:var(--cream);border:1.5px solid var(--border);border-radius:9px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;font-weight:700;color:var(--text-mid);white-space:nowrap;transition:all 0.15s;flex-shrink:0;" onmouseover="this.style.borderColor=\'var(--brown)\';this.style.color=\'var(--brown)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--text-mid)\'">Unblock</button>'
      + '</div>';
    }).join('')
  + '</div>';
}

function bbUnban(id) {
  var person = bbBannedClients.find(function(b){return b.id===id;});
  if (!person) return;
  if (confirm('Unban ' + person.name + '? They will be able to book your services again.')) {
    bbBannedClients = bbBannedClients.filter(function(b){return b.id !== id;});
    renderBannedList();
    toast('✓ ' + person.name + ' has been unbanned');
  }
}

function bbUnblock(id) {
  // Unblock from both the business screen and the profile messages
  var convo = spMsgConversations.find(function(c){return c.id===id;});
  if (convo) convo.blocked = false;
  renderBannedBlocked();
  toast('✓ User has been unblocked');
}

// ── GATEWAY ROOM ─────────────────────────────────────────────────────────────
var gwRole = null;
var gwActivePresenterId = 0;

// Context detection:
// - 'public'    → user is in Switch Profile / public view
// - 'business'  → user is in business dashboard (not graduated)
// - 'graduated' → user is in business dashboard AND is a graduated presenter
var GW_IS_GRADUATED = true; // Simulated: this user is a graduated MASSED user

function gwDetectContext() {
  // If the previous screen was switchprofile, they arrived from public view
  // But Gateway Room is a sidebar item only reachable from the business dashboard.
  // We simulate: if _prevScreenBeforeSwitch === 'switchprofile' context = public,
  // otherwise context = business (or graduated).
  // In production this would read the actual user account flags.
  var fromPublic = (typeof _currentScreen !== 'undefined' && _currentScreen === 'switchprofile');
  if (fromPublic) return 'public';
  if (GW_IS_GRADUATED) return 'graduated';
  return 'business';
}

function gwInit() {
  var ctx = gwDetectContext();
  gwRenderLanding(ctx);
}

function gwRenderLanding(ctx) {
  var picker = document.getElementById('gw-role-picker');
  var subtitle = document.getElementById('gw-landing-sub');
  if (!picker) return;

  picker.innerHTML = '';

  if (ctx === 'public') {
    // Public view — only Public Viewer, auto-enter immediately with a note
    if (subtitle) subtitle.textContent = 'You\'re viewing as a public visitor. Enter as a Public Viewer.';
    picker.innerHTML = gwRoleCard('public','👁','Public Viewer','Watch & signal interest','rgba(255,255,255,0.15)','#fff');
    // Auto-enter after a short delay so they see the landing
    setTimeout(function(){ gwEnter('public'); }, 900);

  } else if (ctx === 'business') {
    // Business profile, not graduated — Business Attendee only
    if (subtitle) subtitle.textContent = 'You\'re attending as a registered business.';
    picker.innerHTML = gwRoleCard('business','🏢','Business Attendee','Signal, commit & request distribution','rgba(192,122,80,0.2)','#D4956E');

  } else if (ctx === 'graduated') {
    // Graduated — Business Attendee + Presenter (two options)
    if (subtitle) subtitle.textContent = 'You have presenter access. Choose how you\'d like to enter.';
    picker.innerHTML =
      gwRoleCard('business','🏢','Enter as Attendee','Signal interest & request distribution','rgba(255,255,255,0.06)','#fff') +
      gwRoleCard('presenter','🎤','Enter as Presenter','Graduated access — go live & view your dashboard','rgba(192,122,80,0.15)','#D4956E');
  }

  // Render lineup
  var lineup = document.getElementById('gw-lineup');
  if (lineup) {
    lineup.innerHTML = gwPresenters.map(function(p) {
      var isLive = p.id === 1;
      return '<div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px;">'
        + '<div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--brown-light),var(--brown-dark));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:0.8rem;flex-shrink:0;">'+p.initials+'</div>'
        + '<div style="flex:1;min-width:0;">'
          + '<div style="font-weight:700;font-size:0.88rem;color:var(--text);">'+p.name+'</div>'
          + '<div style="font-size:0.75rem;color:var(--text-dim);">'+p.title+'</div>'
        + '</div>'
        + '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">'
          + (isLive ? '<span style="width:7px;height:7px;background:#ef4444;border-radius:50%;animation:pulse 1.5s infinite;display:inline-block;"></span>' : '')
          + '<span style="font-size:0.72rem;font-weight:700;color:'+(isLive?'#ef4444':'var(--text-dim)')+';">'+p.time+'</span>'
        + '</div>'
      + '</div>';
    }).join('');
  }
}

function gwRoleCard(role, icon, label, sub, bg, color) {
  return '<button onclick="gwEnter(\''+role+'\')" style="padding:20px 14px;background:'+bg+';border:1.5px solid '+(role==='presenter'?'rgba(192,122,80,0.5)':'rgba(255,255,255,0.15)')+';border-radius:14px;cursor:pointer;text-align:center;transition:all 0.2s;font-family:\'DM Sans\',sans-serif;width:100%;" '
    +'onmouseover="this.style.background=\'rgba(192,122,80,0.22)\';this.style.borderColor=\'rgba(192,122,80,0.6)\'" '
    +'onmouseout="this.style.background=\''+bg+'\';this.style.borderColor=\''+(role==='presenter'?'rgba(192,122,80,0.5)':'rgba(255,255,255,0.15)')+'\';">'
    +'<div style="font-size:1.7rem;margin-bottom:8px;">'+icon+'</div>'
    +'<div style="font-weight:700;color:'+color+';font-size:0.92rem;">'+label+'</div>'
    +'<div style="font-size:0.72rem;color:rgba(255,255,255,0.45);margin-top:4px;">'+sub+'</div>'
  +'</button>';
}

var gwPresenters = [
  { id:1, name:'Aaliyah Morris', initials:'AM', title:'Founder, NaturalGlow Skincare', category:'Beauty', pitch:'A clean, vegan skincare line built for melanin-rich skin tones. 3 hero products, zero harsh chemicals, already retailing in 4 boutiques.', signals:14, ins:6, shelf:3, time:'On now', feedback:[], signals_list:[], ins_list:[], shelf_list:[] },
  { id:2, name:'Devon Chase', initials:'DC', title:'CEO, ShiftLogic AI', category:'Tech', pitch:'An AI workflow tool that cuts admin time by 60% for solopreneurs. No code required. Monthly subscription model with a free tier.', signals:9, ins:4, shelf:2, time:'Up next', feedback:[], signals_list:[], ins_list:[], shelf_list:[] },
  { id:3, name:'Priya Nair', initials:'PN', title:'Creator, The Meal Shift', category:'Food & Wellness', pitch:'Weekly meal prep kits designed for busy professionals who want to eat whole foods without the planning. Launching in Q3.', signals:7, ins:2, shelf:1, time:'In 20 min', feedback:[], signals_list:[], ins_list:[], shelf_list:[] }
];

// Presenter dashboard data (for the logged-in presenter)
var gwMyDash = { signals:[], ready:[], shelf:[], feedback:[] };
var gwCurrentDashTab = 'signals';

function gwEnter(role) {
  gwRole = role;
  document.getElementById('gw-landing').style.display = 'none';
  if (role === 'presenter') {
    document.getElementById('gw-presenter-view').style.display = 'block';
    gwRenderDash();
    return;
  }
  document.getElementById('gw-attendee-view').style.display = 'block';
  // Show shelf button only for business
  var shelfBtn = document.getElementById('gw-btn-shelf');
  if (shelfBtn) shelfBtn.style.display = role === 'business' ? 'block' : 'none';
  // Adjust grid columns
  var grid = document.getElementById('gw-action-grid');
  if (grid) grid.style.gridTemplateColumns = role === 'business' ? '1fr 1fr' : '1fr 1fr';
  gwLoadPresenter(gwPresenters[0].id);
  gwRenderTabs();
  gwSimulateLiveFeed();
}

function gwLeave() {
  gwRole = null;
  if (gwFeedTimer) { clearInterval(gwFeedTimer); gwFeedTimer = null; }
  document.getElementById('gw-landing').style.display = 'block';
  document.getElementById('gw-attendee-view').style.display = 'none';
  document.getElementById('gw-presenter-view').style.display = 'none';
  ['gw-btn-signal','gw-btn-in','gw-btn-shelf'].forEach(function(id){
    var b = document.getElementById(id);
    if (b) { b.classList.remove('gw-active'); b.style.borderColor = 'var(--border)'; b.style.background = '#fff'; }
  });
  var conf = document.getElementById('gw-action-confirm');
  if (conf) conf.style.display = 'none';
  // Re-render context-aware picker
  gwRenderLanding(gwDetectContext());
}

function gwLoadPresenter(id) {
  gwActivePresenterId = id;
  var p = gwPresenters.find(function(x){return x.id===id;});
  if (!p) return;
  document.getElementById('gw-pres-avatar').textContent = p.initials;
  document.getElementById('gw-pres-name').textContent = p.name;
  document.getElementById('gw-pres-title').textContent = p.title;
  document.getElementById('gw-pres-cat').textContent = p.category;
  document.getElementById('gw-pres-pitch').textContent = p.pitch;
  document.getElementById('gw-timer').textContent = p.time;
  document.getElementById('gw-signal-count').textContent = p.signals;
  document.getElementById('gw-in-count').textContent = p.ins;
  // Reset action button states
  ['gw-btn-signal','gw-btn-in','gw-btn-shelf'].forEach(function(btnId){
    var b = document.getElementById(btnId);
    if (b) { b.classList.remove('gw-active'); b.style.borderColor='var(--border)'; b.style.background='#fff'; b.style.opacity='1'; }
  });
  document.getElementById('gw-action-confirm').style.display = 'none';
  gwRenderTabs();
}

function gwRenderTabs() {
  var bar = document.getElementById('gw-pres-tabs');
  if (!bar) return;
  bar.innerHTML = gwPresenters.map(function(p) {
    var isActive = p.id === gwActivePresenterId;
    return '<button onclick="gwLoadPresenter('+p.id+')" style="padding:10px 16px;background:none;border:none;border-bottom:2px solid '+(isActive?'#D4956E':'transparent')+';color:'+(isActive?'#D4956E':'rgba(255,255,255,0.4)')+';font-family:\'DM Sans\',sans-serif;font-size:0.78rem;font-weight:'+(isActive?'700':'500')+';cursor:pointer;white-space:nowrap;transition:all 0.15s;">'+p.name+'</button>';
  }).join('');
}

function gwAction(type) {
  var p = gwPresenters.find(function(x){return x.id===gwActivePresenterId;});
  if (!p) return;
  var now = new Date();
  var ts = now.getHours()+':'+String(now.getMinutes()).padStart(2,'0')+' '+(now.getHours()>=12?'PM':'AM');
  var entry = { role: gwRole, time: ts };

  if (type === 'signal') {
    var btn = document.getElementById('gw-btn-signal');
    if (btn.classList.contains('gw-active')) return;
    btn.classList.add('gw-active');
    btn.style.borderColor = 'var(--brown)';
    btn.style.background = 'var(--brown-bg)';
    p.signals++;
    document.getElementById('gw-signal-count').textContent = p.signals;
    gwShowConfirm('📡 Signal sent to '+p.name+'! They\'ll follow up with you.');
    gwAddLiveFeedItem('📡', (gwRole==='business'?'A business':'Someone')+' signalled interest in '+p.name);
    gwMyDash.signals.push({ name: p.name, time: ts, role: gwRole });
  } else if (type === 'in') {
    var btn = document.getElementById('gw-btn-in');
    if (btn.classList.contains('gw-active')) return;
    btn.classList.add('gw-active');
    btn.style.borderColor = '#22c55e';
    btn.style.background = '#f0fdf4';
    p.ins++;
    document.getElementById('gw-in-count').textContent = p.ins;
    gwShowConfirm('✅ You\'re In! '+p.name+' has been notified of your commitment.');
    gwAddLiveFeedItem('✅', (gwRole==='business'?'A business':'Someone')+' committed to '+p.name);
    gwMyDash.ready.push({ name: p.name, time: ts, role: gwRole });
  } else if (type === 'shelf') {
    var btn = document.getElementById('gw-btn-shelf');
    if (btn.classList.contains('gw-active')) return;
    btn.classList.add('gw-active');
    btn.style.borderColor = '#7c3aed';
    btn.style.background = '#faf5ff';
    p.shelf++;
    gwShowConfirm('📦 Added to your shelf! Distribution request sent to '+p.name+'.');
    gwAddLiveFeedItem('📦', 'A business added '+p.name+' to their shelf');
    gwMyDash.shelf.push({ name: p.name, time: ts, role: 'business' });
  }
  gwRenderDash();
}

function gwShowConfirm(msg) {
  var el = document.getElementById('gw-action-confirm');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(function(){ el.style.display = 'none'; }, 4000);
}

function gwAddLiveFeedItem(icon, text) {
  var feed = document.getElementById('gw-live-feed');
  if (!feed) return;
  var div = document.createElement('div');
  div.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff;border:1px solid var(--border);border-radius:9px;font-size:0.78rem;color:var(--text-mid);animation:fadeInUp 0.3s ease;';
  div.innerHTML = '<span style="flex-shrink:0;">'+icon+'</span><span>'+text+'</span>';
  feed.insertBefore(div, feed.firstChild);
  if (feed.children.length > 12) feed.removeChild(feed.lastChild);
}

var gwFeedTimer = null;
function gwSimulateLiveFeed() {
  var items = [
    ['📡','Someone signalled interest in Aaliyah Morris'],
    ['✅','A viewer committed — I\'m In'],
    ['📡','A business signalled Devon Chase'],
    ['💬','Feedback submitted for Aaliyah Morris'],
    ['📦','A business added Priya Nair to their shelf'],
    ['✅','New commitment — I\'m In for Devon Chase'],
    ['📡','3 new signals in the last minute'],
  ];
  var i = 0;
  gwFeedTimer = setInterval(function(){
    if (!document.getElementById('gw-live-feed')) { clearInterval(gwFeedTimer); return; }
    var item = items[i % items.length];
    gwAddLiveFeedItem(item[0], item[1]);
    i++;
  }, 4500);
}

// ── FEEDBACK PANEL ────────────────────────────────────────────────────────────
function gwOpenFeedback() {
  var p = gwPresenters.find(function(x){return x.id===gwActivePresenterId;});
  var forEl = document.getElementById('gw-feedback-for');
  if (forEl && p) forEl.textContent = 'For: '+p.name+' — '+p.title;
  // Reset tags
  document.querySelectorAll('.gw-tag').forEach(function(t){
    t.style.background='var(--cream)'; t.style.borderColor='var(--border)'; t.style.color='var(--text-mid)'; t.classList.remove('selected');
  });
  var msgEl = document.getElementById('gw-feedback-msg');
  if (msgEl) msgEl.value = '';
  var overlay = document.getElementById('gw-feedback-overlay');
  var panel = document.getElementById('gw-feedback-panel');
  if (overlay) { overlay.style.display = 'block'; }
  if (panel) { panel.style.transform = 'translateY(100%)'; panel.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)'; setTimeout(function(){ panel.style.transform = 'translateY(0)'; },10); }
}

function gwCloseFeedback() {
  var overlay = document.getElementById('gw-feedback-overlay');
  var panel = document.getElementById('gw-feedback-panel');
  if (panel) { panel.style.transform = 'translateY(100%)'; setTimeout(function(){ if(overlay) overlay.style.display='none'; },320); }
}

function gwToggleTag(btn) {
  var selected = btn.classList.contains('selected');
  if (selected) {
    btn.classList.remove('selected'); btn.style.background='var(--cream)'; btn.style.borderColor='var(--border)'; btn.style.color='var(--text-mid)';
  } else {
    btn.classList.add('selected'); btn.style.background='var(--brown)'; btn.style.borderColor='var(--brown)'; btn.style.color='#fff';
  }
}

function gwSubmitFeedback() {
  var p = gwPresenters.find(function(x){return x.id===gwActivePresenterId;});
  if (!p) return;
  var tags = [];
  document.querySelectorAll('.gw-tag.selected').forEach(function(t){ tags.push(t.getAttribute('data-tag')); });
  var msg = (document.getElementById('gw-feedback-msg')||{}).value||'';
  if (!tags.length && !msg.trim()) { toast('Please select at least one tag or write a message'); return; }
  var now = new Date();
  var ts = now.getHours()+':'+String(now.getMinutes()).padStart(2,'0')+' '+(now.getHours()>=12?'PM':'AM');
  var entry = { tags: tags, msg: msg.trim(), time: ts, role: gwRole };
  p.feedback.push(entry);
  gwMyDash.feedback.push({ presenter: p.name, tags: tags, msg: msg.trim(), time: ts });
  gwCloseFeedback();
  gwAddLiveFeedItem('💬','Feedback submitted for '+p.name);
  toast('💬 Feedback sent — thank you!');
  gwRenderDash();
}

// ── PRESENTER DASHBOARD ───────────────────────────────────────────────────────

function gwDashTab(tab, btn) {
  gwCurrentDashTab = tab;
  ['signals','ready','shelf','feedback'].forEach(function(t){
    var panel = document.getElementById('gw-dash-'+t);
    var tabBtn = document.getElementById('gw-dtab-'+t);
    if (panel) panel.style.display = t===tab ? 'block' : 'none';
    if (tabBtn) { tabBtn.style.borderBottomColor = t===tab?'var(--brown)':'transparent'; tabBtn.style.color = t===tab?'var(--brown)':'var(--text-dim)'; tabBtn.style.fontWeight = t===tab?'700':'600'; }
  });
  gwRenderDash();
}

function gwRenderDash() {
  // Update stat cards
  var p = gwPresenters[0]; // Simulated: current user's presenter slot
  var el = function(id){ return document.getElementById(id); };
  if(el('pdb-signals')) el('pdb-signals').textContent = gwMyDash.signals.length + p.signals;
  if(el('pdb-ready'))   el('pdb-ready').textContent   = gwMyDash.ready.length + p.ins;
  if(el('pdb-shelf'))   el('pdb-shelf').textContent   = gwMyDash.shelf.length + p.shelf;
  if(el('pdb-feedback'))el('pdb-feedback').textContent= gwMyDash.feedback.length + p.feedback.length;

  var empty = function(label, icon, note){
    return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:48px;text-align:center;">'
      +'<div style="font-size:2rem;margin-bottom:10px;">'+icon+'</div>'
      +'<div style="font-weight:700;font-size:0.92rem;margin-bottom:6px;">'+label+'</div>'
      +'<div style="font-size:0.8rem;color:var(--text-dim);">'+note+'</div></div>';
  };

  // Signals panel
  var sp = el('gw-dash-signals');
  if (sp) {
    var all = gwMyDash.signals.slice();
    // Add demo signals from presenter data
    for(var i=0;i<p.signals;i++) all.push({name:'Aaliyah Morris', time:'Live', role: i%2===0?'public':'business'});
    if (!all.length) { sp.innerHTML = empty('No signals yet','📡','When attendees signal you, they\'ll appear here with their role and timestamp.'); }
    else sp.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">'+all.slice(0,20).map(function(s,i){
      return '<div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px 14px;display:flex;align-items:center;gap:10px;">'
        +'<span style="font-size:1rem;">📡</span>'
        +'<div style="flex:1;"><div style="font-size:0.82rem;font-weight:600;color:var(--text);">Signal #'+(i+1)+'</div><div style="font-size:0.72rem;color:var(--text-dim);">'+s.time+' · '+(s.role==='business'?'🏢 Business':'👁 Public')+'</div></div>'
        +'<span style="font-size:0.68rem;background:var(--brown-bg);color:var(--brown);padding:2px 8px;border-radius:10px;font-weight:700;">New</span>'
      +'</div>';
    }).join('')+'</div>';
  }

  // Ready Now panel
  var rp = el('gw-dash-ready');
  if (rp) {
    var all2 = gwMyDash.ready.slice();
    for(var j=0;j<p.ins;j++) all2.push({name:'Aaliyah Morris',time:'Live',role:j%3===0?'business':'public'});
    if (!all2.length) { rp.innerHTML = empty('No commitments yet','✅','When attendees tap "I\'m In", they\'ll show here as committed prospects.'); }
    else rp.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">'+all2.map(function(s,i){
      return '<div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px 14px;display:flex;align-items:center;gap:10px;">'
        +'<span style="font-size:1rem;">✅</span>'
        +'<div style="flex:1;"><div style="font-size:0.82rem;font-weight:700;color:#16a34a;">Committed — I\'m In</div><div style="font-size:0.72rem;color:var(--text-dim);">'+s.time+' · '+(s.role==='business'?'🏢 Business':'👁 Public')+'</div></div>'
      +'</div>';
    }).join('')+'</div>';
  }

  // Shelf panel
  var shp = el('gw-dash-shelf');
  if (shp) {
    var all3 = gwMyDash.shelf.slice();
    for(var k=0;k<p.shelf;k++) all3.push({name:'Aaliyah Morris',time:'Live',role:'business'});
    if (!all3.length) { shp.innerHTML = empty('No shelf requests yet','📦','Business attendees who request distribution will appear here.'); }
    else shp.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">'+all3.map(function(s,i){
      return '<div style="background:#fff;border:1px solid #ede9fe);border-radius:10px;padding:12px 14px;display:flex;align-items:center;gap:10px;">'
        +'<span style="font-size:1rem;">📦</span>'
        +'<div style="flex:1;"><div style="font-size:0.82rem;font-weight:700;color:#7c3aed;">Shelf / Distribution Request</div><div style="font-size:0.72rem;color:var(--text-dim);">'+s.time+' · 🏢 Business Attendee</div></div>'
        +'<span style="font-size:0.68rem;background:#faf5ff;color:#7c3aed;padding:2px 8px;border-radius:10px;font-weight:700;border:1px solid #ede9fe;">New</span>'
      +'</div>';
    }).join('')+'</div>';
  }

  // Feedback panel
  var fp = el('gw-dash-feedback');
  if (fp) {
    var allFb = gwMyDash.feedback.slice();
    p.feedback.forEach(function(f){ allFb.push(f); });
    // Add demo feedback
    if (allFb.length === 0) allFb = [
      { tags:['Strong idea','Felt polished','Clear offer'], msg:'Really compelling pitch, great energy!', time:'2:14 PM', role:'public' },
      { tags:['Delivery needs work','Not enough information'], msg:'', time:'2:16 PM', role:'business' },
      { tags:['Could work','Too rushed'], msg:'Would love to see more about pricing.', time:'2:19 PM', role:'public' }
    ];
    // Tag frequency summary
    var tagCount = {};
    allFb.forEach(function(f){ (f.tags||[]).forEach(function(t){ tagCount[t]=(tagCount[t]||0)+1; }); });
    var tagSorted = Object.keys(tagCount).sort(function(a,b){return tagCount[b]-tagCount[a];});
    var summary = tagSorted.length ? '<div style="margin-bottom:16px;"><div style="font-size:0.62rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px;">Top Tags</div><div style="display:flex;flex-wrap:wrap;gap:6px;">'
      +tagSorted.map(function(t){ return '<span style="padding:4px 10px;border-radius:20px;background:var(--brown-bg);color:var(--brown);font-size:0.75rem;font-weight:700;">'+t+' <span style="opacity:0.7;">×'+tagCount[t]+'</span></span>'; }).join('')
      +'</div></div>' : '';
    fp.innerHTML = summary + '<div style="display:flex;flex-direction:column;gap:10px;">'
      +allFb.map(function(f){
        return '<div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px 16px;">'
          +'<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:'+(f.msg?'8px':'0')+';">'
          +(f.tags||[]).map(function(t){ return '<span style="padding:3px 9px;border-radius:20px;background:var(--cream);color:var(--text-mid);font-size:0.72rem;font-weight:600;border:1px solid var(--border);">'+t+'</span>'; }).join('')
          +'</div>'
          +(f.msg ? '<div style="font-size:0.82rem;color:var(--text);font-style:italic;">"'+f.msg+'"</div>' : '')
          +'<div style="font-size:0.68rem;color:var(--text-dim);margin-top:6px;">'+f.time+' · '+(f.role==='business'?'🏢 Business':'👁 Public')+'</div>'
        +'</div>';
      }).join('')
    +'</div>';
  }
}

// ── HELP MODAL SEARCH / JUMP TO ──────────────────────────────────────────────
var helpSections = [
  { id:'help-sec-mediaprofile',   label:'👤 Media Profile' },
  { id:'help-sec-mystore',        label:'🛍️ My Store' },
  { id:'help-sec-weblinks',       label:'🔗 Web Links' },
  { id:'help-sec-listings',       label:'📋 Listings' },
  { id:'help-sec-forms',          label:'📝 Forms' },
  { id:'help-sec-booking',        label:'📅 Booking / Your Services' },
  { id:'help-sec-sociallinks',    label:'📱 Social Links' },
  { id:'help-sec-video',          label:'🎬 Video' },
  { id:'help-sec-events',         label:'🎟️ Events / Tickets' },
  { id:'help-sec-golive',         label:'🔴 Go Live' },
  { id:'help-sec-sales',          label:'💰 Sales & Payouts' },
  { id:'help-sec-settings',       label:'⚙️ Settings' },
  { id:'help-sec-support',        label:'❓ Support Tab (inside Settings)' },
  { id:'help-sec-browsericon',    label:'🌐 Browser Icon' },
  { id:'help-sec-subs',           label:'💳 Subscriptions / Memberships' },
  { id:'help-sec-hearts',         label:'❤️ Hearts — Save Feature' },
  { id:'help-sec-custom',         label:'🔤 Other / Custom Fields' },
  { id:'help-sec-messages',       label:'💬 My Messages' },
  { id:'help-sec-switchprofile',  label:'👥 Switch Profile' },
  { id:'help-sec-banned',         label:'⛔🚫 Banned / Blocked' },
  { id:'help-sec-gateway',        label:'🚪 Gateway Room' },
  { id:'help-sec-reservations',   label:'🍽️ Reservations' },
  { id:'help-sec-sparkfounder',   label:'⚡ Spark Founder' }
];

function helpSearch(val) {
  var suggestions = document.getElementById('help-suggestions');
  if (!suggestions) return;
  var q = val.trim().toLowerCase();
  if (!q) { suggestions.style.display = 'none'; return; }
  var matches = helpSections.filter(function(s){
    return s.label.toLowerCase().indexOf(q) !== -1;
  });
  if (!matches.length) {
    suggestions.style.display = 'block';
    suggestions.innerHTML = '<div style="padding:10px 14px;font-size:0.82rem;color:var(--text-dim);">No sections found</div>';
    return;
  }
  suggestions.style.display = 'block';
  suggestions.innerHTML = matches.map(function(s) {
    return '<div onclick="helpJumpTo(\''+s.id+'\')" style="padding:10px 14px;font-size:0.85rem;font-weight:600;color:var(--text);cursor:pointer;border-bottom:1px solid var(--border);transition:background 0.15s;" onmouseover="this.style.background=\'var(--brown-bg)\'" onmouseout="this.style.background=\'#fff\'">'
      + s.label + '</div>';
  }).join('');
}

function helpJumpTo(sectionId) {
  var el = document.getElementById(sectionId);
  var scroll = document.getElementById('help-scroll-area');
  var input = document.getElementById('help-search');
  var suggestions = document.getElementById('help-suggestions');
  if (!el || !scroll) return;
  // Close dropdown
  if (suggestions) suggestions.style.display = 'none';
  if (input) input.value = '';
  // Scroll to section
  scroll.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
  // Flash highlight
  el.style.transition = 'box-shadow 0.3s';
  el.style.boxShadow = '0 0 0 3px rgba(192,122,80,0.5)';
  setTimeout(function(){ el.style.boxShadow = 'none'; }, 1400);
}

// Close suggestions when clicking outside the help search
document.addEventListener('click', function(e) {
  var bar = document.getElementById('help-search');
  var sug = document.getElementById('help-suggestions');
  if (sug && bar && !bar.contains(e.target) && !sug.contains(e.target)) {
    sug.style.display = 'none';
  }
});

function spMsgSend() {
  var input = document.getElementById('sp-msg-input');
  if (!input || !input.value.trim()) return;
  var convo = spMsgConversations.find(function(c){return c.id===spMsgActiveId;});
  if (!convo) return;
  var now = new Date();
  var time = now.getHours() + ':' + String(now.getMinutes()).padStart(2,'0') + ' ' + (now.getHours()>=12?'PM':'AM');
  convo.messages.push({ from:'me', text:input.value.trim(), time:time });
  input.value = '';
  input.style.height = 'auto';
  spMsgOpenConvo(spMsgActiveId);
}

function spMsgAttach(event) {
  var file = event.target.files[0];
  if (!file) return;
  var convo = spMsgConversations.find(function(c){return c.id===spMsgActiveId;});
  if (!convo) return;
  var now = new Date();
  var time = now.getHours() + ':' + String(now.getMinutes()).padStart(2,'0') + ' ' + (now.getHours()>=12?'PM':'AM');
  convo.messages.push({ from:'me', text:'📎 ' + file.name, time:time });
  spMsgOpenConvo(spMsgActiveId);
  toast('📎 File attached: ' + file.name);
}

function spMsgAction(action) {
  var convo = spMsgConversations.find(function(c){return c.id===spMsgActiveId;});
  if (!convo) return;
  if (action === 'mute') {
    convo.muted = !convo.muted;
    toast(convo.muted ? '🔇 Conversation muted' : '🔔 Conversation unmuted');
  } else if (action === 'block') {
    if (confirm('Block ' + convo.name + '? They won\'t be able to message you.')) {
      convo.blocked = true;
      spMsgResetThread();
      // Sync to business Banned/Blocked screen if it's open
      var bbScreen = document.getElementById('bb-blocked-list');
      if (bbScreen) renderBannedBlocked();
      toast('🚫 ' + convo.name + ' has been blocked');
    }
  } else if (action === 'delete') {
    if (confirm('Delete this conversation? This cannot be undone.')) {
      spMsgConversations = spMsgConversations.filter(function(c){return c.id !== spMsgActiveId;});
      spMsgResetThread();
      toast('🗑️ Conversation deleted');
    }
  }
}

function spAttachMedia(event, type) {
  var file = event.target.files[0];
  if (!file) return;
  var prev = document.getElementById('sp-media-preview');
  if (!prev) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    prev.style.display = 'block';
    if (type === 'photo') prev.innerHTML = '<img src="'+e.target.result+'" style="width:100%;max-height:280px;object-fit:cover;border-radius:10px;">';
    else if (type === 'video') prev.innerHTML = '<video src="'+e.target.result+'" controls style="width:100%;max-height:240px;border-radius:10px;"></video>';
    else if (type === 'audio') prev.innerHTML = '<audio src="'+e.target.result+'" controls style="width:100%;"></audio>';
    spMediaAttachment = { type:type, src:e.target.result };
  };
  reader.readAsDataURL(file);
  toast('📎 ' + file.name + ' attached');
}

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

// ── FORMS ──────────────────────────────────────────────────────────────────
var formsData = []; // {id, title, type, desc, fields, submitLabel, confirmMsg, status:'draft'|'active', responses:[]}
var fbCurrentId = null;
var fbFields = []; // [{id, type, label, required, options:[]}]
var fbFieldCounter = 0;

function formsTab(tab, btn) {
  document.querySelectorAll('#ftab-all,#ftab-active,#ftab-draft,#ftab-responses').forEach(function(b){
    b.style.background='transparent'; b.style.color='var(--text-dim)';
  });
  btn.style.background='var(--brown)'; btn.style.color='#fff';
  var listWrap = document.getElementById('forms-list-wrap');
  var respWrap = document.getElementById('forms-responses-wrap');
  if (tab === 'responses') {
    if (listWrap) listWrap.style.display = 'none';
    if (respWrap) respWrap.style.display = 'block';
    formsRenderResponses();
  } else {
    if (listWrap) listWrap.style.display = 'block';
    if (respWrap) respWrap.style.display = 'none';
    formsRenderGrid(tab);
  }
}

function formsRenderGrid(filter) {
  var grid = document.getElementById('forms-grid');
  var empty = document.getElementById('forms-empty');
  if (!grid) return;
  var filtered = formsData.filter(function(f){
    if (filter === 'all') return true;
    if (filter === 'active') return f.status === 'active';
    if (filter === 'draft') return f.status === 'draft';
    return true;
  });
  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  grid.innerHTML = filtered.map(function(f) {
    var statusColor = f.status === 'active' ? '#22c55e' : 'var(--text-dim)';
    var statusLabel = f.status === 'active' ? '● Active' : '○ Draft';
    var respCount = f.responses ? f.responses.length : 0;
    return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:10px;">'
      + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">'
      + '<div>'
      + (f.type ? '<div style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--brown);margin-bottom:4px;">'+f.type+'</div>' : '')
      + '<div style="font-weight:700;font-size:0.92rem;color:var(--text);">'+f.title+'</div>'
      + '</div>'
      + '<span style="font-size:0.7rem;font-weight:700;color:'+statusColor+';white-space:nowrap;">'+statusLabel+'</span>'
      + '</div>'
      + (f.desc ? '<div style="font-size:0.78rem;color:var(--text-dim);line-height:1.5;">'+f.desc+'</div>' : '')
      + '<div style="font-size:0.75rem;color:var(--text-dim);">'+f.fields.length+' field'+(f.fields.length!==1?'s':'')+' · '+respCount+' response'+(respCount!==1?'s':'')+'</div>'
      + '<div style="display:flex;gap:7px;flex-wrap:wrap;">'
      + '<button onclick="formsOpenBuilder(\''+f.id+'\')" style="flex:1;padding:8px;background:var(--cream);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;font-weight:700;color:var(--text-mid);">✏️ Edit</button>'
      + '<button onclick="formsSend(\''+f.id+'\')" style="flex:1;padding:8px;background:var(--cream);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;font-weight:700;color:var(--text-mid);">📤 Send</button>'
      + '<button onclick="formsDelete(\''+f.id+'\')" style="padding:8px 12px;background:var(--cream);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;font-weight:700;color:#dc2626;" onmouseover="this.style.background=\'#fee2e2\'" onmouseout="this.style.background=\'var(--cream)\'">🗑</button>'
      + '</div>'
      + '</div>';
  }).join('');
}

function formsRenderResponses() {
  var list = document.getElementById('forms-responses-list');
  var empty = document.getElementById('forms-responses-empty');
  if (!list) return;
  var all = [];
  formsData.forEach(function(f){ (f.responses||[]).forEach(function(r){ all.push({form:f, resp:r}); }); });
  if (all.length === 0) { list.innerHTML=''; if(empty) empty.style.display='block'; return; }
  if (empty) empty.style.display='none';
  list.innerHTML = all.map(function(item) {
    return '<div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px 20px;">'
      + '<div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--brown);margin-bottom:4px;">'+item.form.title+'</div>'
      + '<div style="font-weight:600;font-size:0.85rem;color:var(--text);margin-bottom:4px);">'+item.resp.from+'</div>'
      + '<div style="font-size:0.75rem;color:var(--text-dim);">'+item.resp.date+'</div>'
      + '</div>';
  }).join('');
}

function formsOpenBuilder(id) {
  var listWrap = document.getElementById('forms-list-wrap');
  var respWrap = document.getElementById('forms-responses-wrap');
  var builder = document.getElementById('form-builder');
  if (listWrap) listWrap.style.display = 'none';
  if (respWrap) respWrap.style.display = 'none';
  document.querySelector('.section-header') && (document.querySelector('#screen-forms .section-header').style.display = 'none');
  document.querySelectorAll('#screen-forms > div:first-of-type, #screen-forms > div:nth-of-type(2)').forEach(function(el){ if (el.id !== 'form-builder') el.style.display = 'none'; });
  if (builder) builder.style.display = 'block';

  if (id) {
    var form = formsData.find(function(f){ return f.id === id; });
    if (form) {
      fbCurrentId = id;
      fbFields = JSON.parse(JSON.stringify(form.fields));
      document.getElementById('fb-title').value = form.title || '';
      document.getElementById('fb-type').value = form.type || '';
      document.getElementById('fb-desc').value = form.desc || '';
      document.getElementById('fb-body').value = form.body || '';
      document.getElementById('fb-submit-label').value = form.submitLabel || 'Submit';
      document.getElementById('fb-confirm-msg').value = form.confirmMsg || '';
    }
  } else {
    fbCurrentId = null;
    fbFields = [];
    document.getElementById('fb-title').value = '';
    document.getElementById('fb-type').value = '';
    document.getElementById('fb-desc').value = '';
    document.getElementById('fb-body').value = '';
    document.getElementById('fb-submit-label').value = 'Submit';
    document.getElementById('fb-confirm-msg').value = '';
    document.getElementById('fb-recipient-name').value = '';
    document.getElementById('fb-recipient-email').value = '';
    document.getElementById('fb-send-note').value = '';
  }
  fbRenderFields();
  fbUpdatePreview();
}

function formsCloseBuilder() {
  var builder = document.getElementById('form-builder');
  if (builder) builder.style.display = 'none';
  var header = document.querySelector('#screen-forms .section-header');
  if (header) header.style.display = '';
  var topBar = document.querySelector('#screen-forms > div:nth-child(2)');
  if (topBar) topBar.style.display = '';
  var listWrap = document.getElementById('forms-list-wrap');
  if (listWrap) listWrap.style.display = '';
  formsRenderGrid('all');
  document.querySelectorAll('#ftab-all,#ftab-active,#ftab-draft,#ftab-responses').forEach(function(b){b.style.background='transparent';b.style.color='var(--text-dim)';});
  var allBtn = document.getElementById('ftab-all');
  if (allBtn) { allBtn.style.background='var(--brown)'; allBtn.style.color='#fff'; }
}

function fbAddField(type) {
  fbFieldCounter++;
  var defaultLabel = {text:'Text Field',textarea:'Long Text',email:'Email Address',phone:'Phone Number',date:'Date',select:'Dropdown',checkbox:'Checkbox',signature:'Signature'}[type] || 'Field';
  fbFields.push({ id:'field_'+fbFieldCounter, type:type, label:defaultLabel, required:false, options:type==='select'?['Option 1','Option 2']:[] });
  fbRenderFields();
  fbUpdatePreview();
}

function fbRenderFields() {
  var container = document.getElementById('fb-fields-list');
  if (!container) return;
  if (fbFields.length === 0) {
    container.innerHTML = '<div style="font-size:0.82rem;color:var(--text-dim);text-align:center;padding:22px 0;border:1.5px dashed var(--border);border-radius:10px;">Add fields using the buttons above</div>';
    return;
  }
  container.innerHTML = fbFields.map(function(field, idx) {
    var isSig = field.type === 'signature';
    var isSelect = field.type === 'select';
    var typeLabel = {text:'Short Text',textarea:'Long Text',email:'Email',phone:'Phone',date:'Date',select:'Dropdown',checkbox:'Checkbox',signature:'✍️ Signature'}[field.type]||field.type;
    var html = '<div style="background:var(--cream);border:1px solid var(--border);border-radius:10px;padding:14px;" id="fcard_'+field.id+'">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
      + '<span style="font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:'+(isSig?'var(--brown)':'var(--text-dim)')+';">'+typeLabel+'</span>'
      + '<div style="display:flex;align-items:center;gap:8px;">'
      + '<label style="display:flex;align-items:center;gap:4px;font-size:0.72rem;color:var(--text-dim);cursor:pointer;"><input type="checkbox"'+(field.required?' checked':'')+' onchange="fbSetRequired(\''+field.id+'\',this.checked)" style="accent-color:var(--brown);"> Required</label>'
      + '<button onclick="fbRemoveField(\''+field.id+'\')" style="background:none;border:none;cursor:pointer;color:var(--text-dim);font-size:1rem;line-height:1;" onmouseover="this.style.color=\'#dc2626\'" onmouseout="this.style.color=\'var(--text-dim)\'">×</button>'
      + '</div></div>'
      + (isSig ? '<div style="height:56px;border:1.5px dashed var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;background:#fff;"><span style="font-size:0.75rem;color:var(--text-dim);">Signature box</span></div>'
        : '<input type="text" value="'+field.label.replace(/"/g,'&quot;')+'" onchange="fbSetLabel(\''+field.id+'\',this.value)" placeholder="Field label" style="width:100%;padding:8px 10px;border:1.5px solid var(--border);border-radius:8px;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;outline:none;box-sizing:border-box;background:#fff;" onfocus="this.style.borderColor=\'var(--brown)\'" onblur="this.style.borderColor=\'var(--border)\'">')
      + (isSelect ? '<div style="margin-top:8px;display:flex;flex-direction:column;gap:5px;" id="fopts_'+field.id+'">'
          + field.options.map(function(opt,oi){
              return '<div style="display:flex;gap:6px;align-items:center;">'
                +'<input type="text" value="'+opt.replace(/"/g,'&quot;')+'" onchange="fbSetOption(\''+field.id+'\','+oi+',this.value)" style="flex:1;padding:6px 9px;border:1.5px solid var(--border);border-radius:7px;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;outline:none;background:#fff;" onfocus="this.style.borderColor=\'var(--brown)\'" onblur="this.style.borderColor=\'var(--border)\'">'
                +'<button onclick="fbRemoveOption(\''+field.id+'\','+oi+')" style="background:none;border:none;cursor:pointer;color:var(--text-dim);font-size:0.9rem;" title="Remove">×</button>'
                +'</div>';
            }).join('')
          + '<button onclick="fbAddOption(\''+field.id+'\')" style="margin-top:2px;padding:4px 10px;background:none;border:1px dashed var(--border);border-radius:7px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.72rem;color:var(--text-dim);width:100%;" onmouseover="this.style.borderColor=\'var(--brown)\';this.style.color=\'var(--brown)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--text-dim)\'">+ Add Option</button>'
          + '</div>'
        : '')
      + '</div>';
    return html;
  }).join('');
}

function fbSetLabel(id, val) { var f=fbFields.find(function(x){return x.id===id;}); if(f){f.label=val; fbUpdatePreview();} }
function fbSetRequired(id, val) { var f=fbFields.find(function(x){return x.id===id;}); if(f) f.required=val; }
function fbRemoveField(id) { fbFields=fbFields.filter(function(x){return x.id!==id;}); fbRenderFields(); fbUpdatePreview(); }
function fbAddOption(id) { var f=fbFields.find(function(x){return x.id===id;}); if(f){f.options.push('Option '+(f.options.length+1)); fbRenderFields(); fbUpdatePreview();} }
function fbRemoveOption(id,oi) { var f=fbFields.find(function(x){return x.id===id;}); if(f&&f.options.length>1){f.options.splice(oi,1); fbRenderFields(); fbUpdatePreview();} }
function fbSetOption(id,oi,val) { var f=fbFields.find(function(x){return x.id===id;}); if(f) f.options[oi]=val; fbUpdatePreview(); }

function fbUpdatePreview() {
  var title = (document.getElementById('fb-title')||{}).value || 'Form title';
  var desc = (document.getElementById('fb-desc')||{}).value || '';
  var body = (document.getElementById('fb-body')||{}).value || '';
  var type = (document.getElementById('fb-type')||{}).value || '';
  var submitLabel = (document.getElementById('fb-submit-label')||{}).value || 'Submit';
  var titleEl = document.getElementById('fb-preview-title');
  var descEl = document.getElementById('fb-preview-desc');
  var typeEl = document.getElementById('fb-preview-type');
  var fieldsEl = document.getElementById('fb-preview-fields');
  var submitEl = document.getElementById('fb-preview-submit-btn');
  if (titleEl) titleEl.textContent = title;
  if (descEl) { descEl.textContent = desc; descEl.style.display = desc ? 'block' : 'none'; }
  if (typeEl) { typeEl.textContent = type; typeEl.style.display = type ? 'block' : 'none'; }
  if (submitEl) submitEl.textContent = submitLabel || 'Submit';

  // Render form body (clauses/terms) in preview
  var bodyPreviewId = 'fb-preview-body';
  var existing = document.getElementById(bodyPreviewId);
  if (body) {
    if (!existing) {
      var bodyEl = document.createElement('div');
      bodyEl.id = bodyPreviewId;
      bodyEl.style.cssText = 'background:var(--cream);border-radius:10px;padding:14px 16px;font-size:0.8rem;line-height:1.8;color:var(--text);white-space:pre-wrap;border:1px solid var(--border);margin-bottom:0;';
      if (fieldsEl && fieldsEl.parentNode) fieldsEl.parentNode.insertBefore(bodyEl, fieldsEl);
    }
    document.getElementById(bodyPreviewId).textContent = body;
    document.getElementById(bodyPreviewId).style.display = 'block';
  } else if (existing) {
    existing.style.display = 'none';
  }
  if (!fieldsEl) return;
  if (fbFields.length === 0) { fieldsEl.innerHTML = '<div style="font-size:0.82rem;color:var(--text-dim);font-style:italic;">Fields will appear here as you add them</div>'; return; }
  fieldsEl.innerHTML = fbFields.map(function(field) {
    var req = field.required ? ' <span style="color:#dc2626;">*</span>' : '';
    if (field.type === 'signature') {
      return '<div><div style="font-size:0.78rem;font-weight:600;color:var(--text);margin-bottom:5px;">✍️ Signature'+req+'</div>'
        +'<div style="height:56px;border:1.5px dashed var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;background:var(--cream);">'
        +'<span style="font-size:0.72rem;color:var(--text-dim);">Sign here</span></div></div>';
    }
    if (field.type === 'textarea') {
      return '<div><div style="font-size:0.78rem;font-weight:600;color:var(--text);margin-bottom:5px;">'+field.label+req+'</div>'
        +'<div style="height:60px;border:1.5px solid var(--border);border-radius:8px;background:var(--cream);padding:8px 10px;font-size:0.75rem;color:var(--text-dim);">Type here…</div></div>';
    }
    if (field.type === 'checkbox') {
      return '<div style="display:flex;align-items:center;gap:8px;"><div style="width:16px;height:16px;border:1.5px solid var(--border);border-radius:4px;flex-shrink:0;background:var(--cream);"></div><div style="font-size:0.78rem;font-weight:600;color:var(--text);">'+field.label+req+'</div></div>';
    }
    if (field.type === 'select') {
      return '<div><div style="font-size:0.78rem;font-weight:600;color:var(--text);margin-bottom:5px;">'+field.label+req+'</div>'
        +'<div style="border:1.5px solid var(--border);border-radius:8px;padding:8px 10px;background:var(--cream);font-size:0.75rem;color:var(--text-dim);">'+(field.options[0]||'Select…')+' ▾</div></div>';
    }
    var ph = {email:'email@example.com',phone:'+1 (000) 000-0000',date:'MM / DD / YYYY',text:''}[field.type]||'';
    return '<div><div style="font-size:0.78rem;font-weight:600;color:var(--text);margin-bottom:5px;">'+field.label+req+'</div>'
      +'<div style="border:1.5px solid var(--border);border-radius:8px;padding:8px 10px;background:var(--cream);font-size:0.75rem;color:var(--text-dim);">'+(ph||'Answer…')+'</div></div>';
  }).join('');
}

function fbSaveDraft() {
  var title = (document.getElementById('fb-title')||{}).value || '';
  if (!title.trim()) { toast('⚠️ Please add a form title'); return; }
  fbPersist('draft');
  formsCloseBuilder();
  toast('📝 Form saved as draft');
}

function fbPublish() {
  var title = (document.getElementById('fb-title')||{}).value || '';
  if (!title.trim()) { toast('⚠️ Please add a form title'); return; }
  if (fbFields.length === 0) { toast('⚠️ Add at least one field'); return; }
  fbPersist('active');
  formsCloseBuilder();
  toast('✓ Form published!');
}

function fbPersist(status) {
  var title = document.getElementById('fb-title').value;
  var type = document.getElementById('fb-type').value;
  var desc = document.getElementById('fb-desc').value;
  var body = document.getElementById('fb-body').value;
  var submitLabel = document.getElementById('fb-submit-label').value;
  var confirmMsg = document.getElementById('fb-confirm-msg').value;
  if (fbCurrentId) {
    var f = formsData.find(function(x){ return x.id===fbCurrentId; });
    if (f) { f.title=title; f.type=type; f.desc=desc; f.body=body; f.fields=JSON.parse(JSON.stringify(fbFields)); f.submitLabel=submitLabel; f.confirmMsg=confirmMsg; f.status=status; }
  } else {
    var newId = 'form_'+(Date.now());
    formsData.push({ id:newId, title:title, type:type, desc:desc, body:body, fields:JSON.parse(JSON.stringify(fbFields)), submitLabel:submitLabel, confirmMsg:confirmMsg, status:status, responses:[] });
    fbCurrentId = newId;
  }
}

function fbSendEmail() {
  var title = (document.getElementById('fb-title')||{}).value || '';
  if (!title.trim()) { toast('⚠️ Please add a form title first'); return; }
  if (fbFields.length === 0) { toast('⚠️ Add at least one field first'); return; }
  var email = (document.getElementById('fb-recipient-email')||{}).value || '';
  var name = (document.getElementById('fb-recipient-name')||{}).value || '';
  var note = (document.getElementById('fb-send-note')||{}).value || '';
  if (!email.trim()) { toast('⚠️ Please enter a recipient email'); return; }
  fbPersist('active');
  // Simulate opening email client
  var subject = encodeURIComponent('Form: ' + title);
  var body = encodeURIComponent((name ? 'Hi ' + name + ',\n\n' : '') + (note ? note + '\n\n' : '') + 'Please complete the form "' + title + '" and sign if required, then send it back.\n\n— Sent via MASSED');
  window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
  toast('✉️ Email opened — form sent to ' + email);
}

function fbSendMessage() {
  var title = (document.getElementById('fb-title')||{}).value || '';
  if (!title.trim()) { toast('⚠️ Please add a form title first'); return; }
  if (fbFields.length === 0) { toast('⚠️ Add at least one field first'); return; }
  fbPersist('active');
  toast('💬 Form sent in message!');
  // Navigate to messages
  var msgNav = document.querySelector('[onclick*="messages"]');
  nav(msgNav||null, 'messages');
}

function formsSend(id) {
  var f = formsData.find(function(x){ return x.id===id; });
  if (!f) return;
  openModal('modal-form-send');
  document.getElementById('fsend-form-id').value = id;
  document.getElementById('fsend-title').textContent = f.title;
  document.getElementById('fsend-recipient-name').value = '';
  document.getElementById('fsend-recipient-email').value = '';
  document.getElementById('fsend-note').value = '';
}

function fsendViaEmail() {
  var id = document.getElementById('fsend-form-id').value;
  var f = formsData.find(function(x){ return x.id===id; });
  var email = document.getElementById('fsend-recipient-email').value;
  var name = document.getElementById('fsend-recipient-name').value;
  var note = document.getElementById('fsend-note').value;
  if (!email.trim()) { toast('⚠️ Please enter a recipient email'); return; }
  var subject = encodeURIComponent('Form: ' + (f?f.title:''));
  var body = encodeURIComponent((name?'Hi '+name+',\n\n':'')+(note?note+'\n\n':'')+'Please complete and return the form "'+(f?f.title:'')+'".\n\n— Sent via MASSED');
  window.location.href = 'mailto:'+email+'?subject='+subject+'&body='+body;
  closeModal('modal-form-send');
  toast('✉️ Email opened for ' + (f?f.title:'form'));
}

function fsendViaMessage() {
  var id = document.getElementById('fsend-form-id').value;
  var f = formsData.find(function(x){ return x.id===id; });
  closeModal('modal-form-send');
  toast('💬 Form "' + (f?f.title:'') + '" sent in message!');
  var msgNav = document.querySelector('[onclick*="messages"]');
  nav(msgNav||null, 'messages');
}

function formsDelete(id) {
  if (!confirm('Delete this form? This cannot be undone.')) return;
  formsData = formsData.filter(function(f){ return f.id!==id; });
  formsRenderGrid('all');
  toast('🗑 Form deleted');
}
var bioPollQuestions = []; // [{question:'', options:['','',...]}]

function bioInitIfEmpty() {
  if (bioPollQuestions.length === 0) bioAddQuestion();
}

function bioAddQuestion() {
  var idx = bioPollQuestions.length;
  bioPollQuestions.push({ question: '', options: ['', ''] });
  bioRenderQuestions();
}

function bioRenderQuestions() {
  var container = document.getElementById('bio-questions-list');
  if (!container) return;
  container.innerHTML = '';
  bioPollQuestions.forEach(function(q, qi) {
    var card = document.createElement('div');
    card.style.cssText = 'background:var(--cream);border:1px solid var(--border);border-radius:12px;padding:16px;';
    var headerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
      + '<div style="font-size:0.62rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--brown);">Question ' + (qi+1) + '</div>'
      + (bioPollQuestions.length > 1 ? '<button onclick="bioRemoveQuestion('+qi+')" style="background:none;border:none;cursor:pointer;font-size:0.75rem;color:var(--text-dim);font-weight:600;font-family:\'DM Sans\',sans-serif;" onmouseover="this.style.color=\'#dc2626\'" onmouseout="this.style.color=\'var(--text-dim)\'">✕ Remove</button>' : '')
      + '</div>';
    var qHTML = '<input type="text" placeholder="Ask something…" value="'+q.question.replace(/"/g,'&quot;')+'" oninput="bioSetQuestion('+qi+',this.value)" style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:9px;font-family:\'DM Sans\',sans-serif;font-size:0.85rem;font-weight:600;outline:none;box-sizing:border-box;background:#fff;margin-bottom:10px;" onfocus="this.style.borderColor=\'var(--brown)\'" onblur="this.style.borderColor=\'var(--border)\'">';
    var optsHTML = '<div style="display:flex;flex-direction:column;gap:7px;" id="bio-opts-'+qi+'">';
    q.options.forEach(function(opt, oi) {
      optsHTML += '<div style="display:flex;align-items:center;gap:7px;">'
        + '<div style="width:20px;height:20px;border-radius:50%;background:'+(oi<2?'var(--brown)':'var(--cream3)')+';color:'+(oi<2?'#fff':'var(--text-dim)')+';font-size:0.6rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+(oi+1)+'</div>'
        + '<input type="text" placeholder="Option '+(oi+1)+(oi>=2?' (optional)':'')+'" value="'+opt.replace(/"/g,'&quot;')+'" oninput="bioSetOption('+qi+','+oi+',this.value)" style="flex:1;padding:7px 10px;border:1.5px solid var(--border);border-radius:8px;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;outline:none;background:#fff;" onfocus="this.style.borderColor=\'var(--brown)\'" onblur="this.style.borderColor=\'var(--border)\'">'
        + (oi >= 2 ? '<button onclick="bioRemoveOption('+qi+','+oi+')" style="background:none;border:none;cursor:pointer;color:var(--text-dim);font-size:1rem;line-height:1;flex-shrink:0;" title="Remove option">×</button>' : '')
        + '</div>';
    });
    optsHTML += '</div>';
    var addOptBtn = '<button onclick="bioAddOption('+qi+')" style="margin-top:8px;display:flex;align-items:center;gap:5px;padding:5px 10px;background:none;border:1px dashed var(--border);border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.75rem;font-weight:600;color:var(--text-dim);width:100%;justify-content:center;" onmouseover="this.style.borderColor=\'var(--brown)\';this.style.color=\'var(--brown)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--text-dim)\'">'
      + '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Option</button>';
    card.innerHTML = headerHTML + qHTML + optsHTML + addOptBtn;
    container.appendChild(card);
  });
  bioUpdatePreview();
}

function bioSetQuestion(qi, val) { bioPollQuestions[qi].question = val; bioUpdatePreview(); }
function bioSetOption(qi, oi, val) { bioPollQuestions[qi].options[oi] = val; bioUpdatePreview(); }

function bioAddOption(qi) {
  bioPollQuestions[qi].options.push('');
  bioRenderQuestions();
}
function bioRemoveOption(qi, oi) {
  if (bioPollQuestions[qi].options.length <= 2) { toast('Minimum 2 options required'); return; }
  bioPollQuestions[qi].options.splice(oi, 1);
  bioRenderQuestions();
}
function bioRemoveQuestion(qi) {
  bioPollQuestions.splice(qi, 1);
  bioRenderQuestions();
}

function bioUpdatePreview() {
  var title = (document.getElementById('bio-poll-title')||{}).value || '';

  // Preview 1 — profile card: title + Vote button
  var titleEl = document.getElementById('bio-phone-title');
  if (titleEl) {
    titleEl.textContent = title || 'Poll title appears here…';
    titleEl.style.color = title ? 'var(--text)' : 'var(--text-dim)';
    titleEl.style.fontStyle = title ? 'normal' : 'italic';
  }

  // Preview 2 — full detail: title + all questions + options
  var detailTitle = document.getElementById('bio-detail-title');
  if (detailTitle) {
    detailTitle.textContent = title || 'Poll title appears here…';
    detailTitle.style.color = title ? 'var(--text)' : 'var(--text-dim)';
    detailTitle.style.fontStyle = title ? 'normal' : 'italic';
  }
  var qContainer = document.getElementById('bio-detail-questions');
  if (!qContainer) return;
  var filled = bioPollQuestions.filter(function(q){ return q.question.trim(); });
  if (filled.length === 0) {
    qContainer.innerHTML = '<div style="font-size:0.6rem;color:var(--text-dim);font-style:italic;">Questions and options appear here…</div>';
    return;
  }
  qContainer.innerHTML = filled.map(function(q, i) {
    var opts = q.options.filter(function(o){ return o.trim(); });
    if (opts.length === 0) opts = ['Option 1', 'Option 2'];
    return '<div style="' + (i > 0 ? 'margin-top:10px;padding-top:10px;border-top:1px solid var(--border);' : '') + '">'
      + '<div style="font-weight:700;font-size:0.62rem;color:var(--text);margin-bottom:6px;line-height:1.35;">' + q.question + '</div>'
      + opts.map(function(o) {
          return '<div style="padding:4px 8px;background:var(--cream);border:1px solid var(--border);border-radius:6px;font-size:0.58rem;color:var(--text);margin-bottom:4px;cursor:pointer;">' + o + '</div>';
        }).join('')
      + '</div>';
  }).join('');
}

var bioPollVisible = false;
var bioPollSaved = false;

function bioPollSave() {
  var title = (document.getElementById('bio-poll-title')||{}).value || '';
  if (!title.trim()) { toast('⚠️ Please add a poll title'); return; }
  var filled = bioPollQuestions.filter(function(q){ return q.question.trim() && q.options.filter(function(o){return o.trim();}).length >= 2; });
  if (filled.length === 0) { toast('⚠️ Add at least one question with 2 options'); return; }
  bioPollSaved = true;
  bioPollVisible = true;
  var actions = document.getElementById('bio-poll-actions');
  if (actions) actions.style.display = 'flex';
  bioPollUpdateStatus();
  toast('✓ Poll saved!');
}

function bioPollToggleVisibility() {
  if (!bioPollSaved) return;
  bioPollVisible = !bioPollVisible;
  bioPollUpdateStatus();
  toast(bioPollVisible ? '👁 Poll is now visible on your profile' : '🚫 Poll hidden from your profile');
}

function bioPollUpdateStatus() {
  var statusBox = document.getElementById('bio-saved-status');
  var iconEl = document.getElementById('bio-status-icon');
  var subEl = document.getElementById('bio-status-sub');
  var toggleBtn = document.getElementById('bio-toggle-btn');
  var toggleLabel = document.getElementById('bio-toggle-label');
  var phonePreview = document.getElementById('bio-phone-preview');
  if (!statusBox) return;
  statusBox.style.display = 'block';
  if (bioPollVisible) {
    statusBox.style.background = '#eaf3de';
    statusBox.style.border = '1px solid #c0dd97';
    if (iconEl) { iconEl.textContent = '✓ Poll is visible on your profile'; iconEl.style.color = '#3b6d11'; }
    if (subEl) { subEl.textContent = 'Shown at massed.io/username'; subEl.style.color = '#639922'; }
    if (toggleLabel) toggleLabel.textContent = 'Hide from Profile';
    if (toggleBtn) { toggleBtn.style.borderColor = 'var(--brown)'; toggleBtn.style.color = 'var(--brown)'; }
    if (phonePreview) phonePreview.style.opacity = '1';
  } else {
    statusBox.style.background = 'var(--cream2)';
    statusBox.style.border = '1px solid var(--border)';
    if (iconEl) { iconEl.textContent = '⏸ Poll is hidden from your profile'; iconEl.style.color = 'var(--text-mid)'; }
    if (subEl) { subEl.textContent = 'Save and show when ready'; subEl.style.color = 'var(--text-dim)'; }
    if (toggleLabel) toggleLabel.textContent = 'Show on Profile';
    if (toggleBtn) { toggleBtn.style.borderColor = 'var(--border)'; toggleBtn.style.color = 'var(--text-mid)'; }
    if (phonePreview) phonePreview.style.opacity = '0.35';
  }
}

function bioPollDelete() {
  if (!confirm('Delete this poll? This will remove it from your profile.')) return;
  bioPollSaved = false;
  bioPollVisible = false;
  // Reset form
  var titleEl = document.getElementById('bio-poll-title');
  if (titleEl) titleEl.value = '';
  bioPollQuestions = [];
  bioAddQuestion();
  bioUpdatePreview();
  var actions = document.getElementById('bio-poll-actions');
  if (actions) actions.style.display = 'none';
  var statusBox = document.getElementById('bio-saved-status');
  if (statusBox) statusBox.style.display = 'none';
  var phonePreview = document.getElementById('bio-phone-preview');
  if (phonePreview) phonePreview.style.opacity = '1';
  toast('🗑 Poll deleted');
}

// Init bio poll with one empty question on page load
// bioAddQuestion called in boot sequence below

// Poll modal live preview
function pollModalPreview() {
  var q = (document.getElementById('poll-modal-question')||{}).value || '';
  var o1 = (document.getElementById('poll-modal-opt1')||{}).value || '';
  var o2 = (document.getElementById('poll-modal-opt2')||{}).value || '';
  var o3 = (document.getElementById('poll-modal-opt3')||{}).value || '';
  var o4 = (document.getElementById('poll-modal-opt4')||{}).value || '';
  var prev = document.getElementById('poll-modal-preview');
  var pq = document.getElementById('poll-preview-q');
  var po = document.getElementById('poll-preview-opts');
  if (!prev || !pq || !po) return;
  if (!q.trim() && !o1.trim()) { prev.style.display = 'none'; return; }
  prev.style.display = 'block';
  pq.textContent = q || 'Your question…';
  var opts = [o1,o2,o3,o4].filter(function(x){return x.trim();});
  po.innerHTML = opts.map(function(o){
    return '<div style="padding:7px 10px;background:var(--cream2);border-radius:8px;font-size:0.82rem;color:var(--text);font-weight:500;">'+o+'</div>';
  }).join('');
}

function salesTab(tab) {
  var isS=tab==='sales';
  var s=document.getElementById('sp-sales'); var p=document.getElementById('sp-payout');
  if(s) s.style.display=isS?'block':'none';
  if(p) p.style.display=isS?'none':'block';
  var sb=document.getElementById('sp-tab-sales'); var pb=document.getElementById('sp-tab-payout');
  if(sb){sb.style.background=isS?'var(--brown)':'transparent';sb.style.color=isS?'#fff':'var(--text-dim)';}
  if(pb){pb.style.background=isS?'transparent':'var(--brown)';pb.style.color=isS?'var(--text-dim)':'#fff';}
}
function spSubTab(sub) {
  var isP=sub==='payout';
  var pc=document.getElementById('sp-payout-content'); var ac=document.getElementById('sp-affiliate-content');
  if(pc) pc.style.display=isP?'block':'none';
  if(ac) ac.style.display=isP?'none':'block';
  var pb=document.getElementById('sp-sub-payout'); var ab=document.getElementById('sp-sub-affiliate');
  if(pb){pb.style.background=isP?'var(--brown)':'transparent';pb.style.color=isP?'#fff':'var(--text-dim)';}
  if(ab){ab.style.background=isP?'transparent':'var(--brown)';ab.style.color=isP?'var(--text-dim)':'#fff';}
}

function settingsTab(tab) {
  ['settings','billing','stripe','support','api'].forEach(function(t){
    var c=document.getElementById('stab-'+t+'-content');
    var b=document.getElementById('stab-'+t);
    if(c) c.style.display=t===tab?'flex':'none';
    if(b){b.style.background=t===tab?'var(--brown)':'transparent';b.style.color=t===tab?'#fff':'var(--text-dim)';}
  });
}

function mpTab(tab) {
  var pc=document.getElementById('mptab-profile-content');
  var cc=document.getElementById('mptab-collab-content');
  var hc=document.getElementById('mptab-hearts-content');
  if(pc) pc.style.display=tab==='profile'?'block':'none';
  if(cc) cc.style.display=tab==='collab'?'block':'none';
  if(hc) hc.style.display=tab==='hearts'?'block':'none';
  var pb=document.getElementById('mptab-profile'); var cb=document.getElementById('mptab-collab'); var hb=document.getElementById('mptab-hearts');
  if(pb){pb.style.background=tab==='profile'?'var(--brown)':'transparent';pb.style.color=tab==='profile'?'#fff':'var(--text-dim)';}
  if(cb){cb.style.background=tab==='collab'?'var(--brown)':'transparent';cb.style.color=tab==='collab'?'#fff':'var(--text-dim)';}
  if(hb){hb.style.background=tab==='hearts'?'var(--brown)':'transparent';hb.style.color=tab==='hearts'?'#fff':'var(--text-dim)';}
  if(tab==='collab') renderCollabGrid('all');
}

function collabSubTab(tab) {
  ['browse','incoming','active','docs'].forEach(function(t){
    var c=document.getElementById('csub-'+t+'-content');
    var b=document.getElementById('csub-'+t);
    if(c) c.style.display=t===tab?'block':'none';
    if(b){b.style.background=t===tab?'var(--brown)':'transparent';b.style.color=t===tab?'#fff':'var(--text-dim)';}
  });
  if(tab==='incoming') renderIncoming();
  if(tab==='active') renderActive();
  if(tab==='docs') renderDocs();
}


// ── MY STORE ─────────────────────────────────────────────
var storeProducts = { physical: [], digital: [], courses: [] };
var phPhotos = [null,null,null,null,null,null]; // stores base64 per slot
var phSizes = [];
var phColors = [];

// ── CUSTOM CATEGORIES (shared across all selects) ────────
var storeCustomCategories = [];
function storeAddCustomCategory(inputId) {
  var inp = document.getElementById(inputId);
  if (!inp || !inp.value.trim()) { toast('Enter a category name'); return; }
  var cat = inp.value.trim();
  if (storeCustomCategories.indexOf(cat) === -1) {
    storeCustomCategories.push(cat);
    // Add to all category selects in the system
    ['ph-category','dg-category','co-category'].forEach(function(selId) {
      var sel = document.getElementById(selId);
      if (!sel) return;
      var otherOpt = sel.querySelector('option[value="other-cat"]');
      var newOpt = document.createElement('option');
      newOpt.value = cat; newOpt.textContent = cat;
      if (otherOpt) sel.insertBefore(newOpt, otherOpt);
      else sel.appendChild(newOpt);
    });
    toast('✓ Category "' + cat + '" added to all product forms!');
  } else {
    toast('Category already exists');
  }
  inp.value = '';
}
function storeCategoryChange(selId, wrapId) {
  var sel = document.getElementById(selId);
  var wrap = document.getElementById(wrapId);
  if (!sel || !wrap) return;
  wrap.style.display = sel.value === 'other-cat' ? 'block' : 'none';
}

// ── TOGGLE HELPERS ───────────────────────────────────────
function storeSimpleToggle(cb, fieldsId, trackId, thumbId) {
  var track = trackId ? document.getElementById(trackId) : null;
  var thumb = thumbId ? document.getElementById(thumbId) : null;
  if (track) track.style.background = cb.checked ? 'var(--brown)' : '#d1d5db';
  if (thumb) thumb.style.left = cb.checked ? '20px' : '2px';
  if (fieldsId) {
    var f = document.getElementById(fieldsId);
    if (f) f.style.display = cb.checked ? 'block' : 'none';
  }
}
function storeUpdatesToggle(cb, trackId, thumbId) {
  var track = document.getElementById(trackId);
  var thumb = document.getElementById(thumbId);
  if (track) track.style.background = cb.checked ? 'var(--brown)' : '#d1d5db';
  if (thumb) thumb.style.left = cb.checked ? '20px' : '2px';
  toast(cb.checked ? '🔔 Product update subscriptions ON' : 'Product update subscriptions OFF');
}

// ── PHYSICAL: toggle helpers ─────────────────────────────
function phToggle(cb, offColor, onColor) {
  var track = cb.parentNode.querySelector('span:nth-child(2)');
  var thumb = cb.parentNode.querySelector('span:nth-child(3)');
  if (track) track.style.background = cb.checked ? onColor : offColor;
  if (thumb) thumb.style.left = cb.checked ? '20px' : '2px';
}
function phToggleAffiliate() {
  var cb = document.getElementById('ph-affiliate-toggle');
  var track = document.getElementById('ph-aff-track');
  var thumb = document.getElementById('ph-aff-thumb');
  var fields = document.getElementById('ph-affiliate-fields');
  if (track) track.style.background = cb.checked ? 'var(--brown)' : '#d1d5db';
  if (thumb) thumb.style.left = cb.checked ? '20px' : '2px';
  if (fields) fields.style.display = cb.checked ? 'block' : 'none';
}
function phToggleSub() {
  var cb = document.getElementById('ph-sub-toggle');
  var track = document.getElementById('ph-sub-track');
  var thumb = document.getElementById('ph-sub-thumb');
  var fields = document.getElementById('ph-sub-fields');
  if (track) track.style.background = cb.checked ? 'var(--brown)' : '#d1d5db';
  if (thumb) thumb.style.left = cb.checked ? '20px' : '2px';
  if (fields) fields.style.display = cb.checked ? 'block' : 'none';
  toast(cb.checked ? '✓ Subscription option added' : 'Subscription removed');
}
function phToggleMem() {
  var cb = document.getElementById('ph-mem-toggle');
  var track = document.getElementById('ph-mem-track');
  var thumb = document.getElementById('ph-mem-thumb');
  var fields = document.getElementById('ph-mem-fields');
  if (track) track.style.background = cb.checked ? 'var(--brown)' : '#d1d5db';
  if (thumb) thumb.style.left = cb.checked ? '20px' : '2px';
  if (fields) fields.style.display = cb.checked ? 'block' : 'none';
  toast(cb.checked ? '✓ Membership requirement set' : 'Membership requirement removed');
}
function phToggleUpdates() {
  var cb = document.getElementById('ph-updates-toggle');
  var track = document.getElementById('ph-upd-track');
  var thumb = document.getElementById('ph-upd-thumb');
  if (track) track.style.background = cb.checked ? 'var(--brown)' : '#d1d5db';
  if (thumb) thumb.style.left = cb.checked ? '20px' : '2px';
  toast(cb.checked ? '🔔 Customer update subscriptions ON' : 'Customer update subscriptions OFF');
}
function phToggleHidden() {
  var cb = document.getElementById('ph-hidden-toggle');
  var track = document.getElementById('ph-hid-track');
  var thumb = document.getElementById('ph-hid-thumb');
  if (track) track.style.background = cb.checked ? 'var(--brown)' : '#d1d5db';
  if (thumb) thumb.style.left = cb.checked ? '20px' : '2px';
  toast(cb.checked ? 'Product hidden — publish to save privately' : 'Product will be visible on publish');
}

// ── PHYSICAL: photos ─────────────────────────────────────
function phTriggerPhoto(idx) {
  document.getElementById('ph-photo-input-' + idx).click();
}
function phPhotoUploaded(idx, input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    phPhotos[idx] = e.target.result;
    var slot = document.getElementById('ph-photo-slot-' + idx);
    if (slot) {
      slot.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">';
      slot.style.border = '2px solid var(--brown)';
      slot.style.padding = '0';
    }
  };
  reader.readAsDataURL(file);
}

// ── PHYSICAL: sizes ──────────────────────────────────────
function phAddSize() {
  var inp = document.getElementById('ph-size-input');
  if (!inp) return;
  var raw = inp.value.trim();
  if (!raw) return;
  // Support comma-separated entry
  var parts = raw.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
  parts.forEach(function(size) {
    if (phSizes.indexOf(size) !== -1) return;
    phSizes.push(size);
    var disp = document.getElementById('ph-sizes-display');
    if (!disp) return;
    var chip = document.createElement('div');
    chip.style.cssText = 'padding:6px 14px;background:var(--cream2);border:1.5px solid var(--border);border-radius:20px;font-size:0.8rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;';
    chip.innerHTML = size + '<span onclick="phRemoveSize(\'' + size + '\',this.parentNode)" style="color:var(--text-dim);font-size:0.9rem;line-height:1;cursor:pointer;">✕</span>';
    disp.appendChild(chip);
  });
  inp.value = '';
}
function phRemoveSize(size, chip) {
  phSizes = phSizes.filter(function(s){ return s !== size; });
  if (chip) chip.remove();
}

// ── PHYSICAL: colors ─────────────────────────────────────
function phAddColor() {
  var picker = document.getElementById('ph-color-picker');
  var nameInp = document.getElementById('ph-color-name');
  if (!picker || !nameInp) return;
  var hex = picker.value;
  var name = nameInp.value.trim() || hex;
  if (phColors.find(function(c){ return c.name === name; })) { toast('Color already added'); return; }
  phColors.push({ hex: hex, name: name });
  var disp = document.getElementById('ph-colors-display');
  if (!disp) return;
  var chip = document.createElement('div');
  chip.title = name;
  chip.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px 10px;background:var(--cream2);border:1.5px solid var(--border);border-radius:20px;font-size:0.78rem;font-weight:600;cursor:pointer;';
  chip.innerHTML = '<span style="width:16px;height:16px;border-radius:50%;background:' + hex + ';border:1px solid rgba(0,0,0,0.15);flex-shrink:0;"></span>' + name + '<span onclick="phRemoveColor(\'' + name + '\',this.parentNode)" style="color:var(--text-dim);font-size:0.85rem;margin-left:2px;cursor:pointer;">✕</span>';
  disp.appendChild(chip);
  nameInp.value = '';
}
function phRemoveColor(name, chip) {
  phColors = phColors.filter(function(c){ return c.name !== name; });
  if (chip) chip.remove();
}

// ── PHYSICAL: stock badge live update ───────────────────
function phUpdateStockBadge() {}

// ── PHYSICAL: delivery ───────────────────────────────────
function phDeliveryChange(val) {
  var wrap = document.getElementById('ph-delivery-fee-wrap');
  if (wrap) wrap.style.display = val === 'delivered' ? 'block' : 'none';
}

// ── PHYSICAL: custom category ────────────────────────────
function phCategoryChange(val) {
  var wrap = document.getElementById('ph-custom-category-wrap');
  if (wrap) wrap.style.display = val === 'other-cat' ? 'block' : 'none';
}
function phSaveCustomCategory() {
  storeAddCustomCategory('ph-custom-category');
  document.getElementById('ph-custom-category-wrap').style.display = 'none';
}

// ── COURSE: video upload ─────────────────────────────────
function coVideoUploaded(input) {
  var file = input.files[0];
  if (!file) return;
  var url = URL.createObjectURL(file);
  var player = document.getElementById('co-video-player');
  var preview = document.getElementById('co-video-preview');
  var placeholder = document.getElementById('co-video-placeholder');
  var nameEl = document.getElementById('co-video-name');
  if (player) player.src = url;
  if (preview) preview.style.display = 'block';
  if (placeholder) placeholder.style.display = 'none';
  if (nameEl) { nameEl.textContent = '✓ ' + file.name; nameEl.style.display = 'block'; }
}

// ── STORE IMG PREVIEW ────────────────────────────────────
function storeImgPreview(inputId, thumbId, previewId, placeholderId) {
  var file = document.getElementById(inputId).files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var thumb = document.getElementById(thumbId);
    var preview = document.getElementById(previewId);
    var placeholder = document.getElementById(placeholderId);
    if (thumb) thumb.src = e.target.result;
    if (preview) preview.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// ── PHYSICAL PREVIEW ────────────────────────────────────

// ── STORE TAB SWITCHING ──────────────────────────────────
function storePreviewFilter(type, btn) {
  // Highlight active button
  var header = btn ? btn.closest('div') : null;
  if (header) header.querySelectorAll('button').forEach(function(b){
    b.style.background = 'rgba(255,255,255,0.15)'; b.style.color = '#fff';
  });
  if (btn) { btn.style.background = 'rgba(255,255,255,0.9)'; btn.style.color = '#2C1A0E'; }

  var grid = document.getElementById('store-preview-grid');
  var emptyEl = document.getElementById('store-preview-empty');
  if (!grid) return;
  grid.innerHTML = '';

  // Gather all products
  var allProds = [];
  ['physical','digital','courses'].forEach(function(t) {
    (storeProducts[t] || []).forEach(function(p) { allProds.push({ prod: p, storeType: t }); });
  });
  var filtered = type === 'all' ? allProds : allProds.filter(function(a){ return a.storeType === type; });
  var visible = filtered.filter(function(a){ return !a.prod.hidden; });

  if (visible.length === 0) { if(emptyEl) emptyEl.style.display = 'block'; return; }
  if (emptyEl) emptyEl.style.display = 'none';

  visible.forEach(function(item) {
    var p = item.prod; var t = item.storeType;
    var emoji = t === 'digital' ? '💾' : t === 'courses' ? '🎓' : '📦';
    var imgHTML = p.photo ? '<img src="'+p.photo+'" style="width:100%;height:100%;object-fit:cover;">' : '<span style="font-size:2.2rem;">'+emoji+'</span>';
    var card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);cursor:pointer;transition:transform 0.2s;';
    card.onmouseover = function(){ card.style.transform='translateY(-3px)'; };
    card.onmouseout = function(){ card.style.transform='translateY(0)'; };
    card.innerHTML = '<div style="height:140px;background:#f0ede8;display:flex;align-items:center;justify-content:center;overflow:hidden;">' + imgHTML + '</div>'
      + '<div style="padding:12px;">'
      + '<div style="font-weight:700;font-size:0.85rem;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + p.name + '</div>'
      + '<div style="font-weight:800;color:var(--brown);font-size:0.92rem;margin-bottom:8px;">$' + p.price + '</div>'
      + '<button onclick="toast(\'View details coming on public page\')" style="width:100%;padding:7px;background:var(--brown);color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-weight:700;font-size:0.75rem;">View Details</button>'
      + '</div>';
    grid.appendChild(card);
  });
}

// Open store preview and render all — hooks into openModal via direct call in storePreviewFilter
function openStorePreview() {
  openModal('modal-store-preview');
  storePreviewFilter('all', document.querySelector('#modal-store-preview button'));
}

// ── PUBLISH PRODUCT ──────────────────────────────────────
function storePublishProduct(type) {
  // If we're in edit mode, route to save instead
  if (window._editingProductId && window._editingProductType === (type === 'course' ? 'courses' : type)) {
    storeEditSave(); return;
  }
  var nameMap = { physical: 'ph-name', digital: 'dg-name', course: 'co-cname' };
  var priceMap = { physical: 'ph-price', digital: 'dg-price', course: 'co-price' };
  var descMap  = { physical: 'ph-desc', digital: 'dg-desc', course: 'co-desc' };
  var modalMap = { physical: 'modal-add-physical', digital: 'modal-add-digital', course: 'modal-add-course' };
  var storeType = type === 'course' ? 'courses' : type;

  var nameEl  = document.getElementById(nameMap[type]);
  var priceEl = document.getElementById(priceMap[type]);
  var descEl  = document.getElementById(descMap[type]);
  if (!nameEl || !nameEl.value.trim()) { toast('Please enter a product name'); nameEl && nameEl.focus(); return; }
  if (!priceEl || !priceEl.value) { toast('Please enter a price'); priceEl && priceEl.focus(); return; }

  var name  = nameEl.value.trim();
  var price = parseFloat(priceEl.value).toFixed(2);
  var desc  = descEl ? descEl.value : '';
  var inventory = parseInt((document.getElementById('ph-inventory') || {}).value || -1);
  var lowStock = parseInt((document.getElementById('ph-low-stock') || {}).value || 5);
  var preorder = (document.getElementById('ph-preorder') || {}).checked;
  var mainPhoto = phPhotos[0];
  var sizes = phSizes.slice();
  var colors = phColors.slice();
  var variants = type === 'physical' ? phVariants.slice() : dgVariants.slice();
  var hiddenCb = document.getElementById(type === 'physical' ? 'ph-hidden-toggle' : type === 'digital' ? 'dg-hidden-toggle' : 'co-hidden-toggle');
  var isHidden = hiddenCb && hiddenCb.checked;
  var emoji = type === 'physical' ? '📦' : type === 'digital' ? '💾' : '🎓';
  var id = Date.now();

  storeProducts[storeType].push({ id: id, name: name, price: price, desc: desc, type: type, photo: mainPhoto, sizes: sizes, colors: colors, variants: variants, inventory: inventory, lowStock: lowStock, preorder: preorder, hidden: isHidden });

  var grid = document.getElementById('store-' + storeType + '-grid');
  var emptyEl = document.getElementById('store-' + storeType + '-empty');
  if (grid) {
    var stockHTML = '';
    if (type === 'physical') {
      if (inventory < 0) stockHTML = '<span style="font-size:0.7rem;font-weight:700;color:#16a34a;">● In Stock</span>';
      else if (inventory === 0) stockHTML = preorder ? '<span style="font-size:0.7rem;font-weight:700;color:#7c3aed;">● Pre-Order</span>' : '<span style="font-size:0.7rem;font-weight:700;color:#dc2626;">● Out of Stock</span>';
      else if (inventory <= lowStock) stockHTML = '<span style="font-size:0.7rem;font-weight:700;color:#d97706;">● Low Stock ('+inventory+')</span>';
      else stockHTML = '<span style="font-size:0.7rem;font-weight:700;color:#16a34a;">● In Stock ('+inventory+')</span>';
    }
    var sizesBadge = sizes.length > 0 ? '<div style="font-size:0.68rem;color:var(--text-dim);margin-top:3px;">Sizes: ' + sizes.join(', ') + '</div>' : '';
    var colorDots = colors.length > 0 ? '<div style="display:flex;gap:4px;margin-top:4px;">' + colors.map(function(c){ return '<span title="'+c.name+'" style="width:12px;height:12px;border-radius:50%;background:'+c.hex+';border:1px solid rgba(0,0,0,0.15);"></span>'; }).join('') + '</div>' : '';
    var variantBadge = variants.length > 0 ? '<div style="font-size:0.68rem;color:var(--brown);margin-top:3px;font-weight:600;">' + variants.length + ' variant' + (variants.length>1?'s':'') + '</div>' : '';
    var imgHTML = mainPhoto ? '<img src="'+mainPhoto+'" style="width:100%;height:100%;object-fit:cover;">' : '<span style="font-size:2.5rem;">'+emoji+'</span>';
    var hidBadge = isHidden ? '<span style="font-size:0.65rem;background:#fee2e2;color:#dc2626;padding:2px 7px;border-radius:10px;font-weight:700;margin-left:6px;">Hidden</span>' : '';

    var card = document.createElement('div');
    card.id = 'store-product-' + id;
    card.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden;transition:all 0.2s;opacity:' + (isHidden ? '0.6' : '1') + ';';
    card.innerHTML =
      '<div style="background:var(--cream2);height:140px;display:flex;align-items:center;justify-content:center;overflow:hidden;">' + imgHTML + '</div>' +
      '<div style="padding:14px;">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px;">' +
          '<div data-prod-name style="font-weight:700;font-size:0.92rem;flex:1;">' + name + hidBadge + '</div>' +
          '<div data-prod-price style="font-weight:800;color:var(--brown);font-size:0.95rem;margin-left:8px;">$' + price + '</div>' +
        '</div>' +
        (stockHTML ? '<div style="margin-bottom:4px;">' + stockHTML + '</div>' : '') +
        sizesBadge + colorDots + variantBadge +
        '<div style="display:flex;gap:5px;margin-top:10px;flex-wrap:wrap;">' +
          '<button onclick="storePrevProduct('+id+',\''+storeType+'\')" style="flex:1;padding:8px 0;background:var(--brown);color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;font-weight:700;">👁 Preview</button>' +
          '<button onclick="storeEditProduct('+id+',\''+storeType+'\')" style="padding:8px 10px;background:var(--cream2);color:var(--text-mid);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:0.8rem;" title="Edit">✏️</button>' +
          '<button id="hide-btn-'+id+'" onclick="storeHideProduct('+id+',\''+storeType+'\')" style="padding:7px 9px;background:var(--cream2);border:1px solid var(--border);border-radius:8px;cursor:pointer;" title="' + (isHidden?'Unhide':'Hide') + '">' +
            (isHidden ? '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#dc2626" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>' : '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--text-mid)" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>') +
          '</button>' +
          '<button onclick="storeDeleteProduct('+id+',\''+storeType+'\')" style="padding:7px 9px;background:#fee2e2;border:none;border-radius:8px;cursor:pointer;font-size:0.8rem;" title="Delete">🗑</button>' +
        '</div>' +
      '</div>';
    grid.appendChild(card);
    if (emptyEl) emptyEl.style.display = 'none';
  }

  // Reset physical form state
  if (type === 'physical') {
    phPhotos = [null,null,null,null,null,null];
    phSizes = []; phColors = []; phVariants = [];
    for (var i = 0; i < 6; i++) {
      var slot = document.getElementById('ph-photo-slot-' + i);
      if (slot) {
        if (i === 0) slot.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--brown-light)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Main Photo';
        else slot.innerHTML = '+';
        slot.style.border = '2px dashed var(--border)';
      }
    }
    var sizesDisp = document.getElementById('ph-sizes-display');
    if (sizesDisp) sizesDisp.innerHTML = '';
    var colorsDisp = document.getElementById('ph-colors-display');
    if (colorsDisp) colorsDisp.innerHTML = '';
    var varList = document.getElementById('ph-variants-list');
    if (varList) varList.innerHTML = '';
  }
  if (type === 'digital') { dgVariants = []; var dvList = document.getElementById('dg-variants-list'); if(dvList) dvList.innerHTML = ''; }

  closeModal(modalMap[type]);
  toast('✓ "' + name + '" published to your store!');
  nameEl.value = ''; if (priceEl) priceEl.value = '';
}

var cpdCurrentQty = 1;
function cpdQty(delta) {
  cpdCurrentQty = Math.max(1, cpdCurrentQty + delta);
  var el = document.getElementById('cpd-qty');
  if (el) el.textContent = cpdCurrentQty < 10 ? '0' + cpdCurrentQty : '' + cpdCurrentQty;
}

function storePrevProduct(id, type) {
  var prod = storeProducts[type] ? storeProducts[type].find(function(p){ return p.id === id; }) : null;
  if (!prod) { toast('Product not found'); return; }

  cpdCurrentQty = 1;
  var qtyEl = document.getElementById('cpd-qty');
  if (qtyEl) qtyEl.textContent = '01';

  // Gallery — main image + right thumbnail rail
  var photos = [];
  if (prod.photos && prod.photos.length) photos = prod.photos.filter(Boolean);
  else if (prod.photo) photos = [prod.photo];

  var mainEl = document.getElementById('cpd-main-img');
  var thumbsEl = document.getElementById('cpd-thumbs');
  if (mainEl) {
    if (photos.length) {
      mainEl.style.fontSize = '0';
      mainEl.innerHTML = '<img src="' + photos[0] + '" style="width:100%;height:300px;object-fit:cover;display:block;">';
    } else {
      var emoji = type === 'digital' ? '💾' : type === 'courses' ? '🎓' : '📦';
      mainEl.style.fontSize = '5rem';
      mainEl.innerHTML = emoji;
    }
  }
  if (thumbsEl) {
    thumbsEl.innerHTML = '';
    if (photos.length > 1) {
      photos.forEach(function(src, i) {
        var t = document.createElement('div');
        t.style.cssText = 'width:54px;height:54px;border-radius:10px;overflow:hidden;border:2px solid ' + (i===0?'#C07A50':'#ddd') + ';cursor:pointer;flex-shrink:0;';
        t.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;">';
        t.onclick = function() {
          if (mainEl) mainEl.innerHTML = '<img src="' + src + '" style="width:100%;height:300px;object-fit:cover;display:block;">';
          thumbsEl.querySelectorAll('div').forEach(function(th){ th.style.borderColor='#ddd'; });
          t.style.borderColor = '#C07A50';
        };
        thumbsEl.appendChild(t);
      });
    }
  }

  // Name + price
  var nameEl = document.getElementById('cpd-name');
  if (nameEl) nameEl.textContent = prod.name;
  var priceEl = document.getElementById('cpd-price');
  if (priceEl) priceEl.textContent = '$' + prod.price;

  // Stock badge
  var stockEl = document.getElementById('cpd-stock');
  if (stockEl && type === 'physical') {
    var inv = prod.inventory;
    if (inv < 0) stockEl.innerHTML = '<span style="display:inline-flex;align-items:center;gap:5px;font-size:0.78rem;font-weight:700;color:#16a34a;"><span style="width:8px;height:8px;border-radius:50%;background:#16a34a;"></span>In Stock</span>';
    else if (inv === 0) stockEl.innerHTML = prod.preorder ? '<span style="display:inline-flex;align-items:center;gap:5px;font-size:0.78rem;font-weight:700;color:#7c3aed;"><span style="width:8px;height:8px;border-radius:50%;background:#7c3aed;"></span>Pre-Order Now</span>' : '<span style="display:inline-flex;align-items:center;gap:5px;font-size:0.78rem;font-weight:700;color:#dc2626;"><span style="width:8px;height:8px;border-radius:50%;background:#dc2626;"></span>Out of Stock</span>';
    else if (inv <= (prod.lowStock||5)) stockEl.innerHTML = '<span style="display:inline-flex;align-items:center;gap:5px;font-size:0.78rem;font-weight:700;color:#d97706;"><span style="width:8px;height:8px;border-radius:50%;background:#d97706;"></span>Low Stock — Only ' + inv + ' left</span>';
    else stockEl.innerHTML = '<span style="display:inline-flex;align-items:center;gap:5px;font-size:0.78rem;font-weight:700;color:#16a34a;"><span style="width:8px;height:8px;border-radius:50%;background:#16a34a;"></span>In Stock</span>';
  } else if (stockEl) { stockEl.innerHTML = ''; }

  // Sizes
  var sizesWrap = document.getElementById('cpd-sizes-wrap');
  var sizesEl = document.getElementById('cpd-sizes');
  if (sizesWrap && sizesEl) {
    if (prod.sizes && prod.sizes.length) {
      sizesWrap.style.display = 'block';
      sizesEl.innerHTML = '';
      prod.sizes.forEach(function(s, i) {
        var chip = document.createElement('div');
        chip.textContent = s;
        chip.style.cssText = 'padding:7px 16px;border-radius:10px;border:2px solid ' + (i===0?'#1a1a1a':'#ddd') + ';background:' + (i===0?'#1a1a1a':'#fff') + ';color:' + (i===0?'#fff':'#1a1a1a') + ';font-weight:700;font-size:0.82rem;cursor:pointer;';
        chip.onclick = function() {
          sizesEl.querySelectorAll('div').forEach(function(c){ c.style.background='#fff';c.style.color='#1a1a1a';c.style.borderColor='#ddd'; });
          chip.style.background='#1a1a1a'; chip.style.color='#fff'; chip.style.borderColor='#1a1a1a';
        };
        sizesEl.appendChild(chip);
      });
    } else { sizesWrap.style.display = 'none'; }
  }

  // Colors — show only if colors exist
  var colorsEl = document.getElementById('cpd-colors');
  var colorsWrap = document.getElementById('cpd-colors-wrap');
  if (colorsEl && colorsWrap) {
    colorsEl.innerHTML = '';
    if (prod.colors && prod.colors.length) {
      colorsWrap.style.display = 'block';
      prod.colors.forEach(function(c, i) {
        var dot = document.createElement('div');
        dot.title = c.name;
        dot.style.cssText = 'width:24px;height:24px;border-radius:50%;background:' + c.hex + ';border:' + (i===0?'3px solid #1a1a1a':'2px solid rgba(0,0,0,0.15)') + ';cursor:pointer;';
        dot.onclick = function() {
          colorsEl.querySelectorAll('div').forEach(function(d){ d.style.border='2px solid rgba(0,0,0,0.15)'; });
          dot.style.border = '3px solid #1a1a1a';
        };
        colorsEl.appendChild(dot);
      });
    } else {
      colorsWrap.style.display = 'none';
    }
  }

  // Composition — show only if composition is set
  var compEl = document.getElementById('cpd-composition');
  var compBox = document.getElementById('cpd-composition-box');
  if (compEl && compBox) {
    if (prod.composition && prod.composition.trim()) {
      compEl.textContent = prod.composition.trim();
      compBox.style.display = 'block';
    } else {
      compBox.style.display = 'none';
    }
  }

  // Adjust grid columns based on whether colors exist
  var gridEl = document.getElementById('cpd-bottom-grid');
  if (gridEl) {
    var hasColors = prod.colors && prod.colors.length;
    gridEl.style.gridTemplateColumns = hasColors ? '1fr 1fr 80px' : '1fr 80px';
  }

  // Description
  var descEl = document.getElementById('cpd-desc');
  if (descEl) descEl.textContent = prod.desc || '';

  // Delivery
  var delivMap = { shipped:'📦 Shipped', meetup:'🤝 Meet Up', pickup:'🏪 Local Pickup', delivered:'🚗 Delivered' };
  var delivEl = document.getElementById('cpd-delivery');
  if (delivEl) {
    var delivTxt = prod.delivery ? (delivMap[prod.delivery] || '') : '';
    if (prod.delivery === 'delivered' && prod.deliveryFee) delivTxt += ' — $' + parseFloat(prod.deliveryFee).toFixed(2) + ' delivery fee';
    else if (prod.delivery === 'shipped' && prod.deliveryFee) delivTxt += ' — $' + parseFloat(prod.deliveryFee).toFixed(2) + ' shipping';
    delivEl.textContent = delivTxt;
  }

  // Affiliate banner
  var affEl = document.getElementById('cpd-affiliate');
  if (affEl) {
    if (prod.affiliate && prod.affAmount) {
      var earnStr = prod.affType === 'dollar' ? '$' + parseFloat(prod.affAmount).toFixed(2) : prod.affAmount + '%';
      affEl.textContent = '💰 Affiliates earn ' + earnStr + ' per sale on this product';
      affEl.style.display = 'block';
    } else { affEl.style.display = 'none'; }
  }

  // Edit button wires up
  var editBtn = document.getElementById('cpd-edit-btn');
  if (editBtn) editBtn.onclick = function() { closeModal('modal-creator-product-detail'); storeEditProduct(id, type); };

  openModal('modal-creator-product-detail');
}

function storeEditProduct(id, type) {
  var prod = storeProducts[type] ? storeProducts[type].find(function(p){ return p.id === id; }) : null;
  if (!prod) { toast('Product not found'); return; }

  var modalMap = { physical: 'modal-add-physical', digital: 'modal-add-digital', courses: 'modal-add-course' };
  var modal = modalMap[type];
  if (!modal) return;

  // Store the id so we know we're editing, not creating new
  window._editingProductId = id;
  window._editingProductType = type;

  if (type === 'physical') {
    var n = document.getElementById('ph-name'); if(n) n.value = prod.name || '';
    var p = document.getElementById('ph-price'); if(p) p.value = prod.price || '';
    var d = document.getElementById('ph-desc'); if(d) d.value = prod.desc || '';
    var inv = document.getElementById('ph-inventory'); if(inv) inv.value = prod.inventory >= 0 ? prod.inventory : '';
    var ls = document.getElementById('ph-low-stock'); if(ls) ls.value = prod.lowStock || '';
    // Restore photos
    phPhotos = prod.photos ? prod.photos.slice() : [prod.photo||null,null,null,null,null,null];
    phSizes = prod.sizes ? prod.sizes.slice() : [];
    phColors = prod.colors ? prod.colors.slice() : [];
    phVariants = prod.variants ? prod.variants.slice() : [];
    // Update photo slots
    for (var i = 0; i < 6; i++) {
      var slot = document.getElementById('ph-slot-' + i);
      if (slot && phPhotos[i]) {
        slot.innerHTML = '<img src="'+phPhotos[i]+'" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">';
        slot.style.border = '2px solid var(--brown)';
        slot.style.padding = '0';
      }
    }
  } else if (type === 'digital') {
    var dn = document.getElementById('dg-name'); if(dn) dn.value = prod.name || '';
    var dp = document.getElementById('dg-price'); if(dp) dp.value = prod.price || '';
    var dd = document.getElementById('dg-desc'); if(dd) dd.value = prod.desc || '';
  } else if (type === 'courses') {
    var cn = document.getElementById('co-cname'); if(cn) cn.value = prod.name || '';
    var cp = document.getElementById('co-price'); if(cp) cp.value = prod.price || '';
    var cd = document.getElementById('co-desc'); if(cd) cd.value = prod.desc || '';
  }

  // Change the publish button to say "Save Changes"
  var publishBtn = document.querySelector('#' + modal + ' .btn-save');
  if (publishBtn) {
    publishBtn.textContent = '💾 Save Changes';
    publishBtn.onclick = function() { storeEditSave(); };
  }

  openModal(modal);
}

function storeEditSave() {
  var id = window._editingProductId;
  var type = window._editingProductType;
  if (!id || !type) { storePublishProduct(type || 'physical'); return; }

  var prod = storeProducts[type] ? storeProducts[type].find(function(p){ return p.id === id; }) : null;
  if (!prod) return;

  var nameMap = { physical:'ph-name', digital:'dg-name', courses:'co-cname' };
  var priceMap = { physical:'ph-price', digital:'dg-price', courses:'co-price' };
  var descMap  = { physical:'ph-desc', digital:'dg-desc', courses:'co-desc' };

  var newName = (document.getElementById(nameMap[type])||{}).value;
  var newPrice = (document.getElementById(priceMap[type])||{}).value;
  var newDesc = (document.getElementById(descMap[type])||{}).value;

  if (newName) prod.name = newName.trim();
  if (newPrice) prod.price = parseFloat(newPrice).toFixed(2);
  if (newDesc !== undefined) prod.desc = newDesc;
  if (type === 'physical') {
    var inv = document.getElementById('ph-inventory');
    if (inv && inv.value) prod.inventory = parseInt(inv.value);
    if (phPhotos[0]) { prod.photo = phPhotos[0]; prod.photos = phPhotos.filter(Boolean); }
    if (phSizes.length) prod.sizes = phSizes.slice();
    if (phColors.length) prod.colors = phColors.slice();
    if (phVariants.length) prod.variants = phVariants.slice();
  }

  // Update card name and price
  var card = document.getElementById('store-product-' + id);
  if (card) {
    var nameEl = card.querySelector('[data-prod-name]');
    var priceEl = card.querySelector('[data-prod-price]');
    if (nameEl) nameEl.textContent = prod.name;
    if (priceEl) priceEl.textContent = '$' + prod.price;
  }

  // Reset edit state and restore publish button
  window._editingProductId = null;
  window._editingProductType = null;
  var modalMap = { physical:'modal-add-physical', digital:'modal-add-digital', courses:'modal-add-course' };
  var publishBtn = document.querySelector('#' + modalMap[type] + ' .btn-save');
  if (publishBtn) {
    publishBtn.textContent = type === 'courses' ? '🚀 Publish Course' : '🚀 Publish Product';
    publishBtn.onclick = function() { storePublishProduct(type); };
  }

  var modalId = modalMap[type];
  closeModal(modalId);
  toast('✓ Product updated!');
}

// ── DIGITAL FILE UPLOAD ──────────────────────────────────
function dgFileUploaded(input) {
  var file = input.files[0];
  if (!file) return;
  var info = document.getElementById('dg-file-info');
  var placeholder = document.getElementById('dg-file-placeholder');
  var nameEl = document.getElementById('dg-file-name');
  var sizeEl = document.getElementById('dg-file-size');
  var mb = (file.size / 1024 / 1024).toFixed(2);
  if (nameEl) nameEl.textContent = file.name;
  if (sizeEl) sizeEl.textContent = mb + ' MB';
  if (info) info.style.display = 'block';
  if (placeholder) placeholder.style.display = 'none';
  document.getElementById('dg-file-drop').style.borderColor = 'var(--brown)';
}

// ── VARIANTS ─────────────────────────────────────────────
var phVariants = [];
var dgVariants = [];
function addVariant(prefix) {
  var nameInp = document.getElementById(prefix + '-variant-name-input');
  var priceInp = document.getElementById(prefix + '-variant-price-input');
  var listEl = document.getElementById(prefix + '-variants-list');
  if (!nameInp || !nameInp.value.trim()) { toast('Enter a variant name'); nameInp && nameInp.focus(); return; }
  var name = nameInp.value.trim();
  var price = priceInp && priceInp.value ? parseFloat(priceInp.value).toFixed(2) : null;
  var arr = prefix === 'ph' ? phVariants : dgVariants;
  var vid = Date.now();
  arr.push({ id: vid, name: name, price: price });
  var row = document.createElement('div');
  row.id = prefix + '-variant-' + vid;
  row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid var(--border);border-radius:8px;padding:8px 12px;';
  row.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:0.85rem;font-weight:600;">' + name + '</span>' + (price ? '<span style="font-size:0.8rem;color:var(--brown);font-weight:700;">$' + price + '</span>' : '') + '</div><button onclick="removeVariant(\''+prefix+'\','+vid+',this.parentNode)" style="background:none;border:none;cursor:pointer;color:var(--text-dim);font-size:1rem;">✕</button>';
  if (listEl) listEl.appendChild(row);
  nameInp.value = '';
  if (priceInp) priceInp.value = '';
}
function removeVariant(prefix, vid, row) {
  var arr = prefix === 'ph' ? phVariants : dgVariants;
  if (prefix === 'ph') phVariants = arr.filter(function(v){ return v.id !== vid; });
  else dgVariants = arr.filter(function(v){ return v.id !== vid; });
  if (row) row.remove();
}

function toggleItemHeart(btn) {
  if (!btn) return;
  var isHearted = btn.textContent.trim() === "❤️";
  btn.textContent = isHearted ? "🤍" : "❤️";
  btn.title = isHearted ? "Save to favourites" : "Saved!";
  toast(isHearted ? "Removed from saved" : "❤️ Saved to favourites!");
}

function storeHideProduct(id, type) {
  var prod = storeProducts[type] ? storeProducts[type].find(function(p){ return p.id === id; }) : null;
  var card = document.getElementById('store-product-' + id);
  var btn = document.getElementById('hide-btn-' + id);
  if (!card) return;
  if (prod) prod.hidden = !prod.hidden;
  var nowHidden = prod ? prod.hidden : (card.style.opacity === '0.6');
  card.style.opacity = nowHidden ? '0.6' : '1';
  if (btn) btn.title = nowHidden ? 'Unhide' : 'Hide';
  if (btn) btn.innerHTML = nowHidden
    ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#dc2626" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
    : '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--text-mid)" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  toast(nowHidden ? 'Product hidden from store' : 'Product now visible in store');
}

function storeDeleteProduct(id, type) {
  var card = document.getElementById('store-product-' + id);
  if (card) card.remove();
  if (storeProducts[type]) storeProducts[type] = storeProducts[type].filter(function(p){ return p.id !== id; });
  var grid = document.getElementById('store-' + type + '-grid');
  var emptyEl = document.getElementById('store-' + type + '-empty');
  if (grid && emptyEl && grid.children.length === 0) emptyEl.style.display = 'block';
  toast('Product deleted');
}

// ── LISTINGS ─────────────────────────────────────────────
var listingsData = [];
var lstPhotos = [null, null, null, null];

function listingsTab(tab, btn) {
  var tabs = document.querySelectorAll('[id^="ltab-"]');
  tabs.forEach(function(b){
    b.style.background = 'transparent';
    b.style.color = 'var(--text-dim)';
  });
  if (btn) { btn.style.background = 'var(--brown)'; btn.style.color = '#fff'; }

  var grid = document.getElementById('listings-grid');
  var empty = document.getElementById('listings-empty');
  var refunds = document.getElementById('listings-refunds-content');
  var addBtn = document.getElementById('listings-add-btn');

  if (tab === 'refunds') {
    if (grid) grid.style.display = 'none';
    if (empty) empty.style.display = 'none';
    if (refunds) refunds.style.display = 'block';
    if (addBtn) addBtn.style.display = 'none';
    return;
  }
  if (refunds) refunds.style.display = 'none';
  if (addBtn) addBtn.style.display = 'flex';
  renderListings(tab);
}

function renderListings(filter) {
  var grid = document.getElementById('listings-grid');
  var empty = document.getElementById('listings-empty');
  if (!grid) return;
  grid.style.display = 'grid';
  grid.innerHTML = '';

  var filtered = filter === 'all'
    ? listingsData
    : listingsData.filter(function(l){ return l.cat === filter; });

  if (filtered.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  var ctaLabels = { contact:'Contact', apply:'Apply Now', request:'Request Info', reserve:'Reserve Interest', book:'Book a Viewing', inquire:'Inquire Now' };
  var catEmojis = { realestate:'🏠', cars:'🚗', spaces:'🏢', jobs:'💼', experiences:'✨' };

  filtered.forEach(function(l) {
    var card = document.createElement('div');
    card.id = 'lst-card-' + l.id;
    card.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:box-shadow 0.2s,opacity 0.2s;opacity:' + (l.hidden ? '0.5' : '1') + ';';
    card.onmouseover = function(){ card.style.boxShadow = '0 6px 24px rgba(44,26,14,0.1)'; };
    card.onmouseout = function(){ card.style.boxShadow = 'none'; };

    var imgHTML = l.photo
      ? '<img src="'+l.photo+'" style="width:100%;height:100%;object-fit:cover;">'
      : '<span style="font-size:3rem;">' + (catEmojis[l.cat] || '📋') + '</span>';

    var priceHTML = l.contactPrice
      ? '<span style="font-size:0.8rem;font-weight:700;color:var(--brown);background:var(--brown-bg);padding:3px 9px;border-radius:12px;">Contact for price</span>'
      : '<span style="font-weight:800;color:var(--brown);font-size:1rem;">' + (l.price || '') + '</span>';

    card.innerHTML =
      '<div style="height:175px;background:var(--cream2);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">'
        + imgHTML
        + '<div style="position:absolute;top:10px;left:10px;background:rgba(44,26,14,0.7);color:#fff;font-size:0.65rem;font-weight:700;padding:3px 9px;border-radius:10px;letter-spacing:0.06em;text-transform:uppercase;">' + (catEmojis[l.cat]||'') + ' ' + l.catLabel + '</div>'
      + '</div>'
      + '<div style="padding:16px;">'
        + '<div style="font-weight:800;font-size:0.95rem;margin-bottom:4px;line-height:1.3;">' + l.title + '</div>'
        + '<div style="font-size:0.78rem;color:var(--text-dim);margin-bottom:8px;display:flex;align-items:center;gap:5px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>' + l.location + '</div>'
        + '<div style="margin-bottom:12px;">' + priceHTML + '</div>'
        + '<div style="font-size:0.8rem;color:var(--text-mid);line-height:1.5;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">' + l.desc + '</div>'
        + '<div style="display:flex;gap:7px;flex-wrap:wrap;">'
          + '<button onclick="lstOpenInquiry(' + l.id + ')" style="flex:1;padding:9px;background:linear-gradient(135deg,var(--brown-light),var(--brown-dark));color:#fff;border:none;border-radius:9px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-weight:700;font-size:0.8rem;box-shadow:0 2px 8px rgba(192,122,80,0.3);">' + (ctaLabels[l.cta]||'Contact') + '</button>'
          + '<button onclick="lstPreviewListing(' + l.id + ')" style="padding:9px 12px;background:var(--brown-bg);border:1px solid var(--border);border-radius:9px;cursor:pointer;font-size:0.85rem;" title="Preview">👁</button>'
          + '<button id="lst-hide-btn-' + l.id + '" onclick="lstHideListing(' + l.id + ')" style="padding:9px 12px;background:var(--cream);border:1px solid var(--border);border-radius:9px;cursor:pointer;font-size:0.82rem;font-weight:700;font-family:\'DM Sans\',sans-serif;color:var(--text-mid);" title="' + (l.hidden ? 'Show listing' : 'Hide listing') + '">' + (l.hidden ? '🚫 Hidden' : '👁 Visible') + '</button>'
          + '<button onclick="lstEditListing(' + l.id + ')" style="padding:9px 12px;background:var(--cream);border:1px solid var(--border);border-radius:9px;cursor:pointer;font-size:0.85rem;" title="Edit">✏️</button>'
          + '<button onclick="lstDeleteListing(' + l.id + ')" style="padding:9px 12px;background:#fee2e2;border:none;border-radius:9px;cursor:pointer;font-size:0.85rem;" title="Delete">🗑</button>'
        + '</div>'
      + '</div>';
    grid.appendChild(card);
  });
}

function lstCategoryChange(val) {
  ['realestate','cars','jobs'].forEach(function(t){
    var f = document.getElementById('lst-'+t+'-fields');
    if (f) f.style.display = 'none';
  });
  if (val && document.getElementById('lst-'+val+'-fields')) {
    document.getElementById('lst-'+val+'-fields').style.display = 'block';
  }
}

function lstTriggerPhoto(idx) {
  document.getElementById('lst-photo-' + idx).click();
}
function lstPhotoUploaded(idx, input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    lstPhotos[idx] = e.target.result;
    var slot = document.getElementById('lst-slot-' + idx);
    if (slot) {
      slot.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">';
      slot.style.border = '2px solid var(--brown)';
      slot.style.padding = '0';
    }
  };
  reader.readAsDataURL(file);
}

function lstSendPaymentLink() {
  var to = (document.getElementById('lst-paylink-to')||{}).value;
  var amt = (document.getElementById('lst-paylink-amount')||{}).value;
  if (!to || !amt) { toast('Enter amount and recipient'); return; }
  toast('💳 Payment link for $' + parseFloat(amt).toFixed(2) + ' sent to ' + to);
}
function lstSendDepositLink() {
  var to = (document.getElementById('lst-deposit-to')||{}).value;
  var amt = (document.getElementById('lst-deposit-amount')||{}).value;
  if (!to || !amt) { toast('Enter amount and recipient'); return; }
  toast('🔒 Deposit link for $' + parseFloat(amt).toFixed(2) + ' sent to ' + to);
}

function lstPublish() {
  var title = (document.getElementById('lst-title')||{}).value||'';
  var catSel = document.getElementById('lst-category');
  var cta = (document.getElementById('lst-cta')||{}).value||'contact';
  var price = (document.getElementById('lst-price')||{}).value||'';
  var contactPrice = (document.getElementById('lst-contact-price')||{}).checked;
  var location = (document.getElementById('lst-location')||{}).value||'';
  var desc = (document.getElementById('lst-desc')||{}).value||'';

  if (!title.trim()) { toast('Please enter a listing title'); return; }
  if (!catSel || !catSel.value) { toast('Please select a category'); return; }
  if (!location.trim()) { toast('Please enter a location'); return; }
  if (!desc.trim()) { toast('Please enter a description'); return; }

  var catVal = catSel.value;
  var catLabel = catSel.options[catSel.selectedIndex].text.replace(/^[^\w]*/, '').trim();
  var id = Date.now();

  listingsData.push({
    id: id, title: title.trim(), cat: catVal, catLabel: catLabel,
    cta: cta, price: price, contactPrice: contactPrice,
    location: location.trim(), desc: desc.trim(),
    photo: lstPhotos[0], photo1: lstPhotos[1], photo2: lstPhotos[2], photo3: lstPhotos[3],
    // Real estate
    beds:  (document.getElementById('lst-beds')  ||{}).value || '',
    baths: (document.getElementById('lst-baths') ||{}).value || '',
    sqft:  (document.getElementById('lst-sqft')  ||{}).value || '',
    // Cars
    year:    (document.getElementById('lst-year')    ||{}).value || '',
    make:    (document.getElementById('lst-make')    ||{}).value || '',
    mileage: (document.getElementById('lst-mileage') ||{}).value || '',
    // Jobs
    pay:      (document.getElementById('lst-pay')      ||{}).value || '',
    worktype: (document.getElementById('lst-worktype') ||{}).value || ''
  });
  lsPersistListings();

  // Reset form
  ['lst-title','lst-price','lst-location','lst-desc'].forEach(function(fid){
    var el = document.getElementById(fid); if(el) el.value='';
  });
  lstPhotos = [null,null,null,null];
  for (var i = 0; i < 4; i++) {
    var slot = document.getElementById('lst-slot-' + i);
    if (slot) {
      slot.innerHTML = i === 0 ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--brown-light)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Main' : '+';
      slot.style.border = '2px dashed var(--border)'; slot.style.padding = '';
    }
  }

  closeModal('modal-add-listing');
  renderListings('all');
  // Switch to All tab
  var allBtn = document.getElementById('ltab-all');
  if (allBtn) listingsTab('all', allBtn);
  toast('✓ Listing "' + title + '" published!');
}

function lstOpenInquiry(id) {
  var l = listingsData.find(function(x){ return x.id === id; });
  if (!l) return;
  var ctaLabels = { contact:'Contact', apply:'Apply Now', request:'Request Info', reserve:'Reserve Interest', book:'Book a Viewing', inquire:'Inquire Now' };
  var titleEl = document.getElementById('lst-inquiry-title');
  var nameEl = document.getElementById('lst-inquiry-listing-name');
  if (titleEl) titleEl.textContent = ctaLabels[l.cta] || 'Contact';
  if (nameEl) nameEl.textContent = l.title;

  // Always reset to form step
  var formStep = document.getElementById('lst-inq-form-step');
  var sentStep = document.getElementById('lst-inq-sent-step');
  if (formStep) formStep.style.display = 'block';
  if (sentStep) sentStep.style.display = 'none';

  // Clear fields
  ['lst-inq-name','lst-inq-email','lst-inq-phone','lst-inq-message','lst-paylink-amount','lst-paylink-to','lst-deposit-amount','lst-deposit-to'].forEach(function(fid){
    var el = document.getElementById(fid); if(el) el.value='';
  });

  openModal('modal-listing-inquiry');
}
function lstSubmitInquiry() {
  var name = (document.getElementById('lst-inq-name')||{}).value||'';
  var email = (document.getElementById('lst-inq-email')||{}).value||'';
  if (!name.trim()) { toast('Please enter your name'); return; }
  if (!email.trim()) { toast('Please enter your email'); return; }

  // Hide the form step, show the post-inquiry step
  var formStep = document.getElementById('lst-inq-form-step');
  var sentStep = document.getElementById('lst-inq-sent-step');
  if (formStep) formStep.style.display = 'none';
  if (sentStep) sentStep.style.display = 'block';

  // Pre-fill send-to fields with the customer's contact info
  var contact = email || (document.getElementById('lst-inq-phone')||{}).value || '';
  var payTo = document.getElementById('lst-paylink-to');
  var depTo = document.getElementById('lst-deposit-to');
  if (payTo && !payTo.value) payTo.value = contact;
  if (depTo && !depTo.value) depTo.value = contact;
}

function lstPreviewListing(id) {
  var l = listingsData.find(function(x){ return x.id === id; });
  if (!l) return;
  var ctaLabels = { contact:'Contact', apply:'Apply Now', request:'Request Info', reserve:'Reserve Interest', book:'Book a Viewing', inquire:'Inquire Now' };
  var catEmojis = { realestate:'🏠', cars:'🚗', spaces:'🏢', jobs:'💼', experiences:'✨' };

  // Build image gallery
  var photos = [l.photo, l.photo1, l.photo2, l.photo3].filter(Boolean);
  var mainImg = photos.length
    ? '<img src="'+photos[0]+'" id="lpv-main-img" style="width:100%;height:100%;object-fit:cover;">'
    : '<div id="lpv-main-img" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:4rem;">' + (catEmojis[l.cat]||'📋') + '</div>';

  var thumbsHTML = photos.length > 1
    ? photos.map(function(src, i){
        return '<div onclick="lpvSetMain(\''+src+'\')" style="width:60px;height:60px;border-radius:8px;overflow:hidden;border:2px solid '+(i===0?'var(--brown)':'var(--border)')+';cursor:pointer;flex-shrink:0;"><img src="'+src+'" style="width:100%;height:100%;object-fit:cover;"></div>';
      }).join('')
    : '';

  var priceHTML = l.contactPrice
    ? '<span style="font-size:0.88rem;font-weight:700;color:var(--brown);background:var(--brown-bg);padding:4px 12px;border-radius:12px;">Contact for price</span>'
    : '<span style="font-weight:800;font-size:1.2rem;color:var(--text);">' + (l.price||'') + '</span>';

  // Extra details badges
  var extras = [];
  if (l.beds)    extras.push('🛏 ' + l.beds + ' bed' + (l.beds>1?'s':''));
  if (l.baths)   extras.push('🚿 ' + l.baths + ' bath' + (l.baths>1?'s':''));
  if (l.sqft)    extras.push('📐 ' + l.sqft + ' sq ft');
  if (l.year)    extras.push('📅 ' + l.year);
  if (l.make)    extras.push('🚗 ' + l.make);
  if (l.mileage) extras.push('🛣 ' + l.mileage);
  if (l.pay)     extras.push('💰 ' + l.pay);
  if (l.worktype)extras.push('⏱ ' + l.worktype);
  var extrasHTML = extras.length
    ? '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">'
        + extras.map(function(e){ return '<span style="padding:5px 12px;background:var(--cream);border:1px solid var(--border);border-radius:20px;font-size:0.78rem;font-weight:600;color:var(--text-mid);">'+e+'</span>'; }).join('')
      + '</div>'
    : '';

  var el = document.getElementById('modal-listing-preview');
  if (!el) return;

  el.querySelector('#lpv-gallery-main').innerHTML = mainImg;
  el.querySelector('#lpv-thumbs-row').innerHTML   = thumbsHTML;
  el.querySelector('#lpv-category-badge').textContent = (catEmojis[l.cat]||'') + ' ' + (l.catLabel||'');
  el.querySelector('#lpv-title').textContent      = l.title;
  el.querySelector('#lpv-location').textContent   = l.location;
  el.querySelector('#lpv-price-row').innerHTML    = priceHTML;
  el.querySelector('#lpv-extras').innerHTML       = extrasHTML;
  el.querySelector('#lpv-desc').textContent       = l.desc;
  el.querySelector('#lpv-cta-btn').textContent    = ctaLabels[l.cta] || 'Contact';
  el.querySelector('#lpv-cta-btn').onclick        = function(){ closeModal('modal-listing-preview'); lstOpenInquiry(id); };
  el.querySelector('#lpv-edit-btn').onclick       = function(){ closeModal('modal-listing-preview'); lstEditListing(id); };
  openModal('modal-listing-preview');
}

function lpvSetMain(src) {
  var el = document.getElementById('lpv-gallery-main');
  if (el) el.innerHTML = '<img src="'+src+'" id="lpv-main-img" style="width:100%;height:100%;object-fit:cover;">';
  // Highlight active thumb
  var thumbs = document.querySelectorAll('#lpv-thumbs-row div');
  thumbs.forEach(function(t){ t.style.borderColor = 'var(--border)'; });
}

function lstEditListing(id) {
  var l = listingsData.find(function(x){ return x.id === id; });
  if (!l) return;

  // Populate edit modal
  document.getElementById('lst-edit-id').value       = id;
  document.getElementById('lst-edit-title').value    = l.title || '';
  document.getElementById('lst-edit-price').value    = l.price || '';
  document.getElementById('lst-edit-location').value = l.location || '';
  document.getElementById('lst-edit-desc').value     = l.desc || '';
  document.getElementById('lst-edit-cta').value      = l.cta || 'contact';

  var cpCb = document.getElementById('lst-edit-contact-price');
  if (cpCb) { cpCb.checked = !!l.contactPrice; document.getElementById('lst-edit-price').disabled = !!l.contactPrice; }

  // Show current main photo
  var photoWrap = document.getElementById('lst-edit-photo-preview');
  if (photoWrap) {
    photoWrap.innerHTML = l.photo
      ? '<img src="'+l.photo+'" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;">'
      : '<div style="font-size:0.78rem;color:var(--text-dim);margin-bottom:8px;">No photo uploaded</div>';
  }
  openModal('modal-edit-listing');
}

function lstSaveEdit() {
  var id  = parseInt(document.getElementById('lst-edit-id').value);
  var l   = listingsData.find(function(x){ return x.id === id; });
  if (!l) return;

  l.title    = document.getElementById('lst-edit-title').value.trim()    || l.title;
  l.price    = document.getElementById('lst-edit-price').value.trim()    || l.price;
  l.location = document.getElementById('lst-edit-location').value.trim() || l.location;
  l.desc     = document.getElementById('lst-edit-desc').value.trim()     || l.desc;
  l.cta      = document.getElementById('lst-edit-cta').value             || l.cta;
  l.contactPrice = document.getElementById('lst-edit-contact-price').checked;

  // New photo
  var newPhoto = document.getElementById('lst-edit-photo-input');
  if (newPhoto && newPhoto.files && newPhoto.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      l.photo = e.target.result;
      renderListings('all');
    };
    reader.readAsDataURL(newPhoto.files[0]);
  } else {
    renderListings('all');
  }

  closeModal('modal-edit-listing');
  lsPersistListings();
  toast('✓ Listing updated!');
}
function lstHideListing(id) {
  var l = listingsData.find(function(x){ return x.id === id; });
  if (!l) return;
  l.hidden = !l.hidden;

  // Update card opacity
  var card = document.getElementById('lst-card-' + id);
  if (card) card.style.opacity = l.hidden ? '0.5' : '1';

  // Update button label
  var btn = document.getElementById('lst-hide-btn-' + id);
  if (btn) {
    btn.textContent = l.hidden ? '🚫 Hidden' : '👁 Visible';
    btn.title = l.hidden ? 'Show listing' : 'Hide listing';
  }

  toast(l.hidden ? 'Listing hidden from public' : 'Listing is now visible');
  lsPersistListings();
}

function lstFormatPrice(input) {
  var val = input.value;
  // Remove all leading $ signs first to avoid doubling
  val = val.replace(/^\$+/, '');
  // Only prepend $ if there's actual content and it doesn't start with $
  if (val.length > 0) {
    input.value = '$' + val;
  }
}

function lstDeleteListing(id) {
  listingsData = listingsData.filter(function(l){ return l.id !== id; });
  lsPersistListings();
  renderListings('all');
  toast('Listing deleted');
}

// ── REFUNDS ──────────────────────────────────────────────
var refundHistory = [];
function issueRefund() {
  var client = (document.getElementById('refund-client')||{}).value||'';
  var amount = (document.getElementById('refund-amount')||{}).value||'';
  var reason = (document.getElementById('refund-reason')||{}).value||'';
  if (!client || !amount) { toast('Enter client and amount'); return; }
  var id = Date.now();
  var dateStr = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  refundHistory.unshift({ id:id, client:client, amount:parseFloat(amount).toFixed(2), reason:reason||'—', date:dateStr });

  var list = document.getElementById('refund-history-list');
  if (list) {
    list.innerHTML = '';
    refundHistory.forEach(function(r) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--cream2);gap:12px;flex-wrap:wrap;';
      row.innerHTML = '<div style="flex:1;min-width:0;">'
        + '<div style="font-weight:700;font-size:0.88rem;">' + r.client + '</div>'
        + '<div style="font-size:0.75rem;color:var(--text-dim);">' + r.reason + ' · ' + r.date + '</div>'
        + '</div>'
        + '<span style="font-weight:800;color:#dc2626;font-size:0.95rem;">−$' + r.amount + '</span>'
        + '<span style="font-size:0.68rem;background:#fee2e2;color:#dc2626;padding:3px 8px;border-radius:8px;font-weight:700;white-space:nowrap;">Refunded</span>';
      list.appendChild(row);
    });
  }

  toast('✓ Refund of $' + parseFloat(amount).toFixed(2) + ' processed for ' + client);
  ['refund-client','refund-amount','refund-reason','refund-ref'].forEach(function(fid){
    var el = document.getElementById(fid); if(el) el.value='';
  });
}


function closeVideoPlayer() {
  var modal=document.getElementById('video-player-modal');
  var player=document.getElementById('video-player-el');
  if(player){player.pause();player.src='';}
  if(modal) modal.classList.remove('open');
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

// Documents system
// signedDocuments defined in collab system above
function buildNDAText(name,date){return 'NON-DISCLOSURE AGREEMENT\n\nEntered into as of '+date.toLocaleDateString()+' between You (MASSED User) and '+name+'.\n\nBoth parties agree to keep all shared Confidential Information strictly private and not disclose it to any third party. This covers business strategies, creative works, personal brand assets, financial data, and all proprietary information shared during the collaboration.\n\nThis document has been digitally signed by both parties within the MASSED platform and shall serve as a legally binding agreement.\n\nParty A (You): Signed '+date.toLocaleDateString()+'\nParty B ('+name+'): Signed '+date.toLocaleDateString();}
function populateDocFilter(){var sel=document.getElementById('doc-filter-name');if(!sel)return;var existing=Array.from(sel.options).map(function(o){return o.value;});signedDocuments.forEach(function(d){if(!existing.includes(d.collaborator)){var opt=document.createElement('option');opt.value=d.collaborator;opt.textContent=d.collaborator;sel.appendChild(opt);}});}
function renderDocs(){populateDocFilter();filterDocs();}
function filterDocs(){var search=document.getElementById('doc-search')?document.getElementById('doc-search').value.toLowerCase():'';var nameFilter=document.getElementById('doc-filter-name')?document.getElementById('doc-filter-name').value:'';var filtered=signedDocuments.filter(function(d){var ms=!search||d.collaborator.toLowerCase().includes(search)||d.dateSigned.toLocaleDateString().includes(search);var mn=!nameFilter||d.collaborator===nameFilter;return ms&&mn;});var list=document.getElementById('docs-list');if(!list)return;if(filtered.length===0){list.innerHTML=signedDocuments.length===0?'<div style="text-align:center;padding:48px 20px;color:var(--text-dim);"><div style="font-size:2.5rem;margin-bottom:12px;">📁</div><div style="font-weight:700;font-size:0.9rem;margin-bottom:6px;">No documents yet</div><div style="font-size:0.78rem;">When both parties sign an NDA it will automatically appear here.</div></div>':'<div style="text-align:center;padding:32px;color:var(--text-dim);font-size:0.85rem;">No documents match your search.</div>';return;}list.innerHTML=filtered.map(function(d){return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:12px;"><div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;border-radius:10px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">📄</div><div style="flex:1;min-width:0;"><div style="font-weight:800;font-size:0.9rem;">'+d.type+' — '+d.collaborator+'</div><div style="display:flex;align-items:center;gap:8px;margin-top:3px;flex-wrap:wrap;"><span style="font-size:0.72rem;color:var(--text-dim);">Signed '+d.dateSigned.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})+'</span><span style="font-size:0.65rem;background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:10px;font-weight:700;">✓ '+d.status+'</span></div></div><div style="display:flex;gap:8px;flex-shrink:0;"><button onclick="viewDoc('+d.id+')" style="padding:7px 12px;background:var(--brown-bg);color:var(--brown);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:0.75rem;font-weight:700;">View</button><button onclick="downloadDoc('+d.id+')" style="padding:7px 12px;background:var(--brown);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.75rem;font-weight:700;">⬇ Save</button></div></div></div>';}).join('');}
function viewDoc(id){var doc=signedDocuments.find(function(d){return d.id===id;});if(!doc)return;var w=window.open('','_blank','width=700,height=600');if(!w){toast('Please allow popups to view the document');return;}w.document.write('<html><head><title>'+doc.type+' — '+doc.collaborator+'</title><style>body{font-family:Georgia,serif;padding:40px;max-width:640px;margin:0 auto;line-height:1.8;color:#222;}h1{font-size:1.4rem;text-align:center;margin-bottom:30px;}pre{white-space:pre-wrap;font-family:Georgia,serif;}</style></head><body><h1>'+doc.type+'</h1><pre>'+doc.content+'</pre></body></html>');w.document.close();}
function downloadDoc(id){var doc=signedDocuments.find(function(d){return d.id===id;});if(!doc)return;var blob=new Blob([doc.content],{type:'text/plain'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=doc.type+'_'+doc.collaborator.replace(/\\s/g,'_')+'_'+doc.dateSigned.toISOString().slice(0,10)+'.txt';a.click();toast('✓ Document downloaded!');}

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

function submitSupportTicket() {
  var subject = document.getElementById('support-subject');
  var message = document.getElementById('support-message');
  var email = document.getElementById('support-email');
  if (!subject || !subject.value) { toast('Please select a subject'); return; }
  if (!message || !message.value.trim()) { toast('Please enter a message'); return; }
  if (!email || !email.value.trim()) { toast('Please enter your email'); return; }
  closeModal('modal-contact-support');
  if (subject) subject.value = '';
  if (message) message.value = '';
  if (email) email.value = '';
  toast('✓ Support message sent! We will reply within 24-48 hours.');
}


// Nav patch + map tooltips set up in boot sequence below


// ── WEB LINKS ──────────────────────────────────────────────────────────────────
var webLinks = [];
var wlIdCounter = 1;

function addWebLink() {
  openModal('modal-add-weblink');
}

function wlValidateUrl(input) {
  var val = input.value.trim();
  var errorId = input.id === 'wl-url-input' ? 'wl-url-error' : 'wl-edit-url-error';
  var errEl = document.getElementById(errorId);
  var isValid = val === '' || /^https?:\/\/.+\..+/.test(val);
  if (input.style) input.style.borderColor = val && !isValid ? '#dc2626' : 'var(--border)';
  if (errEl) errEl.style.display = val && !isValid ? 'block' : 'none';
  return isValid && val !== '';
}

function previewWLImage(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    document.getElementById('wl-img-thumb').src = ev.target.result;
    document.getElementById('wl-img-preview').style.display = 'block';
    document.getElementById('wl-img-placeholder').style.display = 'none';
    window._wlPendingCover = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function previewWLEditImage(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    document.getElementById('wl-edit-img-thumb').src = ev.target.result;
    document.getElementById('wl-edit-img-preview').style.display = 'block';
    document.getElementById('wl-edit-img-placeholder').style.display = 'none';
    window._wlEditPendingCover = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function saveWebLink() {
  var urlInput = document.getElementById('wl-url-input');
  var titleInput = document.getElementById('wl-title-input');
  var url = urlInput ? urlInput.value.trim() : '';

  // Strict URL validation
  if (!url) { toast('Please enter a URL'); urlInput && urlInput.focus(); return; }
  if (!/^https?:\/\//i.test(url)) {
    // Auto-prepend https:// and validate
    url = 'https://' + url;
    if (urlInput) urlInput.value = url;
  }
  if (!/^https?:\/\/.+\..+/i.test(url)) {
    var errEl = document.getElementById('wl-url-error');
    if (errEl) errEl.style.display = 'block';
    if (urlInput) urlInput.style.borderColor = '#dc2626';
    toast('Please enter a valid URL (e.g. https://yourwebsite.com)');
    return;
  }

  var title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : '';
  if (!title) { toast('Please enter a title for this link'); titleInput && titleInput.focus(); return; }

  var subtitleInput = document.getElementById('wl-subtitle-input');
  var subtitle = subtitleInput ? subtitleInput.value.trim() : '';

  var domain = '';
  try { domain = new URL(url).hostname.replace('www.',''); } catch(e) { domain = url; }

  var link = { id: wlIdCounter++, url: url, title: title, subtitle: subtitle, visible: true, cover: window._wlPendingCover || null };
  webLinks.push(link);

  if (urlInput) { urlInput.value = ''; urlInput.style.borderColor = 'var(--border)'; }
  if (titleInput) titleInput.value = '';
  var subtitleClear = document.getElementById('wl-subtitle-input');
  if (subtitleClear) subtitleClear.value = '';
  window._wlPendingCover = null;
  var prev = document.getElementById('wl-img-preview');
  var placeholder = document.getElementById('wl-img-placeholder');
  if (prev) prev.style.display = 'none';
  if (placeholder) placeholder.style.display = 'block';
  var errEl = document.getElementById('wl-url-error');
  if (errEl) errEl.style.display = 'none';

  closeModal('modal-add-weblink');
  renderWebLinks();
  toast('✓ Link added!');
}

function openEditWebLink(id) {
  var link = webLinks.find(function(l){ return l.id === id; });
  if (!link) return;
  document.getElementById('wl-edit-id').value = id;
  document.getElementById('wl-edit-url').value = link.url || '';
  document.getElementById('wl-edit-title').value = link.title || '';
  var editSubEl = document.getElementById('wl-edit-subtitle');
  if (editSubEl) editSubEl.value = link.subtitle || '';
  // Reset image preview
  var prev = document.getElementById('wl-edit-img-preview');
  var placeholder = document.getElementById('wl-edit-img-placeholder');
  if (link.cover) {
    document.getElementById('wl-edit-img-thumb').src = link.cover;
    if (prev) prev.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
  } else {
    if (prev) prev.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
  }
  window._wlEditPendingCover = null;
  openModal('modal-edit-weblink');
}

function saveEditWebLink() {
  var id = parseInt(document.getElementById('wl-edit-id').value);
  var link = webLinks.find(function(l){ return l.id === id; });
  if (!link) return;

  var url = (document.getElementById('wl-edit-url').value || '').trim();
  var title = (document.getElementById('wl-edit-title').value || '').trim();

  if (!url) { toast('Please enter a URL'); return; }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  if (!/^https?:\/\/.+\..+/i.test(url)) {
    document.getElementById('wl-edit-url-error').style.display = 'block';
    toast('Please enter a valid URL');
    return;
  }
  if (!title) { toast('Please enter a title'); return; }

  link.url = url;
  link.title = title;
  var editSub = document.getElementById('wl-edit-subtitle');
  if (editSub) link.subtitle = editSub.value.trim();
  if (window._wlEditPendingCover) link.cover = window._wlEditPendingCover;
  window._wlEditPendingCover = null;

  closeModal('modal-edit-weblink');
  renderWebLinks();
  toast('✓ Link updated!');
}

function deleteWebLink(id) {
  webLinks = webLinks.filter(function(l){ return l.id !== id; });
  renderWebLinks();
  toast('Link removed');
}

function toggleWebLinkVisibility(id) {
  var link = webLinks.find(function(l){ return l.id === id; });
  if (link) {
    link.visible = !link.visible;
    renderWebLinks();
    toast(link.visible ? '✓ Link visible on your page' : 'Link hidden from your page');
  }
}

function editWebLinkTitle(id, val) {
  var link = webLinks.find(function(l){ return l.id === id; });
  if (link) link.title = val;
}

function editWebLinkSubtitle(id, val) {
  var link = webLinks.find(function(l){ return l.id === id; });
  if (link) link.subtitle = val;
}

function renderWebLinks() {
  var list = document.getElementById('wl-links-list');
  var empty = document.getElementById('wl-empty');
  if (!list) return;
  if (webLinks.length === 0) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  var html = '';

  for (var i = 0; i < webLinks.length; i++) {
    var link = webLinks[i];
    var id = link.id;
    var domain = '';
    try { domain = new URL(link.url).hostname.replace('www.',''); } catch(e) { domain = link.url; }
    var opacity = link.visible ? '1' : '0.6';

    // ── CARD SHELL ─────────────────────────────────────────────────────────────
    // Matches screenshot: rounded 20px card, white bg, shadow, no overflow clip on outer
    html += '<div data-wl-card="'+id+'" style="position:relative;border-radius:20px;background:#f5ede8;box-shadow:0 4px 20px rgba(0,0,0,0.10);opacity:'+opacity+';transition:box-shadow 0.22s,transform 0.22s;cursor:default;" onmouseover="this.style.boxShadow=\'0 10px 36px rgba(0,0,0,0.16)\';this.style.transform=\'translateY(-3px)\'" onmouseout="this.style.boxShadow=\'0 4px 20px rgba(0,0,0,0.10)\';this.style.transform=\'none\'">';

    // ── PHOTO (full-bleed, ~195px tall, rounded top corners) ───────────────────
    if (link.cover) {
      html += '<div style="height:195px;overflow:hidden;position:relative;border-radius:20px 20px 0 0;">'
        + '<img src="'+link.cover+'" style="width:100%;height:100%;object-fit:cover;display:block;">'
        + '</div>';
    } else {
      html += '<div style="height:195px;background:linear-gradient(145deg,#b8c2d0 0%,#8e9db4 50%,#6b7e96 100%);position:relative;border-radius:20px 20px 0 0;display:flex;align-items:center;justify-content:center;">'
        + '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>'
        + '</div>';
    }

    // ── OVERLAY ACTION ICONS (top-right of photo) ──────────────────────────────
    // Positioned absolutely over the photo — semi-transparent pill
    html += '<div style="position:absolute;top:12px;right:12px;display:flex;gap:4px;z-index:10;">';
    // Visibility toggle
    html += '<button class="wl-action-btn" title="'+(link.visible?'Hide from page':'Show on page')+'" data-wl-vis="'+id+'" style="width:30px;height:30px;background:rgba(255,255,255,0.88);border-radius:50%;box-shadow:0 1px 6px rgba(0,0,0,0.15);color:'+(link.visible?'#C07A50':'#999')+';">'
      + (link.visible
          ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
          : '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>')
      + '</button>';
    // Share
    html += '<button class="wl-action-btn" title="Copy link" data-wl-share="'+link.url.replace(/"/g,'&quot;')+'" style="width:30px;height:30px;background:rgba(255,255,255,0.88);border-radius:50%;box-shadow:0 1px 6px rgba(0,0,0,0.15);">'
      + '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
      + '</button>';
    // Edit
    html += '<button class="wl-action-btn" title="Edit" data-wl-edit="'+id+'" style="width:30px;height:30px;background:rgba(255,255,255,0.88);border-radius:50%;box-shadow:0 1px 6px rgba(0,0,0,0.15);">'
      + '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
      + '</button>';
    // Delete
    html += '<button class="wl-action-btn" title="Delete" data-wl-delete="'+id+'" style="width:30px;height:30px;background:rgba(255,255,255,0.88);border-radius:50%;box-shadow:0 1px 6px rgba(0,0,0,0.15);color:#ef4444;">'
      + '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>'
      + '</button>';
    html += '</div>'; // end overlay icons

    // ── WHITE BUBBLE PANEL — inset from card edges, floats over photo bottom ──
    // Matches Image 2: bubble has margin left/right/bottom, fully rounded corners,
    // overlaps the photo by pulling up with negative margin-top
    html += '<div style="padding:0 10px 12px;">'  // outer wrapper gives left/right/bottom inset
      + '<div style="background:#fff;border-radius:16px;padding:16px 18px 18px;box-shadow:0 4px 20px rgba(0,0,0,0.12);margin-top:-32px;position:relative;">';

    // Title — bold serif, 2-line clamp
    html += '<div style="font-family:\'DM Serif Display\',Georgia,serif;font-size:1.02rem;font-weight:700;color:#111;line-height:1.38;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">'
      + (link.title || domain)
      + '</div>';

    // Description — gray, 2-line clamp
    html += '<div style="font-size:0.8rem;color:#888;line-height:1.6;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">'
      + (link.subtitle || ('Visit ' + domain))
      + '</div>';

    // Learn More row
    html += '<span data-wl-preview="'+link.url.replace(/"/g,'&quot;')+'" style="display:inline-flex;align-items:center;gap:5px;font-size:0.85rem;font-weight:700;color:#111;cursor:pointer;" onmouseover="this.style.color=\'#C07A50\'" onmouseout="this.style.color=\'#111\'">'
      + 'Learn More'
      + '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>'
      + '</span>';

    html += '</div>'; // end bubble inner
    html += '</div>'; // end bubble wrapper
    html += '</div>'; // end card
  } // end for loop

  list.innerHTML = html;

  // ── DELEGATED CLICK HANDLER ────────────────────────────────────────────────
  list.onclick = function(e) {
    // "Learn More" span or any element with data-wl-preview
    var prev = e.target.closest('[data-wl-preview]');
    if (prev && prev.dataset.wlPreview) {
      window.open(prev.dataset.wlPreview, '_blank', 'noopener');
      return;
    }
    var btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.wlShare) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(btn.dataset.wlShare).then(function(){ toast('✓ Link copied to clipboard!'); });
      } else {
        // Fallback for Android WebView
        var ta = document.createElement('textarea');
        ta.value = btn.dataset.wlShare;
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        toast('✓ Link copied!');
      }
    }
    if (btn.dataset.wlPreview) { window.open(btn.dataset.wlPreview, '_blank', 'noopener'); }
    if (btn.dataset.wlDelete)  { deleteWebLink(parseInt(btn.dataset.wlDelete)); }
    if (btn.dataset.wlVis)     { toggleWebLinkVisibility(parseInt(btn.dataset.wlVis)); }
    if (btn.dataset.wlEdit)    { openEditWebLink(parseInt(btn.dataset.wlEdit)); }
  };
}

// ── BOOKING ────────────────────────────────────────────────────────────────────
var bookingServices = [
  { id:1, name:'Classic Haircut', price:45, duration:'1 hour', category:'Hair', desc:'Precision cut tailored to your style.', deposit:true, depositAmt:15, depositType:'Fixed amount', cover:null, visible:true },
  { id:2, name:'Full Set Lashes', price:120, duration:'2 hours', category:'Beauty', desc:'Volume lash set with premium extensions.', deposit:true, depositAmt:30, depositType:'Fixed amount', cover:null, visible:true },
  { id:3, name:'Deep Tissue Massage', price:90, duration:'1 hour', category:'Wellness', desc:'60-minute deep tissue massage.', deposit:false, depositAmt:0, depositType:'Fixed amount', cover:null, visible:true },
  { id:4, name:'Brand Consultation', price:150, duration:'1.5 hours', category:'Consulting', desc:'1-on-1 brand strategy session.', deposit:true, depositAmt:50, depositType:'Fixed amount', cover:null, visible:true },
];
var bkServiceIdCounter = 10;
var activeBookingCat = 'all';
var bookCurrentMonth = new Date().getMonth();
var bookCurrentYear = new Date().getFullYear();
var bookSelectedDay = null;
var bookSelectedTime = null;
var currentBookingService = null;
var bookingTimes = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];

function toggleBookingLive(cb) {
  var track = document.getElementById('booking-live-track');
  var thumb = document.getElementById('booking-live-thumb');
  if (cb.checked) {
    track.style.background = 'var(--brown)';
    thumb.style.left = '26px';
    toast('✓ Booking page is live!');
  } else {
    track.style.background = '#e5e7eb';
    thumb.style.left = '3px';
    toast('Booking page hidden from your profile');
  }
}

function svcCategoryChange(val) {
  var wrap = document.getElementById('svc-class-type-wrap');
  var sel = document.getElementById('svc-class-type');
  if (wrap) wrap.style.display = val === 'Classes' ? 'block' : 'none';
  if (sel) { sel.onchange = function() {
    var gf = document.getElementById('svc-group-fields');
    if (gf) gf.style.display = sel.value === 'group' ? 'block' : 'none';
  }; }
}

function toggleDepositField(cb) {
  var field = document.getElementById('svc-deposit-field');
  var track = document.getElementById('svc-deposit-track');
  var thumb = document.getElementById('svc-deposit-thumb');
  field.style.display = cb.checked ? 'block' : 'none';
  track.style.background = cb.checked ? 'var(--brown)' : '#e5e7eb';
  thumb.style.left = cb.checked ? '23px' : '3px';
}

var svcPhotos = [null,null,null,null,null,null];

function svcTriggerPhoto(idx) {
  document.getElementById('svc-photo-' + idx).click();
}
function svcPhotoUploaded(idx, input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    svcPhotos[idx] = e.target.result;
    var slot = document.getElementById('svc-slot-' + idx);
    if (slot) {
      slot.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">';
      slot.style.border = '2px solid var(--brown)';
      slot.style.padding = '0';
    }
  };
  reader.readAsDataURL(file);
}

function previewService(id) {
  var svc = bookingServices.find(function(s){ return s.id === id; });
  if (!svc) return;
  var el = document.getElementById('modal-preview-service');
  if (!el) return;
  var photos = (svc.photos || [svc.cover]).filter(Boolean);
  var mainImg = photos.length
    ? '<img src="'+photos[0]+'" id="spv-main" style="width:100%;height:100%;object-fit:cover;">'
    : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3.5rem;">📅</div>';
  var thumbs = photos.length > 1
    ? photos.map(function(src, i){ return '<div onclick="document.getElementById(\'spv-main\').src=\''+src+'\'" style="width:52px;height:52px;border-radius:8px;overflow:hidden;border:2px solid '+(i===0?'var(--brown)':'var(--border)')+';cursor:pointer;flex-shrink:0;"><img src="'+src+'" style="width:100%;height:100%;object-fit:cover;"></div>'; }).join('')
    : '';
  el.querySelector('#spv-img-main').innerHTML = mainImg;
  el.querySelector('#spv-thumbs').innerHTML = thumbs;
  el.querySelector('#spv-name').textContent = svc.name;
  el.querySelector('#spv-price').textContent = '$' + svc.price.toFixed(2);
  el.querySelector('#spv-duration').textContent = svc.duration;
  el.querySelector('#spv-category').textContent = svc.category;
  el.querySelector('#spv-desc').textContent = svc.desc || '';
  el.querySelector('#spv-edit-btn').onclick = function(){ closeModal('modal-preview-service'); editService(id); };
  openModal('modal-preview-service');
}

function editService(id) {
  var svc = bookingServices.find(function(s){ return s.id === id; });
  if (!svc) return;
  document.getElementById('svc-edit-id').value = id;
  document.getElementById('svc-edit-name').value = svc.name || '';
  document.getElementById('svc-edit-price').value = svc.price || '';
  document.getElementById('svc-edit-duration').value = svc.duration || '1 hour';
  document.getElementById('svc-edit-category').value = svc.category || 'Hair';
  document.getElementById('svc-edit-desc').value = svc.desc || '';
  // show existing main photo
  var photoWrap = document.getElementById('svc-edit-photo-preview');
  var cover = svc.photos ? svc.photos[0] : svc.cover;
  if (photoWrap) photoWrap.innerHTML = cover ? '<img src="'+cover+'" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:6px;">' : '';
  window._svcEditPendingCover = null;
  openModal('modal-edit-service');
}

function saveEditService() {
  var id = parseInt(document.getElementById('svc-edit-id').value);
  var svc = bookingServices.find(function(s){ return s.id === id; });
  if (!svc) return;
  svc.name = document.getElementById('svc-edit-name').value.trim() || svc.name;
  svc.price = parseFloat(document.getElementById('svc-edit-price').value) || svc.price;
  svc.duration = document.getElementById('svc-edit-duration').value || svc.duration;
  svc.category = document.getElementById('svc-edit-category').value || svc.category;
  svc.desc = document.getElementById('svc-edit-desc').value;
  if (window._svcEditPendingCover) {
    svc.cover = window._svcEditPendingCover;
    if (!svc.photos) svc.photos = [];
    svc.photos[0] = window._svcEditPendingCover;
  }
  window._svcEditPendingCover = null;
  closeModal('modal-edit-service');
  renderBookingServices();
  toast('✓ Service updated!');
}

function previewSvcEditImage(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    window._svcEditPendingCover = ev.target.result;
    var wrap = document.getElementById('svc-edit-photo-preview');
    if (wrap) wrap.innerHTML = '<img src="'+ev.target.result+'" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:6px;">';
  };
  reader.readAsDataURL(file);
}

function saveService() {
  var name = document.getElementById('svc-name').value.trim();
  var price = parseFloat(document.getElementById('svc-price').value) || 0;
  var duration = document.getElementById('svc-duration').value;
  var category = document.getElementById('svc-category').value;
  var desc = document.getElementById('svc-desc').value.trim();
  var depositOn = document.getElementById('svc-deposit-toggle').checked;
  var depositAmt = parseFloat(document.getElementById('svc-deposit-amount').value) || 0;
  var depositType = document.getElementById('svc-deposit-type').value;
  if (!name) { toast('Please enter a service name'); return; }
  var svc = {
    id: bkServiceIdCounter++,
    name: name, price: price, duration: duration,
    category: category, desc: desc,
    deposit: depositOn, depositAmt: depositAmt, depositType: depositType,
    cover: svcPhotos[0] || null,
    photos: svcPhotos.filter(Boolean),
    visible: true
  };
  bookingServices.push(svc);
  lsPersistBookings();
  // reset form
  ['svc-name','svc-price','svc-desc','svc-deposit-amount'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
  document.getElementById('svc-deposit-toggle').checked = false;
  document.getElementById('svc-deposit-field').style.display = 'none';
  document.getElementById('svc-deposit-track').style.background = '#e5e7eb';
  document.getElementById('svc-deposit-thumb').style.left = '3px';
  // reset photo grid
  svcPhotos = [null,null,null,null,null,null];
  for (var pi = 0; pi < 6; pi++) {
    var slot = document.getElementById('svc-slot-' + pi);
    if (slot) {
      slot.innerHTML = pi === 0 ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--brown-light)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Main' : '+';
      slot.style.border = '2px dashed var(--border)';
      slot.style.padding = '';
    }
  }
  closeModal('modal-add-service');
  renderBookingServices();
  toast('✓ Service added!');
}

function filterBookingCat(btn, cat) {
  document.querySelectorAll('.bk-cat').forEach(function(b) {
    b.style.background = '#fff';
    b.style.color = 'var(--text-dim)';
    b.style.borderColor = 'var(--border)';
  });
  btn.style.background = 'var(--brown)';
  btn.style.color = '#fff';
  btn.style.borderColor = 'var(--brown)';
  activeBookingCat = cat;
  renderBookingServices();
}

function bkShowAddCat() {
  document.getElementById('bk-add-cat-btn').style.display = 'none';
  var form = document.getElementById('bk-add-cat-form');
  form.style.display = 'flex';
  document.getElementById('bk-new-cat-input').focus();
}

function bkHideAddCat() {
  document.getElementById('bk-add-cat-btn').style.display = 'flex';
  document.getElementById('bk-add-cat-form').style.display = 'none';
  document.getElementById('bk-new-cat-input').value = '';
}

function bkAddCat() {
  var input = document.getElementById('bk-new-cat-input');
  var name = input.value.trim();
  if (!name) { input.focus(); return; }
  // Check for duplicate
  var existing = document.querySelectorAll('.bk-cat');
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].textContent.trim().toLowerCase() === name.toLowerCase()) {
      toast('Category already exists');
      input.select();
      return;
    }
  }
  // Insert new chip before the add button
  var btn = document.createElement('button');
  btn.className = 'bk-cat';
  btn.textContent = name;
  btn.style.cssText = 'padding:8px 18px;border-radius:20px;border:1.5px solid var(--border);background:#fff;color:var(--text-dim);cursor:pointer;font-family:\'DM Sans\',sans-serif;font-weight:700;font-size:0.8rem;';
  btn.onclick = function(){ filterBookingCat(btn, name); };
  var addBtn = document.getElementById('bk-add-cat-btn');
  addBtn.parentNode.insertBefore(btn, addBtn);
  toast('Category "' + name + '" added');
  bkHideAddCat();
}

function toggleServiceVisibility(id) {
  var svc = bookingServices.find(function(s){ return s.id === id; });
  if (svc) {
    svc.visible = !svc.visible;
    lsPersistBookings();
    renderBookingServices();
    toast(svc.visible ? '✓ Service visible' : 'Service hidden');
  }
}

function deleteService(id) {
  bookingServices = bookingServices.filter(function(s){ return s.id !== id; });
  lsPersistBookings();
  renderBookingServices();
  toast('Service removed');
}

function renderBookingServices() {
  var grid = document.getElementById('booking-services-grid');
  var empty = document.getElementById('booking-empty');
  if (!grid) return;
  var filtered = activeBookingCat === 'all' ? bookingServices : bookingServices.filter(function(s){ return s.category === activeBookingCat; });
  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  grid.innerHTML = filtered.map(function(svc) {
    var coverStyle = svc.cover
      ? 'background:url(' + svc.cover + ') center/cover no-repeat;'
      : 'background:linear-gradient(135deg,#1a0a00,#3d1800);';
    var depositBadge = svc.deposit
      ? '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;background:rgba(192,122,80,0.12);color:var(--brown);border-radius:8px;font-size:0.65rem;font-weight:700;">💳 Deposit: $' + svc.depositAmt + '</span>'
      : '';
    var visColor = svc.visible ? 'var(--brown)' : 'var(--text-dim)';
    var visLabel = svc.visible ? 'Visible' : 'Hidden';
    return '<div class="bk-svc-card">'
      + '<div style="height:140px;' + coverStyle + 'position:relative;">'
      + '<div style="position:absolute;inset:0;background:rgba(0,0,0,0.25);display:flex;align-items:flex-end;padding:12px;">'
      + '<span style="background:rgba(255,255,255,0.15);backdrop-filter:blur(4px);color:#fff;font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:12px;">' + svc.category + '</span>'
      + '</div>'
      + '</div>'
      + '<div style="padding:14px;">'
      + '<div style="font-family:Georgia,serif;font-size:0.95rem;font-weight:700;color:var(--text);margin-bottom:4px;">' + svc.name + '</div>'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
      + '<span style="font-size:1rem;font-weight:900;color:var(--brown);">$' + svc.price.toFixed(2) + '</span>'
      + '<span style="font-size:0.75rem;color:var(--text-dim);">⏱ ' + svc.duration + '</span>'
      + '</div>'
      + (depositBadge ? '<div style="margin-bottom:10px;">' + depositBadge + '</div>' : '')
      + '<button onclick="openBookService(' + svc.id + ')" style="width:100%;padding:10px;background:linear-gradient(135deg,var(--brown-light),var(--brown-dark));color:#fff;border:none;border-radius:9px;cursor:pointer;font-family:sans-serif;font-weight:700;font-size:0.85rem;margin-bottom:10px;">Book Now</button>'
      + '<div style="display:flex;align-items:center;gap:6px;border-top:1px solid var(--border);padding-top:10px;">'
      + '<button onclick="previewService(' + svc.id + ')" style="padding:6px 10px;background:var(--brown);color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:0.72rem;font-weight:700;">👁 Preview</button>'
      + '<button onclick="editService(' + svc.id + ')" style="padding:6px 10px;background:var(--cream2);color:var(--text-mid);border:1px solid var(--border);border-radius:7px;cursor:pointer;font-size:0.72rem;font-weight:700;">✏️ Edit</button>'
      + '<button onclick="toggleServiceVisibility(' + svc.id + ')" style="flex:1;padding:6px;background:none;border:1px solid var(--border);border-radius:7px;cursor:pointer;font-size:0.72rem;font-weight:700;color:' + visColor + ';">' + visLabel + '</button>'
      + '<button onclick="deleteService(' + svc.id + ')" style="padding:6px 10px;background:#fee2e2;color:#dc2626;border:none;border-radius:7px;cursor:pointer;font-size:0.72rem;font-weight:700;">Delete</button>'
      + '</div>'
      + '</div>'
      + '</div>';
  }).join('');
}

function openBookService(id) {
  var svc = bookingServices.find(function(s){ return s.id === id; });
  if (!svc) return;
  currentBookingService = svc;
  bookSelectedDay = null;
  bookSelectedTime = null;
  document.getElementById('book-svc-title').textContent = svc.name;
  document.getElementById('book-svc-meta').textContent = '$' + svc.price.toFixed(2) + ' · ' + svc.duration;
  document.getElementById('book-summary').style.display = 'none';
  document.getElementById('book-confirm-btn').disabled = true;
  document.getElementById('book-confirm-btn').textContent = 'Select a date & time';
  var depositNotice = document.getElementById('book-deposit-notice');
  if (svc.deposit && svc.depositAmt > 0) {
    depositNotice.style.display = 'block';
    var label = svc.depositType === '% of total' ? svc.depositAmt + '% of $' + svc.price.toFixed(2) + ' = $' + (svc.price * svc.depositAmt / 100).toFixed(2) : '$' + svc.depositAmt.toFixed(2);
    document.getElementById('book-deposit-text').textContent = 'Deposit due now: ' + label;
  } else {
    depositNotice.style.display = 'none';
  }
  bookCurrentMonth = new Date().getMonth();
  bookCurrentYear = new Date().getFullYear();
  renderBookCalendar();
  renderBookTimeSlots();
  openModal('modal-book-service');
}

function renderBookCalendar() {
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('book-month-label').textContent = months[bookCurrentMonth] + ' ' + bookCurrentYear;
  var firstDay = new Date(bookCurrentYear, bookCurrentMonth, 1).getDay();
  var daysInMonth = new Date(bookCurrentYear, bookCurrentMonth + 1, 0).getDate();
  var today = new Date();
  var html = '';
  for (var i = 0; i < firstDay; i++) html += '<div></div>';
  for (var d = 1; d <= daysInMonth; d++) {
    var date = new Date(bookCurrentYear, bookCurrentMonth, d);
    var isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var isSelected = bookSelectedDay === d && bookCurrentMonth === new Date().getMonth();
    var bg = isSelected ? 'var(--brown)' : 'transparent';
    var color = isPast ? '#ccc' : (isSelected ? '#fff' : 'var(--text)');
    var cursor = isPast ? 'default' : 'pointer';
    html += '<div onclick="' + (isPast ? '' : 'selectBookDay(' + d + ')') + '" style="padding:7px 4px;border-radius:8px;font-size:0.82rem;font-weight:600;background:' + bg + ';color:' + color + ';cursor:' + cursor + ';text-align:center;">' + d + '</div>';
  }
  document.getElementById('book-calendar-days').innerHTML = html;
}

function changeBookMonth(dir) {
  bookCurrentMonth += dir;
  if (bookCurrentMonth > 11) { bookCurrentMonth = 0; bookCurrentYear++; }
  if (bookCurrentMonth < 0) { bookCurrentMonth = 11; bookCurrentYear--; }
  bookSelectedDay = null;
  bookSelectedTime = null;
  renderBookCalendar();
  renderBookTimeSlots();
  updateBookSummary();
}

function selectBookDay(d) {
  bookSelectedDay = d;
  renderBookCalendar();
  updateBookSummary();
}

function renderBookTimeSlots() {
  var html = bookingTimes.map(function(t) {
    var sel = t === bookSelectedTime;
    return '<button data-bk-time="' + t + '" class="bk-time-btn' + (sel ? ' bk-time-sel' : '') + '">' + t + '</button>';
  }).join('');
  var slotsEl = document.getElementById('book-time-slots');
  slotsEl.innerHTML = html;
  slotsEl.onclick = function(e) {
    var btn = e.target.closest('.bk-time-btn');
    if (!btn) return;
    bookSelectedTime = btn.dataset.bkTime;
    renderBookTimeSlots();
    updateBookSummary();
  };
}

function selectBookTime(btn, t) {
  bookSelectedTime = t;
  renderBookTimeSlots();
  updateBookSummary();
}

function updateBookSummary() {
  var summaryEl = document.getElementById('book-summary');
  var summaryText = document.getElementById('book-summary-text');
  var btn = document.getElementById('book-confirm-btn');
  if (bookSelectedDay && bookSelectedTime) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    summaryText.textContent = months[bookCurrentMonth] + ' ' + bookSelectedDay + ', ' + bookCurrentYear + ' · ' + bookSelectedTime;
    summaryEl.style.display = 'block';
    var svc = currentBookingService;
    var depositLabel = '';
    if (svc && svc.deposit && svc.depositAmt > 0) {
      var amt = svc.depositType === '% of total' ? (svc.price * svc.depositAmt / 100).toFixed(2) : svc.depositAmt.toFixed(2);
      depositLabel = 'Pay Deposit $' + amt + ' → Book';
    } else {
      depositLabel = 'Confirm Booking';
    }
    btn.textContent = depositLabel;
    btn.disabled = false;
  } else {
    summaryEl.style.display = 'none';
    btn.textContent = 'Select a date & time';
    btn.disabled = true;
  }
}

function confirmBooking() {
  var svc = currentBookingService;
  if (!svc || !bookSelectedDay || !bookSelectedTime) return;
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var dateStr = months[bookCurrentMonth] + ' ' + bookSelectedDay + ', ' + bookCurrentYear;
  if (svc.deposit && svc.depositAmt > 0) {
    var amt = svc.depositType === '% of total' ? (svc.price * svc.depositAmt / 100).toFixed(2) : svc.depositAmt.toFixed(2);
    closeModal('modal-book-service');
    toast('✓ Deposit of $' + amt + ' collected! Booking confirmed for ' + dateStr + ' at ' + bookSelectedTime);
  } else {
    closeModal('modal-book-service');
    toast('✓ Booking confirmed for ' + dateStr + ' at ' + bookSelectedTime + '!');
  }
}

// Render on load
// renderBookingServices called in boot sequence below

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

// ── BOOKING MANAGEMENT ────────────────────────────────────────────────────────
var incomingBookings = [
  { id:101, client:'Ava Thompson', email:'ava@email.com', service:'Full Set Lashes', date:'Apr 18, 2026', time:'11:00 AM', deposit:true, depositAmt:30, depositPaid:true, status:'confirmed', banned:false },
  { id:102, client:'Marcus Lee', email:'marcus@email.com', service:'Classic Haircut', date:'Apr 19, 2026', time:'2:00 PM', deposit:false, depositAmt:0, depositPaid:false, status:'pending', banned:false },
  { id:103, client:'Jasmine Rivera', email:'jasmine@email.com', service:'Deep Tissue Massage', date:'Apr 20, 2026', time:'10:00 AM', deposit:true, depositAmt:20, depositPaid:false, status:'pending', banned:false },
];
var deletedBookings = [];
var reviewQuestions = [
  { q:'How would you describe your overall experience?', type:'choice', choices:['Excellent','Good','Average','Poor'] },
  { q:'Would you recommend this service to a friend?', type:'choice', choices:['Definitely','Maybe','No'] },
];

// Reservation records
var reservationBookings = [];

function bookingTab(tab) {
  var tabs = ['services','incoming','reservations'];
  tabs.forEach(function(t) {
    var btn = document.getElementById('bk-tab-'+t);
    var content = document.getElementById('bk-'+t+'-content');
    if (btn) { btn.style.background = t===tab ? 'var(--brown)' : 'transparent'; btn.style.color = t===tab ? '#fff' : 'var(--text-dim)'; }
    if (content) content.style.display = t===tab ? 'block' : 'none';
  });
  if (tab === 'incoming') renderIncomingBookings();
  if (tab === 'reservations') renderReservationBookings();
}

function renderReservationBookings() {
  var list = document.getElementById('bk-reservations-list');
  var empty = document.getElementById('bk-reservations-empty');
  if (!list) return;
  if (reservationBookings.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = reservationBookings.map(function(r) {
    var statusColor = r.paymentStatus === 'paid' ? '#16a34a' : r.paymentStatus === 'partial' ? '#d97706' : '#dc2626';
    var statusLabel = r.paymentStatus === 'paid' ? 'Paid in Full' : r.paymentStatus === 'partial' ? 'Partial' : 'Pending';
    var perPerson = r.splitPayment && r.attendees > 0 ? (r.totalCost / r.attendees).toFixed(2) : null;
    var log = r.paymentLog || [];
    var totalPaid = log.reduce(function(s,p){ return s + (parseFloat(p.amount)||0); }, 0);
    var pctPaid = r.totalCost > 0 ? Math.min(100, Math.round(totalPaid/r.totalCost*100)) : 0;
    var qrId = 'qr-bk-'+r.id;
    var resDateDisplay = r.eventDateFormatted || (r.eventDate ? new Date(r.eventDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'TBD');

    return `<div style="background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden;" id="res-card-${r.id}">
      <!-- Header bar -->
      <div style="background:linear-gradient(135deg,rgba(192,122,80,0.1),rgba(192,122,80,0.04));border-bottom:1px solid var(--border);padding:14px 18px;display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div>
          <div style="font-weight:700;font-size:0.95rem;color:var(--text);">${r.eventName}</div>
          ${(r.birthdayNames && r.birthdayNames.length > 0) ? '<div style="font-size:0.82rem;color:var(--brown);margin-top:2px;">🎂 ' + r.birthdayNames.join(' & ') + '</div>' : (r.birthdayName ? '<div style="font-size:0.82rem;color:var(--brown);margin-top:2px;">🎂 ' + r.birthdayName + '</div>' : '')}
          <div style="font-size:0.78rem;color:var(--text-dim);margin-top:3px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span>📅 <strong>${resDateDisplay}</strong>${r.eventTime?' at '+r.eventTime:''}</span>
            <span>👥 ${r.attendees} ${r.attendees===1?'person':'people'}</span>
            ${r.hasAnnouncement ? '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;font-size:0.7rem;font-weight:700;">✨ Announcement</span>' : ''}
          </div>
          ${r.hasAnnouncement && r.announcementFee ? '<div style="font-size:0.75rem;color:var(--text-dim);margin-top:3px;">Sparklers + lights + Happy Birthday sign · $' + (r.announcementFee||0).toFixed(2) + ' included in split</div>' : ''}
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:0.72rem;font-weight:700;padding:4px 10px;border-radius:20px;background:${statusColor}18;color:${statusColor};">${statusLabel}</span>
          <button onclick="editReservationEvent(${r.id})" style="padding:5px 10px;background:var(--cream2);color:var(--text-mid);border:1px solid var(--border);border-radius:7px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.72rem;font-weight:700;">Edit</button>
          <button onclick="deleteReservation(${r.id})" style="padding:5px 10px;background:#fee2e2;color:#dc2626;border:1px solid #fca5a5;border-radius:7px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.72rem;font-weight:700;">Delete</button>
        </div>
      </div>

      <div style="padding:16px 18px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <!-- Contact -->
        <div style="background:var(--cream);border-radius:10px;padding:10px 12px;">
          <div style="font-size:0.62rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:5px;">Contact</div>
          <div style="font-size:0.88rem;font-weight:700;">${r.firstName} ${r.lastName}</div>
          <div style="font-size:0.75rem;color:var(--text-dim);">${r.email}</div>
          <div style="font-size:0.75rem;color:var(--text-dim);">${r.phone}</div>
        </div>
        <!-- Payment summary -->
        <div style="background:var(--cream);border-radius:10px;padding:10px 12px;">
          <div style="font-size:0.62rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:5px;">Payment</div>
          <div style="font-size:0.88rem;font-weight:700;color:var(--brown);">$${parseFloat(r.totalCost).toFixed(2)} total</div>
          ${r.splitPayment ? `<div style="font-size:0.75rem;color:var(--text-dim);">Split: $${perPerson} × ${r.attendees}</div>` : '<div style="font-size:0.75rem;color:var(--text-dim);">Full payment</div>'}
          <div style="font-size:0.72rem;color:#dc2626;margin-top:2px;font-weight:600;">Due: ${r.paymentDueDate||'N/A'}</div>
        </div>
      </div>

      <!-- Payment progress -->
      <div style="padding:0 18px 14px;">
        <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text-dim);margin-bottom:5px;"><span>$${totalPaid.toFixed(2)} collected</span><span>$${(r.totalCost-totalPaid).toFixed(2)} remaining</span></div>
        <div style="background:var(--cream3);border-radius:4px;height:6px;overflow:hidden;">
          <div style="background:${pctPaid>=100?'#16a34a':'var(--brown)'};height:100%;width:${pctPaid}%;border-radius:4px;transition:width 0.4s;"></div>
        </div>
      </div>

      ${r.splitPayment ? `<div style="padding:0 18px 14px;">
        <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;">Attendee Payment Status</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${Array.from({length:r.attendees},function(_,i){
            var pl = (r.paymentLog||[]).find(function(p){return p.seat===(i+1);});
            var paid = !!pl;
            return '<div title="'+(paid?pl.name+' – $'+pl.amount:'Person '+(i+1)+' unpaid')+'" style="width:30px;height:30px;border-radius:50%;background:'+(paid?'#16a34a':'var(--cream3)')+';border:1.5px solid '+(paid?'#16a34a':'var(--border)')+';display:flex;align-items:center;justify-content:center;font-size:0.62rem;font-weight:700;color:'+(paid?'#fff':'var(--text-dim)')+';">'+(i+1)+'</div>';
          }).join('')}
        </div>
      </div>` : ''}

      <!-- Payment log -->
      ${log.length > 0 ? `<div style="padding:0 18px 14px;">
        <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;">Payment Log</div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${log.map(function(p,pi){return `<div style="display:flex;align-items:flex-start;justify-content:space-between;background:var(--cream);border-radius:8px;padding:8px 10px;font-size:0.78rem;">
            <div><span style="font-weight:700;">${p.name}</span><span style="color:var(--text-dim);margin-left:6px;">${p.date} · ${p.method||''}${r.splitPayment&&p.seat?' · Seat '+p.seat:''}</span>${p.ticketNum?'<div style="font-size:0.68rem;color:#C07A50;font-weight:700;margin-top:2px;">🎟 '+p.ticketNum+'</div>':''}${p.receipt?'<div style="font-size:0.68rem;color:#16a34a;margin-top:2px;">📧 Receipt sent to '+p.receipt.email+(p.receipt.card2?' · Split: '+p.receipt.card1+' + '+p.receipt.card2:'')+'</div>':''}</div>
            <span style="font-weight:700;color:#16a34a;flex-shrink:0;margin-left:8px;">+$${parseFloat(p.amount).toFixed(2)}</span>
          </div>`;}).join('')}
        </div>
      </div>` : ''}

      <!-- Link + QR + actions -->
      <div style="padding:0 18px 16px;">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">
          <div style="flex:1;background:var(--cream);border-radius:8px;padding:7px 10px;font-family:monospace;font-size:0.7rem;color:var(--brown-dark);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.paymentLink}</div>
          <button onclick="navigator.clipboard&&navigator.clipboard.writeText('${r.paymentLink}');toast('✓ Copied!')" style="padding:7px 12px;background:var(--brown-bg2);color:var(--brown-dark);border:1px solid var(--brown);border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.72rem;font-weight:700;flex-shrink:0;">Copy</button>
          <button onclick="toggleResQR('${qrId}','${r.paymentLink}')" style="padding:7px 12px;background:#fff;color:var(--text-mid);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.72rem;font-weight:700;flex-shrink:0;">QR</button>
          <button onclick="sendReminderNow(${r.id})" style="padding:7px 12px;background:#fff;color:var(--text-mid);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.72rem;font-weight:700;flex-shrink:0;">Remind</button>
        </div>
        <!-- QR toggle -->
        <div id="${qrId}" style="display:none;background:var(--cream);border-radius:10px;padding:12px;text-align:center;margin-bottom:10px;">
          <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px;">Scan to Pay</div>
          <div id="${qrId}-svg" style="display:inline-block;"></div>
        </div>
        <!-- Record payment button -->
        <button onclick="openRecordPayment(${r.id})" style="width:100%;padding:11px;background:linear-gradient(135deg,var(--brown-light),var(--brown-dark));color:#fff;border:none;border-radius:10px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:700;display:flex;align-items:center;justify-content:center;gap:7px;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          Record Payment Received
        </button>
        ${r.linkVerified ? '<div style="margin-top:8px;font-size:0.75rem;color:#16a34a;display:flex;align-items:center;gap:5px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Link delivered & verified</div>' : '<div style="margin-top:8px;font-size:0.75rem;color:#d97706;">⏳ Awaiting link verification</div>'}
        <div style="margin-top:4px;font-size:0.72rem;color:var(--text-dim);">🔔 Next auto-reminder: ${r.nextReminder||'Scheduled'}</div>
      </div>
    </div>`;
  }).join('');
}

function toggleResQR(qrId, link) {
  var el = document.getElementById(qrId);
  if (!el) return;
  var visible = el.style.display !== 'none';
  el.style.display = visible ? 'none' : 'block';
  if (!visible) {
    var svgEl = document.getElementById(qrId+'-svg');
    if (svgEl && !svgEl.innerHTML) generateQRDisplay(qrId+'-svg', link);
  }
}

function openRecordPayment(id) {
  var r = reservationBookings.find(function(x){ return x.id===id; });
  if (!r) return;
  window._recordPaymentId = id;
  var perPerson = r.splitPayment && r.attendees > 0 ? (r.totalCost / r.attendees).toFixed(2) : r.totalCost.toFixed(2);
  var modal = document.getElementById('modal-record-payment');
  if (!modal) {
    var div = document.createElement('div');
    div.id = 'modal-record-payment';
    div.className = 'modal-overlay';
    div.onclick = function(e){ if(e.target===div) closeModal('modal-record-payment'); };
    div.innerHTML = `<div class="modal" style="max-width:420px;" onclick="event.stopPropagation()">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
        <h2 class="modal-title" style="margin:0;">Record Payment</h2>
        <button onclick="closeModal('modal-record-payment')" style="background:none;border:none;cursor:pointer;font-size:1.3rem;color:var(--text-dim);">✕</button>
      </div>
      <div id="rp-reservation-info" style="background:var(--cream);border-radius:10px;padding:10px 12px;margin-bottom:16px;font-size:0.82rem;color:var(--text-mid);"></div>
      <div class="form-field"><label>Payer Full Name</label><input type="text" id="rp-name" placeholder="Jane Smith" style="width:100%;"></div>
      <div class="form-field"><label>Amount Paid ($)</label><div style="position:relative;"><span style="position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:0.88rem;color:var(--text-dim);">$</span><input type="number" id="rp-amount" step="0.01" min="0" style="width:100%;padding-left:24px;" placeholder="0.00"></div></div>
      <div id="rp-seat-row" style="display:none;" class="form-field"><label>Seat / Person #</label><input type="number" id="rp-seat" min="1" style="width:100%;" placeholder="1"></div>
      <div class="form-field"><label>Payment Method</label><select id="rp-method" style="width:100%;"><option>Cash</option><option>Card</option><option>Venmo</option><option>Zelle</option><option>CashApp</option><option>Other</option></select></div>
      <div class="form-field"><label>Notes (optional)</label><input type="text" id="rp-notes" placeholder="e.g. Paid via Venmo @handle" style="width:100%;"></div>
      <div style="display:flex;gap:10px;margin-top:16px;">
        <button class="btn-cancel" onclick="closeModal('modal-record-payment')">Cancel</button>
        <button class="btn-confirm" onclick="savePaymentRecord()" style="flex:1;">Save Payment →</button>
      </div>
    </div>`;
    document.body.appendChild(div);
  }
  // Populate info
  var info = document.getElementById('rp-reservation-info');
  if (info) info.innerHTML = '<strong>'+r.eventName+'</strong> · '+r.firstName+' '+r.lastName+'<br>Total: $'+r.totalCost.toFixed(2)+' | Suggested: $'+perPerson+(r.splitPayment?' per person':'');
  var seatRow = document.getElementById('rp-seat-row');
  if (seatRow) seatRow.style.display = r.splitPayment ? 'block' : 'none';
  var amtEl = document.getElementById('rp-amount');
  if (amtEl) amtEl.value = perPerson;
  openModal('modal-record-payment');
}

function savePaymentRecord() {
  var id = window._recordPaymentId;
  var r = reservationBookings.find(function(x){ return x.id===id; });
  if (!r) return;
  var name = document.getElementById('rp-name').value.trim();
  var amount = parseFloat(document.getElementById('rp-amount').value) || 0;
  var seat = document.getElementById('rp-seat') ? parseInt(document.getElementById('rp-seat').value) || null : null;
  var method = document.getElementById('rp-method').value;
  var notes = document.getElementById('rp-notes').value.trim();
  if (!name) { toast('Please enter the payer name'); return; }
  if (!amount) { toast('Please enter the amount'); return; }
  if (!r.paymentLog) r.paymentLog = [];

  // Generate unique ticket number for this payer
  var ticketNum = 'RES-' + id.toString().slice(-4) + '-' + (r.paymentLog.length + 1).toString().padStart(3,'0');
  r.paymentLog.push({ name:name, amount:amount, seat:seat, method:method, notes:notes, ticketNum:ticketNum, date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) });

  var totalPaid = r.paymentLog.reduce(function(s,p){ return s+(parseFloat(p.amount)||0); }, 0);
  var prevStatus = r.paymentStatus;
  r.paymentStatus = totalPaid >= r.totalCost ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';
  if (r.splitPayment) r.paidCount = r.paymentLog.filter(function(p){ return !!p.seat; }).length;

  closeModal('modal-record-payment');

  // If just became fully paid — issue tickets to all payers
  if (r.paymentStatus === 'paid' && prevStatus !== 'paid') {
    issueReservationTickets(r);
  } else {
    // Send individual payment confirmation with ticket number
    showPaymentConfirmationToast(name, ticketNum, r);
  }

  renderReservationBookings();
  toast('✓ $' + amount.toFixed(2) + ' recorded for ' + name + ' · Ticket: ' + ticketNum);
}

function issueReservationTickets(r) {
  // Simulate sending ticket emails to all payers
  var perPerson = r.splitPayment ? (r.totalCost / r.attendees).toFixed(2) : r.totalCost.toFixed(2);
  var ticketsSummary = r.paymentLog.map(function(p){ return p.name + ' → ' + p.ticketNum; }).join(', ');

  // Show a confirmation modal-style toast
  setTimeout(function() {
    var msgDiv = document.createElement('div');
    msgDiv.style.cssText = 'position:fixed;bottom:80px;right:24px;background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px 20px;max-width:340px;z-index:9999;box-shadow:0 8px 32px rgba(44,26,14,0.18);';
    msgDiv.innerHTML = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">'
      + '<div style="width:32px;height:32px;border-radius:50%;background:#d1fae5;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
      + '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>'
      + '<div><div style="font-weight:700;font-size:0.88rem;color:var(--text);">Payment Complete — Tickets Issued!</div>'
      + '<div style="font-size:0.75rem;color:var(--text-dim);margin-top:2px;">' + r.eventName + ' · ' + r.eventDateFormatted + '</div></div></div>'
      + '<div style="font-size:0.78rem;color:var(--text-mid);line-height:1.6;margin-bottom:10px;">'
      + '📧 Confirmation emails with ticket numbers & QR codes sent to each payer.<br>'
      + '📍 Location: <strong>' + (r.location || 'See confirmation email') + '</strong><br>'
      + (r.perks ? '🎁 Includes: ' + r.perks + '<br>' : '')
      + '</div>'
      + '<div style="font-size:0.72rem;color:var(--text-dim);background:var(--cream);border-radius:8px;padding:8px 10px;">'
      + r.paymentLog.map(function(p){ return '<div>🎟️ <strong>' + p.name + '</strong> · ' + p.ticketNum + '</div>'; }).join('')
      + '</div>'
      + '<button onclick="this.parentNode.remove()" style="margin-top:10px;width:100%;padding:8px;background:var(--brown);color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;font-weight:700;">Got it</button>';
    document.body.appendChild(msgDiv);
    setTimeout(function(){ if(msgDiv.parentNode) msgDiv.remove(); }, 12000);
  }, 400);
}

function showPaymentConfirmationToast(name, ticketNum, r) {
  setTimeout(function(){
    toast('📧 Confirmation + QR sent to ' + name + ' · ' + ticketNum);
  }, 600);
}

function editReservationEvent(id) {
  // Find matching event in events array and open edit modal
  var evIdx = events.findIndex(function(e){ return e.isReservation && (e.id===id || e.name === (reservationBookings.find(function(r){return r.id===id;})||{}).eventName); });
  if (evIdx > -1) {
    var bookingNavItem = document.querySelector('.nav-item[onclick*="tickets"]');
    if (bookingNavItem) nav(bookingNavItem, 'tickets');
    setTimeout(function(){ editEvent(evIdx); }, 200);
  } else { toast('Open Events / Tickets tab to edit this reservation'); }
}

function deleteReservation(id) {
  if (!confirm('Delete this reservation? This cannot be undone.')) return;
  reservationBookings = reservationBookings.filter(function(r){ return r.id!==id; });
  // Also remove from events
  events = events.filter(function(e){ return !(e.isReservation && e.id===id); });
  renderReservationBookings();
  renderEvents();
  updateTicketStats();
  var badge = document.getElementById('bk-reservations-badge');
  if (badge) { badge.textContent = reservationBookings.length; if(!reservationBookings.length) badge.style.display='none'; }
  toast('Reservation deleted.');
}

function addReservationToBookings(resData) {
  var id = Date.now();
  var nextReminder = new Date();
  nextReminder.setDate(nextReminder.getDate() + 3);
  var rec = Object.assign({}, resData, {
    id: id,
    paymentStatus: 'pending',
    paidCount: 0,
    linkVerified: false,
    nextReminder: nextReminder.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
    createdAt: new Date().toISOString()
  });
  reservationBookings.unshift(rec);
  // Update badge
  var badge = document.getElementById('bk-reservations-badge');
  if (badge) { badge.textContent = reservationBookings.length; badge.style.display = 'inline'; }
  // Add to calendar
  addReservationToCalendar(rec);
}

function addReservationToCalendar(rec) {
  if (typeof calendarEvents !== 'undefined') {
    calendarEvents.push({ date: rec.eventDate, title: rec.eventName + ' (Reservation)', color: 'var(--brown)' });
  }
}

function sendReminderNow(id) {
  var r = reservationBookings.find(function(x){ return x.id===id; });
  if (!r) return;
  toast('✓ Reminder sent to '+r.firstName+'!');
}

function renderIncomingBookings() {
  var list = document.getElementById('bk-incoming-list');
  var emptyEl = document.getElementById('bk-incoming-empty');
  if (!list) return;
  var active = incomingBookings.filter(function(b){ return b.status !== 'deleted'; });
  if (active.length === 0) {
    list.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
  } else {
    if (emptyEl) emptyEl.style.display = 'none';
    list.innerHTML = active.map(function(b) {
      var statusColor = b.status==='confirmed' ? '#16a34a' : b.status==='cancelled' ? '#dc2626' : '#d97706';
      var statusBg = b.status==='confirmed' ? '#dcfce7' : b.status==='cancelled' ? '#fee2e2' : '#fef3c7';
      var depositBadge = b.deposit ? (b.depositPaid ? '<span style="font-size:0.65rem;background:#dcfce7;color:#16a34a;padding:2px 7px;border-radius:7px;font-weight:700;">Deposit Paid</span>' : '<span style="font-size:0.65rem;background:#fef3c7;color:#d97706;padding:2px 7px;border-radius:7px;font-weight:700;">Deposit Pending</span>') : '';
      var bannedBadge = b.banned ? '<span style="font-size:0.65rem;background:#fee2e2;color:#dc2626;padding:2px 7px;border-radius:7px;font-weight:700;">⛔ Banned</span>' : '';
      return '<div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;">'
        + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;">'
        + '<div>'
        + '<div style="font-weight:800;font-size:0.92rem;">' + b.client + '</div>'
        + '<div style="font-size:0.75rem;color:var(--text-dim);">' + b.email + '</div>'
        + '<div style="font-size:0.82rem;font-weight:600;color:var(--text);margin-top:4px;">' + b.service + '</div>'
        + '<div style="font-size:0.78rem;color:var(--text-dim);">📅 ' + b.date + ' · ' + b.time + '</div>'
        + '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;">'
        + '<span style="padding:2px 8px;background:'+statusBg+';color:'+statusColor+';border-radius:8px;font-size:0.7rem;font-weight:700;">' + b.status.charAt(0).toUpperCase()+b.status.slice(1) + '</span>'
        + depositBadge + bannedBadge
        + '</div></div>'
        + '<button onclick="openManageBooking('+b.id+')" style="padding:7px 16px;background:var(--brown);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.78rem;white-space:nowrap;flex-shrink:0;">Manage</button>'
        + '</div></div>';
    }).join('');
  }
  // Deleted bookings
  var delSection = document.getElementById('bk-deleted-section');
  var delList = document.getElementById('bk-deleted-list');
  if (deletedBookings.length > 0 && delSection && delList) {
    delSection.style.display = 'block';
    delList.innerHTML = deletedBookings.map(function(b) {
      return '<div style="background:var(--cream);border:1px dashed var(--border);border-radius:10px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;">'
        + '<div><div style="font-weight:700;font-size:0.85rem;">' + b.client + ' — ' + b.service + '</div><div style="font-size:0.72rem;color:var(--text-dim);">' + b.date + ' · ' + b.time + '</div></div>'
        + '<button onclick="restoreBooking('+b.id+')" style="padding:6px 12px;background:var(--brown);color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:0.75rem;font-weight:700;">Restore</button>'
        + '</div>';
    }).join('');
  } else if (delSection) { delSection.style.display = 'none'; }
}

function openManageBooking(id) {
  var b = incomingBookings.find(function(x){ return x.id===id; });
  if (!b) return;
  document.getElementById('mbk-title').textContent = b.client + ' — ' + b.service;
  document.getElementById('mbk-meta').textContent = b.date + ' · ' + b.time + ' · ' + b.email;
  var el = document.getElementById('mbk-actions');
  var s = function(bg,col,brd){ return 'padding:11px;background:'+bg+';color:'+col+';border:'+(brd||'none')+';border-radius:10px;cursor:pointer;font-weight:700;font-size:0.82rem;width:100%;display:flex;align-items:center;justify-content:center;gap:7px;'; };
  var ic = function(p){ return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">'+p+'</svg>'; };
  el.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">'
    + '<button data-bka="reschedule" style="'+s('var(--cream)','var(--text)','1px solid var(--border)')+'">'+ic('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>')+'Reschedule & Send Client Link</button>'
    + '<button data-bka="deposit" style="'+s('var(--cream)','var(--text)','1px solid var(--border)')+'">'+ic('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>')+'Send Deposit Request</button>'
    + '<button data-bka="charge" style="'+s('var(--cream)','var(--text)','1px solid var(--border)')+'">'+ic('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>')+'Charge Fee (Late / No-Show / Cancel)</button>'
    + '<button data-bka="review" style="'+s('var(--cream)','var(--text)','1px solid var(--border)')+'">'+ic('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>')+'Send Review Questionnaire</button>'
    + '<button data-bka="cancel" style="'+s('#fee2e2','#dc2626','1px solid #fecaca')+'">'+ic('<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>') +'Cancel Booking</button>'
    + '<button data-bka="delete" style="'+s('#fff','#dc2626','1.5px solid #fecaca')+'">'+ic('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>')+'Delete Booking</button>'
    + '<button data-bka="ban" style="'+s('#1a0a00','#ef4444','1.5px solid #7f1d1d')+'">'+ic('<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>') + (b.banned ? 'Unban Client' : '⛔ Ban from Booking') + '</button>'
    + '</div>';
  el.querySelectorAll('button[data-bka]').forEach(function(btn) {
    btn.onclick = function() { handleBookingAction(btn.dataset.bka, b); };
  });
  openModal('modal-manage-booking');
}

function handleBookingAction(action, b) {
  closeModal('modal-manage-booking');
  if (action === 'reschedule') {
    document.getElementById('bk-reschedule-client').textContent = b.client + ' · ' + b.email;
    document.getElementById('bk-reschedule-date').value = '';
    document.getElementById('bk-reschedule-time').value = '';
    document.getElementById('bk-reschedule-msg').value = '';
    document.getElementById('bk-reschedule-confirm').onclick = function() {
      var d = document.getElementById('bk-reschedule-date').value;
      var t = document.getElementById('bk-reschedule-time').value;
      if (!d || !t) { toast('Enter new date and time'); return; }
      b.date = d; b.time = t;
      closeModal('modal-bk-reschedule');
      renderIncomingBookings();
      toast('✓ Reschedule link sent to ' + b.client + ' for ' + d + ' at ' + t);
    };
    openModal('modal-bk-reschedule');
  } else if (action === 'deposit') {
    document.getElementById('bk-deposit-client').textContent = b.client + ' · ' + b.email;
    document.getElementById('bk-deposit-amount').value = '';
    document.getElementById('bk-deposit-due').value = '';
    document.getElementById('bk-deposit-msg').value = '';
    document.getElementById('bk-deposit-confirm').onclick = function() {
      var amt = parseFloat(document.getElementById('bk-deposit-amount').value);
      if (!amt) { toast('Enter deposit amount'); return; }
      b.deposit = true; b.depositAmt = amt;
      closeModal('modal-bk-deposit');
      renderIncomingBookings();
      toast('✓ Deposit request of $' + amt.toFixed(2) + ' sent to ' + b.client);
    };
    openModal('modal-bk-deposit');
  } else if (action === 'charge') {
    document.getElementById('bk-charge-title').textContent = 'Charge Fee';
    document.getElementById('bk-charge-client').textContent = b.client + ' · ' + b.email;
    document.getElementById('bk-charge-amount').value = '';
    document.getElementById('bk-charge-note').value = '';
    document.getElementById('bk-charge-confirm').onclick = function() {
      var amt = parseFloat(document.getElementById('bk-charge-amount').value);
      var type = document.getElementById('bk-charge-type').value;
      if (!amt) { toast('Enter fee amount'); return; }
      closeModal('modal-bk-charge');
      toast('✓ ' + type + ' of $' + amt.toFixed(2) + ' charged to ' + b.client);
    };
    openModal('modal-bk-charge');
  } else if (action === 'review') {
    document.getElementById('bk-review-client').textContent = b.client + ' · ' + b.email;
    var preview = document.getElementById('bk-review-preview-questions');
    if (preview) preview.innerHTML = reviewQuestions.map(function(q,i) {
      return '<div style="margin-bottom:6px;"><strong>' + (i+1) + '. ' + q.q + '</strong><br>' + q.choices.join(' · ') + '</div>';
    }).join('');
    document.getElementById('bk-review-note').value = '';
    document.getElementById('bk-review-confirm').onclick = function() {
      closeModal('modal-bk-review');
      toast('✓ Review questionnaire sent to ' + b.client);
    };
    openModal('modal-bk-review');
  } else if (action === 'cancel') {
    b.status = 'cancelled';
    renderIncomingBookings();
    toast('Booking cancelled for ' + b.client);
  } else if (action === 'delete') {
    incomingBookings = incomingBookings.filter(function(x){ return x.id !== b.id; });
    deletedBookings.unshift(b);
    if (deletedBookings.length > 5) deletedBookings.pop();
    renderIncomingBookings();
    toast('Booking deleted · Tap Restore to undo');
  } else if (action === 'ban') {
    b.banned = !b.banned;
    renderIncomingBookings();
    toast(b.banned ? '⛔ ' + b.client + ' banned from booking' : '✓ ' + b.client + ' ban removed');
  }
}

function restoreBooking(id) {
  var b = deletedBookings.find(function(x){ return x.id===id; });
  if (!b) return;
  deletedBookings = deletedBookings.filter(function(x){ return x.id!==id; });
  incomingBookings.push(b);
  renderIncomingBookings();
  toast('✓ Booking restored for ' + b.client);
}

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

// ── SHOWCASE FULL PAGE PREVIEW ────────────────────────────
function openFullPagePreview() {
  var modal = document.getElementById('modal-full-page-preview');
  var content = document.getElementById('full-page-preview-content');
  if (!modal || !content) return;
  var t = TEMPLATES[SHOWCASE_ACTIVE];
  if (t) content.innerHTML = t.render();
  modal.classList.add('open');
}

// ═══════════════════════════════════════════════════════════════════════════
// MASSED API LAYER — connects every feature to the real backend
// ═══════════════════════════════════════════════════════════════════════════

var API_BASE = '/api';
var _currentUser = null;

// ── LOCAL STORAGE PERSISTENCE LAYER ──────────────────────────────────────
// Acts as a fallback when the backend is unreachable.
// All reads check localStorage first; all writes save to localStorage AND
// attempt the real API. When the backend comes online, replace this layer
// with real API calls only.

var LS_PREFIX = 'massed_';

var _lsStore = {
  get: function(key) {
    try { var v = localStorage.getItem(LS_PREFIX + key); return v ? JSON.parse(v) : null; } catch(e) { return null; }
  },
  set: function(key, val) {
    try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(val)); } catch(e) {}
  },
  del: function(key) {
    try { localStorage.removeItem(LS_PREFIX + key); } catch(e) {}
  }
};

// Generate a simple unique ID for local records
function _lsId() { return Date.now() + '_' + Math.random().toString(36).slice(2,7); }

// ── localStorage-backed API stubs ─────────────────────────────────────────
// Each function mirrors the real apiXxx() signature.
// When backend is live, these are bypassed by the real api() fetch.

function lsGetProfile()          { return _lsStore.get('profile') || {}; }
function lsSaveProfile(data)     { var p = Object.assign(lsGetProfile(), data); _lsStore.set('profile', p); return p; }

function lsGetWebLinks()         { return _lsStore.get('webLinks') || []; }
function lsSaveWebLinks(arr)     { _lsStore.set('webLinks', arr); }

function lsGetListings()         { return _lsStore.get('listings') || []; }
function lsSaveListings(arr)     { _lsStore.set('listings', arr); }

function lsGetProducts()         { return _lsStore.get('products') || { physical:[], digital:[], courses:[] }; }
function lsSaveProducts(obj)     { _lsStore.set('products', obj); }

function lsGetBookingServices()  { return _lsStore.get('bookingServices') || null; }
function lsSaveBookingServices(arr) { _lsStore.set('bookingServices', arr); }

function lsGetPosts()            { return _lsStore.get('posts') || null; }
function lsSavePosts(arr)        { _lsStore.set('posts', arr); }

function lsGetSubsMembers()      { return _lsStore.get('subsMembers') || null; }
function lsSaveSubsMembers(arr)  { _lsStore.set('subsMembers', arr); }

function lsGetUser()             { return _lsStore.get('currentUser') || null; }
function lsSaveUser(u)           { _lsStore.set('currentUser', u); }
function lsClearUser()           { _lsStore.del('currentUser'); }

// ── Restore in-memory state from localStorage on page load ────────────────
function lsRestoreAll() {
  // Profile / user
  var savedUser = lsGetUser();
  if (savedUser) { _currentUser = savedUser; }

  // Web links
  var savedLinks = lsGetWebLinks();
  if (savedLinks.length) { webLinks = savedLinks; }

  // Listings
  var savedListings = lsGetListings();
  if (savedListings.length) { listingsData = savedListings; }

  // Products
  var savedProducts = lsGetProducts();
  if (savedProducts.physical.length || savedProducts.digital.length || savedProducts.courses.length) {
    storeProducts = savedProducts;
  }

  // Booking services
  var savedBk = lsGetBookingServices();
  if (savedBk) { bookingServices = savedBk; }

  // Posts
  var savedPosts = lsGetPosts();
  if (savedPosts) { spPosts = savedPosts; }

  // Subscribers
  var savedSubs = lsGetSubsMembers();
  if (savedSubs) { subsMembers = savedSubs; }
}

// ── Auto-save hooks — call these whenever in-memory data changes ──────────
// Drop these one-liners into any function that mutates the arrays.
function lsPersistWebLinks()     { lsSaveWebLinks(webLinks); }
function lsPersistListings()     { lsSaveListings(listingsData); }
function lsPersistProducts()     { lsSaveProducts(storeProducts); }
function lsPersistBookings()     { lsSaveBookingServices(bookingServices); }
function lsPersistPosts()        { lsSavePosts(spPosts); }
function lsPersistSubsMembers()  { lsSaveSubsMembers(subsMembers); }

// ── Core fetch wrapper ────────────────────────────────────────────────────
async function api(method, path, body) {
  var opts = {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  };
  if (body && method !== 'GET') opts.body = JSON.stringify(body);
  try {
    var res = await fetch(API_BASE + path, opts);
    var data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    console.error('API error (falling back to localStorage):', path, err.message);
    throw err;
  }
}

// ── AUTH ──────────────────────────────────────────────────────────────────
async function apiRegister(email, password, displayName) {
  var data = await api('POST', '/auth/register', { email, password, display_name: displayName });
  _currentUser = data.user;
  lsSaveUser(_currentUser);
  return data;
}

async function apiLogin(email, password) {
  var data = await api('POST', '/auth/login', { email, password });
  _currentUser = data.user;
  lsSaveUser(_currentUser);
  return data;
}

async function apiLogout() {
  await api('DELETE', '/auth/me');
  _currentUser = null;
  lsClearUser();
  showLoginScreen();
}

async function apiGetMe() {
  try {
    var user = await api('GET', '/auth/me');
    _currentUser = user;
    return user;
  } catch(e) { return null; }
}

// ── PROFILE ───────────────────────────────────────────────────────────────
async function apiSaveProfile(data) {
  return await api('PUT', '/profile', data);
}

// ── PRODUCTS ──────────────────────────────────────────────────────────────
async function apiGetProducts(type) {
  return await api('GET', '/products' + (type ? '?type=' + type : ''));
}
async function apiCreateProduct(data) {
  return await api('POST', '/products', data);
}
async function apiUpdateProduct(id, data) {
  return await api('PUT', '/products/' + id, data);
}
async function apiDeleteProduct(id) {
  return await api('DELETE', '/products/' + id);
}
async function apiToggleProductVisibility(id, visible) {
  return await api('PATCH', '/products/' + id, { visible });
}

// ── WEB LINKS ─────────────────────────────────────────────────────────────
async function apiGetWebLinks() {
  return await api('GET', '/weblinks');
}
async function apiCreateWebLink(data) {
  return await api('POST', '/weblinks', data);
}
async function apiUpdateWebLink(id, data) {
  return await api('PUT', '/weblinks/' + id, data);
}
async function apiDeleteWebLink(id) {
  return await api('DELETE', '/weblinks/' + id);
}

// ── LISTINGS ──────────────────────────────────────────────────────────────
async function apiGetListings(category) {
  return await api('GET', '/listings' + (category && category !== 'all' ? '?category=' + category : ''));
}
async function apiCreateListing(data) {
  return await api('POST', '/listings', data);
}
async function apiUpdateListing(id, data) {
  return await api('PUT', '/listings/' + id, data);
}
async function apiDeleteListing(id) {
  return await api('DELETE', '/listings/' + id);
}

// ── BOOKINGS ──────────────────────────────────────────────────────────────
async function apiGetBookings() {
  return await api('GET', '/bookings');
}
async function apiCreateService(data) {
  return await api('POST', '/bookings', data);
}
async function apiUpdateBooking(id, data) {
  return await api('PATCH', '/bookings/' + id, data);
}
async function apiDeleteBooking(id) {
  return await api('DELETE', '/bookings/' + id);
}

// ── LOGIN / REGISTER SCREEN ───────────────────────────────────────────────
// ── LOAD ALL DATA ON LOGIN ────────────────────────────────────────────────
async function loadAllData() {
  if (!_currentUser) return;

  // Pre-fill profile fields from saved data
  if (_currentUser.display_name) {
    var nameEl = document.querySelector('#mptab-profile-content input[placeholder="Your name"]');
    if (nameEl) nameEl.value = _currentUser.display_name;
    var titleEl = document.querySelector('#mptab-profile-content input[placeholder="e.g. UGC Creator, Beauty Consultant"]');
    if (titleEl && _currentUser.title) titleEl.value = _currentUser.title;
    var bioEl = document.querySelector('#mptab-profile-content textarea');
    if (bioEl && _currentUser.bio) bioEl.value = _currentUser.bio;

    // Auto-activate dashboard if profile exists
    var dbAvatar = document.getElementById('db-avatar');
    var dbName = document.getElementById('db-name');
    var dbLink = document.getElementById('db-link');
    var handle = _currentUser.username || _currentUser.display_name.toLowerCase().replace(/\s+/g,'');
    if (dbAvatar) dbAvatar.textContent = _currentUser.display_name.charAt(0).toUpperCase();
    if (dbName) dbName.textContent = _currentUser.display_name;
    if (dbLink) dbLink.textContent = 'massed.io/' + handle;
    var welcome = document.getElementById('dashboard-welcome');
    var main = document.getElementById('dashboard-main');
    if (welcome) welcome.style.display = 'none';
    if (main) main.style.display = 'block';
  }

  // Load web links
  try {
    var links = await apiGetWebLinks();
    webLinks = links.map(function(l) {
      return { id: l.id, title: l.title, url: l.url, subtitle: l.subtitle, cover: l.cover_url, visible: l.visible };
    });
    lsPersistWebLinks();
    renderWebLinks();
  } catch(e) {
    var saved = lsGetWebLinks();
    if (saved.length) { webLinks = saved; renderWebLinks(); }
  }

  // Load listings
  try {
    var listings = await apiGetListings();
    listingsData = listings.map(function(l) {
      return { id: l.id, title: l.title, category: l.category, cta: l.cta_label, price: l.price, contactForPrice: l.contact_for_price, location: l.location, desc: l.description, photos: l.photos || [], extra: l.extra_fields, visible: l.visible };
    });
    lsPersistListings();
    renderListings('all');
  } catch(e) {
    var savedL = lsGetListings();
    if (savedL.length) { listingsData = savedL; renderListings('all'); }
  }

  // Load products
  try {
    var products = await apiGetProducts();
    storeProducts = { physical: [], digital: [], courses: [] };
    products.forEach(function(p) {
      var storeType = p.type === 'course' ? 'courses' : p.type;
      storeProducts[storeType].push({
        id: p.id, name: p.name, price: p.price, desc: p.description,
        type: p.type, photo: p.cover_url, sizes: p.sizes || [], colors: p.colors || [],
        variants: p.variants || [], inventory: p.inventory, lowStock: p.low_stock_alert,
        preorder: p.allow_preorder, hidden: !p.visible
      });
    });
    lsPersistProducts();
    ['physical','digital','courses'].forEach(function(t) {
      var grid = document.getElementById('store-' + t + '-grid');
      if (grid) renderStoreGrid(t);
    });
  } catch(e) {
    var savedP = lsGetProducts();
    if (savedP.physical.length || savedP.digital.length || savedP.courses.length) {
      storeProducts = savedP;
      ['physical','digital','courses'].forEach(function(t) {
        var grid = document.getElementById('store-' + t + '-grid');
        if (grid) renderStoreGrid(t);
      });
    }
  }

  // Load bookings
  try {
    var bkData = await apiGetBookings();
    if (bkData.services) {
      bookingServices = bkData.services.map(function(s) {
        return { id: s.id, name: s.name, price: s.price, duration: s.duration, category: s.category, desc: s.description, cover: s.cover_url, deposit: s.deposit_required, depositAmt: s.deposit_amount, depositType: s.deposit_type, visible: s.visible };
      });
      lsPersistBookings();
    }
    if (bkData.bookings) incomingBookings = bkData.bookings.map(function(b) {
      return { id: b.id, client: b.client_name, email: b.client_email, service: b.service_name, date: b.booking_date, time: b.booking_time, status: b.status, depositPaid: b.deposit_paid, banned: b.banned };
    });
    renderBookingServices();
  } catch(e) {
    var savedBk = lsGetBookingServices();
    if (savedBk) { bookingServices = savedBk; renderBookingServices(); }
  }

  toast('✓ Welcome back, ' + (_currentUser.display_name || 'creator') + '!');
  // Navigate to dashboard now that data is loaded
  setTimeout(function() { nav(document.querySelector('.nav-item'), 'dashboard'); }, 100);
}
// ── OVERRIDE SAVE FUNCTIONS TO ALSO PERSIST TO DB ────────────────────────

// Wrap saveProfile to also call API
var _origSaveProfile = saveProfile;
saveProfile = async function() {
  _origSaveProfile();
  // Always persist profile fields to localStorage immediately
  var nameEl = document.querySelector('#mptab-profile-content input[placeholder="Your name"]');
  var titleEl = document.querySelector('#mptab-profile-content input[placeholder="e.g. UGC Creator, Beauty Consultant"]');
  var bioEl = document.querySelector('#mptab-profile-content textarea');
  var profileData = {
    display_name: nameEl ? nameEl.value.trim() : undefined,
    title: titleEl ? titleEl.value.trim() : undefined,
    bio: bioEl ? bioEl.value.trim() : undefined,
  };
  if (_currentUser) { Object.assign(_currentUser, profileData); lsSaveUser(_currentUser); }
  lsSaveProfile(profileData);
  if (!_currentUser) return;
  try {
    var categoryEl = document.getElementById('mp-category');
    var emailEl = document.querySelector('#mptab-profile-content input[type="email"]');
    var phoneEl = document.querySelector('#mptab-profile-content input[type="tel"]');
    var websiteEl = document.querySelector('#mptab-profile-content input[type="url"]');
    await apiSaveProfile({
      display_name: profileData.display_name,
      title: profileData.title,
      bio: profileData.bio,
      category: categoryEl ? categoryEl.value : undefined,
      phone: phoneEl ? phoneEl.value.trim() : undefined,
      website: websiteEl ? websiteEl.value.trim() : undefined,
      email: emailEl ? emailEl.value.trim() : undefined,
    });
  } catch(e) { console.error('Profile save failed:', e); }
};

// Wrap storePublishProduct to also persist
var _origPublish = storePublishProduct;
storePublishProduct = async function(type) {
  _origPublish(type);
  lsPersistProducts();
  if (!_currentUser) return;
  try {
    var nameMap = { physical: 'ph-name', digital: 'dg-name', course: 'co-cname' };
    var priceMap = { physical: 'ph-price', digital: 'dg-price', course: 'co-price' };
    var descMap = { physical: 'ph-desc', digital: 'dg-desc', course: 'co-desc' };
    var name = (document.getElementById(nameMap[type]) || {}).value || '';
    var price = parseFloat((document.getElementById(priceMap[type]) || {}).value || 0);
    var desc = (document.getElementById(descMap[type]) || {}).value || '';
    if (!name) return;
    await apiCreateProduct({ type, name, price, description: desc, visible: true });
  } catch(e) { console.error('Product save failed:', e); }
};

// Wrap addWebLink to persist
var _origAddWebLink = typeof addWebLink === 'function' ? addWebLink : null;
if (_origAddWebLink) {
  addWebLink = async function() {
    _origAddWebLink();
    lsPersistWebLinks();
    if (!_currentUser || !webLinks.length) return;
    try {
      var newest = webLinks[webLinks.length - 1];
      await apiCreateWebLink({ title: newest.title, url: newest.url, subtitle: newest.subtitle, cover_url: newest.cover });
    } catch(e) { console.error('Web link save failed:', e); }
  };
}

// Wrap deleteWebLink to also delete from DB
var _origDeleteWebLink = deleteWebLink;
deleteWebLink = async function(id) {
  _origDeleteWebLink(id);
  lsPersistWebLinks();
  if (!_currentUser) return;
  try { await apiDeleteWebLink(id); } catch(e) {}
};

// Wrap toggleWebLinkVisibility
var _origToggleVis = toggleWebLinkVisibility;
toggleWebLinkVisibility = async function(id) {
  _origToggleVis(id);
  lsPersistWebLinks();
  if (!_currentUser) return;
  try {
    var link = webLinks.find(function(l){ return l.id === id; });
    if (link) await apiUpdateWebLink(id, { visible: link.visible });
  } catch(e) {}
};

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

// ── SPARK FOUNDER ─────────────────────────────────────────────────────────────


// ── BOOT — single DOMContentLoaded, all init in one place ────────────────
document.addEventListener('DOMContentLoaded', function() {

  // 1. Restore localStorage data into memory arrays
  lsRestoreAll();

  // 2. Patch nav() once — camera stop + mobile layout on every navigation
  var _origNav = nav;
  nav = function(el, screen) {
    try { if (typeof cameraStream !== 'undefined' && cameraStream && screen !== 'scanner') stopCamera(); } catch(e) {}
    _origNav(el, screen);
    // Only run layout fix on mobile, batched in the same frame as the nav paint
    if (window.innerWidth <= 1024) {
      requestAnimationFrame(applyMobileLayouts);
    }
  };

  // 3. Map tooltips
  var tooltip = document.getElementById('map-tooltip');
  if (tooltip) {
    document.querySelectorAll('.us-state').forEach(function(s) {
      s.style.cursor = 'pointer';
      s.addEventListener('mouseenter', function(e) { tooltip.style.display='block'; tooltip.textContent=s.getAttribute('data-state')+' — '+s.getAttribute('data-traffic'); });
      s.addEventListener('mousemove',  function(e) { var rect=s.closest('svg').parentElement.getBoundingClientRect(); tooltip.style.left=(e.clientX-rect.left+8)+'px'; tooltip.style.top=(e.clientY-rect.top-30)+'px'; });
      s.addEventListener('mouseleave', function()  { tooltip.style.display='none'; });
    });
  }

  // 4. If a saved user session exists, populate dashboard header
  if (_currentUser) {
    var handle  = _currentUser.username || (_currentUser.display_name || '').toLowerCase().replace(/\s+/g,'');
    var dbAvatar = document.getElementById('db-avatar');
    var dbName   = document.getElementById('db-name');
    var dbLink   = document.getElementById('db-link');
    var welcome  = document.getElementById('dashboard-welcome');
    var mainEl   = document.getElementById('dashboard-main');
    if (dbAvatar) dbAvatar.textContent  = (_currentUser.display_name || '?').charAt(0).toUpperCase();
    if (dbName)   dbName.textContent    = _currentUser.display_name || '';
    if (dbLink)   dbLink.textContent    = 'massed.io/' + handle;
    if (welcome)  welcome.style.display = 'none';
    if (mainEl)   mainEl.style.display  = 'block';
  }

  // 5. Single deferred frame — ALL renders happen once, together, after DOM settles
  requestAnimationFrame(function() {

    // Navigation — activates first screen, hides all others
    nav(document.querySelector('.nav-item'), 'dashboard');

    // Booking
    renderBookingServices();
    renderReviewQuestions();
    var badge = document.getElementById('bk-incoming-badge');
    if (badge) badge.textContent = incomingBookings.length;

    // Subscribers
    renderSubsTable();

    // Showcase
    buildShowcaseCards();
    var showcaseScreen = document.getElementById('showcase-phone-screen');
    if (showcaseScreen && typeof TEMPLATES !== 'undefined' && TEMPLATES[SHOWCASE_ACTIVE]) {
      showcaseScreen.innerHTML = TEMPLATES[SHOWCASE_ACTIVE].render();
    }

    // Forms
    if (typeof bioAddQuestion === 'function') bioAddQuestion();

    // If user is logged in, render data screens
    if (_currentUser) {
      renderWebLinks();
      renderListings('all');
      ['physical','digital','courses'].forEach(function(t) {
        var grid = document.getElementById('store-' + t + '-grid');
        if (grid) renderStoreGrid(t);
      });
    }

    // Mobile layout fixes — run last, after all renders
    applyMobileLayouts();

    // Reveal the app — everything is positioned and rendered, no flash
    document.body.style.visibility = 'visible';
  });
});
