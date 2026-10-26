import React, { useState } from 'react';
import { Compass, Anchor, Sun, Layers, Trophy } from 'lucide-react';
import KidsZoneTreasurePath from '@/components/visual/KidsZoneTreasurePath';
import DeepSeaScubaProgress from '@/components/goals/DeepSeaScubaProgress';
import ShorelineCommandCenter from '@/components/hr/ShorelineCommandCenter';
import { playShorelineVictoryFanfare } from '@/components/hr/shorelineSoundAndRewards';

// Ordered with Beach Scenes FIRST, then Deep Blue Sea SECOND!
const SCENE_MODES = [
  { id: 'all', label: '✨ Beach Scene + Deep Blue Sea (1 of Each)', icon: Layers },
  { id: 'treasure', label: '🏖️ 1. Beach Scene · Treasure Island', icon: Compass },
  { id: 'deep-sea', label: '🤿 2. Deep Blue Sea · Scuba Progress', icon: Anchor },
  { id: 'shoreline', label: '🌴 Staff Shoreline Command', icon: Sun },
];

export default function BeachDeepSeaWallShowcase({ defaultScene = 'all', compact = true }) {
  const [scene, setScene] = useState(defaultScene);

  return (
    <div className="rounded-3xl border-2 border-[#0A2B6D] bg-white p-3 shadow-lg space-y-3">
      {/* Header Bar with White Pill Behind Dark Blue Writing */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#0A2B6D] px-3.5 py-2.5 text-white shadow-md"
        style={{
          background:
            'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 40%, #A100FF 65%, #FF2E9A 100%)',
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-[#0A2B6D] bg-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#0A2B6D]">
            Beach &amp; Deep Blue Sea Suite
          </span>
          <span className="rounded-lg border border-[#0A2B6D] bg-white px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D]">
            1. Tropical Beach Treasure Island First → 2. Deep Blue Sea Scuba Progress Second
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {SCENE_MODES.map((m) => {
            const Icon = m.icon;
            const active = scene === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setScene(m.id)}
                className={`inline-flex items-center gap-1 rounded-full border-2 border-[#0A2B6D] px-2.5 py-1 text-[10px] font-extrabold transition-all ${
                  active
                    ? 'bg-[#FF2E9A] text-white shadow-sm ring-2 ring-white'
                    : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                }`}
              >
                <Icon className="h-3 w-3" />
                {m.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() =>
              playShorelineVictoryFanfare(
                'Beach & Deep Blue Sea Trophy',
                'Executive Wall Grand Victory',
                false
              )
            }
            className="inline-flex items-center gap-1 rounded-full border-2 border-[#0A2B6D] bg-[#FFE066] px-2.5 py-1 text-[10px] font-extrabold text-[#0A2B6D] shadow-sm hover:bg-white"
          >
            <Trophy className="h-3 w-3" /> Victory Fanfare
          </button>
        </div>
      </div>

      {/* 1. BEACH SCENE FIRST (Treasure Island Path) */}
      {(scene === 'treasure' || scene === 'all') && (
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D] shadow-2xs">
            <span>🏖️ SCENE 1 OF 2: TROPICAL BEACH TREASURE ISLAND</span>
          </div>
          <KidsZoneTreasurePath compact={compact} />
        </div>
      )}

      {/* Optional Shoreline View when selected */}
      {scene === 'shoreline' && <ShorelineCommandCenter compact={compact} />}

      {/* 2. DEEP BLUE SEA SECOND (Deep Sea Scuba Progress) */}
      {(scene === 'deep-sea' || scene === 'all') && (
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D] shadow-2xs">
            <span>🤿 SCENE 2 OF 2: DEEP BLUE SEA SCUBA PROGRESS</span>
          </div>
          <DeepSeaScubaProgress compact={compact} />
        </div>
      )}
    </div>
  );
}