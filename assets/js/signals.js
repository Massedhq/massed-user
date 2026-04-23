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



window.renderSignalsTab = renderSignalsTab;
