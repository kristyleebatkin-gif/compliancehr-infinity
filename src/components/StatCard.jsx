import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ label, value, icon: Icon, trend, tone = 'slate', onClick }) {
  const tones = {
    slate: { chip: 'bg-gradient-to-br from-slate-800 to-slate-950 text-white', ring: 'hover:ring-slate-300' },
    red: { chip: 'bg-gradient-to-br from-red-500 to-rose-600 text-white', ring: 'hover:ring-red-300' },
    amber: { chip: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white', ring: 'hover:ring-amber-300' },
    emerald: { chip: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white', ring: 'hover:ring-emerald-300' },
    blue: { chip: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white', ring: 'hover:ring-blue-300' },
  };
  const t = tones[tone] || tones.slate;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm ring-1 ring-transparent transition-all duration-200',
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg' : 'hover:shadow-md',
        t.ring
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
          {trend && <div className="mt-1.5 text-xs font-semibold text-slate-500">{trend}</div>}
        </div>
        {Icon && (
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md transition-transform duration-200 group-hover:scale-105', t.chip)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}