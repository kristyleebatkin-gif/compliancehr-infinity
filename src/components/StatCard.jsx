import React from 'react';
import { cn } from '@/lib/utils';
import { getTilePalette, getSymbolView } from '@/lib/fullColourTiles';

function hashIndex(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export default function StatCard({ label, value, icon: Icon, trend, onClick, index }) {
  const seed = typeof index === 'number' ? index : hashIndex(String(label || value || '0'));
  const tile = getTilePalette(seed);
  const sym = getSymbolView(seed);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border-2 border-[#0A2B6D] p-3.5 shadow-sm transition-all duration-200 sm:p-4',
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'hover:-translate-y-0.5 hover:shadow-md'
      )}
      style={{ backgroundColor: tile.bg, color: tile.text }}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-extrabold uppercase tracking-wider" style={{ color: tile.subtext }}>
            {label}
          </div>
          <div
            className="mt-1 font-editorial text-xl font-extrabold tabular-nums tracking-tight sm:text-2xl"
            style={{ color: tile.text }}
          >
            {value}
          </div>
          {trend && (
            <div className="mt-1 text-xs font-bold" style={{ color: tile.subtext }}>
              {trend}
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Icon className="h-4 w-4" style={{ color: sym.iconColor }} />
          </div>
        )}
      </div>
    </div>
  );
}