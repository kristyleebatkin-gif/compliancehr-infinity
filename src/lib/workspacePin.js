import { base44 } from '@/api/base44Client';

export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 8;
export const MAX_PIN_ATTEMPTS = 5;
export const PIN_LOCK_MS = 60000;

export function sanitisePin(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, PIN_MAX_LENGTH);
}

export function pinProblem(pin) {
  const clean = sanitisePin(pin);
  if (!clean) return 'Enter your PIN.';
  if (clean.length < PIN_MIN_LENGTH) return `Use at least ${PIN_MIN_LENGTH} digits.`;
  return '';
}

const toHex = (bytes) => Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');

function randomSalt() {
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  return toHex(bytes);
}

// Deterministic fallback for browsers without Web Crypto; only used when subtle is unavailable.
function basicHash(text) {
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) hash = ((hash << 5) + hash + text.charCodeAt(index)) >>> 0;
  return hash.toString(16);
}

export async function hashPin(pin, salt) {
  const payload = `compliancehr:${salt}:${sanitisePin(pin)}`;
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
    return `sha256:${toHex(digest)}`;
  }
  return `basic:${basicHash(payload)}`;
}

export async function loadPinRecord(workspace, userId) {
  const page = await base44.entities.WorkspaceSecurityPin.filter(
    { workspace, created_by_id: userId },
    { sort: '-created_date', limit: 1 }
  );
  return page?.items?.[0] || null;
}

async function buildPinFields(pin) {
  const pin_salt = randomSalt();
  const pin_hash = await hashPin(pin, pin_salt);
  return { pin_salt, pin_hash, failed_attempts: 0, locked_until: null, last_changed_at: new Date().toISOString() };
}

export async function createPin(workspace, pin) {
  return base44.entities.WorkspaceSecurityPin.create({ workspace, ...(await buildPinFields(pin)) });
}

export async function replacePin(record, pin) {
  return base44.entities.WorkspaceSecurityPin.update(record.id, await buildPinFields(pin));
}

export function updatePinRecord(record, patch) {
  return base44.entities.WorkspaceSecurityPin.update(record.id, patch);
}

export function deletePinRecord(record) {
  return base44.entities.WorkspaceSecurityPin.delete(record.id);
}

export function matchesPin(record, pin) {
  return hashPin(pin, record.pin_salt).then((hash) => hash === record.pin_hash);
}

export function lockMsLeft(record) {
  const until = record?.locked_until ? new Date(record.locked_until).getTime() : 0;
  return Number.isFinite(until) ? Math.max(0, until - Date.now()) : 0;
}