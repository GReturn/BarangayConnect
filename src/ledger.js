/* ============================================
   BarangayConnect — Tamper-Proof Ledger
   ============================================ */

import store from './store.js';

const { STORES } = store;

// ---- Hash Computation ----
async function computeHash(data) {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---- Get Last Ledger Entry ----
async function getLastEntry() {
  const all = await store.getAll(STORES.ledger);
  if (all.length === 0) return null;
  // Sort by timestamp descending
  all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return all[0];
}

// ---- Append Entry ----
async function appendEntry({ requestId, action, actor, remarks = '', data = {} }) {
  const lastEntry = await getLastEntry();
  const previousHash = lastEntry ? lastEntry.hash : '0'.repeat(64);
  const timestamp = new Date().toISOString();

  const payload = `${previousHash}|${action}|${timestamp}|${requestId}|${actor}|${JSON.stringify(data)}`;
  const hash = await computeHash(payload);

  const entry = {
    id: `ledger-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    requestId,
    action,
    actor,
    remarks,
    timestamp,
    previousHash,
    hash,
    data
  };

  await store.put(STORES.ledger, entry);
  return entry;
}

// ---- Get Entries for a Request ----
async function getEntriesForRequest(requestId) {
  const entries = await store.getByIndex(STORES.ledger, 'requestId', requestId);
  entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return entries;
}

// ---- Validate Chain ----
async function validateChain() {
  const all = await store.getAll(STORES.ledger);
  all.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  for (let i = 0; i < all.length; i++) {
    const entry = all[i];
    const expectedPreviousHash = i === 0 ? '0'.repeat(64) : all[i - 1].hash;

    if (entry.previousHash !== expectedPreviousHash) {
      return { valid: false, brokenAt: i, entry };
    }

    const payload = `${entry.previousHash}|${entry.action}|${entry.timestamp}|${entry.requestId}|${entry.actor}|${JSON.stringify(entry.data || {})}`;
    const recomputedHash = await computeHash(payload);

    if (recomputedHash !== entry.hash) {
      return { valid: false, brokenAt: i, entry, reason: 'hash_mismatch' };
    }
  }

  return { valid: true, count: all.length };
}

// ---- Format Action ----
function formatAction(action) {
  const labels = {
    'submitted': 'Gi-submit ang hangyo',
    'received': 'Nadawat sa Secretary',
    'under_review': 'Gi-review sa Captain',
    'approved': 'Gi-approve',
    'rejected': 'Gi-reject',
    'ready_pickup': 'Andam na para kuhaon',
    'collected': 'Na-kuha na ang dokumento',
    'collected_proxy': 'Na-kuha sa proxy'
  };
  return labels[action] || action;
}

export const ledger = {
  appendEntry,
  getEntriesForRequest,
  validateChain,
  formatAction,
  computeHash
};

export default ledger;
