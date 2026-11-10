import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function SecurityPinShell({ title, subtitle, children }) {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center px-4 py-10 font-body"
      style={{
        background:
          'radial-gradient(900px 520px at 8% -10%, rgba(0,114,255,0.42) 0%, rgba(0,114,255,0) 60%), radial-gradient(760px 480px at 96% 4%, rgba(90,0,214,0.48) 0%, rgba(90,0,214,0) 58%), linear-gradient(160deg, #0A2B6D 0%, #0A2B6D 52%, #3A0090 100%)'
      }}
    >
      <div className="w-full max-w-[440px]">
        <div className="mb-4 flex items-center gap-2.5 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-header-foreground/25 bg-header-foreground/10">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-header-foreground/70">Workspace security</p>
            <h1 className="truncate text-lg font-extrabold leading-tight text-header-foreground">{title}</h1>
            {subtitle && <p className="truncate text-xs font-semibold text-header-foreground/70">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}