/* ============================================
   BarangayConnect — Official Dashboard View
   ============================================ */

import store from '../../store.js';
import { getDocumentTypeLabel, getStatusInfo, formatTimeAgo, escapeHTML } from '../../utils.js';
import { showToast } from '../../components/toast.js';
import { t } from '../../i18n.js';

const { STORES } = store;

export async function renderDashboard() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const activeSos = JSON.parse(localStorage.getItem('brgyconnect_active_sos') || '[]');
  const unresolvedSOS = activeSos.filter(s => s.status !== 'resolved');

  const allRequests = await store.getAll(STORES.requests);

  // Filter queue requests (pending approval)
  const pendingRequests = allRequests.filter(r => 
    !['approved', 'rejected', 'collected', 'ready_pickup', 'queued_offline'].includes(r.status)
  ).sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const pendingCount = pendingRequests.length;
  const approvedTodayCount = allRequests.filter(r => 
    ['approved', 'collected', 'ready_pickup'].includes(r.status) &&
    new Date(r.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  const totalRequestsCount = 1284 + allRequests.length;
  const pendingDisplayCount = 42 + pendingCount;
  const approvedDisplayCount = 156 + approvedTodayCount;

  main.innerHTML = `
    <div class="official-dashboard-view animate-fade-in">
      
      <!-- SOS Active Emergency Notification -->
      ${unresolvedSOS.length > 0 ? `
        <div class="dashboard-emergency-banner animate-pulse" id="sos-alert-banner" style="background:#fee2e2; border: 1.5px solid #fca5a5; border-radius:var(--radius-lg); padding:var(--space-3) var(--space-4); margin-bottom:var(--space-4); display:flex; justify-content:space-between; align-items:center; color:#991b1b; font-size:var(--font-size-sm); font-weight:600;">
          <span class="flex items-center gap-2">🚨 <span>${t('dashboard.activeSosAlert', { count: unresolvedSOS.length })}</span></span>
          <button class="btn btn-danger btn-sm" id="btn-dispatch-sos">${t('dashboard.openDispatchBtn')}</button>
        </div>
      ` : ''}

      <!-- Dashboard Top Banner -->
      <div class="dashboard-banner">
        <span class="banner-org">${t('dashboard.subtitle')}</span>
        <h1 class="banner-title">${t('dashboard.title')}</h1>
        <div class="banner-date-capsule mt-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <!-- Stats Cards Grid -->
      <div class="dashboard-stats-grid mt-4 stagger">
        <div class="stats-card card">
          <div class="stats-header flex justify-between">
            <span class="stats-label">${t('dashboard.statTotal')}</span>
            <span class="stats-icon-box blue-sub">📊</span>
          </div>
          <div class="stats-value-row mt-2">
            <span class="stats-value">${totalRequestsCount}</span>
            <span class="stats-trend font-bold">+12%</span>
          </div>
          <span class="stats-footer-text">${t('dashboard.statTotal')}</span>
        </div>

        <div class="stats-card card">
          <div class="stats-header flex justify-between">
            <span class="stats-label">${t('dashboard.statPending')}</span>
            <span class="stats-icon-box orange-sub">📋</span>
          </div>
          <div class="stats-value-row mt-2">
            <span class="stats-value">${pendingDisplayCount}</span>
            <span class="stats-trend text-danger font-bold">Urgent</span>
          </div>
          <span class="stats-footer-text">${t('dashboard.statPending')}</span>
        </div>

        <div class="stats-card card">
          <div class="stats-header flex justify-between">
            <span class="stats-label">${t('dashboard.statApproved')}</span>
            <span class="stats-icon-box green-sub">✓</span>
          </div>
          <div class="stats-value-row mt-2">
            <span class="stats-value">${approvedDisplayCount}</span>
            <span class="stats-trend text-success font-bold">Last 24h</span>
          </div>
          <span class="stats-footer-text">${t('dashboard.statApproved')}</span>
        </div>
      </div>

      <!-- Request Queue Header -->
      <div class="section-header-compact mt-6">
        <h2 class="section-title-compact">${t('dashboard.queueTitle')}</h2>
        <a href="#/dashboard" class="section-action-link" id="btn-view-all-queue">${t('home.viewAll')}</a>
      </div>

      <!-- Priority Toggle -->
      <div class="queue-control-row flex items-center justify-between mt-2">
        <span class="queue-control-lbl font-semibold">${t('dashboard.queueTitle').toUpperCase()}</span>
        <div class="priority-toggle-wrapper flex items-center gap-2">
          <span class="text-xs text-secondary font-medium">${t('dashboard.priorityToggle')}</span>
          <div class="toggle active" id="queue-priority-toggle"></div>
        </div>
      </div>

      <!-- Request Queue List Card Stack -->
      <div class="request-queue-list mt-3 stagger">
        ${pendingRequests.length > 0 ? pendingRequests.map(req => renderQueueCardItem(req)).join('') : `
          <div class="empty-queue-card card flex flex-col items-center justify-center py-6">
            <span style="font-size: 2rem;">✅</span>
            <h4 class="font-bold mt-2 text-secondary">${t('dashboard.emptyQueue')}</h4>
          </div>
        `}
      </div>

      <!-- Document Insights Card -->
      <div class="document-insights-card card mt-4">
        <div class="insights-content-row">
          <div class="insights-texts">
            <h4 class="insights-title">${t('dashboard.insightsTitle')}</h4>
            <p class="insights-desc mt-1">Barangay clearance requests are up 24% this week. Consider adjusting processing schedules.</p>
            <button class="btn btn-primary btn-sm mt-3" id="btn-view-insights">${t('dashboard.insightsBtn')}</button>
          </div>
          <div class="insights-mini-chart">
            <svg viewBox="0 0 60 40" width="60" height="40">
              <rect x="5" y="25" width="8" height="15" fill="#e2e8f0" rx="1"/>
              <rect x="18" y="15" width="8" height="25" fill="#e2e8f0" rx="1"/>
              <rect x="31" y="20" width="8" height="20" fill="#e2e8f0" rx="1"/>
              <rect x="44" y="5" width="8" height="35" fill="#0f4c81" rx="1"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Today's Goal Card -->
      <div class="goal-progress-card card mt-4">
        <h4 class="goal-title uppercase font-bold text-center">${t('dashboard.goalTitle')}</h4>
        <div class="goal-circle-wrapper mt-3 flex justify-center">
          <svg class="goal-ring" width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#f3f4f6" stroke-width="8" fill="none" />
            <circle cx="50" cy="50" r="40" stroke="#0f4c81" stroke-width="8" fill="none"
                    stroke-dasharray="251.2" stroke-dashoffset="37.68" stroke-linecap="round" />
            <text x="50" y="56" text-anchor="middle" font-weight="800" font-size="18" fill="#1f2937">85%</text>
          </svg>
        </div>
        <p class="goal-desc mt-2 text-center font-bold">${t('dashboard.goalDesc', { processed: 20, total: 24 })}</p>
      </div>

      <!-- Quick Action: Print Barangay Report -->
      <div class="print-report-card card mt-4">
        <span class="print-label uppercase">${t('dashboard.quickActionTitle')}</span>
        <h3 class="print-title mt-1">${t('dashboard.printReportTitle')}</h3>
        <button class="btn btn-ghost btn-lg w-full mt-3 flex items-center justify-center gap-2" id="btn-print-report">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          ${t('dashboard.printReportBtn')}
        </button>
      </div>

      <!-- Tamper-proof Ledger Log List Section -->
      <div class="ledger-logs-section card mt-4">
        <h3 class="font-bold flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          ${t('dashboard.ledgerTitle')}
        </h3>
        <div class="ledger-log-timeline mt-3">
          <div class="ledger-log-node">
            <span class="ledger-log-dot"></span>
            <div class="ledger-log-content">
              <span class="ledger-log-title">Admin K. Tiongko approved Request #8821</span>
              <span class="ledger-log-sub font-semibold">ID: TXN-992-BA | 10:42 AM</span>
            </div>
          </div>
          <div class="ledger-log-node">
            <span class="ledger-log-dot dot-system"></span>
            <div class="ledger-log-content">
              <span class="ledger-log-title text-success">System integrity check passed</span>
              <span class="ledger-log-sub font-semibold">HASH: 4e9c...8f1a | 09:00 AM</span>
            </div>
          </div>
          <div class="ledger-log-node">
            <span class="ledger-log-dot dot-danger"></span>
            <div class="ledger-log-content">
              <span class="ledger-log-title">Admin S. Go rejected Request #8819</span>
              <span class="ledger-log-sub font-semibold">ID: TXN-990-CF | 08:31 AM</span>
            </div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm w-full mt-3" id="btn-blockchain-audit">${t('dashboard.blockchainAuditBtn')}</button>
      </div>

      <!-- GovChain Footer -->
      <div class="govchain-footer mt-8 text-center pb-4">
        <div class="govchain-line flex items-center justify-center gap-2">
          <span class="govchain-icon">🛡️</span>
          <span class="govchain-text">BarangayConnect OS v2.4.0 • Secured by GovChain</span>
        </div>
        <div class="govchain-links mt-2 flex justify-center gap-4">
          <a href="#/dashboard" class="govchain-link">Privacy Policy</a>
          <a href="#/dashboard" class="govchain-link">Support Desk</a>
        </div>
      </div>

    </div>
  `;

  addDashboardStyles();

  // Bind queue clicks
  main.querySelectorAll('.queue-item-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.hash = `#/review/${card.dataset.requestId}`;
    });
  });

  // Bind buttons
  document.getElementById('btn-print-report')?.addEventListener('click', () => {
    showToast({
      type: 'success',
      title: 'Generating PDF',
      message: 'Monthly report compiling. Download starting shortly.'
    });
  });

  document.getElementById('btn-blockchain-audit')?.addEventListener('click', () => {
    window.location.hash = '#/ledger-explorer';
  });

  document.getElementById('btn-view-insights')?.addEventListener('click', () => {
    window.location.hash = '#/insights';
  });

  document.getElementById('btn-dispatch-sos')?.addEventListener('click', () => {
    window.location.hash = '#/sos-dispatch';
  });
}

function renderQueueCardItem(req) {
  const docType = getDocumentTypeLabel(req.documentType);
  const initials = req.residentName.split(' ').map(p => p[0]).join('').substring(0, 2);

  // SLA Warnings
  let timeLimit = t('dashboard.slaLimit');
  let isEscalated = false;
  if (req.isPriority) {
    timeLimit = t('dashboard.slaPriorityEscalate');
    isEscalated = true;
  } else if (req.id.endsWith('2') || req.id.endsWith('4')) {
    timeLimit = t('dashboard.slaEscalate');
    isEscalated = true;
  }

  return `
    <div class="queue-item-card card ${req.isPriority ? 'border-priority' : 'border-pending'}" data-request-id="${req.id}">
      <div class="queue-item-header flex items-center justify-between">
        <div class="flex items-center gap-2">
          ${req.isPriority ? '<span class="badge badge-priority-card">PRIORITY</span>' : ''}
          ${req.isPriority ? `<span class="badge badge-sector-card">${t('form.seniorFlag').toUpperCase().split('(')[0].trim()}</span>` : `<span class="badge badge-pending-card">${t('dashboard.statPending').toUpperCase()}</span>`}
        </div>
        <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
      
      <div class="queue-item-resident mt-3 flex items-center gap-3">
        <div class="avatar" style="width: 32px; height: 32px; font-size: 0.7rem; background: var(--gradient-accent); color: white;">
          ${initials}
        </div>
        <div class="queue-item-title-col">
          <h4 class="queue-item-resident-name font-bold">${escapeHTML(req.residentName)}</h4>
          <span class="queue-item-doctype">${docType}</span>
        </div>
      </div>

      <div class="queue-item-meta mt-3">
        ${req.isPriority ? `
          <div class="queue-priority-reason">
            ✓ ${t('dashboard.seniorPriorityReason')}
          </div>
        ` : ''}
        <div class="queue-sla-alert ${isEscalated ? 'alert-danger' : 'alert-info'} mt-1">
          <span class="alert-icon">⚠️</span>
          <span>${timeLimit}</span>
        </div>
      </div>
    </div>
  `;
}

function addDashboardStyles() {
  if (document.getElementById('dashboard-view-styles')) return;
  const style = document.createElement('style');
  style.id = 'dashboard-view-styles';
  style.textContent = `
    .dashboard-banner {
      background: linear-gradient(135deg, #0e3e7d 0%, #1e40af 100%);
      color: #ffffff;
      padding: var(--space-5);
      border-radius: var(--radius-xl);
      box-shadow: 0 4px 12px rgba(15, 76, 129, 0.15);
    }

    .banner-org {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.5px;
      opacity: 0.7;
    }

    .banner-title {
      font-size: var(--font-size-xl);
      font-weight: 800;
      margin: 2px 0 0;
      color: #ffffff;
    }

    .banner-date-capsule {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.18);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 500;
      backdrop-filter: blur(4px);
    }

    /* Stats Grid */
    .dashboard-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-2);
    }

    .stats-card {
      background: #ffffff;
      border: 1px solid var(--border-default);
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
    }

    .stats-label {
      font-size: 9px;
      font-weight: 700;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .stats-icon-box {
      font-size: 12px;
      width: 20px;
      height: 20px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stats-icon-box.blue-sub { background: rgba(15, 76, 129, 0.08); color: #0f4c81; }
    .stats-icon-box.orange-sub { background: rgba(245, 158, 11, 0.08); color: #b45309; }
    .stats-icon-box.green-sub { background: rgba(16, 185, 129, 0.08); color: #047857; }

    .stats-value-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    .stats-value {
      font-size: var(--font-size-lg);
      font-weight: 800;
      color: #1f2937;
    }

    .stats-trend {
      font-size: 9px;
    }

    .stats-footer-text {
      font-size: 8px;
      color: var(--text-tertiary);
      margin-top: 2px;
    }

    /* Queue Controls */
    .queue-control-row {
      border-bottom: 1.5px solid var(--border-default);
      padding-bottom: 8px;
    }

    .queue-control-lbl {
      font-size: 10px;
      color: var(--text-tertiary);
      letter-spacing: 0.5px;
    }

    /* Queue card items */
    .request-queue-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .queue-item-card {
      background: #ffffff;
      border: 1px solid var(--border-default);
      padding: var(--space-4);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      transition: all 0.2s;
    }

    .queue-item-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transform: translateY(-1px);
    }

    .queue-item-card.border-priority {
      border-left: 3px solid #dc2626;
    }

    .queue-item-card.border-pending {
      border-left: 3px solid #b45309;
    }

    .badge-priority-card {
      background: rgba(220, 38, 38, 0.08);
      color: #dc2626;
      border: 1px solid rgba(220, 38, 38, 0.15);
      font-size: 8px;
      padding: 1px 4px;
    }

    .badge-sector-card {
      background: rgba(59, 130, 246, 0.08);
      color: #3b82f6;
      border: 1px solid rgba(59, 130, 246, 0.15);
      font-size: 8px;
      padding: 1px 4px;
    }

    .badge-pending-card {
      background: rgba(180, 83, 9, 0.08);
      color: #b45309;
      border: 1px solid rgba(180, 83, 9, 0.15);
      font-size: 8px;
      padding: 1px 4px;
    }

    .queue-item-resident-name {
      font-size: var(--font-size-sm);
      color: #1f2937;
      margin: 0;
    }

    .queue-item-doctype {
      font-size: 11px;
      color: var(--text-tertiary);
    }

    .queue-priority-reason {
      font-size: 10px;
      color: #047857;
      font-weight: 500;
    }

    .queue-sla-alert {
      font-size: 9px;
      font-weight: 600;
      padding: 3px 6px;
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .queue-sla-alert.alert-danger {
      background: #fef2f2;
      color: #dc2626;
    }

    .queue-sla-alert.alert-info {
      background: #f0fdf4;
      color: #15803d;
    }

    /* Insights card */
    .document-insights-card {
      background: #ffffff;
      padding: var(--space-4);
      border: 1px solid var(--border-default);
    }

    .insights-content-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .insights-texts {
      flex: 1;
    }

    .insights-title {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .insights-desc {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.4;
      margin: 0;
    }

    /* Goal card */
    .goal-progress-card {
      background: #ffffff;
      padding: var(--space-4);
      border: 1px solid var(--border-default);
    }

    .goal-title {
      font-size: 10px;
      color: var(--text-tertiary);
      letter-spacing: 0.5px;
    }

    .goal-circle-wrapper {
      position: relative;
    }

    .goal-desc {
      font-size: 11px;
      color: var(--text-secondary);
    }

    /* Print card */
    .print-report-card {
      background: #ffffff;
      padding: var(--space-4);
      border: 1px solid var(--border-default);
    }

    .print-label {
      font-size: 9px;
      color: var(--text-tertiary);
      letter-spacing: 0.5px;
      font-weight: 700;
    }

    .print-title {
      font-size: var(--font-size-md);
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    /* Ledger log lists */
    .ledger-logs-section {
      background: #111827;
      border: 1px solid #1f2937;
      color: #ffffff;
      padding: var(--space-4);
    }

    .ledger-logs-section h3 {
      color: #ffffff;
      font-size: var(--font-size-sm);
    }

    .ledger-log-timeline {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      position: relative;
      padding-left: var(--space-4);
    }

    .ledger-log-timeline::before {
      content: '';
      position: absolute;
      left: 3px;
      top: 6px;
      bottom: 6px;
      width: 1.5px;
      background: #374151;
    }

    .ledger-log-node {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .ledger-log-dot {
      position: absolute;
      left: -20px;
      top: 5px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #3b82f6;
      border: 2px solid #111827;
      box-shadow: 0 0 6px rgba(59, 130, 246, 0.4);
    }

    .ledger-log-dot.dot-system {
      background: #10b981;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
    }

    .ledger-log-dot.dot-danger {
      background: #ef4444;
      box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
    }

    .ledger-log-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ledger-log-title {
      font-size: 11px;
      font-weight: 500;
      color: #e5e7eb;
    }

    .ledger-log-sub {
      font-size: 9px;
      color: #9ca3af;
    }

    /* Govchain footer */
    .govchain-footer {
      color: var(--text-tertiary);
    }

    .govchain-text {
      font-size: 10px;
      font-weight: 500;
    }

    .govchain-link {
      font-size: 10px;
      color: #0f4c81;
      font-weight: 600;
    }
  `;
  document.head.appendChild(style);
}
