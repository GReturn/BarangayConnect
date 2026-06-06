/* ============================================
   BarangayConnect — Document Request Form View
   ============================================ */

import auth from '../../auth.js';
import store from '../../store.js';
import ledger from '../../ledger.js';
import offline from '../../offline.js';
import sms from '../../sms.js';
import { showToast } from '../../components/toast.js';
import {
  generateReferenceNumber, generateId, generateProxyToken, getProxyTokenExpiry,
  detectPriority, escapeHTML
} from '../../utils.js';
import { t } from '../../i18n.js';

const { STORES } = store;

export async function renderRequestForm() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const user = auth.getCurrentUser();
  const isOnline = offline.getStatus();

  // Format resident ID based on user properties
  const residentIdCode = user?.id === 'resident-002' 
    ? 'BRGY-GUA-2024-8891' 
    : `BRGY-GUA-${new Date().getFullYear()}-${user?.id.split('-')[1] || '9999'}`;

  main.innerHTML = `
    <div class="request-form-view animate-fade-in">
      
      <!-- Offline Banner -->
      ${!isOnline ? `
        <div class="form-offline-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.83-2.84M8.59 16.11a6 6 0 0 1 5.68-1.4M12 20h.01"></path></svg>
          <span>${t('form.offlineBanner')}</span>
        </div>
      ` : ''}

      <div class="form-header">
        <h1>${t('form.title')}</h1>
        <p class="text-secondary mt-1">${t('form.subtitle')}</p>
      </div>

      <form class="request-form card mt-4" id="request-form">
        <!-- Personal Info Pre-filled -->
        <div class="form-section">
          <div class="form-group">
            <label class="form-label font-bold flex items-center justify-between">
              ${t('form.fullName')}
              <span class="badge badge-verified">🛡️ PhilSys Verified</span>
            </label>
            <input type="text" class="form-input prefilled" value="${user ? escapeHTML(user.name) : ''}" readonly disabled id="field-name" />
          </div>

          <div class="form-group mt-3">
            <label class="form-label font-bold">${t('form.residentId')}</label>
            <input type="text" class="form-input prefilled" value="${residentIdCode}" readonly disabled id="field-resident-id" />
          </div>
        </div>

        <div class="divider"></div>

        <!-- Document Details -->
        <div class="form-section">
          <div class="form-group">
            <label class="form-label font-bold" for="field-doc-type">${t('form.docType')}</label>
            <select class="form-select" id="field-doc-type" required>
              <option value="">${t('form.selectDoc')}</option>
              <option value="barangay_clearance">Barangay Clearance</option>
              <option value="indigency_certificate">Indigency Certificate</option>
              <option value="residency_certificate">Residence Cert.</option>
            </select>
          </div>

          <div class="form-group mt-3">
            <label class="form-label font-bold" for="field-purpose">${t('form.purpose')}</label>
            <textarea class="form-textarea" id="field-purpose" placeholder="${t('form.purposePlaceholder')}" required></textarea>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Priority Requests -->
        <div class="form-section">
          <label class="form-label font-bold">${t('form.priorityReq')} <span>ℹ️</span></label>
          <div class="priority-banner mt-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            <span>${t('form.prioritySub')}</span>
          </div>

          <div class="priority-checkbox-group">
            <label class="priority-check-item">
              <input type="checkbox" id="flag-pwd" ${user?.isPWD ? 'checked' : ''} />
              <span class="custom-checkbox"></span>
              <span>${t('form.pwdFlag')}</span>
            </label>
            
            <label class="priority-check-item">
              <input type="checkbox" id="flag-senior" ${user?.isSenior ? 'checked' : ''} />
              <span class="custom-checkbox"></span>
              <span>${t('form.seniorFlag')}</span>
            </label>
            
            <label class="priority-check-item">
              <input type="checkbox" id="flag-pregnant" ${user?.isPregnant ? 'checked' : ''} />
              <span class="custom-checkbox"></span>
              <span>${t('form.pregnantFlag')}</span>
            </label>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Supporting Documents Upload -->
        <div class="form-section">
          <label class="form-label font-bold">${t('form.supportingDocs')}</label>
          <span class="form-hint mb-2 block">${t('form.supportingDocsHint')}</span>
          <div class="sig-upload-area" id="doc-dropzone" style="border: 2px dashed var(--border-strong); border-radius: var(--radius-md); padding: var(--space-5); display: flex; flex-direction: column; align-items: center; cursor: pointer; text-align: center; gap: 8px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            <span class="text-xs text-secondary">${t('form.uploadArea')}</span>
            <input type="file" id="doc-file-input" accept="image/*" style="display:none;" />
          </div>
          <!-- Uploaded files list -->
          <div id="uploaded-files-preview" class="mt-3 flex gap-2" style="flex-wrap: wrap;"></div>
        </div>

        <div class="divider"></div>

        <!-- Proxy Claiming -->
        <div class="form-section">
          <div class="toggle-wrapper" id="proxy-toggle-wrapper">
            <span class="toggle-label font-bold">${t('form.proxyClaim')}</span>
            <div class="toggle" id="proxy-toggle"></div>
          </div>

          <div id="proxy-fields" class="mt-3" style="display: none;">
            <div class="form-group">
              <label class="form-label" for="field-proxy-name">${t('form.proxyName')}</label>
              <input type="text" class="form-input" id="field-proxy-name" placeholder="${t('form.proxyPlaceholder')}" />
            </div>
            
            <div class="form-group mt-3">
              <label class="form-label" for="field-proxy-relationship">${t('form.proxyRelation')}</label>
              <select class="form-select" id="field-proxy-relationship">
                <option value="">${t('form.selectRelation')}</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="sibling">Sibling</option>
                <option value="relative">Relative</option>
                <option value="authorized">Authorized Representative</option>
              </select>
            </div>

            <div class="proxy-token-banner mt-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>${t('form.proxySub')}</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Submit Panel -->
        <div class="form-submit">
          <button type="submit" class="btn ${isOnline ? 'btn-submit-request' : 'btn-queue-offline'} btn-lg w-full" id="submit-btn">
            ${isOnline ? t('form.submitBtnOnline') : t('form.submitBtnOffline')}
          </button>
          
          <div class="tamper-proof-footer-note mt-3">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>${t('form.ledgerNote')}</span>
          </div>
        </div>
      </form>

      <!-- Offline Info Blocks -->
      ${!isOnline ? `
        <div class="offline-info-container mt-4 stagger">
          <div class="offline-info-card card">
            <h4 class="offline-card-title">${t('form.offlineQueueTitle')}</h4>
            <p class="offline-card-desc">${t('form.offlineQueueDesc')}</p>
          </div>
          
          <div class="offline-info-card card mt-3">
            <div class="offline-card-header-with-img">
              <div class="offline-hall-placeholder">🏢</div>
              <div>
                <h4 class="offline-card-title">Barangay Guadalupe Services</h4>
                <p class="offline-card-desc">${t('form.offlineServicePromo')}</p>
              </div>
            </div>
          </div>

          <div class="offline-status-count-card card mt-3">
            <div class="offline-status-inner">
              <div class="offline-status-icon">📥</div>
              <div>
                <h5 class="offline-status-title">${t('form.pendingDocsTitle')}</h5>
                <p class="offline-status-desc">${t('form.pendingDocsDesc', { count: `<strong id="offline-pending-count">${queuedCount}</strong>` })}</p>
              </div>
            </div>
          </div>
        </div>
      ` : `
        <div class="online-info-banner notice notice-info mt-4">
          <span class="notice-icon">ℹ️</span>
          <div>
            ${t('form.onlineNotice')}
          </div>
        </div>
      `}
    </div>
  `;

  addFormStyles();
  bindFormEvents(user, isOnline);
}

function bindFormEvents(user, isOnline) {
  // File attachments logic
  const docDropzone = document.getElementById('doc-dropzone');
  const docFileInput = document.getElementById('doc-file-input');
  const previewContainer = document.getElementById('uploaded-files-preview');
  let uploadedAttachments = [];

  docDropzone?.addEventListener('click', () => docFileInput?.click());

  docFileInput?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        uploadedAttachments.push(base64);

        const thumb = document.createElement('div');
        thumb.className = 'attachment-thumbnail-preview animate-fade-in';
        thumb.style.width = '64px';
        thumb.style.height = '64px';
        thumb.style.borderRadius = 'var(--radius-md)';
        thumb.style.border = '1px solid var(--border-strong)';
        thumb.style.overflow = 'hidden';
        thumb.style.position = 'relative';
        thumb.style.background = `url(${base64}) center/cover no-repeat`;

        const delBtn = document.createElement('button');
        delBtn.innerHTML = '×';
        delBtn.style.cssText = 'position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.6); color:white; border:none; border-radius:50%; width:16px; height:16px; font-size:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:bold;';
        delBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          uploadedAttachments = uploadedAttachments.filter(item => item !== base64);
          thumb.remove();
        });

        thumb.appendChild(delBtn);
        previewContainer?.appendChild(thumb);
      };
      reader.readAsDataURL(file);
    });
  });

  // Proxy toggle
  const proxyToggle = document.getElementById('proxy-toggle');
  const proxyFields = document.getElementById('proxy-fields');
  let proxyEnabled = false;

  document.getElementById('proxy-toggle-wrapper')?.addEventListener('click', () => {
    proxyEnabled = !proxyEnabled;
    proxyToggle.classList.toggle('active', proxyEnabled);
    proxyFields.style.display = proxyEnabled ? 'block' : 'none';
  });

  // Form submit
  document.getElementById('request-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSubmit(user, isOnline, proxyEnabled, uploadedAttachments);
  });
}

async function handleSubmit(user, isOnline, proxyEnabled, uploadedAttachments = []) {
  const docType = document.getElementById('field-doc-type')?.value;
  const purpose = document.getElementById('field-purpose')?.value;

  if (!docType || !purpose) {
    showToast({ type: 'error', title: 'Missing Fields', message: t('form.validationRequired') });
    return;
  }

  if (proxyEnabled) {
    const proxyName = document.getElementById('field-proxy-name')?.value;
    const proxyRelationship = document.getElementById('field-proxy-relationship')?.value;
    if (!proxyName || !proxyRelationship) {
      showToast({ type: 'error', title: 'Missing Proxy Info', message: t('form.validationProxy') });
      return;
    }
  }

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner"></span> ${t('common.loading')}`;

  const isSenior = document.getElementById('flag-senior')?.checked;
  const isPWD = document.getElementById('flag-pwd')?.checked;
  const isPregnant = document.getElementById('flag-pregnant')?.checked;

  const priority = detectPriority(user, { isSenior, isPWD, isPregnant });
  const proxyToken = proxyEnabled ? generateProxyToken() : null;
  const tokenExpiry = proxyEnabled ? getProxyTokenExpiry() : null;
  const referenceNumber = generateReferenceNumber();

  const request = {
    id: generateId('req'),
    referenceNumber,
    residentId: user.id,
    residentName: user.name,
    documentType: docType,
    purpose: purpose,
    status: isOnline ? 'submitted' : 'queued_offline',
    isPriority: priority.isPriority,
    priorityReasons: priority.reasons,
    isProxy: proxyEnabled,
    proxyName: proxyEnabled ? document.getElementById('field-proxy-name')?.value : null,
    proxyRelationship: proxyEnabled ? document.getElementById('field-proxy-relationship')?.value : null,
    proxyToken,
    proxyTokenExpiry: tokenExpiry,
    smsNotifications: true,
    attachments: uploadedAttachments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save request
  await store.put(STORES.requests, request);

  if (isOnline) {
    await ledger.appendEntry({
      requestId: request.id,
      action: 'submitted',
      actor: user.name,
      data: { referenceNumber, documentType: docType }
    });

    await sms.sendSMS('submitted', user.id, {
      documentType: getDocumentTypeLabel(docType),
      referenceNumber,
      requestId: request.id
    });

    if (proxyEnabled && proxyToken) {
      await sms.sendSMS('proxy_token', user.id, {
        documentType: getDocumentTypeLabel(docType),
        proxyToken,
        tokenExpiry: new Date(tokenExpiry).toLocaleString('en-PH'),
        requestId: request.id
      });
    }

    // Simulate Secretary receiving request after 2 seconds
    setTimeout(async () => {
      const current = await store.getById(STORES.requests, request.id);
      if (current && current.status === 'submitted') {
        current.status = 'received';
        current.updatedAt = new Date().toISOString();
        await store.put(STORES.requests, current);

        await ledger.appendEntry({
          requestId: request.id,
          action: 'received',
          actor: 'KB Trongko (Secretary)',
          data: { referenceNumber }
        });

        await sms.sendSMS('received', user.id, {
          referenceNumber,
          requestId: request.id
        });
      }
    }, 2000);

    // Simulate review progress after 5 seconds
    setTimeout(async () => {
      const current = await store.getById(STORES.requests, request.id);
      if (current && current.status === 'received') {
        current.status = 'under_review';
        current.updatedAt = new Date().toISOString();
        await store.put(STORES.requests, current);

        await ledger.appendEntry({
          requestId: request.id,
          action: 'under_review',
          actor: 'Admin K. Trongko (Captain)',
          data: { referenceNumber }
        });
      }
    }, 5000);

  } else {
    await offline.queueSubmission(request);
  }

  showToast({
    type: 'success',
    title: isOnline ? t('form.toastSuccessOnline') : t('form.toastSuccessOffline'),
    message: `Reference: ${referenceNumber}`,
    duration: 4000
  });

  setTimeout(() => {
    window.location.hash = `#/status/${request.id}`;
  }, 1000);
}

function addFormStyles() {
  if (document.getElementById('form-view-styles')) return;
  const style = document.createElement('style');
  style.id = 'form-view-styles';
  style.textContent = `
    .form-offline-bar {
      background: #78350f;
      color: #fef3c7;
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-xs);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-4);
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .form-header h1 {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: #1f2937;
    }

    .request-form {
      background: #ffffff;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      padding: var(--space-4);
    }

    .form-input.prefilled:disabled {
      background: #f3f4f6;
      border-color: var(--border-default);
      color: #374151;
      opacity: 0.9;
    }

    .priority-banner {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.15);
      color: #047857;
      border-radius: var(--radius-md);
      padding: 8px 12px;
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }

    .priority-checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .priority-check-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: var(--font-size-sm);
      cursor: pointer;
      user-select: none;
    }

    .priority-check-item input[type="checkbox"] {
      display: none;
    }

    .custom-checkbox {
      width: 18px;
      height: 18px;
      border: 1.5px solid var(--border-strong);
      border-radius: var(--radius-sm);
      display: inline-block;
      position: relative;
      transition: all 0.2s;
    }

    .priority-check-item input:checked + .custom-checkbox {
      background: #0f4c81;
      border-color: #0f4c81;
    }

    .priority-check-item input:checked + .custom-checkbox::after {
      content: '✓';
      position: absolute;
      color: white;
      font-size: 11px;
      font-weight: bold;
      top: -1px;
      left: 3px;
    }

    .btn-submit-request {
      background: #0f4c81;
      color: #ffffff;
    }

    .btn-submit-request:hover {
      background: #0b3366;
    }

    .btn-queue-offline {
      background: #78350f;
      color: #ffffff;
    }

    .btn-queue-offline:hover {
      background: #5f2a0c;
    }

    .proxy-token-banner {
      background: rgba(15, 76, 129, 0.06);
      border: 1px solid rgba(15, 76, 129, 0.12);
      color: #0f4c81;
      border-radius: var(--radius-md);
      padding: 8px 12px;
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }

    .tamper-proof-footer-note {
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: center;
      font-size: 10px;
      color: var(--text-tertiary);
    }

    /* Offline cards styling */
    .offline-info-card {
      border: 1px solid var(--border-default);
      background: #ffffff;
      padding: var(--space-4);
    }

    .offline-card-title {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .offline-card-desc {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      line-height: 1.4;
      margin: 0;
    }

    .offline-card-header-with-img {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .offline-hall-placeholder {
      font-size: 28px;
      width: 48px;
      height: 48px;
      background: #f3f4f6;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .offline-status-count-card {
      background: #fffbeb;
      border: 1px solid #fde8c3;
      padding: var(--space-3);
    }

    .offline-status-inner {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .offline-status-icon {
      font-size: 24px;
    }

    .offline-status-title {
      font-size: var(--font-size-xs);
      font-weight: 700;
      color: #78350f;
      margin: 0 0 2px;
    }

    .offline-status-desc {
      font-size: var(--font-size-xs);
      color: #92400e;
      margin: 0;
    }

    .offline-status-desc strong {
      font-weight: 700;
    }
  `;
  document.head.appendChild(style);
}
