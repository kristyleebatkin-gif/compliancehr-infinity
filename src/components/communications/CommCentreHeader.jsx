import React from 'react';
import { MessagesSquare } from 'lucide-react';

/*
 * NEW Communication Centre header (owner request: delete the old header, build a new one).
 * Deep navy-to-pink gradient, white text with a black outline, "Live" status pill.
 * Layout only — no data loading, no behaviour change.
 */
export default function CommCentreHeader({ subtitle = '' }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border-2 border-black shadow-lg"
      style={{ background: 'linear-gradient(115deg, #0b1f4b 0%, #1e3a8a 42%, #4338ca 72%, #be185d 118%)' }}
    >
      {/* decorative glow blobs */}
      <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full opacity-30 blur-2xl" style={{ background: '#f472b6' }} />
      <div className="pointer-events-none absolute -left-8 bottom--10 h-32 w-32 rounded-full opacity-25 blur-2xl" style={{ background: '#22d3ee' }} />

      <div className="relative flex flex-wrap items-center gap-3 px-4 py-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-md ring-1 ring-white/30">
          <MessagesSquare className="h-5 w-5 text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            className="text-2xl font-extrabold leading-tight text-white"
            style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 3px rgba(0,0,0,0.9)' }}
          >
            Communication Centre
          </h2>
          {subtitle && (
            <p
              className="mt-1 text-xs font-semibold leading-snug text-white/95"
              style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/40 bg-white/15 px-3 py-1 text-[11px] font-bold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          Live
        </span>
      </div>
    </div>
  );
}