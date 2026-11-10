import React from 'react';
import { sanitisePin } from '@/lib/workspacePin';

export default function PinInput({ id, label, value, onChange, onEnter, autoFocus, disabled }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-header-foreground/70">{label}</span>
      <input
        id={id}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        pattern="[0-9]*"
        maxLength={8}
        autoFocus={autoFocus}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(sanitisePin(event.target.value))}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          onEnter?.();
        }}
        placeholder="••••"
        className="mt-1 w-full rounded-xl border border-header-foreground/25 bg-workspace-navy/40 px-3 py-2.5 text-center text-xl font-extrabold tracking-[0.5em] text-header-foreground placeholder:text-header-foreground/30 focus:border-header-foreground/70 focus:outline-none disabled:opacity-60"
      />
    </label>
  );
}