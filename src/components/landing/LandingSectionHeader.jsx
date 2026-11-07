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
      className="space-y-1.5 border-b border-slate-200 pb-3.5 text-left"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: palette.tint,
              borderColor: palette.border,
              color: palette.text,
            }}
          >
            {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: palette.text }} /> : null}
            <span>{badge}</span>
          </span>
          <h2 className="font-editorial text-xl font-extrabold tracking-tight text-[#0A2B6D] sm:text-2xl leading-tight">
            {title}
          </h2>
        </div>
      </div>
      {description ? (
        <p className="text-xs sm:text-sm font-semibold leading-snug text-[#0A2B6D]/80">
          {description}
        </p>
      ) : null}
    </div>
  );
}