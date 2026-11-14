import React, { useEffect, useState } from 'react';
import { KeyRound, Loader2, Mail } from 'lucide-react';
import PinInput from '@/components/security/PinInput';

const secondsUntil = (timestamp) => Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// Lock screen. A forgotten PIN can only be replaced with a one-time code emailed to the
// account's own address; there is no way to remove the PIN from this screen.
export default function SecurityPinUnlock({
  workspaceLabel, busy, error, notice, lockedUntil, lastChanged, attemptsLeft,
  resetSentTo, onUnlock, onRequestReset, onConfirmReset,
}) {
  const [pin, setPin] = useState('');
  const [remaining, setRemaining] = useState(() => secondsUntil(lockedUntil || 0));
  const [resetOpen, setResetOpen] = useState(false);
  const [code, setCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    setRemaining(secondsUntil(lockedUntil || 0));
    if (!lockedUntil) return undefined;
    const timer = setInterval(() => setRemaining(secondsUntil(lockedUntil)), 1000);
    return () => clearInterval(timer);
  }, [lockedUntil]);

  const lockedOut = remaining > 0;
  const submit = () => {
    if (busy || lockedOut) return;
    onUnlock(pin);
    setPin('');
  };

  return (
    <section className="rounded-2xl border border-header-foreground/20 bg-workspace-navy/40 p-5 text-header-foreground shadow-panel backdrop-blur-xl">
      <h2 className="flex items-center gap-2 text-base font-extrabold">
        <KeyRound className="h-4 w-4" /> Enter your security PIN
      </h2>
      <p className="mt-1 text-xs font-semibold leading-relaxed text-header-foreground/70">
        {workspaceLabel} is locked. {lastChanged ? `PIN last changed ${lastChanged}.` : 'Enter your PIN to continue.'}
      </p>

      {!resetOpen && (
        <>
          <div className="mt-4">
            <PinInput id="workspace-pin-unlock" label="Security PIN" value={pin} onChange={setPin} onEnter={submit} autoFocus disabled={busy || lockedOut} />
          </div>
          {lockedOut ? (
            <p role="alert" className="mt-3 text-xs font-extrabold text-[#FFC7E4]">
              Too many incorrect attempts. Locked for {clock(remaining)}.
            </p>
          ) : error ? (
            <p role="alert" className="mt-3 text-xs font-extrabold text-[#FFC7E4]">
              {error}{typeof attemptsLeft === 'number' && attemptsLeft > 0 && /Incorrect/.test(error) ? ` ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left.` : ''}
            </p>
          ) : notice ? (
            <p role="status" className="mt-3 text-xs font-bold text-header-foreground/80">{notice}</p>
          ) : null}
          <button
            type="button"
            onClick={submit}
            disabled={busy || lockedOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-header-foreground px-4 py-2.5 text-sm font-extrabold text-workspace-navy transition hover:bg-header-foreground/90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {busy ? 'Checking PIN…' : 'Unlock dashboard'}
          </button>
        </>
      )}

      <div className="mt-3 border-t border-header-foreground/15 pt-3">
        {resetOpen ? (
          <div className="space-y-3">
            {!resetSentTo ? (
              <>
                <p className="text-xs font-bold text-header-foreground/80">
                  We will email a 6-digit code to your account's email address. Use it to set a new PIN.
                </p>
                <button
                  type="button"
                  onClick={onRequestReset}
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-header-foreground px-3 py-2 text-xs font-extrabold text-workspace-navy disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />} Email me a code
                </button>
              </>
            ) : (
              <>
                <p role="status" className="text-xs font-bold text-header-foreground/80">{notice || `Code sent to ${resetSentTo}.`}</p>
                <label htmlFor="pin-reset-code" className="block">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-header-foreground/70">Emailed code</span>
                  <input
                    id="pin-reset-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="mt-1 w-full rounded-xl border border-header-foreground/25 bg-workspace-navy/40 px-3 py-2.5 text-center text-xl font-extrabold tracking-[0.4em] text-header-foreground focus:border-header-foreground/70 focus:outline-none"
                  />
                </label>
                <PinInput id="pin-reset-new" label="New PIN (4–8 digits)" value={newPin} onChange={setNewPin} disabled={busy} />
                <PinInput id="pin-reset-confirm" label="Confirm new PIN" value={confirmPin} onChange={setConfirmPin} disabled={busy} />
                <button
                  type="button"
                  onClick={() => onConfirmReset(code, newPin, confirmPin)}
                  disabled={busy || code.length !== 6}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-header-foreground px-3 py-2 text-xs font-extrabold text-workspace-navy disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />} Set new PIN
                </button>
              </>
            )}
            {error && <p role="alert" className="text-xs font-extrabold text-[#FFC7E4]">{error}</p>}
            <button
              type="button"
              onClick={() => setResetOpen(false)}
              className="w-full rounded-lg border border-header-foreground/25 px-2.5 py-2 text-xs font-extrabold text-header-foreground/80"
            >
              Back to PIN entry
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="text-xs font-bold text-header-foreground/70 underline underline-offset-4 hover:text-header-foreground"
          >
            Forgot PIN? Email me a reset code
          </button>
        )}
      </div>
    </section>
  );
}
