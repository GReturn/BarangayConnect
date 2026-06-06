/* ============================================
   BarangayConnect — Profile & Settings View
   ============================================ */

import auth from '../auth.js';
import { generateQRCodeSVG, escapeHTML } from '../utils.js';
import { showToast } from '../components/toast.js';
import { t, setLocale, getLocale } from '../i18n.js';

export async function renderProfile() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const user = auth.getCurrentUser();
  if (!user) {
    main.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👤</div>
        <div class="empty-state-title">Palihug pag-login</div>
        <p class="text-sm text-secondary">Please switch to a user profile to view settings.</p>
      </div>
    `;
    return;
  }

  const isOfficial = auth.isOfficial();
  
  if (isOfficial) {
    renderOfficialProfile(main, user);
  } else {
    renderResidentProfile(main, user);
  }
}

function renderResidentProfile(main, user) {
  const initials = auth.getUserInitials();
  const qrCodeSvg = generateQRCodeSVG(user.philsysId || 'BRGY-CONNECT', 120);
  const currentLang = getLocale();

  // Load local settings
  let smsEnabled = localStorage.getItem(`brgyconnect_sms_pref_${user.id}`) !== 'false';
  let emailEnabled = localStorage.getItem(`brgyconnect_email_pref_${user.id}`) === 'true';

  main.innerHTML = `
    <div class="profile-view animate-fade-in">
      <div class="profile-header flex items-center gap-4">
        <div class="avatar" style="width: 64px; height: 64px; font-size: 1.5rem; background: var(--gradient-accent); color: white;">
          ${initials}
        </div>
        <div>
          <h1 class="profile-name font-bold" style="font-size: var(--font-size-2xl);">${escapeHTML(user.name)}</h1>
          <span class="badge badge-verified mt-1">🛡️ ${t('home.verifiedResident')}</span>
        </div>
      </div>

      <!-- PhilSys ID Card -->
      <div class="card philsys-id-details-card mt-5">
        <h3 class="font-bold flex items-center gap-2 mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          ${t('profile.philsysCardTitle')}
        </h3>
        <div class="profile-fields-grid mt-2">
          <div class="profile-field-row">
            <span class="profile-field-lbl">${t('profile.nationalId')}</span>
            <span class="profile-field-val font-semibold" style="font-family: monospace;">${escapeHTML(user.philsysId)}</span>
          </div>
          <div class="profile-field-row mt-3">
            <span class="profile-field-lbl">${t('profile.address')}</span>
            <span class="profile-field-val">${escapeHTML(user.address)}</span>
          </div>
          <div class="profile-fields-inline mt-3">
            <div class="profile-field-row">
              <span class="profile-field-lbl">${t('profile.dob')}</span>
              <span class="profile-field-val">${escapeHTML(user.dateOfBirth)}</span>
            </div>
            <div class="profile-field-row">
              <span class="profile-field-lbl">${t('profile.age')}</span>
              <span class="profile-field-val">${escapeHTML(user.age)} ${t('profile.age').toLowerCase() === 'age' ? 'years old' : 'ka tuig ang panuigon'}</span>
            </div>
          </div>
          <div class="profile-field-row mt-3">
            <span class="profile-field-lbl">${t('profile.phone')}</span>
            <span class="profile-field-val">${escapeHTML(user.phone)}</span>
          </div>
        </div>
      </div>

      <!-- Digital Resident Card -->
      <div class="section-header-compact mt-6">
        <h2 class="section-title-compact">${t('profile.barangayIdTitle')}</h2>
        <span class="section-subtitle-compact">${t('profile.barangayIdSub')}</span>
      </div>
      
      <div class="digital-id-card mt-2">
        <div class="id-card-header">
          <div class="id-card-logo">🏠</div>
          <div class="id-card-title">
            <span class="id-card-title-main">BARANGAY GUADALUPE</span>
            <span class="id-card-title-sub">Official Digital Resident Card</span>
          </div>
        </div>
        <div class="id-card-body">
          <div class="id-card-avatar" style="width: 52px; height: 52px; font-size: 1.2rem; background: white; color: #0e3e7d; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;">
            ${initials}
          </div>
          <div class="id-card-info">
            <div class="id-card-info-item">
              <span class="id-label">FULL NAME</span>
              <span class="id-val">${escapeHTML(user.name)}</span>
            </div>
            <div class="id-card-info-item">
              <span class="id-label">RESIDENT ID</span>
              <span class="id-val" style="font-family: monospace;">${escapeHTML(user.id.toUpperCase())}</span>
            </div>
          </div>
        </div>
        <div class="id-card-footer">
          <div class="id-card-qr">${qrCodeSvg}</div>
          <div class="id-card-ver">
            <span class="id-ver-text">🛡️ Philsys Verified</span>
            <span class="id-ver-text text-secondary">Secured by GovChain OS</span>
          </div>
        </div>
      </div>

      <!-- Settings & Preferences Card -->
      <div class="card settings-card mt-5">
        <h3 class="font-bold mb-4">${t('profile.prefTitle')}</h3>
        
        <div class="preference-toggle-row">
          <div class="flex items-center justify-between w-full">
            <div>
              <span class="font-semibold block" style="font-size: var(--font-size-sm);">${t('profile.smsPref')}</span>
              <span class="text-xs text-secondary">${t('profile.smsPrefSub')}</span>
            </div>
            <div class="toggle ${smsEnabled ? 'active' : ''}" id="pref-sms-toggle"></div>
          </div>
        </div>

        <div class="preference-toggle-row mt-3">
          <div class="flex items-center justify-between w-full">
            <div>
              <span class="font-semibold block" style="font-size: var(--font-size-sm);">${t('profile.emailPref')}</span>
              <span class="text-xs text-secondary">${t('profile.emailPrefSub')}</span>
            </div>
            <div class="toggle ${emailEnabled ? 'active' : ''}" id="pref-email-toggle"></div>
          </div>
        </div>

        <div class="form-group mt-4">
          <label class="form-label font-bold" for="pref-language">${t('profile.langLabel')}</label>
          <select class="form-select mt-1" id="pref-language">
            <option value="ceb" ${currentLang === 'ceb' ? 'selected' : ''}>Cebuano (Bisaya)</option>
            <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
            <option value="tgl" ${currentLang === 'tgl' ? 'selected' : ''}>Tagalog</option>
          </select>
        </div>
      </div>

    </div>
  `;

  addProfileStyles();
  bindResidentEvents(user);
}

function renderOfficialProfile(main, user) {
  const initials = auth.getUserInitials();
  
  // Try loading saved e-signature image URL from localStorage
  const savedSignature = localStorage.getItem(`brgyconnect_signature_${user.id}`);

  main.innerHTML = `
    <div class="profile-view official-profile animate-fade-in">
      <div class="profile-header flex items-center gap-4">
        <div class="avatar" style="width: 64px; height: 64px; font-size: 1.5rem; background: var(--gradient-accent); color: white;">
          ${initials}
        </div>
        <div>
          <h1 class="profile-name font-bold" style="font-size: var(--font-size-2xl);">${escapeHTML(user.name)}</h1>
          <span class="badge badge-verified mt-1" style="background: rgba(15, 76, 129, 0.1); color: #0e3e7d;">🛡️ ${t('common.official')}</span>
        </div>
      </div>

      <!-- Official Card -->
      <div class="card official-details-card mt-5">
        <h3 class="font-bold mb-3">Official Credentials</h3>
        <div class="profile-fields-grid mt-2">
          <div class="profile-field-row">
            <span class="profile-field-lbl">POSITION / TITLE</span>
            <span class="profile-field-val font-semibold">${escapeHTML(user.officialTitle || 'Barangay Official')}</span>
          </div>
          <div class="profile-field-row mt-3">
            <span class="profile-field-lbl">ASSIGNED STATION</span>
            <span class="profile-field-val">Barangay Hall, Guadalupe, Cebu City</span>
          </div>
          <div class="profile-field-row mt-3">
            <span class="profile-field-lbl">OFFICIAL CONTACT</span>
            <span class="profile-field-val">${escapeHTML(user.phone)}</span>
          </div>
        </div>
      </div>

      <!-- E-Signature Section -->
      <div class="card signature-card mt-5">
        <h3 class="font-bold flex items-center gap-2 mb-2">
          ${t('profile.sigCardTitle')}
        </h3>
        <p class="text-xs text-secondary mb-3">${t('profile.sigCardSub')}</p>
        
        <!-- Tab Controls -->
        <div class="sig-tabs flex gap-2 mb-3">
          <button class="filter-chip active" id="btn-sig-draw-tab">${t('profile.sigDrawTab')}</button>
          <button class="filter-chip" id="btn-sig-upload-tab">${t('profile.sigUploadTab')}</button>
        </div>

        <!-- Drawing Workspace -->
        <div id="sig-draw-container" class="sig-workspace-box">
          <canvas id="sig-canvas" width="360" height="150"></canvas>
          <div class="sig-canvas-controls flex justify-end gap-2 mt-2">
            <button class="btn btn-ghost btn-sm" id="btn-clear-sig">${t('common.clear')}</button>
            <button class="btn btn-primary btn-sm" id="btn-save-sig">${t('common.save')}</button>
          </div>
        </div>

        <!-- Upload Workspace -->
        <div id="sig-upload-container" class="sig-workspace-box" style="display: none;">
          <div class="sig-upload-area" id="sig-dropzone">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span class="text-xs text-secondary mt-2">${t('profile.sigUploadPlaceholder')}</span>
            <input type="file" id="sig-file-input" accept="image/*" style="display:none;" />
          </div>
        </div>

        <!-- Saved Signature Preview -->
        <div class="divider mt-4"></div>
        <h4 class="font-semibold text-xs text-secondary uppercase mb-2">${t('profile.activeSigLabel')}</h4>
        <div class="saved-sig-preview-box">
          ${savedSignature ? `
            <img id="saved-sig-img" src="${savedSignature}" alt="Active Signature" />
          ` : `
            <div class="no-sig-placeholder" id="saved-sig-placeholder">${t('profile.noSigPlaceholder')}</div>
            <img id="saved-sig-img" src="" alt="Active Signature" style="display:none;" />
          `}
        </div>
      </div>

    </div>
  `;

  addProfileStyles();
  bindOfficialEvents(user);
}

function bindResidentEvents(user) {
  // SMS pref toggle
  const smsToggle = document.getElementById('pref-sms-toggle');
  smsToggle?.addEventListener('click', () => {
    let current = localStorage.getItem(`brgyconnect_sms_pref_${user.id}`) !== 'false';
    localStorage.setItem(`brgyconnect_sms_pref_${user.id}`, (!current).toString());
    smsToggle.classList.toggle('active', !current);
    showToast({ type: 'success', title: 'Settings Saved', message: 'SMS notification preference updated.' });
  });

  // Email pref toggle
  const emailToggle = document.getElementById('pref-email-toggle');
  emailToggle?.addEventListener('click', () => {
    let current = localStorage.getItem(`brgyconnect_email_pref_${user.id}`) === 'true';
    localStorage.setItem(`brgyconnect_email_pref_${user.id}`, (!current).toString());
    emailToggle.classList.toggle('active', !current);
    showToast({ type: 'success', title: 'Settings Saved', message: 'Email summary preference updated.' });
  });

  // Language selection trigger
  document.getElementById('pref-language')?.addEventListener('change', (e) => {
    setLocale(e.target.value);
    showToast({ type: 'success', title: t('common.save'), message: t('profile.langLabel') + ' updated.' });
  });
}

function bindOfficialEvents(user) {
  const canvas = document.getElementById('sig-canvas');
  const ctx = canvas?.getContext('2d');
  let drawing = false;

  if (canvas && ctx) {
    // Styling the canvas pen
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const getMousePos = (canvasDom, mouseEvent) => {
      const rect = canvasDom.getBoundingClientRect();
      return {
        x: (mouseEvent.clientX - rect.left) * (canvasDom.width / rect.width),
        y: (mouseEvent.clientY - rect.top) * (canvasDom.height / rect.height)
      };
    };

    const getTouchPos = (canvasDom, touchEvent) => {
      const rect = canvasDom.getBoundingClientRect();
      return {
        x: (touchEvent.touches[0].clientX - rect.left) * (canvasDom.width / rect.width),
        y: (touchEvent.touches[0].clientY - rect.top) * (canvasDom.height / rect.height)
      };
    };

    // Mouse drawing events
    canvas.addEventListener('mousedown', (e) => {
      drawing = true;
      const pos = getMousePos(canvas, e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!drawing) return;
      const pos = getMousePos(canvas, e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    });

    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mouseleave', () => drawing = false);

    // Touch drawing events
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      drawing = true;
      const pos = getTouchPos(canvas, e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!drawing) return;
      const pos = getTouchPos(canvas, e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    });

    canvas.addEventListener('touchend', () => drawing = false);

    // Clear canvas
    document.getElementById('btn-clear-sig')?.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Save drawn signature
    document.getElementById('btn-save-sig')?.addEventListener('click', () => {
      // Check if canvas is blank
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() === blank.toDataURL()) {
        showToast({ type: 'error', title: 'Signature Blank', message: 'Palihug pagdibuho og pirma sa dili pa i-save.' });
        return;
      }

      const dataUrl = canvas.toDataURL();
      localStorage.setItem(`brgyconnect_signature_${user.id}`, dataUrl);
      
      const img = document.getElementById('saved-sig-img');
      const placeholder = document.getElementById('saved-sig-placeholder');
      if (img) {
        img.src = dataUrl;
        img.style.display = 'block';
      }
      if (placeholder) placeholder.style.display = 'none';

      showToast({ type: 'success', title: 'Signature Saved', message: 'Your e-signature has been updated successfully.' });
    });
  }

  // File Upload Logic
  const dropzone = document.getElementById('sig-dropzone');
  const fileInput = document.getElementById('sig-file-input');

  dropzone?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        localStorage.setItem(`brgyconnect_signature_${user.id}`, dataUrl);

        const img = document.getElementById('saved-sig-img');
        const placeholder = document.getElementById('saved-sig-placeholder');
        if (img) {
          img.src = dataUrl;
          img.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';

        showToast({ type: 'success', title: 'Signature Uploaded', message: 'Digital signature image set active.' });
      };
      reader.readAsDataURL(file);
    }
  });

  // Tab switching
  const drawTab = document.getElementById('btn-sig-draw-tab');
  const uploadTab = document.getElementById('btn-sig-upload-tab');
  const drawContainer = document.getElementById('sig-draw-container');
  const uploadContainer = document.getElementById('sig-upload-container');

  drawTab?.addEventListener('click', () => {
    drawTab.classList.add('active');
    uploadTab.classList.remove('active');
    drawContainer.style.display = 'block';
    uploadContainer.style.display = 'none';
  });

  uploadTab?.addEventListener('click', () => {
    uploadTab.classList.add('active');
    drawTab.classList.remove('active');
    uploadContainer.style.display = 'block';
    drawContainer.style.display = 'none';
  });
}

function addProfileStyles() {
  if (document.getElementById('profile-view-styles')) return;
  const style = document.createElement('style');
  style.id = 'profile-view-styles';
  style.textContent = `
    .profile-view {
      max-width: 600px;
      margin: 0 auto var(--space-8);
    }

    .profile-header {
      border-bottom: 1px solid var(--border-default);
      padding-bottom: var(--space-4);
    }

    .profile-fields-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .profile-fields-inline {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .profile-field-lbl {
      font-size: 8px;
      color: var(--text-tertiary);
      font-weight: 700;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 2px;
    }

    .profile-field-val {
      font-size: var(--font-size-sm);
      color: #1f2937;
    }

    .philsys-id-details-card {
      border-left: 4px solid var(--border-accent);
      background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
      box-shadow: var(--shadow-md);
      transition: transform 0.2s;
    }
    
    .philsys-id-details-card:hover {
      transform: translateY(-2px);
    }

    .official-details-card {
      border-left: 4px solid #10b981;
      background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
      box-shadow: var(--shadow-md);
      transition: transform 0.2s;
    }

    .official-details-card:hover {
      transform: translateY(-2px);
    }

    .preference-toggle-row {
      background: #f9fafb;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      transition: background 0.2s;
    }

    .preference-toggle-row:hover {
      background: #f3f4f6;
    }

    /* Digital ID Card Premium styling */
    .digital-id-card {
      background: linear-gradient(135deg, #0e3e7d 0%, #1e40af 100%);
      color: #ffffff;
      border-radius: var(--radius-xl);
      padding: var(--space-4);
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .digital-id-card::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 240px;
      height: 240px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
      pointer-events: none;
    }

    .digital-id-card:hover {
      transform: translateY(-2px) scale(1.01);
      box-shadow: 0 12px 24px rgba(15, 76, 129, 0.25);
    }

    .id-card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: var(--space-2);
    }

    .id-card-logo {
      font-size: 20px;
    }

    .id-card-title {
      display: flex;
      flex-direction: column;
    }

    .id-card-title-main {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .id-card-title-sub {
      font-size: 9px;
      opacity: 0.7;
    }

    .id-card-body {
      display: flex;
      gap: var(--space-4);
      align-items: center;
    }

    .id-card-avatar {
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .id-card-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .id-card-info-item {
      display: flex;
      flex-direction: column;
    }

    .id-label {
      font-size: 8px;
      opacity: 0.6;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .id-val {
      font-size: var(--font-size-sm);
      font-weight: 600;
    }

    .id-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: var(--space-3);
    }

    .id-card-ver {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .id-ver-text {
      font-size: 10px;
      font-weight: 600;
    }

    .id-card-qr svg {
      border: 1px solid rgba(255,255,255,0.1) !important;
      background: #0f1b2d !important;
    }

    /* Signature canvas and uploads */
    .sig-workspace-box {
      background: #ffffff;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: var(--space-3);
      box-shadow: var(--shadow-sm);
    }

    #sig-canvas {
      background: #ffffff;
      border: 1.5px solid var(--border-strong);
      border-radius: var(--radius-md);
      display: block;
      width: 100%;
      cursor: crosshair;
      transition: border-color 0.2s;
    }

    #sig-canvas:focus {
      border-color: var(--border-accent);
    }

    .sig-upload-area {
      border: 2px dashed var(--border-strong);
      background: #ffffff;
      border-radius: var(--radius-md);
      padding: var(--space-6) var(--space-4);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    }

    .sig-upload-area:hover {
      background: var(--bg-surface-hover);
      border-color: #0f4c81;
      transform: scale(1.005);
    }

    .saved-sig-preview-box {
      border: 1px solid var(--border-default);
      background: #ffffff;
      border-radius: var(--radius-md);
      padding: var(--space-3);
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
    }

    .saved-sig-preview-box img {
      max-height: 64px;
      max-width: 100%;
      object-fit: contain;
    }

    .no-sig-placeholder {
      font-size: 11px;
      color: var(--text-tertiary);
    }
  `;
  document.head.appendChild(style);
}
