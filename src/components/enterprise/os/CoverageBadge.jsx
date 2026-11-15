import React from 'react';

const TONES = {
  live: { label: 'Source present', className: 'bg-[#E7F7EF] text-[#0B6B45] border-[#A9E3C6]' },
  partial: { label: 'Partial', className: 'bg-[#FFF4E5] text-[#8A4B00] border-[#FFD8A8]' },
  gap: { label: 'Gap', className: 'bg-[#FFE9EF] text-[#8A1230] border-[#FFC2D1]' },
};

/** @param {any} props */
export default function CoverageBadge({ state = 'gap', label = undefined, count = undefined, className = '' }) {
  const tone = TONES[state] || TONES.gap;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${tone.className} ${className}`}
    >
      {label || tone.label}
      {count !== undefined && <span className="font-extrabold">{count}</span>}
    </span>
  );
}