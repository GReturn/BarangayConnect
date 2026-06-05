/* ============================================
   BarangayConnect — SLA Timer Component
   ============================================ */

import { getSLAInfo } from '../utils.js';

const activeTimers = new Map();

export function renderSLATimer(requestId, submittedAt, compact = false) {
  const sla = getSLAInfo(submittedAt);

  const urgencyColors = {
    normal: { text: 'var(--color-accent-400)', bg: 'rgba(0, 201, 167, 0.1)', border: 'rgba(0, 201, 167, 0.2)' },
    caution: { text: 'var(--color-warning-400)', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' },
    warning: { text: 'var(--color-warning-300)', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
    critical: { text: 'var(--color-error-400)', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' }
  };

  const colors = urgencyColors[sla.urgency] || urgencyColors.normal;

  if (compact) {
    return `<span class="sla-timer-compact" id="sla-${requestId}" data-submitted="${submittedAt}" style="color: ${colors.text}; font-size: var(--font-size-xs); font-weight: 600;">
      ${sla.expired ? '⚠️ Expired' : `⏱ ${sla.text}`}
    </span>`;
  }

  return `
    <div class="sla-timer" id="sla-${requestId}" data-submitted="${submittedAt}" style="background: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: var(--radius-lg); padding: var(--space-3) var(--space-4); display: inline-flex; align-items: center; gap: var(--space-2);">
      <span style="font-size: 1rem;">⏱</span>
      <div>
        <div style="font-size: var(--font-size-xs); color: var(--text-tertiary);">SLA Timer</div>
        <div style="font-size: var(--font-size-base); font-weight: 700; color: ${colors.text};" class="sla-value">
          ${sla.expired ? '⚠️ SLA expired — escalation triggered' : `Escalates to Vice-Captain in ${sla.text}`}
        </div>
      </div>
    </div>
  `;
}

// Start live updating all SLA timers on the page
export function startSLATimers() {
  // Clear previous interval if any
  stopSLATimers();

  const interval = setInterval(() => {
    document.querySelectorAll('[id^="sla-"]').forEach(el => {
      const submitted = el.dataset.submitted;
      if (!submitted) return;

      const sla = getSLAInfo(submitted);
      const valueEl = el.querySelector('.sla-value') || el;

      if (el.classList.contains('sla-timer-compact')) {
        valueEl.textContent = sla.expired ? '⚠️ Expired' : `⏱ ${sla.text}`;
      } else {
        const slaVal = el.querySelector('.sla-value');
        if (slaVal) {
          slaVal.textContent = sla.expired
            ? '⚠️ SLA expired — escalation triggered'
            : `Escalates to Vice-Captain in ${sla.text}`;
        }
      }
    });
  }, 30000); // Update every 30 seconds

  activeTimers.set('global', interval);
}

export function stopSLATimers() {
  activeTimers.forEach((interval) => clearInterval(interval));
  activeTimers.clear();
}
