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