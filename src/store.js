/* ============================================
   BarangayConnect — IndexedDB Store
   ============================================ */

const DB_NAME = 'BarangayConnectDB';
const DB_VERSION = 1;

const STORES = {
  residents: 'residents',
  requests: 'requests',
  ledger: 'ledger',
  smsLog: 'smsLog',
  offlineQueue: 'offlineQueue'
};

let db = null;
const subscribers = new Map();

// ---- Database Init ----
function openDB() {
  return new Promise((resolve, reject) => {
    if (db) { resolve(db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const database = e.target.result;

      if (!database.objectStoreNames.contains(STORES.residents)) {
        database.createObjectStore(STORES.residents, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.requests)) {
        const store = database.createObjectStore(STORES.requests, { keyPath: 'id' });
        store.createIndex('residentId', 'residentId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('referenceNumber', 'referenceNumber', { unique: true });
      }
      if (!database.objectStoreNames.contains(STORES.ledger)) {
        const store = database.createObjectStore(STORES.ledger, { keyPath: 'id' });
        store.createIndex('requestId', 'requestId', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.smsLog)) {
        const store = database.createObjectStore(STORES.smsLog, { keyPath: 'id' });
        store.createIndex('requestId', 'requestId', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.offlineQueue)) {
        database.createObjectStore(STORES.offlineQueue, { keyPath: 'id' });
      }
    };

    req.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

// ---- Generic CRUD ----
async function getAll(storeName) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getById(storeName, id) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getByIndex(storeName, indexName, value) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const req = index.getAll(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function put(storeName, data) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(data);
    req.onsuccess = () => {
      notify(storeName);
      resolve(req.result);
    };
    req.onerror = () => reject(req.error);
  });
}

async function remove(storeName, id) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    req.onsuccess = () => {
      notify(storeName);
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

async function clearStore(storeName) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.clear();
    req.onsuccess = () => {
      notify(storeName);
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

async function count(storeName) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---- Subscription System ----
function subscribe(storeName, callback) {
  if (!subscribers.has(storeName)) {
    subscribers.set(storeName, new Set());
  }
  subscribers.get(storeName).add(callback);
  return () => subscribers.get(storeName).delete(callback);
}

function notify(storeName) {
  if (subscribers.has(storeName)) {
    subscribers.get(storeName).forEach(cb => {
      try { cb(); } catch (e) { console.error('Subscriber error:', e); }
    });
  }
}

// ---- Seed Demo Data ----
async function seedDemoData() {
  const existingResidents = await getAll(STORES.residents);
  if (existingResidents.length > 0) return;

  const residents = [
    {
      id: 'resident-001',
      name: 'Maria Santos',
      firstName: 'Maria',
      lastName: 'Santos',
      address: 'Purok 3, Barangay San Jose, Cebu City',
      dateOfBirth: '1990-05-15',
      phone: '+63 917 123 4567',
      age: 36,
      isSenior: false,
      isPWD: false,
      isPregnant: false,
      philsysId: 'PSN-0001-2345-6789',
      philsysVerified: true,
      role: 'resident'
    },
    {
      id: 'resident-002',
      name: 'Juan dela Cruz',
      firstName: 'Juan',
      lastName: 'dela Cruz',
      address: 'Purok 7, Barangay San Jose, Cebu City',
      dateOfBirth: '1962-11-22',
      phone: '+63 918 987 6543',
      age: 63,
      isSenior: true,
      isPWD: false,
      isPregnant: false,
      philsysId: 'PSN-0002-6789-0123',
      philsysVerified: true,
      role: 'resident'
    },
    {
      id: 'official-001',
      name: 'KB Trongko',
      firstName: 'KB',
      lastName: 'Trongko',
      address: 'Purok 1, Barangay San Jose, Cebu City',
      dateOfBirth: '1985-03-10',
      phone: '+63 919 555 1234',
      age: 41,
      isSenior: false,
      isPWD: false,
      isPregnant: false,
      philsysId: 'PSN-0003-1111-2222',
      philsysVerified: true,
      role: 'official',
      officialTitle: 'Barangay Secretary / Captain'
    }
  ];

  for (const resident of residents) {
    await put(STORES.residents, resident);
  }

  console.log('[Store] Demo data seeded');
}

// ---- Public API ----
export const store = {
  STORES,
  openDB,
  getAll,
  getById,
  getByIndex,
  put,
  remove,
  clearStore,
  count,
  subscribe,
  seedDemoData
};

export default store;
