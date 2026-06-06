/* ============================================
   BarangayConnect — Hash Router
   ============================================ */

import { renderHome } from './views/resident/home.js';
import { renderRequestForm } from './views/resident/request-form.js';
import { renderStatusTracker } from './views/resident/status-tracker.js';
import { renderDashboard } from './views/official/dashboard.js';
import { renderReview } from './views/official/review.js';
import { renderSMSLog } from './views/common/sms-log.js';
import { renderProfile } from './views/common/profile.js';
import { renderSOSDispatch } from './views/official/sos-dispatch.js';
import { renderLedgerExplorer } from './views/common/ledger-explorer.js';
import { renderInsights } from './views/official/insights.js';
import { renderBulletin } from './views/common/bulletin.js';
import { stopSLATimers } from './components/sla-timer.js';

const routes = [
  { pattern: /^#?\/?$/, handler: () => renderHome() },
  { pattern: /^#\/request$/, handler: () => renderRequestForm() },
  { pattern: /^#\/status\/(.+)$/, handler: (match) => renderStatusTracker(match[1]) },
  { pattern: /^#\/dashboard$/, handler: () => renderDashboard() },
  { pattern: /^#\/review\/(.+)$/, handler: (match) => renderReview(match[1]) },
  { pattern: /^#\/sms-log$/, handler: () => renderSMSLog() },
  { pattern: /^#\/profile$/, handler: () => renderProfile() },
  { pattern: /^#\/sos-dispatch$/, handler: () => renderSOSDispatch() },
  { pattern: /^#\/ledger-explorer$/, handler: () => renderLedgerExplorer() },
  { pattern: /^#\/insights$/, handler: () => renderInsights() },
  { pattern: /^#\/bulletin$/, handler: () => renderBulletin() },
];

function navigateTo(hash) {
  // Stop any running timers from previous page
  stopSLATimers();

  const normalizedHash = hash || '#/';

  for (const route of routes) {
    const match = normalizedHash.match(route.pattern);
    if (match) {
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });
      route.handler(match);
      return;
    }
  }

  // 404 — default to home
  renderHome();
}

export function initRouter() {
  // Handle hash changes
  window.addEventListener('hashchange', () => {
    navigateTo(window.location.hash);
  });

  // Initial navigation
  navigateTo(window.location.hash);
}

export default initRouter;
