// ================================
// TICKET SYSTEM
// ================================

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

// ── TICKET NUMBER GENERATION ──────────────────────────
function generateTicketNumber(evId, tierType, index) {
  const evPart = evId.toString().slice(-5).toUpperCase();
  const tierPart = tierType.replace(/[^A-Z]/gi,'').substring(0,3).toUpperCase().padEnd(3,'X');
  const numPart = String(index).padStart(4,'0');
  return `TKT-${evPart}-${tierPart}-${numPart}`;
}
