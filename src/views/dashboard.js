/* ============================================
   BarangayConnect — Official Dashboard View
   ============================================ */

import store from '../store.js';
import { renderSLATimer, startSLATimers } from '../components/sla-timer.js';
import {
  getDocumentTypeLabel, getStatusInfo, formatTimeAgo, escapeHTML
} from '../utils.js';

const { STORES } = store;

export async function renderDashboard() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const allRequests = await store.getAll(STORES.requests);

  // Filter by status
  const pending = allRequests.filter(r => ['submitted', 'received'].includes(r.status));
  const forApproval = allRequests.filter(r => r.status === 'under_review');
  const today = new Date().toDateString();
  const completedToday = allRequests.filter(r =>
    ['approved', 'collected'].includes(r.status) &&
    new Date(r.updatedAt).toDateString() === today
  );

  // Build queue — priority first, then by date
  const queue = allRequests
    .filter(r => !['approved', 'rejected', 'collected', 'ready_pickup', 'queued_offline'].includes(r.status))
    .sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

  main.innerHTML = `
    <div class="dashboard-view animate-fade-in">
      <div class="section-header">
        <div>
          <h1 style="font-size: var(--font-size-3xl);">Official Dashboard</h1>
          <p class="text-secondary mt-1">Manage ug i-process ang mga barangay requests</p>
        </div>
        <span class="badge badge-accent">🟢 Online</span>
      </div>

      <!-- Metrics -->
      <div class="grid grid-3 gap-4 mt-6 stagger">
        <div class="metric-card animate-fade-in-up">
          <span class="metric-card-label">Pending</span>
          <span class="metric-card-value warning">${pending.length}</span>
          <span class="text-xs text-secondary">Submitted & received</span>
        </div>
        <div class="metric-card animate-fade-in-up">
          <span class="metric-card-label">For Approval</span>
          <span class="metric-card-value accent">${forApproval.length}</span>
          <span class="text-xs text-secondary">Under review by Captain</span>
        </div>
        <div class="metric-card animate-fade-in-up">
          <span class="metric-card-label">Completed Today</span>
          <span class="metric-card-value success">${completedToday.length}</span>
          <span class="text-xs text-secondary">${today}</span>
        </div>
      </div>

      <!-- Request Queue -->
      <section class="mt-8">
        <div class="section-header">
          <h2 class="section-title">Request Queue</h2>
          <span class="text-sm text-secondary">${queue.length} request${queue.length !== 1 ? 's' : ''}</span>
        </div>

        ${queue.length > 0 ? `
          <div class="card" style="padding: 0; overflow: hidden;">
            <table class="data-table" id="queue-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Document</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>SLA</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                ${queue.map(req => renderQueueRow(req)).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">✅</div>
            <div class="empty-state-title">Walay pending requests</div>
            <p class="text-sm text-secondary">Ang tanang requests na-process na.</p>
          </div>
        `}
      </section>

      <!-- Completed Requests -->
      ${completedToday.length > 0 ? `
        <section class="mt-8">
          <div class="section-header">
            <h2 class="section-title">Completed Today</h2>
          </div>
          <div class="card" style="padding: 0; overflow: hidden;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Document</th>
                  <th>Status</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                ${completedToday.map(req => {
                  const si = getStatusInfo(req.status);
                  return `
                    <tr>
                      <td class="font-medium">${escapeHTML(req.residentName)}</td>
                      <td>${getDocumentTypeLabel(req.documentType)}</td>
                      <td><span class="badge badge-${si.color}">${si.icon} ${si.label}</span></td>
                      <td class="text-secondary">${formatTimeAgo(req.updatedAt)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </section>
      ` : ''}
    </div>
  `;

  addDashboardStyles();
  startSLATimers();

  // Bind row clicks
  document.querySelectorAll('.queue-row').forEach(row => {
    row.addEventListener('click', () => {
      window.location.hash = `#/review/${row.dataset.requestId}`;
    });
  });
}

function renderQueueRow(req) {
  const statusInfo = getStatusInfo(req.status);
  const docType = getDocumentTypeLabel(req.documentType);

  return `
    <tr class="clickable queue-row ${req.isPriority ? 'priority-row' : ''}" data-request-id="${req.id}">
      <td>
        <div class="flex items-center gap-2">
          <div class="avatar" style="width: 28px; height: 28px; font-size: 0.65rem;">
            ${req.residentName.split(' ').map(p => p[0]).join('').substring(0, 2)}
          </div>
          <span class="font-medium">${escapeHTML(req.residentName)}</span>
        </div>
      </td>
      <td>${docType}</td>
      <td><span class="badge badge-${statusInfo.color}">${statusInfo.label}</span></td>
      <td>
        ${req.isPriority ? `
          <span class="badge badge-priority">✓ Auto-prioritized — ${req.priorityReasons?.join(', ')}</span>
        ` : '<span class="text-tertiary text-xs">—</span>'}
      </td>
      <td>${renderSLATimer(req.id, req.createdAt, true)}</td>
      <td class="text-secondary text-sm">${formatTimeAgo(req.createdAt)}</td>
    </tr>
  `;
}

function addDashboardStyles() {
  if (document.getElementById('dashboard-styles')) return;
  const style = document.createElement('style');
  style.id = 'dashboard-styles';
  style.textContent = `
    .dashboard-view .data-table {
      min-width: 700px;
    }

    .dashboard-view .card {
      overflow-x: auto;
    }

    @media (max-width: 768px) {
      .dashboard-view .data-table {
        font-size: var(--font-size-xs);
      }
    }
  `;
  document.head.appendChild(style);
}
