/* ============================================
   BarangayConnect — SMS Simulator
   ============================================ */

import store from './store.js';
import { showToast } from './components/toast.js';

const { STORES } = store;

// ---- SMS Templates (Cebuano) ----
const templates = {
  submitted: (data) =>
    `BarangayConnect: Ang imong hangyo para sa ${data.documentType} na-submit na. Reference: ${data.referenceNumber}. Maghulat lang sa update.`,

  received: (data) =>
    `BarangayConnect: Ang imong hangyo ${data.referenceNumber} nadawat na sa Secretary. I-review kini sa labing madali.`,

  approved: (data) =>
    `BarangayConnect: Ang imong ${data.documentType} approved na. Pwede na nimong kuhaon sa Barangay Hall. Ref: ${data.referenceNumber}`,

  rejected: (data) =>
    `BarangayConnect: Pasensya, ang imong hangyo ${data.referenceNumber} wala ma-approve. Reason: ${data.remarks || 'Wala\'y gihatag nga rason.'}`,

  ready_pickup: (data) =>
    `BarangayConnect: Ang imong ${data.documentType} andam na para kuhaon sa Barangay Hall. Dal-a ang imong QR code. Ref: ${data.referenceNumber}`,

  proxy_token: (data) =>
    `BarangayConnect: Proxy authorization token para sa ${data.documentType}: ${data.proxyToken}. I-present kini sa Barangay Hall. Valid hangtod ${data.tokenExpiry}.`,

  collected: (data) =>
    `BarangayConnect: Ang imong ${data.documentType} nakuha na. Ref: ${data.referenceNumber}. Salamat sa paggamit sa BarangayConnect!`,

  synced: (data) =>
    `BarangayConnect: Ang imong queued nga hangyo na-sync na. Reference: ${data.referenceNumber}. Ang imong hangyo naa na sa official queue.`
};

// ---- Send SMS ----
async function sendSMS(type, recipientId, data) {
  const template = templates[type];
  if (!template) {
    console.warn(`[SMS] Unknown template type: ${type}`);
    return null;
  }

  const message = template(data);
  const resident = await store.getById(STORES.residents, recipientId);

  const smsEntry = {
    id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    requestId: data.requestId || data.id,
    recipientId,
    recipientName: resident ? resident.name : 'Unknown',
    recipientPhone: resident ? resident.phone : 'N/A',
    type,
    message,
    sentAt: new Date().toISOString(),
    status: 'delivered' // Always "delivered" in simulation
  };

  await store.put(STORES.smsLog, smsEntry);

  // Show toast notification as "SMS received"
  showToast({
    type: 'sms',
    title: 'SMS Notification',
    message: message.substring(0, 120) + (message.length > 120 ? '...' : ''),
    duration: 6000
  });

  return smsEntry;
}

// ---- Get SMS Log ----
async function getSMSLog() {
  const all = await store.getAll(STORES.smsLog);
  all.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  return all;
}

async function getSMSForRequest(requestId) {
  return store.getByIndex(STORES.smsLog, 'requestId', requestId);
}

export const sms = {
  sendSMS,
  getSMSLog,
  getSMSForRequest,
  templates
};

export default sms;
