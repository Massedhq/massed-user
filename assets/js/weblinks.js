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

// Global exposure
window.saveWebLink = saveWebLink;
window.saveEditWebLink = saveEditWebLink;
