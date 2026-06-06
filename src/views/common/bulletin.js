/* ============================================
   BarangayConnect — Bulletin & Announcements View
   ============================================ */

import offline from '../../offline.js';
import { showModal } from '../../components/modal.js';
import { t } from '../../i18n.js';

export async function renderBulletin() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const isOnline = offline.getStatus();

  // Expanded list of announcements for the dedicated page
  const newsItems = [
    {
      tag: 'Health',
      title: isOnline ? 'Libre nga Medical Mission karong Sabado' : 'Libre nga Medical Mission',
      desc: 'Pag-andam sa inyong mga record para sa libre nga check-up sa Barangay Hall sugod sa alas-otso sa buntag. Aduna usab kitay libreng bitamina ug mga tambal para sa mga bata ug senior citizens.',
      imageBg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
      imageEmoji: '🏥'
    },
    {
      tag: 'Public Works',
      title: 'Pag-ayo sa Dalan sa Purok 5',
      desc: 'Temporaryo nga sirado ang dalan sugod ugma para sa pag-aspalto. Gi-awhag ang tanan lumulupyo sa pag-agi sa mga alternate routes aron malikayan ang trapiko.',
      imageBg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      imageEmoji: '🚧'
    },
    {
      tag: 'Community',
      title: 'Oplan Limpyo sa Sitio Mahayahay',
      desc: 'Nagkahiusa ang mga lumulupyo para sa paghinlo sa atong komunidad karong Sabado. Palihug pagdala sa inyong kaugalingong silhig, bolo, ug trash bags. Kitakits!',
      imageBg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      imageEmoji: '🧹'
    },
    {
      tag: 'Security',
      title: 'Pagpalig-on sa Barangay Tanod Patrols',
      desc: 'Dugang nga seguridad ang ipakatap sa tibuok barangay sa gabii aron masiguro ang kahusay ug kalinaw sa atong dapit.',
      imageBg: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)',
      imageEmoji: '🛡️'
    }
  ];

  main.innerHTML = `
    <div class="bulletin-view animate-fade-in">
      <div class="form-back-row">
        <button class="btn btn-ghost btn-sm" id="bulletin-back-btn">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
          ${t('common.back')}
        </button>
      </div>

      <div class="section-header">
        <div>
          <h1 style="font-size: var(--font-size-3xl);">📢 ${t('home.newsBulletin')}</h1>
          <p class="text-secondary mt-1">${t('home.newsBulletinSub')}</p>
        </div>
        <span class="badge badge-neutral">${newsItems.length} announcements</span>
      </div>

      <div class="announcements-list mt-6 stagger">
        ${newsItems.map((item, idx) => `
          <div class="news-bulletin-card card" style="cursor: pointer;" data-ann-index="${idx}">
            <div class="news-bulletin-image" style="background: ${item.imageBg}">
              <span class="news-bulletin-emoji">${item.imageEmoji}</span>
            </div>
            <div class="news-bulletin-content">
              <span class="news-bulletin-tag tag-info">${item.tag.toUpperCase()}</span>
              <h3 class="news-bulletin-title">${item.title}</h3>
              <p class="news-bulletin-desc">${item.desc}</p>
              <div class="read-more-indicator mt-2" style="font-size: 11px; font-weight: 600; color: #0f4c81;">
                ${t('status.historyTrackStatus').replace('>', '→')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Bind Styles
  if (!document.getElementById('bulletin-styles')) {
    const style = document.createElement('style');
    style.id = 'bulletin-styles';
    style.textContent = `
      .bulletin-view {
        max-width: 720px;
        margin: 0 auto;
      }
    `;
    document.head.appendChild(style);
  }

  // Bind Event Listeners
  document.getElementById('bulletin-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#/';
  });

  main.querySelectorAll('.news-bulletin-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.annIndex, 10);
      const item = newsItems[idx];
      showModal({
        title: item.title,
        type: 'default',
        body: `
          <div style="display: flex; flex-direction: column; gap: var(--space-3); text-align: left;">
            <div style="display: flex; align-items: center; gap: var(--space-2);">
              <span class="badge badge-neutral">${item.tag}</span>
            </div>
            <p style="font-size: var(--font-size-base); color: var(--text-primary); line-height: 1.6; margin: 0;">${item.desc}</p>
          </div>
        `,
        actions: [{ label: t('common.close'), class: 'btn-primary' }]
      });
    });
  });
}
