// ── FORMS ──────────────────────────────────────────────────────────────────
var formsData = []; // {id, title, type, desc, fields, submitLabel, confirmMsg, status:'draft'|'active', responses:[]}
var fbCurrentId = null;
var fbFields = []; // [{id, type, label, required, options:[]}]
var fbFieldCounter = 0;

function formsTab(tab, btn) {
  document.querySelectorAll('#ftab-all,#ftab-active,#ftab-draft,#ftab-responses').forEach(function(b){
    b.style.background='transparent'; b.style.color='var(--text-dim)';
  });
  btn.style.background='var(--brown)'; btn.style.color='#fff';
  var listWrap = document.getElementById('forms-list-wrap');
  var respWrap = document.getElementById('forms-responses-wrap');
  if (tab === 'responses') {
    if (listWrap) listWrap.style.display = 'none';
    if (respWrap) respWrap.style.display = 'block';
    formsRenderResponses();
  } else {
    if (listWrap) listWrap.style.display = 'block';
    if (respWrap) respWrap.style.display = 'none';
    formsRenderGrid(tab);
  }
}

function formsRenderGrid(filter) {
  var grid = document.getElementById('forms-grid');
  var empty = document.getElementById('forms-empty');
  if (!grid) return;
  var filtered = formsData.filter(function(f){
    if (filter === 'all') return true;
    if (filter === 'active') return f.status === 'active';
    if (filter === 'draft') return f.status === 'draft';
    return true;
  });
  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  grid.innerHTML = filtered.map(function(f) {
    var statusColor = f.status === 'active' ? '#22c55e' : 'var(--text-dim)';
    var statusLabel = f.status === 'active' ? '● Active' : '○ Draft';
    var respCount = f.responses ? f.responses.length : 0;
    return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:10px;">'
      + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">'
      + '<div>'
      + (f.type ? '<div style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--brown);margin-bottom:4px;">'+f.type+'</div>' : '')
      + '<div style="font-weight:700;font-size:0.92rem;color:var(--text);">'+f.title+'</div>'
      + '</div>'
      + '<span style="font-size:0.7rem;font-weight:700;color:'+statusColor+';white-space:nowrap;">'+statusLabel+'</span>'
      + '</div>'
      + (f.desc ? '<div style="font-size:0.78rem;color:var(--text-dim);line-height:1.5;">'+f.desc+'</div>' : '')
      + '<div style="font-size:0.75rem;color:var(--text-dim);">'+f.fields.length+' field'+(f.fields.length!==1?'s':'')+' · '+respCount+' response'+(respCount!==1?'s':'')+'</div>'
      + '<div style="display:flex;gap:7px;flex-wrap:wrap;">'
      + '<button onclick="formsOpenBuilder(\''+f.id+'\')" style="flex:1;padding:8px;background:var(--cream);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;font-weight:700;color:var(--text-mid);">✏️ Edit</button>'
      + '<button onclick="formsSend(\''+f.id+'\')" style="flex:1;padding:8px;background:var(--cream);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;font-weight:700;color:var(--text-mid);">📤 Send</button>'
      + '<button onclick="formsDelete(\''+f.id+'\')" style="padding:8px 12px;background:var(--cream);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;font-weight:700;color:#dc2626;" onmouseover="this.style.background=\'#fee2e2\'" onmouseout="this.style.background=\'var(--cream)\'">🗑</button>'
      + '</div>'
      + '</div>';
  }).join('');
}

function formsRenderResponses() {
  var list = document.getElementById('forms-responses-list');
  var empty = document.getElementById('forms-responses-empty');
  if (!list) return;
  var all = [];
  formsData.forEach(function(f){ (f.responses||[]).forEach(function(r){ all.push({form:f, resp:r}); }); });
  if (all.length === 0) { list.innerHTML=''; if(empty) empty.style.display='block'; return; }
  if (empty) empty.style.display='none';
  list.innerHTML = all.map(function(item) {
    return '<div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px 20px;">'
      + '<div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--brown);margin-bottom:4px;">'+item.form.title+'</div>'
      + '<div style="font-weight:600;font-size:0.85rem;color:var(--text);margin-bottom:4px);">'+item.resp.from+'</div>'
      + '<div style="font-size:0.75rem;color:var(--text-dim);">'+item.resp.date+'</div>'
      + '</div>';
  }).join('');
}

function formsOpenBuilder(id) {
  var listWrap = document.getElementById('forms-list-wrap');
  var respWrap = document.getElementById('forms-responses-wrap');
  var builder = document.getElementById('form-builder');
  if (listWrap) listWrap.style.display = 'none';
  if (respWrap) respWrap.style.display = 'none';
  document.querySelector('.section-header') && (document.querySelector('#screen-forms .section-header').style.display = 'none');
  document.querySelectorAll('#screen-forms > div:first-of-type, #screen-forms > div:nth-of-type(2)').forEach(function(el){ if (el.id !== 'form-builder') el.style.display = 'none'; });
  if (builder) builder.style.display = 'block';

  if (id) {
    var form = formsData.find(function(f){ return f.id === id; });
    if (form) {
      fbCurrentId = id;
      fbFields = JSON.parse(JSON.stringify(form.fields));
      document.getElementById('fb-title').value = form.title || '';
      document.getElementById('fb-type').value = form.type || '';
      document.getElementById('fb-desc').value = form.desc || '';
      document.getElementById('fb-body').value = form.body || '';
      document.getElementById('fb-submit-label').value = form.submitLabel || 'Submit';
      document.getElementById('fb-confirm-msg').value = form.confirmMsg || '';
    }
  } else {
    fbCurrentId = null;
    fbFields = [];
    document.getElementById('fb-title').value = '';
    document.getElementById('fb-type').value = '';
    document.getElementById('fb-desc').value = '';
    document.getElementById('fb-body').value = '';
    document.getElementById('fb-submit-label').value = 'Submit';
    document.getElementById('fb-confirm-msg').value = '';
    document.getElementById('fb-recipient-name').value = '';
    document.getElementById('fb-recipient-email').value = '';
    document.getElementById('fb-send-note').value = '';
  }
  fbRenderFields();
  fbUpdatePreview();
}

function formsCloseBuilder() {
  var builder = document.getElementById('form-builder');
  if (builder) builder.style.display = 'none';
  var header = document.querySelector('#screen-forms .section-header');
  if (header) header.style.display = '';
  var topBar = document.querySelector('#screen-forms > div:nth-child(2)');
  if (topBar) topBar.style.display = '';
  var listWrap = document.getElementById('forms-list-wrap');
  if (listWrap) listWrap.style.display = '';
  formsRenderGrid('all');
  document.querySelectorAll('#ftab-all,#ftab-active,#ftab-draft,#ftab-responses').forEach(function(b){b.style.background='transparent';b.style.color='var(--text-dim)';});
  var allBtn = document.getElementById('ftab-all');
  if (allBtn) { allBtn.style.background='var(--brown)'; allBtn.style.color='#fff'; }
}

function fbAddField(type) {
  fbFieldCounter++;
  var defaultLabel = {text:'Text Field',textarea:'Long Text',email:'Email Address',phone:'Phone Number',date:'Date',select:'Dropdown',checkbox:'Checkbox',signature:'Signature'}[type] || 'Field';
  fbFields.push({ id:'field_'+fbFieldCounter, type:type, label:defaultLabel, required:false, options:type==='select'?['Option 1','Option 2']:[] });
  fbRenderFields();
  fbUpdatePreview();
}

function fbRenderFields() {
  var container = document.getElementById('fb-fields-list');
  if (!container) return;
  if (fbFields.length === 0) {
    container.innerHTML = '<div style="font-size:0.82rem;color:var(--text-dim);text-align:center;padding:22px 0;border:1.5px dashed var(--border);border-radius:10px;">Add fields using the buttons above</div>';
    return;
  }
  container.innerHTML = fbFields.map(function(field, idx) {
    var isSig = field.type === 'signature';
    var isSelect = field.type === 'select';
    var typeLabel = {text:'Short Text',textarea:'Long Text',email:'Email',phone:'Phone',date:'Date',select:'Dropdown',checkbox:'Checkbox',signature:'✍️ Signature'}[field.type]||field.type;
    var html = '<div style="background:var(--cream);border:1px solid var(--border);border-radius:10px;padding:14px;" id="fcard_'+field.id+'">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
      + '<span style="font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:'+(isSig?'var(--brown)':'var(--text-dim)')+';">'+typeLabel+'</span>'
      + '<div style="display:flex;align-items:center;gap:8px;">'
      + '<label style="display:flex;align-items:center;gap:4px;font-size:0.72rem;color:var(--text-dim);cursor:pointer;"><input type="checkbox"'+(field.required?' checked':'')+' onchange="fbSetRequired(\''+field.id+'\',this.checked)" style="accent-color:var(--brown);"> Required</label>'
      + '<button onclick="fbRemoveField(\''+field.id+'\')" style="background:none;border:none;cursor:pointer;color:var(--text-dim);font-size:1rem;line-height:1;" onmouseover="this.style.color=\'#dc2626\'" onmouseout="this.style.color=\'var(--text-dim)\'">×</button>'
      + '</div></div>'
      + (isSig ? '<div style="height:56px;border:1.5px dashed var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;background:#fff;"><span style="font-size:0.75rem;color:var(--text-dim);">Signature box</span></div>'
        : '<input type="text" value="'+field.label.replace(/"/g,'&quot;')+'" onchange="fbSetLabel(\''+field.id+'\',this.value)" placeholder="Field label" style="width:100%;padding:8px 10px;border:1.5px solid var(--border);border-radius:8px;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;outline:none;box-sizing:border-box;background:#fff;" onfocus="this.style.borderColor=\'var(--brown)\'" onblur="this.style.borderColor=\'var(--border)\'">')
      + (isSelect ? '<div style="margin-top:8px;display:flex;flex-direction:column;gap:5px;" id="fopts_'+field.id+'">'
          + field.options.map(function(opt,oi){
              return '<div style="display:flex;gap:6px;align-items:center;">'
                +'<input type="text" value="'+opt.replace(/"/g,'&quot;')+'" onchange="fbSetOption(\''+field.id+'\','+oi+',this.value)" style="flex:1;padding:6px 9px;border:1.5px solid var(--border);border-radius:7px;font-family:\'DM Sans\',sans-serif;font-size:0.78rem;outline:none;background:#fff;" onfocus="this.style.borderColor=\'var(--brown)\'" onblur="this.style.borderColor=\'var(--border)\'">'
                +'<button onclick="fbRemoveOption(\''+field.id+'\','+oi+')" style="background:none;border:none;cursor:pointer;color:var(--text-dim);font-size:0.9rem;" title="Remove">×</button>'
                +'</div>';
            }).join('')
          + '<button onclick="fbAddOption(\''+field.id+'\')" style="margin-top:2px;padding:4px 10px;background:none;border:1px dashed var(--border);border-radius:7px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.72rem;color:var(--text-dim);width:100%;" onmouseover="this.style.borderColor=\'var(--brown)\';this.style.color=\'var(--brown)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--text-dim)\'">+ Add Option</button>'
          + '</div>'
        : '')
      + '</div>';
    return html;
  }).join('');
}

function fbSetLabel(id, val) { var f=fbFields.find(function(x){return x.id===id;}); if(f){f.label=val; fbUpdatePreview();} }
function fbSetRequired(id, val) { var f=fbFields.find(function(x){return x.id===id;}); if(f) f.required=val; }
function fbRemoveField(id) { fbFields=fbFields.filter(function(x){return x.id!==id;}); fbRenderFields(); fbUpdatePreview(); }
function fbAddOption(id) { var f=fbFields.find(function(x){return x.id===id;}); if(f){f.options.push('Option '+(f.options.length+1)); fbRenderFields(); fbUpdatePreview();} }
function fbRemoveOption(id,oi) { var f=fbFields.find(function(x){return x.id===id;}); if(f&&f.options.length>1){f.options.splice(oi,1); fbRenderFields(); fbUpdatePreview();} }
function fbSetOption(id,oi,val) { var f=fbFields.find(function(x){return x.id===id;}); if(f) f.options[oi]=val; fbUpdatePreview(); }

function fbUpdatePreview() {
  var title = (document.getElementById('fb-title')||{}).value || 'Form title';
  var desc = (document.getElementById('fb-desc')||{}).value || '';
  var body = (document.getElementById('fb-body')||{}).value || '';
  var type = (document.getElementById('fb-type')||{}).value || '';
  var submitLabel = (document.getElementById('fb-submit-label')||{}).value || 'Submit';
  var titleEl = document.getElementById('fb-preview-title');
  var descEl = document.getElementById('fb-preview-desc');
  var typeEl = document.getElementById('fb-preview-type');
  var fieldsEl = document.getElementById('fb-preview-fields');
  var submitEl = document.getElementById('fb-preview-submit-btn');
  if (titleEl) titleEl.textContent = title;
  if (descEl) { descEl.textContent = desc; descEl.style.display = desc ? 'block' : 'none'; }
  if (typeEl) { typeEl.textContent = type; typeEl.style.display = type ? 'block' : 'none'; }
  if (submitEl) submitEl.textContent = submitLabel || 'Submit';

  // Render form body (clauses/terms) in preview
  var bodyPreviewId = 'fb-preview-body';
  var existing = document.getElementById(bodyPreviewId);
  if (body) {
    if (!existing) {
      var bodyEl = document.createElement('div');
      bodyEl.id = bodyPreviewId;
      bodyEl.style.cssText = 'background:var(--cream);border-radius:10px;padding:14px 16px;font-size:0.8rem;line-height:1.8;color:var(--text);white-space:pre-wrap;border:1px solid var(--border);margin-bottom:0;';
      if (fieldsEl && fieldsEl.parentNode) fieldsEl.parentNode.insertBefore(bodyEl, fieldsEl);
    }
    document.getElementById(bodyPreviewId).textContent = body;
    document.getElementById(bodyPreviewId).style.display = 'block';
  } else if (existing) {
    existing.style.display = 'none';
  }
  if (!fieldsEl) return;
  if (fbFields.length === 0) { fieldsEl.innerHTML = '<div style="font-size:0.82rem;color:var(--text-dim);font-style:italic;">Fields will appear here as you add them</div>'; return; }
  fieldsEl.innerHTML = fbFields.map(function(field) {
    var req = field.required ? ' <span style="color:#dc2626;">*</span>' : '';
    if (field.type === 'signature') {
      return '<div><div style="font-size:0.78rem;font-weight:600;color:var(--text);margin-bottom:5px;">✍️ Signature'+req+'</div>'
        +'<div style="height:56px;border:1.5px dashed var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;background:var(--cream);">'
        +'<span style="font-size:0.72rem;color:var(--text-dim);">Sign here</span></div></div>';
    }
    if (field.type === 'textarea') {
      return '<div><div style="font-size:0.78rem;font-weight:600;color:var(--text);margin-bottom:5px;">'+field.label+req+'</div>'
        +'<div style="height:60px;border:1.5px solid var(--border);border-radius:8px;background:var(--cream);padding:8px 10px;font-size:0.75rem;color:var(--text-dim);">Type here…</div></div>';
    }
    if (field.type === 'checkbox') {
      return '<div style="display:flex;align-items:center;gap:8px;"><div style="width:16px;height:16px;border:1.5px solid var(--border);border-radius:4px;flex-shrink:0;background:var(--cream);"></div><div style="font-size:0.78rem;font-weight:600;color:var(--text);">'+field.label+req+'</div></div>';
    }
    if (field.type === 'select') {
      return '<div><div style="font-size:0.78rem;font-weight:600;color:var(--text);margin-bottom:5px;">'+field.label+req+'</div>'
        +'<div style="border:1.5px solid var(--border);border-radius:8px;padding:8px 10px;background:var(--cream);font-size:0.75rem;color:var(--text-dim);">'+(field.options[0]||'Select…')+' ▾</div></div>';
    }
    var ph = {email:'email@example.com',phone:'+1 (000) 000-0000',date:'MM / DD / YYYY',text:''}[field.type]||'';
    return '<div><div style="font-size:0.78rem;font-weight:600;color:var(--text);margin-bottom:5px;">'+field.label+req+'</div>'
      +'<div style="border:1.5px solid var(--border);border-radius:8px;padding:8px 10px;background:var(--cream);font-size:0.75rem;color:var(--text-dim);">'+(ph||'Answer…')+'</div></div>';
  }).join('');
}

function fbSaveDraft() {
  var title = (document.getElementById('fb-title')||{}).value || '';
  if (!title.trim()) { toast('⚠️ Please add a form title'); return; }
  fbPersist('draft');
  formsCloseBuilder();
  toast('📝 Form saved as draft');
}

function fbPublish() {
  var title = (document.getElementById('fb-title')||{}).value || '';
  if (!title.trim()) { toast('⚠️ Please add a form title'); return; }
  if (fbFields.length === 0) { toast('⚠️ Add at least one field'); return; }
  fbPersist('active');
  formsCloseBuilder();
  toast('✓ Form published!');
}

function fbPersist(status) {
  var title = document.getElementById('fb-title').value;
  var type = document.getElementById('fb-type').value;
  var desc = document.getElementById('fb-desc').value;
  var body = document.getElementById('fb-body').value;
  var submitLabel = document.getElementById('fb-submit-label').value;
  var confirmMsg = document.getElementById('fb-confirm-msg').value;
  if (fbCurrentId) {
    var f = formsData.find(function(x){ return x.id===fbCurrentId; });
    if (f) { f.title=title; f.type=type; f.desc=desc; f.body=body; f.fields=JSON.parse(JSON.stringify(fbFields)); f.submitLabel=submitLabel; f.confirmMsg=confirmMsg; f.status=status; }
  } else {
    var newId = 'form_'+(Date.now());
    formsData.push({ id:newId, title:title, type:type, desc:desc, body:body, fields:JSON.parse(JSON.stringify(fbFields)), submitLabel:submitLabel, confirmMsg:confirmMsg, status:status, responses:[] });
    fbCurrentId = newId;
  }
}

function fbSendEmail() {
  var title = (document.getElementById('fb-title')||{}).value || '';
  if (!title.trim()) { toast('⚠️ Please add a form title first'); return; }
  if (fbFields.length === 0) { toast('⚠️ Add at least one field first'); return; }
  var email = (document.getElementById('fb-recipient-email')||{}).value || '';
  var name = (document.getElementById('fb-recipient-name')||{}).value || '';
  var note = (document.getElementById('fb-send-note')||{}).value || '';
  if (!email.trim()) { toast('⚠️ Please enter a recipient email'); return; }
  fbPersist('active');
  // Simulate opening email client
  var subject = encodeURIComponent('Form: ' + title);
  var body = encodeURIComponent((name ? 'Hi ' + name + ',\n\n' : '') + (note ? note + '\n\n' : '') + 'Please complete the form "' + title + '" and sign if required, then send it back.\n\n— Sent via MASSED');
  window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
  toast('✉️ Email opened — form sent to ' + email);
}

function fbSendMessage() {
  var title = (document.getElementById('fb-title')||{}).value || '';
  if (!title.trim()) { toast('⚠️ Please add a form title first'); return; }
  if (fbFields.length === 0) { toast('⚠️ Add at least one field first'); return; }
  fbPersist('active');
  toast('💬 Form sent in message!');
  // Navigate to messages
  var msgNav = document.querySelector('[onclick*="messages"]');
  nav(msgNav||null, 'messages');
}

function formsSend(id) {
  var f = formsData.find(function(x){ return x.id===id; });
  if (!f) return;
  openModal('modal-form-send');
  document.getElementById('fsend-form-id').value = id;
  document.getElementById('fsend-title').textContent = f.title;
  document.getElementById('fsend-recipient-name').value = '';
  document.getElementById('fsend-recipient-email').value = '';
  document.getElementById('fsend-note').value = '';
}

function fsendViaEmail() {
  var id = document.getElementById('fsend-form-id').value;
  var f = formsData.find(function(x){ return x.id===id; });
  var email = document.getElementById('fsend-recipient-email').value;
  var name = document.getElementById('fsend-recipient-name').value;
  var note = document.getElementById('fsend-note').value;
  if (!email.trim()) { toast('⚠️ Please enter a recipient email'); return; }
  var subject = encodeURIComponent('Form: ' + (f?f.title:''));
  var body = encodeURIComponent((name?'Hi '+name+',\n\n':'')+(note?note+'\n\n':'')+'Please complete and return the form "'+(f?f.title:'')+'".\n\n— Sent via MASSED');
  window.location.href = 'mailto:'+email+'?subject='+subject+'&body='+body;
  closeModal('modal-form-send');
  toast('✉️ Email opened for ' + (f?f.title:'form'));
}

function fsendViaMessage() {
  var id = document.getElementById('fsend-form-id').value;
  var f = formsData.find(function(x){ return x.id===id; });
  closeModal('modal-form-send');
  toast('💬 Form "' + (f?f.title:'') + '" sent in message!');
  var msgNav = document.querySelector('[onclick*="messages"]');
  nav(msgNav||null, 'messages');
}

function formsDelete(id) {
  if (!confirm('Delete this form? This cannot be undone.')) return;
  formsData = formsData.filter(function(f){ return f.id!==id; });
  formsRenderGrid('all');
  toast('🗑 Form deleted');
}
