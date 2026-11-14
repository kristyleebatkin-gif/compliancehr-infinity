import { base44 } from '@/api/base44Client';

// Dashboard PIN lock (audit HIGH-02). All checks run in the workspacePin backend function;
// the browser never sees the PIN hash and cannot change the attempt counter or lockout.
export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 8;
export const MAX_PIN_ATTEMPTS = 5;
export const PIN_LOCK_MINUTES = 30;
export const IDLE_LOCK_MS = 30 * 60 * 1000;
// How often ongoing activity is reported to the server to keep the session open.
export const ACTIVITY_PING_MS = 4 * 60 * 1000;

export function sanitisePin(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, PIN_MAX_LENGTH);
}

export function pinProblem(pin) {
  const clean = sanitisePin(pin);
  if (!clean) return 'Enter your PIN.';
  if (clean.length < PIN_MIN_LENGTH) return `Use at least ${PIN_MIN_LENGTH} digits.`;
  return '';
}

// Calls the server. Resolves to { ok, status, data } and never throws for an expected refusal.
export async function pinRequest(workspace, action, payload = {}) {
  try {
    const res = await base44.functions.invoke('workspacePin', { workspace, action, ...payload });
    const data = res?.data ?? res ?? {};
    return { ok: !data.error, status: 200, data };
  } catch (err) {
    const data = err?.response?.data || err?.data || {};
    const status = err?.response?.status || err?.status || 0;
    return { ok: false, status, data: { error: data.error || err?.message || 'The PIN service could not be reached.', ...data } };
  }
}
