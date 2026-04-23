// ── LISTINGS ─────────────────────────────────────────────
var listingsData = [];
var lstPhotos = [null, null, null, null];

function listingsTab(tab, btn) {
  var tabs = document.querySelectorAll('[id^="ltab-"]');
  tabs.forEach(function(b){
    b.style.background = 'transparent';
    b.style.color = 'var(--text-dim)';
  });
  if (btn) { btn.style.background = 'var(--brown)'; btn.style.color = '#fff'; }

  var grid = document.getElementById('listings-grid');
  var empty = document.getElementById('listings-empty');
  var refunds = document.getElementById('listings-refunds-content');
  var addBtn = document.getElementById('listings-add-btn');

  if (tab === 'refunds') {
    if (grid) grid.style.display = 'none';
    if (empty) empty.style.display = 'none';
    if (refunds) refunds.style.display = 'block';
    if (addBtn) addBtn.style.display = 'none';
    return;
  }
  if (refunds) refunds.style.display = 'none';
  if (addBtn) addBtn.style.display = 'flex';
  renderListings(tab);
}

function renderListings(filter) {
  var grid = document.getElementById('listings-grid');
  var empty = document.getElementById('listings-empty');
  if (!grid) return;
  grid.style.display = 'grid';
  grid.innerHTML = '';

  var filtered = filter === 'all'
    ? listingsData
    : listingsData.filter(function(l){ return l.cat === filter; });

  if (filtered.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  var ctaLabels = { contact:'Contact', apply:'Apply Now', request:'Request Info', reserve:'Reserve Interest', book:'Book a Viewing', inquire:'Inquire Now' };
  var catEmojis = { realestate:'🏠', cars:'🚗', spaces:'🏢', jobs:'💼', experiences:'✨' };

  filtered.forEach(function(l) {
    var card = document.createElement('div');
    card.id = 'lst-card-' + l.id;
    card.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:box-shadow 0.2s,opacity 0.2s;opacity:' + (l.hidden ? '0.5' : '1') + ';';
    card.onmouseover = function(){ card.style.boxShadow = '0 6px 24px rgba(44,26,14,0.1)'; };
    card.onmouseout = function(){ card.style.boxShadow = 'none'; };

    var imgHTML = l.photo
      ? '<img src="'+l.photo+'" style="width:100%;height:100%;object-fit:cover;">'
      : '<span style="font-size:3rem;">' + (catEmojis[l.cat] || '📋') + '</span>';

    var priceHTML = l.contactPrice
      ? '<span style="font-size:0.8rem;font-weight:700;color:var(--brown);background:var(--brown-bg);padding:3px 9px;border-radius:12px;">Contact for price</span>'
      : '<span style="font-weight:800;color:var(--brown);font-size:1rem;">' + (l.price || '') + '</span>';

    card.innerHTML =
      '<div style="height:175px;background:var(--cream2);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">'
        + imgHTML
        + '<div style="position:absolute;top:10px;left:10px;background:rgba(44,26,14,0.7);color:#fff;font-size:0.65rem;font-weight:700;padding:3px 9px;border-radius:10px;letter-spacing:0.06em;text-transform:uppercase;">' + (catEmojis[l.cat]||'') + ' ' + l.catLabel + '</div>'
      + '</div>'
      + '<div style="padding:16px;">'
        + '<div style="font-weight:800;font-size:0.95rem;margin-bottom:4px;line-height:1.3;">' + l.title + '</div>'
        + '<div style="font-size:0.78rem;color:var(--text-dim);margin-bottom:8px;display:flex;align-items:center;gap:5px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>' + l.location + '</div>'
        + '<div style="margin-bottom:12px;">' + priceHTML + '</div>'
        + '<div style="font-size:0.8rem;color:var(--text-mid);line-height:1.5;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">' + l.desc + '</div>'
        + '<div style="display:flex;gap:7px;flex-wrap:wrap;">'
          + '<button onclick="lstOpenInquiry(' + l.id + ')" style="flex:1;padding:9px;background:linear-gradient(135deg,var(--brown-light),var(--brown-dark));color:#fff;border:none;border-radius:9px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-weight:700;font-size:0.8rem;box-shadow:0 2px 8px rgba(192,122,80,0.3);">' + (ctaLabels[l.cta]||'Contact') + '</button>'
          + '<button onclick="lstPreviewListing(' + l.id + ')" style="padding:9px 12px;background:var(--brown-bg);border:1px solid var(--border);border-radius:9px;cursor:pointer;font-size:0.85rem;" title="Preview">👁</button>'
          + '<button id="lst-hide-btn-' + l.id + '" onclick="lstHideListing(' + l.id + ')" style="padding:9px 12px;background:var(--cream);border:1px solid var(--border);border-radius:9px;cursor:pointer;font-size:0.82rem;font-weight:700;font-family:\'DM Sans\',sans-serif;color:var(--text-mid);" title="' + (l.hidden ? 'Show listing' : 'Hide listing') + '">' + (l.hidden ? '🚫 Hidden' : '👁 Visible') + '</button>'
          + '<button onclick="lstEditListing(' + l.id + ')" style="padding:9px 12px;background:var(--cream);border:1px solid var(--border);border-radius:9px;cursor:pointer;font-size:0.85rem;" title="Edit">✏️</button>'
          + '<button onclick="lstDeleteListing(' + l.id + ')" style="padding:9px 12px;background:#fee2e2;border:none;border-radius:9px;cursor:pointer;font-size:0.85rem;" title="Delete">🗑</button>'
        + '</div>'
      + '</div>';
    grid.appendChild(card);
  });
}

function lstCategoryChange(val) {
  ['realestate','cars','jobs'].forEach(function(t){
    var f = document.getElementById('lst-'+t+'-fields');
    if (f) f.style.display = 'none';
  });
  if (val && document.getElementById('lst-'+val+'-fields')) {
    document.getElementById('lst-'+val+'-fields').style.display = 'block';
  }
}

function lstTriggerPhoto(idx) {
  document.getElementById('lst-photo-' + idx).click();
}
function lstPhotoUploaded(idx, input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    lstPhotos[idx] = e.target.result;
    var slot = document.getElementById('lst-slot-' + idx);
    if (slot) {
      slot.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">';
      slot.style.border = '2px solid var(--brown)';
      slot.style.padding = '0';
    }
  };
  reader.readAsDataURL(file);
}

function lstSendPaymentLink() {
  var to = (document.getElementById('lst-paylink-to')||{}).value;
  var amt = (document.getElementById('lst-paylink-amount')||{}).value;
  if (!to || !amt) { toast('Enter amount and recipient'); return; }
  toast('💳 Payment link for $' + parseFloat(amt).toFixed(2) + ' sent to ' + to);
}
function lstSendDepositLink() {
  var to = (document.getElementById('lst-deposit-to')||{}).value;
  var amt = (document.getElementById('lst-deposit-amount')||{}).value;
  if (!to || !amt) { toast('Enter amount and recipient'); return; }
  toast('🔒 Deposit link for $' + parseFloat(amt).toFixed(2) + ' sent to ' + to);
}

function lstPublish() {
  var title = (document.getElementById('lst-title')||{}).value||'';
  var catSel = document.getElementById('lst-category');
  var cta = (document.getElementById('lst-cta')||{}).value||'contact';
  var price = (document.getElementById('lst-price')||{}).value||'';
  var contactPrice = (document.getElementById('lst-contact-price')||{}).checked;
  var location = (document.getElementById('lst-location')||{}).value||'';
  var desc = (document.getElementById('lst-desc')||{}).value||'';

  if (!title.trim()) { toast('Please enter a listing title'); return; }
  if (!catSel || !catSel.value) { toast('Please select a category'); return; }
  if (!location.trim()) { toast('Please enter a location'); return; }
  if (!desc.trim()) { toast('Please enter a description'); return; }

  var catVal = catSel.value;
  var catLabel = catSel.options[catSel.selectedIndex].text.replace(/^[^\w]*/, '').trim();
  var id = Date.now();

  listingsData.push({
    id: id, title: title.trim(), cat: catVal, catLabel: catLabel,
    cta: cta, price: price, contactPrice: contactPrice,
    location: location.trim(), desc: desc.trim(),
    photo: lstPhotos[0], photo1: lstPhotos[1], photo2: lstPhotos[2], photo3: lstPhotos[3],
    // Real estate
    beds:  (document.getElementById('lst-beds')  ||{}).value || '',
    baths: (document.getElementById('lst-baths') ||{}).value || '',
    sqft:  (document.getElementById('lst-sqft')  ||{}).value || '',
    // Cars
    year:    (document.getElementById('lst-year')    ||{}).value || '',
    make:    (document.getElementById('lst-make')    ||{}).value || '',
    mileage: (document.getElementById('lst-mileage') ||{}).value || '',
    // Jobs
    pay:      (document.getElementById('lst-pay')      ||{}).value || '',
    worktype: (document.getElementById('lst-worktype') ||{}).value || ''
  });
  lsPersistListings();

  // Reset form
  ['lst-title','lst-price','lst-location','lst-desc'].forEach(function(fid){
    var el = document.getElementById(fid); if(el) el.value='';
  });
  lstPhotos = [null,null,null,null];
  for (var i = 0; i < 4; i++) {
    var slot = document.getElementById('lst-slot-' + i);
    if (slot) {
      slot.innerHTML = i === 0 ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--brown-light)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Main' : '+';
      slot.style.border = '2px dashed var(--border)'; slot.style.padding = '';
    }
  }

  closeModal('modal-add-listing');
  renderListings('all');
  // Switch to All tab
  var allBtn = document.getElementById('ltab-all');
  if (allBtn) listingsTab('all', allBtn);
  toast('✓ Listing "' + title + '" published!');
}

function lstOpenInquiry(id) {
  var l = listingsData.find(function(x){ return x.id === id; });
  if (!l) return;
  var ctaLabels = { contact:'Contact', apply:'Apply Now', request:'Request Info', reserve:'Reserve Interest', book:'Book a Viewing', inquire:'Inquire Now' };
  var titleEl = document.getElementById('lst-inquiry-title');
  var nameEl = document.getElementById('lst-inquiry-listing-name');
  if (titleEl) titleEl.textContent = ctaLabels[l.cta] || 'Contact';
  if (nameEl) nameEl.textContent = l.title;

  // Always reset to form step
  var formStep = document.getElementById('lst-inq-form-step');
  var sentStep = document.getElementById('lst-inq-sent-step');
  if (formStep) formStep.style.display = 'block';
  if (sentStep) sentStep.style.display = 'none';

  // Clear fields
  ['lst-inq-name','lst-inq-email','lst-inq-phone','lst-inq-message','lst-paylink-amount','lst-paylink-to','lst-deposit-amount','lst-deposit-to'].forEach(function(fid){
    var el = document.getElementById(fid); if(el) el.value='';
  });

  openModal('modal-listing-inquiry');
}
function lstSubmitInquiry() {
  var name = (document.getElementById('lst-inq-name')||{}).value||'';
  var email = (document.getElementById('lst-inq-email')||{}).value||'';
  if (!name.trim()) { toast('Please enter your name'); return; }
  if (!email.trim()) { toast('Please enter your email'); return; }

  // Hide the form step, show the post-inquiry step
  var formStep = document.getElementById('lst-inq-form-step');
  var sentStep = document.getElementById('lst-inq-sent-step');
  if (formStep) formStep.style.display = 'none';
  if (sentStep) sentStep.style.display = 'block';

  // Pre-fill send-to fields with the customer's contact info
  var contact = email || (document.getElementById('lst-inq-phone')||{}).value || '';
  var payTo = document.getElementById('lst-paylink-to');
  var depTo = document.getElementById('lst-deposit-to');
  if (payTo && !payTo.value) payTo.value = contact;
  if (depTo && !depTo.value) depTo.value = contact;
}

function lstPreviewListing(id) {
  var l = listingsData.find(function(x){ return x.id === id; });
  if (!l) return;
  var ctaLabels = { contact:'Contact', apply:'Apply Now', request:'Request Info', reserve:'Reserve Interest', book:'Book a Viewing', inquire:'Inquire Now' };
  var catEmojis = { realestate:'🏠', cars:'🚗', spaces:'🏢', jobs:'💼', experiences:'✨' };

  // Build image gallery
  var photos = [l.photo, l.photo1, l.photo2, l.photo3].filter(Boolean);
  var mainImg = photos.length
    ? '<img src="'+photos[0]+'" id="lpv-main-img" style="width:100%;height:100%;object-fit:cover;">'
    : '<div id="lpv-main-img" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:4rem;">' + (catEmojis[l.cat]||'📋') + '</div>';

  var thumbsHTML = photos.length > 1
    ? photos.map(function(src, i){
        return '<div onclick="lpvSetMain(\''+src+'\')" style="width:60px;height:60px;border-radius:8px;overflow:hidden;border:2px solid '+(i===0?'var(--brown)':'var(--border)')+';cursor:pointer;flex-shrink:0;"><img src="'+src+'" style="width:100%;height:100%;object-fit:cover;"></div>';
      }).join('')
    : '';

  var priceHTML = l.contactPrice
    ? '<span style="font-size:0.88rem;font-weight:700;color:var(--brown);background:var(--brown-bg);padding:4px 12px;border-radius:12px;">Contact for price</span>'
    : '<span style="font-weight:800;font-size:1.2rem;color:var(--text);">' + (l.price||'') + '</span>';

  // Extra details badges
  var extras = [];
  if (l.beds)    extras.push('🛏 ' + l.beds + ' bed' + (l.beds>1?'s':''));
  if (l.baths)   extras.push('🚿 ' + l.baths + ' bath' + (l.baths>1?'s':''));
  if (l.sqft)    extras.push('📐 ' + l.sqft + ' sq ft');
  if (l.year)    extras.push('📅 ' + l.year);
  if (l.make)    extras.push('🚗 ' + l.make);
  if (l.mileage) extras.push('🛣 ' + l.mileage);
  if (l.pay)     extras.push('💰 ' + l.pay);
  if (l.worktype)extras.push('⏱ ' + l.worktype);
  var extrasHTML = extras.length
    ? '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">'
        + extras.map(function(e){ return '<span style="padding:5px 12px;background:var(--cream);border:1px solid var(--border);border-radius:20px;font-size:0.78rem;font-weight:600;color:var(--text-mid);">'+e+'</span>'; }).join('')
      + '</div>'
    : '';

  var el = document.getElementById('modal-listing-preview');
  if (!el) return;

  el.querySelector('#lpv-gallery-main').innerHTML = mainImg;
  el.querySelector('#lpv-thumbs-row').innerHTML   = thumbsHTML;
  el.querySelector('#lpv-category-badge').textContent = (catEmojis[l.cat]||'') + ' ' + (l.catLabel||'');
  el.querySelector('#lpv-title').textContent      = l.title;
  el.querySelector('#lpv-location').textContent   = l.location;
  el.querySelector('#lpv-price-row').innerHTML    = priceHTML;
  el.querySelector('#lpv-extras').innerHTML       = extrasHTML;
  el.querySelector('#lpv-desc').textContent       = l.desc;
  el.querySelector('#lpv-cta-btn').textContent    = ctaLabels[l.cta] || 'Contact';
  el.querySelector('#lpv-cta-btn').onclick        = function(){ closeModal('modal-listing-preview'); lstOpenInquiry(id); };
  el.querySelector('#lpv-edit-btn').onclick       = function(){ closeModal('modal-listing-preview'); lstEditListing(id); };
  openModal('modal-listing-preview');
}

function lpvSetMain(src) {
  var el = document.getElementById('lpv-gallery-main');
  if (el) el.innerHTML = '<img src="'+src+'" id="lpv-main-img" style="width:100%;height:100%;object-fit:cover;">';
  // Highlight active thumb
  var thumbs = document.querySelectorAll('#lpv-thumbs-row div');
  thumbs.forEach(function(t){ t.style.borderColor = 'var(--border)'; });
}

function lstEditListing(id) {
  var l = listingsData.find(function(x){ return x.id === id; });
  if (!l) return;

  // Populate edit modal
  document.getElementById('lst-edit-id').value       = id;
  document.getElementById('lst-edit-title').value    = l.title || '';
  document.getElementById('lst-edit-price').value    = l.price || '';
  document.getElementById('lst-edit-location').value = l.location || '';
  document.getElementById('lst-edit-desc').value     = l.desc || '';
  document.getElementById('lst-edit-cta').value      = l.cta || 'contact';

  var cpCb = document.getElementById('lst-edit-contact-price');
  if (cpCb) { cpCb.checked = !!l.contactPrice; document.getElementById('lst-edit-price').disabled = !!l.contactPrice; }

  // Show current main photo
  var photoWrap = document.getElementById('lst-edit-photo-preview');
  if (photoWrap) {
    photoWrap.innerHTML = l.photo
      ? '<img src="'+l.photo+'" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;">'
      : '<div style="font-size:0.78rem;color:var(--text-dim);margin-bottom:8px;">No photo uploaded</div>';
  }
  openModal('modal-edit-listing');
}

function lstSaveEdit() {
  var id  = parseInt(document.getElementById('lst-edit-id').value);
  var l   = listingsData.find(function(x){ return x.id === id; });
  if (!l) return;

  l.title    = document.getElementById('lst-edit-title').value.trim()    || l.title;
  l.price    = document.getElementById('lst-edit-price').value.trim()    || l.price;
  l.location = document.getElementById('lst-edit-location').value.trim() || l.location;
  l.desc     = document.getElementById('lst-edit-desc').value.trim()     || l.desc;
  l.cta      = document.getElementById('lst-edit-cta').value             || l.cta;
  l.contactPrice = document.getElementById('lst-edit-contact-price').checked;

  // New photo
  var newPhoto = document.getElementById('lst-edit-photo-input');
  if (newPhoto && newPhoto.files && newPhoto.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      l.photo = e.target.result;
      renderListings('all');
    };
    reader.readAsDataURL(newPhoto.files[0]);
  } else {
    renderListings('all');
  }

  closeModal('modal-edit-listing');
  lsPersistListings();
  toast('✓ Listing updated!');
}
function lstHideListing(id) {
  var l = listingsData.find(function(x){ return x.id === id; });
  if (!l) return;
  l.hidden = !l.hidden;

  // Update card opacity
  var card = document.getElementById('lst-card-' + id);
  if (card) card.style.opacity = l.hidden ? '0.5' : '1';

  // Update button label
  var btn = document.getElementById('lst-hide-btn-' + id);
  if (btn) {
    btn.textContent = l.hidden ? '🚫 Hidden' : '👁 Visible';
    btn.title = l.hidden ? 'Show listing' : 'Hide listing';
  }

  toast(l.hidden ? 'Listing hidden from public' : 'Listing is now visible');
  lsPersistListings();
}

function lstFormatPrice(input) {
  var val = input.value;
  // Remove all leading $ signs first to avoid doubling
  val = val.replace(/^\$+/, '');
  // Only prepend $ if there's actual content and it doesn't start with $
  if (val.length > 0) {
    input.value = '$' + val;
  }
}

function lstDeleteListing(id) {
  listingsData = listingsData.filter(function(l){ return l.id !== id; });
  lsPersistListings();
  renderListings('all');
  toast('Listing deleted');
}

// Global exposure
window.renderListings = renderListings;