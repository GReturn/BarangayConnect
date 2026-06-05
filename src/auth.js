/* ============================================
   BarangayConnect — Demo Auth
   ============================================ */

import store from './store.js';

const { STORES } = store;

const SESSION_KEY = 'brgyconnect_session';

let currentUser = null;
let authListeners = new Set();

// ---- Init ----
async function init() {
  const saved = localStorage.getItem(SESSION_KEY);
  if (saved) {
    try {
      const session = JSON.parse(saved);
      currentUser = await store.getById(STORES.residents, session.userId);
    } catch (e) {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  // Default to Maria Santos if no session
  if (!currentUser) {
    currentUser = await store.getById(STORES.residents, 'resident-001');
    if (currentUser) saveSession();
  }
}

function saveSession() {
  if (currentUser) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      userId: currentUser.id,
      timestamp: Date.now()
    }));
  }
}

// ---- Switch User ----
async function switchUser(userId) {
  currentUser = await store.getById(STORES.residents, userId);
  if (currentUser) {
    saveSession();
    notifyListeners();
  }
  return currentUser;
}

// ---- Getters ----
function getCurrentUser() {
  return currentUser;
}

function isResident() {
  return currentUser && currentUser.role === 'resident';
}

function isOfficial() {
  return currentUser && currentUser.role === 'official';
}

function getUserInitials() {
  if (!currentUser) return '?';
  const parts = currentUser.name.split(' ');
  return parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Maayong buntag';
  if (hour < 18) return 'Maayong hapon';
  return 'Maayong gabii';
}

// ---- Get All Users (for switcher) ----
async function getAllUsers() {
  return store.getAll(STORES.residents);
}

// ---- Listeners ----
function onAuthChange(callback) {
  authListeners.add(callback);
  return () => authListeners.delete(callback);
}

function notifyListeners() {
  authListeners.forEach(cb => {
    try { cb(currentUser); } catch (e) { console.error(e); }
  });
}

export const auth = {
  init,
  switchUser,
  getCurrentUser,
  isResident,
  isOfficial,
  getUserInitials,
  getGreeting,
  getAllUsers,
  onAuthChange
};

export default auth;
