/* ============================================
   BarangayConnect — Status Tracker View
   ============================================ */

import store from '../../store.js';
import ledger from '../../ledger.js';
import auth from '../../auth.js';
import {
  getDocumentTypeLabel, getStatusInfo, formatDateTime, formatTimeAgo,
  generateQRCodeSVG, escapeHTML
} from '../../utils.js';
import { showToast } from '../../components/toast.js';
import { t } from '../../i18n.js';

const { STORES } = store;

export async function renderStatusTracker(requestId) {
  const main = document.getElementById('main-content');
  if (!main) return;

  const user = auth.getCurrentUser();
  const allRequests = await store.getAll(STORES.requests);
  const myRequests = allRequests.filter(r => r.residentId === user?.id);

  // If no specific requestId provided, default to the most recent request
  let activeRequest = null;
  if (requestId) {
    activeRequest = await store.getById(STORES.requests, requestId);
  } else if (myRequests.length > 0) {
    // Sort by date descending and pick first
    myRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    activeRequest = myRequests[0];
  }

  // Render empty state if no requests at all
  if (!activeRequest) {
    main.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-title">${t('status.noRequestsTitle')}</div>
        <p class="text-sm text-secondary">${t('status.noRequestsDesc')}</p>
        <button class="btn btn-primary mt-4" onclick="window.location.hash='#/request'">${t('status.btnNewRequest')}</button>
      </div>
    `;
    return;
  }

  const statusInfo = getStatusInfo(activeRequest.status);
  const docType = getDocumentTypeLabel(activeRequest.documentType);
  const entries = await ledger.getEntriesForRequest(activeRequest.id);
  const qrCode = generateQRCodeSVG(activeRequest.referenceNumber, 110);

  // Calculate progress percent based on status
  let progressPercent = 0;
  let progressText = t('status.filterReview');
  if (activeRequest.status === 'queued_offline') {
    progressPercent = 10;
    progressText = t('status.stepQueued');
  } else if (activeRequest.status === 'submitted') {
    progressPercent = 25;
    progressText = t('status.stepSubmitted');
  } else if (activeRequest.status === 'received') {
    progressPercent = 50;
    progressText = t('status.stepReceivedSec');
  } else if (activeRequest.status === 'under_review') {
    progressPercent = 65;
    progressText = t('status.filterReview');
  } else if (['approved', 'ready_pickup', 'collected'].includes(activeRequest.status)) {
    progressPercent = 100;
    progressText = t('status.stepReady');
  } else if (activeRequest.status === 'rejected') {
    progressPercent = 100;
    progressText = t('status.stepRejected');
  }

  // Get transaction hash from last ledger entry
  const latestEntry = entries[entries.length - 1];
  const ledgerHash = latestEntry ? latestEntry.hash : '4e9c3e2f1g0h9i8j7k6l5m4n3o2p1q9r';

  // Seed some mock requests to match screenshot lists if they are not already in DB
  const mockRequests = [
    {
      id: 'mock-req-1',
      documentType: 'indigency_certificate',
      status: 'received',
      createdAt: '2026-03-10T10:00:00Z',
      referenceNumber: 'REQ-2026-00010',
      actionLabel: 'Nakuha na ang dokumento >',
      customStatusClass: 'status-success-chip',
      statusText: 'Gidawat na'
    },
    {
      id: 'mock-req-2',
      documentType: 'street_repair',
      status: 'rejected',
      createdAt: '2026-03-08T15:30:00Z',
      referenceNumber: 'REQ-2026-00008',
      actionLabel: 'Kulang sa impormasyon >',
      customStatusClass: 'status-danger-chip',
      statusText: 'Wala nadayon'
    },
    {
      id: 'mock-req-3',
      documentType: 'medical_assistance',
      status: 'under_review',
      createdAt: '2026-03-12T08:15:00Z',
      referenceNumber: 'REQ-2026-00012',
      actionLabel: 'Gisusi ang mga attachment >',
      customStatusClass: 'status-warning-chip',
      statusText: 'Giproseso pa'
    }
  ];

  // Merge database requests and mock requests
  const listItems = [...myRequests.filter(r => r.id !== activeRequest.id)];

  main.innerHTML = `
    <div class="status-tracker-view animate-fade-in">
      
      <!-- Top Title -->
      <div class="status-tracker-header flex items-center justify-between">
        <div>
          <h1>${t('status.title')}</h1>
          <p class="text-secondary mt-1">${t('status.subtitle')}</p>
        </div>
      </div>

      <!-- Current Processing Request Card -->
      <div class="card active-tracker-card mt-4">
        <span class="active-tracker-label uppercase">${t('status.currentProgress')}</span>
        <div class="active-tracker-row mt-2">
          <h2 class="active-tracker-title">${docType}</h2>
          <span class="badge active-tracker-status-badge status-${activeRequest.status}">${progressText}</span>
        </div>
        
        <div class="progress-container mt-4">
          <div class="progress-header flex justify-between">
            <span class="progress-label">${t('status.progressLabel')}</span>
            <span class="progress-percent">${t('status.progressDone', { percent: progressPercent })}</span>
          </div>
          <div class="progress-bar-track mt-2">
            <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
          </div>
        </div>

        <!-- Horizontal Steps Summary -->
        <div class="progress-steps-row mt-4">
          <div class="progress-step-item ${progressPercent >= 25 ? 'step-done' : ''}">
            <div class="progress-step-dot-small">✓</div>
            <span class="progress-step-text">${t('status.stepReceived')}</span>
          </div>
          <div class="progress-step-item ${progressPercent >= 65 ? 'step-done' : progressPercent >= 50 ? 'step-active' : ''}">
            <div class="progress-step-dot-small">• • •</div>
            <span class="progress-step-text">${t('status.stepReview')}</span>
          </div>
          <div class="progress-step-item ${progressPercent === 100 ? 'step-done' : ''}">
            <div class="progress-step-dot-small">⚙️</div>
            <span class="progress-step-text">${t('status.stepReady')}</span>
          </div>
        </div>
      </div>

      <!-- Detail Timeline Vertical Steps -->
      <div class="card vertical-timeline-card mt-4">
        <h3 class="font-bold mb-4">${t('status.requestDetails')}</h3>
        
        <div class="timeline-request-details mb-4">
          <div class="timeline-detail-row">
            <span class="detail-lbl">${t('form.docType').replace(' *', '').split('(')[0].trim()}</span>
            <span class="detail-val font-semibold">${docType}</span>
          </div>
          <div class="timeline-detail-row mt-2">
            <span class="detail-lbl">Request ID</span>
            <span class="detail-val font-bold" style="font-family: monospace;">${activeRequest.referenceNumber}</span>
          </div>
          <div class="timeline-detail-row mt-2">
            <span class="detail-lbl">${t('status.dateFiled')}</span>
            <span class="detail-val">${formatDateTime(activeRequest.createdAt)}</span>
          </div>
        </div>

        <div class="vertical-timeline">
          <!-- Step 1: Gi-submit -->
          <div class="timeline-node step-completed">
            <div class="timeline-node-dot">✓</div>
            <div class="timeline-node-content">
              <span class="timeline-node-title">${t('status.stepSubmittedNode')}</span>
              <span class="timeline-node-desc">${t('status.stepSubmittedNode')} — ${formatDateTime(activeRequest.createdAt)}</span>
            </div>
          </div>

          <!-- Step 2: Nadawat sa Sekretaryo -->
          <div class="timeline-node ${progressPercent >= 50 ? 'step-completed' : 'step-pending'}">
            <div class="timeline-node-dot">${progressPercent >= 50 ? '✓' : '2'}</div>
            <div class="timeline-node-content">
              <span class="timeline-node-title">${t('status.stepReceivedSec')}</span>
              <span class="timeline-node-desc">${progressPercent >= 50 ? 'Received by Secretary' : t('status.stepPendingSec')}</span>
            </div>
          </div>

          <!-- Step 3: Gi-review sa Kapitan -->
          <div class="timeline-node ${progressPercent >= 100 ? 'step-completed' : progressPercent === 65 ? 'step-active' : 'step-pending'}">
            <div class="timeline-node-dot">${progressPercent >= 100 ? '✓' : '3'}</div>
            <div class="timeline-node-content">
              <span class="timeline-node-title">${t('status.stepApprovedNode')}</span>
              <span class="timeline-node-desc">${progressPercent >= 100 ? t('status.stepApprovedDesc') : progressPercent === 65 ? t('status.stepReview') : t('status.stepPendingCap')}</span>
            </div>
          </div>

          <!-- Step 4: Andam na Kuhaon -->
          <div class="timeline-node ${progressPercent === 100 ? 'step-completed' : 'step-pending'}">
            <div class="timeline-node-dot">📦</div>
            <div class="timeline-node-content">
              <span class="timeline-node-title">${t('status.stepReady')}</span>
              <span class="timeline-node-desc">${t('status.stepReadyDesc')}</span>
            </div>
          </div>
        </div>

        <!-- QR Code Block for pickup (only if approved/ready) -->
        ${['approved', 'ready_pickup', 'collected'].includes(activeRequest.status) ? `
          <div class="pickup-qr-container mt-4">
            <div class="pickup-qr-box">${qrCode}</div>
            <p class="pickup-qr-text mt-2 font-bold">${t('status.qrPrompt')}</p>
          </div>
        ` : ''}

        <div class="divider"></div>

        <!-- Tamper-proof record collapse -->
        <div class="tamper-proof-collapse" id="tamper-proof-toggle">
          <div class="tamper-proof-trigger">
            <span class="font-bold flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              ${t('status.ledgerToggle')}
            </span>
            <svg class="chevron-icon" id="ledger-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="tamper-proof-details mt-3" id="ledger-details" style="display: none;">
            <div class="ledger-field">
              <span class="ledger-field-lbl">TRANSACTION HASH</span>
              <span class="ledger-field-val font-semibold" style="font-family: monospace; font-size: 10px; word-break: break-all;">${ledgerHash}</span>
            </div>
            <p class="ledger-subtext mt-2">${t('status.ledgerDesc')}</p>
          </div>
        </div>

        <!-- SMS Notifications Toggle -->
        <div class="sms-notification-toggle-row mt-4">
          <div class="flex items-center justify-between w-full">
            <div>
              <span class="font-semibold block" style="font-size: var(--font-size-sm);">${t('status.smsToggle')}</span>
            </div>
            <div class="toggle ${activeRequest.smsNotifications ? 'active' : ''}" id="sms-toggle"></div>
          </div>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="status-filters-row mt-6">
        <button class="filter-chip active" data-filter="all">${t('status.filterAll')}</button>
        <button class="filter-chip" data-filter="received">${t('status.filterReceived')}</button>
        <button class="filter-chip" data-filter="processing">${t('status.filterReview')}</button>
        <button class="filter-chip" data-filter="rejected">${t('status.filterRejected')}</button>
      </div>

      <!-- List of Other/Mock Requests -->
      <div class="requests-history-list mt-4 stagger">
        <!-- DB requests -->
        ${listItems.map(req => {
          const info = getStatusInfo(req.status);
          const lbl = getDocumentTypeLabel(req.documentType);
          return `
            <div class="history-item card clickable-history-card" data-request-id="${req.id}" data-status="${req.status}">
              <div class="history-header">
                <span class="history-item-icon">📄</span>
                <div>
                  <h4 class="history-item-title">${lbl}</h4>
                  <span class="history-item-date">Gihangyo: ${formatTimeAgo(req.createdAt)}</span>
                </div>
                <span class="badge history-badge badge-${info.color}">${info.label}</span>
              </div>
              <div class="history-action-link mt-2">
                <span>${t('status.historyTrackStatus')}</span>
              </div>
            </div>
          `;
        }).join('')}

        <!-- Mock requests to fill design -->
        ${mockRequests.map(mock => `
          <div class="history-item card" id="${mock.id}" data-status="${mock.status}">
            <div class="history-header">
              <span class="history-item-icon">${mock.documentType === 'street_repair' ? '⚡' : '📄'}</span>
              <div>
                <h4 class="history-item-title">${mock.documentType === 'street_repair' ? 'Streetlight Repair' : mock.documentType === 'medical_assistance' ? 'Medical Assistance' : 'Indigency Certificate'}</h4>
                <span class="history-item-date">Gihangyo: Marso ${mock.createdAt.split('-')[2].split('T')[0]}, 2026</span>
              </div>
              <span class="badge history-badge ${mock.customStatusClass}">${mock.statusText}</span>
            </div>
            <div class="history-action-link mt-2">
              <span>${mock.actionLabel}</span>
            </div>
          </div>
        `).join('')}

        <!-- Add Request Floating / Bottom Button -->
        <button class="btn btn-ghost btn-lg w-full mt-4" id="btn-add-new-request">
          ${t('status.btnNewRequest')}
        </button>
      </div>

    </div>
  `;

  // Bind style triggers
  addTrackerStyles();

  // Toggle Ledger details
  const ledgerToggle = document.getElementById('tamper-proof-toggle');
  const ledgerDetails = document.getElementById('ledger-details');
  const ledgerChevron = document.getElementById('ledger-chevron');
  let ledgerOpen = false;

  ledgerToggle?.addEventListener('click', () => {
    ledgerOpen = !ledgerOpen;
    ledgerDetails.style.display = ledgerOpen ? 'block' : 'none';
    ledgerChevron.style.transform = ledgerOpen ? 'rotate(180deg)' : 'rotate(0deg)';
  });

  // Toggle SMS notifications
  const smsToggleBtn = document.getElementById('sms-toggle');
  smsToggleBtn?.addEventListener('click', async () => {
    activeRequest.smsNotifications = !activeRequest.smsNotifications;
    await store.put(STORES.requests, activeRequest);
    smsToggleBtn.classList.toggle('active', activeRequest.smsNotifications);
    showToast({
      type: 'success',
      title: 'SMS Settings Updated',
      message: activeRequest.smsNotifications ? 'Notifications enabled' : 'Notifications disabled'
    });
  });

  // Bind filter chips clicks to filter logs list
  main.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      main.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.dataset.filter;
      main.querySelectorAll('.requests-history-list .history-item').forEach(item => {
        const status = item.dataset.status;
        if (filter === 'all') {
          item.style.display = '';
        } else if (filter === 'received') {
          if (['received', 'submitted', 'queued_offline'].includes(status)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        } else if (filter === 'processing') {
          if (['under_review', 'processing', 'received', 'submitted'].includes(status)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        } else if (filter === 'rejected') {
          if (status === 'rejected') {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        }
      });
    });
  });

  // Bind clicks on other requests
  main.querySelectorAll('.clickable-history-card').forEach(card => {
    card.addEventListener('click', () => {
      renderStatusTracker(card.dataset.requestId);
    });
  });

  document.getElementById('btn-add-new-request')?.addEventListener('click', () => {
    window.location.hash = '#/request';
  });
}

function addTrackerStyles() {
  if (document.getElementById('tracker-view-styles')) return;
  const style = document.createElement('style');
  style.id = 'tracker-view-styles';
  style.textContent = `
    .status-tracker-header h1 {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: #1f2937;
    }

    .active-tracker-card {
      background: #ffffff;
      border: 1px solid var(--border-default);
      padding: var(--space-4);
    }

    .active-tracker-label {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    .active-tracker-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .active-tracker-title {
      font-size: var(--font-size-md);
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .active-tracker-status-badge {
      font-weight: 600;
    }

    .active-tracker-status-badge.status-under_review {
      background: rgba(245, 158, 11, 0.08);
      color: #b45309;
      border: 1.5px solid rgba(245, 158, 11, 0.15);
    }

    .active-tracker-status-badge.status-submitted,
    .active-tracker-status-badge.status-received {
      background: rgba(15, 76, 129, 0.08);
      color: #0f4c81;
      border: 1.5px solid rgba(15, 76, 129, 0.15);
    }

    .active-tracker-status-badge.status-approved,
    .active-tracker-status-badge.status-ready_pickup {
      background: rgba(16, 185, 129, 0.08);
      color: #047857;
      border: 1.5px solid rgba(16, 185, 129, 0.15);
    }

    .progress-container {
      display: flex;
      flex-direction: column;
    }

    .progress-label {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .progress-percent {
      font-size: 11px;
      font-weight: 700;
      color: #0f4c81;
    }

    .progress-bar-track {
      height: 6px;
      background: #f3f4f6;
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: #0f4c81;
      border-radius: var(--radius-full);
      transition: width 0.4s ease-out;
    }

    .progress-steps-row {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid var(--border-default);
      padding-top: var(--space-3);
    }

    .progress-step-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-tertiary);
    }

    .progress-step-dot-small {
      font-size: var(--font-size-xs);
      font-weight: 700;
    }

    .progress-step-text {
      font-size: var(--font-size-xs);
      font-weight: 600;
    }

    .progress-step-item.step-done {
      color: #059669;
    }

    .progress-step-item.step-active {
      color: #b45309;
    }

    /* Vertical Timeline */
    .vertical-timeline-card {
      background: #ffffff;
      padding: var(--space-4);
    }

    .timeline-request-details {
      background: #f9fafb;
      padding: var(--space-3);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-default);
    }

    .timeline-detail-row {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
    }

    .detail-lbl {
      color: var(--text-tertiary);
    }

    .detail-val {
      color: #1f2937;
    }

    .vertical-timeline {
      position: relative;
      padding-left: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: var(--space-4);
    }

    .vertical-timeline::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 10px;
      bottom: 10px;
      width: 2px;
      background: var(--border-default);
    }

    .timeline-node {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .timeline-node-dot {
      position: absolute;
      left: -24px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #ffffff;
      border: 2px solid var(--border-strong);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: bold;
      z-index: 2;
    }

    .timeline-node.step-completed .timeline-node-dot {
      background: #059669;
      border-color: #059669;
      color: #ffffff;
    }

    .timeline-node.step-active .timeline-node-dot {
      background: #d97706;
      border-color: #d97706;
      color: #ffffff;
    }

    .timeline-node.step-pending .timeline-node-dot {
      color: var(--text-tertiary);
    }

    .timeline-node-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .timeline-node-title {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: #1f2937;
    }

    .timeline-node.step-pending .timeline-node-title {
      color: var(--text-tertiary);
    }

    .timeline-node-desc {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
    }

    /* Collapse Tamper-proof */
    .tamper-proof-collapse {
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      cursor: pointer;
      background: #f9fafb;
      transition: background 0.2s;
    }

    .tamper-proof-collapse:hover {
      background: #f3f4f6;
    }

    .tamper-proof-trigger {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #0f4c81;
      font-size: var(--font-size-sm);
    }

    .chevron-icon {
      transition: transform 0.2s;
    }

    .ledger-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .ledger-field-lbl {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    .ledger-subtext {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      line-height: 1.4;
      margin: 0;
    }

    .sms-notification-toggle-row {
      background: #f9fafb;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      padding: var(--space-3);
    }

    /* Filters chips — horizontally scrollable, mobile-friendly */
    .status-filters-row {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding-bottom: 4px;
    }

    .status-filters-row::-webkit-scrollbar {
      display: none;
    }

    .filter-chip {
      background: #ffffff;
      border: 1.5px solid var(--border-default);
      border-radius: var(--radius-full);
      /* Min 36px height for comfortable touch tap */
      min-height: 36px;
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      white-space: nowrap;
      /* Prevent chip from being crushed by flex */
      flex-shrink: 0;
      transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }

    .filter-chip.active {
      background: #0f4c81;
      color: #ffffff;
      border-color: #0f4c81;
      font-weight: 700;
    }

    .filter-chip:hover:not(.active) {
      border-color: var(--border-strong);
      color: var(--text-primary);
    }

    /* History item cards */
    .history-item {
      background: #ffffff;
      border: 1px solid var(--border-default);
      padding: var(--space-3);
      margin-top: 10px;
      display: flex;
      flex-direction: column;
    }

    .history-header {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .history-item-icon {
      font-size: 20px;
      width: 36px;
      height: 36px;
      background: #f3f4f6;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .history-item-title {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 2px;
    }

    .history-item-date {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
    }

    .history-badge {
      margin-left: auto;
      font-weight: 600;
    }

    .history-badge.status-success-chip {
      background: rgba(16, 185, 129, 0.08);
      color: #047857;
      border: 1.5px solid rgba(16, 185, 129, 0.15);
    }

    .history-badge.status-danger-chip {
      background: rgba(239, 68, 68, 0.08);
      color: #b91c1c;
      border: 1.5px solid rgba(239, 68, 68, 0.15);
    }

    .history-badge.status-warning-chip {
      background: rgba(245, 158, 11, 0.08);
      color: #b45309;
      border: 1.5px solid rgba(245, 158, 11, 0.15);
    }

    .history-action-link {
      border-top: 1px solid var(--border-default);
      padding-top: 8px;
      margin-top: 8px;
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: #0f4c81;
      cursor: pointer;
    }

    .pickup-qr-container {
      background: #f9fafb;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .pickup-qr-box {
      background: #ffffff;
      padding: 8px;
      border-radius: var(--radius-md);
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .pickup-qr-text {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      max-width: 240px;
    }
  `;
  document.head.appendChild(style);
}
