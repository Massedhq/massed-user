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