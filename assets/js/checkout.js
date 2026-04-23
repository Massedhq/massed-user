// ================================
// CHECKOUT & PAYMENTS
// ================================





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

function goCheckoutStep2() {
  var step1 = document.getElementById('checkout-step-1');
  var step2 = document.getElementById('checkout-step-2');
  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'block';
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