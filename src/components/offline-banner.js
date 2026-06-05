/* ============================================
   BarangayConnect — Offline Banner Component
   ============================================ */

import offline from '../offline.js';

let bannerElement = null;

export function renderOfflineBanner() {
  const root = document.getElementById('offline-banner-root');
  if (!root) return;

  updateBanner(root);

  offline.onStatusChange(() => updateBanner(root));
}

async function updateBanner(root) {
  const isOnline = offline.getStatus();

  if (isOnline) {
    if (bannerElement) {
      bannerElement.classList.add('hiding');
      setTimeout(() => {
        root.innerHTML = '';
        bannerElement = null;
        document.getElementById('main-content')?.classList.remove('has-banner');
      }, 400);
    }
    return;
  }

  const queuedCount = await offline.getQueuedCount();

  root.innerHTML = `
    <div class="offline-banner" id="offline-banner">
      <div class="offline-banner-inner">
        <div class="offline-banner-content">
          <span class="offline-banner-dot"></span>
          <span class="offline-banner-icon">📡</span>
          <span class="offline-banner-text">
            Offline — ${queuedCount > 0 ? `${queuedCount} submission${queuedCount > 1 ? 's' : ''} queued` : 'walay internet connection'}
          </span>
        </div>
        <div class="offline-banner-ble">
          <span class="spinner" style="width: 12px; height: 12px; border-width: 1.5px;"></span>
          <span>BLE mesh scanning…</span>
        </div>
      </div>
    </div>
  `;

  bannerElement = document.getElementById('offline-banner');
  document.getElementById('main-content')?.classList.add('has-banner');

  addBannerStyles();
}

function addBannerStyles() {
  if (document.getElementById('offline-banner-styles')) return;
  const style = document.createElement('style');
  style.id = 'offline-banner-styles';
  style.textContent = `
    .offline-banner {
      position: fixed;
      top: var(--navbar-height);
      left: 0;
      right: 0;
      height: var(--banner-height);
      background: linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.12) 100%);
      border-bottom: 1px solid rgba(245, 158, 11, 0.2);
      z-index: var(--z-banner);
      animation: fadeInDown 0.4s var(--ease-out) both;
      display: flex;
      align-items: center;
    }

    .offline-banner.hiding {
      animation: fadeOut 0.3s var(--ease-out) both;
    }

    @keyframes fadeOut {
      to { opacity: 0; transform: translateY(-100%); }
    }

    .offline-banner-inner {
      max-width: var(--max-width);
      margin: 0 auto;
      width: 100%;
      padding: 0 var(--space-6);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .offline-banner-content {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-warning-300);
    }

    .offline-banner-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-warning-500);
      animation: pulse 2s ease-in-out infinite;
    }

    .offline-banner-icon {
      font-size: 1rem;
    }

    .offline-banner-ble {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--color-warning-400);
      opacity: 0.7;
    }

    @media (max-width: 640px) {
      .offline-banner-ble { display: none; }
    }
  `;
  document.head.appendChild(style);
}
