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

// Global exposure
window.saveProfile = saveProfile;
window.toggleGenre = toggleGenre;