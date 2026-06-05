/* ============================================
   BarangayConnect — Official Review View
   ============================================ */

import store from '../store.js';
import auth from '../auth.js';
import ledger from '../ledger.js';
import sms from '../sms.js';
import { showModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { renderSLATimer, startSLATimers } from '../components/sla-timer.js';
import {
  getDocumentTypeLabel, getStatusInfo, formatDateTimeUTC, formatDateTime,
  escapeHTML, DOCUMENT_TYPES
} from '../utils.js';

const { STORES } = store;

export async function renderReview(requestId) {
  const main = document.getElementById('main-content');
  if (!main) return;

  const request = await store.getById(STORES.requests, requestId);
  if (!request) {
    main.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">Request not found</div>
        <button class="btn btn-ghost mt-4" onclick="window.location.hash='#/dashboard'">← Back to Dashboard</button>
      </div>
    `;
    return;
  }

  const resident = await store.getById(STORES.residents, request.residentId);
  const statusInfo = getStatusInfo(request.status);
  const docType = getDocumentTypeLabel(request.documentType);
  const entries = await ledger.getEntriesForRequest(requestId);
  const smsLog = await sms.getSMSForRequest(requestId);

  // Get previous filings
  const allRequests = await store.getAll(STORES.requests);
  const previousFilings = allRequests.filter(r =>
    r.residentId === request.residentId && r.id !== request.id
  );

  const isApproved = ['approved', 'ready_pickup', 'collected'].includes(request.status);
  const isRejected = request.status === 'rejected';

  main.innerHTML = `
    <div class="review-view animate-fade-in">
      <div class="form-back-row">
        <button class="btn btn-ghost btn-sm" id="review-back-btn">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
          Back to Dashboard
        </button>
      </div>

      ${isApproved ? `
        <div class="notice notice-success mb-4 animate-fade-in-down">
          <span class="notice-icon">✅</span>
          <div>
            <strong>Approved — ${escapeHTML(request.residentName)} notified via SMS.</strong>
            <div class="text-xs mt-1">Digital signature applied under RA 8792.</div>
          </div>
        </div>
      ` : ''}

      ${isRejected ? `
        <div class="notice notice-error mb-4 animate-fade-in-down">
          <span class="notice-icon">❌</span>
          <strong>Rejected — ${escapeHTML(request.residentName)} notified via SMS.</strong>
        </div>
      ` : ''}

      <!-- Request Header -->
      <div class="card animate-fade-in-up">
        <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: var(--space-3);">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="badge badge-${statusInfo.color}">${statusInfo.icon} ${statusInfo.label}</span>
              ${request.isPriority ? `<span class="badge badge-priority">✓ Auto-prioritized — ${request.priorityReasons?.join(', ')}</span>` : ''}
            </div>
            <h2 style="font-size: var(--font-size-2xl);">${docType}</h2>
            <div class="text-sm text-secondary mt-1">${request.referenceNumber}</div>
          </div>
          ${!isApproved && !isRejected ? renderSLATimer(requestId, request.createdAt) : ''}
        </div>
      </div>

      <div class="grid grid-2 gap-4 mt-4">
        <!-- Resident Details -->
        <div class="card animate-fade-in-up" style="animation-delay: 100ms;">
          <h3 class="font-semibold mb-4">👤 Resident Details</h3>
          <div class="review-detail-grid">
            <div class="review-detail">
              <span class="review-detail-label">Full Name</span>
              <span class="review-detail-value">
                ${escapeHTML(request.residentName)}
                ${resident?.philsysVerified ? '<span class="badge badge-verified" style="margin-left: 6px;">🛡️ Verified</span>' : ''}
              </span>
            </div>
            <div class="review-detail">
              <span class="review-detail-label">Address</span>
              <span class="review-detail-value">${resident ? escapeHTML(resident.address) : 'N/A'}</span>
            </div>
            <div class="review-detail">
              <span class="review-detail-label">Date of Birth</span>
              <span class="review-detail-value">${resident?.dateOfBirth || 'N/A'}</span>
            </div>
            <div class="review-detail">
              <span class="review-detail-label">PhilSys ID</span>
              <span class="review-detail-value" style="font-family: monospace;">${resident?.philsysId || 'N/A'}</span>
            </div>
            <div class="review-detail">
              <span class="review-detail-label">Phone</span>
              <span class="review-detail-value">${resident?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        <!-- Request Details -->
        <div class="card animate-fade-in-up" style="animation-delay: 150ms;">
          <h3 class="font-semibold mb-4">📄 Request Details</h3>
          <div class="review-detail-grid">
            <div class="review-detail">
              <span class="review-detail-label">Document Type</span>
              <span class="review-detail-value">${docType}</span>
            </div>
            <div class="review-detail">
              <span class="review-detail-label">Purpose</span>
              <span class="review-detail-value">${escapeHTML(request.purpose)}</span>
            </div>
            <div class="review-detail">
              <span class="review-detail-label">Submitted</span>
              <span class="review-detail-value">${formatDateTime(request.createdAt)}</span>
            </div>
            ${request.isProxy ? `
              <div class="review-detail">
                <span class="review-detail-label">Proxy</span>
                <span class="review-detail-value">${escapeHTML(request.proxyName)} (${request.proxyRelationship})</span>
              </div>
            ` : ''}
          </div>

          ${previousFilings.length > 0 ? `
            <div class="divider" style="margin: var(--space-4) 0;"></div>
            <h4 class="text-xs uppercase text-tertiary mb-2">Previous Filings (${previousFilings.length})</h4>
            ${previousFilings.slice(0, 3).map(pf => `
              <div class="text-sm text-secondary mb-1">
                ${getStatusInfo(pf.status).icon} ${getDocumentTypeLabel(pf.documentType)} — ${getStatusInfo(pf.status).label}
              </div>
            `).join('')}
          ` : ''}
        </div>
      </div>

      <!-- Remarks & Action -->
      ${!isApproved && !isRejected ? `
        <div class="card mt-4 animate-fade-in-up" style="animation-delay: 200ms;">
          <h3 class="font-semibold mb-3">✍️ Official Action</h3>

          <div class="form-group">
            <label class="form-label" for="field-remarks">Remarks (Optional)</label>
            <textarea class="form-textarea" id="field-remarks" placeholder="Idugang og remark o note..."></textarea>
          </div>

          <div class="notice notice-system mt-4">
            <span class="notice-icon">⚖️</span>
            <span>Your approval constitutes a legally binding digital signature under <strong>RA 8792</strong> (E-Commerce Act of 2000).</span>
          </div>

          <div class="flex gap-3 mt-4" style="justify-content: flex-end;">
            <button class="btn btn-ghost" id="btn-reject">❌ I-reject</button>
            <button class="btn btn-success btn-lg" id="btn-approve">✅ I-approve</button>
          </div>
        </div>
      ` : ''}

      <!-- Audit Trail -->
      <div class="card mt-4 animate-fade-in-up" style="animation-delay: 250ms;">
        <h3 class="font-semibold mb-4">📋 Full Audit Trail</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Step</th>
              <th>Action</th>
              <th>Actor</th>
              <th>Timestamp (UTC)</th>
              <th>Hash</th>
            </tr>
          </thead>
          <tbody>
            ${entries.map((entry, i) => `
              <tr>
                <td>${i + 1}</td>
                <td class="font-medium">${ledger.formatAction(entry.action)}</td>
                <td>${escapeHTML(entry.actor)}</td>
                <td class="text-sm">${formatDateTimeUTC(entry.timestamp)}</td>
                <td class="text-xs text-tertiary" style="font-family: monospace;">${entry.hash.substring(0, 12)}…</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- SMS Log -->
      ${smsLog.length > 0 ? `
        <div class="card mt-4 animate-fade-in-up" style="animation-delay: 300ms;">
          <h3 class="font-semibold mb-4">📱 SMS Log</h3>
          ${smsLog.map(s => `
            <div style="padding: var(--space-3) 0; border-bottom: 1px solid var(--border-subtle);">
              <div class="flex items-center justify-between">
                <span class="badge badge-system text-xs">${s.type}</span>
                <span class="text-xs text-tertiary">${formatDateTime(s.sentAt)}</span>
              </div>
              <div class="text-sm text-secondary mt-1">${escapeHTML(s.message)}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  addReviewStyles();
  startSLATimers();

  // Back button
  document.getElementById('review-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#/dashboard';
  });

  // Approve button
  document.getElementById('btn-approve')?.addEventListener('click', () => {
    const remarks = document.getElementById('field-remarks')?.value || '';
    showApprovalModal(request, remarks);
  });

  // Reject button
  document.getElementById('btn-reject')?.addEventListener('click', () => {
    const remarks = document.getElementById('field-remarks')?.value || '';
    handleReject(request, remarks);
  });
}

function showApprovalModal(request, remarks) {
  showModal({
    title: 'Confirm Approval',
    type: 'warning',
    body: `
      <p style="margin-bottom: var(--space-4);">This action will be recorded in the <strong>tamper-proof ledger</strong> and <strong>cannot be undone</strong>.</p>
      <div class="notice notice-system">
        <span class="notice-icon">⚖️</span>
        <span>Your digital signature will be applied under <strong>RA 8792</strong>.</span>
      </div>
      <div style="margin-top: var(--space-4); padding: var(--space-3); background: var(--bg-surface); border-radius: var(--radius-md);">
        <div class="text-xs text-tertiary">Document</div>
        <div class="font-medium">${getDocumentTypeLabel(request.documentType)} — ${escapeHTML(request.residentName)}</div>
        <div class="text-xs text-tertiary mt-1">${request.referenceNumber}</div>
      </div>
    `,
    actions: [
      { label: 'Cancel', class: 'btn-ghost' },
      {
        label: '✅ Confirm',
        class: 'btn-success',
        onClick: () => handleApprove(request, remarks)
      }
    ]
  });
}

async function handleApprove(request, remarks) {
  const official = auth.getCurrentUser();

  // Update request
  request.status = 'approved';
  request.updatedAt = new Date().toISOString();
  request.approvedBy = official?.name || 'Official';
  request.approvedAt = request.updatedAt;
  request.officialRemarks = remarks;
  await store.put(STORES.requests, request);

  // Ledger entry
  await ledger.appendEntry({
    requestId: request.id,
    action: 'approved',
    actor: official?.name || 'Official',
    remarks,
    data: {
      referenceNumber: request.referenceNumber,
      digitalSignature: `RA8792-${Date.now()}`,
      documentType: request.documentType
    }
  });

  // SMS to resident
  await sms.sendSMS('approved', request.residentId, {
    documentType: getDocumentTypeLabel(request.documentType),
    referenceNumber: request.referenceNumber,
    requestId: request.id
  });

  showToast({
    type: 'success',
    title: 'Approved!',
    message: `${request.residentName} notified via SMS.`,
    duration: 5000
  });

  // Re-render
  renderReview(request.id);
}

async function handleReject(request, remarks) {
  showModal({
    title: 'Reject Request?',
    type: 'danger',
    body: `
      <p>Are you sure you want to reject the request from <strong>${escapeHTML(request.residentName)}</strong>?</p>
      <p class="mt-2 text-sm text-secondary">This action will be recorded in the tamper-proof ledger.</p>
    `,
    actions: [
      { label: 'Cancel', class: 'btn-ghost' },
      {
        label: '❌ Reject',
        class: 'btn-danger',
        onClick: async () => {
          const official = auth.getCurrentUser();

          request.status = 'rejected';
          request.updatedAt = new Date().toISOString();
          request.rejectedBy = official?.name || 'Official';
          request.officialRemarks = remarks;
          await store.put(STORES.requests, request);

          await ledger.appendEntry({
            requestId: request.id,
            action: 'rejected',
            actor: official?.name || 'Official',
            remarks,
            data: { referenceNumber: request.referenceNumber }
          });

          await sms.sendSMS('rejected', request.residentId, {
            referenceNumber: request.referenceNumber,
            remarks,
            requestId: request.id
          });

          showToast({ type: 'error', title: 'Rejected', message: `${request.residentName} notified.` });
          renderReview(request.id);
        }
      }
    ]
  });
}

function addReviewStyles() {
  if (document.getElementById('review-styles')) return;
  const style = document.createElement('style');
  style.id = 'review-styles';
  style.textContent = `
    .review-view {
      max-width: 960px;
      margin: 0 auto;
    }

    .review-detail-grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .review-detail {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .review-detail-label {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      font-weight: var(--font-weight-semibold);
    }

    .review-detail-value {
      font-size: var(--font-size-base);
      color: var(--text-primary);
    }

    @media (max-width: 768px) {
      .review-view .grid-2 {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}
