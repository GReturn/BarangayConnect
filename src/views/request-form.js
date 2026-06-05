/* ============================================
   BarangayConnect — Document Request Form View
   ============================================ */

import auth from '../auth.js';
import store from '../store.js';
import ledger from '../ledger.js';
import offline from '../offline.js';
import sms from '../sms.js';
import { showToast } from '../components/toast.js';
import {
  generateReferenceNumber, generateId, generateProxyToken, getProxyTokenExpiry,
  DOCUMENT_TYPES, detectPriority, escapeHTML
} from '../utils.js';

const { STORES } = store;

export async function renderRequestForm() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const user = auth.getCurrentUser();
  const isOnline = offline.getStatus();

  main.innerHTML = `
    <div class="request-form-view animate-fade-in">
      <div class="form-back-row">
        <button class="btn btn-ghost btn-sm" id="form-back-btn">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
          Balik
        </button>
      </div>

      <div class="form-header">
        <h1>Hangyo og Dokumento</h1>
        <p class="text-secondary mt-2">Pun-a ang form sa ubos para mag-request og barangay document.</p>
      </div>

      ${!isOnline ? `
        <div class="notice notice-warning mt-4">
          <span class="notice-icon">📡</span>
          <div>
            <strong>Offline Mode</strong><br>
            Ang imong hangyo i-save sa app ug ipadala automatiko sa barangay inig balik sa internet.
          </div>
        </div>
      ` : ''}

      <form class="request-form card mt-6" id="request-form">
        <!-- PhilSys Profile Section -->
        <div class="form-section">
          <h3 class="form-section-title">
            <span>👤</span> Personal Information
            <span class="badge badge-verified" style="margin-left: 8px;">🛡️ PhilSys Verified</span>
          </h3>
          <div class="grid grid-2 gap-4 mt-4">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input prefilled" value="${user ? escapeHTML(user.name) : ''}" readonly id="field-name" />
            </div>
            <div class="form-group">
              <label class="form-label">Date of Birth</label>
              <input type="text" class="form-input prefilled" value="${user ? user.dateOfBirth : ''}" readonly id="field-dob" />
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Address</label>
              <input type="text" class="form-input prefilled" value="${user ? escapeHTML(user.address) : ''}" readonly id="field-address" />
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Document Details -->
        <div class="form-section">
          <h3 class="form-section-title"><span>📄</span> Document Details</h3>
          <div class="grid grid-2 gap-4 mt-4">
            <div class="form-group">
              <label class="form-label" for="field-doc-type">Document Type *</label>
              <select class="form-select" id="field-doc-type" required>
                <option value="">— Pilia ang tipo sa dokumento —</option>
                ${DOCUMENT_TYPES.map(dt => `<option value="${dt.value}">${dt.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="field-purpose">Purpose *</label>
              <input type="text" class="form-input" id="field-purpose" placeholder="e.g. Employment, Travel, School" required />
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Priority Flags -->
        <div class="form-section">
          <h3 class="form-section-title"><span>⚡</span> Priority Classification</h3>
          <p class="text-sm text-secondary mt-1 mb-4">I-flag kung ikaw kay usa ka priority sector para ma-prioritize ang imong request.</p>
          
          <div class="priority-flags">
            <label class="priority-flag" id="flag-senior-label">
              <input type="checkbox" id="flag-senior" ${user?.isSenior ? 'checked' : ''} />
              <span class="priority-flag-check"></span>
              <span>👴 Senior Citizen (60+)</span>
            </label>
            <label class="priority-flag" id="flag-pwd-label">
              <input type="checkbox" id="flag-pwd" ${user?.isPWD ? 'checked' : ''} />
              <span class="priority-flag-check"></span>
              <span>♿ Person with Disability (PWD)</span>
            </label>
            <label class="priority-flag" id="flag-pregnant-label">
              <input type="checkbox" id="flag-pregnant" ${user?.isPregnant ? 'checked' : ''} />
              <span class="priority-flag-check"></span>
              <span>🤰 Pregnant</span>
            </label>
          </div>

          <div id="priority-notice" class="mt-3" style="display: none;">
            <div class="notice notice-success">
              <span class="notice-icon">✅</span>
              <span>Ang imong request i-prioritize ug ibutang sa unahan sa queue.</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Proxy Claiming -->
        <div class="form-section">
          <h3 class="form-section-title"><span>👥</span> Proxy Claiming</h3>
          <div class="toggle-wrapper mt-3" id="proxy-toggle-wrapper">
            <div class="toggle" id="proxy-toggle"></div>
            <span class="toggle-label">Ipa-kuha sa uban (Proxy Claiming)</span>
          </div>

          <div id="proxy-fields" class="mt-4" style="display: none;">
            <div class="grid grid-2 gap-4">
              <div class="form-group">
                <label class="form-label" for="field-proxy-name">Proxy Name *</label>
                <input type="text" class="form-input" id="field-proxy-name" placeholder="Pangalan sa mag-kuha" />
              </div>
              <div class="form-group">
                <label class="form-label" for="field-proxy-relationship">Relationship *</label>
                <select class="form-select" id="field-proxy-relationship">
                  <option value="">— Pilia —</option>
                  <option value="child">Anak (Child)</option>
                  <option value="spouse">Asawa (Spouse)</option>
                  <option value="sibling">Ig-agaw (Sibling)</option>
                  <option value="parent">Ginikanan (Parent)</option>
                  <option value="relative">Paryente (Relative)</option>
                  <option value="authorized">Authorized Representative</option>
                </select>
              </div>
            </div>
            <div class="notice notice-info mt-3">
              <span class="notice-icon">🔑</span>
              <span>Usa ka time-limited authorization token ang i-generate ug i-send via SMS sa imong registered number.</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Submit -->
        <div class="form-submit">
          <button type="submit" class="btn ${isOnline ? 'btn-primary' : 'btn-warning'} btn-lg w-full" id="submit-btn">
            ${isOnline ? '📤 Ipadala ang Hangyo' : '📡 I-queue (Offline)'}
          </button>
          <p class="text-xs text-tertiary mt-2" style="text-align: center;">
            ${isOnline
              ? 'Ang imong hangyo i-padala diretso sa barangay office.'
              : 'Ang imong hangyo i-save locally ug i-sync pag-balik sa internet.'
            }
          </p>
        </div>
      </form>
    </div>
  `;

  addFormStyles();
  bindFormEvents(user, isOnline);
}

function bindFormEvents(user, isOnline) {
  // Back button
  document.getElementById('form-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#/';
  });

  // Priority flags
  ['flag-senior', 'flag-pwd', 'flag-pregnant'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', updatePriorityNotice);
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
    await handleSubmit(user, isOnline, proxyEnabled);
  });

  // Initial priority check
  updatePriorityNotice();
}

function updatePriorityNotice() {
  const isSenior = document.getElementById('flag-senior')?.checked;
  const isPWD = document.getElementById('flag-pwd')?.checked;
  const isPregnant = document.getElementById('flag-pregnant')?.checked;
  const notice = document.getElementById('priority-notice');

  if (notice) {
    notice.style.display = (isSenior || isPWD || isPregnant) ? 'block' : 'none';
  }
}

async function handleSubmit(user, isOnline, proxyEnabled) {
  const docType = document.getElementById('field-doc-type')?.value;
  const purpose = document.getElementById('field-purpose')?.value;

  if (!docType || !purpose) {
    showToast({ type: 'error', title: 'Missing Fields', message: 'Palihug pun-a ang tanang required fields.' });
    return;
  }

  if (proxyEnabled) {
    const proxyName = document.getElementById('field-proxy-name')?.value;
    const proxyRelationship = document.getElementById('field-proxy-relationship')?.value;
    if (!proxyName || !proxyRelationship) {
      showToast({ type: 'error', title: 'Missing Proxy Info', message: 'Palihug pun-a ang proxy name ug relationship.' });
      return;
    }
  }

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Processing...';

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save request
  await store.put(STORES.requests, request);

  if (isOnline) {
    // Create ledger entry
    await ledger.appendEntry({
      requestId: request.id,
      action: 'submitted',
      actor: user.name,
      data: { referenceNumber, documentType: docType }
    });

    // Send SMS
    await sms.sendSMS('submitted', user.id, {
      documentType: DOCUMENT_TYPES.find(d => d.value === docType)?.label || docType,
      referenceNumber,
      requestId: request.id
    });

    // If proxy enabled, send proxy token SMS
    if (proxyEnabled && proxyToken) {
      await sms.sendSMS('proxy_token', user.id, {
        documentType: DOCUMENT_TYPES.find(d => d.value === docType)?.label || docType,
        proxyToken,
        tokenExpiry: new Date(tokenExpiry).toLocaleString('en-PH'),
        requestId: request.id
      });
    }

    // Simulate receiving by secretary after 2 seconds
    setTimeout(async () => {
      request.status = 'received';
      request.updatedAt = new Date().toISOString();
      await store.put(STORES.requests, request);

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
    }, 2000);

    // Simulate under review after 5 seconds
    setTimeout(async () => {
      const currentReq = await store.getById(STORES.requests, request.id);
      if (currentReq && currentReq.status === 'received') {
        currentReq.status = 'under_review';
        currentReq.updatedAt = new Date().toISOString();
        await store.put(STORES.requests, currentReq);

        await ledger.appendEntry({
          requestId: request.id,
          action: 'under_review',
          actor: 'KB Trongko (Captain)',
          data: { referenceNumber }
        });
      }
    }, 5000);

  } else {
    // Offline — queue it
    await offline.queueSubmission(request);
  }

  // Navigate to status tracker
  showToast({
    type: 'success',
    title: isOnline ? 'Hangyo Na-submit!' : 'Na-queue ang Hangyo!',
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
    .request-form-view {
      max-width: 720px;
      margin: 0 auto;
    }

    .form-back-row {
      margin-bottom: var(--space-4);
    }

    .form-header h1 {
      font-size: var(--font-size-3xl);
      background: var(--gradient-accent);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .request-form {
      padding: var(--space-8);
    }

    .form-section-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
    }

    .priority-flags {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .priority-flag {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--duration-fast);
      font-size: var(--font-size-base);
    }

    .priority-flag:hover {
      border-color: var(--border-default);
      background: var(--bg-surface-hover);
    }

    .priority-flag input[type="checkbox"] {
      display: none;
    }

    .priority-flag-check {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border-strong);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--duration-fast);
      flex-shrink: 0;
    }

    .priority-flag input:checked + .priority-flag-check {
      background: var(--color-success-500);
      border-color: var(--color-success-500);
    }

    .priority-flag input:checked + .priority-flag-check::after {
      content: '✓';
      color: white;
      font-size: 0.7rem;
      font-weight: bold;
    }

    .form-submit {
      padding-top: var(--space-2);
    }

    @media (max-width: 768px) {
      .request-form {
        padding: var(--space-5);
      }
    }
  `;
  document.head.appendChild(style);
}
