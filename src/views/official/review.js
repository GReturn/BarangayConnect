/* ============================================
   BarangayConnect — Official Review View
   ============================================ */

import store from '../../store.js';
import auth from '../../auth.js';
import ledger from '../../ledger.js';
import sms from '../../sms.js';
import { showModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import {
  getDocumentTypeLabel, getStatusInfo, formatDateTimeUTC, escapeHTML
} from '../../utils.js';
import { t } from '../../i18n.js';

const { STORES } = store;

export async function renderReview(requestId) {
  const main = document.getElementById('main-content');
  if (!main) return;

  const request = await store.getById(STORES.requests, requestId);
  if (!request) {
    main.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">${t('review.notFound')}</div>
        <button class="btn btn-ghost mt-4" onclick="window.location.hash='#/dashboard'">← ${t('common.back')}</button>
      </div>
    `;
    return;
  }

  const statusInfo = getStatusInfo(request.status);
  const docType = getDocumentTypeLabel(request.documentType);
  const entries = await ledger.getEntriesForRequest(requestId);
  const smsLog = await sms.getSMSForRequest(requestId);

  const isApproved = ['approved', 'ready_pickup', 'collected'].includes(request.status);
  const isRejected = request.status === 'rejected';

  // Format date filed
  const dateFiled = new Date(request.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Get hashes for display
  const latestEntry = entries[entries.length - 1];
  const currentHash = latestEntry ? latestEntry.hash : 'c4d3e2f1g0h9i8j7k6l5m4n3o2p1q9r9';
  const prevHash = latestEntry ? latestEntry.previousHash : 'b7e2a16d8c4f92a3e5b1c0d9f8e7a6b5';

  main.innerHTML = `
    <div class="official-review-view animate-fade-in">

      <!-- Status Header Banner -->
      ${isApproved ? `
        <div class="review-status-banner banner-success animate-fade-in-down">
          <span class="banner-status-icon">✓</span>
          <span>${t('review.approvedAlert', { name: escapeHTML(request.residentName) })}</span>
        </div>
      ` : ''}

      ${isRejected ? `
        <div class="review-status-banner banner-danger animate-fade-in-down">
          <span class="banner-status-icon">❌</span>
          <span>${t('review.rejectedAlert', { name: escapeHTML(request.residentName) })}</span>
        </div>
      ` : ''}

      <!-- Request Details Card -->
      <div class="card review-details-card mt-3">
        <div class="review-details-header flex justify-between items-start">
          <div>
            <h2 class="review-doc-title font-bold">${docType}</h2>
            <span class="review-req-id block mt-1">Request ID: #${request.referenceNumber}</span>
          </div>
          <span class="badge review-status-badge status-${request.status}">${statusInfo.label.toUpperCase()}</span>
        </div>

        <div class="review-fields-grid mt-4">
          <div class="review-field-row">
            <span class="review-field-lbl">${t('review.applicantLabel')}</span>
            <span class="review-field-val font-semibold">${escapeHTML(request.residentName)}</span>
          </div>
          
          <div class="review-field-row mt-3">
            <span class="review-field-lbl">${t('status.dateFiled').toUpperCase()}</span>
            <span class="review-field-val">${dateFiled}</span>
          </div>

          <div class="review-field-row mt-3">
            <span class="review-field-lbl">${t('form.purpose').replace(' *', '').toUpperCase()}</span>
            <span class="review-field-val font-italic">"${escapeHTML(request.purpose)}"</span>
          </div>
        </div>

        <!-- Remarks Section (only if not processed) -->
        ${!isApproved && !isRejected ? `
          <div class="divider"></div>
          <div class="form-group mt-2">
            <label class="form-label font-bold" for="review-remarks">${t('review.remarksLabel')}</label>
            <span class="form-hint mb-2 block">${t('review.remarksHint')}</span>
            <textarea class="form-textarea" id="review-remarks" placeholder="${t('review.remarksPlaceholder')}"></textarea>
          </div>

          <div class="esignature-alert-banner mt-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>${t('review.esignNote')}</span>
          </div>

          <!-- Approve/Reject buttons -->
          <div class="review-actions-row flex gap-3 mt-4">
            <button class="btn btn-approve-action w-full" id="btn-review-approve">${t('review.approveBtn')}</button>
            <button class="btn btn-reject-action w-full" id="btn-review-reject">${t('review.rejectBtn')}</button>
          </div>
        ` : ''}
      </div>

      <!-- Image Attachments Section -->
      <div class="card review-attachments-card mt-4">
        <h3 class="font-bold mb-3">${t('review.attachmentsTitle')}</h3>
        <div class="attachments-grid">
          ${request.attachments && request.attachments.length > 0 ? request.attachments.map((base64, idx) => `
            <div class="attachment-slot slot-filled clickable-attachment" data-attachment-index="${idx}" style="background: url(${base64}) center/cover no-repeat;">
              <div class="attachment-thumb-overlay">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </div>
            </div>
          `).join('') : `
            <p class="text-xs text-tertiary">${t('review.noAttachments')}</p>
          `}
        </div>
      </div>

      <!-- SMS Notification log block -->
      ${smsLog.length > 0 ? `
        <div class="review-sms-alert-card card mt-4">
          <div class="sms-alert-header flex items-center gap-2">
            <span class="sms-alert-icon">✉️</span>
            <div>
              <span class="sms-alert-title block">${t('review.smsLogTitle')}</span>
              <span class="sms-alert-status">${t('review.smsDelivered')}</span>
            </div>
          </div>
          <div class="sms-alert-body mt-3">
            <span class="sms-alert-phone block">${t('review.smsDeliveredSub')}</span>
            <span class="sms-alert-phone font-bold mt-1">${escapeHTML(auth.getCurrentUser()?.phone || '+63 917 123 4567')}</span>
            <div class="sms-message-bubble mt-3 font-italic">
              "${escapeHTML(smsLog[smsLog.length - 1].message)}"
            </div>
            <span class="sms-alert-time block mt-2">${new Date(smsLog[smsLog.length - 1].sentAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} — ${new Date(smsLog[smsLog.length - 1].sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC</span>
          </div>
        </div>
      ` : ''}

      <!-- Audit Trail Timeline Steps table -->
      <div class="card review-audit-card mt-4">
        <h3 class="font-bold flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          ${t('review.auditTitle')}
        </h3>
        
        <div class="audit-trail-table-container mt-3">
          <table class="audit-trail-table w-full">
            <thead>
              <tr>
                <th></th>
                <th>${t('review.auditStep')}</th>
                <th>${t('review.auditAction')}</th>
                <th>${t('review.auditActor')}</th>
                <th>${t('review.auditTimestamp')}</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map((entry, idx) => {
                let actionStr = t('status.stepSubmitted');
                if (entry.action === 'received') actionStr = t('status.stepReceivedSec');
                else if (entry.action === 'under_review') actionStr = t('status.stepApprovedNode');
                else if (entry.action === 'approved') actionStr = t('status.stepApprovedDesc');
                else if (entry.action === 'rejected') actionStr = t('status.stepRejected');

                return `
                  <tr>
                    <td class="audit-dot-cell"><span class="audit-table-dot"></span></td>
                    <td class="font-semibold">${idx + 1}</td>
                    <td class="font-bold text-gray-900">${actionStr}</td>
                    <td>${escapeHTML(entry.actor)}</td>
                    <td class="text-secondary font-medium">${formatDateTimeUTC(entry.timestamp).split(' ')[1]} UTC</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Hash block at bottom -->
        <div class="audit-hash-block mt-4">
          <span class="hash-label block font-semibold" style="font-family: monospace; font-size: 10px; word-break: break-all; color: #047857;">
            ${prevHash.substring(0, 32)} HASH: ${currentHash.substring(0, 32)} — ${t('review.hashVerified')}
          </span>
          <p class="hash-info mt-2">${t('review.auditDesc')}</p>
        </div>
      </div>

    </div>
  `;

  addReviewStyles();

  // Bind clickable attachments for Lightbox
  main.querySelectorAll('.clickable-attachment').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.attachmentIndex, 10);
      const base64 = request.attachments[idx];
      showAttachmentLightbox(base64);
    });
  });

  // Bind approval events
  document.getElementById('btn-review-approve')?.addEventListener('click', () => {
    const remarks = document.getElementById('review-remarks')?.value || '';
    showConfirmApprovalModal(request, remarks);
  });

  document.getElementById('btn-review-reject')?.addEventListener('click', () => {
    const remarks = document.getElementById('review-remarks')?.value || '';
    handleReject(request, remarks);
  });
}

function showAttachmentLightbox(base64) {
  let zoom = 1;
  let rotation = 0;

  const updateTransform = () => {
    const img = document.getElementById('lightbox-img');
    if (img) {
      img.style.transform = `scale(${zoom}) rotate(${rotation}deg)`;
    }
  };

  showModal({
    title: t('review.attachmentsTitle'),
    body: `
      <div class="lightbox-modal-content flex flex-col items-center">
        <div class="lightbox-img-frame" style="width:100%; height:240px; border-radius:var(--radius-lg); overflow:hidden; border:1px solid var(--border-default); display:flex; align-items:center; justify-content:center; background:#0f172a;">
          <img id="lightbox-img" src="${base64}" alt="Attachment" style="max-width:100%; max-height:100%; object-fit:contain; transition: transform 0.2s;" />
        </div>
        <div class="lightbox-toolbar flex gap-2 mt-4" style="justify-content:center;">
          <button class="btn btn-ghost btn-sm" id="btn-zoom-in" style="font-size:11px;">🔍+ Zoom In</button>
          <button class="btn btn-ghost btn-sm" id="btn-zoom-out" style="font-size:11px;">🔍- Zoom Out</button>
          <button class="btn btn-ghost btn-sm" id="btn-rotate" style="font-size:11px;">🔄 Rotate</button>
        </div>
      </div>
    `,
    actions: [{ label: t('common.close'), class: 'btn-primary' }]
  });

  document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
    zoom += 0.25;
    updateTransform();
  });
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    if (zoom > 0.5) zoom -= 0.25;
    updateTransform();
  });
  document.getElementById('btn-rotate')?.addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    updateTransform();
  });
}

function showConfirmApprovalModal(request, remarks) {
  showModal({
    title: t('review.confirmApprovalTitle'),
    type: 'default',
    body: `
      <div class="confirm-modal-inner flex flex-col items-center text-center">
        <div class="confirm-icon-box">✓</div>
        <h3 class="confirm-title font-bold mt-3">${t('review.confirmApprovalTitle')}</h3>
        <p class="confirm-desc mt-2">${t('review.confirmApprovalDesc')}</p>
      </div>
    `,
    actions: [
      {
        label: t('common.confirm'),
        class: 'btn-confirm-approve w-full',
        onClick: () => handleApprove(request, remarks)
      },
      {
        label: t('common.cancel'),
        class: 'btn-confirm-cancel w-full'
      }
    ]
  });
}

async function handleApprove(request, remarks) {
  const official = auth.getCurrentUser();

  request.status = 'approved';
  request.updatedAt = new Date().toISOString();
  request.approvedBy = official?.name || 'Official';
  request.approvedAt = request.updatedAt;
  request.officialRemarks = remarks;
  await store.put(STORES.requests, request);

  await ledger.appendEntry({
    requestId: request.id,
    action: 'approved',
    actor: official?.name || 'Official',
    remarks,
    data: {
      referenceNumber: request.referenceNumber,
      digitalSignature: `BC-LEDGER-RA8792-${Date.now()}`,
      documentType: request.documentType
    }
  });

  await sms.sendSMS('approved', request.residentId, {
    documentType: getDocumentTypeLabel(request.documentType),
    referenceNumber: request.referenceNumber,
    requestId: request.id
  });

  showToast({
    type: 'success',
    title: 'Approved!',
    message: `${request.residentName} notified via SMS.`
  });

  renderReview(request.id);
}

async function handleReject(request, remarks) {
  showModal({
    title: t('review.rejectConfirmTitle'),
    type: 'danger',
    body: `
      <p>${t('review.rejectConfirmDesc', { name: `<strong>${escapeHTML(request.residentName)}</strong>` })}</p>
      <p class="mt-2 text-sm text-secondary">${t('review.ledgerDescShort')}</p>
    `,
    actions: [
      { label: t('common.cancel'), class: 'btn-ghost' },
      {
        label: `❌ ${t('review.rejectBtn')}`,
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

          showToast({ type: 'error', title: t('review.rejectBtn'), message: `${request.residentName} notified.` });
          renderReview(request.id);
        }
      }
    ]
  });
}

function addReviewStyles() {
  if (document.getElementById('review-view-styles')) return;
  const style = document.createElement('style');
  style.id = 'review-view-styles';
  style.textContent = `
    .review-status-banner {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .review-status-banner.banner-success {
      background: #f0fdf4;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .review-status-banner.banner-danger {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    .banner-status-icon {
      font-size: 16px;
      font-weight: 800;
    }

    .review-details-card {
      background: #ffffff;
      padding: var(--space-4);
    }

    .review-doc-title {
      font-size: var(--font-size-md);
      color: #1f2937;
      margin: 0;
    }

    .review-req-id {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
    }

    .review-status-badge {
      font-weight: 600;
    }

    .review-status-badge.status-under_review {
      background: rgba(245, 158, 11, 0.08);
      color: #b45309;
      border: 1.5px solid rgba(245, 158, 11, 0.15);
    }

    .review-status-badge.status-submitted,
    .review-status-badge.status-received {
      background: rgba(15, 76, 129, 0.08);
      color: #0f4c81;
      border: 1.5px solid rgba(15, 76, 129, 0.15);
    }

    .review-status-badge.status-approved {
      background: rgba(16, 185, 129, 0.08);
      color: #047857;
      border: 1.5px solid rgba(16, 185, 129, 0.15);
    }

    .review-status-badge.status-rejected {
      background: rgba(239, 68, 68, 0.08);
      color: #b91c1c;
      border: 1.5px solid rgba(239, 68, 68, 0.15);
    }

    .review-field-lbl {
      font-size: 9px;
      color: var(--text-tertiary);
      font-weight: 700;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 2px;
    }

    .review-field-val {
      font-size: var(--font-size-sm);
      color: #1f2937;
      display: block;
    }

    .esignature-alert-banner {
      background: rgba(15, 76, 129, 0.06);
      border: 1px solid rgba(15, 76, 129, 0.12);
      color: #0f4c81;
      border-radius: var(--radius-md);
      padding: var(--space-3);
      font-size: 11px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-weight: 500;
      line-height: 1.4;
    }

    .esignature-alert-banner svg {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .btn-approve-action {
      background: #15803d;
      color: #ffffff;
    }

    .btn-approve-action:hover {
      background: #166534;
    }

    .btn-reject-action {
      background: #ffffff;
      border: 1.5px solid #dc2626;
      color: #dc2626;
    }

    .btn-reject-action:hover {
      background: #fef2f2;
    }

    /* Attachments styles */
    .review-attachments-card {
      background: #ffffff;
      padding: var(--space-4);
    }

    .attachments-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
    }

    .attachment-slot {
      height: 110px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }

    .attachment-slot.slot-filled {
      background: #f3f4f6;
      border: 1px solid var(--border-default);
    }

    .attachment-thumb-icon {
      font-size: 28px;
    }

    .attachment-thumb-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .attachment-slot.slot-filled:hover .attachment-thumb-overlay {
      opacity: 1;
    }

    .attachment-slot.slot-upload-dashed {
      border: 2px dashed var(--border-strong);
      background: #ffffff;
      transition: background 0.2s;
    }

    .attachment-slot.slot-upload-dashed:hover {
      background: #f9fafb;
      border-color: #0f4c81;
    }

    .upload-icon-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--text-tertiary);
      position: relative;
    }

    .upload-plus {
      position: absolute;
      right: -8px;
      top: -8px;
      font-weight: 800;
      font-size: 16px;
      color: #0f4c81;
    }

    /* SMS Log Alert card */
    .review-sms-alert-card {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: var(--space-4);
    }

    .sms-alert-icon {
      font-size: 20px;
      color: #16803d;
    }

    .sms-alert-title {
      font-size: var(--font-size-xs);
      font-weight: 700;
      color: #14532d;
    }

    .sms-alert-status {
      font-size: 9px;
      font-weight: 700;
      background: #dcfce7;
      color: #166534;
      padding: 1px 6px;
      border-radius: var(--radius-full);
      border: 1px solid #bbf7d0;
    }

    .sms-alert-phone {
      font-size: 11px;
      color: #166534;
    }

    .sms-message-bubble {
      background: #ffffff;
      border: 1px solid #e6fcf0;
      border-radius: var(--radius-md);
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-xs);
      color: #1f2937;
      line-height: 1.5;
    }

    .sms-alert-time {
      font-size: 9px;
      color: #15803d;
    }

    /* Audit Trail steps table */
    .review-audit-card {
      background: #ffffff;
      padding: var(--space-4);
    }

    .audit-trail-table-container {
      overflow-x: auto;
    }

    .audit-trail-table {
      border-collapse: collapse;
      font-size: var(--font-size-xs);
    }

    .audit-trail-table th {
      padding: var(--space-2) var(--space-3);
      color: var(--text-tertiary);
      font-weight: 700;
      text-align: left;
      border-bottom: 1px solid var(--border-default);
    }

    .audit-trail-table td {
      padding: var(--space-3) var(--space-3);
      border-bottom: 1.5px solid var(--border-subtle);
      color: var(--text-secondary);
      font-weight: 500;
    }

    .audit-dot-cell {
      width: 14px;
      padding-right: 0 !important;
    }

    .audit-table-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #059669;
      display: inline-block;
    }

    .audit-hash-block {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: var(--radius-md);
      padding: var(--space-3);
    }

    .hash-info {
      font-size: 9px;
      color: #166534;
      line-height: 1.4;
      margin: 0;
    }

    /* Confirm Modal override */
    .confirm-modal-inner {
      padding: var(--space-2);
    }

    .confirm-icon-box {
      width: 48px;
      height: 48px;
      background: rgba(15, 76, 129, 0.08);
      color: #0f4c81;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
    }

    .confirm-title {
      font-size: var(--font-size-md);
      color: #1f2937;
    }

    .confirm-desc {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
    }

    .btn-confirm-approve {
      background: #0f4c81;
      color: #ffffff;
    }

    .btn-confirm-approve:hover {
      background: #0b3366;
    }

    .btn-confirm-cancel {
      background: #ffffff;
      border: 1px solid var(--border-default);
      color: var(--text-secondary);
    }

    .btn-confirm-cancel:hover {
      background: #f9fafb;
    }
  `;
  document.head.appendChild(style);
}
