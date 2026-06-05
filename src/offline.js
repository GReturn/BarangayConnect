/* ============================================
   BarangayConnect — Offline Manager
   ============================================ */

import store from './store.js';

const { STORES } = store;

let isOnline = navigator.onLine;
let offlineListeners = new Set();
let syncInProgress = false;

// ---- Status Detection ----
function init() {
  window.addEventListener('online', () => {
    isOnline = true;
    notifyListeners();
    autoSync();
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    notifyListeners();
  });

  // Periodic check
  setInterval(async () => {
    const prev = isOnline;
    isOnline = navigator.onLine;
    if (prev !== isOnline) {
      notifyListeners();
      if (isOnline) autoSync();
    }
  }, 5000);
}

function getStatus() {
  return isOnline;
}

// ---- Offline Queue ----
async function queueSubmission(requestData) {
  const queueItem = {
    id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    requestData,
    queuedAt: new Date().toISOString(),
    bleRelayAttempted: false,
    bleRelaySuccess: false,
    synced: false
  };

  await store.put(STORES.offlineQueue, queueItem);

  // Simulate BLE relay attempt
  setTimeout(async () => {
    queueItem.bleRelayAttempted = true;
    queueItem.bleRelaySuccess = false; // Always fails in simulation
    await store.put(STORES.offlineQueue, queueItem);
  }, 2000);

  return queueItem;
}

async function getQueuedCount() {
  const all = await store.getAll(STORES.offlineQueue);
  return all.filter(item => !item.synced).length;
}

async function getQueuedItems() {
  const all = await store.getAll(STORES.offlineQueue);
  return all.filter(item => !item.synced);
}

// ---- Auto-Sync ----
async function autoSync() {
  if (syncInProgress) return;
  syncInProgress = true;

  try {
    const queued = await getQueuedItems();
    for (const item of queued) {
      // Simulate sync — in reality this would POST to server
      item.synced = true;
      item.syncedAt = new Date().toISOString();
      await store.put(STORES.offlineQueue, item);

      // The request data is already in the requests store
      // Just update status to show it's been synced
      const request = await store.getById(STORES.requests, item.requestData.id);
      if (request && request.status === 'queued_offline') {
        request.status = 'submitted';
        request.syncedAt = item.syncedAt;
        await store.put(STORES.requests, request);
      }
    }

    if (queued.length > 0) {
      notifyListeners();
    }
  } catch (err) {
    console.error('[Offline] Sync error:', err);
  } finally {
    syncInProgress = false;
  }
}

// ---- Listeners ----
function onStatusChange(callback) {
  offlineListeners.add(callback);
  return () => offlineListeners.delete(callback);
}

function notifyListeners() {
  offlineListeners.forEach(cb => {
    try { cb(isOnline); } catch (e) { console.error(e); }
  });
}

export const offline = {
  init,
  getStatus,
  queueSubmission,
  getQueuedCount,
  getQueuedItems,
  autoSync,
  onStatusChange
};

export default offline;
