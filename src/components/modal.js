/* ============================================
   BarangayConnect — Modal Component
   ============================================ */

let activeModal = null;

export function showModal({ title, body, actions = [], type = 'default', onClose = null }) {
  closeModal(); // Close any existing modal

  const modalRoot = document.getElementById('modal-root') || document.body;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'modal-backdrop';

  const typeColors = {
    default: 'var(--color-accent-500)',
    warning: 'var(--color-warning-500)',
    danger: 'var(--color-error-500)',
    success: 'var(--color-success-500)'
  };

  const accentColor = typeColors[type] || typeColors.default;

  backdrop.innerHTML = `
    <div class="modal-container" id="modal-container">
      <div class="modal-accent-bar" style="background: ${accentColor}"></div>
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close-btn" id="modal-close-btn" aria-label="Close modal">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="modal-body">${body}</div>
      ${actions.length > 0 ? `
        <div class="modal-actions">
          ${actions.map((action, i) => `
            <button class="btn ${action.class || 'btn-ghost'}" id="modal-action-${i}" data-action-index="${i}">
              ${action.label}
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  modalRoot.appendChild(backdrop);
  activeModal = backdrop;

  // Animate in
  requestAnimationFrame(() => {
    backdrop.classList.add('open');
  });

  // Bind close
  document.getElementById('modal-close-btn')?.addEventListener('click', () => {
    closeModal();
    if (onClose) onClose();
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closeModal();
      if (onClose) onClose();
    }
  });

  // Bind actions
  actions.forEach((action, i) => {
    document.getElementById(`modal-action-${i}`)?.addEventListener('click', () => {
      if (action.onClick) action.onClick();
      if (action.closeOnClick !== false) closeModal();
    });
  });

  // ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      if (onClose) onClose();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  addModalStyles();
}

export function closeModal() {
  if (activeModal) {
    activeModal.classList.remove('open');
    setTimeout(() => {
      if (activeModal && activeModal.parentNode) {
        activeModal.parentNode.removeChild(activeModal);
      }
      activeModal = null;
    }, 300);
  }
}

function addModalStyles() {
  if (document.getElementById('modal-styles')) return;
  const style = document.createElement('style');
  style.id = 'modal-styles';
  style.textContent = `
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal-backdrop, 400);
      opacity: 0;
      transition: opacity 0.3s var(--ease-out);
      padding: var(--space-4);
    }

    .modal-backdrop.open {
      opacity: 1;
    }

    .modal-container {
      background: #ffffff;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-xl);
      max-width: 400px;
      width: 90%;
      overflow: hidden;
      transform: scale(0.95) translateY(8px);
      transition: transform 0.3s var(--ease-spring);
    }

    .modal-backdrop.open .modal-container {
      transform: scale(1) translateY(0);
    }

    .modal-accent-bar {
      height: 3px;
      width: 100%;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-5) var(--space-6) var(--space-2);
    }

    .modal-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
    }

    .modal-close-btn {
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      transition: all var(--duration-fast);
      display: flex;
    }

    .modal-close-btn:hover {
      background: var(--bg-surface);
      color: var(--text-primary);
    }

    .modal-body {
      padding: var(--space-4) var(--space-6);
      font-size: var(--font-size-base);
      color: var(--text-secondary);
      line-height: var(--line-height-relaxed);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6) var(--space-5);
    }
  `;
  document.head.appendChild(style);
}
