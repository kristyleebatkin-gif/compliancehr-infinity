import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ label, value, icon: Icon, trend, tone = 'slate', onClick }) {
  const tones = {
    slate: { chip: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 text-white', ring: 'hover:ring-slate-300', wash: 'from-slate-500/10 via-transparent to-slate-900/10', value: 'text-slate-900 dark:text-slate-100' },
    red: { chip: 'bg-gradient-to-br from-rose-500 via-red-500 to-red-700 text-white', ring: 'hover:ring-red-300', wash: 'from-red-500/12 via-transparent to-rose-500/10', value: 'text-red-600 dark:text-red-300' },
    amber: { chip: 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white', ring: 'hover:ring-amber-300', wash: 'from-amber-500/12 via-transparent to-orange-500/10', value: 'text-amber-600 dark:text-amber-300' },
    emerald: { chip: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white', ring: 'hover:ring-emerald-300', wash: 'from-emerald-500/12 via-transparent to-teal-500/10', value: 'text-emerald-600 dark:text-emerald-300' },
    blue: { chip: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-white', ring: 'hover:ring-blue-300', wash: 'from-blue-500/12 via-transparent to-violet-500/10', value: 'text-blue-600 dark:text-blue-300' },
    violet: { chip: 'bg-gradient-to-br from-violet-500 via-purple-500 to-pink-600 text-white', ring: 'hover:ring-violet-300', wash: 'from-violet-500/12 via-transparent to-pink-500/10', value: 'text-violet-600 dark:text-violet-300' },
    pink: { chip: 'bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 text-white', ring: 'hover:ring-pink-300', wash: 'from-pink-500/12 via-transparent to-fuchsia-500/10', value: 'text-pink-600 dark:text-pink-300' },
  };
  const t = tones[tone] || tones.slate;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-3.5 shadow-sm ring-1 ring-transparent transition-all duration-200 sm:p-4',
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg' : 'hover:shadow-md',
        t.ring
      )}
    >
      <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80', t.wash)} />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-muted-foreground">{label}</div>
          <div className={cn('mt-1 text-xl font-bold tabular-nums tracking-tight sm:text-2xl', t.value)}>{value}</div>
          {trend && <div className="mt-1 text-xs font-semibold text-muted-foreground">{trend}</div>}
        </div>
        {Icon && (
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-md transition-transform duration-200 group-hover:scale-105', t.chip)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}