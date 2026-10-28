import React from 'react';

const TONES = {
  blue: { tint: 'rgba(0, 114, 255, 0.1)', text: '#0072FF' },
  purple: { tint: 'rgba(90, 0, 214, 0.1)', text: '#5A00D6' },
  pink: { tint: 'rgba(255, 46, 154, 0.1)', text: '#FF2E9A' },
  navy: { tint: 'rgba(10, 43, 109, 0.1)', text: '#0A2B6D' },
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
      className="flex flex-col gap-4 border-b border-[#C084FC]/40 pb-5 text-left xl:flex-row xl:items-end xl:justify-between"
    >
      <div className="min-w-0">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] sm:text-xs"
          style={{ backgroundColor: palette.tint, color: palette.text }}
        >
          {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: palette.text }} /> : null}
          <span>{badge}</span>
        </span>
        <h2 className="mt-2.5 font-editorial text-2xl font-extrabold tracking-tight text-[#0A2B6D] sm:text-3xl lg:text-4xl">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="max-w-md text-xs font-medium leading-relaxed text-[#0A2B6D]/75 sm:text-sm">
          {description}
        </p>
      ) : null}
    </div>
  );
}