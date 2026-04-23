var bioPollQuestions = []; // [{question:'', options:['','',...]}]

function bioInitIfEmpty() {
  if (bioPollQuestions.length === 0) bioAddQuestion();
}

function bioAddQuestion() {
  var idx = bioPollQuestions.length;
  bioPollQuestions.push({ question: '', options: ['', ''] });
  bioRenderQuestions();
}

function bioRenderQuestions() {
  var container = document.getElementById('bio-questions-list');
  if (!container) return;
  container.innerHTML = '';
  bioPollQuestions.forEach(function(q, qi) {
    var card = document.createElement('div');
    card.style.cssText = 'background:var(--cream);border:1px solid var(--border);border-radius:12px;padding:16px;';
    var headerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
      + '<div style="font-size:0.62rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--brown);">Question ' + (qi+1) + '</div>'
      + (bioPollQuestions.length > 1 ? '<button onclick="bioRemoveQuestion('+qi+')" style="background:none;border:none;cursor:pointer;font-size:0.75rem;color:var(--text-dim);font-weight:600;font-family:\'DM Sans\',sans-serif;" onmouseover="this.style.color=\'#dc2626\'" onmouseout="this.style.color=\'var(--text-dim)\'">✕ Remove</button>' : '')
      + '</div>';
    var qHTML = '<input type="text" placeholder="Ask something…" value="'+q.question.replace(/"/g,'&quot;')+'" oninput="bioSetQuestion('+qi+',this.value)" style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:9px;font-family:\'DM Sans\',sans-serif;font-size:0.85rem;font-weight:600;outline:none;box-sizing:border-box;background:#fff;margin-bottom:10px;" onfocus="this.style.borderColor=\'var(--brown)\'" onblur="this.style.borderColor=\'var(--border)\'">';
    var optsHTML = '<div style="display:flex;flex-direction:column;gap:7px;" id="bio-opts-'+qi+'">';
    q.options.forEach(function(opt, oi) {
      optsHTML += '<div style="display:flex;align-items:center;gap:7px;">'
        + '<div style="width:20px;height:20px;border-radius:50%;background:'+(oi<2?'var(--brown)':'var(--cream3)')+';color:'+(oi<2?'#fff':'var(--text-dim)')+';font-size:0.6rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+(oi+1)+'</div>'
        + '<input type="text" placeholder="Option '+(oi+1)+(oi>=2?' (optional)':'')+'" value="'+opt.replace(/"/g,'&quot;')+'" oninput="bioSetOption('+qi+','+oi+',this.value)" style="flex:1;padding:7px 10px;border:1.5px solid var(--border);border-radius:8px;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;outline:none;background:#fff;" onfocus="this.style.borderColor=\'var(--brown)\'" onblur="this.style.borderColor=\'var(--border)\'">'
        + (oi >= 2 ? '<button onclick="bioRemoveOption('+qi+','+oi+')" style="background:none;border:none;cursor:pointer;color:var(--text-dim);font-size:1rem;line-height:1;flex-shrink:0;" title="Remove option">×</button>' : '')
        + '</div>';
    });
    optsHTML += '</div>';
    var addOptBtn = '<button onclick="bioAddOption('+qi+')" style="margin-top:8px;display:flex;align-items:center;gap:5px;padding:5px 10px;background:none;border:1px dashed var(--border);border-radius:8px;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.75rem;font-weight:600;color:var(--text-dim);width:100%;justify-content:center;" onmouseover="this.style.borderColor=\'var(--brown)\';this.style.color=\'var(--brown)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--text-dim)\'">'
      + '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Option</button>';
    card.innerHTML = headerHTML + qHTML + optsHTML + addOptBtn;
    container.appendChild(card);
  });
  bioUpdatePreview();
}

function bioSetQuestion(qi, val) { bioPollQuestions[qi].question = val; bioUpdatePreview(); }
function bioSetOption(qi, oi, val) { bioPollQuestions[qi].options[oi] = val; bioUpdatePreview(); }

function bioAddOption(qi) {
  bioPollQuestions[qi].options.push('');
  bioRenderQuestions();
}
function bioRemoveOption(qi, oi) {
  if (bioPollQuestions[qi].options.length <= 2) { toast('Minimum 2 options required'); return; }
  bioPollQuestions[qi].options.splice(oi, 1);
  bioRenderQuestions();
}
function bioRemoveQuestion(qi) {
  bioPollQuestions.splice(qi, 1);
  bioRenderQuestions();
}

function bioUpdatePreview() {
  var title = (document.getElementById('bio-poll-title')||{}).value || '';

  // Preview 1 — profile card: title + Vote button
  var titleEl = document.getElementById('bio-phone-title');
  if (titleEl) {
    titleEl.textContent = title || 'Poll title appears here…';
    titleEl.style.color = title ? 'var(--text)' : 'var(--text-dim)';
    titleEl.style.fontStyle = title ? 'normal' : 'italic';
  }

  // Preview 2 — full detail: title + all questions + options
  var detailTitle = document.getElementById('bio-detail-title');
  if (detailTitle) {
    detailTitle.textContent = title || 'Poll title appears here…';
    detailTitle.style.color = title ? 'var(--text)' : 'var(--text-dim)';
    detailTitle.style.fontStyle = title ? 'normal' : 'italic';
  }
  var qContainer = document.getElementById('bio-detail-questions');
  if (!qContainer) return;
  var filled = bioPollQuestions.filter(function(q){ return q.question.trim(); });
  if (filled.length === 0) {
    qContainer.innerHTML = '<div style="font-size:0.6rem;color:var(--text-dim);font-style:italic;">Questions and options appear here…</div>';
    return;
  }
  qContainer.innerHTML = filled.map(function(q, i) {
    var opts = q.options.filter(function(o){ return o.trim(); });
    if (opts.length === 0) opts = ['Option 1', 'Option 2'];
    return '<div style="' + (i > 0 ? 'margin-top:10px;padding-top:10px;border-top:1px solid var(--border);' : '') + '">'
      + '<div style="font-weight:700;font-size:0.62rem;color:var(--text);margin-bottom:6px;line-height:1.35;">' + q.question + '</div>'
      + opts.map(function(o) {
          return '<div style="padding:4px 8px;background:var(--cream);border:1px solid var(--border);border-radius:6px;font-size:0.58rem;color:var(--text);margin-bottom:4px;cursor:pointer;">' + o + '</div>';
        }).join('')
      + '</div>';
  }).join('');
}

var bioPollVisible = false;
var bioPollSaved = false;

function bioPollSave() {
  var title = (document.getElementById('bio-poll-title')||{}).value || '';
  if (!title.trim()) { toast('⚠️ Please add a poll title'); return; }
  var filled = bioPollQuestions.filter(function(q){ return q.question.trim() && q.options.filter(function(o){return o.trim();}).length >= 2; });
  if (filled.length === 0) { toast('⚠️ Add at least one question with 2 options'); return; }
  bioPollSaved = true;
  bioPollVisible = true;
  var actions = document.getElementById('bio-poll-actions');
  if (actions) actions.style.display = 'flex';
  bioPollUpdateStatus();
  toast('✓ Poll saved!');
}

function bioPollToggleVisibility() {
  if (!bioPollSaved) return;
  bioPollVisible = !bioPollVisible;
  bioPollUpdateStatus();
  toast(bioPollVisible ? '👁 Poll is now visible on your profile' : '🚫 Poll hidden from your profile');
}

function bioPollUpdateStatus() {
  var statusBox = document.getElementById('bio-saved-status');
  var iconEl = document.getElementById('bio-status-icon');
  var subEl = document.getElementById('bio-status-sub');
  var toggleBtn = document.getElementById('bio-toggle-btn');
  var toggleLabel = document.getElementById('bio-toggle-label');
  var phonePreview = document.getElementById('bio-phone-preview');
  if (!statusBox) return;
  statusBox.style.display = 'block';
  if (bioPollVisible) {
    statusBox.style.background = '#eaf3de';
    statusBox.style.border = '1px solid #c0dd97';
    if (iconEl) { iconEl.textContent = '✓ Poll is visible on your profile'; iconEl.style.color = '#3b6d11'; }
    if (subEl) { subEl.textContent = 'Shown at massed.io/username'; subEl.style.color = '#639922'; }
    if (toggleLabel) toggleLabel.textContent = 'Hide from Profile';
    if (toggleBtn) { toggleBtn.style.borderColor = 'var(--brown)'; toggleBtn.style.color = 'var(--brown)'; }
    if (phonePreview) phonePreview.style.opacity = '1';
  } else {
    statusBox.style.background = 'var(--cream2)';
    statusBox.style.border = '1px solid var(--border)';
    if (iconEl) { iconEl.textContent = '⏸ Poll is hidden from your profile'; iconEl.style.color = 'var(--text-mid)'; }
    if (subEl) { subEl.textContent = 'Save and show when ready'; subEl.style.color = 'var(--text-dim)'; }
    if (toggleLabel) toggleLabel.textContent = 'Show on Profile';
    if (toggleBtn) { toggleBtn.style.borderColor = 'var(--border)'; toggleBtn.style.color = 'var(--text-mid)'; }
    if (phonePreview) phonePreview.style.opacity = '0.35';
  }
}

function bioPollDelete() {
  if (!confirm('Delete this poll? This will remove it from your profile.')) return;
  bioPollSaved = false;
  bioPollVisible = false;
  // Reset form
  var titleEl = document.getElementById('bio-poll-title');
  if (titleEl) titleEl.value = '';
  bioPollQuestions = [];
  bioAddQuestion();
  bioUpdatePreview();
  var actions = document.getElementById('bio-poll-actions');
  if (actions) actions.style.display = 'none';
  var statusBox = document.getElementById('bio-saved-status');
  if (statusBox) statusBox.style.display = 'none';
  var phonePreview = document.getElementById('bio-phone-preview');
  if (phonePreview) phonePreview.style.opacity = '1';
  toast('🗑 Poll deleted');
}

// Global exposure
window.bioAddQuestion = bioAddQuestion;