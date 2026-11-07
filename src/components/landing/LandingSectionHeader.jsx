import React from 'react';

const TONES = {
  blue: { tint: 'rgba(0, 114, 255, 0.08)', border: 'rgba(0, 114, 255, 0.28)', text: '#0072FF' },
  purple: { tint: 'rgba(90, 0, 214, 0.08)', border: 'rgba(90, 0, 214, 0.28)', text: '#5A00D6' },
  pink: { tint: 'rgba(255, 46, 154, 0.08)', border: 'rgba(255, 46, 154, 0.28)', text: '#FF2E9A' },
  navy: { tint: 'rgba(10, 43, 109, 0.08)', border: 'rgba(10, 43, 109, 0.28)', text: '#0A2B6D' },
};

/**
 * Global Enterprise Heading Standard:
 * 1. Header is ALWAYS FIRST, one straight sentence, and slightly bigger.
 * 2. Descriptive sentence is SECOND directly underneath.
 * 3. Blue & purple writing / badge with white light in symbol is AFTER the sentence.
 */
export default function LandingSectionHeader({
  badge,
  tone = 'blue',
  icon: Icon,
  title,
  description,
  rightTag,
  id,
}) {
  const palette = TONES[tone] || TONES.blue;

  return (
    <div
      id={id}
      className="space-y-1 border-b border-slate-200 pb-2.5 text-left"
    >
      {/* 1. HEADER ALWAYS FIRST — ONE STRAIGHT LINE & SLIGHTLY BIGGER */}
      <h2 className="font-editorial text-lg sm:text-xl lg:text-[22px] font-black tracking-tight text-[#0A2B6D] leading-tight lg:whitespace-nowrap">
        {title}
      </h2>

      {/* 2. SENTENCE UNDER HEADER */}
      {description ? (
        <p className="text-xs sm:text-[13px] font-semibold leading-snug text-[#0A2B6D]/85">
          {description}
        </p>
      ) : null}

      {/* 3. BLUE & PURPLE WRITING / BADGE WITH WHITE LIGHT IN SYMBOL AFTER SENTENCE */}
      {(badge || rightTag) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          {badge && (
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider"
              style={{
                backgroundColor: palette.tint,
                borderColor: palette.border,
                color: palette.text,
              }}
            >
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#0A2B6D]"
                style={{ boxShadow: '0 0 6px 1px rgba(255,255,255,0.9)' }}
              >
                {Icon ? (
                  <Icon
                    className="h-2.5 w-2.5 shrink-0 text-white"
                    style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }}
                  />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
              <span>{badge}</span>
            </span>
          )}
          {rightTag && (
            <span className="rounded-full border border-[#5A00D6]/25 bg-[#F5F0FF] px-2.5 py-0.5 text-[11px] font-extrabold text-[#5A00D6]">
              {rightTag}
            </span>
          )}
        </div>
      )}
    </div>
  );
}