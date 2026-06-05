/* ============================================
   BarangayConnect — Toast Notification Component
   ============================================ */

const TOAST_CONTAINER_ID = 'toast-container';

function ensureContainer() {
  let container = document.getElementById(TOAST_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = TOAST_CONTAINER_ID;
    container.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: var(--z-toast, 600);
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 380px;
      width: 100%;
      pointer-events: none;
    `;
    const root = document.getElementById('toast-root') || document.body;
    root.appendChild(container);
  }
  return container;
}

export function showToast({ type = 'info', title, message, duration = 5000 }) {
  const container = ensureContainer();

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    sms: '📱'
  };

  const colors = {
    success: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', accent: '#10b981' },
    error: { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', accent: '#ef4444' },
    warning: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', accent: '#f59e0b' },
    info: { bg: 'rgba(0, 201, 167, 0.12)', border: 'rgba(0, 201, 167, 0.3)', accent: '#00c9a7' },
    sms: { bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)', accent: '#8b5cf6' }
  };

  const color = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.style.cssText = `
    background: ${color.bg};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${color.border};
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    pointer-events: auto;
    cursor: pointer;
    animation: fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    transition: opacity 0.3s, transform 0.3s;
  `;

  toast.innerHTML = `
    <span style="font-size: 1.2rem; line-height: 1; flex-shrink: 0;">${icons[type] || icons.info}</span>
    <div style="flex: 1; min-width: 0;">
      ${title ? `<div style="font-size: 0.8125rem; font-weight: 600; color: ${color.accent}; margin-bottom: 2px;">${title}</div>` : ''}
      <div style="font-size: 0.8125rem; color: rgba(255,255,255,0.8); line-height: 1.4;">${message}</div>
    </div>
    <button style="background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 1rem; padding: 0; line-height: 1; flex-shrink: 0;" aria-label="Close notification">&times;</button>
  `;

  // Close on click
  toast.addEventListener('click', () => dismissToast(toast));

  container.appendChild(toast);

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(() => dismissToast(toast), duration);
  }

  return toast;
}

function dismissToast(toast) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(100%)';
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 300);
}
