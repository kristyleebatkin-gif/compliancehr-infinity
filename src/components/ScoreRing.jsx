import React from 'react';
import { cn } from '@/lib/utils';

export default function ScoreRing({ value, size = 120, stroke = 10, label }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const tone = value >= 85 ? 'safe' : value >= 65 ? 'warning' : 'danger';
  const colors = { safe: '#28A745', warning: '#FF9800', danger: '#D32F2F' };
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-border/60" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[tone]}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn('text-2xl font-bold font-display')} style={{ color: colors[tone] }}>{Math.round(value)}%</span>
        {label && <span className="text-[10px] font-medium text-foreground/50">{label}</span>}
      </div>
    </div>
  );
}