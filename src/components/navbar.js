/* ============================================
   BarangayConnect — Navbar Component
   ============================================ */

import auth from '../auth.js';

export function renderNavbar() {
  const root = document.getElementById('navbar-root');
  if (!root) return;

  const user = auth.getCurrentUser();
  const initials = auth.getUserInitials();
  const isOfficialUser = auth.isOfficial();

  root.innerHTML = `
    <nav class="navbar" id="main-navbar">
      <div class="navbar-inner">
        <a href="#/" class="navbar-brand" id="nav-home-link">
          <div class="navbar-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 64 64">
              <defs><linearGradient id="navg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00c9a7"/><stop offset="100%" stop-color="#0ea5e9"/></linearGradient></defs>
              <path d="M32 4 L56 16 V36 C56 48 44 58 32 62 C20 58 8 48 8 36 V16 Z" fill="url(#navg)" opacity="0.9"/>
              <rect x="24" y="26" width="16" height="20" rx="2" fill="#0f1b2d" opacity="0.8"/>
              <path d="M20 26 L32 18 L44 26 Z" fill="#0f1b2d" opacity="0.8"/>
              <circle cx="32" cy="22" r="2" fill="#fbbf24"/>
            </svg>
          </div>
          <span class="navbar-title">BarangayConnect</span>
        </a>

        <div class="navbar-actions">
          ${isOfficialUser ? `
            <a href="#/dashboard" class="navbar-link" id="nav-dashboard-link">Dashboard</a>
          ` : `
            <a href="#/" class="navbar-link" id="nav-home-nav-link">Home</a>
            <a href="#/sms-log" class="navbar-link" id="nav-sms-link">SMS Log</a>
          `}
          
          <div class="navbar-divider"></div>

          <div class="navbar-user" id="navbar-user-trigger">
            <div class="avatar">${initials}</div>
            <div class="navbar-user-info">
              <span class="navbar-user-name">${user ? user.name : 'Guest'}</span>
              <span class="navbar-user-role">${isOfficialUser ? user.officialTitle || 'Official' : 'Resident'}</span>
            </div>
            <svg class="navbar-chevron" width="12" height="12" viewBox="0 0 12 12"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
          </div>

          <div class="navbar-dropdown" id="navbar-dropdown">
            <div class="navbar-dropdown-header">Switch Account</div>
            <div id="navbar-user-list"></div>
          </div>
        </div>
      </div>
    </nav>
  `;

  // Add navbar styles if not present
  addNavbarStyles();

  // Load user list for dropdown
  loadUserList();

  // Toggle dropdown
  const trigger = document.getElementById('navbar-user-trigger');
  const dropdown = document.getElementById('navbar-dropdown');

  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    dropdown?.classList.remove('open');
  });
}

async function loadUserList() {
  const users = await auth.getAllUsers();
  const currentUser = auth.getCurrentUser();
  const list = document.getElementById('navbar-user-list');
  if (!list) return;

  list.innerHTML = users.map(u => `
    <button class="navbar-dropdown-item ${u.id === currentUser?.id ? 'active' : ''}" data-user-id="${u.id}" id="switch-user-${u.id}">
      <div class="avatar" style="width: 28px; height: 28px; font-size: 0.7rem;">${u.name.split(' ').map(p => p[0]).join('').substring(0, 2)}</div>
      <div>
        <div style="font-weight: 500; font-size: 0.8125rem;">${u.name}</div>
        <div style="font-size: 0.6875rem; color: var(--text-tertiary);">${u.role === 'official' ? u.officialTitle || 'Official' : 'Resident'}${u.isSenior ? ' • Senior' : ''}</div>
      </div>
      ${u.id === currentUser?.id ? '<span style="margin-left: auto; color: var(--color-accent-500); font-size: 0.75rem;">●</span>' : ''}
    </button>
  `).join('');

  // Add click handlers
  list.querySelectorAll('.navbar-dropdown-item').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.userId;
      await auth.switchUser(userId);
      window.location.hash = auth.isOfficial() ? '#/dashboard' : '#/';
      window.location.reload();
    });
  });
}

function addNavbarStyles() {
  if (document.getElementById('navbar-styles')) return;
  const style = document.createElement('style');
  style.id = 'navbar-styles';
  style.textContent = `
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--navbar-height);
      background: rgba(15, 27, 45, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-subtle);
      z-index: var(--z-sticky);
      animation: fadeInDown 0.4s var(--ease-out) both;
    }

    .navbar-inner {
      max-width: var(--max-width);
      margin: 0 auto;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-6);
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      text-decoration: none;
      color: var(--text-primary);
    }

    .navbar-logo {
      display: flex;
      align-items: center;
    }

    .navbar-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      letter-spacing: var(--letter-spacing-tight);
      background: var(--gradient-accent);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      position: relative;
    }

    .navbar-link {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-secondary);
      text-decoration: none;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      transition: all var(--duration-fast);
    }

    .navbar-link:hover {
      color: var(--text-primary);
      background: var(--bg-surface);
    }

    .navbar-divider {
      width: 1px;
      height: 24px;
      background: var(--border-default);
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      cursor: pointer;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-lg);
      transition: background var(--duration-fast);
    }

    .navbar-user:hover {
      background: var(--bg-surface);
    }

    .navbar-user-info {
      display: flex;
      flex-direction: column;
    }

    .navbar-user-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
    }

    .navbar-user-role {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
    }

    .navbar-chevron {
      color: var(--text-tertiary);
      transition: transform var(--duration-fast);
    }

    .navbar-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 260px;
      background: var(--color-primary-800);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all var(--duration-normal) var(--ease-out);
      overflow: hidden;
      z-index: var(--z-dropdown);
    }

    .navbar-dropdown.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .navbar-dropdown-header {
      padding: var(--space-3) var(--space-4);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      border-bottom: 1px solid var(--border-subtle);
    }

    .navbar-dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
      padding: var(--space-3) var(--space-4);
      background: none;
      border: none;
      color: var(--text-primary);
      cursor: pointer;
      text-align: left;
      font-family: var(--font-family);
      transition: background var(--duration-fast);
    }

    .navbar-dropdown-item:hover {
      background: var(--bg-surface);
    }

    .navbar-dropdown-item.active {
      background: rgba(0, 201, 167, 0.08);
    }

    @media (max-width: 768px) {
      .navbar-user-info { display: none; }
      .navbar-link { display: none; }
      .navbar-divider { display: none; }
    }
  `;
  document.head.appendChild(style);
}
