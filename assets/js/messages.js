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


function msgAction(action) {
  if (!activeMsgId) { toast('Select a conversation first'); return; }
  var c = msgConversations.find(function(x){return x.id===activeMsgId;});
  if (action === 'mute') { toast('🔇 ' + (c?c.name:'Conversation') + ' muted'); }
  else if (action === 'block') { if(confirm('Block '+(c?c.name:'this user')+'? They will no longer be able to message you.')) { msgConversations = msgConversations.filter(function(x){return x.id!==activeMsgId;}); activeMsgId=null; renderConvoList(); document.getElementById('msg-active-name').textContent='Select a conversation'; document.getElementById('msg-thread-empty').style.display='flex'; toast('User blocked'); } }
  else if (action === 'delete') { if(confirm('Delete this conversation? This cannot be undone.')) { msgConversations = msgConversations.filter(function(x){return x.id!==activeMsgId;}); activeMsgId=null; renderConvoList(); document.getElementById('msg-active-name').textContent='Select a conversation'; document.getElementById('msg-thread-empty').style.display='flex'; toast('Conversation deleted'); } }
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

// Global exposure
window.renderConvoList = renderConvoList;
// ================================
// GLOBAL EXPOSURE (MESSAGES)
// ================================
window.spMsgInit = spMsgInit;