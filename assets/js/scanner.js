// ================================
// QR SCANNER SYSTEM
// ================================


// ── SCANNER ───────────────────────────────────────────
let scanStats = {total:0, valid:0, invalid:0};
let checkedInList = [];
let cameraStream = null;
let scanInterval = null;
let torchOn = false;
let lastScanned = null;
let lastScannedTime = 0;

// Load jsQR library dynamically
function loadJsQR(callback) {
  if (window.jsQR) { callback(); return; }
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js';
  script.onload = callback;
  script.onerror = () => toast('Failed to load QR scanner library');
  document.head.appendChild(script);
}

function startCamera() {
  // Check API support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    var statusEl = document.getElementById('scan-status');
    if (statusEl) statusEl.textContent = '⚠️ Camera not supported on this browser. Try Chrome or Safari.';
    toast('⚠️ Camera not supported on this browser');
    return;
  }

  var statusEl = document.getElementById('scan-status');
  if (statusEl) statusEl.textContent = '⏳ Requesting camera access…';

  loadJsQR(() => {
    // Try back camera first, fall back to any camera
    const tryStart = (constraints) => {
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          cameraStream = stream;
          const video = document.getElementById('camera-feed');
          if (!video) return;

          // Revoke any old stream
          video.srcObject = null;
          video.srcObject = stream;

          // Ensure play works on iOS/Android
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Autoplay blocked — still try to show the frame
            });
          }

          // Show camera UI
          const placeholder = document.getElementById('camera-placeholder');
          const overlay = document.getElementById('scan-frame-overlay');
          const btnStart = document.getElementById('btn-start-camera');
          const btnStop = document.getElementById('btn-stop-camera');
          if (placeholder) placeholder.style.display = 'none';
          if (overlay) overlay.style.display = 'block';
          if (btnStart) btnStart.style.display = 'none';
          if (btnStop) { btnStop.style.display = 'flex'; }

          // Show torch button if device supports it
          const track = stream.getVideoTracks()[0];
          if (track && track.getCapabilities) {
            try {
              const caps = track.getCapabilities();
              if (caps && caps.torch) {
                const btnTorch = document.getElementById('btn-torch');
                if (btnTorch) btnTorch.style.display = 'flex';
              }
            } catch(e) {}
          }

          if (statusEl) statusEl.textContent = '🟢 Scanning — point at a QR code';
          const scanResult = document.getElementById('scan-result');
          if (scanResult) scanResult.style.display = 'none';

          // Wait for video metadata before scanning
          const onReady = () => {
            if (video.videoWidth > 0) {
              startFrameScan(video);
            } else {
              video.addEventListener('loadeddata', () => startFrameScan(video), { once: true });
            }
          };
          if (video.readyState >= 2) {
            onReady();
          } else {
            video.addEventListener('loadedmetadata', onReady, { once: true });
          }
        })
        .catch(err => {
          // If back camera failed, retry with any camera
          if (constraints.video && constraints.video.facingMode && err.name !== 'NotAllowedError' && err.name !== 'SecurityError') {
            tryStart({ video: true, audio: false });
            return;
          }
          let msg = 'Camera access denied.';
          if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') msg = 'No camera found on this device.';
          else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') msg = 'Camera permission denied. Tap the camera icon in your browser address bar to allow access.';
          else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') msg = 'Camera is in use by another app. Close other apps and try again.';
          else if (err.name === 'OverconstrainedError') msg = 'Camera constraints not supported. Trying default camera.';
          else if (err.name === 'SecurityError') msg = 'Camera blocked. This page must be served over HTTPS.';
          if (statusEl) statusEl.textContent = '⚠️ ' + msg;
          toast('⚠️ ' + msg);
        });
    };

    // Start with rear camera preferred
    tryStart({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
  });
}

function startFrameScan(video) {
  if (scanInterval) { clearInterval(scanInterval); scanInterval = null; }
  const canvas = document.getElementById('camera-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  scanInterval = setInterval(() => {
    // Guard: video must be playing with real dimensions
    if (!video || video.paused || video.ended || video.readyState < 2) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;
    if (!cameraStream) { clearInterval(scanInterval); return; }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    try { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); }
    catch(e) { return; }

    let imageData;
    try { imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); }
    catch(e) { return; }

    if (!window.jsQR) return;
    const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });
    if (code && code.data) {
      const now = Date.now();
      if (code.data !== lastScanned || now - lastScannedTime > 3000) {
        lastScanned = code.data;
        lastScannedTime = now;
        processScannedTicket(code.data, false);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
    }
  }, 250);
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  clearInterval(scanInterval);
  scanInterval = null;
  const video = document.getElementById('camera-feed');
  video.srcObject = null;
  document.getElementById('camera-placeholder').style.display = 'flex';
  document.getElementById('scan-frame-overlay').style.display = 'none';
  document.getElementById('btn-start-camera').style.display = 'flex';
  document.getElementById('btn-stop-camera').style.display = 'none';
  document.getElementById('btn-torch').style.display = 'none';
  document.getElementById('scan-status').textContent = 'Click Start Camera to begin scanning';
  torchOn = false;
}

function toggleTorch() {
  if (!cameraStream) return;
  const track = cameraStream.getVideoTracks()[0];
  if (!track) return;
  torchOn = !torchOn;
  track.applyConstraints({ advanced: [{ torch: torchOn }] })
    .then(() => {
      document.getElementById('btn-torch').style.background = torchOn ? '#fef3c7' : 'var(--cream2)';
    })
    .catch(() => toast('Torch not supported on this device'));
}

function verifyTicket() {
  const val = document.getElementById('manual-ticket-input').value.trim().toUpperCase();
  if (!val) { toast('Please enter a ticket number'); return; }
  processScannedTicket(val, true);
}

function processScannedTicket(ticketId, isManual) {
  // Check against locally created tickets
  let foundEvent = null, foundTier = null;
  events.forEach(ev => {
    if (!ev.tiers) return;
    ev.tiers.forEach(t => {
      // Match any ticket number that belongs to this event + tier
      const prefix = 'TKT-' + ev.id.toString().slice(-5) + '-' + t.type.replace(/[^A-Z]/gi,'').substring(0,3).toUpperCase().padEnd(3,'X');
      if (ticketId.startsWith(prefix) || ticketId.startsWith('TKT-'+ev.id.toString().slice(-5))) {
        foundEvent = ev; foundTier = t;
      }
    });
  });

  const isValid = foundEvent !== null && ticketId.startsWith('TKT-') && ticketId.length >= 10;
  const resultEl = document.getElementById(isManual ? 'verify-result' : 'scan-result');

  scanStats.total++;
  if (isValid) {
    scanStats.valid++;
    checkedInList.unshift({ id: ticketId, name: foundEvent.name, tier: foundTier ? foundTier.type : '', time: new Date().toLocaleTimeString(), valid: true });
    resultEl.style.cssText = 'display:block;padding:14px;border-radius:10px;background:rgba(22,163,74,0.1);border:1px solid rgba(22,163,74,0.3);margin-top:12px;';
    resultEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:2rem;">✅</span>
        <div>
          <div style="font-weight:700;color:#16a34a;font-size:0.95rem;">Valid Ticket</div>
          <div style="font-size:0.78rem;color:var(--text-mid);margin-top:2px;">${ticketId}</div>
          <div style="font-size:0.78rem;color:var(--text-mid);">${foundEvent.name} · ${foundTier ? foundTier.type : ''}</div>
        </div>
      </div>`;
    if (!isManual) document.getElementById('scan-status').textContent = '✅ Valid — keep scanning';
  } else {
    scanStats.invalid++;
    checkedInList.unshift({ id: ticketId, time: new Date().toLocaleTimeString(), valid: false });
    resultEl.style.cssText = 'display:block;padding:14px;border-radius:10px;background:#fff1f2;border:1px solid #fecaca;margin-top:12px;';
    resultEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:2rem;">❌</span>
        <div>
          <div style="font-weight:700;color:#dc2626;font-size:0.95rem;">Invalid Ticket</div>
          <div style="font-size:0.78rem;color:var(--text-mid);margin-top:2px;">${ticketId}</div>
          <div style="font-size:0.78rem;color:var(--text-dim);">Not found in system</div>
        </div>
      </div>`;
    if (!isManual) document.getElementById('scan-status').textContent = '❌ Invalid — keep scanning';
  }

  // Update stats
  document.getElementById('scan-total').textContent = scanStats.total;
  document.getElementById('scan-valid').textContent = scanStats.valid;
  document.getElementById('scan-invalid').textContent = scanStats.invalid;

  // Update checked-in list
  document.getElementById('checked-in-list').innerHTML = checkedInList.slice(0,6).map(c => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--cream);border-radius:8px;margin-bottom:6px;">
      <div>
        <div style="font-family:monospace;font-size:0.7rem;color:var(--text);font-weight:600;">${c.id}</div>
        ${c.name ? `<div style="font-size:0.65rem;color:var(--text-dim);">${c.name}${c.tier?' · '+c.tier:''}</div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
        <span style="font-size:0.65rem;color:var(--text-dim);">${c.time}</span>
        <span style="font-size:1rem;">${c.valid ? '✅' : '❌'}</span>
      </div>
    </div>
  `).join('') || '<div style="text-align:center;padding:20px;color:var(--text-dim);font-size:0.82rem;">No check-ins yet</div>';

  // Auto-clear result after 4 seconds when using camera
  if (!isManual) setTimeout(() => { if (resultEl) resultEl.style.display = 'none'; }, 4000);
}

// Global exposure
window.stopCamera = stopCamera;