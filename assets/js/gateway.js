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