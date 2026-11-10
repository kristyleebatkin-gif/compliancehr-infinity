import { useCallback, useEffect, useState } from 'react';
import { useRole } from '@/lib/useRole';
import {
  MAX_PIN_ATTEMPTS,
  PIN_LOCK_MS,
  createPin,
  deletePinRecord,
  loadPinRecord,
  lockMsLeft,
  matchesPin,
  pinProblem,
  replacePin,
  sanitisePin,
  updatePinRecord
} from '@/lib/workspacePin';

const unlockedKey = (workspace, userId) => `chr-workspace-unlocked:${workspace}:${userId || 'anon'}`;
const attemptsText = (left) => `${left} attempt${left === 1 ? '' : 's'} left.`;

export default function useWorkspacePin(workspace) {
  const { user } = useRole();
  const userId = user?.id || '';
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [lockedUntil, setLockedUntil] = useState(0);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    loadPinRecord(workspace, userId)
      .then((found) => {
        if (!active) return;
        setRecord(found);
        setLockedUntil(Date.now() + lockMsLeft(found));
        setUnlocked(Boolean(found) && sessionStorage.getItem(unlockedKey(workspace, userId)) === '1');
      })
      .catch((err) => { if (active) setError(err?.message || 'The security PIN could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [workspace, userId]);

  const remember = useCallback((value) => {
    if (!userId) return;
    if (value) sessionStorage.setItem(unlockedKey(workspace, userId), '1');
    else sessionStorage.removeItem(unlockedKey(workspace, userId));
  }, [workspace, userId]);

  const create = async (pin, confirmPin) => {
    const problem = pinProblem(pin);
    if (problem) { setError(problem); return false; }
    if (sanitisePin(pin) !== sanitisePin(confirmPin)) { setError('The two PINs do not match.'); return false; }
    setBusy(true);
    setError('');
    try {
      const saved = await createPin(workspace, pin);
      setRecord(saved);
      setUnlocked(true);
      setLockedUntil(0);
      remember(true);
      setNotice('Security PIN set for this dashboard.');
      return true;
    } catch (err) {
      setError(err?.message || 'The PIN could not be saved.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const unlock = async (pin) => {
    if (!record) { setError('No security PIN is set for this dashboard.'); return false; }
    if (lockedUntil > Date.now()) { setError('Too many incorrect attempts. Please wait before trying again.'); return false; }
    const problem = pinProblem(pin);
    if (problem) { setError(problem); return false; }
    setBusy(true);
    setError('');
    try {
      if (await matchesPin(record, pin)) {
        const cleared = { failed_attempts: 0, locked_until: null };
        await updatePinRecord(record, cleared).catch(() => null);
        setRecord({ ...record, ...cleared });
        setUnlocked(true);
        remember(true);
        return true;
      }
      const attempts = (record.failed_attempts || 0) + 1;
      const shouldLock = attempts >= MAX_PIN_ATTEMPTS;
      const patch = {
        failed_attempts: shouldLock ? 0 : attempts,
        locked_until: shouldLock ? new Date(Date.now() + PIN_LOCK_MS).toISOString() : null
      };
      await updatePinRecord(record, patch).catch(() => null);
      setRecord({ ...record, ...patch });
      if (shouldLock) setLockedUntil(Date.now() + PIN_LOCK_MS);
      setError(shouldLock
        ? 'Too many incorrect attempts. Try again in 60 seconds.'
        : `Incorrect PIN. ${attemptsText(MAX_PIN_ATTEMPTS - attempts)}`);
      return false;
    } catch (err) {
      setError(err?.message || 'The PIN could not be checked.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const change = async (currentPin, nextPin, confirmPin) => {
    if (!record) { setError('No security PIN is set for this dashboard.'); return false; }
    const currentProblem = pinProblem(currentPin);
    if (currentProblem) { setError(currentProblem); return false; }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (!(await matchesPin(record, currentPin))) {
        setError('Your current PIN is incorrect.');
        return false;
      }
      const nextProblem = pinProblem(nextPin);
      if (nextProblem) { setError(nextProblem); return false; }
      if (sanitisePin(nextPin) !== sanitisePin(confirmPin)) { setError('The two new PINs do not match.'); return false; }
      const saved = await replacePin(record, nextPin);
      setRecord({ ...record, ...(saved || {}) });
      setLockedUntil(0);
      setNotice('Security PIN updated.');
      return true;
    } catch (err) {
      setError(err?.message || 'The PIN could not be changed.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!record) return false;
    setBusy(true);
    setError('');
    try {
      await deletePinRecord(record);
      setRecord(null);
      setUnlocked(false);
      setLockedUntil(0);
      remember(false);
      setNotice('Security PIN removed. Set a new PIN to protect this dashboard.');
      return true;
    } catch (err) {
      setError(err?.message || 'The PIN could not be reset.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const lock = () => {
    setUnlocked(false);
    setError('');
    setNotice('');
    remember(false);
  };

  const clearMessages = () => { setError(''); setNotice(''); };

  return {
    record,
    loading,
    unlocked,
    busy,
    error,
    notice,
    lockedUntil,
    create,
    unlock,
    change,
    reset,
    lock,
    clearMessages
  };
}