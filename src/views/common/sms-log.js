/* ============================================
   BarangayConnect — SMS Log View
   ============================================ */

import sms from '../../sms.js';
import { formatDateTime, formatTimeAgo, escapeHTML } from '../../utils.js';
import { t } from '../../i18n.js';

export async function renderSMSLog() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const log = await sms.getSMSLog();

  const badgeText = log.length === 1 
    ? t('smsLog.messagesSingular') 
    : t('smsLog.messagesPlural', { count: log.length });

  main.innerHTML = `
    <div class="sms-log-view animate-fade-in">
      <div class="form-back-row">
        <button class="btn btn-ghost btn-sm" id="sms-back-btn">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
          ${t('common.back')}
        </button>
      </div>

      <div class="section-header">
        <div>
          <h1 style="font-size: var(--font-size-3xl);">${t('smsLog.title')}</h1>
          <p class="text-secondary mt-1">${t('smsLog.subtitle')}</p>
        </div>
        <span class="badge badge-neutral">${badgeText}</span>
      </div>

      ${log.length > 0 ? `
        <div class="flex flex-col gap-3 mt-6 stagger">
          ${log.map(entry => `
            <div class="card animate-fade-in-up" style="padding: var(--space-4) var(--space-5);">
              <div class="flex items-center justify-between mb-2" style="flex-wrap: wrap; gap: var(--space-2);">
                <div class="flex items-center gap-2">
                  <span class="badge badge-system">${entry.type}</span>
                  <span class="font-medium text-sm">${escapeHTML(entry.recipientName)}</span>
                  <span class="text-xs text-tertiary">${entry.recipientPhone}</span>
                </div>
                <span class="text-xs text-tertiary">${formatTimeAgo(entry.sentAt)}</span>
              </div>
              <div class="text-sm" style="color: var(--text-secondary); line-height: 1.6; padding: var(--space-2) var(--space-3); background: var(--bg-surface); border-radius: var(--radius-md);">
                ${escapeHTML(entry.message)}
              </div>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-tertiary">${formatDateTime(entry.sentAt)}</span>
                <span class="badge badge-success text-xs">${t('smsLog.delivered')}</span>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="empty-state mt-8">
          <div class="empty-state-icon">📱</div>
          <div class="empty-state-title">${t('smsLog.emptyTitle')}</div>
          <p class="text-sm text-secondary">${t('smsLog.emptySub')}</p>
        </div>
      `}
    </div>
  `;

  // Add styles
  if (!document.getElementById('sms-log-styles')) {
    const style = document.createElement('style');
    style.id = 'sms-log-styles';
    style.textContent = `
      .sms-log-view {
        max-width: 720px;
        margin: 0 auto;
      }
    `;
    document.head.appendChild(style);
  }

  // Back button
  document.getElementById('sms-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#/';
  });
}
