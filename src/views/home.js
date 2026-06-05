/* ============================================
   BarangayConnect — Home View (Resident)
   ============================================ */

import auth from '../auth.js';
import store from '../store.js';
import offline from '../offline.js';
import { formatTimeAgo, getStatusInfo, getDocumentTypeLabel } from '../utils.js';

const { STORES } = store;

export async function renderHome() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const user = auth.getCurrentUser();
  const greeting = auth.getGreeting();
  const isOnline = offline.getStatus();

  // Get user's requests
  const allRequests = await store.getAll(STORES.requests);
  const myRequests = allRequests.filter(r => r.residentId === user?.id);
  const activeRequests = myRequests.filter(r => !['collected', 'rejected'].includes(r.status));
  const queuedCount = await offline.getQueuedCount();

  main.innerHTML = `
    <div class="home-view animate-fade-in">
      <!-- Hero Greeting -->
      <div class="home-hero">
        <div class="home-hero-content">
          <div class="home-greeting">
            <span class="home-greeting-label">${greeting},</span>
            <h1 class="home-greeting-name">${user ? user.firstName : 'Residente'}!</h1>
          </div>
          <p class="home-greeting-sub">
            ${isOnline
              ? 'Unsa ang imong gusto buhaton karon?'
              : `<span class="text-warning">📡 Offline mode — ${queuedCount} queued</span>`
            }
          </p>
        </div>
        ${user?.philsysVerified ? `
          <div class="home-philsys-badge">
            <span class="badge badge-verified">🛡️ PhilSys Verified</span>
          </div>
        ` : ''}
      </div>

      <!-- Quick Actions -->
      <section class="home-section">
        <div class="section-header">
          <h2 class="section-title">Quick Actions</h2>
        </div>
        <div class="grid grid-3 gap-4 stagger">
          <div class="quick-action animate-fade-in-up" id="action-request-doc">
            <div class="quick-action-icon">📄</div>
            <span class="quick-action-label">Hangyo og Dokumento</span>
            <span class="quick-action-desc">Barangay Clearance, Indigency, ug uban pa</span>
          </div>
          <div class="quick-action animate-fade-in-up" id="action-track-status">
            <div class="quick-action-icon" style="background: var(--gradient-system);">📊</div>
            <span class="quick-action-label">Status sa Hangyo</span>
            <span class="quick-action-desc">I-track ang imong mga request</span>
          </div>
          <div class="quick-action animate-fade-in-up" id="action-sms-log">
            <div class="quick-action-icon" style="background: var(--gradient-warning);">📱</div>
            <span class="quick-action-label">SMS Log</span>
            <span class="quick-action-desc">Mga notification ug mensahe</span>
          </div>
        </div>
      </section>

      <!-- Active Requests -->
      ${activeRequests.length > 0 ? `
        <section class="home-section mt-8">
          <div class="section-header">
            <h2 class="section-title">Active Requests</h2>
            <span class="badge badge-accent">${activeRequests.length} active</span>
          </div>
          <div class="flex flex-col gap-3 stagger">
            ${activeRequests.map(req => renderRequestCard(req)).join('')}
          </div>
        </section>
      ` : ''}

      <!-- Recent History -->
      ${myRequests.length > 0 && activeRequests.length < myRequests.length ? `
        <section class="home-section mt-8">
          <div class="section-header">
            <h2 class="section-title">Recent History</h2>
          </div>
          <div class="flex flex-col gap-3 stagger">
            ${myRequests.filter(r => ['collected', 'rejected'].includes(r.status)).slice(0, 3).map(req => renderRequestCard(req)).join('')}
          </div>
        </section>
      ` : ''}

      ${myRequests.length === 0 ? `
        <div class="empty-state mt-8">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">Wala pa'y mga hangyo</div>
          <p class="text-sm text-secondary">Tap "Hangyo og Dokumento" para mag-submit og bag-ong request.</p>
        </div>
      ` : ''}
    </div>
  `;

  // Add home-specific styles
  addHomeStyles();

  // Bind events
  document.getElementById('action-request-doc')?.addEventListener('click', () => {
    window.location.hash = '#/request';
  });

  document.getElementById('action-track-status')?.addEventListener('click', () => {
    if (activeRequests.length > 0) {
      window.location.hash = `#/status/${activeRequests[0].id}`;
    } else {
      window.location.hash = '#/request';
    }
  });

  document.getElementById('action-sms-log')?.addEventListener('click', () => {
    window.location.hash = '#/sms-log';
  });

  // Bind request cards
  main.querySelectorAll('.request-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.hash = `#/status/${card.dataset.requestId}`;
    });
  });
}

function renderRequestCard(req) {
  const statusInfo = getStatusInfo(req.status);
  const docType = getDocumentTypeLabel(req.documentType);

  return `
    <div class="card card-interactive request-card animate-fade-in-up" data-request-id="${req.id}" style="padding: var(--space-4) var(--space-5);">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span style="font-size: 1.2rem;">${statusInfo.icon}</span>
          <div>
            <div class="font-semibold" style="font-size: var(--font-size-base);">${docType}</div>
            <div class="text-xs text-secondary">${req.referenceNumber} • ${formatTimeAgo(req.createdAt)}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="badge badge-${statusInfo.color}">${statusInfo.label}</span>
          ${req.isPriority ? '<span class="badge badge-priority">⚡ Priority</span>' : ''}
        </div>
      </div>
    </div>
  `;
}

function addHomeStyles() {
  if (document.getElementById('home-styles')) return;
  const style = document.createElement('style');
  style.id = 'home-styles';
  style.textContent = `
    .home-hero {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-8);
      padding: var(--space-8) var(--space-6);
      background: var(--gradient-surface);
      border-radius: var(--radius-2xl);
      border: 1px solid var(--border-subtle);
      position: relative;
      overflow: hidden;
    }

    .home-hero::before {
      content: '';
      position: absolute;
      top: -60%;
      right: -20%;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 201, 167, 0.08) 0%, transparent 70%);
      pointer-events: none;
    }

    .home-greeting-label {
      font-size: var(--font-size-lg);
      color: var(--text-secondary);
      font-weight: var(--font-weight-normal);
    }

    .home-greeting-name {
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-extrabold);
      background: var(--gradient-accent);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-top: var(--space-1);
    }

    .home-greeting-sub {
      margin-top: var(--space-3);
      font-size: var(--font-size-base);
      color: var(--text-secondary);
    }

    .home-philsys-badge {
      flex-shrink: 0;
    }

    .home-section {
      animation: fadeInUp 0.5s var(--ease-out) both;
    }

    @media (max-width: 768px) {
      .home-hero {
        flex-direction: column;
        gap: var(--space-4);
        padding: var(--space-6) var(--space-5);
      }

      .home-greeting-name {
        font-size: var(--font-size-3xl);
      }
    }
  `;
  document.head.appendChild(style);
}
