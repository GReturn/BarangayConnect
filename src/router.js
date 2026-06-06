/* ============================================
   BarangayConnect — Hash Router
   ============================================ */

import { renderHome } from './views/home.js';
import { renderRequestForm } from './views/request-form.js';
import { renderStatusTracker } from './views/status-tracker.js';
import { renderDashboard } from './views/dashboard.js';
import { renderReview } from './views/review.js';
import { renderSMSLog } from './views/sms-log.js';
import { renderProfile } from './views/profile.js';
import { renderSOSDispatch } from './views/sos-dispatch.js';
import { renderLedgerExplorer } from './views/ledger-explorer.js';
import { renderInsights } from './views/insights.js';
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
