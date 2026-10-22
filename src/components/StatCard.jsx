import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ label, value, icon: Icon, trend, tone = 'violet', onClick }) {
  const tones = {
    slate: { bar: 'from-indigo-600 to-blue-500', chip: 'bg-gradient-to-br from-indigo-600 to-blue-500 text-white', ring: 'hover:ring-indigo-300', wash: 'from-indigo-500/15 via-indigo-500/5 to-transparent', value: 'text-indigo-700 dark:text-indigo-300' },
    red: { bar: 'from-red-600 to-rose-500', chip: 'bg-gradient-to-br from-rose-500 via-red-500 to-red-700 text-white', ring: 'hover:ring-red-300', wash: 'from-red-500/15 via-rose-500/5 to-transparent', value: 'text-red-600 dark:text-red-300' },
    amber: { bar: 'from-orange-500 to-amber-500', chip: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white', ring: 'hover:ring-orange-300', wash: 'from-orange-500/15 via-amber-500/5 to-transparent', value: 'text-orange-600 dark:text-orange-300' },
    emerald: { bar: 'from-emerald-600 to-teal-500', chip: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white', ring: 'hover:ring-emerald-300', wash: 'from-emerald-500/15 via-teal-500/5 to-transparent', value: 'text-emerald-600 dark:text-emerald-300' },
    blue: { bar: 'from-blue-600 to-cyan-500', chip: 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white', ring: 'hover:ring-blue-300', wash: 'from-blue-500/15 via-cyan-500/5 to-transparent', value: 'text-blue-600 dark:text-blue-300' },
    violet: { bar: 'from-violet-600 to-purple-500', chip: 'bg-gradient-to-br from-violet-600 via-purple-500 to-pink-600 text-white', ring: 'hover:ring-violet-300', wash: 'from-violet-500/15 via-purple-500/5 to-transparent', value: 'text-violet-700 dark:text-violet-300' },
    pink: { bar: 'from-pink-600 to-fuchsia-500', chip: 'bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 text-white', ring: 'hover:ring-pink-300', wash: 'from-pink-500/15 via-fuchsia-500/5 to-transparent', value: 'text-pink-600 dark:text-pink-300' },
  };
  const t = tones[tone] || tones.violet;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-3.5 shadow-sm ring-1 ring-transparent transition-all duration-200 sm:p-4',
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg' : 'hover:-translate-y-0.5 hover:shadow-md',
        t.ring
      )}
    >
      <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90', t.wash)} />
      <div className={cn('absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r', t.bar)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className={cn('mt-1 text-xl font-extrabold tabular-nums tracking-tight sm:text-2xl', t.value)}>{value}</div>
          {trend && <div className="mt-1 text-xs font-semibold text-muted-foreground">{trend}</div>}
        </div>
        {Icon && (
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-md transition-transform duration-200 group-hover:scale-105', t.chip)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}