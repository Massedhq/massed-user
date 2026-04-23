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




// GLOBAL EXPOSURE (VAULT)
window.spAddToVault = spAddToVault;
window.vaultModalSave = vaultModalSave;
window.vaultModalSelectCat = vaultModalSelectCat;
window.vaultDelete = vaultDelete;
window.vaultSave = vaultSave;
window.vaultTab = vaultTab;