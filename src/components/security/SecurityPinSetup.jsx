import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import PinInput from '@/components/security/PinInput';

export default function SecurityPinSetup({ workspaceLabel, busy, error, notice, onCreate }) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const submit = () => {
    if (busy) return;
    onCreate(pin, confirmPin);
  };

  return (
    <section className="rounded-2xl border border-header-foreground/20 bg-workspace-navy/40 p-5 text-header-foreground shadow-panel backdrop-blur-xl">
      <h2 className="text-base font-extrabold">Create a security PIN</h2>
      <p className="mt-1 text-xs font-semibold leading-relaxed text-header-foreground/70">
        First use of {workspaceLabel}. Choose 4 to 8 digits — this PIN is asked for before the dashboard opens on a new session.
      </p>

      <div className="mt-4 space-y-3">
        <PinInput id="workspace-pin-new" label="New PIN" value={pin} onChange={setPin} onEnter={submit} autoFocus disabled={busy} />
        <PinInput id="workspace-pin-confirm" label="Confirm PIN" value={confirmPin} onChange={setConfirmPin} onEnter={submit} disabled={busy} />
      </div>

      {error && <p role="alert" className="mt-3 text-xs font-extrabold text-[#FFC7E4]">{error}</p>}
      {notice && !error && <p className="mt-3 text-xs font-bold text-[#A9F0D1]">{notice}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-header-foreground px-4 py-2.5 text-sm font-extrabold text-workspace-navy transition hover:bg-header-foreground/90 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        {busy ? 'Saving PIN…' : 'Set security PIN'}
      </button>
    </section>
  );
}