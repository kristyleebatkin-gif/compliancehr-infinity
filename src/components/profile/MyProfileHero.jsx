import React from 'react';
import { ShieldCheck } from 'lucide-react';

// Soft Indigo identity banner for the My Profile screen: periwinkle-to-indigo
// gradient, serif name, initials avatar, status pill and quick facts.
export default function MyProfileHero({ record, isParticipant, hint }) {
  const initials = (record?.full_name || '?')
    .split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const facts = isParticipant
    ? [['NDIS number', record?.ndis_number], ['Support provided', record?.support_type], ['Support coordination', record?.support_coordinator]]
    : [['Position', record?.position], ['Role', record?.role], ['Employee number', record?.employee_number]];
  const shown = facts.filter(([, v]) => v);
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 shadow-md"
      style={{ background: 'linear-gradient(120deg, #818cf8 0%, #4f46e5 58%, #4338ca 100%)', boxShadow: '0 12px 30px -18px rgba(79, 70, 229, 0.55)' }}
    >
      <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 left-1/3 h-32 w-32 rounded-full bg-indigo-300/25 blur-2xl" />
      <div className="pointer-events-none absolute -right-20 top-0 h-full w-44 rotate-12" style={{ background: 'linear-gradient(90deg, transparent 15%, rgba(255,255,255,0.1) 50%, transparent 85%)' }} />
      <div className="relative flex flex-wrap items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 font-display text-xl font-extrabold text-white shadow-sm ring-1 ring-white/25"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-editorial text-xl font-bold tracking-tight text-white sm:text-2xl">{record?.full_name}</h2>
          <p className="truncate text-sm text-indigo-100/85">{record?.email}</p>
        </div>
        <span
          className="inline-flex shrink-0 items-center rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-50 ring-1 ring-white/25"
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
              className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-indigo-100/90 ring-1 ring-white/15"
              style={{ backdropFilter: 'blur(4px)' }}
            >
              {label}: <span className="font-bold text-white">{v}</span>
            </span>
          ))}
        </div>
      )}
      {hint && (
        <p className="relative mt-3 flex items-center gap-1.5 text-xs font-medium text-indigo-100/75">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />{hint}
        </p>
      )}
    </div>
  );
}