/* ============================================
   BarangayConnect — Status Tracker View
   ============================================ */

import store from '../store.js';
import ledger from '../ledger.js';
import { renderPipeline } from '../components/pipeline.js';
import { renderSLATimer, startSLATimers } from '../components/sla-timer.js';
import {
  getDocumentTypeLabel, getStatusInfo, formatDateTimeUTC, formatDateTime,
  generateQRCodeSVG, escapeHTML
} from '../utils.js';

const { STORES } = store;

export async function renderStatusTracker(requestId) {
  const main = document.getElementById('main-content');
  if (!main) return;

  const request = await store.getById(STORES.requests, requestId);
  if (!request) {
    main.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">Request not found</div>
        <p class="text-sm text-secondary">The request you're looking for doesn't exist.</p>
        <button class="btn btn-ghost mt-4" onclick="window.location.hash='#/'">← Back to Home</button>
      </div>
    `;
    return;
  }

  const statusInfo = getStatusInfo(request.status);
  const docType = getDocumentTypeLabel(request.documentType);
  const entries = await ledger.getEntriesForRequest(requestId);
  const qrCode = generateQRCodeSVG(request.referenceNumber, 140);

  main.innerHTML = `
    <div class="status-view animate-fade-in">
      <div class="form-back-row">
        <button class="btn btn-ghost btn-sm" id="status-back-btn">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
          Balik
        </button>
      </div>

      <!-- Header Card -->
      <div class="card card-accent animate-fade-in-up" style="margin-bottom: var(--space-6);">
        <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: var(--space-4);">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="badge badge-${statusInfo.color}">${statusInfo.icon} ${statusInfo.label}</span>
              ${request.isPriority ? `<span class="badge badge-priority">⚡ ${request.priorityReasons?.join(', ')}</span>` : ''}
              ${request.isProxy ? '<span class="badge badge-system">👥 Proxy Claiming</span>' : ''}
            </div>
            <h2 style="font-size: var(--font-size-2xl);">${docType}</h2>
            <div class="text-sm text-secondary mt-1">
              <span class="font-semibold">${request.referenceNumber}</span> • Purpose: ${escapeHTML(request.purpose)}
            </div>
          </div>
          <div style="text-align: center;">
            ${qrCode}
            <div class="text-xs text-tertiary mt-2">Pickup QR Code</div>
          </div>
        </div>
      </div>

      <!-- Pipeline -->
      <div class="card animate-fade-in-up" style="animation-delay: 100ms;">
        <h3 class="font-semibold mb-2">Request Pipeline</h3>
        ${renderPipeline(request.status)}
      </div>

      <!-- SLA Timer (only if under review or pending) -->
      ${['submitted', 'received', 'under_review'].includes(request.status) ? `
        <div class="mt-4 animate-fade-in-up" style="animation-delay: 150ms;">
          ${renderSLATimer(requestId, request.createdAt)}
        </div>
      ` : ''}

      <!-- SMS Notification Toggle -->
      <div class="card mt-4 animate-fade-in-up" style="animation-delay: 200ms; padding: var(--space-4) var(--space-6);">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span style="font-size: 1.2rem;">📱</span>
            <div>
              <div class="font-semibold">SMS Notifications</div>
              <div class="text-xs text-secondary">Makadawat ka og SMS updates sa imong registered number</div>
            </div>
          </div>
          <div class="toggle ${request.smsNotifications ? 'active' : ''}" id="sms-toggle"></div>
        </div>
      </div>

      <!-- Proxy Info -->
      ${request.isProxy ? `
        <div class="card mt-4 animate-fade-in-up" style="animation-delay: 250ms;">
          <h3 class="font-semibold mb-3">👥 Proxy Claiming Details</h3>
          <div class="grid grid-2 gap-4">
            <div>
              <div class="text-xs text-tertiary uppercase">Proxy Name</div>
              <div class="font-medium mt-1">${escapeHTML(request.proxyName)}</div>
            </div>
            <div>
              <div class="text-xs text-tertiary uppercase">Relationship</div>
              <div class="font-medium mt-1" style="text-transform: capitalize;">${request.proxyRelationship}</div>
            </div>
            <div>
              <div class="text-xs text-tertiary uppercase">Authorization Token</div>
              <div class="font-semibold mt-1 text-accent" style="font-family: monospace; font-size: var(--font-size-lg);">${request.proxyToken || 'N/A'}</div>
            </div>
            <div>
              <div class="text-xs text-tertiary uppercase">Token Expiry</div>
              <div class="font-medium mt-1">${request.proxyTokenExpiry ? formatDateTime(request.proxyTokenExpiry) : 'N/A'}</div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Audit Trail -->
      <div class="card mt-4 animate-fade-in-up" style="animation-delay: 300ms;">
        <h3 class="font-semibold mb-4">📋 Audit Trail</h3>
        ${entries.length > 0 ? `
          <div class="audit-timeline">
            ${entries.map((entry, i) => `
              <div class="audit-entry ${i === entries.length - 1 ? 'latest' : ''}">
                <div class="audit-entry-dot"></div>
                <div class="audit-entry-content">
                  <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: var(--space-2);">
                    <span class="font-semibold">${ledger.formatAction(entry.action)}</span>
                    <span class="text-xs text-tertiary">${formatDateTimeUTC(entry.timestamp)}</span>
                  </div>
                  <div class="text-sm text-secondary mt-1">By: ${escapeHTML(entry.actor)}</div>
                  ${entry.remarks ? `<div class="text-sm text-secondary mt-1">Remarks: ${escapeHTML(entry.remarks)}</div>` : ''}
                  <div class="text-xs text-tertiary mt-1" style="font-family: monospace; opacity: 0.5;">Hash: ${entry.hash.substring(0, 16)}…</div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<p class="text-sm text-secondary">Wala pa\'y audit entries.</p>'}
      </div>
    </div>
  `;

  addStatusStyles();
  startSLATimers();

  // Events
  document.getElementById('status-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#/';
  });

  // SMS toggle
  document.getElementById('sms-toggle')?.addEventListener('click', async () => {
    request.smsNotifications = !request.smsNotifications;
    await store.put(STORES.requests, request);
    document.getElementById('sms-toggle')?.classList.toggle('active', request.smsNotifications);
  });

  // Live update
  store.subscribe(STORES.requests, async () => {
    const updated = await store.getById(STORES.requests, requestId);
    if (updated && updated.status !== request.status) {
      renderStatusTracker(requestId);
    }
  });
}

function addStatusStyles() {
  if (document.getElementById('status-styles')) return;
  const style = document.createElement('style');
  style.id = 'status-styles';
  style.textContent = `
    .status-view {
      max-width: 800px;
      margin: 0 auto;
    }

    .audit-timeline {
      position: relative;
      padding-left: var(--space-6);
    }

    .audit-timeline::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 8px;
      bottom: 8px;
      width: 2px;
      background: var(--border-default);
    }

    .audit-entry {
      position: relative;
      padding: var(--space-3) 0;
    }

    .audit-entry-dot {
      position: absolute;
      left: calc(-1 * var(--space-6) + 2px);
      top: 18px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--color-neutral-600);
      border: 2px solid var(--bg-surface-solid);
    }

    .audit-entry.latest .audit-entry-dot {
      background: var(--color-accent-500);
      box-shadow: 0 0 8px rgba(0, 201, 167, 0.4);
    }

    .audit-entry-content {
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--border-subtle);
    }

    .audit-entry.latest .audit-entry-content {
      border-color: rgba(0, 201, 167, 0.2);
      background: rgba(0, 201, 167, 0.05);
    }
  `;
  document.head.appendChild(style);
}
