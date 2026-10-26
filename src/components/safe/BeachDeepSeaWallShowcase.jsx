import React, { useState } from 'react';
import { Compass, Anchor, Sun, Layers } from 'lucide-react';
import KidsZoneTreasurePath from '@/components/visual/KidsZoneTreasurePath';
import DeepSeaScubaProgress from '@/components/goals/DeepSeaScubaProgress';
import ShorelineCommandCenter from '@/components/hr/ShorelineCommandCenter';

const SCENE_MODES = [
  { id: 'deep-sea', label: '🤿 Deep Sea Scuba Progress', icon: Anchor },
  { id: 'treasure', label: '🏖️ Kids Zone · Treasure Hunt Path', icon: Compass },
  { id: 'shoreline', label: '🌴 Staff Shoreline Command', icon: Sun },
  { id: 'all', label: '✨ All 3 Beach & Deep Sea Views', icon: Layers },
];

export default function BeachDeepSeaWallShowcase({ defaultScene = 'deep-sea', compact = true }) {
  const [scene, setScene] = useState(defaultScene);

  return (
    <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-2 shadow-sm space-y-2">
      <div
        className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-[#0A2B6D] px-2.5 py-1.5 text-white"
        style={{
          background:
            'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 40%, #A100FF 65%, #FF2E9A 100%)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="rounded bg-white px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase text-[#0A2B6D]">
            Base-44 Theme Deck
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">
            Tropical Beach, Treasure Hunt, Deep Sea Scuba &amp; Shoreline Wall Scene
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {SCENE_MODES.map((m) => {
            const Icon = m.icon;
            const active = scene === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setScene(m.id)}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8.5px] font-extrabold transition-all ${
                  active
                    ? 'bg-white text-[#0A2B6D] shadow-sm'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <Icon className="h-2.5 w-2.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {(scene === 'deep-sea' || scene === 'all') && <DeepSeaScubaProgress compact={compact} />}
      {(scene === 'treasure' || scene === 'all') && <KidsZoneTreasurePath compact={compact} />}
      {(scene === 'shoreline' || scene === 'all') && <ShorelineCommandCenter compact={compact} />}
    </div>
  );
}