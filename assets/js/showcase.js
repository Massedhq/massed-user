// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MASSED SHOWCASE — Single-source template system
// render(opts) → real profile HTML used by card, phone & public page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
var SHOWCASE_ACTIVE = 'classic';

// Helper: read live profile data
function _pd() {
  var nameEl  = document.querySelector('#mptab-profile-content input[placeholder="Your name"]');
  var titleEl = document.querySelector('#mptab-profile-content input[placeholder="e.g. UGC Creator, Beauty Consultant"]');
  var bioEl   = document.querySelector('#mptab-profile-content textarea');
  return {
    name:   (nameEl  && nameEl.value.trim())  || 'Avy Adore',
    title:  (titleEl && titleEl.value.trim()) || 'Beauty · Wellness · Real Estate & More',
    bio:    (bioEl   && bioEl.value.trim())   || 'Sign up to get updates directly from me.',
    handle: ((nameEl && nameEl.value.trim()) || 'avyadore').toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,''),
    rating: '4.9', reviews: '884'
  };
}

// ── SOCIAL ICON ROW (shared) ──────────────────────────────
function _socialBar(fg, bg) {
  var icons = [
    // TikTok
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="'+fg+'"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.7a4.85 4.85 0 01-1.01-.01z"/></svg>',
    // Snapchat
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="'+fg+'"><path d="M12.166 2C8.756 2 6 4.756 6 8.166v.523l-.832.222a.73.73 0 00-.535.777l.1.556a.73.73 0 00.612.6l.29.04-.168.39C4.78 12.07 3.5 13.15 2.8 13.15a.73.73 0 00-.73.73v.17a.73.73 0 00.73.73c.9 0 2.96.78 4 2.55.63 1.07 1.84 1.84 3.72 1.84.47 0 .96-.06 1.48-.18l.17-.04.17.04c.52.12 1.01.18 1.48.18 1.88 0 3.09-.77 3.72-1.84 1.04-1.77 3.1-2.55 4-2.55a.73.73 0 00.73-.73v-.17a.73.73 0 00-.73-.73c-.7 0-1.98-1.08-2.667-2.743l-.168-.39.29-.04a.73.73 0 00.612-.6l.1-.556a.73.73 0 00-.535-.777L21 8.69v-.523C21 4.756 18.244 2 14.834 2h-2.668z"/></svg>',
    // Instagram
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="'+fg+'" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="'+fg+'"/></svg>',
    // Facebook
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="'+fg+'"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>',
    // YouTube
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="'+fg+'"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 001.95-1.97A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>',
    // Amazon
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="'+fg+'"><path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705a.661.661 0 01-.77.074c-1.079-.895-1.271-1.311-1.865-2.165-1.782 1.815-3.044 2.36-5.353 2.36-2.737 0-4.863-1.688-4.863-5.073 0-2.641 1.431-4.441 3.471-5.321 1.768-.782 4.237-.92 6.127-1.134v-.422c0-.778.06-1.698-.396-2.372-.397-.602-1.162-.85-1.833-.85-1.245 0-2.357.639-2.629 1.962-.056.297-.274.59-.576.604l-3.229-.349c-.272-.062-.576-.281-.499-.699.743-3.912 4.28-5.09 7.447-5.09 1.622 0 3.742.432 5.021 1.66 1.622 1.519 1.467 3.542 1.467 5.748v5.206c0 1.567.649 2.253 1.259 3.099.215.302.261.664-.01.89l-2.569 2.222zm2.574 3.338C17.344 22.05 14.77 22.5 12.5 22.5c-3.508 0-6.709-1.293-9.113-3.434-.378-.332-.041-.784.414-.527 2.593 1.513 5.798 2.417 9.109 2.417 2.232 0 4.685-.463 6.942-1.423.341-.146.627.223.286.6z"/></svg>'
  ];
  return '<div style="display:flex;align-items:center;gap:7px;padding:10px 14px 7px;">'
    + icons.map(function(i){ return '<div style="width:26px;height:26px;background:'+bg+';border-radius:7px;display:flex;align-items:center;justify-content:center;">'+i+'</div>'; }).join('')
    + '<div style="margin-left:auto;cursor:pointer;"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="'+fg+'" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></div>'
    + '</div>';
}

// ── SECTION TILE GRID (shared: classic/cream) ─────────────
function _sectionGrid(accent, border, bg, text) {
  var tiles = [
    ['📦','Shop'],['🎓','Courses'],['🎟️','Events'],
    ['📅','Booking'],['🎫','Tickets'],['💳','Members'],
    ['📚','Ebooks'],['⭐','Reviews'],['👤','My Profile']
  ];
  var html = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:0 12px 8px;">';
  tiles.forEach(function(t) {
    html += '<div style="background:'+bg+';border:1.5px solid '+border+';border-radius:10px;padding:10px 4px 8px;text-align:center;cursor:pointer;">'
      + '<div style="font-size:18px;margin-bottom:4px;">'+t[0]+'</div>'
      + '<div style="font-size:7px;font-weight:700;color:'+text+';line-height:1.3;">'+t[1]+'</div>'
      + '</div>';
  });
  html += '</div>';
  // Collaborate + CTA row
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 12px 10px;">';
  html += '<div style="background:'+bg+';border:1.5px solid '+border+';border-radius:10px;padding:10px 4px 8px;text-align:center;cursor:pointer;">'
    + '<div style="font-size:18px;margin-bottom:4px;">🤝</div>'
    + '<div style="font-size:7px;font-weight:700;color:'+text+';">Collaborate</div>'
    + '</div>';
  html += '<div style="background:'+accent+';border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;">'
    + '<div style="font-size:7.5px;font-weight:800;color:#fff;text-align:center;line-height:1.4;">Create My<br>Own Link</div>'
    + '</div>';
  html += '</div>';
  return html;
}

// ── SUBSCRIBE FORM (shared) ───────────────────────────────
function _subscribeForm(btnBg, btnText, borderBg, label) {
  return '<div style="padding:0 12px 8px;">'
    + '<div style="font-size:9px;font-weight:800;color:'+btnBg+';margin-bottom:5px;letter-spacing:0.04em;">'+label+'</div>'
    + '<div style="height:22px;background:'+borderBg+';border:1px solid rgba(0,0,0,0.1);border-radius:6px;margin-bottom:4px;display:flex;align-items:center;padding:0 9px;"><span style="font-size:7.5px;color:#aaa;">First Name</span></div>'
    + '<div style="height:22px;background:'+borderBg+';border:1px solid rgba(0,0,0,0.1);border-radius:6px;margin-bottom:4px;display:flex;align-items:center;padding:0 9px;"><span style="font-size:7.5px;color:#aaa;">Email</span></div>'
    + '<div style="height:22px;background:'+borderBg+';border:1px solid rgba(0,0,0,0.1);border-radius:6px;margin-bottom:7px;display:flex;align-items:center;padding:0 9px;"><span style="font-size:7.5px;color:#aaa;">Phone Number</span></div>'
    + '<div style="height:24px;background:'+btnBg+';border-radius:6px;display:flex;align-items:center;justify-content:center;margin-bottom:5px;cursor:pointer;">'
    + '<span style="color:'+btnText+';font-size:8px;font-weight:800;">Subscribe</span>'
    + '</div>'
    + '<div style="height:24px;background:transparent;border:1.5px solid '+btnBg+';border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;margin-bottom:8px;">'
    + '<span style="color:'+btnBg+';font-size:8px;font-weight:800;">Message Me</span>'
    + '</div></div>';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEMPLATE DEFINITIONS — each render() is the real profile page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
var TEMPLATES = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. MASSED CLASSIC — exact Image 1 Canva layout
  //    Half-portrait hero · social icons · stars · subscribe
  //    form · horizontal image cards · 3-col section grid
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  classic: {
    label: 'MASSED Classic',
    mood:  'Full Profile · Grid Sections · Editorial',
    accent:'#2C1A0E',
    render: function() {
      var p = _pd();

      // Real SVG social platform icons (not letter abbreviations)
      function sIcon(svg, bg) {
        return '<div style="width:28px;height:28px;background:'+(bg||'rgba(44,26,14,0.1)')+';border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+svg+'</div>';
      }
      var ttSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="#2C1A0E"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.7a4.85 4.85 0 01-1.01-.01z"/></svg>';
      var scSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="#2C1A0E"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
      var igSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2C1A0E" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="#2C1A0E" stroke="none"/></svg>';
      var fbSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="#2C1A0E"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>';
      var ytSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="#2C1A0E"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45a2.78 2.78 0 00-1.95 1.97A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 001.95-1.97A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>';
      var amzSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="#2C1A0E"><path d="M15.93 17.09c-2.93 1.97-7.17 3.02-10.82 1.6C2.36 17.5.5 15.55.5 12.5c0-5.24 4.27-9.5 9.5-9.5 2.65 0 5.05 1.08 6.78 2.82M15 9l2 2-2 2M17 11H9"/></svg>';
      var shareSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2C1A0E" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';

      // Trusted source badge (shield + checkmark like Image 1)
      var trustedBadge = '<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;">'
        + '<svg viewBox="0 0 24 24" width="16" height="16" fill="#2C1A0E"><path d="M12 2L3 7l.01 5c0 4.52 3.8 8.76 8.99 9.99C17.2 20.76 21 16.52 21 12V7L12 2z"/></svg>'
        + '<span style="font-size:7px;font-weight:700;color:#2C1A0E;letter-spacing:0.06em;text-transform:uppercase;">Trusted Source</span>'
        + '</div>';

      return '<div style="background:#f5ede8;min-height:700px;font-family:\'DM Sans\',sans-serif;">'

        // ── Social icon row ──────────────────────────────────
        + '<div style="display:flex;align-items:center;gap:6px;padding:10px 12px 8px;">'
        + sIcon(ttSvg) + sIcon(scSvg) + sIcon(igSvg) + sIcon(fbSvg) + sIcon(ytSvg) + sIcon(amzSvg)
        + '<div style="margin-left:auto;">'+shareSvg+'</div>'
        + '</div>'

        // ── Hero: real photo left, profile info right ────────
        // Photo uses a full-bleed portrait-style image
        + '<div style="display:flex;height:160px;">'
          // Photo panel — real image, not a gradient
          + '<div style="width:46%;position:relative;overflow:hidden;">'
          + '<img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=320&fit=crop&crop=face&auto=format" style="width:100%;height:100%;object-fit:cover;object-position:top center;" onerror="this.style.background=\'linear-gradient(170deg,#8B6558,#C4956A)\';this.src=\'\';">'
          + '</div>'
          // Info panel
          + '<div style="flex:1;padding:12px 10px 10px;display:flex;flex-direction:column;justify-content:flex-start;gap:2px;">'
          + trustedBadge
          + '<div style="font-size:15px;font-weight:900;color:#2C1A0E;letter-spacing:-0.3px;line-height:1.1;margin-bottom:3px;">'+p.name+'</div>'
          + '<div style="color:#C07A50;font-size:10px;margin-bottom:3px;letter-spacing:0.5px;">★★★★★ <span style="color:#999;font-size:8px;">('+p.reviews+')</span></div>'
          + '<div style="font-size:7.5px;font-weight:600;color:#3a2a1e;line-height:1.55;">'+p.title+'</div>'
          + '<div style="margin-top:5px;border-top:1px solid rgba(44,26,14,0.1);padding-top:5px;">'
          + '<div style="font-size:8px;font-weight:800;color:#2C1A0E;">Subscribe to '+p.handle+'</div>'
          + '<div style="font-size:7px;color:#888;margin-top:1px;">Get email updates directly from me</div>'
          + '</div></div>'
        + '</div>'

        // ── Subscribe form ───────────────────────────────────
        + '<div style="padding:12px 12px 8px;">'
        + ['First Name','Email','Phone Number'].map(function(ph){
          return '<div style="height:26px;background:#fff;border:1px solid #ddd;border-radius:7px;margin-bottom:5px;display:flex;align-items:center;padding:0 10px;">'
            + '<span style="font-size:8px;color:#bbb;">'+ph+'</span></div>';
        }).join('')
        + '<div style="height:30px;background:#2C1A0E;border-radius:7px;display:flex;align-items:center;justify-content:center;margin-bottom:5px;cursor:pointer;">'
        + '<span style="color:#fff;font-size:9px;font-weight:800;letter-spacing:0.04em;">Subscribe to '+p.handle+'</span>'
        + '</div>'
        + '<div style="height:30px;background:transparent;border:1.5px solid #2C1A0E;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;">'
        + '<span style="color:#2C1A0E;font-size:9px;font-weight:800;">Message Me</span>'
        + '</div></div>'

        // ── Horizontal image-card link row ───────────────────
        + '<div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:10px 12px;">'
        + [
            ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=140&fit=crop&auto=format', 'Oi: Body Chemistry'],
            ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=140&fit=crop&crop=face&auto=format', p.handle+'.com'],
            ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=140&fit=crop&auto=format', 'TikTok']
          ].map(function(c){
            return '<div style="flex-shrink:0;width:96px;height:68px;border-radius:10px;overflow:hidden;position:relative;border:1px solid rgba(0,0,0,0.07);">'
              + '<img src="'+c[0]+'" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'linear-gradient(135deg,#8B6558,#C07A50)\';this.remove();">'
              + '<div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(0,0,0,0.65));"></div>'
              + '<div style="position:absolute;bottom:0;left:0;right:0;padding:5px 7px;">'
              + '<span style="color:#fff;font-size:7px;font-weight:700;line-height:1.2;display:block;">'+c[1]+'</span>'
              + '</div></div>';
          }).join('')
        + '</div>'

        // ── 3-col section grid ───────────────────────────────
        + (function(){
          var sections = [
            {icon:'🛍️',label:'Shop'},
            {icon:'🎓',label:'Courses'},
            {icon:'🎟️',label:'Events'},
            {icon:'📅',label:'Booking'},
            {icon:'🎫',label:'Tickets'},
            {icon:'💳',label:'Members/\nSubs'},
            {icon:'📚',label:'Ebooks'},
            {icon:'⭐',label:'Reviews'},
            {icon:'👤',label:'My Media\nProfile'}
          ];
          var imgs = [
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=100&h=80&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=80&fit=crop&crop=face&auto=format'
          ];
          var g = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:0 12px 6px;">';
          sections.forEach(function(s, i){
            g += '<div style="background:#fff;border:1.5px solid #e8dcd4;border-radius:10px;overflow:hidden;cursor:pointer;">'
              + '<div style="height:44px;overflow:hidden;position:relative;">'
              + '<img src="'+imgs[i]+'" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'#e8dcd4\';this.remove();">'
              + '</div>'
              + '<div style="padding:5px 4px 6px;text-align:center;">'
              + '<div style="font-size:7px;font-weight:700;color:#2C1A0E;white-space:pre-line;line-height:1.3;">'+s.label+'</div>'
              + '</div></div>';
          });
          g += '</div>';
          // Bottom row: Collaborate + CTA
          g += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 12px 16px;">';
          g += '<div style="background:#fff;border:1.5px solid #e8dcd4;border-radius:10px;overflow:hidden;cursor:pointer;">'
            + '<div style="height:44px;overflow:hidden;background:linear-gradient(135deg,#8B6558,#C07A50);display:flex;align-items:center;justify-content:center;font-size:22px;">🤝</div>'
            + '<div style="padding:5px 4px 6px;text-align:center;"><div style="font-size:7px;font-weight:700;color:#2C1A0E;">Collaborate\nWith Me</div></div>'
            + '</div>';
          g += '<div style="background:#2C1A0E;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:8px;">'
            + '<div style="font-size:8.5px;font-weight:800;color:#fff;text-align:center;line-height:1.5;">Create My<br>Own Link</div>'
            + '</div>';
          g += '</div>';
          return g;
        })()

        + '</div>'; // end outer
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. DARK MINIMAL — exact Image 2 Canva layout
  //    Full-bleed dark bg · real photo backdrop · circular
  //    portrait · cursive first/last name flanking avatar ·
  //    white pill buttons · bottom free-download CTA card
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  dark: {
    label: 'Dark Minimal',
    mood:  'Bold · Cinematic · Pill Links',
    accent:'#ffffff',
    render: function() {
      var p = _pd();
      var names = p.name.trim().split(/\s+/);
      var first = names[0] || p.name;
      var last  = names.slice(1).join(' ') || '';

      return '<div style="background:#0a0a0a;min-height:700px;font-family:\'DM Sans\',sans-serif;position:relative;overflow:hidden;">'

        // Full-bleed real photo background (top half)
        + '<div style="position:absolute;top:0;left:0;right:0;height:220px;overflow:hidden;">'
        + '<img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop&auto=format" style="width:100%;height:100%;object-fit:cover;opacity:0.35;" onerror="this.remove();">'
        + '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.2) 0%,rgba(10,10,10,1) 100%);"></div>'
        + '</div>'

        // Content layer above bg
        + '<div style="position:relative;z-index:2;">'

          // Top social bar (subtle on dark)
          + '<div style="display:flex;align-items:center;justify-content:flex-end;padding:12px 14px 0;">'
          + '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
          + '</div>'

          // Name + circular portrait + name layout (Image 2 exact)
          + '<div style="display:flex;align-items:center;justify-content:center;gap:0;padding:70px 16px 0;">'
            // Left: first name in cursive italic
            + '<div style="flex:1;text-align:right;padding-right:10px;">'
            + '<span style="font-family:Georgia,serif;font-size:20px;font-style:italic;font-weight:700;color:rgba(255,255,255,0.95);letter-spacing:0.01em;text-shadow:0 2px 12px rgba(0,0,0,0.8);">'+first+'</span>'
            + '</div>'
            // Centre: circular real portrait
            + '<div style="width:90px;height:90px;border-radius:50%;border:3px solid #fff;overflow:hidden;flex-shrink:0;box-shadow:0 8px 32px rgba(0,0,0,0.7);">'
            + '<img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face&auto=format" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'linear-gradient(145deg,#555,#999)\';this.remove();">'
            + '</div>'
            // Right: last name in cursive italic
            + '<div style="flex:1;padding-left:10px;">'
            + '<span style="font-family:Georgia,serif;font-size:20px;font-style:italic;font-weight:700;color:rgba(255,255,255,0.95);letter-spacing:0.01em;text-shadow:0 2px 12px rgba(0,0,0,0.8);">'+last+'</span>'
            + '</div>'
          + '</div>'

          // Title — bold centred
          + '<div style="text-align:center;margin-top:14px;padding:0 16px;">'
          + '<div style="font-size:17px;font-weight:900;color:#fff;letter-spacing:0.06em;margin-bottom:4px;">'+p.title.toUpperCase().replace(/[·•]/g,'|').substring(0,24)+'</div>'
          + '<div style="font-size:8px;color:rgba(255,255,255,0.5);line-height:1.65;max-width:200px;margin:0 auto 18px;">'+p.bio.substring(0,80)+'</div>'
          + '</div>'

          // Pill buttons — white rounded (exact Image 2)
          + '<div style="padding:0 16px;display:flex;flex-direction:column;gap:8px;margin-bottom:18px;">'
          + ['ABOUT ME','PORTFOLIO','MY SERVICES','WORK WITH ME','BOOK A CALL'].map(function(lbl){
              return '<div style="background:#fff;border-radius:32px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 14px rgba(255,255,255,0.1);cursor:pointer;">'
                + '<span style="font-size:9.5px;font-weight:800;color:#0a0a0a;letter-spacing:0.16em;">'+lbl+'</span>'
                + '</div>';
            }).join('')
          + '</div>'

          // Bottom CTA card (Image 2 lower section — free download)
          + '<div style="margin:0 12px 16px;background:#f5ede8;border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 28px rgba(0,0,0,0.6);">'
          + '<div style="flex:1;">'
          + '<div style="font-size:10px;font-weight:900;color:#2C1A0E;font-style:italic;margin-bottom:3px;line-height:1.3;font-family:Georgia,serif;">Get your free download!</div>'
          + '<div style="font-size:7px;color:#666;line-height:1.6;margin-bottom:8px;">The ultimate guide to boost your sales with UGC.</div>'
          + '<div style="display:inline-flex;height:18px;border:1.5px solid #2C1A0E;border-radius:20px;align-items:center;padding:0 10px;cursor:pointer;">'
          + '<span style="font-size:7px;font-weight:800;color:#2C1A0E;letter-spacing:0.12em;">SEE NOW</span>'
          + '</div></div>'
          // Real product image thumbnail
          + '<div style="width:54px;height:68px;border-radius:8px;overflow:hidden;flex-shrink:0;">'
          + '<img src="https://images.unsplash.com/photo-1546961342-ea5f62d5a27b?w=120&h=160&fit=crop&auto=format" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'#ccc\';this.remove();">'
          + '</div>'
          + '</div>'

        + '</div>'
      + '</div>';
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. CREAM EDITORIAL — magazine / fashion editorial
  //    Dark masthead banner · cream body · hero strip ·
  //    subscribe card · refined pill CTAs
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cream: {
    label: 'Cream Editorial',
    mood:  'Warm · Refined · Magazine',
    accent:'#C07A50',
    render: function() {
      var p = _pd();
      return '<div style="background:#FDFAF6;min-height:700px;font-family:\'DM Sans\',sans-serif;">'

        // Dark masthead with real photo avatar
        + '<div style="background:#2C1A0E;padding:12px 14px 12px;display:flex;align-items:center;justify-content:space-between;">'
        + '<div style="width:48px;height:48px;border-radius:50%;overflow:hidden;border:2px solid rgba(192,122,80,0.5);flex-shrink:0;">'
        + '<img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face&auto=format" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'#8B6558\';this.remove();">'
        + '</div>'
        + '<div style="flex:1;padding:0 12px;">'
        + '<div style="font-size:13px;font-weight:900;color:#fff;letter-spacing:0.03em;line-height:1.2;">'+p.name+'</div>'
        + '<div style="font-size:7px;color:#C07A50;letter-spacing:0.12em;text-transform:uppercase;margin-top:2px;">'+p.title.substring(0,30)+'</div>'
        + '</div>'
        + '<div style="font-size:11px;color:#C07A50;letter-spacing:1px;">★★★★★</div>'
        + '</div>'

        // Full-bleed editorial hero image strip
        + '<div style="height:100px;position:relative;overflow:hidden;">'
        + '<img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=200&fit=crop&auto=format" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'linear-gradient(135deg,#C4956A,#8B6558)\';this.remove();">'
        + '<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(44,26,14,0.7) 0%,rgba(44,26,14,0.2) 60%,transparent);"></div>'
        + '<div style="position:absolute;inset:0;display:flex;align-items:center;padding:0 18px;">'
        + '<div>'
        + '<div style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#fff;font-style:italic;line-height:1.1;">'+p.name.split(' ')[0]+'\'s World</div>'
        + '<div style="font-size:7px;color:rgba(255,255,255,0.7);letter-spacing:0.2em;text-transform:uppercase;margin-top:3px;">your go-to creator</div>'
        + '</div></div></div>'

        // Subscribe card
        + '<div style="background:#fff;margin:10px 12px;border-radius:14px;padding:14px;box-shadow:0 4px 20px rgba(44,26,14,0.1);border:1px solid #e8dcd4;">'
        + '<div style="font-size:9.5px;font-weight:800;color:#2C1A0E;text-align:center;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:9px;">Join the Inner Circle</div>'
        + ['Your Name','Email Address','Phone Number'].map(function(ph){
          return '<div style="height:24px;border:1px solid #e0d5cc;border-radius:7px;margin-bottom:5px;display:flex;align-items:center;padding:0 10px;background:#FDFAF6;">'
            + '<span style="font-size:7.5px;color:#bbb;">'+ph+'</span></div>';
        }).join('')
        + '<div style="height:26px;background:linear-gradient(135deg,#C07A50,#8B5030);border-radius:7px;display:flex;align-items:center;justify-content:center;margin-top:4px;cursor:pointer;">'
        + '<span style="color:#fff;font-size:8.5px;font-weight:700;letter-spacing:0.1em;">SUBSCRIBE NOW</span>'
        + '</div></div>'

        // Action links with real images
        + '<div style="padding:0 12px;display:flex;flex-direction:column;gap:7px;margin-bottom:12px;">'
        + [
          ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=60&h=40&fit=crop&auto=format','#2C1A0E','#fff','🛍️  Shop My Collection'],
          ['https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=60&h=40&fit=crop&auto=format','#C07A50','#fff','📅  Book a Session'],
          [null,'transparent','#2C1A0E','🎓  My Courses'],
          [null,'transparent','#2C1A0E','⭐  Reviews']
          ].map(function(b){
            return '<div style="height:30px;background:'+b[1]+';border:1.5px solid '+(b[1]==='transparent'?'#d4b99a':'transparent')+';border-radius:9px;display:flex;align-items:center;padding:0 10px;gap:8px;overflow:hidden;position:relative;cursor:pointer;">'
              + (b[0]?'<img src="'+b[0]+'" style="position:absolute;left:0;top:0;height:100%;width:50px;object-fit:cover;opacity:0.35;" onerror="this.remove();">':'')
              + '<span style="font-size:9px;font-weight:700;color:'+b[2]+';letter-spacing:0.03em;position:relative;">'+b[3]+'</span>'
              + '</div>';
          }).join('')
        + '</div>'

        // Social strip (real icon SVGs)
        + '<div style="display:flex;justify-content:center;gap:8px;padding:4px 0 14px;">'
        + ['TT','IG','FB','YT'].map(function(s){
          return '<div style="width:26px;height:26px;background:#2C1A0E;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;color:#C07A50;">'+s+'</div>';
        }).join('')
        + '</div>'
      + '</div>';
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. MIDNIGHT — deep indigo / neon glow / stats bar
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  midnight: {
    label: 'Midnight',
    mood:  'Dark Indigo · Stats · Vibrant',
    accent:'#6366f1',
    render: function() {
      var p = _pd();
      return '<div style="background:#07071a;min-height:700px;font-family:\'DM Sans\',sans-serif;">'

        // Hero with real image + indigo overlay
        + '<div style="height:160px;position:relative;overflow:hidden;">'
        + '<img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=260&fit=crop&auto=format" style="width:100%;height:100%;object-fit:cover;opacity:0.4;" onerror="this.remove();">'
        + '<div style="position:absolute;inset:0;background:linear-gradient(160deg,rgba(49,46,129,0.85),rgba(7,7,26,0.98));"></div>'
        // Glow orb
        + '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:180px;height:180px;background:radial-gradient(circle,rgba(99,102,241,0.4),transparent 70%);"></div>'
        // Avatar on hero
        + '<div style="position:absolute;bottom:-28px;left:50%;transform:translateX(-50%);">'
        + '<div style="width:56px;height:56px;border-radius:50%;overflow:hidden;border:3px solid #6366f1;box-shadow:0 0 20px rgba(99,102,241,0.8);">'
        + '<img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face&auto=format" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'linear-gradient(135deg,#6366f1,#8b5cf6)\';this.remove();">'
        + '</div></div></div>'

        // Name + title
        + '<div style="text-align:center;padding:36px 14px 10px;">'
        + '<div style="font-size:16px;font-weight:900;color:#fff;letter-spacing:0.05em;margin-bottom:3px;">'+p.name+'</div>'
        + '<div style="font-size:8px;color:#a5b4fc;letter-spacing:0.15em;text-transform:uppercase;">'+p.title.substring(0,30)+'</div>'
        + '</div>'

        // Glow divider
        + '<div style="height:1px;background:linear-gradient(90deg,transparent,#6366f1,transparent);margin:0 0 0;"></div>'

        // Stats bar
        + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;background:#0f0f2d;border-bottom:1px solid rgba(99,102,241,0.2);">'
        + [['12K','Followers'],[p.reviews,'Reviews'],['★ '+p.rating,'Rating']].map(function(s){
          return '<div style="text-align:center;padding:10px 0;border-right:1px solid rgba(99,102,241,0.12);">'
            + '<div style="font-size:13px;font-weight:900;color:#6366f1;line-height:1;">'+s[0]+'</div>'
            + '<div style="font-size:6.5px;color:#4b5563;letter-spacing:0.1em;text-transform:uppercase;margin-top:2px;">'+s[1]+'</div>'
            + '</div>';
        }).join('')
        + '</div>'

        // Nav buttons with hover-style
        + '<div style="padding:12px 14px;display:flex;flex-direction:column;gap:6px;">'
        + [
          ['🛍️','SHOP','#6366f1','#fff','linear-gradient(135deg,#6366f1,#4f46e5)'],
          ['📅','BOOK A SESSION','rgba(99,102,241,0.13)','#a5b4fc',''],
          ['🎓','COURSES','rgba(99,102,241,0.13)','#a5b4fc',''],
          ['🤝','COLLABORATE','rgba(139,92,246,0.13)','#c4b5fd',''],
          ['📩','SUBSCRIBE','rgba(99,102,241,0.1)','#818cf8','']
          ].map(function(r){
            return '<div style="height:30px;background:'+(r[4]||r[2])+';border:1px solid rgba(99,102,241,0.3);border-radius:9px;display:flex;align-items:center;padding:0 12px;gap:9px;cursor:pointer;">'
              + '<span style="font-size:13px;line-height:1;">'+r[0]+'</span>'
              + '<span style="font-size:8.5px;font-weight:800;color:'+r[3]+';letter-spacing:0.1em;">'+r[1]+'</span>'
              + '<span style="margin-left:auto;color:'+r[3]+';opacity:0.45;font-size:12px;">›</span>'
              + '</div>';
          }).join('')
        + '</div>'

        // Social
        + '<div style="display:flex;justify-content:center;gap:8px;padding:4px 0 14px;">'
        + ['TT','IG','YT','X'].map(function(s){
          return '<div style="width:28px;height:28px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.4);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:7.5px;font-weight:800;color:#a5b4fc;">'+s+'</div>';
        }).join('')
        + '</div>'
      + '</div>';
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. BLUSH ROSE — pink gradient / fashion / feminine
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  blush: {
    label: 'Blush Rose',
    mood:  'Pink · Feminine · Fashion',
    accent:'#ec4899',
    render: function() {
      var p = _pd();
      return '<div style="background:linear-gradient(165deg,#fff0f8,#fce7f3);min-height:700px;font-family:\'DM Sans\',sans-serif;">'

        // Pink hero with real fashion photo
        + '<div style="height:170px;position:relative;overflow:hidden;">'
        + '<img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=280&fit=crop&auto=format" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'linear-gradient(135deg,#be185d,#ec4899)\';this.remove();">'
        + '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(190,24,93,0.55) 0%,rgba(236,72,153,0.7) 60%,rgba(252,231,243,1) 100%);"></div>'
        // Circular portrait on hero
        + '<div style="position:absolute;bottom:-24px;left:50%;transform:translateX(-50%);">'
        + '<div style="width:60px;height:60px;border-radius:50%;overflow:hidden;border:3px solid #fff;box-shadow:0 4px 18px rgba(190,24,93,0.4);">'
        + '<img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=130&h=130&fit=crop&crop=face&auto=format" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'linear-gradient(135deg,#f9a8d4,#ec4899)\';this.remove();">'
        + '</div></div>'
        // Name over image (bottom of hero)
        + '<div style="position:absolute;top:14px;left:0;right:0;text-align:center;">'
        + '<div style="font-family:Georgia,serif;font-size:16px;font-style:italic;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.3);">'+p.name+'</div>'
        + '</div></div>'

        // Title row
        + '<div style="text-align:center;padding:32px 14px 8px;">'
        + '<div style="font-size:8.5px;color:#ec4899;letter-spacing:0.15em;text-transform:uppercase;font-weight:700;margin-bottom:3px;">'+p.title.substring(0,30)+'</div>'
        + '<div style="display:flex;justify-content:center;gap:2px;margin-bottom:4px;">'
        + [1,2,3,4,5].map(function(){ return '<span style="color:#ec4899;font-size:11px;">★</span>'; }).join('')
        + '<span style="color:#d1a3c0;font-size:8px;margin-left:3px;">('+p.reviews+')</span>'
        + '</div>'
        + '<div style="font-size:7.5px;color:#9d174d;font-style:italic;max-width:180px;margin:0 auto;">'+p.bio.substring(0,70)+' 💕</div>'
        + '</div>'

        // Subscribe card
        + '<div style="background:#fff;margin:8px 12px;border-radius:14px;padding:13px;box-shadow:0 4px 18px rgba(236,72,153,0.12);border:1px solid #fbcfe8;">'
        + '<div style="font-size:9px;font-weight:800;color:#831843;text-align:center;letter-spacing:0.08em;margin-bottom:8px;">💌 Join My World</div>'
        + ['Your Name','Email','Phone Number'].map(function(ph){
          return '<div style="height:23px;border:1px solid #fbcfe8;border-radius:7px;margin-bottom:5px;display:flex;align-items:center;padding:0 10px;">'
            + '<span style="font-size:7.5px;color:#d1a3c0;">'+ph+'</span></div>';
        }).join('')
        + '<div style="height:26px;background:linear-gradient(135deg,#ec4899,#be185d);border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;margin-top:2px;">'
        + '<span style="color:#fff;font-size:8.5px;font-weight:700;letter-spacing:0.1em;">SUBSCRIBE</span>'
        + '</div></div>'

        // Action buttons
        + '<div style="padding:0 12px;display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">'
        + [
          ['linear-gradient(135deg,#ec4899,#db2777)','#fff','💄  Shop My Looks'],
          ['transparent','#831843','📅  Book a Session'],
          ['transparent','#831843','🎓  My Courses'],
          ['transparent','#831843','⭐  Reviews']
          ].map(function(b){
            return '<div style="height:28px;background:'+b[0]+';border:1.5px solid '+(b[0]==='transparent'?'#fbcfe8':'transparent')+';border-radius:9px;display:flex;align-items:center;padding:0 12px;cursor:pointer;">'
              + '<span style="font-size:9px;font-weight:700;color:'+b[1]+';letter-spacing:0.03em;">'+b[2]+'</span>'
              + '</div>';
          }).join('')
        + '</div>'

        // Social strip
        + '<div style="display:flex;justify-content:center;gap:8px;padding:4px 0 14px;">'
        + ['TT','IG','YT','PIN'].map(function(s){
          return '<div style="width:26px;height:26px;background:linear-gradient(135deg,#ec4899,#be185d);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:7.5px;font-weight:800;color:#fff;">'+s+'</div>';
        }).join('')
        + '</div>'
      + '</div>';
    }
  }

};

// ── Build showcase card grid ──────────────────────────────
function buildShowcaseCards() {
  var grid = document.getElementById('showcase-card-grid');
  if (!grid) return;
  grid.innerHTML = '';
  Object.keys(TEMPLATES).forEach(function(key) {
    var t = TEMPLATES[key];
    var isSelected = key === SHOWCASE_ACTIVE;

    // Wrapper card
    var wrapper = document.createElement('div');
    wrapper.className = 'template-card' + (isSelected ? ' selected' : '');
    wrapper.style.cssText = 'cursor:pointer;border-radius:16px;border:2px solid '+(isSelected?'var(--brown)':'var(--border)')+';overflow:hidden;transition:all 0.2s;'+(isSelected?'box-shadow:0 0 0 3px rgba(192,122,80,0.2);':'');
    wrapper.setAttribute('data-tpl', key);
    wrapper.onclick = function() { pickTemplate(this, key); };

    // Thumbnail: real template scaled to 0.35x inside iframe-like container
    var thumb = document.createElement('div');
    thumb.style.cssText = 'height:220px;overflow:hidden;position:relative;background:#f5ede8;';

    var scaler = document.createElement('div');
    scaler.style.cssText = 'position:absolute;top:0;left:0;transform-origin:top left;transform:scale(0.35);width:286%;pointer-events:none;';
    scaler.innerHTML = t.render();
    thumb.appendChild(scaler);

    // Selection overlay badge
    if (isSelected) {
      var badge = document.createElement('div');
      badge.style.cssText = 'position:absolute;top:8px;right:8px;background:var(--brown);color:#fff;font-size:7px;font-weight:800;padding:3px 9px;border-radius:10px;letter-spacing:0.08em;text-transform:uppercase;';
      badge.textContent = 'SELECTED';
      thumb.appendChild(badge);
    }

    // Label row
    var info = document.createElement('div');
    info.style.cssText = 'padding:10px 12px 12px;background:#fff;';
    info.innerHTML = '<div style="font-size:11px;font-weight:800;color:var(--text);margin-bottom:2px;">'+t.label+'</div>'
      + '<div style="font-size:9px;color:var(--text-dim);">'+t.mood+'</div>'
      + '<div style="margin-top:6px;width:16px;height:3px;background:'+t.accent+';border-radius:2px;"></div>';

    wrapper.appendChild(thumb);
    wrapper.appendChild(info);
    grid.appendChild(wrapper);
  });
}

function pickTemplate(card, key) {
  SHOWCASE_ACTIVE = key;
  // Rebuild cards so selected state is correct
  buildShowcaseCards();
  // Update phone preview with the real rendered template
  var screen = document.getElementById('showcase-phone-screen');
  if (screen && TEMPLATES[key]) {
    screen.innerHTML = TEMPLATES[key].render();
  }
  var label = document.getElementById('showcase-applied-label');
  if (label) label.style.display = 'none';
}

function applyTemplate() {
  var t = TEMPLATES[SHOWCASE_ACTIVE];
  toast('✓ "' + (t ? t.label : SHOWCASE_ACTIVE) + '" applied to your public MASSED page!');
  var label = document.getElementById('showcase-applied-label');
  if (label) { label.textContent = '✓ "' + (t ? t.label : '') + '" applied!'; label.style.display = 'inline'; }
}




// ── SWITCH PROFILE ────────────────────────────────────────────────────────────
var spPosts = [
  { id:1, text:'💡 Tip: The best time to post Reels is between 6–9 AM and 7–10 PM. Consistency is more important than perfection. Show up daily and watch your engagement grow.', type:'text', time:'2 hours ago', sparks:247, comments:[{user:'@maya_j',text:'This is so helpful! Thank you 🙏'},{user:'@jones_r',text:'Been doing this for a week and already seeing results!'}], shared:34 },
  { id:2, text:'🌱 Knowledge drop: Astrological compatibility isn\'t just about sun signs — your Venus sign determines how you give and receive love. What\'s your Venus sign? Drop it below 👇', type:'text', time:'Yesterday', sparks:521, comments:[{user:'@sarah_k',text:'Venus in Scorpio here! 🦂'},{user:'@beauty.brand',text:'Venus in Libra! Makes so much sense now'}], shared:89 },
];
var spMediaPreviews = {};

function spTab(tab, btn) {
  ['posts','about','store','media','signals','vault','messages'].forEach(function(t){
    var el = document.getElementById('sp-tab-'+t);
    if (el) el.style.display = t===tab ? 'block' : 'none';
  });
  document.querySelectorAll('.sp-tab').forEach(function(b){
    b.style.color = 'rgba(255,255,255,0.45)';
    b.style.borderBottomColor = 'transparent';
    b.style.fontWeight = '600';
  });
  if (btn) { btn.style.color = '#D4956E'; btn.style.borderBottomColor = '#D4956E'; btn.style.fontWeight = '700'; }
  if (tab === 'posts') renderSpFeed();
  if (tab === 'signals') renderSignalsTab();
  if (tab === 'vault') renderVault();
  if (tab === 'messages') spMsgInit();
}

function renderSpFeed() {
  var feed = document.getElementById('sp-posts-feed');
  if (!feed) return;
  feed.innerHTML = spPosts.map(function(post) {
    return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:16px;" id="sp-post-'+post.id+'">'
      + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">'
        + '<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#D4956E,#8B5E3C);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:0.85rem;flex-shrink:0;">L</div>'
        + '<div><div style="font-weight:700;font-size:0.88rem;">Luk Like</div><div style="font-size:0.72rem;color:var(--text-dim);">'+post.time+'</div></div>'
      + '</div>'
      + '<div style="font-size:0.88rem;color:var(--text);line-height:1.65;margin-bottom:14px;">'+esc(post.text)+'</div>'
      + (spMediaPreviews[post.id] ? '<div style="margin-bottom:14px;">'+spMediaPreviews[post.id]+'</div>' : '')
      + '<div style="display:flex;align-items:center;gap:16px;padding-top:12px;border-top:1px solid var(--border);">'
        + '<button onclick="spLightIt('+post.id+',this)" data-lit="false" style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;color:var(--text-mid);font-weight:600;padding:6px 10px;border-radius:8px;transition:all 0.15s;" onmouseover="this.style.background=\'var(--cream)\'" onmouseout="this.style.background=\'none\'">'
          + '<svg class="bulb-icon-'+post.id+'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 01-1 1H9a1 1 0 01-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/></svg>'
          + '<span class="spark-count-'+post.id+'">'+post.sparks+'</span> Light it'
        + '</button>'
        + '<button onclick="spToggleComments('+post.id+')" style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;color:var(--text-mid);font-weight:600;padding:6px 10px;border-radius:8px;transition:all 0.15s;" onmouseover="this.style.background=\'var(--cream)\'" onmouseout="this.style.background=\'none\'">'
          + '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>'
          + post.comments.length + ' Comments'
        + '</button>'
        + '<button onclick="spSharePost('+post.id+')" style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;color:var(--text-mid);font-weight:600;padding:6px 10px;border-radius:8px;transition:all 0.15s;" onmouseover="this.style.background=\'var(--cream)\'" onmouseout="this.style.background=\'none\'">'
          + '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
          + post.shared + ' Shared'
        + '</button>'
        + '<button onclick="spAddToVault('+post.id+')" style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;color:var(--text-mid);font-weight:600;padding:6px 10px;border-radius:8px;transition:all 0.15s;margin-left:auto;" onmouseover="this.style.background=\'var(--cream)\'" onmouseout="this.style.background=\'none\'">'
          + '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>'
          + 'Add to Vault'
        + '</button>'
      + '</div>'
      + '<div id="sp-comments-'+post.id+'" style="display:none;margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">'
        + post.comments.map(function(c){ return '<div style="display:flex;gap:8px;margin-bottom:10px;"><div style="width:28px;height:28px;border-radius:50%;background:var(--brown-bg2);display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:var(--brown);flex-shrink:0;">'+c.user.slice(1,3).toUpperCase()+'</div><div style="flex:1;background:var(--cream);border-radius:8px;padding:8px 12px;"><div style="font-size:0.75rem;font-weight:700;color:var(--brown);margin-bottom:2px;">'+c.user+'</div><div style="font-size:0.82rem;color:var(--text);">'+c.text+'</div></div></div>'; }).join('')
        + '<div style="display:flex;gap:8px;margin-top:8px;">'
          + '<input id="sp-comment-input-'+post.id+'" type="text" placeholder="Add a comment..." style="flex:1;padding:8px 12px;background:var(--cream);border:1px solid var(--border);border-radius:8px;font-family:\'DM Sans\',sans-serif;font-size:0.82rem;outline:none;" onkeydown="if(event.key===\'Enter\')spAddComment('+post.id+')">'
          + '<button onclick="spAddComment('+post.id+')" style="padding:8px 14px;background:var(--brown);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:700;">Post</button>'
        + '</div>'
      + '</div>'
    + '</div>';
  }).join('') || '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:40px;text-align:center;color:var(--text-dim);">No Signals yet. Create your first Signal above!</div>';
}

function spLightIt(postId, btn) {
  var post = spPosts.find(function(p){return p.id===postId;});
  if (!post) return;
  var lit = btn.getAttribute('data-lit') === 'true';
  var bulb = btn.querySelector('.bulb-icon-'+postId);

  if (lit) {
    // Un-light: go back to outlined, neutral color
    post.sparks--;
    btn.setAttribute('data-lit','false');
    btn.style.color = 'var(--text-mid)';
    btn.style.background = 'none';
    if (bulb) {
      bulb.setAttribute('fill','none');
      bulb.setAttribute('stroke','currentColor');
      bulb.style.filter = '';
      bulb.style.color = '';
    }
  } else {
    // Light it: fully filled yellow bulb with glow
    post.sparks++;
    btn.setAttribute('data-lit','true');
    btn.style.color = '#f59e0b';
    if (bulb) {
      bulb.setAttribute('fill','#fbbf24');
      bulb.setAttribute('stroke','#f59e0b');
      bulb.style.filter = 'drop-shadow(0 0 6px rgba(251,191,36,0.8))';
    }
    toast('💡 You lit this post!');
  }

  var countEl = document.querySelector('.spark-count-'+postId);
  if (countEl) countEl.textContent = post.sparks;
  // Update profile header sparks total
  var sparksEl = document.getElementById('sp-sparks');
  if (sparksEl) {
    var totalSparks = spPosts.reduce(function(s,p){return s+p.sparks;},0);
    sparksEl.textContent = totalSparks.toLocaleString() + ' Sparks';
  }
}

function spToggleComments(postId) {
  var el = document.getElementById('sp-comments-'+postId);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function spAddComment(postId) {
  var input = document.getElementById('sp-comment-input-'+postId);
  if (!input || !input.value.trim()) return;
  var post = spPosts.find(function(p){return p.id===postId;});
  if (!post) return;
  post.comments.push({ user:'@you', text:input.value.trim() });
  input.value = '';
  renderSpFeed();
  setTimeout(function(){ spToggleComments(postId); }, 50);
}

function spSharePost(postId) {
  var post = spPosts.find(function(p){return p.id===postId;});
  if (post) { post.shared++; toast('🔗 Signal link copied!'); renderSpFeed(); }
}



// ================================
// MAKE FUNCTIONS GLOBAL (NO LOGIC CHANGE)
// ================================
window.buildShowcaseCards = buildShowcaseCards;
window.pickTemplate = pickTemplate;
window.applyTemplate = applyTemplate;

window.spTab = spTab;
window.renderSpFeed = renderSpFeed;
window.spLightIt = spLightIt;
window.spToggleComments = spToggleComments;
window.spSharePost = spSharePost;
window.spAddToVault = spAddToVault;

window.renderVault = renderVault;
window.spMsgInit = spMsgInit;