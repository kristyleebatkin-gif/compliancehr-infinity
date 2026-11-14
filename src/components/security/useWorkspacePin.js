import { useCallback, useEffect, useRef, useState } from 'react';
import { useRole } from '@/lib/useRole';
import {
  ACTIVITY_PING_MS,
  IDLE_LOCK_MS,
  pinProblem,
  pinRequest,
  sanitisePin,
} from '@/lib/workspacePin';

const ms = (iso) => (iso ? new Date(iso).getTime() || 0 : 0);
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'];

// Server-backed dashboard PIN lock. The server decides whether the dashboard is unlocked,
// so a refresh, a second tab or a stale tab all see the same state.
export default function useWorkspacePin(workspace) {
  const { user } = useRole();
  const userId = user?.id || '';
  const [state, setState] = useState(null); // server state: hasPin, unlocked, lockedUntil, lastChanged
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resetSentTo, setResetSentTo] = useState('');
  const lastActivity = useRef(Date.now());
  const lastPing = useRef(0);

  const apply = useCallback((data) => {
    if (data && typeof data.hasPin === 'boolean') setState(data);
    return data;
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await pinRequest(workspace, 'status');
    if (data?.error && typeof data.hasPin !== 'boolean') setError(data.error);
    return apply(data);
  }, [workspace, apply]);

  useEffect(() => {
    let active = true;
    if (!userId) { setLoading(false); return () => { active = false; }; }
    setLoading(true);
    refresh().finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, refresh]);

  const unlocked = Boolean(state?.unlocked);

  // Idle lock: 30 minutes with no activity locks this dashboard (server-side too), and
  // ongoing activity is reported to the server so other tabs stay in step.
  useEffect(() => {
    if (!unlocked) return undefined;
    lastActivity.current = Date.now();
    const onActivity = () => {
      lastActivity.current = Date.now();
      if (Date.now() - lastPing.current > ACTIVITY_PING_MS) {
        lastPing.current = Date.now();
        pinRequest(workspace, 'activity').then(({ data }) => apply(data));
      }
    };
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(() => {
      const serverExpired = state?.unlockedUntil && ms(state.unlockedUntil) <= Date.now();
      if (Date.now() - lastActivity.current >= IDLE_LOCK_MS || serverExpired) {
        pinRequest(workspace, 'lock').then(({ data }) => apply(data));
        setNotice('Locked after 30 minutes without activity.');
      }
    }, 30 * 1000);
    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(timer);
    };
  }, [unlocked, workspace, apply, refresh, state?.unlockedUntil]);

  const run = async (action, payload, successNotice = '') => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { ok, data } = await pinRequest(workspace, action, payload);
      apply(data);
      if (!ok) { setError(data?.error || 'That did not work. Please try again.'); return false; }
      if (successNotice) setNotice(successNotice);
      return true;
    } finally {
      setBusy(false);
    }
  };

  const create = async (pin, confirmPin) => {
    const problem = pinProblem(pin);
    if (problem) { setError(problem); return false; }
    if (sanitisePin(pin) !== sanitisePin(confirmPin)) { setError('The two PINs do not match.'); return false; }
    return run('set', { pin: sanitisePin(pin) }, 'Security PIN set for this dashboard.');
  };

  const unlock = async (pin) => {
    const problem = pinProblem(pin);
    if (problem) { setError(problem); return false; }
    lastActivity.current = Date.now();
    return run('unlock', { pin: sanitisePin(pin) });
  };

  const change = async (currentPin, nextPin, confirmPin) => {
    const problem = pinProblem(currentPin) || pinProblem(nextPin);
    if (problem) { setError(problem); return false; }
    if (sanitisePin(nextPin) !== sanitisePin(confirmPin)) { setError('The two new PINs do not match.'); return false; }
    return run('change', { currentPin: sanitisePin(currentPin), newPin: sanitisePin(nextPin) }, 'Security PIN updated.');
  };

  // Forgotten PIN: a one-time code goes to the account's own email address.
  const requestReset = async () => {
    setBusy(true);
    setError('');
    try {
      const { ok, data } = await pinRequest(workspace, 'requestReset');
      if (!ok) { setError(data?.error || 'The reset code could not be sent.'); return false; }
      setResetSentTo(data?.to || 'your email');
      setNotice(`A 6-digit code was sent to ${data?.to || 'your email'}. It expires in 15 minutes.`);
      return true;
    } finally {
      setBusy(false);
    }
  };

  const confirmReset = async (code, nextPin, confirmPin) => {
    const problem = pinProblem(nextPin);
    if (problem) { setError(problem); return false; }
    if (sanitisePin(nextPin) !== sanitisePin(confirmPin)) { setError('The two new PINs do not match.'); return false; }
    const ok = await run('confirmReset', { code: String(code || '').replace(/\D/g, ''), newPin: sanitisePin(nextPin) }, 'PIN reset. Dashboard unlocked.');
    if (ok) setResetSentTo('');
    return ok;
  };

  const lock = () => {
    setError('');
    setNotice('');
    pinRequest(workspace, 'lock').then(({ data }) => apply(data));
    setState((s) => (s ? { ...s, unlocked: false } : s));
  };

  const clearMessages = () => { setError(''); setNotice(''); };

  return {
    record: state?.hasPin ? { last_changed_at: state.lastChanged } : null,
    loading,
    unlocked,
    busy,
    error,
    notice,
    lockedUntil: ms(state?.lockedUntil),
    attemptsLeft: state?.attemptsLeft,
    resetSentTo,
    create,
    unlock,
    change,
    requestReset,
    confirmReset,
    lock,
    clearMessages,
  };
}
