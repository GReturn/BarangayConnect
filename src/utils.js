/* ============================================
   BarangayConnect — Utilities
   ============================================ */

// ---- Reference Number Generator ----
let requestCounter = parseInt(localStorage.getItem('brgyconnect_req_counter') || '141', 10);

export function generateReferenceNumber() {
  requestCounter++;
  localStorage.setItem('brgyconnect_req_counter', requestCounter.toString());
  const year = new Date().getFullYear();
  return `REQ-${year}-${requestCounter.toString().padStart(5, '0')}`;
}

// ---- ID Generator ----
export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
}

// ---- Date/Time Formatting ----
export function formatDateTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

export function formatDateTimeUTC(isoString) {
  const d = new Date(isoString);
  return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
}

export function formatDateShort(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTimeAgo(isoString) {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---- SLA Timer ----
const SLA_HOURS = 8; // 8 hours from submission to approval

export function getSLAInfo(submittedAt) {
  const submitted = new Date(submittedAt);
  const deadline = new Date(submitted.getTime() + SLA_HOURS * 60 * 60 * 1000);
  const now = new Date();
  const remaining = deadline.getTime() - now.getTime();

  if (remaining <= 0) {
    return { expired: true, text: 'SLA expired', hours: 0, minutes: 0, urgency: 'critical' };
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  let urgency = 'normal';
  if (hours < 1) urgency = 'critical';
  else if (hours < 2) urgency = 'warning';
  else if (hours < 4) urgency = 'caution';

  return {
    expired: false,
    text: `${hours}h ${minutes.toString().padStart(2, '0')}m`,
    hours,
    minutes,
    urgency,
    deadline: deadline.toISOString()
  };
}

// ---- Priority Detection ----
export function detectPriority(resident, flags = {}) {
  const reasons = [];

  if (resident.isSenior || resident.age >= 60) {
    reasons.push('Senior Citizen (60+)');
  }
  if (resident.isPWD || flags.isPWD) {
    reasons.push('PWD');
  }
  if (resident.isPregnant || flags.isPregnant) {
    reasons.push('Pregnant');
  }
  if (flags.isSenior) {
    reasons.push('Senior Citizen (60+)');
  }

  return {
    isPriority: reasons.length > 0,
    reasons: [...new Set(reasons)]
  };
}

// ---- Document Types ----
export const DOCUMENT_TYPES = [
  { value: 'barangay_clearance', label: 'Barangay Clearance' },
  { value: 'indigency_certificate', label: 'Indigency Certificate' },
  { value: 'residency_certificate', label: 'Certificate of Residency' },
  { value: 'business_permit', label: 'Barangay Business Permit' },
  { value: 'cedula', label: 'Community Tax Certificate (Cedula)' }
];

export function getDocumentTypeLabel(value) {
  const dt = DOCUMENT_TYPES.find(d => d.value === value);
  return dt ? dt.label : value;
}

// ---- Request Statuses ----
export const REQUEST_STATUSES = {
  queued_offline: { label: 'Queued (Offline)', color: 'warning', icon: '📡' },
  submitted: { label: 'Submitted', color: 'accent', icon: '📋' },
  received: { label: 'Received by Secretary', color: 'accent', icon: '📨' },
  under_review: { label: 'Under Review by Captain', color: 'system', icon: '🔍' },
  approved: { label: 'Approved', color: 'success', icon: '✅' },
  rejected: { label: 'Rejected', color: 'error', icon: '❌' },
  ready_pickup: { label: 'Ready for Pickup', color: 'success', icon: '📦' },
  collected: { label: 'Collected', color: 'success', icon: '✓' }
};

export function getStatusInfo(status) {
  return REQUEST_STATUSES[status] || { label: status, color: 'neutral', icon: '⚬' };
}

// ---- Pipeline Steps ----
export const PIPELINE_STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'received', label: 'Received by Secretary' },
  { key: 'under_review', label: 'Under Review by Captain' },
  { key: 'ready_pickup', label: 'Ready for Pickup' }
];

export function getPipelineState(status) {
  const statusOrder = ['submitted', 'received', 'under_review', 'approved', 'ready_pickup', 'collected'];
  const currentIndex = statusOrder.indexOf(status);

  return PIPELINE_STEPS.map((step, i) => {
    const stepIndex = statusOrder.indexOf(step.key);
    let state = 'pending';
    if (currentIndex >= stepIndex && currentIndex >= 0) {
      state = 'done';
    }
    // If approved/collected and on ready_pickup step, mark as done
    if ((status === 'approved' || status === 'ready_pickup' || status === 'collected') && step.key === 'ready_pickup') {
      state = 'done';
    }
    // The step immediately at the current status is "active" if not fully done
    if (stepIndex === currentIndex && status !== 'collected' && status !== 'approved' && status !== 'ready_pickup') {
      state = 'active';
    }
    return { ...step, state };
  });
}

// ---- Proxy Token ----
export function generateProxyToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) token += '-';
  }
  return token;
}

export function getProxyTokenExpiry() {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 48);
  return expiry.toISOString();
}

// ---- QR Code Generator (Simple SVG) ----
export function generateQRCodeSVG(data, size = 120) {
  // Simple visual QR placeholder — for a real app, use a library like qrcode-generator
  const cells = 21;
  const cellSize = size / cells;
  let rects = '';

  // Generate deterministic pattern from data string
  const hash = simpleHash(data);
  const bits = [];
  for (let i = 0; i < cells * cells; i++) {
    bits.push((hash[i % hash.length] + i * 7) % 3 === 0);
  }

  // Always-on: position patterns (3 corners)
  const setRect = (r, c) => {
    bits[r * cells + c] = true;
  };

  // Top-left, top-right, bottom-left position patterns
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      const isOuter = i === 0 || i === 6 || j === 0 || j === 6;
      const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
      if (isOuter || isInner) {
        setRect(i, j);
        setRect(i, cells - 7 + j);
        setRect(cells - 7 + i, j);
      }
    }
  }

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (bits[r * cells + c]) {
        rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#00c9a7" rx="1"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="background:#0f1b2d;border-radius:8px;padding:8px">${rects}</svg>`;
}

function simpleHash(str) {
  const arr = [];
  for (let i = 0; i < str.length; i++) {
    arr.push(str.charCodeAt(i));
  }
  // Expand to enough values
  while (arr.length < 500) {
    arr.push((arr[arr.length - 1] * 31 + arr[arr.length - 2] * 17 + 7) % 256);
  }
  return arr;
}

// ---- Escape HTML ----
export function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
