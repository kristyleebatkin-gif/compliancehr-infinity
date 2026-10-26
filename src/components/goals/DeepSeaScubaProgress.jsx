import React, { useState } from 'react';
import { Award, Sparkles, Anchor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const FALLBACK_DIVE_GOALS = [
  { id: 'demo-1', participant_name: 'Deep Sea Explorer', goal: 'Independent Community Transport & Safety', category: 'Daily Living', progress: 100, status: 'Achieved' },
  { id: 'demo-2', participant_name: 'Deep Sea Explorer', goal: 'Weekly Hydrotherapy & Ocean Swim Confidence', category: 'Health & Wellbeing', progress: 75, status: 'In Progress' },
  { id: 'demo-3', participant_name: 'Deep Sea Explorer', goal: 'Social Group Participation & Peer Connections', category: 'Social & Community', progress: 50, status: 'In Progress' },
];

export default function DeepSeaScubaProgress({ goals = [], onProgress, compact = false }) {
  const [localProgress, setLocalProgress] = useState({});
  const sourceGoals = goals.length > 0 ? goals : FALLBACK_DIVE_GOALS;
  const displayedGoals = compact ? sourceGoals.slice(0, 3) : sourceGoals.slice(0, 6);

  const getPct = (g) => {
    if (localProgress[g.id] !== undefined) return localProgress[g.id];
    return Math.max(0, Math.min(100, Math.round(Number(g.progress) || 0)));
  };

  const handleDiveChange = (g, nextVal) => {
    const clamped = Math.max(0, Math.min(100, Number(nextVal) || 0));
    setLocalProgress((prev) => ({ ...prev, [g.id]: clamped }));
    if (onProgress && !String(g.id).startsWith('demo-')) {
      onProgress(g, clamped);
    }
  };

  const avgDepth = displayedGoals.length
    ? Math.round(displayedGoals.reduce((sum, g) => sum + getPct(g), 0) / displayedGoals.length)
    : 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border-2 border-[#0A2B6D] p-4 text-white shadow-lg"
      style={{
        background: 'radial-gradient(circle at 80% 10%, #0D3B66 0%, #061A40 48%, #030B1E 100%)',
      }}
    >
      {/* Deep Sea Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#00C6FF]/70 bg-[#0A2B6D]/90 px-3.5 py-2.5 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#00C6FF] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              <Anchor className="h-3 w-3" /> Participant View · Base-44
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              🤿 Deep Sea Progress · Scuba Driver
            </h3>
          </div>
          <p className="text-xs text-[#7FE7DC]">
            176px vertical neon-aqua glass scuba cylinders · 44×44px glowing yellow submarine slider thumb · 100% 3D glowing pearl &amp; coral reef reward!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="border border-[#00F5D4] bg-[#041533] px-2.5 py-1 text-xs font-extrabold text-[#00F5D4]">
            Fleet Dive Average: {avgDepth}%
          </Badge>
        </div>
      </div>

      {/* Scuba Cylinders Grid */}
      <div className={`mt-3 grid grid-cols-1 gap-3 ${compact ? 'sm:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {displayedGoals.map((g) => {
          const pct = getPct(g);
          const isHatched = pct >= 100;
          return (
            <div
              key={g.id}
              className="flex flex-col justify-between rounded-2xl border-2 border-[#00C6FF]/60 bg-[#071F4A]/90 p-3 shadow-md"
            >
              <div className="flex items-start gap-3">
                {/* 176px Vertical Neon-Aqua Glass Scuba Cylinder */}
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-7 rounded-t-md border-2 border-[#00F5D4] bg-slate-300" />
                  <div
                    style={{ height: 176, width: 56 }}
                    className="relative flex h-[176px] w-[56px] shrink-0 flex-col justify-end overflow-hidden rounded-2xl border-2 border-[#00F5D4] bg-[#031026]/90 shadow-[0_0_18px_rgba(0,245,212,0.35)]"
                    title="176px Neon-Aqua Glass Scuba Cylinder"
                  >
                    {/* Neon-Aqua Water Fill */}
                    <div
                      className="w-full transition-all duration-500"
                      style={{
                        height: `${pct}%`,
                        background: isHatched
                          ? 'linear-gradient(180deg, #00F5D4 0%, #00C6FF 55%, #0072FF 100%)'
                          : 'linear-gradient(180deg, rgba(0,245,212,0.92) 0%, rgba(0,198,255,0.85) 100%)',
                        boxShadow: 'inset 0 0 14px rgba(255,255,255,0.55)',
                      }}
                    />
                    {/* Depth Tick Marks */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-2 px-1 text-[8px] font-extrabold text-white/75">
                      <span>100%</span>
                      <span>75%</span>
                      <span>50%</span>
                      <span>25%</span>
                      <span>0%</span>
                    </div>
                  </div>
                </div>

                {/* Goal Details & 100% Glowing Pearl / Coral Reef Reward */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate rounded bg-[#00C6FF]/20 px-2 py-0.5 text-[10px] font-extrabold text-[#00F5D4]">
                      {g.participant_name || 'Participant'}
                    </span>
                    <span className="text-xs font-extrabold text-[#FFE066]">{pct}%</span>
                  </div>
                  <p className="text-xs font-extrabold leading-snug text-white">
                    {g.goal}
                  </p>
                  {g.category && (
                    <p className="text-[10.5px] font-semibold text-[#7FE7DC]">
                      Sector: {g.category}
                    </p>
                  )}

                  {/* 100% Milestone Reward: 3D Glowing Pearl & Coral Reef Badge */}
                  {isHatched ? (
                    <div
                      className="mt-2 flex items-center gap-2 rounded-xl border-2 border-[#FFE066] p-2 shadow-[0_0_16px_rgba(255,224,102,0.45)]"
                      style={{
                        background: 'radial-gradient(circle at 25% 25%, #FFFDF0 0%, #FFD166 35%, #FF2E9A 78%, #5A00D6 100%)',
                      }}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/90 text-xl shadow-inner">
                        🦪
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[10.5px] font-extrabold uppercase text-[#0A2B6D]">
                          <Sparkles className="h-3 w-3 text-[#0A2B6D]" /> 100% Pearl Hatched!
                        </div>
                        <div className="text-[10px] font-bold text-[#0A2B6D]">
                          🪸 3D Glowing Pearl &amp; Coral Reef Badge Unlocked
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 rounded-xl border border-[#00C6FF]/40 bg-[#041533]/80 p-2 text-[10.5px] font-semibold text-[#7FE7DC]">
                      Fill scuba cylinder to 100% to hatch the 3D Glowing Pearl &amp; Coral Reef Badge!
                    </div>
                  )}
                </div>
              </div>

              {/* 44x44px Glowing Yellow Submarine Slider Thumb Control */}
              <div className="mt-3 border-t border-[#00C6FF]/30 pt-2.5">
                <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-[#7FE7DC]">
                  <span>Slide Submarine Thumb (44×44px)</span>
                  <div className="flex gap-1">
                    {[25, 50, 75, 100].map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => handleDiveChange(g, step)}
                        className={`rounded px-1.5 py-0.5 text-[9.5px] font-extrabold ${
                          pct === step
                            ? 'bg-[#FFE066] text-[#0A2B6D]'
                            : 'bg-[#0A2B6D] text-white hover:bg-[#0072FF]'
                        }`}
                      >
                        {step}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative flex h-[44px] items-center">
                  {/* Track */}
                  <div className="h-3 w-full overflow-hidden rounded-full border border-[#00F5D4]/60 bg-[#031026]">
                    <div
                      className="h-full bg-gradient-to-r from-[#0072FF] via-[#00C6FF] to-[#00F5D4]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {/* Native range input overlaid for smooth dragging */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={pct}
                    onChange={(e) => handleDiveChange(g, Number(e.target.value))}
                    aria-label={`Adjust scuba progress for ${g.goal}`}
                    className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                  />
                  {/* 44x44px Glowing Yellow Submarine Thumb */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      left: `calc(${pct}% - ${(pct / 100) * 44}px)`,
                    }}
                    className="pointer-events-none absolute z-10 flex h-[44px] w-[44px] items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-[#FFE066] text-lg shadow-[0_0_16px_rgba(255,224,102,0.95)] transition-all"
                    title="44×44px Glowing Yellow Submarine Slider Thumb"
                  >
                    <span role="img" aria-label="Yellow Submarine">🚢</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#00C6FF]/40 bg-[#041533] px-3 py-1.5 text-[10.5px] font-bold text-[#7FE7DC]">
          <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-[#FFE066]" /> Deep Sea Palette Reference:</span>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded border border-white/30 bg-[#061A40] px-2 py-0.5 text-white">Abyss Navy #061A40</span>
            <span className="rounded border border-white/30 bg-[#00F5D4] px-2 py-0.5 text-[#0A2B6D]">Neon Aqua #00F5D4</span>
            <span className="rounded border border-white/30 bg-[#FFE066] px-2 py-0.5 text-[#0A2B6D]">Submarine Yellow #FFE066</span>
          </div>
        </div>
      )}
    </div>
  );
}