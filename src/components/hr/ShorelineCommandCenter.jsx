import React, { useState } from 'react';
import { Sparkles, UsersRound } from 'lucide-react';

const INITIAL_HEATMAP = [
  { id: 's1', staff: 'Sarah J.', area: 'Induction', pct: 100 },
  { id: 's2', staff: 'Sarah J.', area: 'NDIS Screen', pct: 100 },
  { id: 's3', staff: 'Sarah J.', area: 'First Aid', pct: 75 },
  { id: 's4', staff: 'Sarah J.', area: '17-Pt Skill', pct: 50 },
  { id: 's5', staff: 'Liam K.', area: 'Induction', pct: 100 },
  { id: 's6', staff: 'Liam K.', area: 'NDIS Screen', pct: 75 },
  { id: 's7', staff: 'Liam K.', area: 'First Aid', pct: 25 },
  { id: 's8', staff: 'Liam K.', area: '17-Pt Skill', pct: 0 },
  { id: 's9', staff: 'Mei C.', area: 'Induction', pct: 100 },
  { id: 's10', staff: 'Mei C.', area: 'NDIS Screen', pct: 100 },
  { id: 's11', staff: 'Mei C.', area: 'First Aid', pct: 100 },
  { id: 's12', staff: 'Mei C.', area: '17-Pt Skill', pct: 75 },
  { id: 's13', staff: 'Noah T.', area: 'Induction', pct: 50 },
  { id: 's14', staff: 'Noah T.', area: 'NDIS Screen', pct: 25 },
  { id: 's15', staff: 'Noah T.', area: 'First Aid', pct: 0 },
  { id: 's16', staff: 'Noah T.', area: '17-Pt Skill', pct: 100 },
];

const FAST_CHEERS = [
  { emoji: '☀️', label: 'Sunshine Kudos', desc: 'Brightened a participant’s day' },
  { emoji: '🏄‍♂️', label: 'Wave Rider', desc: 'Handled a busy shift smoothly' },
  { emoji: '⚓', label: 'Solid Anchor', desc: 'Rock-solid compliance & safety' },
  { emoji: '🌴', label: 'Island Calm', desc: 'Calm leadership under pressure' },
];

// Interpolates from Sand Beige (0% -> #E6D5B8) to Deep Teal Blue (100% -> #005F73)
function heatmapSquareStyle(pct) {
  if (pct <= 0) return { background: '#E6D5B8', color: '#0A2B6D' };
  if (pct <= 25) return { background: '#B8DFD8', color: '#0A2B6D' };
  if (pct <= 50) return { background: '#56CFE1', color: '#0A2B6D' };
  if (pct <= 75) return { background: '#0096C7', color: '#FFFFFF' };
  return { background: '#005F73', color: '#FFFFFF' };
}

export default function ShorelineCommandCenter({ compact = false }) {
  const [squares, setSquares] = useState(INITIAL_HEATMAP);
  const [cheers, setCheers] = useState({ '☀️': 14, '🏄‍♂️': 9, '⚓': 18, '🌴': 11 });
  const [lastCheer, setLastCheer] = useState('⚓ Solid Anchor sent to the support team!');

  const cycleSquare = (id) => {
    setSquares((prev) =>
      prev.map((sq) => {
        if (sq.id !== id) return sq;
        const next = sq.pct >= 100 ? 0 : sq.pct + 25;
        return { ...sq, pct: next };
      })
    );
  };

  const sendFastCheer = (c) => {
    setCheers((prev) => ({ ...prev, [c.emoji]: (prev[c.emoji] || 0) + 1 }));
    setLastCheer(`${c.emoji} ${c.label} — "${c.desc}" dispatched to team feed!`);
  };

  return (
    <div
      className="rounded-2xl border-2 border-[#0A2B6D] p-4 shadow-sm"
      style={{
        background: 'linear-gradient(180deg, #FBF7EE 0%, #F3E9D2 100%)',
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white px-3.5 py-2 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0A2B6D] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              <UsersRound className="h-3 w-3" /> Staff View · Base-44
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-[#0A2B6D]">
              🏖️ The Shoreline Command Center
            </h3>
          </div>
          <p className="text-xs font-semibold text-[#0A2B6D]/80">
            Minimal light-beige sand texture for maximum legibility · 44×44px Sand-to-Deep-Teal Heatmap Squares · 44×44px Fast-Cheer Beach Reactions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#0A2B6D]">
          <span className="rounded border border-[#0A2B6D] bg-[#E6D5B8] px-2 py-0.5">0% Sand #E6D5B8</span>
          <span>→</span>
          <span className="rounded border border-[#0A2B6D] bg-[#005F73] px-2 py-0.5 text-white">100% Deep Teal #005F73</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* 44x44px Heatmap Squares (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
            <span className="text-xs font-extrabold uppercase tracking-wide text-[#0A2B6D]">
              44×44px Workforce Readiness Heatmap (Click square to cycle 0% → 100%)
            </span>
            <span className="text-[11px] font-bold text-[#5A00D6]">
              Base-44 Exact 44×44px Grid
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {squares.map((sq) => {
              const st = heatmapSquareStyle(sq.pct);
              return (
                <button
                  key={sq.id}
                  type="button"
                  onClick={() => cycleSquare(sq.id)}
                  style={{ width: 44, height: 44, ...st }}
                  className="flex h-[44px] w-[44px] flex-col items-center justify-center rounded-lg border-2 border-[#0A2B6D] p-0.5 text-center shadow-2xs transition-transform hover:scale-105"
                  title={`${sq.staff} · ${sq.area}: ${sq.pct}% (Click to advance)`}
                >
                  <span className="text-[8.5px] font-extrabold leading-none">{sq.staff.split(' ')[0]}</span>
                  <span className="mt-0.5 text-[10px] font-black leading-none">{sq.pct}%</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 44x44px Fast-Cheer Icons (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wide text-[#0A2B6D]">
                44×44px Fast-Cheer Beach Reactions
              </span>
              <Sparkles className="h-4 w-4 text-[#FF2E9A]" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {FAST_CHEERS.map((c) => (
                <div
                  key={c.emoji}
                  className="flex items-center gap-2 rounded-xl border-2 border-[#0A2B6D] bg-[#FBF7EE] p-1.5"
                >
                  <button
                    type="button"
                    onClick={() => sendFastCheer(c)}
                    style={{ width: 44, height: 44 }}
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl border-2 border-[#0A2B6D] bg-white text-xl shadow-sm transition-transform hover:scale-105 active:scale-95"
                    title={`Send ${c.label} (44×44px Fast-Cheer Icon)`}
                  >
                    {c.emoji}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-extrabold text-[#0A2B6D]">{c.label}</div>
                    <div className="text-[10px] font-bold text-[#5A00D6]">
                      {cheers[c.emoji]} cheers
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!compact && (
            <div className="mt-2.5 rounded-lg border border-[#0A2B6D] bg-[#F5F0FF] px-2.5 py-1.5 text-[11px] font-extrabold text-[#0A2B6D]">
              {lastCheer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}