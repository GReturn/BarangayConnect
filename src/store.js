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
  if (existingResidents.length > 0 && existingResidents.length < 10) {
    console.log('[Store] Legacy database detected, clearing all stores to reseed...');
    for (const name of Object.values(STORES)) {
      await clearStore(name);
    }
  } else if (existingResidents.length >= 10) {
    return;
  }

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
      id: 'resident-003',
      name: 'Antonio Luna',
      firstName: 'Antonio',
      lastName: 'Luna',
      address: 'Purok 2, Barangay San Jose, Cebu City',
      dateOfBirth: '1981-10-29',
      phone: '+63 920 111 2222',
      age: 45,
      isSenior: false,
      isPWD: true,
      isPregnant: false,
      philsysId: 'PSN-0003-8888-9999',
      philsysVerified: true,
      role: 'resident'
    },
    {
      id: 'resident-004',
      name: 'Gloria Macapagal',
      firstName: 'Gloria',
      lastName: 'Macapagal',
      address: 'Purok 5, Barangay San Jose, Cebu City',
      dateOfBirth: '1948-04-05',
      phone: '+63 921 333 4444',
      age: 78,
      isSenior: true,
      isPWD: false,
      isPregnant: false,
      philsysId: 'PSN-0004-7777-6666',
      philsysVerified: true,
      role: 'resident'
    },
    {
      id: 'resident-005',
      name: 'Leonora Rivera',
      firstName: 'Leonora',
      lastName: 'Rivera',
      address: 'Purok 1, Barangay San Jose, Cebu City',
      dateOfBirth: '1998-08-14',
      phone: '+63 922 555 6666',
      age: 28,
      isSenior: false,
      isPWD: false,
      isPregnant: true,
      philsysId: 'PSN-0005-5555-4444',
      philsysVerified: true,
      role: 'resident'
    },
    {
      id: 'resident-006',
      name: 'Jose Rizal',
      firstName: 'Jose',
      lastName: 'Rizal',
      address: 'Purok 4, Barangay San Jose, Cebu City',
      dateOfBirth: '1991-06-19',
      phone: '+63 923 777 8888',
      age: 35,
      isSenior: false,
      isPWD: false,
      isPregnant: false,
      philsysId: 'PSN-0006-2222-1111',
      philsysVerified: true,
      role: 'resident'
    },
    {
      id: 'resident-007',
      name: 'Andres Bonifacio',
      firstName: 'Andres',
      lastName: 'Bonifacio',
      address: 'Purok 6, Barangay San Jose, Cebu City',
      dateOfBirth: '1997-11-30',
      phone: '+63 924 999 0000',
      age: 29,
      isSenior: false,
      isPWD: false,
      isPregnant: false,
      philsysId: 'PSN-0007-4444-3333',
      philsysVerified: true,
      role: 'resident'
    },
    {
      id: 'resident-008',
      name: 'Melchora Aquino',
      firstName: 'Melchora',
      lastName: 'Aquino',
      address: 'Purok 8, Barangay San Jose, Cebu City',
      dateOfBirth: '1942-01-06',
      phone: '+63 925 123 9876',
      age: 84,
      isSenior: true,
      isPWD: false,
      isPregnant: false,
      philsysId: 'PSN-0008-8888-1111',
      philsysVerified: true,
      role: 'resident'
    },
    {
      id: 'resident-009',
      name: 'Gabriela Silang',
      firstName: 'Gabriela',
      lastName: 'Silang',
      address: 'Purok 3, Barangay San Jose, Cebu City',
      dateOfBirth: '1994-03-19',
      phone: '+63 926 456 7890',
      age: 32,
      isSenior: false,
      isPWD: false,
      isPregnant: true,
      philsysId: 'PSN-0009-9999-2222',
      philsysVerified: true,
      role: 'resident'
    },
    {
      id: 'resident-010',
      name: 'Emilio Aguinaldo',
      firstName: 'Emilio',
      lastName: 'Aguinaldo',
      address: 'Purok 9, Barangay San Jose, Cebu City',
      dateOfBirth: '1954-03-22',
      phone: '+63 927 789 0123',
      age: 72,
      isSenior: true,
      isPWD: false,
      isPregnant: false,
      philsysId: 'PSN-0010-0000-5555',
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

  // Define 20 requests with diverse statuses and priorities
  const now = new Date();
  const getPastDate = (hoursAgo) => new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();

  const requestsData = [
    {
      id: 'req-001',
      referenceNumber: 'REQ-2026-00021',
      residentId: 'resident-001',
      residentName: 'Maria Santos',
      documentType: 'barangay_clearance',
      purpose: 'Job application requirement',
      status: 'collected',
      isPriority: false,
      priorityReasons: [],
      createdAt: getPastDate(120),
      updatedAt: getPastDate(110)
    },
    {
      id: 'req-002',
      referenceNumber: 'REQ-2026-00022',
      residentId: 'resident-002',
      residentName: 'Juan dela Cruz',
      documentType: 'indigency_certificate',
      purpose: 'Medical subsidy application',
      status: 'collected',
      isPriority: true,
      priorityReasons: ['Senior Citizen (60+)'],
      createdAt: getPastDate(96),
      updatedAt: getPastDate(94)
    },
    {
      id: 'req-003',
      referenceNumber: 'REQ-2026-00023',
      residentId: 'resident-003',
      residentName: 'Antonio Luna',
      documentType: 'residency_certificate',
      purpose: 'Bank account opening',
      status: 'rejected',
      isPriority: true,
      priorityReasons: ['PWD'],
      createdAt: getPastDate(72),
      updatedAt: getPastDate(71),
      rejectionReason: 'Incorrect address detail. Does not match official records.'
    },
    {
      id: 'req-004',
      referenceNumber: 'REQ-2026-00024',
      residentId: 'resident-004',
      residentName: 'Gloria Macapagal',
      documentType: 'barangay_clearance',
      purpose: 'Senior citizen ID application',
      status: 'ready_pickup',
      isPriority: true,
      priorityReasons: ['Senior Citizen (60+)'],
      createdAt: getPastDate(48),
      updatedAt: getPastDate(46)
    },
    {
      id: 'req-005',
      referenceNumber: 'REQ-2026-00025',
      residentId: 'resident-005',
      residentName: 'Leonora Rivera',
      documentType: 'indigency_certificate',
      purpose: 'Maternity financial assistance',
      status: 'ready_pickup',
      isPriority: true,
      priorityReasons: ['Pregnant'],
      createdAt: getPastDate(36),
      updatedAt: getPastDate(34)
    },
    {
      id: 'req-006',
      referenceNumber: 'REQ-2026-00026',
      residentId: 'resident-006',
      residentName: 'Jose Rizal',
      documentType: 'residency_certificate',
      purpose: 'Scholarship program application',
      status: 'under_review',
      isPriority: false,
      priorityReasons: [],
      createdAt: getPastDate(6),
      updatedAt: getPastDate(4)
    },
    {
      id: 'req-007',
      referenceNumber: 'REQ-2026-00027',
      residentId: 'resident-007',
      residentName: 'Andres Bonifacio',
      documentType: 'barangay_clearance',
      purpose: 'Security guard license renewal',
      status: 'under_review',
      isPriority: false,
      priorityReasons: [],
      createdAt: getPastDate(5),
      updatedAt: getPastDate(3)
    },
    {
      id: 'req-008',
      referenceNumber: 'REQ-2026-00028',
      residentId: 'resident-008',
      residentName: 'Melchora Aquino',
      documentType: 'indigency_certificate',
      purpose: 'Social Pension claim',
      status: 'under_review',
      isPriority: true,
      priorityReasons: ['Senior Citizen (60+)'],
      createdAt: getPastDate(5.8), // escalates soon based on SLA
      updatedAt: getPastDate(5.5)
    },
    {
      id: 'req-009',
      referenceNumber: 'REQ-2026-00029',
      residentId: 'resident-009',
      residentName: 'Gabriela Silang',
      documentType: 'residency_certificate',
      purpose: 'Local health center enrollment',
      status: 'under_review',
      isPriority: true,
      priorityReasons: ['Pregnant'],
      createdAt: getPastDate(0.5),
      updatedAt: getPastDate(0.4)
    },
    {
      id: 'req-010',
      referenceNumber: 'REQ-2026-00030',
      residentId: 'resident-010',
      residentName: 'Emilio Aguinaldo',
      documentType: 'barangay_clearance',
      purpose: 'Franchise permit application',
      status: 'received',
      isPriority: true,
      priorityReasons: ['Senior Citizen (60+)'],
      createdAt: getPastDate(0.75),
      updatedAt: getPastDate(0.7)
    },
    {
      id: 'req-011',
      referenceNumber: 'REQ-2026-00031',
      residentId: 'resident-001',
      residentName: 'Maria Santos',
      documentType: 'indigency_certificate',
      purpose: 'School enrollment assistance',
      status: 'received',
      isPriority: false,
      priorityReasons: [],
      createdAt: getPastDate(3),
      updatedAt: getPastDate(2.8)
    },
    {
      id: 'req-012',
      referenceNumber: 'REQ-2026-00032',
      residentId: 'resident-002',
      residentName: 'Juan dela Cruz',
      documentType: 'residency_certificate',
      purpose: 'Post office transaction proof',
      status: 'received',
      isPriority: true,
      priorityReasons: ['Senior Citizen (60+)'],
      createdAt: getPastDate(2),
      updatedAt: getPastDate(1.8)
    },
    {
      id: 'req-013',
      referenceNumber: 'REQ-2026-00033',
      residentId: 'resident-003',
      residentName: 'Antonio Luna',
      documentType: 'barangay_clearance',
      purpose: 'Travel permit application',
      status: 'submitted',
      isPriority: true,
      priorityReasons: ['PWD'],
      createdAt: getPastDate(0.16), // 10m ago
      updatedAt: getPastDate(0.16)
    },
    {
      id: 'req-014',
      referenceNumber: 'REQ-2026-00034',
      residentId: 'resident-006',
      residentName: 'Jose Rizal',
      documentType: 'indigency_certificate',
      purpose: 'Hospital discharge subsidy',
      status: 'submitted',
      isPriority: false,
      priorityReasons: [],
      createdAt: getPastDate(0.25), // 15m ago
      updatedAt: getPastDate(0.25)
    },
    {
      id: 'req-015',
      referenceNumber: 'REQ-2026-00035',
      residentId: 'resident-007',
      residentName: 'Andres Bonifacio',
      documentType: 'residency_certificate',
      purpose: 'Voter registration support',
      status: 'submitted',
      isPriority: false,
      priorityReasons: [],
      createdAt: getPastDate(0.08), // 5m ago
      updatedAt: getPastDate(0.08)
    },
    {
      id: 'req-016',
      referenceNumber: 'REQ-2026-00036',
      residentId: 'resident-001',
      residentName: 'Maria Santos',
      documentType: 'barangay_clearance',
      purpose: 'Police Clearance local requirement',
      status: 'queued_offline',
      isPriority: false,
      priorityReasons: [],
      createdAt: getPastDate(1),
      updatedAt: getPastDate(1)
    },
    {
      id: 'req-017',
      referenceNumber: 'REQ-2026-00037',
      residentId: 'resident-005',
      residentName: 'Leonora Rivera',
      documentType: 'residency_certificate',
      purpose: 'Local library membership card',
      status: 'queued_offline',
      isPriority: true,
      priorityReasons: ['Pregnant'],
      createdAt: getPastDate(2),
      updatedAt: getPastDate(2)
    },
    {
      id: 'req-018',
      referenceNumber: 'REQ-2026-00038',
      residentId: 'resident-002',
      residentName: 'Juan dela Cruz',
      documentType: 'indigency_certificate',
      purpose: 'Medicines discount coupon',
      status: 'ready_pickup',
      isPriority: true,
      priorityReasons: ['Senior Citizen (60+)'],
      isProxy: true,
      proxyName: 'Juana dela Cruz',
      proxyRelationship: 'child',
      proxyToken: 'XYZ9-8765',
      proxyTokenExpiry: getPastDate(-24), // tomorrow
      createdAt: getPastDate(24),
      updatedAt: getPastDate(22)
    },
    {
      id: 'req-019',
      referenceNumber: 'REQ-2026-00039',
      residentId: 'resident-004',
      residentName: 'Gloria Macapagal',
      documentType: 'residency_certificate',
      purpose: 'Livelihood support check claim',
      status: 'ready_pickup',
      isPriority: true,
      priorityReasons: ['Senior Citizen (60+)'],
      isProxy: true,
      proxyName: 'Ferdinand Macapagal',
      proxyRelationship: 'relative',
      proxyToken: 'ABC1-2345',
      proxyTokenExpiry: getPastDate(-36), // 36 hours later
      createdAt: getPastDate(12),
      updatedAt: getPastDate(10)
    },
    {
      id: 'req-020',
      referenceNumber: 'REQ-2026-00040',
      residentId: 'resident-010',
      residentName: 'Emilio Aguinaldo',
      documentType: 'indigency_certificate',
      purpose: 'Burial support fund requirement',
      status: 'collected',
      isPriority: true,
      priorityReasons: ['Senior Citizen (60+)'],
      createdAt: getPastDate(48),
      updatedAt: getPastDate(44)
    }
  ];

  for (const req of requestsData) {
    await put(STORES.requests, req);
  }

  // Load ledger module dynamically to populate matching valid cryptolink audit chains
  const { default: ledger } = await import('./ledger.js');

  for (const req of requestsData) {
    // Skip offline queue requests from the official ledger
    if (req.status === 'queued_offline') continue;

    // Generate chronological path for ledger
    const history = [];
    if (['submitted', 'received', 'under_review', 'approved', 'ready_pickup', 'collected', 'rejected'].includes(req.status)) {
      history.push({ action: 'submitted', actor: req.residentName, timestamp: req.createdAt });
    }
    if (['received', 'under_review', 'approved', 'ready_pickup', 'collected', 'rejected'].includes(req.status)) {
      history.push({ action: 'received', actor: 'KB Trongko (Secretary)', timestamp: new Date(new Date(req.createdAt).getTime() + 10 * 60 * 1000).toISOString() });
    }
    if (['under_review', 'approved', 'ready_pickup', 'collected', 'rejected'].includes(req.status)) {
      history.push({ action: 'under_review', actor: 'Admin K. Trongko (Captain)', timestamp: new Date(new Date(req.createdAt).getTime() + 25 * 60 * 1000).toISOString() });
    }
    if (['approved', 'ready_pickup', 'collected'].includes(req.status)) {
      history.push({ action: 'approved', actor: 'Admin K. Trongko (Captain)', timestamp: req.updatedAt });
    }
    if (['collected'].includes(req.status)) {
      history.push({ action: 'collected', actor: req.isProxy ? `${req.proxyName} (Proxy)` : req.residentName, timestamp: req.updatedAt });
    }
    if (req.status === 'rejected') {
      history.push({ action: 'rejected', actor: 'Admin K. Trongko (Captain)', timestamp: req.updatedAt, remarks: req.rejectionReason });
    }

    // Append to ledger sequentially to guarantee chain validity
    for (const step of history) {
      await ledger.appendEntry({
        requestId: req.id,
        action: step.action,
        actor: step.actor,
        remarks: step.remarks || '',
        data: { referenceNumber: req.referenceNumber }
      });
    }
  }

  console.log('[Store] Rich demo data and ledger entries seeded successfully.');
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
