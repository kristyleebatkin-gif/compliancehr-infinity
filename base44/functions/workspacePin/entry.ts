// Server-side dashboard PIN lock (audit HIGH-02). Agreed rules (Kristy, 14 Nov 2026):
//   - each person has their own PIN per protected workspace
//   - 5 wrong attempts -> locked for 30 minutes
//   - unlocked session ends after 30 minutes without activity
//   - forgotten PIN: a one-time code is emailed to the account's own address
// The PIN record is readable and writable by the server only (service-role RLS), so the
// browser never sees the hash and cannot reset the attempt counter or lockout.
//
// LIMITATION (stated honestly): this locks the dashboard screens. Base44 does not let an app
// revoke or suspend a signed-in session token, so a person who already holds the signed-in
// session could still call the data API directly. Data protection rests on sign-in, roles and
// the business access rules; the PIN is an extra screen lock for a shared or unattended device.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { hasApprovedAccess } from '../../shared/roleMatrix.ts';

export const PIN_RULES = {
  minLength: 4,
  maxLength: 8,
  maxAttempts: 5,
  lockMs: 30 * 60 * 1000,
  idleMs: 30 * 60 * 1000,
  resetCodeMs: 15 * 60 * 1000,
  resetMaxAttempts: 5,
  resetResendMs: 60 * 1000,
  pbkdf2Iterations: 210000,
};
const WORKSPACES = new Set(['today', 'team-leader']);

const enc = new TextEncoder();
const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
const randomHex = (bytes = 16) => hex(crypto.getRandomValues(new Uint8Array(bytes)).buffer);
const cleanPin = (v: unknown) => String(v ?? '').replace(/\D/g, '');

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function pbkdf2(secret: string, salt: string, iterations: number) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations }, key, 256);
  return hex(bits);
}

async function hashPin(pin: string) {
  const salt = randomHex(16);
  const iterations = PIN_RULES.pbkdf2Iterations;
  return { pin_salt: salt, pin_hash: `pbkdf2$${iterations}$${await pbkdf2(pin, salt, iterations)}` };
}

// Accepts the current PBKDF2 format and the older browser-made SHA-256 format (upgraded on success).
async function pinMatches(record: any, pin: string) {
  const stored = String(record?.pin_hash || '');
  if (stored.startsWith('pbkdf2$')) {
    const [, iter, digest] = stored.split('$');
    return timingSafeEqual(await pbkdf2(pin, record.pin_salt, Number(iter)), digest);
  }
  if (stored.startsWith('sha256:')) {
    const legacy = hex(await crypto.subtle.digest('SHA-256', enc.encode(`compliancehr:${record.pin_salt}:${pin}`)));
    return timingSafeEqual(`sha256:${legacy}`, stored);
  }
  return false;
}

function pinProblem(pin: string) {
  if (!pin) return 'Enter your PIN.';
  if (pin.length < PIN_RULES.minLength) return `Use at least ${PIN_RULES.minLength} digits.`;
  if (pin.length > PIN_RULES.maxLength) return `Use at most ${PIN_RULES.maxLength} digits.`;
  if (/^(\d)\1+$/.test(pin) || '0123456789'.includes(pin) || '9876543210'.includes(pin)) {
    return 'Choose a PIN that is not a repeated or running sequence of digits.';
  }
  return '';
}

const ms = (iso?: string | null) => (iso ? new Date(iso).getTime() || 0 : 0);

function publicState(record: any, now: number) {
  if (!record) return { hasPin: false, unlocked: false, lockedUntil: null, lastChanged: null };
  const lockedUntil = ms(record.locked_until) > now ? record.locked_until : null;
  return {
    hasPin: true,
    unlocked: !lockedUntil && ms(record.unlocked_until) > now,
    unlockedUntil: ms(record.unlocked_until) > now ? record.unlocked_until : null,
    lockedUntil,
    attemptsLeft: PIN_RULES.maxAttempts - (record.failed_attempts || 0),
    lastChanged: record.last_changed_at || null,
  };
}

export default async function reqHandler(req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasApprovedAccess(user)) return Response.json({ error: 'Account not approved' }, { status: 403 });

    const body: any = await req.json().catch(() => ({}));
    const action = String(body?.action || 'status');
    const workspace = String(body?.workspace || '');
    if (!WORKSPACES.has(workspace)) return Response.json({ error: 'Unknown workspace' }, { status: 400 });

    const svc = base44.asServiceRole.entities;
    const now = Date.now();
    const page: any = await svc.WorkspaceSecurityPin.filter({ workspace, owner_user_id: user.id }, { sort: '-created_date', limit: 1 });
    let record: any = (Array.isArray(page) ? page : page?.items || [])[0] || null;
    if (!record) {
      // Older records were owned through created_by_id only.
      const legacy: any = await svc.WorkspaceSecurityPin.filter({ workspace, created_by_id: user.id }, { sort: '-created_date', limit: 1 });
      record = (Array.isArray(legacy) ? legacy : legacy?.items || [])[0] || null;
    }

    const audit = (what: string, details = '') =>
      svc.AuditLog.create({
        tenant_id: user.tenant_id || user.data?.tenant_id || '',
        action: `Dashboard PIN: ${what}`,
        entity_type: 'WorkspaceSecurityPin',
        record_id: record?.id || '',
        record_title: workspace,
        performed_by: user.full_name || user.email,
        performed_by_user_id: user.id,
        performed_by_email: user.email,
        performed_by_role: user.role,
        details,
        timestamp: new Date().toISOString(),
      }).catch(() => null);

    const save = async (patch: any) => {
      record = { ...record, ...patch };
      await svc.WorkspaceSecurityPin.update(record.id, patch);
    };

    if (action === 'status') return Response.json(publicState(record, now));

    if (action === 'set') {
      if (record) return Response.json({ error: 'A PIN is already set. Use change, or forgotten PIN.' }, { status: 409 });
      const pin = cleanPin(body.pin);
      const problem = pinProblem(pin);
      if (problem) return Response.json({ error: problem }, { status: 400 });
      record = await svc.WorkspaceSecurityPin.create({
        workspace,
        owner_user_id: user.id,
        tenant_id: user.tenant_id || user.data?.tenant_id || '',
        ...(await hashPin(pin)),
        failed_attempts: 0,
        locked_until: null,
        unlocked_until: new Date(now + PIN_RULES.idleMs).toISOString(),
        last_changed_at: new Date(now).toISOString(),
      });
      await audit('set');
      return Response.json(publicState(record, now));
    }

    if (!record) return Response.json({ error: 'No PIN is set for this dashboard.', ...publicState(null, now) }, { status: 404 });

    if (action === 'unlock' || action === 'change') {
      if (ms(record.locked_until) > now) {
        return Response.json({ error: 'Too many incorrect attempts. Try again later.', ...publicState(record, now) }, { status: 423 });
      }
      const pin = cleanPin(action === 'change' ? body.currentPin : body.pin);
      if (!(await pinMatches(record, pin))) {
        const attempts = (record.failed_attempts || 0) + 1;
        const lockNow = attempts >= PIN_RULES.maxAttempts;
        await save({
          failed_attempts: lockNow ? 0 : attempts,
          locked_until: lockNow ? new Date(now + PIN_RULES.lockMs).toISOString() : null,
          unlocked_until: null,
        });
        if (lockNow) await audit('locked out after 5 wrong attempts');
        return Response.json({
          error: lockNow ? 'Too many incorrect attempts. This dashboard is locked for 30 minutes.' : 'Incorrect PIN.',
          ...publicState(record, now),
        }, { status: lockNow ? 423 : 401 });
      }
      if (action === 'change') {
        const next = cleanPin(body.newPin);
        const problem = pinProblem(next);
        if (problem) return Response.json({ error: problem }, { status: 400 });
        await save({ ...(await hashPin(next)), failed_attempts: 0, locked_until: null, last_changed_at: new Date(now).toISOString(), unlocked_until: new Date(now + PIN_RULES.idleMs).toISOString() });
        await audit('changed');
        return Response.json(publicState(record, now));
      }
      const upgrade = String(record.pin_hash || '').startsWith('pbkdf2$') ? {} : await hashPin(pin);
      await save({ ...upgrade, failed_attempts: 0, locked_until: null, unlocked_until: new Date(now + PIN_RULES.idleMs).toISOString() });
      return Response.json(publicState(record, now));
    }

    if (action === 'activity') {
      // Extends an active session; never revives one that has already timed out.
      if (ms(record.unlocked_until) > now && !(ms(record.locked_until) > now)) {
        await save({ unlocked_until: new Date(now + PIN_RULES.idleMs).toISOString() });
      }
      return Response.json(publicState(record, now));
    }

    if (action === 'lock') {
      await save({ unlocked_until: null });
      return Response.json(publicState(record, now));
    }

    if (action === 'requestReset') {
      if (!user.email) return Response.json({ error: 'This account has no email address for a reset code.' }, { status: 400 });
      if (ms(record.reset_code_sent_at) + PIN_RULES.resetResendMs > now) {
        return Response.json({ error: 'A code was sent less than a minute ago. Check your email.' }, { status: 429 });
      }
      const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
      const codeSalt = randomHex(16);
      await save({
        reset_code_hash: `${codeSalt}$${await pbkdf2(code, codeSalt, 100000)}`,
        reset_code_expires_at: new Date(now + PIN_RULES.resetCodeMs).toISOString(),
        reset_code_attempts: 0,
        reset_code_sent_at: new Date(now).toISOString(),
      });
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        from_name: 'ComplianceHR Infinity',
        subject: 'Your dashboard PIN reset code',
        body: `Your code to reset the dashboard PIN is ${code}.\n\nIt expires in 15 minutes. If you did not ask for this, ignore this email and tell your administrator.`,
      });
      await audit('reset code emailed');
      return Response.json({ sent: true, to: user.email.replace(/^(.).*(@.*)$/, '$1•••$2') });
    }

    if (action === 'confirmReset') {
      const code = cleanPin(body.code);
      const [salt, digest] = String(record.reset_code_hash || '').split('$');
      const expired = ms(record.reset_code_expires_at) <= now;
      const tooMany = (record.reset_code_attempts || 0) >= PIN_RULES.resetMaxAttempts;
      if (!salt || expired || tooMany) {
        return Response.json({ error: 'This code has expired or been used up. Request a new code.' }, { status: 410 });
      }
      if (!timingSafeEqual(await pbkdf2(code, salt, 100000), digest)) {
        await save({ reset_code_attempts: (record.reset_code_attempts || 0) + 1 });
        return Response.json({ error: 'That code is not correct.' }, { status: 401 });
      }
      const next = cleanPin(body.newPin);
      const problem = pinProblem(next);
      if (problem) return Response.json({ error: problem }, { status: 400 });
      await save({
        ...(await hashPin(next)),
        failed_attempts: 0,
        locked_until: null,
        reset_code_hash: null,
        reset_code_expires_at: null,
        reset_code_attempts: 0,
        last_changed_at: new Date(now).toISOString(),
        unlocked_until: new Date(now + PIN_RULES.idleMs).toISOString(),
      });
      await audit('reset with emailed code');
      return Response.json(publicState(record, now));
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: String((err as any)?.message || err) }, { status: 500 });
  }
}
