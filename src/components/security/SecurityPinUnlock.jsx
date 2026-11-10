import React, { useEffect, useState } from 'react';
import { KeyRound, Loader2, RotateCcw } from 'lucide-react';
import PinInput from '@/components/security/PinInput';

const secondsUntil = (timestamp) => Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));

export default function SecurityPinUnlock({ workspaceLabel, busy, error, lockedUntil, lastChanged, onUnlock, onReset }) {
  const [pin, setPin] = useState('');
  const [remaining, setRemaining] = useState(() => secondsUntil(lockedUntil || 0));
  const [confirmReset, setConfirmReset] = useState(false);

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
  };

  return (
    <section className="rounded-2xl border border-header-foreground/20 bg-workspace-navy/40 p-5 text-header-foreground shadow-panel backdrop-blur-xl">
      <h2 className="flex items-center gap-2 text-base font-extrabold">
        <KeyRound className="h-4 w-4" /> Enter your security PIN
      </h2>
      <p className="mt-1 text-xs font-semibold leading-relaxed text-header-foreground/70">
        {workspaceLabel} is locked. {lastChanged ? `PIN last changed ${lastChanged}.` : 'Enter your PIN to continue.'}
      </p>

      <div className="mt-4">
        <PinInput
          id="workspace-pin-unlock"
          label="Security PIN"
          value={pin}
          onChange={setPin}
          onEnter={submit}
          autoFocus
          disabled={busy || lockedOut}
        />
      </div>

      {lockedOut ? (
        <p role="alert" className="mt-3 text-xs font-extrabold text-[#FFC7E4]">
          Too many incorrect attempts. Try again in {remaining} seconds.
        </p>
      ) : error && <p role="alert" className="mt-3 text-xs font-extrabold text-[#FFC7E4]">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={busy || lockedOut}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-header-foreground px-4 py-2.5 text-sm font-extrabold text-workspace-navy transition hover:bg-header-foreground/90 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        {busy ? 'Checking PIN…' : 'Unlock dashboard'}
      </button>

      <div className="mt-3 border-t border-header-foreground/15 pt-3">
        {confirmReset ? (
          <div className="space-y-2">
            <p className="text-xs font-bold text-header-foreground/80">Remove this PIN and set a new one?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onReset}
                disabled={busy}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#FFC7E4]/50 px-2.5 py-2 text-xs font-extrabold text-[#FFC7E4] disabled:opacity-60"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Remove PIN
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="flex-1 rounded-lg border border-header-foreground/25 px-2.5 py-2 text-xs font-extrabold text-header-foreground/80"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="text-xs font-bold text-header-foreground/70 underline underline-offset-4 hover:text-header-foreground"
          >
            Forgot PIN? Reset it
          </button>
        )}
      </div>
    </section>
  );
}