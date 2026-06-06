/* ============================================
   BarangayConnect — Navbar & Bottom Nav Component
   ============================================ */

import auth from '../auth.js';
import { t, getLocale, setLocale } from '../i18n.js';
import offline from '../offline.js';

export function renderNavbar() {
  const root = document.getElementById('navbar-root');
  if (!root) return;

  const user = auth.getCurrentUser();
  const initials = auth.getUserInitials();
  const isOfficialUser = auth.isOfficial();

  const currentHash = window.location.hash || '#/';
  const isSubPage = !['#/', '#', '#/dashboard'].includes(currentHash);

  // Define dynamic header, bottom bar, and sidebar drawer HTML
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
            <button class="nav-btn nav-menu-btn" id="nav-hamburger-button" aria-label="Menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          `}
        </div>

        <div class="navbar-center">
          <span class="navbar-title-text">
            ${isOfficialUser ? t('navbar.titleOfficial') : t('navbar.titleResident')}
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

    <!-- Sidebar Navigation Drawer Overlay -->
    <div class="drawer-backdrop" id="nav-drawer-backdrop"></div>
    <div class="nav-drawer" id="nav-drawer">
      <div class="drawer-header">
        <div class="drawer-user-info">
          <div class="avatar avatar-lg" style="color: var(--text-on-accent); background: var(--gradient-accent); border: 2px solid rgba(255,255,255,0.2);">${initials}</div>
          <div class="user-details">
            <h4 class="drawer-user-name" style="margin: 0; font-size: 0.95rem; font-weight: 600;">${user?.name || ''}</h4>
            <span class="badge ${isOfficialUser ? 'badge-accent' : 'badge-success'}" style="margin-top: 4px; padding: 2px 8px; font-size: 0.65rem;">
              ${isOfficialUser ? user?.officialTitle || t('common.official') : t('common.resident')}
            </span>
          </div>
        </div>
        <button class="drawer-close-btn" id="nav-drawer-close" aria-label="Close menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="drawer-body">
        <div class="drawer-section">
          <div class="drawer-section-title">${t('navbar.activeProfile')}</div>
          <nav class="drawer-nav">
            ${isOfficialUser ? `
              <!-- Official Menu Options -->
              <a href="#/dashboard" class="drawer-nav-item" id="drawer-link-home">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span>${t('navbar.officialHome')}</span>
              </a>
              <a href="#/sos-dispatch" class="drawer-nav-item" id="drawer-link-sos">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
                <span>${t('navbar.sosDispatch')}</span>
              </a>
              <a href="#/insights" class="drawer-nav-item" id="drawer-link-insights">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                <span>${t('navbar.insights')}</span>
              </a>
              <a href="#/sms-log" class="drawer-nav-item" id="drawer-link-sms">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span>${t('navbar.officialLogs')}</span>
              </a>
            ` : `
              <!-- Resident Menu Options -->
              <a href="#/" class="drawer-nav-item" id="drawer-link-home">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span>${t('navbar.home')}</span>
              </a>
              <a href="#/request" class="drawer-nav-item" id="drawer-link-request">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                <span>${t('navbar.requests')}</span>
              </a>
              <a href="#/bulletin" class="drawer-nav-item" id="drawer-link-bulletin">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>${t('navbar.bulletin')}</span>
              </a>
            `}
            
            <!-- Shared Menu Options -->
            <a href="#/ledger-explorer" class="drawer-nav-item" id="drawer-link-ledger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>${t('navbar.ledgerExplorer')}</span>
            </a>
            <a href="#/profile" class="drawer-nav-item" id="drawer-link-profile">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>${isOfficialUser ? t('navbar.officialProfile') : t('navbar.account')}</span>
            </a>
          </nav>
        </div>

        <div class="drawer-divider"></div>

        <!-- Language Selector -->
        <div class="drawer-section">
          <div class="drawer-section-title">${t('navbar.switchLanguage')}</div>
          <div class="drawer-lang-selector">
            <button class="lang-btn" id="lang-btn-ceb" data-locale="ceb">Cebuano</button>
            <button class="lang-btn" id="lang-btn-tgl" data-locale="tgl">Tagalog</button>
            <button class="lang-btn" id="lang-btn-en" data-locale="en">English</button>
          </div>
        </div>

        <div class="drawer-divider"></div>

        <!-- User Swapping -->
        <div class="drawer-section">
          <div class="drawer-section-title">${t('navbar.switchProfile')}</div>
          <div class="drawer-user-select-list" id="drawer-user-list"></div>
        </div>
      </div>

      <div class="drawer-footer">
        <div class="drawer-app-info">
          <span>Guadalupe Connect v1.4</span>
          <div class="connection-badge" id="drawer-connection-badge">
            <span class="connection-indicator"></span>
            <span class="connection-text">Online</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation Bar -->
    <div class="bottom-nav ${isOfficialUser ? 'bottom-nav-official' : 'bottom-nav-resident'}">
      ${isOfficialUser ? `
        <!-- Official Bottom Nav -->
        <a href="#/dashboard" class="bottom-nav-tab" id="tab-official-home">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span class="bottom-nav-label">${t('navbar.officialHome')}</span>
        </a>
        <a href="#/dashboard" class="bottom-nav-tab" id="tab-official-requests">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="bottom-nav-label">${t('navbar.officialRequests')}</span>
        </a>
        <a href="#/sms-log" class="bottom-nav-tab" id="tab-official-logs">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <span class="bottom-nav-label">${t('navbar.officialLogs')}</span>
        </a>
        <a href="#/profile" class="bottom-nav-tab" id="tab-official-profile">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span class="bottom-nav-label">${t('navbar.officialProfile')}</span>
        </a>
      ` : `
        <!-- Resident Bottom Nav -->
        <a href="#/" class="bottom-nav-tab" id="tab-resident-home">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span class="bottom-nav-label">${t('navbar.home')}</span>
        </a>
        <a href="#/request" class="bottom-nav-tab" id="tab-resident-requests">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="bottom-nav-label">${t('navbar.requests')}</span>
        </a>
        <a href="#/bulletin" class="bottom-nav-tab" id="tab-resident-bulletin">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M12 9v4"></path><path d="M12 16v.01"></path></svg>
          <span class="bottom-nav-label">${t('navbar.bulletin')}</span>
        </a>
        <a href="#/profile" class="bottom-nav-tab" id="tab-resident-profile">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span class="bottom-nav-label">${t('navbar.account')}</span>
        </a>
      `}
    </div>
  `;

  // Bind back button
  document.getElementById('nav-back-button')?.addEventListener('click', () => {
    window.location.hash = isOfficialUser ? '#/dashboard' : '#/';
  });

  // Drawer Selectors
  const hamburgerBtn = document.getElementById('nav-hamburger-button');
  const drawerCloseBtn = document.getElementById('nav-drawer-close');
  const drawerBackdrop = document.getElementById('nav-drawer-backdrop');
  const drawer = document.getElementById('nav-drawer');

  // Open / Close Drawer functions
  const openDrawer = () => {
    drawer?.classList.add('open');
    drawerBackdrop?.classList.add('open');
  };

  const closeDrawer = () => {
    drawer?.classList.remove('open');
    drawerBackdrop?.classList.remove('open');
  };

  hamburgerBtn?.addEventListener('click', openDrawer);
  drawerCloseBtn?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);

  // Close drawer when clicking any link inside it
  drawer?.querySelectorAll('.drawer-nav-item').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Wire up Language Switcher
  const currentLocale = getLocale();
  drawer?.querySelectorAll('.lang-btn').forEach(btn => {
    const btnLocale = btn.dataset.locale;
    if (btnLocale === currentLocale) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      setLocale(btnLocale);
      closeDrawer();
      window.location.reload();
    });
  });

  // Wire up connection status indicator
  const connectionBadge = document.getElementById('drawer-connection-badge');
  if (connectionBadge) {
    const isOnline = offline.getStatus();
    if (isOnline) {
      connectionBadge.className = 'connection-badge online';
      connectionBadge.querySelector('.connection-text').textContent = 'Online';
    } else {
      connectionBadge.className = 'connection-badge offline';
      connectionBadge.querySelector('.connection-text').textContent = 'Offline';
    }
  }

  // Add styles
  addNavbarStyles();
  loadUserList();

  // Toggle user list dropdown (top right)
  const trigger = document.getElementById('navbar-user-trigger');
  const dropdown = document.getElementById('navbar-dropdown');

  const toggleDropdown = (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  };

  trigger?.addEventListener('click', toggleDropdown);

  document.addEventListener('click', () => {
    dropdown?.classList.remove('open');
  });

  // Track and update active tab classes
  updateActiveTab(isOfficialUser, currentHash);
}

function updateActiveTab(isOfficialUser, currentHash) {
  // Clear active classes from bottom tabs and drawer nav items
  document.querySelectorAll('.bottom-nav-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.drawer-nav-item').forEach(item => item.classList.remove('active'));

  if (isOfficialUser) {
    if (currentHash.startsWith('#/dashboard')) {
      document.getElementById('tab-official-home')?.classList.add('active');
      document.getElementById('tab-official-requests')?.classList.add('active');
      document.getElementById('drawer-link-home')?.classList.add('active');
    } else if (currentHash.startsWith('#/sms-log')) {
      document.getElementById('tab-official-logs')?.classList.add('active');
      document.getElementById('drawer-link-sms')?.classList.add('active');
    } else if (currentHash.startsWith('#/review')) {
      document.getElementById('tab-official-requests')?.classList.add('active');
    } else if (currentHash.startsWith('#/profile')) {
      document.getElementById('tab-official-profile')?.classList.add('active');
      document.getElementById('drawer-link-profile')?.classList.add('active');
    } else if (currentHash.startsWith('#/sos-dispatch')) {
      document.getElementById('drawer-link-sos')?.classList.add('active');
    } else if (currentHash.startsWith('#/insights')) {
      document.getElementById('drawer-link-insights')?.classList.add('active');
    } else if (currentHash.startsWith('#/ledger-explorer')) {
      document.getElementById('drawer-link-ledger')?.classList.add('active');
    }
  } else {
    if (currentHash === '#/' || currentHash === '#') {
      document.getElementById('tab-resident-home')?.classList.add('active');
      document.getElementById('drawer-link-home')?.classList.add('active');
    } else if (currentHash.startsWith('#/request') || currentHash.startsWith('#/status')) {
      document.getElementById('tab-resident-requests')?.classList.add('active');
      document.getElementById('drawer-link-request')?.classList.add('active');
    } else if (currentHash.startsWith('#/bulletin')) {
      document.getElementById('tab-resident-bulletin')?.classList.add('active');
      document.getElementById('drawer-link-bulletin')?.classList.add('active');
    } else if (currentHash.startsWith('#/profile')) {
      document.getElementById('tab-resident-profile')?.classList.add('active');
      document.getElementById('drawer-link-profile')?.classList.add('active');
    } else if (currentHash.startsWith('#/ledger-explorer')) {
      document.getElementById('drawer-link-ledger')?.classList.add('active');
    }
  }
}

async function loadUserList() {
  const users = await auth.getAllUsers();
  const currentUser = auth.getCurrentUser();
  
  // Navbar Dropdown Switcher (Top Right)
  const list = document.getElementById('navbar-user-list');
  if (list) {
    list.innerHTML = users.map(u => `
      <button class="navbar-dropdown-item ${u.id === currentUser?.id ? 'active' : ''}" data-user-id="${u.id}" id="switch-user-${u.id}">
        <div class="avatar" style="width: 28px; height: 28px; font-size: 0.7rem;">${u.name.split(' ').map(p => p[0]).join('').substring(0, 2)}</div>
        <div>
          <div style="font-weight: 500; font-size: 0.8125rem; color: #111827;">${u.name}</div>
          <div style="font-size: 0.6875rem; color: var(--text-tertiary);">${u.role === 'official' ? u.officialTitle || t('common.official') : t('common.resident')}${u.isSenior ? ' • Senior' : ''}</div>
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

  // Sidebar Drawer Switcher
  const drawerList = document.getElementById('drawer-user-list');
  if (drawerList) {
    drawerList.innerHTML = users.map(u => `
      <button class="drawer-user-item ${u.id === currentUser?.id ? 'active' : ''}" data-user-id="${u.id}" id="drawer-switch-user-${u.id}">
        <div class="avatar" style="width: 28px; height: 28px; font-size: 0.7rem; color: var(--text-on-accent); background: var(--gradient-accent);">${u.name.split(' ').map(p => p[0]).join('').substring(0, 2)}</div>
        <div style="flex: 1; text-align: left;">
          <div style="font-weight: 600; font-size: 0.8rem; color: #1f2937; line-height: 1.2;">${u.name}</div>
          <div style="font-size: 0.65rem; color: var(--text-tertiary);">${u.role === 'official' ? u.officialTitle || t('common.official') : t('common.resident')}</div>
        </div>
        ${u.id === currentUser?.id ? '<span style="color: var(--color-accent-500); font-size: 0.75rem;">●</span>' : ''}
      </button>
    `).join('');

    drawerList.querySelectorAll('.drawer-user-item').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        await auth.switchUser(userId);
        window.location.hash = auth.isOfficial() ? '#/dashboard' : '#/';
        window.location.reload();
      });
    });
  }
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

    /* Sidebar Drawer Styles */
    .drawer-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(17, 24, 39, 0.4);
      backdrop-filter: blur(4px);
      z-index: var(--z-modal);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .drawer-backdrop.open {
      opacity: 1;
      visibility: visible;
    }

    .nav-drawer {
      position: fixed;
      top: 0;
      left: 0;
      width: 320px;
      max-width: 85%;
      height: 100%;
      background: #ffffff;
      z-index: calc(var(--z-modal) + 1);
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 10px 0 30px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      color: #1f2937;
    }

    .nav-drawer.open {
      transform: translateX(0);
    }

    .drawer-header {
      padding: var(--space-4);
      background: linear-gradient(135deg, #0e3e7d 0%, #0f4c81 100%);
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .drawer-user-info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .drawer-close-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, color 0.2s;
    }

    .drawer-close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    .drawer-body {
      flex: 1;
      padding: var(--space-4) 0;
      overflow-y: auto;
    }

    .drawer-section {
      padding: 0 var(--space-4);
    }

    .drawer-section-title {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      margin-bottom: var(--space-2);
    }

    .drawer-nav {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .drawer-nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      color: #4b5563;
      text-decoration: none;
      border-radius: var(--radius-lg);
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .drawer-nav-item:hover, .drawer-nav-item.active {
      background: rgba(15, 76, 129, 0.06);
      color: #0f4c81;
      font-weight: 600;
    }

    .drawer-nav-item svg {
      color: #9ca3af;
      transition: color 0.2s;
    }

    .drawer-nav-item:hover svg, .drawer-nav-item.active svg {
      color: #0f4c81;
    }

    .drawer-divider {
      height: 1px;
      background: var(--border-subtle);
      margin: var(--space-4) 0;
    }

    .drawer-lang-selector {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-2);
    }

    .lang-btn {
      padding: var(--space-2) 0;
      background: #f3f4f6;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      color: #4b5563;
      transition: all 0.2s;
    }

    .lang-btn:hover {
      background: #e5e7eb;
      color: #1f2937;
    }

    .lang-btn.active {
      background: rgba(15, 76, 129, 0.1);
      border-color: #0f4c81;
      color: #0f4c81;
      font-weight: 600;
    }

    .drawer-user-select-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .drawer-user-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
      padding: var(--space-2) var(--space-3);
      background: none;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      color: #1f2937;
      cursor: pointer;
      text-align: left;
      font-family: var(--font-family);
      transition: all 0.2s;
    }

    .drawer-user-item:hover {
      background: #f9fafb;
      border-color: var(--border-strong);
    }

    .drawer-user-item.active {
      background: rgba(15, 76, 129, 0.04);
      border-color: rgba(15, 76, 129, 0.3);
    }

    .drawer-footer {
      padding: var(--space-4);
      border-top: 1px solid var(--border-subtle);
      background: #f9fafb;
    }

    .drawer-app-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    .connection-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }

    .connection-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .connection-badge.online .connection-indicator {
      background: #10b981;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
    }

    .connection-badge.offline .connection-indicator {
      background: #ef4444;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
    }
  `;
  document.head.appendChild(style);
}

// Re-render navbar on hashchange to trigger subpage back button and active tabs
window.addEventListener('hashchange', () => {
  renderNavbar();
});
