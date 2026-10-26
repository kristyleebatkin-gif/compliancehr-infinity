import React from 'react';
import { cn } from '@/lib/utils';

const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';

export default function StatCard({ label, value, icon: Icon, trend, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white p-3.5 shadow-sm transition-all duration-200 sm:p-4',
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:bg-[#F5F0FF] hover:shadow-md' : 'hover:-translate-y-0.5 hover:shadow-md'
      )}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">{label}</div>
          <div className="mt-1 font-editorial text-xl font-extrabold tabular-nums tracking-tight text-[#0A2B6D] sm:text-2xl">
            {value}
          </div>
          {trend && <div className="mt-1 text-xs font-bold text-[#0072FF]">{trend}</div>}
        </div>
        {Icon && (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
            style={{ background: ICON_GRADIENT }}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}