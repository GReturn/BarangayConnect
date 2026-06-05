/* ============================================
   BarangayConnect — Home View (Resident)
   ============================================ */

import auth from '../auth.js';
import store from '../store.js';
import offline from '../offline.js';
import { formatTimeAgo, getStatusInfo, getDocumentTypeLabel, generateQRCodeSVG } from '../utils.js';
import { showModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

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

  // Define static/mock bulletin news items based on online status
  const newsItems = isOnline ? [
    {
      tag: 'Health',
      title: 'Libre nga Medical Mission karong Sabado',
      desc: 'Pag-andam sa inyong mga record para sa libre nga check-up sa Barangay Hall...',
      imageBg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
      imageEmoji: '🏥'
    },
    {
      tag: 'Public Works',
      title: 'Pag-ayo sa Dalan sa Purok 5',
      desc: 'Temporaryo nga sirado ang dalan sugod ugma para sa pag-aspalto...',
      imageBg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      imageEmoji: '🚧'
    }
  ] : [
    {
      tag: 'Community',
      title: 'Oplan Limpyo sa Sitio Mahayahay',
      desc: 'Nagkahiusa ang mga lumulupyo para sa paghinlo sa atong komunidad karong Sabado...',
      imageBg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      imageEmoji: '🧹'
    },
    {
      tag: 'Public Works',
      title: 'Libreng Bakuna sa Barangay Hall',
      desc: 'Hulat sa pag-sync (Waiting to sync...)',
      imageBg: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      imageEmoji: '💉',
      isPendingSync: true
    }
  ];

  main.innerHTML = `
    <div class="home-view animate-fade-in">
      
      <!-- Offline Banner (within Home View if queued) -->
      ${!isOnline ? `
        <div class="home-offline-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.83-2.84M8.59 16.11a6 6 0 0 1 5.68-1.4M12 20h.01"></path></svg>
          <span>Offline — ${queuedCount} submission${queuedCount !== 1 ? 's' : ''} queued</span>
        </div>
      ` : ''}

      <!-- Hero Greeting -->
      <div class="home-hero">
        <div class="home-hero-bg-building">
          <svg viewBox="0 0 100 60" width="100" height="60" opacity="0.15" fill="currentColor">
            <path d="M10 50h80V25L50 5 10 25v25zm15-10h12V28H25v12zm38 0h12V28H63v12zm-19 0h10V30H44v10zM5 50h90v5H5z"/>
          </svg>
        </div>
        <div class="home-greeting">
          <span class="home-greeting-label">${greeting}!</span>
          <h1 class="home-greeting-name">${user ? user.name : 'Residente'}</h1>
        </div>
        ${user?.philsysVerified ? `
          <div class="home-philsys-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>Verified Resident</span>
          </div>
        ` : ''}
      </div>

      <!-- Section Title: Serbisyo -->
      <div class="section-header-compact">
        <h2 class="section-title-compact">Paspas nga Serbisyo</h2>
        <span class="section-subtitle-compact">Quick Actions</span>
      </div>

      <!-- Quick Actions Grid -->
      <div class="quick-actions-grid">
        <div class="quick-action-card" id="action-request-doc">
          <div class="quick-action-icon-wrapper blue-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <div class="quick-action-texts">
            <div class="quick-action-title">Hangyo og Dokumento</div>
            <div class="quick-action-subtitle">Request Document</div>
          </div>
        </div>

        <div class="quick-action-card" id="action-track-status">
          <div class="quick-action-icon-wrapper blue-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
          </div>
          <div class="quick-action-texts">
            <div class="quick-action-title">Subaya ang Status</div>
            <div class="quick-action-subtitle">Track Status</div>
          </div>
        </div>

        <div class="quick-action-card" id="action-barangay-id">
          <div class="quick-action-icon-wrapper gray-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="7" y1="8" x2="17" y2="8"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="7" y1="16" x2="12" y2="16"></line></svg>
          </div>
          <div class="quick-action-texts">
            <div class="quick-action-title">Barangay ID</div>
            <div class="quick-action-subtitle">Digital ID Card</div>
          </div>
        </div>

        <div class="quick-action-card emergency-card" id="action-emergency">
          <div class="quick-action-icon-wrapper red-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.59 16.11a6 6 0 0 1 6.82 0M12 20h.01"></path></svg>
          </div>
          <div class="quick-action-texts">
            <div class="quick-action-title">Emergency</div>
            <div class="quick-action-subtitle">Immediate Help</div>
          </div>
        </div>
      </div>

      <!-- Active Requests (Feed Style) -->
      ${activeRequests.length > 0 ? `
        <div class="section-header-compact">
          <h2 class="section-title-compact">Bag-ong Balita</h2>
          <span class="section-subtitle-compact">Recent Updates</span>
        </div>
        <div class="news-feed-list stagger">
          ${activeRequests.map(req => renderRequestFeedItem(req)).join('')}
        </div>
      ` : ''}

      <!-- Section Title: News Bulletin -->
      <div class="section-header-compact mt-6">
        <h2 class="section-title-compact">${isOnline ? 'Bag-ong Pahibalo' : 'Bag-ong Balita'}</h2>
        <a href="#/sms-log" class="section-action-link">Tan-awa Tanan</a>
      </div>

      <!-- Announcements List -->
      <div class="announcements-list stagger">
        ${newsItems.map(item => `
          <div class="news-bulletin-card card">
            <div class="news-bulletin-image" style="background: ${item.imageBg}">
              <span class="news-bulletin-emoji">${item.imageEmoji}</span>
              ${item.isPendingSync ? `
                <div class="sync-badge">
                  <svg class="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                  <span>Syncing...</span>
                </div>
              ` : ''}
            </div>
            <div class="news-bulletin-content">
              <span class="news-bulletin-tag ${item.isPendingSync ? 'tag-warning' : 'tag-info'}">${item.tag.toUpperCase()}</span>
              <h3 class="news-bulletin-title">${item.title}</h3>
              <p class="news-bulletin-desc">${item.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;

  // Bind style triggers
  addHomeStyles();

  // Bind quick action click handlers
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

  document.getElementById('action-barangay-id')?.addEventListener('click', () => {
    showBarangayIDModal(user);
  });

  document.getElementById('action-emergency')?.addEventListener('click', () => {
    showEmergencyModal();
  });

  // Bind active request cards to status pages
  main.querySelectorAll('.news-feed-item').forEach(item => {
    item.addEventListener('click', () => {
      window.location.hash = `#/status/${item.dataset.requestId}`;
    });
  });
}

function renderRequestFeedItem(req) {
  const statusInfo = getStatusInfo(req.status);
  const docType = getDocumentTypeLabel(req.documentType);
  const timeLabel = formatTimeAgo(req.createdAt);

  return `
    <div class="news-feed-item animate-fade-in-up" data-request-id="${req.id}">
      <div class="news-feed-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
      </div>
      <div class="news-feed-content">
        <div class="news-feed-title-row">
          <span class="news-feed-title">${docType} — <strong class="status-${statusInfo.color}">${statusInfo.label.toUpperCase()}</strong></span>
          <span class="news-feed-time">${timeLabel}</span>
        </div>
      </div>
      <div class="news-feed-arrow">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
    </div>
  `;
}

function showBarangayIDModal(user) {
  if (!user) return;
  const qrCodeSvg = generateQRCodeSVG(user.philsysId || 'BRGY-CONNECT', 120);

  showModal({
    title: 'Digital Barangay ID',
    type: 'default',
    body: `
      <div class="digital-id-card">
        <div class="id-card-header">
          <div class="id-card-logo">🏠</div>
          <div class="id-card-title">
            <span class="id-card-title-main">BARANGAY GUADALUPE</span>
            <span class="id-card-title-sub">Official Digital Resident Card</span>
          </div>
        </div>
        <div class="id-card-body">
          <div class="id-card-avatar">${user.name.split(' ').map(p => p[0]).join('').substring(0, 2)}</div>
          <div class="id-card-info">
            <div class="id-card-info-item">
              <span class="id-label">FULL NAME</span>
              <span class="id-val">${user.name}</span>
            </div>
            <div class="id-card-info-item">
              <span class="id-label">RESIDENT ID</span>
              <span class="id-val" style="font-family: monospace;">${user.id.toUpperCase()}</span>
            </div>
            <div class="id-card-info-item">
              <span class="id-label">ADDRESS</span>
              <span class="id-val">${user.address}</span>
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
    `,
    actions: [{ label: 'Close', class: 'btn-primary' }]
  });

  // Inject digital ID card CSS if not already there
  if (!document.getElementById('id-card-styles')) {
    const style = document.createElement('style');
    style.id = 'id-card-styles';
    style.textContent = `
      .digital-id-card {
        background: linear-gradient(135deg, #0e3e7d 0%, #1e40af 100%);
        color: #ffffff;
        border-radius: var(--radius-xl);
        padding: var(--space-4);
        box-shadow: var(--shadow-lg);
        display: flex;
        flex-direction: column;
        gap: 16px;
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
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #ffffff;
        color: #0e3e7d;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 800;
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
    `;
    document.head.appendChild(style);
  }
}

function showEmergencyModal() {
  showModal({
    title: 'Trigger Emergency SOS?',
    type: 'danger',
    body: `
      <p>This action will broadcast an **Immediate Help SOS** signal to Barangay Guadalupe response units.</p>
      <p style="margin-top: 10px; color: var(--color-error-500); font-weight: 600;">⚠️ Abuse of this system is strictly prohibited by law.</p>
    `,
    actions: [
      { label: 'Cancel', class: 'btn-ghost' },
      {
        label: '🚨 Call SOS Help',
        class: 'btn-danger',
        onClick: () => {
          showToast({
            type: 'error',
            title: 'Emergency Signal Sent!',
            message: 'Response team dispatched. Please stay where you are.',
            duration: 8000
          });
        }
      }
    ]
  });
}

function addHomeStyles() {
  if (document.getElementById('home-styles')) return;
  const style = document.createElement('style');
  style.id = 'home-styles';
  style.textContent = `
    .home-offline-bar {
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
    
    .home-hero {
      background: linear-gradient(135deg, #0e3e7d 0%, #1d4ed8 100%);
      color: #ffffff;
      padding: var(--space-5);
      border-radius: var(--radius-xl);
      position: relative;
      overflow: hidden;
      margin-bottom: var(--space-5);
      box-shadow: 0 4px 12px rgba(15, 76, 129, 0.15);
    }
    
    .home-hero-bg-building {
      position: absolute;
      bottom: 8px;
      right: 12px;
      color: #ffffff;
    }
    
    .home-greeting-label {
      font-size: var(--font-size-sm);
      opacity: 0.9;
      display: block;
      margin-bottom: 2px;
    }
    
    .home-greeting-name {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    
    .home-philsys-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.18);
      padding: 4px 8px;
      border-radius: var(--radius-full);
      font-size: 10px;
      font-weight: 600;
      margin-top: 12px;
      backdrop-filter: blur(4px);
    }

    .section-header-compact {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 12px;
    }

    .section-title-compact {
      font-size: var(--font-size-md);
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .section-subtitle-compact {
      font-size: 11px;
      color: var(--text-tertiary);
    }

    .section-action-link {
      font-size: 11px;
      font-weight: 600;
      color: #0f4c81;
    }

    /* Quick Actions */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }
    
    .quick-action-card {
      background: #ffffff;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .quick-action-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border-color: var(--border-strong);
    }
    
    .quick-action-icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .quick-action-icon-wrapper.blue-bg {
      background: rgba(15, 76, 129, 0.08);
      color: #0f4c81;
    }
    
    .quick-action-icon-wrapper.gray-bg {
      background: rgba(107, 114, 128, 0.08);
      color: #4b5563;
    }
    
    .quick-action-icon-wrapper.red-bg {
      background: rgba(239, 68, 68, 0.08);
      color: #ef4444;
    }
    
    .emergency-card:hover {
      border-color: #fca5a5;
      background: #fef2f2;
    }
    
    .quick-action-texts {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .quick-action-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: #1f2937;
    }
    
    .quick-action-subtitle {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
    }

    /* Request Feed */
    .news-feed-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-6);
    }

    .news-feed-item {
      background: #ffffff;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: var(--space-3) var(--space-4);
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .news-feed-item:hover {
      border-color: var(--border-strong);
      background: #f9fafb;
    }
    
    .news-feed-icon {
      color: #0f4c81;
      display: flex;
      align-items: center;
    }
    
    .news-feed-content {
      flex: 1;
    }
    
    .news-feed-title-row {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .news-feed-title {
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: #1f2937;
    }
    
    .news-feed-title strong.status-success { color: #059669; }
    .news-feed-title strong.status-warning { color: #d97706; }
    .news-feed-title strong.status-accent { color: #0f4c81; }
    .news-feed-title strong.status-system { color: #7c3aed; }
    .news-feed-title strong.status-error { color: #dc2626; }
    
    .news-feed-time {
      font-size: 10px;
      color: var(--text-tertiary);
    }
    
    .news-feed-arrow {
      color: var(--text-tertiary);
    }

    /* Announcements Bulletin */
    .announcements-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .news-bulletin-card {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border-default);
    }

    .news-bulletin-image {
      height: 120px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .news-bulletin-emoji {
      font-size: 36px;
    }

    .news-bulletin-content {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .news-bulletin-tag {
      align-self: flex-start;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
    }

    .tag-info {
      background: rgba(15, 76, 129, 0.08);
      color: #0f4c81;
    }

    .tag-warning {
      background: rgba(120, 53, 15, 0.08);
      color: #78350f;
    }

    .news-bulletin-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      color: #1f2937;
      margin: 0;
    }

    .news-bulletin-desc {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      line-height: var(--line-height-normal);
      margin: 0;
    }

    .sync-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(120, 53, 15, 0.12);
      color: #78350f;
      padding: 3px 6px;
      border-radius: var(--radius-sm);
      font-size: 9px;
      font-weight: 600;
    }
  `;
  document.head.appendChild(style);
}
