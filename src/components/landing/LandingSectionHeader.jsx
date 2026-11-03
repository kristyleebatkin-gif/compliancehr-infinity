import React from 'react';

const TONES = {
  blue: { tint: 'rgba(0, 114, 255, 0.08)', border: 'rgba(0, 114, 255, 0.22)', text: '#0072FF' },
  purple: { tint: 'rgba(90, 0, 214, 0.08)', border: 'rgba(90, 0, 214, 0.22)', text: '#5A00D6' },
  pink: { tint: 'rgba(255, 46, 154, 0.08)', border: 'rgba(255, 46, 154, 0.22)', text: '#FF2E9A' },
  navy: { tint: 'rgba(10, 43, 109, 0.08)', border: 'rgba(10, 43, 109, 0.22)', text: '#0A2B6D' },
};

export default function LandingSectionHeader({
  badge,
  tone = 'blue',
  icon: Icon,
  title,
  description,
  id,
}) {
  const palette = TONES[tone] || TONES.blue;

  return (
    <div
      id={id}
      className="flex flex-col gap-3 border-b border-slate-200 pb-6 text-left lg:flex-row lg:items-end lg:justify-between"
    >
      <div className="min-w-0 max-w-3xl">
        <span
          className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-bold uppercase tracking-wider"
          style={{
            backgroundColor: palette.tint,
            borderColor: palette.border,
            color: palette.text,
          }}
        >
          {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: palette.text }} /> : null}
          <span>{badge}</span>
        </span>
        <h2 className="mt-3 font-editorial text-2xl font-extrabold tracking-tight text-[#0A2B6D] sm:text-[28px] lg:text-[32px] leading-tight">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="max-w-xl text-sm font-normal leading-relaxed text-[#0A2B6D]/80 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}