/* ============================================
   BarangayConnect — Ledger & Audit Explorer View
   ============================================ */

import store from '../store.js';
import ledger from '../ledger.js';
import { formatDateTimeUTC, escapeHTML } from '../utils.js';
import { showToast } from '../components/toast.js';

const { STORES } = store;

export async function renderLedgerExplorer() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const allEntries = await store.getAll(STORES.ledger);
  // Chronological sorting (newest first for reading log layout)
  allEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  main.innerHTML = `
    <div class="ledger-explorer-view animate-fade-in">
      <div class="form-back-row">
        <button class="btn btn-ghost btn-sm" id="ledger-back-btn">
          ← Back to Dashboard
        </button>
      </div>

      <div class="ledger-header">
        <h1>🛡️ Tamper-Proof Ledger Explorer</h1>
        <p class="text-secondary mt-1">Audit log of all transactions secured by GovChain cryptographic chains.</p>
      </div>

      <!-- Chain Verification Action Box -->
      <div class="card integrity-verification-card mt-5 flex justify-between items-center gap-4">
        <div>
          <h3 class="font-bold text-sm">System Chain Integrity</h3>
          <p class="text-xs text-secondary mt-1">Verify that no historical records have been altered or deleted.</p>
        </div>
        <button class="btn btn-primary" id="btn-run-checksum">Verify Chain Checksum</button>
      </div>

      <!-- Checksum Results Box (injected dynamically) -->
      <div id="checksum-results-box" class="mt-4 animate-fade-in" style="display: none;"></div>

      <!-- Search / Filters Row -->
      <div class="ledger-filters-row mt-6 flex gap-3">
        <input type="text" class="form-input flex-1" id="ledger-search-input" placeholder="Search by Actor, Request ID, or Hash..." />
      </div>

      <!-- Blocks Feed Timeline -->
      <div class="ledger-blocks-feed mt-4 stagger" id="ledger-blocks-container">
        ${renderBlockCards(allEntries)}
      </div>

    </div>
  `;

  addLedgerExplorerStyles();
  bindLedgerEvents(allEntries);
}

function renderBlockCards(entries) {
  if (entries.length === 0) {
    return `
      <div class="empty-state card py-6">
        <span style="font-size: 2rem;">📭</span>
        <h4 class="font-bold mt-2 text-secondary">Ledger is empty</h4>
        <p class="text-xs text-tertiary">No transaction records written to database.</p>
      </div>
    `;
  }

  return entries.map((entry, idx) => {
    const blockIndex = entries.length - idx;
    const actionLabel = ledger.formatAction(entry.action);
    const dateFormatted = formatDateTimeUTC(entry.timestamp);

    return `
      <div class="ledger-block-card card mt-3" data-block-id="${entry.id}">
        <div class="block-card-header flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="block-index-badge">BLOCK #${blockIndex}</span>
            <span class="badge badge-success text-xs">✓ Cryptographically Secured</span>
          </div>
          <span class="block-time text-xs text-tertiary font-semibold">${dateFormatted}</span>
        </div>

        <div class="block-card-body mt-3">
          <div class="block-field-row">
            <span class="block-field-lbl">ACTION</span>
            <span class="block-field-val font-bold text-gray-900">${actionLabel}</span>
          </div>
          
          <div class="block-fields-inline mt-3">
            <div class="block-field-row">
              <span class="block-field-lbl">ACTOR</span>
              <span class="block-field-val font-semibold">${escapeHTML(entry.actor)}</span>
            </div>
            <div class="block-field-row">
              <span class="block-field-lbl">REQUEST REFERENCE</span>
              <span class="block-field-val font-semibold" style="font-family: monospace;">${escapeHTML(entry.data?.referenceNumber || entry.requestId)}</span>
            </div>
          </div>

          ${entry.remarks ? `
            <div class="block-field-row mt-3">
              <span class="block-field-lbl">REMARKS / MEMO</span>
              <span class="block-field-val font-italic">"${escapeHTML(entry.remarks)}"</span>
            </div>
          ` : ''}

          <!-- Hashes Section -->
          <div class="block-hashes-container mt-4">
            <div class="hash-item">
              <span class="hash-lbl">PREV BLOCK HEADER</span>
              <span class="hash-val" style="font-family: monospace;">${entry.previousHash}</span>
            </div>
            <div class="hash-item mt-2">
              <span class="hash-lbl text-success">BLOCK HASH SHA-256</span>
              <span class="hash-val text-success font-semibold" style="font-family: monospace;">${entry.hash}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function bindLedgerEvents(entries) {
  document.getElementById('ledger-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#/dashboard';
  });

  // Checksum execution
  document.getElementById('btn-run-checksum')?.addEventListener('click', async () => {
    const verifyBtn = document.getElementById('btn-run-checksum');
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<span class="spinner"></span> Verifying...';

    // Simulate cryptographic processing time of 800ms
    setTimeout(async () => {
      const result = await ledger.validateChain();
      const resultsBox = document.getElementById('checksum-results-box');

      verifyBtn.disabled = false;
      verifyBtn.innerHTML = 'Verify Chain Checksum';

      if (resultsBox) {
        if (result.valid) {
          resultsBox.innerHTML = `
            <div class="card alert-box-success flex items-center gap-3">
              <div class="alert-icon-circle-success">✓</div>
              <div>
                <h4 class="font-bold text-sm text-green-900">Ledger Validation Passed</h4>
                <p class="text-xs text-green-700 mt-1">Verified ${result.count} transaction blocks. Hash link sequences match parent records successfully.</p>
              </div>
            </div>
          `;
          showToast({ type: 'success', title: 'Ledger Audit Passed', message: 'All transaction block sequences verify successfully.' });
        } else {
          resultsBox.innerHTML = `
            <div class="card alert-box-danger flex items-center gap-3">
              <div class="alert-icon-circle-danger">❌</div>
              <div>
                <h4 class="font-bold text-sm text-red-900">Ledger Validation Failed</h4>
                <p class="text-xs text-red-700 mt-1">Chain broken at block index ${result.brokenAt}. Hash discrepancy detected.</p>
              </div>
            </div>
          `;
          showToast({ type: 'error', title: 'Validation Failed', message: 'Chain integrity discrepancy detected.' });
        }
        resultsBox.style.display = 'block';
      }
    }, 800);
  });

  // Search filter keyup
  const searchInput = document.getElementById('ledger-search-input');
  const blocksContainer = document.getElementById('ledger-blocks-container');

  searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = entries.filter(entry => {
      return (
        entry.actor.toLowerCase().includes(query) ||
        entry.action.toLowerCase().includes(query) ||
        entry.hash.toLowerCase().includes(query) ||
        (entry.data?.referenceNumber && entry.data.referenceNumber.toLowerCase().includes(query)) ||
        (entry.remarks && entry.remarks.toLowerCase().includes(query))
      );
    });

    if (blocksContainer) {
      blocksContainer.innerHTML = renderBlockCards(filtered);
    }
  });
}

function addLedgerExplorerStyles() {
  if (document.getElementById('ledger-explorer-styles')) return;
  const style = document.createElement('style');
  style.id = 'ledger-explorer-styles';
  style.textContent = `
    .ledger-explorer-view {
      max-width: 768px;
      margin: 0 auto var(--space-8);
    }

    .integrity-verification-card {
      background: rgba(15, 76, 129, 0.05);
      border: 1.5px dashed #0f4c81;
      padding: var(--space-4);
    }

    .block-index-badge {
      background: #0f1b2d;
      color: #ffffff;
      font-size: var(--font-size-xs);
      font-weight: 800;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }

    .block-fields-inline {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .block-field-lbl {
      font-size: 8px;
      color: var(--text-tertiary);
      font-weight: 700;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 2px;
    }

    .block-field-val {
      font-size: var(--font-size-sm);
      color: #1f2937;
    }

    .block-hashes-container {
      background: #f9fafb;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      padding: var(--space-3);
    }

    .hash-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .hash-lbl {
      font-size: 8px;
      font-weight: 700;
      color: var(--text-tertiary);
      letter-spacing: 0.3px;
    }

    .hash-val {
      font-size: 10px;
      color: var(--text-secondary);
      word-break: break-all;
    }

    /* Verification alerts */
    .alert-box-success {
      background: #f0fdf4;
      border: 1.5px solid #bbf7d0;
      padding: var(--space-3) var(--space-4);
    }

    .alert-icon-circle-success {
      width: 28px;
      height: 28px;
      background: #10b981;
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }

    .alert-box-danger {
      background: #fef2f2;
      border: 1.5px solid #fecaca;
      padding: var(--space-3) var(--space-4);
    }

    .alert-icon-circle-danger {
      width: 28px;
      height: 28px;
      background: #ef4444;
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
}
