import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ label, value, icon: Icon, trend, tone = 'slate', onClick }) {
  const tones = {
    slate: 'bg-slate-900 text-white',
    red: 'bg-red-50 text-red-600 border border-red-200',
    amber: 'bg-amber-50 text-amber-600 border border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    blue: 'bg-blue-50 text-blue-600 border border-blue-200',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl p-5 transition-all',
        onClick && 'cursor-pointer hover:shadow-md',
        tone === 'slate' ? tones.slate : 'bg-white border border-slate-200/70'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className={cn('text-sm font-medium', tone === 'slate' ? 'text-slate-300' : 'text-slate-500')}>{label}</div>
          <div className={cn('mt-2 text-3xl font-semibold tracking-tight', tone === 'slate' ? 'text-white' : 'text-slate-900')}>{value}</div>
          {trend && <div className={cn('mt-1 text-xs', tone === 'slate' ? 'text-slate-400' : 'text-slate-400')}>{trend}</div>}
        </div>
        {Icon && (
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            tones[tone]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}