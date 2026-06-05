/* ============================================
   BarangayConnect — Navbar & Bottom Nav Component
   ============================================ */

import auth from '../auth.js';

export function renderNavbar() {
  const root = document.getElementById('navbar-root');
  if (!root) return;

  const user = auth.getCurrentUser();
  const initials = auth.getUserInitials();
  const isOfficialUser = auth.isOfficial();

  const currentHash = window.location.hash || '#/';
  const isSubPage = !['#/', '#', '#/dashboard'].includes(currentHash);

  // Define dynamic header and bottom bar HTML
  root.innerHTML = `
    <!-- Top Header -->
    <nav class="navbar ${isOfficialUser ? 'navbar-official' : 'navbar-resident'}" id="main-navbar">
      <div class="navbar-inner">
        <div class="navbar-left">
          ${isSubPage ? `
            <button class="nav-btn nav-back-btn" id="nav-back-button" aria-label="Go back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
          ` : `
            <button class="nav-btn nav-menu-btn" aria-label="Menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          `}
        </div>

        <div class="navbar-center">
          <span class="navbar-title-text">
            ${isOfficialUser ? 'Official Portal' : 'BarangayConnect'}
          </span>
        </div>

        <div class="navbar-right">
          <div class="navbar-avatar-trigger" id="navbar-user-trigger">
            <div class="avatar-circle">${initials}</div>
          </div>
          
          <div class="navbar-dropdown" id="navbar-dropdown">
            <div class="navbar-dropdown-header">Switch Account</div>
            <div id="navbar-user-list"></div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Bottom Navigation Bar -->
    <div class="bottom-nav ${isOfficialUser ? 'bottom-nav-official' : 'bottom-nav-resident'}">
      ${isOfficialUser ? `
        <!-- Official Bottom Nav -->
        <a href="#/dashboard" class="bottom-nav-tab" id="tab-official-home">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span class="bottom-nav-label">Home</span>
        </a>
        <a href="#/dashboard" class="bottom-nav-tab" id="tab-official-requests">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="bottom-nav-label">Requests</span>
        </a>
        <a href="#/sms-log" class="bottom-nav-tab" id="tab-official-logs">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <span class="bottom-nav-label">Logs</span>
        </a>
        <button class="bottom-nav-tab btn-reset-tab" id="tab-official-profile">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span class="bottom-nav-label">Profile</span>
        </button>
      ` : `
        <!-- Resident Bottom Nav -->
        <a href="#/" class="bottom-nav-tab" id="tab-resident-home">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span class="bottom-nav-label">Balay / Home</span>
        </a>
        <a href="#/request" class="bottom-nav-tab" id="tab-resident-requests">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="bottom-nav-label">Mga Hangyo</span>
        </a>
        <a href="#/sms-log" class="bottom-nav-tab" id="tab-resident-bulletin">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M12 9v4"></path><path d="M12 16v.01"></path></svg>
          <span class="bottom-nav-label">Pahibalo</span>
        </a>
        <button class="bottom-nav-tab btn-reset-tab" id="tab-resident-profile">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span class="bottom-nav-label">Akawnt</span>
        </button>
      `}
    </div>
  `;

  // Bind back button
  document.getElementById('nav-back-button')?.addEventListener('click', () => {
    window.location.hash = isOfficialUser ? '#/dashboard' : '#/';
  });

  // Add styles
  addNavbarStyles();
  loadUserList();

  // Toggle user list dropdown
  const trigger = document.getElementById('navbar-user-trigger');
  const profileTab = document.getElementById(isOfficialUser ? 'tab-official-profile' : 'tab-resident-profile');
  const dropdown = document.getElementById('navbar-dropdown');

  const toggleDropdown = (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  };

  trigger?.addEventListener('click', toggleDropdown);
  profileTab?.addEventListener('click', toggleDropdown);

  document.addEventListener('click', () => {
    dropdown?.classList.remove('open');
  });

  // Track and update active tab classes
  updateActiveTab(isOfficialUser, currentHash);
}

function updateActiveTab(isOfficialUser, currentHash) {
  // Clear active classes
  document.querySelectorAll('.bottom-nav-tab').forEach(tab => tab.classList.remove('active'));

  if (isOfficialUser) {
    if (currentHash.startsWith('#/dashboard')) {
      document.getElementById('tab-official-home')?.classList.add('active');
      document.getElementById('tab-official-requests')?.classList.add('active');
    } else if (currentHash.startsWith('#/sms-log')) {
      document.getElementById('tab-official-logs')?.classList.add('active');
    } else if (currentHash.startsWith('#/review')) {
      document.getElementById('tab-official-requests')?.classList.add('active');
    }
  } else {
    if (currentHash === '#/' || currentHash === '#') {
      document.getElementById('tab-resident-home')?.classList.add('active');
    } else if (currentHash.startsWith('#/request') || currentHash.startsWith('#/status')) {
      document.getElementById('tab-resident-requests')?.classList.add('active');
    } else if (currentHash.startsWith('#/sms-log')) {
      document.getElementById('tab-resident-bulletin')?.classList.add('active');
    }
  }
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
        <div style="font-weight: 500; font-size: 0.8125rem; color: #111827;">${u.name}</div>
        <div style="font-size: 0.6875rem; color: var(--text-tertiary);">${u.role === 'official' ? u.officialTitle || 'Official' : 'Resident'}${u.isSenior ? ' • Senior' : ''}</div>
      </div>
      ${u.id === currentUser?.id ? '<span style="margin-left: auto; color: var(--color-accent-500); font-size: 0.75rem;">●</span>' : ''}
    </button>
  `).join('');

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
      position: sticky;
      top: 0;
      width: 100%;
      height: 54px;
      z-index: var(--z-sticky);
      border-bottom: 1px solid var(--border-default);
      transition: all 0.3s;
    }

    .navbar-resident {
      background: #ffffff;
      color: #0f4c81;
    }

    .navbar-official {
      background: #0e3e7d;
      color: #ffffff;
      border-bottom: none;
    }

    .navbar-inner {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-4);
    }

    .navbar-left, .navbar-right {
      display: flex;
      align-items: center;
      width: 44px;
    }

    .navbar-right {
      justify-content: flex-end;
      position: relative;
    }

    .navbar-center {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .navbar-title-text {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-bold);
      letter-spacing: var(--letter-spacing-tight);
    }

    .navbar-official .navbar-title-text {
      color: #ffffff;
    }

    .nav-btn {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-2);
      border-radius: var(--radius-full);
      transition: background 0.2s;
    }

    .nav-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .navbar-official .nav-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .navbar-avatar-trigger {
      cursor: pointer;
    }

    .avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--gradient-accent);
      color: var(--text-on-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: var(--font-size-sm);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    /* Bottom Nav Styles */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 480px;
      height: 64px;
      background: #ffffff;
      border-top: 1px solid var(--border-default);
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: var(--z-sticky);
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.04);
      padding-bottom: env(safe-area-inset-bottom);
    }

    .bottom-nav-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      text-decoration: none;
      font-size: 10px;
      font-weight: 500;
      gap: 3px;
      flex: 1;
      height: 100%;
      border: none;
      background: none;
      cursor: pointer;
      font-family: var(--font-family);
      transition: color 0.2s;
    }

    .btn-reset-tab {
      padding: 0;
      margin: 0;
    }

    .bottom-nav-tab.active {
      color: #0f4c81;
    }

    .bottom-nav-tab:hover {
      color: #0f4c81;
    }

    .bottom-nav-label {
      font-size: 10px;
    }

    /* Dropdown Switcher */
    .navbar-dropdown {
      position: absolute;
      top: 40px;
      right: 0;
      width: 260px;
      background: #ffffff;
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
      color: #1f2937;
      cursor: pointer;
      text-align: left;
      font-family: var(--font-family);
      transition: background var(--duration-fast);
    }

    .navbar-dropdown-item:hover {
      background: #f3f4f6;
    }

    .navbar-dropdown-item.active {
      background: rgba(15, 76, 129, 0.08);
    }
  `;
  document.head.appendChild(style);
}

// Re-render navbar on hashchange to trigger subpage back button and active tabs
window.addEventListener('hashchange', () => {
  renderNavbar();
});
