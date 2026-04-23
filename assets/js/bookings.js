
// ── BOOKING ────────────────────────────────────────────────────────────────────
var bookingServices = [
  { id:1, name:'Classic Haircut', price:45, duration:'1 hour', category:'Hair', desc:'Precision cut tailored to your style.', deposit:true, depositAmt:15, depositType:'Fixed amount', cover:null, visible:true },
  { id:2, name:'Full Set Lashes', price:120, duration:'2 hours', category:'Beauty', desc:'Volume lash set with premium extensions.', deposit:true, depositAmt:30, depositType:'Fixed amount', cover:null, visible:true },
  { id:3, name:'Deep Tissue Massage', price:90, duration:'1 hour', category:'Wellness', desc:'60-minute deep tissue massage.', deposit:false, depositAmt:0, depositType:'Fixed amount', cover:null, visible:true },
  { id:4, name:'Brand Consultation', price:150, duration:'1.5 hours', category:'Consulting', desc:'1-on-1 brand strategy session.', deposit:true, depositAmt:50, depositType:'Fixed amount', cover:null, visible:true },
];
var bkServiceIdCounter = 10;
var activeBookingCat = 'all';
var bookCurrentMonth = new Date().getMonth();
var bookCurrentYear = new Date().getFullYear();
var bookSelectedDay = null;
var bookSelectedTime = null;
var currentBookingService = null;
var bookingTimes = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];

function toggleBookingLive(cb) {
  var track = document.getElementById('booking-live-track');
  var thumb = document.getElementById('booking-live-thumb');
  if (cb.checked) {
    track.style.background = 'var(--brown)';
    thumb.style.left = '26px';
    toast('✓ Booking page is live!');
  } else {
    track.style.background = '#e5e7eb';
    thumb.style.left = '3px';
    toast('Booking page hidden from your profile');
  }
}

function svcCategoryChange(val) {
  var wrap = document.getElementById('svc-class-type-wrap');
  var sel = document.getElementById('svc-class-type');
  if (wrap) wrap.style.display = val === 'Classes' ? 'block' : 'none';
  if (sel) { sel.onchange = function() {
    var gf = document.getElementById('svc-group-fields');
    if (gf) gf.style.display = sel.value === 'group' ? 'block' : 'none';
  }; }
}

function toggleDepositField(cb) {
  var field = document.getElementById('svc-deposit-field');
  var track = document.getElementById('svc-deposit-track');
  var thumb = document.getElementById('svc-deposit-thumb');
  field.style.display = cb.checked ? 'block' : 'none';
  track.style.background = cb.checked ? 'var(--brown)' : '#e5e7eb';
  thumb.style.left = cb.checked ? '23px' : '3px';
}

var svcPhotos = [null,null,null,null,null,null];

function svcTriggerPhoto(idx) {
  document.getElementById('svc-photo-' + idx).click();
}
function svcPhotoUploaded(idx, input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    svcPhotos[idx] = e.target.result;
    var slot = document.getElementById('svc-slot-' + idx);
    if (slot) {
      slot.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">';
      slot.style.border = '2px solid var(--brown)';
      slot.style.padding = '0';
    }
  };
  reader.readAsDataURL(file);
}

function previewService(id) {
  var svc = bookingServices.find(function(s){ return s.id === id; });
  if (!svc) return;
  var el = document.getElementById('modal-preview-service');
  if (!el) return;
  var photos = (svc.photos || [svc.cover]).filter(Boolean);
  var mainImg = photos.length
    ? '<img src="'+photos[0]+'" id="spv-main" style="width:100%;height:100%;object-fit:cover;">'
    : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3.5rem;">📅</div>';
  var thumbs = photos.length > 1
    ? photos.map(function(src, i){ return '<div onclick="document.getElementById(\'spv-main\').src=\''+src+'\'" style="width:52px;height:52px;border-radius:8px;overflow:hidden;border:2px solid '+(i===0?'var(--brown)':'var(--border)')+';cursor:pointer;flex-shrink:0;"><img src="'+src+'" style="width:100%;height:100%;object-fit:cover;"></div>'; }).join('')
    : '';
  el.querySelector('#spv-img-main').innerHTML = mainImg;
  el.querySelector('#spv-thumbs').innerHTML = thumbs;
  el.querySelector('#spv-name').textContent = svc.name;
  el.querySelector('#spv-price').textContent = '$' + svc.price.toFixed(2);
  el.querySelector('#spv-duration').textContent = svc.duration;
  el.querySelector('#spv-category').textContent = svc.category;
  el.querySelector('#spv-desc').textContent = svc.desc || '';
  el.querySelector('#spv-edit-btn').onclick = function(){ closeModal('modal-preview-service'); editService(id); };
  openModal('modal-preview-service');
}

function editService(id) {
  var svc = bookingServices.find(function(s){ return s.id === id; });
  if (!svc) return;
  document.getElementById('svc-edit-id').value = id;
  document.getElementById('svc-edit-name').value = svc.name || '';
  document.getElementById('svc-edit-price').value = svc.price || '';
  document.getElementById('svc-edit-duration').value = svc.duration || '1 hour';
  document.getElementById('svc-edit-category').value = svc.category || 'Hair';
  document.getElementById('svc-edit-desc').value = svc.desc || '';
  // show existing main photo
  var photoWrap = document.getElementById('svc-edit-photo-preview');
  var cover = svc.photos ? svc.photos[0] : svc.cover;
  if (photoWrap) photoWrap.innerHTML = cover ? '<img src="'+cover+'" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:6px;">' : '';
  window._svcEditPendingCover = null;
  openModal('modal-edit-service');
}

function saveEditService() {
  var id = parseInt(document.getElementById('svc-edit-id').value);
  var svc = bookingServices.find(function(s){ return s.id === id; });
  if (!svc) return;
  svc.name = document.getElementById('svc-edit-name').value.trim() || svc.name;
  svc.price = parseFloat(document.getElementById('svc-edit-price').value) || svc.price;
  svc.duration = document.getElementById('svc-edit-duration').value || svc.duration;
  svc.category = document.getElementById('svc-edit-category').value || svc.category;
  svc.desc = document.getElementById('svc-edit-desc').value;
  if (window._svcEditPendingCover) {
    svc.cover = window._svcEditPendingCover;
    if (!svc.photos) svc.photos = [];
    svc.photos[0] = window._svcEditPendingCover;
  }
  window._svcEditPendingCover = null;
  closeModal('modal-edit-service');
  renderBookingServices();
  toast('✓ Service updated!');
}

function previewSvcEditImage(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    window._svcEditPendingCover = ev.target.result;
    var wrap = document.getElementById('svc-edit-photo-preview');
    if (wrap) wrap.innerHTML = '<img src="'+ev.target.result+'" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:6px;">';
  };
  reader.readAsDataURL(file);
}

function saveService() {
  var name = document.getElementById('svc-name').value.trim();
  var price = parseFloat(document.getElementById('svc-price').value) || 0;
  var duration = document.getElementById('svc-duration').value;
  var category = document.getElementById('svc-category').value;
  var desc = document.getElementById('svc-desc').value.trim();
  var depositOn = document.getElementById('svc-deposit-toggle').checked;
  var depositAmt = parseFloat(document.getElementById('svc-deposit-amount').value) || 0;
  var depositType = document.getElementById('svc-deposit-type').value;
  if (!name) { toast('Please enter a service name'); return; }
  var svc = {
    id: bkServiceIdCounter++,
    name: name, price: price, duration: duration,
    category: category, desc: desc,
    deposit: depositOn, depositAmt: depositAmt, depositType: depositType,
    cover: svcPhotos[0] || null,
    photos: svcPhotos.filter(Boolean),
    visible: true
  };
  bookingServices.push(svc);
  lsPersistBookings();
  // reset form
  ['svc-name','svc-price','svc-desc','svc-deposit-amount'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
  document.getElementById('svc-deposit-toggle').checked = false;
  document.getElementById('svc-deposit-field').style.display = 'none';
  document.getElementById('svc-deposit-track').style.background = '#e5e7eb';
  document.getElementById('svc-deposit-thumb').style.left = '3px';
  // reset photo grid
  svcPhotos = [null,null,null,null,null,null];
  for (var pi = 0; pi < 6; pi++) {
    var slot = document.getElementById('svc-slot-' + pi);
    if (slot) {
      slot.innerHTML = pi === 0 ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--brown-light)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Main' : '+';
      slot.style.border = '2px dashed var(--border)';
      slot.style.padding = '';
    }
  }
  closeModal('modal-add-service');
  renderBookingServices();
  toast('✓ Service added!');
}

function filterBookingCat(btn, cat) {
  document.querySelectorAll('.bk-cat').forEach(function(b) {
    b.style.background = '#fff';
    b.style.color = 'var(--text-dim)';
    b.style.borderColor = 'var(--border)';
  });
  btn.style.background = 'var(--brown)';
  btn.style.color = '#fff';
  btn.style.borderColor = 'var(--brown)';
  activeBookingCat = cat;
  renderBookingServices();
}

function bkShowAddCat() {
  document.getElementById('bk-add-cat-btn').style.display = 'none';
  var form = document.getElementById('bk-add-cat-form');
  form.style.display = 'flex';
  document.getElementById('bk-new-cat-input').focus();
}

function bkHideAddCat() {
  document.getElementById('bk-add-cat-btn').style.display = 'flex';
  document.getElementById('bk-add-cat-form').style.display = 'none';
  document.getElementById('bk-new-cat-input').value = '';
}

function bkAddCat() {
  var input = document.getElementById('bk-new-cat-input');
  var name = input.value.trim();
  if (!name) { input.focus(); return; }
  // Check for duplicate
  var existing = document.querySelectorAll('.bk-cat');
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].textContent.trim().toLowerCase() === name.toLowerCase()) {
      toast('Category already exists');
      input.select();
      return;
    }
  }
  // Insert new chip before the add button
  var btn = document.createElement('button');
  btn.className = 'bk-cat';
  btn.textContent = name;
  btn.style.cssText = 'padding:8px 18px;border-radius:20px;border:1.5px solid var(--border);background:#fff;color:var(--text-dim);cursor:pointer;font-family:\'DM Sans\',sans-serif;font-weight:700;font-size:0.8rem;';
  btn.onclick = function(){ filterBookingCat(btn, name); };
  var addBtn = document.getElementById('bk-add-cat-btn');
  addBtn.parentNode.insertBefore(btn, addBtn);
  toast('Category "' + name + '" added');
  bkHideAddCat();
}

function toggleServiceVisibility(id) {
  var svc = bookingServices.find(function(s){ return s.id === id; });
  if (svc) {
    svc.visible = !svc.visible;
    lsPersistBookings();
    renderBookingServices();
    toast(svc.visible ? '✓ Service visible' : 'Service hidden');
  }
}

function deleteService(id) {
  bookingServices = bookingServices.filter(function(s){ return s.id !== id; });
  lsPersistBookings();
  renderBookingServices();
  toast('Service removed');
}

window.renderBookingServices = function() {
  var grid = document.getElementById('booking-services-grid');
  var empty = document.getElementById('booking-empty');
  if (!grid) return;
  var filtered = activeBookingCat === 'all' ? bookingServices : bookingServices.filter(function(s){ return s.category === activeBookingCat; });
  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  grid.innerHTML = filtered.map(function(svc) {
    var coverStyle = svc.cover
      ? 'background:url(' + svc.cover + ') center/cover no-repeat;'
      : 'background:linear-gradient(135deg,#1a0a00,#3d1800);';
    var depositBadge = svc.deposit
      ? '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;background:rgba(192,122,80,0.12);color:var(--brown);border-radius:8px;font-size:0.65rem;font-weight:700;">💳 Deposit: $' + svc.depositAmt + '</span>'
      : '';
    var visColor = svc.visible ? 'var(--brown)' : 'var(--text-dim)';
    var visLabel = svc.visible ? 'Visible' : 'Hidden';
    return '<div class="bk-svc-card">'
      + '<div style="height:140px;' + coverStyle + 'position:relative;">'
      + '<div style="position:absolute;inset:0;background:rgba(0,0,0,0.25);display:flex;align-items:flex-end;padding:12px;">'
      + '<span style="background:rgba(255,255,255,0.15);backdrop-filter:blur(4px);color:#fff;font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:12px;">' + svc.category + '</span>'
      + '</div>'
      + '</div>'
      + '<div style="padding:14px;">'
      + '<div style="font-family:Georgia,serif;font-size:0.95rem;font-weight:700;color:var(--text);margin-bottom:4px;">' + svc.name + '</div>'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
      + '<span style="font-size:1rem;font-weight:900;color:var(--brown);">$' + svc.price.toFixed(2) + '</span>'
      + '<span style="font-size:0.75rem;color:var(--text-dim);">⏱ ' + svc.duration + '</span>'
      + '</div>'
      + (depositBadge ? '<div style="margin-bottom:10px;">' + depositBadge + '</div>' : '')
      + '<button onclick="openBookService(' + svc.id + ')" style="width:100%;padding:10px;background:linear-gradient(135deg,var(--brown-light),var(--brown-dark));color:#fff;border:none;border-radius:9px;cursor:pointer;font-family:sans-serif;font-weight:700;font-size:0.85rem;margin-bottom:10px;">Book Now</button>'
      + '<div style="display:flex;align-items:center;gap:6px;border-top:1px solid var(--border);padding-top:10px;">'
      + '<button onclick="previewService(' + svc.id + ')" style="padding:6px 10px;background:var(--brown);color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:0.72rem;font-weight:700;">👁 Preview</button>'
      + '<button onclick="editService(' + svc.id + ')" style="padding:6px 10px;background:var(--cream2);color:var(--text-mid);border:1px solid var(--border);border-radius:7px;cursor:pointer;font-size:0.72rem;font-weight:700;">✏️ Edit</button>'
      + '<button onclick="toggleServiceVisibility(' + svc.id + ')" style="flex:1;padding:6px;background:none;border:1px solid var(--border);border-radius:7px;cursor:pointer;font-size:0.72rem;font-weight:700;color:' + visColor + ';">' + visLabel + '</button>'
      + '<button onclick="deleteService(' + svc.id + ')" style="padding:6px 10px;background:#fee2e2;color:#dc2626;border:none;border-radius:7px;cursor:pointer;font-size:0.72rem;font-weight:700;">Delete</button>'
      + '</div>'
      + '</div>'
      + '</div>';
  }).join('');
}

function openBookService(id) {
  var svc = bookingServices.find(function(s){ return s.id === id; });
  if (!svc) return;
  currentBookingService = svc;
  bookSelectedDay = null;
  bookSelectedTime = null;
  document.getElementById('book-svc-title').textContent = svc.name;
  document.getElementById('book-svc-meta').textContent = '$' + svc.price.toFixed(2) + ' · ' + svc.duration;
  document.getElementById('book-summary').style.display = 'none';
  document.getElementById('book-confirm-btn').disabled = true;
  document.getElementById('book-confirm-btn').textContent = 'Select a date & time';
  var depositNotice = document.getElementById('book-deposit-notice');
  if (svc.deposit && svc.depositAmt > 0) {
    depositNotice.style.display = 'block';
    var label = svc.depositType === '% of total' ? svc.depositAmt + '% of $' + svc.price.toFixed(2) + ' = $' + (svc.price * svc.depositAmt / 100).toFixed(2) : '$' + svc.depositAmt.toFixed(2);
    document.getElementById('book-deposit-text').textContent = 'Deposit due now: ' + label;
  } else {
    depositNotice.style.display = 'none';
  }
  bookCurrentMonth = new Date().getMonth();
  bookCurrentYear = new Date().getFullYear();
  renderBookCalendar();
  renderBookTimeSlots();
  openModal('modal-book-service');
}

function renderBookCalendar() {
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('book-month-label').textContent = months[bookCurrentMonth] + ' ' + bookCurrentYear;
  var firstDay = new Date(bookCurrentYear, bookCurrentMonth, 1).getDay();
  var daysInMonth = new Date(bookCurrentYear, bookCurrentMonth + 1, 0).getDate();
  var today = new Date();
  var html = '';
  for (var i = 0; i < firstDay; i++) html += '<div></div>';
  for (var d = 1; d <= daysInMonth; d++) {
    var date = new Date(bookCurrentYear, bookCurrentMonth, d);
    var isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var isSelected = bookSelectedDay === d && bookCurrentMonth === new Date().getMonth();
    var bg = isSelected ? 'var(--brown)' : 'transparent';
    var color = isPast ? '#ccc' : (isSelected ? '#fff' : 'var(--text)');
    var cursor = isPast ? 'default' : 'pointer';
    html += '<div onclick="' + (isPast ? '' : 'selectBookDay(' + d + ')') + '" style="padding:7px 4px;border-radius:8px;font-size:0.82rem;font-weight:600;background:' + bg + ';color:' + color + ';cursor:' + cursor + ';text-align:center;">' + d + '</div>';
  }
  document.getElementById('book-calendar-days').innerHTML = html;
}

function changeBookMonth(dir) {
  bookCurrentMonth += dir;
  if (bookCurrentMonth > 11) { bookCurrentMonth = 0; bookCurrentYear++; }
  if (bookCurrentMonth < 0) { bookCurrentMonth = 11; bookCurrentYear--; }
  bookSelectedDay = null;
  bookSelectedTime = null;
  renderBookCalendar();
  renderBookTimeSlots();
  updateBookSummary();
}

function selectBookDay(d) {
  bookSelectedDay = d;
  renderBookCalendar();
  updateBookSummary();
}

function renderBookTimeSlots() {
  var html = bookingTimes.map(function(t) {
    var sel = t === bookSelectedTime;
    return '<button data-bk-time="' + t + '" class="bk-time-btn' + (sel ? ' bk-time-sel' : '') + '">' + t + '</button>';
  }).join('');
  var slotsEl = document.getElementById('book-time-slots');
  slotsEl.innerHTML = html;
  slotsEl.onclick = function(e) {
    var btn = e.target.closest('.bk-time-btn');
    if (!btn) return;
    bookSelectedTime = btn.dataset.bkTime;
    renderBookTimeSlots();
    updateBookSummary();
  };
}

function selectBookTime(btn, t) {
  bookSelectedTime = t;
  renderBookTimeSlots();
  updateBookSummary();
}

function updateBookSummary() {
  var summaryEl = document.getElementById('book-summary');
  var summaryText = document.getElementById('book-summary-text');
  var btn = document.getElementById('book-confirm-btn');
  if (bookSelectedDay && bookSelectedTime) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    summaryText.textContent = months[bookCurrentMonth] + ' ' + bookSelectedDay + ', ' + bookCurrentYear + ' · ' + bookSelectedTime;
    summaryEl.style.display = 'block';
    var svc = currentBookingService;
    var depositLabel = '';
    if (svc && svc.deposit && svc.depositAmt > 0) {
      var amt = svc.depositType === '% of total' ? (svc.price * svc.depositAmt / 100).toFixed(2) : svc.depositAmt.toFixed(2);
      depositLabel = 'Pay Deposit $' + amt + ' → Book';
    } else {
      depositLabel = 'Confirm Booking';
    }
    btn.textContent = depositLabel;
    btn.disabled = false;
  } else {
    summaryEl.style.display = 'none';
    btn.textContent = 'Select a date & time';
    btn.disabled = true;
  }
}

function confirmBooking() {
  var svc = currentBookingService;
  if (!svc || !bookSelectedDay || !bookSelectedTime) return;
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var dateStr = months[bookCurrentMonth] + ' ' + bookSelectedDay + ', ' + bookCurrentYear;
  if (svc.deposit && svc.depositAmt > 0) {
    var amt = svc.depositType === '% of total' ? (svc.price * svc.depositAmt / 100).toFixed(2) : svc.depositAmt.toFixed(2);
    closeModal('modal-book-service');
    toast('✓ Deposit of $' + amt + ' collected! Booking confirmed for ' + dateStr + ' at ' + bookSelectedTime);
  } else {
    closeModal('modal-book-service');
    toast('✓ Booking confirmed for ' + dateStr + ' at ' + bookSelectedTime + '!');
  }
}






// ── BOOKING MANAGEMENT ────────────────────────────────────────────────────────
var incomingBookings = [
  { id:101, client:'Ava Thompson', email:'ava@email.com', service:'Full Set Lashes', date:'Apr 18, 2026', time:'11:00 AM', deposit:true, depositAmt:30, depositPaid:true, status:'confirmed', banned:false },
  { id:102, client:'Marcus Lee', email:'marcus@email.com', service:'Classic Haircut', date:'Apr 19, 2026', time:'2:00 PM', deposit:false, depositAmt:0, depositPaid:false, status:'pending', banned:false },
  { id:103, client:'Jasmine Rivera', email:'jasmine@email.com', service:'Deep Tissue Massage', date:'Apr 20, 2026', time:'10:00 AM', deposit:true, depositAmt:20, depositPaid:false, status:'pending', banned:false },
];
var deletedBookings = [];
var reviewQuestions = [
  { q:'How would you describe your overall experience?', type:'choice', choices:['Excellent','Good','Average','Poor'] },
  { q:'Would you recommend this service to a friend?', type:'choice', choices:['Definitely','Maybe','No'] },
];

// Reservation records
var reservationBookings = [];

function bookingTab(tab) {
  var tabs = ['services','incoming','reservations'];
  tabs.forEach(function(t) {
    var btn = document.getElementById('bk-tab-'+t);
    var content = document.getElementById('bk-'+t+'-content');
    if (btn) { btn.style.background = t===tab ? 'var(--brown)' : 'transparent'; btn.style.color = t===tab ? '#fff' : 'var(--text-dim)'; }
    if (content) content.style.display = t===tab ? 'block' : 'none';
  });
  if (tab === 'incoming') renderIncomingBookings();
  if (tab === 'reservations') renderReservationBookings();
}

function renderReservationBookings() {
  var list = document.getElementById('bk-reservations-list');
  var empty = document.getElementById('bk-reservations-empty');
  if (!list) return;
  if (reservationBookings.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = reservationBookings.map(function(r) {
    var statusColor = r.paymentStatus === 'paid' ? '#16a34a' : r.paymentStatus === 'partial' ? '#d97706' : '#dc2626';
    var statusLabel = r.paymentStatus === 'paid' ? 'Paid in Full' : r.paymentStatus === 'partial' ? 'Partial' : 'Pending';
    var perPerson = r.splitPayment && r.attendees > 0 ? (r.totalCost / r.attendees).toFixed(2) : null;
    var log = r.paymentLog || [];
    var totalPaid = log.reduce(function(s,p){ return s + (parseFloat(p.amount)||0); }, 0);
    var pctPaid = r.totalCost > 0 ? Math.min(100, Math.round(totalPaid/r.totalCost*100)) : 0;
    var qrId = 'qr-bk-'+r.id;
    var resDateDisplay = r.eventDateFormatted || (r.eventDate ? new Date(r.eventDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'TBD');

    return `<div style="background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden;" id="res-card-${r.id}">
      <!-- Header bar -->
      <div style="background:linear-gradient(135deg,rgba(192,122,80,0.1),rgba(192,122,80,0.04));border-bottom:1px solid var(--border);padding:14px 18px;display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div>
          <div style="font-weight:700;font-size:0.95rem;color:var(--text);">${r.eventName}</div>
          ${(r.birthdayNames && r.birthdayNames.length > 0) ? '<div style="font-size:0.82rem;color:var(--brown);margin-top:2px;">🎂 ' + r.birthdayNames.join(' & ') + '</div>' : (r.birthdayName ? '<div style="font-size:0.82rem;color:var(--brown);margin-top:2px;">🎂 ' + r.birthdayName + '</div>' : '')}
          <div style="font-size:0.78rem;color:var(--text-dim);margin-top:3px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span>📅 <strong>${resDateDisplay}</strong>${r.eventTime?' at '+r.eventTime:''}</span>
            <span>👥 ${r.attendees} ${r.attendees===1?'person':'people'}</span>
            ${r.hasAnnouncement ? '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;font-size:0.7rem;font-weight:700;">✨ Announcement</span>' : ''}
          </div>
          ${r.hasAnnouncement && r.announcementFee ? '<div style="font-size:0.75rem;color:var(--text-dim);margin-top:3px;">Sparklers + lights + Happy Birthday sign · $' + (r.announcementFee||0).toFixed(2) + ' included in split</div>' : ''}
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:0.72rem;font-weight:700;padding:4px 10px;border-radius:20px;background:${statusColor}18;color:${statusColor};">${statusLabel}</span>
          <button onclick="editReservationEvent(${r.id})" style="padding:5px 10px;background:var(--cream2);color:var(--text-mid);border:1px solid var(--border);border-radius:7px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.72rem;font-weight:700;">Edit</button>
          <button onclick="deleteReservation(${r.id})" style="padding:5px 10px;background:#fee2e2;color:#dc2626;border:1px solid #fca5a5;border-radius:7px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.72rem;font-weight:700;">Delete</button>
        </div>
      </div>

      <div style="padding:16px 18px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <!-- Contact -->
        <div style="background:var(--cream);border-radius:10px;padding:10px 12px;">
          <div style="font-size:0.62rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:5px;">Contact</div>
          <div style="font-size:0.88rem;font-weight:700;">${r.firstName} ${r.lastName}</div>
          <div style="font-size:0.75rem;color:var(--text-dim);">${r.email}</div>
          <div style="font-size:0.75rem;color:var(--text-dim);">${r.phone}</div>
        </div>
        <!-- Payment summary -->
        <div style="background:var(--cream);border-radius:10px;padding:10px 12px;">
          <div style="font-size:0.62rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:5px;">Payment</div>
          <div style="font-size:0.88rem;font-weight:700;color:var(--brown);">$${parseFloat(r.totalCost).toFixed(2)} total</div>
          ${r.splitPayment ? `<div style="font-size:0.75rem;color:var(--text-dim);">Split: $${perPerson} × ${r.attendees}</div>` : '<div style="font-size:0.75rem;color:var(--text-dim);">Full payment</div>'}
          <div style="font-size:0.72rem;color:#dc2626;margin-top:2px;font-weight:600;">Due: ${r.paymentDueDate||'N/A'}</div>
        </div>
      </div>

      <!-- Payment progress -->
      <div style="padding:0 18px 14px;">
        <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text-dim);margin-bottom:5px;"><span>$${totalPaid.toFixed(2)} collected</span><span>$${(r.totalCost-totalPaid).toFixed(2)} remaining</span></div>
        <div style="background:var(--cream3);border-radius:4px;height:6px;overflow:hidden;">
          <div style="background:${pctPaid>=100?'#16a34a':'var(--brown)'};height:100%;width:${pctPaid}%;border-radius:4px;transition:width 0.4s;"></div>
        </div>
      </div>

      ${r.splitPayment ? `<div style="padding:0 18px 14px;">
        <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;">Attendee Payment Status</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${Array.from({length:r.attendees},function(_,i){
            var pl = (r.paymentLog||[]).find(function(p){return p.seat===(i+1);});
            var paid = !!pl;
            return '<div title="'+(paid?pl.name+' – $'+pl.amount:'Person '+(i+1)+' unpaid')+'" style="width:30px;height:30px;border-radius:50%;background:'+(paid?'#16a34a':'var(--cream3)')+';border:1.5px solid '+(paid?'#16a34a':'var(--border)')+';display:flex;align-items:center;justify-content:center;font-size:0.62rem;font-weight:700;color:'+(paid?'#fff':'var(--text-dim)')+';">'+(i+1)+'</div>';
          }).join('')}
        </div>
      </div>` : ''}

      <!-- Payment log -->
      ${log.length > 0 ? `<div style="padding:0 18px 14px;">
        <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;">Payment Log</div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${log.map(function(p,pi){return `<div style="display:flex;align-items:flex-start;justify-content:space-between;background:var(--cream);border-radius:8px;padding:8px 10px;font-size:0.78rem;">
            <div><span style="font-weight:700;">${p.name}</span><span style="color:var(--text-dim);margin-left:6px;">${p.date} · ${p.method||''}${r.splitPayment&&p.seat?' · Seat '+p.seat:''}</span>${p.ticketNum?'<div style="font-size:0.68rem;color:#C07A50;font-weight:700;margin-top:2px;">🎟 '+p.ticketNum+'</div>':''}${p.receipt?'<div style="font-size:0.68rem;color:#16a34a;margin-top:2px;">📧 Receipt sent to '+p.receipt.email+(p.receipt.card2?' · Split: '+p.receipt.card1+' + '+p.receipt.card2:'')+'</div>':''}</div>
            <span style="font-weight:700;color:#16a34a;flex-shrink:0;margin-left:8px;">+$${parseFloat(p.amount).toFixed(2)}</span>
          </div>`;}).join('')}
        </div>
      </div>` : ''}

      <!-- Link + QR + actions -->
      <div style="padding:0 18px 16px;">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">
          <div style="flex:1;background:var(--cream);border-radius:8px;padding:7px 10px;font-family:monospace;font-size:0.7rem;color:var(--brown-dark);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.paymentLink}</div>
          <button onclick="navigator.clipboard&&navigator.clipboard.writeText('${r.paymentLink}');toast('✓ Copied!')" style="padding:7px 12px;background:var(--brown-bg2);color:var(--brown-dark);border:1px solid var(--brown);border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.72rem;font-weight:700;flex-shrink:0;">Copy</button>
          <button onclick="toggleResQR('${qrId}','${r.paymentLink}')" style="padding:7px 12px;background:#fff;color:var(--text-mid);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.72rem;font-weight:700;flex-shrink:0;">QR</button>
          <button onclick="sendReminderNow(${r.id})" style="padding:7px 12px;background:#fff;color:var(--text-mid);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.72rem;font-weight:700;flex-shrink:0;">Remind</button>
        </div>
        <!-- QR toggle -->
        <div id="${qrId}" style="display:none;background:var(--cream);border-radius:10px;padding:12px;text-align:center;margin-bottom:10px;">
          <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px;">Scan to Pay</div>
          <div id="${qrId}-svg" style="display:inline-block;"></div>
        </div>
        <!-- Record payment button -->
        <button onclick="openRecordPayment(${r.id})" style="width:100%;padding:11px;background:linear-gradient(135deg,var(--brown-light),var(--brown-dark));color:#fff;border:none;border-radius:10px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:700;display:flex;align-items:center;justify-content:center;gap:7px;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          Record Payment Received
        </button>
        ${r.linkVerified ? '<div style="margin-top:8px;font-size:0.75rem;color:#16a34a;display:flex;align-items:center;gap:5px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Link delivered & verified</div>' : '<div style="margin-top:8px;font-size:0.75rem;color:#d97706;">⏳ Awaiting link verification</div>'}
        <div style="margin-top:4px;font-size:0.72rem;color:var(--text-dim);">🔔 Next auto-reminder: ${r.nextReminder||'Scheduled'}</div>
      </div>
    </div>`;
  }).join('');
}

function toggleResQR(qrId, link) {
  var el = document.getElementById(qrId);
  if (!el) return;
  var visible = el.style.display !== 'none';
  el.style.display = visible ? 'none' : 'block';
  if (!visible) {
    var svgEl = document.getElementById(qrId+'-svg');
    if (svgEl && !svgEl.innerHTML) generateQRDisplay(qrId+'-svg', link);
  }
}

function openRecordPayment(id) {
  var r = reservationBookings.find(function(x){ return x.id===id; });
  if (!r) return;
  window._recordPaymentId = id;
  var perPerson = r.splitPayment && r.attendees > 0 ? (r.totalCost / r.attendees).toFixed(2) : r.totalCost.toFixed(2);
  var modal = document.getElementById('modal-record-payment');
  if (!modal) {
    var div = document.createElement('div');
    div.id = 'modal-record-payment';
    div.className = 'modal-overlay';
    div.onclick = function(e){ if(e.target===div) closeModal('modal-record-payment'); };
    div.innerHTML = `<div class="modal" style="max-width:420px;" onclick="event.stopPropagation()">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
        <h2 class="modal-title" style="margin:0;">Record Payment</h2>
        <button onclick="closeModal('modal-record-payment')" style="background:none;border:none;cursor:pointer;font-size:1.3rem;color:var(--text-dim);">✕</button>
      </div>
      <div id="rp-reservation-info" style="background:var(--cream);border-radius:10px;padding:10px 12px;margin-bottom:16px;font-size:0.82rem;color:var(--text-mid);"></div>
      <div class="form-field"><label>Payer Full Name</label><input type="text" id="rp-name" placeholder="Jane Smith" style="width:100%;"></div>
      <div class="form-field"><label>Amount Paid ($)</label><div style="position:relative;"><span style="position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:0.88rem;color:var(--text-dim);">$</span><input type="number" id="rp-amount" step="0.01" min="0" style="width:100%;padding-left:24px;" placeholder="0.00"></div></div>
      <div id="rp-seat-row" style="display:none;" class="form-field"><label>Seat / Person #</label><input type="number" id="rp-seat" min="1" style="width:100%;" placeholder="1"></div>
      <div class="form-field"><label>Payment Method</label><select id="rp-method" style="width:100%;"><option>Cash</option><option>Card</option><option>Venmo</option><option>Zelle</option><option>CashApp</option><option>Other</option></select></div>
      <div class="form-field"><label>Notes (optional)</label><input type="text" id="rp-notes" placeholder="e.g. Paid via Venmo @handle" style="width:100%;"></div>
      <div style="display:flex;gap:10px;margin-top:16px;">
        <button class="btn-cancel" onclick="closeModal('modal-record-payment')">Cancel</button>
        <button class="btn-confirm" onclick="savePaymentRecord()" style="flex:1;">Save Payment →</button>
      </div>
    </div>`;
    document.body.appendChild(div);
  }
  // Populate info
  var info = document.getElementById('rp-reservation-info');
  if (info) info.innerHTML = '<strong>'+r.eventName+'</strong> · '+r.firstName+' '+r.lastName+'<br>Total: $'+r.totalCost.toFixed(2)+' | Suggested: $'+perPerson+(r.splitPayment?' per person':'');
  var seatRow = document.getElementById('rp-seat-row');
  if (seatRow) seatRow.style.display = r.splitPayment ? 'block' : 'none';
  var amtEl = document.getElementById('rp-amount');
  if (amtEl) amtEl.value = perPerson;
  openModal('modal-record-payment');
}

function savePaymentRecord() {
  var id = window._recordPaymentId;
  var r = reservationBookings.find(function(x){ return x.id===id; });
  if (!r) return;
  var name = document.getElementById('rp-name').value.trim();
  var amount = parseFloat(document.getElementById('rp-amount').value) || 0;
  var seat = document.getElementById('rp-seat') ? parseInt(document.getElementById('rp-seat').value) || null : null;
  var method = document.getElementById('rp-method').value;
  var notes = document.getElementById('rp-notes').value.trim();
  if (!name) { toast('Please enter the payer name'); return; }
  if (!amount) { toast('Please enter the amount'); return; }
  if (!r.paymentLog) r.paymentLog = [];

  // Generate unique ticket number for this payer
  var ticketNum = 'RES-' + id.toString().slice(-4) + '-' + (r.paymentLog.length + 1).toString().padStart(3,'0');
  r.paymentLog.push({ name:name, amount:amount, seat:seat, method:method, notes:notes, ticketNum:ticketNum, date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) });

  var totalPaid = r.paymentLog.reduce(function(s,p){ return s+(parseFloat(p.amount)||0); }, 0);
  var prevStatus = r.paymentStatus;
  r.paymentStatus = totalPaid >= r.totalCost ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';
  if (r.splitPayment) r.paidCount = r.paymentLog.filter(function(p){ return !!p.seat; }).length;

  closeModal('modal-record-payment');

  // If just became fully paid — issue tickets to all payers
  if (r.paymentStatus === 'paid' && prevStatus !== 'paid') {
    issueReservationTickets(r);
  } else {
    // Send individual payment confirmation with ticket number
    showPaymentConfirmationToast(name, ticketNum, r);
  }

  renderReservationBookings();
  toast('✓ $' + amount.toFixed(2) + ' recorded for ' + name + ' · Ticket: ' + ticketNum);
}

function issueReservationTickets(r) {
  // Simulate sending ticket emails to all payers
  var perPerson = r.splitPayment ? (r.totalCost / r.attendees).toFixed(2) : r.totalCost.toFixed(2);
  var ticketsSummary = r.paymentLog.map(function(p){ return p.name + ' → ' + p.ticketNum; }).join(', ');

  // Show a confirmation modal-style toast
  setTimeout(function() {
    var msgDiv = document.createElement('div');
    msgDiv.style.cssText = 'position:fixed;bottom:80px;right:24px;background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px 20px;max-width:340px;z-index:9999;box-shadow:0 8px 32px rgba(44,26,14,0.18);';
    msgDiv.innerHTML = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">'
      + '<div style="width:32px;height:32px;border-radius:50%;background:#d1fae5;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
      + '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>'
      + '<div><div style="font-weight:700;font-size:0.88rem;color:var(--text);">Payment Complete — Tickets Issued!</div>'
      + '<div style="font-size:0.75rem;color:var(--text-dim);margin-top:2px;">' + r.eventName + ' · ' + r.eventDateFormatted + '</div></div></div>'
      + '<div style="font-size:0.78rem;color:var(--text-mid);line-height:1.6;margin-bottom:10px;">'
      + '📧 Confirmation emails with ticket numbers & QR codes sent to each payer.<br>'
      + '📍 Location: <strong>' + (r.location || 'See confirmation email') + '</strong><br>'
      + (r.perks ? '🎁 Includes: ' + r.perks + '<br>' : '')
      + '</div>'
      + '<div style="font-size:0.72rem;color:var(--text-dim);background:var(--cream);border-radius:8px;padding:8px 10px;">'
      + r.paymentLog.map(function(p){ return '<div>🎟️ <strong>' + p.name + '</strong> · ' + p.ticketNum + '</div>'; }).join('')
      + '</div>'
      + '<button onclick="this.parentNode.remove()" style="margin-top:10px;width:100%;padding:8px;background:var(--brown);color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;font-weight:700;">Got it</button>';
    document.body.appendChild(msgDiv);
    setTimeout(function(){ if(msgDiv.parentNode) msgDiv.remove(); }, 12000);
  }, 400);
}

function showPaymentConfirmationToast(name, ticketNum, r) {
  setTimeout(function(){
    toast('📧 Confirmation + QR sent to ' + name + ' · ' + ticketNum);
  }, 600);
}

function editReservationEvent(id) {
  // Find matching event in events array and open edit modal
  var evIdx = events.findIndex(function(e){ return e.isReservation && (e.id===id || e.name === (reservationBookings.find(function(r){return r.id===id;})||{}).eventName); });
  if (evIdx > -1) {
    var bookingNavItem = document.querySelector('.nav-item[onclick*="tickets"]');
    if (bookingNavItem) nav(bookingNavItem, 'tickets');
    setTimeout(function(){ editEvent(evIdx); }, 200);
  } else { toast('Open Events / Tickets tab to edit this reservation'); }
}

function deleteReservation(id) {
  if (!confirm('Delete this reservation? This cannot be undone.')) return;
  reservationBookings = reservationBookings.filter(function(r){ return r.id!==id; });
  // Also remove from events
  events = events.filter(function(e){ return !(e.isReservation && e.id===id); });
  renderReservationBookings();
  renderEvents();
  updateTicketStats();
  var badge = document.getElementById('bk-reservations-badge');
  if (badge) { badge.textContent = reservationBookings.length; if(!reservationBookings.length) badge.style.display='none'; }
  toast('Reservation deleted.');
}

function addReservationToBookings(resData) {
  var id = Date.now();
  var nextReminder = new Date();
  nextReminder.setDate(nextReminder.getDate() + 3);
  var rec = Object.assign({}, resData, {
    id: id,
    paymentStatus: 'pending',
    paidCount: 0,
    linkVerified: false,
    nextReminder: nextReminder.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
    createdAt: new Date().toISOString()
  });
  reservationBookings.unshift(rec);
  // Update badge
  var badge = document.getElementById('bk-reservations-badge');
  if (badge) { badge.textContent = reservationBookings.length; badge.style.display = 'inline'; }
  // Add to calendar
  addReservationToCalendar(rec);
}

function addReservationToCalendar(rec) {
  if (typeof calendarEvents !== 'undefined') {
    calendarEvents.push({ date: rec.eventDate, title: rec.eventName + ' (Reservation)', color: 'var(--brown)' });
  }
}

function sendReminderNow(id) {
  var r = reservationBookings.find(function(x){ return x.id===id; });
  if (!r) return;
  toast('✓ Reminder sent to '+r.firstName+'!');
}

function renderIncomingBookings() {
  var list = document.getElementById('bk-incoming-list');
  var emptyEl = document.getElementById('bk-incoming-empty');
  if (!list) return;
  var active = incomingBookings.filter(function(b){ return b.status !== 'deleted'; });
  if (active.length === 0) {
    list.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
  } else {
    if (emptyEl) emptyEl.style.display = 'none';
    list.innerHTML = active.map(function(b) {
      var statusColor = b.status==='confirmed' ? '#16a34a' : b.status==='cancelled' ? '#dc2626' : '#d97706';
      var statusBg = b.status==='confirmed' ? '#dcfce7' : b.status==='cancelled' ? '#fee2e2' : '#fef3c7';
      var depositBadge = b.deposit ? (b.depositPaid ? '<span style="font-size:0.65rem;background:#dcfce7;color:#16a34a;padding:2px 7px;border-radius:7px;font-weight:700;">Deposit Paid</span>' : '<span style="font-size:0.65rem;background:#fef3c7;color:#d97706;padding:2px 7px;border-radius:7px;font-weight:700;">Deposit Pending</span>') : '';
      var bannedBadge = b.banned ? '<span style="font-size:0.65rem;background:#fee2e2;color:#dc2626;padding:2px 7px;border-radius:7px;font-weight:700;">⛔ Banned</span>' : '';
      return '<div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;">'
        + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;">'
        + '<div>'
        + '<div style="font-weight:800;font-size:0.92rem;">' + b.client + '</div>'
        + '<div style="font-size:0.75rem;color:var(--text-dim);">' + b.email + '</div>'
        + '<div style="font-size:0.82rem;font-weight:600;color:var(--text);margin-top:4px;">' + b.service + '</div>'
        + '<div style="font-size:0.78rem;color:var(--text-dim);">📅 ' + b.date + ' · ' + b.time + '</div>'
        + '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;">'
        + '<span style="padding:2px 8px;background:'+statusBg+';color:'+statusColor+';border-radius:8px;font-size:0.7rem;font-weight:700;">' + b.status.charAt(0).toUpperCase()+b.status.slice(1) + '</span>'
        + depositBadge + bannedBadge
        + '</div></div>'
        + '<button onclick="openManageBooking('+b.id+')" style="padding:7px 16px;background:var(--brown);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.78rem;white-space:nowrap;flex-shrink:0;">Manage</button>'
        + '</div></div>';
    }).join('');
  }
  // Deleted bookings
  var delSection = document.getElementById('bk-deleted-section');
  var delList = document.getElementById('bk-deleted-list');
  if (deletedBookings.length > 0 && delSection && delList) {
    delSection.style.display = 'block';
    delList.innerHTML = deletedBookings.map(function(b) {
      return '<div style="background:var(--cream);border:1px dashed var(--border);border-radius:10px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;">'
        + '<div><div style="font-weight:700;font-size:0.85rem;">' + b.client + ' — ' + b.service + '</div><div style="font-size:0.72rem;color:var(--text-dim);">' + b.date + ' · ' + b.time + '</div></div>'
        + '<button onclick="restoreBooking('+b.id+')" style="padding:6px 12px;background:var(--brown);color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:0.75rem;font-weight:700;">Restore</button>'
        + '</div>';
    }).join('');
  } else if (delSection) { delSection.style.display = 'none'; }
}

function openManageBooking(id) {
  var b = incomingBookings.find(function(x){ return x.id===id; });
  if (!b) return;
  document.getElementById('mbk-title').textContent = b.client + ' — ' + b.service;
  document.getElementById('mbk-meta').textContent = b.date + ' · ' + b.time + ' · ' + b.email;
  var el = document.getElementById('mbk-actions');
  var s = function(bg,col,brd){ return 'padding:11px;background:'+bg+';color:'+col+';border:'+(brd||'none')+';border-radius:10px;cursor:pointer;font-weight:700;font-size:0.82rem;width:100%;display:flex;align-items:center;justify-content:center;gap:7px;'; };
  var ic = function(p){ return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">'+p+'</svg>'; };
  el.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">'
    + '<button data-bka="reschedule" style="'+s('var(--cream)','var(--text)','1px solid var(--border)')+'">'+ic('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>')+'Reschedule & Send Client Link</button>'
    + '<button data-bka="deposit" style="'+s('var(--cream)','var(--text)','1px solid var(--border)')+'">'+ic('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>')+'Send Deposit Request</button>'
    + '<button data-bka="charge" style="'+s('var(--cream)','var(--text)','1px solid var(--border)')+'">'+ic('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>')+'Charge Fee (Late / No-Show / Cancel)</button>'
    + '<button data-bka="review" style="'+s('var(--cream)','var(--text)','1px solid var(--border)')+'">'+ic('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>')+'Send Review Questionnaire</button>'
    + '<button data-bka="cancel" style="'+s('#fee2e2','#dc2626','1px solid #fecaca')+'">'+ic('<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>') +'Cancel Booking</button>'
    + '<button data-bka="delete" style="'+s('#fff','#dc2626','1.5px solid #fecaca')+'">'+ic('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>')+'Delete Booking</button>'
    + '<button data-bka="ban" style="'+s('#1a0a00','#ef4444','1.5px solid #7f1d1d')+'">'+ic('<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>') + (b.banned ? 'Unban Client' : '⛔ Ban from Booking') + '</button>'
    + '</div>';
  el.querySelectorAll('button[data-bka]').forEach(function(btn) {
    btn.onclick = function() { handleBookingAction(btn.dataset.bka, b); };
  });
  openModal('modal-manage-booking');
}

function handleBookingAction(action, b) {
  closeModal('modal-manage-booking');
  if (action === 'reschedule') {
    document.getElementById('bk-reschedule-client').textContent = b.client + ' · ' + b.email;
    document.getElementById('bk-reschedule-date').value = '';
    document.getElementById('bk-reschedule-time').value = '';
    document.getElementById('bk-reschedule-msg').value = '';
    document.getElementById('bk-reschedule-confirm').onclick = function() {
      var d = document.getElementById('bk-reschedule-date').value;
      var t = document.getElementById('bk-reschedule-time').value;
      if (!d || !t) { toast('Enter new date and time'); return; }
      b.date = d; b.time = t;
      closeModal('modal-bk-reschedule');
      renderIncomingBookings();
      toast('✓ Reschedule link sent to ' + b.client + ' for ' + d + ' at ' + t);
    };
    openModal('modal-bk-reschedule');
  } else if (action === 'deposit') {
    document.getElementById('bk-deposit-client').textContent = b.client + ' · ' + b.email;
    document.getElementById('bk-deposit-amount').value = '';
    document.getElementById('bk-deposit-due').value = '';
    document.getElementById('bk-deposit-msg').value = '';
    document.getElementById('bk-deposit-confirm').onclick = function() {
      var amt = parseFloat(document.getElementById('bk-deposit-amount').value);
      if (!amt) { toast('Enter deposit amount'); return; }
      b.deposit = true; b.depositAmt = amt;
      closeModal('modal-bk-deposit');
      renderIncomingBookings();
      toast('✓ Deposit request of $' + amt.toFixed(2) + ' sent to ' + b.client);
    };
    openModal('modal-bk-deposit');
  } else if (action === 'charge') {
    document.getElementById('bk-charge-title').textContent = 'Charge Fee';
    document.getElementById('bk-charge-client').textContent = b.client + ' · ' + b.email;
    document.getElementById('bk-charge-amount').value = '';
    document.getElementById('bk-charge-note').value = '';
    document.getElementById('bk-charge-confirm').onclick = function() {
      var amt = parseFloat(document.getElementById('bk-charge-amount').value);
      var type = document.getElementById('bk-charge-type').value;
      if (!amt) { toast('Enter fee amount'); return; }
      closeModal('modal-bk-charge');
      toast('✓ ' + type + ' of $' + amt.toFixed(2) + ' charged to ' + b.client);
    };
    openModal('modal-bk-charge');
  } else if (action === 'review') {
    document.getElementById('bk-review-client').textContent = b.client + ' · ' + b.email;
    var preview = document.getElementById('bk-review-preview-questions');
    if (preview) preview.innerHTML = reviewQuestions.map(function(q,i) {
      return '<div style="margin-bottom:6px;"><strong>' + (i+1) + '. ' + q.q + '</strong><br>' + q.choices.join(' · ') + '</div>';
    }).join('');
    document.getElementById('bk-review-note').value = '';
    document.getElementById('bk-review-confirm').onclick = function() {
      closeModal('modal-bk-review');
      toast('✓ Review questionnaire sent to ' + b.client);
    };
    openModal('modal-bk-review');
  } else if (action === 'cancel') {
    b.status = 'cancelled';
    renderIncomingBookings();
    toast('Booking cancelled for ' + b.client);
  } else if (action === 'delete') {
    incomingBookings = incomingBookings.filter(function(x){ return x.id !== b.id; });
    deletedBookings.unshift(b);
    if (deletedBookings.length > 5) deletedBookings.pop();
    renderIncomingBookings();
    toast('Booking deleted · Tap Restore to undo');
  } else if (action === 'ban') {
    b.banned = !b.banned;
    renderIncomingBookings();
    toast(b.banned ? '⛔ ' + b.client + ' banned from booking' : '✓ ' + b.client + ' ban removed');
  }
}

function restoreBooking(id) {
  var b = deletedBookings.find(function(x){ return x.id===id; });
  if (!b) return;
  deletedBookings = deletedBookings.filter(function(x){ return x.id!==id; });
  incomingBookings.push(b);
  renderIncomingBookings();
  toast('✓ Booking restored for ' + b.client);
}




// ================================
// GLOBAL EXPOSURE (BOOKING)
// ================================
window.openBookService = openBookService;
window.previewService = previewService;
window.editService = editService;
window.deleteService = deleteService;
window.toggleServiceVisibility = toggleServiceVisibility;

window.saveService = saveService;
window.saveEditService = saveEditService;

window.selectBookDay = selectBookDay;
window.changeBookMonth = changeBookMonth;
window.confirmBooking = confirmBooking;

window.toggleBookingLive = toggleBookingLive;
window.svcCategoryChange = svcCategoryChange;
window.toggleDepositField = toggleDepositField;