import React from 'react';
import { ShieldCheck } from 'lucide-react';

// Branded identity banner for the My Profile screen: initials avatar, name,
// status pill and quick facts on the app's header gradient.
export default function MyProfileHero({ record, isParticipant, hint }) {
  const initials = (record?.full_name || '?')
    .split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const facts = isParticipant
    ? [['NDIS number', record?.ndis_number], ['Support provided', record?.support_type], ['Support coordination', record?.support_coordinator]]
    : [['Position', record?.position], ['Role', record?.role], ['Employee number', record?.employee_number]];
  const shown = facts.filter(([, v]) => v);
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 shadow-lg"
      style={{ background: 'linear-gradient(120deg, #2563eb 0%, #7c3aed 52%, #ec4899 100%)', boxShadow: '0 10px 30px -16px rgba(124, 58, 237, 0.45)' }}
    >
      <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 left-1/3 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl" />
      <div className="pointer-events-none absolute -right-20 top-0 h-full w-44 rotate-12" style={{ background: 'linear-gradient(90deg, transparent 15%, rgba(255,255,255,0.12) 50%, transparent 85%)' }} />
      <div className="relative flex flex-wrap items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 font-display text-xl font-extrabold text-white shadow-md ring-1 ring-white/30"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-xl font-bold tracking-tight text-white sm:text-2xl">{record?.full_name}</h2>
          <p className="truncate text-sm text-white/75">{record?.email}</p>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white ring-1 ring-white/25"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          {record?.status || 'Active'}
        </span>
      </div>
      {shown.length > 0 && (
        <div className="relative mt-4 flex flex-wrap gap-2">
          {shown.map(([label, v]) => (
            <span
              key={label}
              className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium text-white/85 ring-1 ring-white/20"
              style={{ backdropFilter: 'blur(4px)' }}
            >
              {label}: <span className="font-bold text-white">{v}</span>
            </span>
          ))}
        </div>
      )}
      {hint && (
        <p className="relative mt-3 flex items-center gap-1.5 text-xs font-medium text-white/70">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />{hint}
        </p>
      )}
    </div>
  );
}