/* ============================================
   BarangayConnect — App Entry Point
   ============================================ */

import store from './store.js';
import auth from './auth.js';
import offline from './offline.js';
import { renderNavbar } from './components/navbar.js';
import { renderOfflineBanner } from './components/offline-banner.js';
import { initRouter } from './router.js';

async function init() {
  try {
    console.log('[BarangayConnect] Initializing...');

    // 1. Open database
    await store.openDB();
    console.log('[BarangayConnect] Database ready');

    // 2. Seed demo data
    await store.seedDemoData();
    console.log('[BarangayConnect] Demo data seeded');

    // 3. Initialize auth
    await auth.init();
    console.log('[BarangayConnect] Auth ready —', auth.getCurrentUser()?.name);

    // 4. Initialize offline manager
    offline.init();
    console.log('[BarangayConnect] Offline manager ready');

    // 5. Render persistent UI
    renderNavbar();
    renderOfflineBanner();

    // 6. Re-render navbar on auth change
    auth.onAuthChange(() => {
      renderNavbar();
    });

    // 7. Re-render offline banner on status change
    offline.onStatusChange(() => {
      renderOfflineBanner();
    });

    // 8. Start router
    initRouter();
    console.log('[BarangayConnect] Router started');

    console.log('[BarangayConnect] ✅ App ready!');
  } catch (error) {
    console.error('[BarangayConnect] Init error:', error);
    document.getElementById('main-content').innerHTML = `
      <div class="empty-state" style="padding-top: 120px;">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-title">Something went wrong</div>
        <p class="text-sm text-secondary">${error.message}</p>
        <button class="btn btn-primary mt-4" onclick="window.location.reload()">Reload</button>
      </div>
    `;
  }
}

// Start the app
init();
