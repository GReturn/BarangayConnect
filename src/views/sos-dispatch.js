/* ============================================
   BarangayConnect — SOS Response Centre View
   ============================================ */

import { formatTimeAgo, escapeHTML } from '../utils.js';
import { showToast } from '../components/toast.js';
import { t } from '../i18n.js';

export async function renderSOSDispatch() {
  const main = document.getElementById('main-content');
  if (!main) return;

  // Load active alerts
  let activeSos = JSON.parse(localStorage.getItem('brgyconnect_active_sos') || '[]');

  // Seed a default alert if list is empty, to demonstrate the UI
  if (activeSos.length === 0) {
    activeSos = [
      {
        id: 'sos-seed-001',
        residentName: 'Melchora Aquino',
        residentPhone: '+63 925 123 9876',
        address: 'Purok 8, Barangay Guadalupe, Cebu City',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12m ago
        status: 'pending'
      },
      {
        id: 'sos-seed-002',
        residentName: 'Antonio Luna',
        residentPhone: '+63 920 111 2222',
        address: 'Purok 2, Barangay Guadalupe, Cebu City',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45m ago
        status: 'dispatched'
      }
    ];
    localStorage.setItem('brgyconnect_active_sos', JSON.stringify(activeSos));
  }

  // Filter out resolved ones or show all? Let's display unresolved (pending, dispatched) and a log of resolved at the bottom.
  const unresolved = activeSos.filter(s => s.status !== 'resolved');
  const resolved = activeSos.filter(s => s.status === 'resolved');

  main.innerHTML = `
    <div class="sos-dispatch-view animate-fade-in">
      <div class="form-back-row">
        <button class="btn btn-ghost btn-sm" id="sos-back-btn">
          ← ${t('common.back')}
        </button>
      </div>

      <div class="sos-header">
        <h1>${t('sos.title')}</h1>
        <p class="text-secondary mt-1">${t('sos.subtitle')}</p>
      </div>

      <!-- Main Layout: Sidebar List + Map View -->
      <div class="sos-layout-grid mt-5">
        
        <!-- Left Column: Active Alarms List -->
        <div class="sos-alarms-panel">
          <h3 class="font-bold flex items-center justify-between mb-3">
            ${t('sos.activeAlarms')}
            <span class="badge ${unresolved.length > 0 ? 'badge-danger animate-pulse' : 'badge-neutral'}">
              ${t('sos.unresolvedBadge', { count: unresolved.length })}
            </span>
          </h3>

          <div class="sos-alarms-list flex flex-col gap-3">
            ${unresolved.length > 0 ? unresolved.map(alert => {
              const minutesAgo = Math.floor((Date.now() - new Date(alert.timestamp).getTime()) / 60000);
              const isDispatched = alert.status === 'dispatched';
              
              return `
                <div class="sos-alarm-card card ${isDispatched ? 'border-dispatched' : 'border-pending'}" data-sos-id="${alert.id}">
                  <div class="alarm-card-header flex justify-between items-start">
                    <div>
                      <h4 class="alarm-caller font-bold">${escapeHTML(alert.residentName)}</h4>
                      <span class="alarm-phone block mt-1">${escapeHTML(alert.residentPhone)}</span>
                    </div>
                    <span class="alarm-time-badge font-semibold">${minutesAgo}m ago</span>
                  </div>
                  
                  <div class="alarm-address mt-2 text-xs font-medium text-secondary">
                    📍 ${escapeHTML(alert.address)}
                  </div>

                  <div class="alarm-status-row mt-3 flex items-center justify-between">
                    <span class="badge ${isDispatched ? 'badge-warning' : 'badge-danger'} font-bold">
                      ${alert.status.toUpperCase()}
                    </span>
                    
                    <div class="alarm-actions flex gap-2">
                      <a href="tel:${alert.residentPhone}" class="btn btn-ghost btn-sm flex items-center justify-center" title="Call Resident">
                        ${t('sos.callBtn')}
                      </a>
                      ${!isDispatched ? `
                        <button class="btn btn-warning btn-sm btn-dispatch" data-sos-id="${alert.id}">
                          ${t('sos.dispatchBtn')}
                        </button>
                      ` : ''}
                      <button class="btn btn-success btn-sm btn-resolve" data-sos-id="${alert.id}">
                        ${t('sos.resolveBtn')}
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('') : `
              <div class="empty-state py-6 card">
                <span style="font-size: 2rem;">🛡️</span>
                <h4 class="font-bold mt-2 text-secondary">${t('sos.emptySOS')}</h4>
              </div>
            `}
          </div>

          <!-- Historical Resolved Logs -->
          ${resolved.length > 0 ? `
            <div class="divider mt-5"></div>
            <h3 class="font-bold text-xs text-secondary uppercase mb-3">${t('sos.recentlyResolved')}</h3>
            <div class="resolved-logs-list flex flex-col gap-2">
              ${resolved.map(alert => `
                <div class="resolved-log-item card flex justify-between items-center py-2 px-3">
                  <div>
                    <span class="font-bold text-xs text-secondary">${escapeHTML(alert.residentName)}</span>
                    <span class="block text-tertiary" style="font-size: 9px;">📍 ${escapeHTML(alert.address)}</span>
                  </div>
                  <span class="badge badge-success text-xs">RESOLVED</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Right Column: Visual Satellite Map Mock -->
        <div class="sos-map-panel">
          <div class="card map-card-box">
            <div class="map-mock-bg">
              <!-- Grid overlay to represent streets -->
              <div class="map-grid-pattern"></div>
              
              <!-- Map pins for active unresolved alerts -->
              ${unresolved.map((alert, idx) => {
                // Compute deterministic x/y position based on ID string
                const hash = alert.id.charCodeAt(alert.id.length - 1) || 50;
                const posX = 15 + (hash % 60);
                const posY = 20 + ((hash * 7) % 55);
                const isDispatched = alert.status === 'dispatched';

                return `
                  <div class="map-pin-pulse ${isDispatched ? 'pin-dispatched' : 'pin-pending'}" style="left: ${posX}%; top: ${posY}%;" data-sos-id="${alert.id}">
                    <div class="pin-marker">🚨</div>
                    <div class="pin-popup">
                      <strong>${escapeHTML(alert.residentName)}</strong>
                      <span>${escapeHTML(alert.address.split(',')[0])}</span>
                    </div>
                  </div>
                `;
              }).join('')}

              <!-- Grid labeling -->
              <div class="map-legend">
                <span>🛰️ GUADALUPE SECTOR LIVE GPS</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  addSOSDispatchStyles();
  bindSOSEvents();
}

function bindSOSEvents() {
  document.getElementById('sos-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#/dashboard';
  });

  const activeSos = JSON.parse(localStorage.getItem('brgyconnect_active_sos') || '[]');

  // Bind Dispatch button click
  document.querySelectorAll('.btn-dispatch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sosId = btn.dataset.sosId;
      updateSOSStatus(sosId, 'dispatched');
      showToast({
        type: 'success',
        title: t('sos.dispatchSuccessTitle'),
        message: t('sos.dispatchSuccessDesc')
      });
      renderSOSDispatch();
    });
  });

  // Bind Resolve button click
  document.querySelectorAll('.btn-resolve').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sosId = btn.dataset.sosId;
      updateSOSStatus(sosId, 'resolved');
      showToast({
        type: 'success',
        title: t('sos.resolveSuccessTitle'),
        message: t('sos.resolveSuccessDesc')
      });
      renderSOSDispatch();
    });
  });

  // Hover effect on alarm cards to highlight map pins
  document.querySelectorAll('.sos-alarm-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const sosId = card.dataset.sosId;
      const pin = document.querySelector(`.map-pin-pulse[data-sos-id="${sosId}"]`);
      pin?.classList.add('highlight');
    });

    card.addEventListener('mouseleave', () => {
      const sosId = card.dataset.sosId;
      const pin = document.querySelector(`.map-pin-pulse[data-sos-id="${sosId}"]`);
      pin?.classList.remove('highlight');
    });
  });
}

function updateSOSStatus(id, newStatus) {
  const activeSos = JSON.parse(localStorage.getItem('brgyconnect_active_sos') || '[]');
  const updated = activeSos.map(alert => {
    if (alert.id === id) {
      return { ...alert, status: newStatus };
    }
    return alert;
  });
  localStorage.setItem('brgyconnect_active_sos', JSON.stringify(updated));
}

function addSOSDispatchStyles() {
  if (document.getElementById('sos-dispatch-styles')) return;
  const style = document.createElement('style');
  style.id = 'sos-dispatch-styles';
  style.textContent = `
    .sos-layout-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-5);
    }

    @media (max-width: 768px) {
      .sos-layout-grid {
        grid-template-columns: 1fr;
      }
    }

    .sos-alarms-panel {
      display: flex;
      flex-direction: column;
    }

    .sos-alarm-card {
      background: #ffffff;
      border: 1px solid var(--border-default);
      padding: var(--space-4);
      box-shadow: var(--shadow-md);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .sos-alarm-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .sos-alarm-card.border-pending {
      border-left: 4px solid #ef4444;
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.05);
    }

    .sos-alarm-card.border-dispatched {
      border-left: 4px solid #f59e0b;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.05);
    }

    .alarm-caller {
      font-size: var(--font-size-base);
      color: #1f2937;
      margin: 0;
    }

    .alarm-phone {
      font-size: 11px;
      color: var(--text-tertiary);
    }

    .alarm-time-badge {
      font-size: 10px;
      color: #b91c1c;
      background: #fef2f2;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
    }

    .alarm-status-row {
      border-top: 1px solid var(--border-default);
      padding-top: var(--space-3);
    }

    /* Map Mock Styles */
    .map-card-box {
      padding: 0;
      overflow: hidden;
      border: 1px solid var(--border-default);
      box-shadow: var(--shadow-lg);
    }

    .map-mock-bg {
      height: 480px;
      background: linear-gradient(180deg, #0b0f19 0%, #111827 100%); /* Premium dark GPS center */
      position: relative;
      overflow: hidden;
    }

    .map-grid-pattern {
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(rgba(59, 130, 246, 0.1) 1.5px, transparent 0),
        linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 0),
        linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 0);
      background-size: 16px 16px, 80px 80px, 80px 80px;
    }

    .map-pin-pulse {
      position: absolute;
      width: 24px;
      height: 24px;
      cursor: pointer;
      z-index: 10;
      transition: transform 0.25s var(--ease-spring);
    }

    .map-pin-pulse.highlight {
      transform: scale(1.5);
      z-index: 20;
    }

    .pin-marker {
      font-size: 22px;
      text-shadow: 0 0 8px rgba(0,0,0,0.9);
      animation: bounce 0.8s infinite alternate;
    }

    .map-pin-pulse::after {
      content: '';
      position: absolute;
      left: 2px;
      top: 14px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      transform: scale(0);
      opacity: 1;
      animation: ripple 1.6s infinite;
    }

    .map-pin-pulse.pin-pending::after {
      border: 2px solid #ef4444;
      background: rgba(239, 68, 68, 0.25);
    }

    .map-pin-pulse.pin-dispatched::after {
      border: 2px solid #f59e0b;
      background: rgba(245, 158, 11, 0.25);
      animation-delay: 0.8s;
    }

    .pin-popup {
      position: absolute;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(17, 24, 39, 0.95);
      border: 1px solid #374151;
      color: #ffffff;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      font-size: 9px;
      white-space: nowrap;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 16px rgba(0,0,0,0.5);
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s;
    }

    .map-pin-pulse:hover .pin-popup,
    .map-pin-pulse.highlight .pin-popup {
      opacity: 1;
      visibility: visible;
      bottom: 36px;
    }

    .pin-popup strong {
      font-weight: 700;
      color: #f87171;
    }

    .map-legend {
      position: absolute;
      bottom: var(--space-3);
      right: var(--space-3);
      background: rgba(17, 24, 39, 0.9);
      padding: 4px var(--space-3);
      border-radius: var(--radius-sm);
      font-size: 8px;
      color: #cbd5e1;
      font-weight: 700;
      letter-spacing: 0.8px;
      border: 1px solid #374151;
    }

    @keyframes bounce {
      from { transform: translateY(0); }
      to { transform: translateY(-8px); }
    }

    @keyframes ripple {
      from { transform: scale(0.2); opacity: 1; }
      to { transform: scale(2.2); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}
