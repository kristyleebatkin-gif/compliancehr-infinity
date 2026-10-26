import React, { useState } from 'react';
import { Compass, Anchor, Sun, Layers, Trophy } from 'lucide-react';
import KidsZoneTreasurePath from '@/components/visual/KidsZoneTreasurePath';
import DeepSeaScubaProgress from '@/components/goals/DeepSeaScubaProgress';
import ShorelineCommandCenter from '@/components/hr/ShorelineCommandCenter';
import { playShorelineVictoryFanfare } from '@/components/hr/shorelineSoundAndRewards';
import { getHeaderView, getSymbolView, getAppBorderView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const SCENE_MODES = [
  { id: 'all', label: '✨ All 3 Scenes (Treasure Hunt + Beach Scene + Deep Blue Sea)', icon: Layers },
  { id: 'treasure', label: '🏖️ 1. Treasure Hunt · Island Path & Prizes', icon: Compass },
  { id: 'shoreline', label: '🌴 2. Beach Scene · Shoreline Command', icon: Sun },
  { id: 'deep-sea', label: '🤿 3. Deep Blue Sea · Scuba Progress', icon: Anchor },
];

const THREE_SCENE_LIST = [
  '1. Tropical Treasure Hunt Island Path & Chest Prizes',
  '2. Sunny Beach Shoreline Command Center',
  '3. Deep Blue Sea Scuba Progress & Milestone Rewards',
];

export default function BeachDeepSeaWallShowcase({ defaultScene = 'all', compact = true }) {
  const [scene, setScene] = useState(defaultScene);

  const PINK_BLUE_PURPLE_SPRAY =
    'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.65) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.65) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.65) 0%, transparent 52%), #FFFFFF';

  return (
    <div
      data-preserve-theme="true"
      className="preserve-island-theme rounded-2xl p-[3px] shadow-md"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="rounded-[14px] bg-white p-2 sm:p-2.5 space-y-2 text-center">
        {/* 50% Smaller Header + Three Listed Activities — White Outside Border & Pink/Blue/Purple Spray With Dark Blue Writing Inside */}
        <div
          className="w-full rounded-xl p-[2.5px] shadow-2xs"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex flex-col items-center justify-center rounded-[10px] bg-white px-3 py-2 text-center space-y-1.5">
            {/* Interactive Sentence on Two Even Lines */}
            <h2 className="font-editorial text-base sm:text-xl md:text-2xl font-extrabold leading-tight tracking-tight text-center">
              <span className="block">
                <span className="text-[#0A2B6D]">Interactive </span>
                <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  Treasure Hunt,
                </span>
              </span>
              <span className="block bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                Beach Scene &amp; Deep Blue Sea Suite
              </span>
            </h2>

            {/* Three Listed Activities (Tropical, Sunny & Deep) — White Outside Border, Pink/Blue/Purple Spray & Dark Blue Writing Inside */}
            <ol className="mx-auto grid w-full grid-cols-1 sm:grid-cols-3 gap-1.5 bg-white text-center items-stretch">
              {THREE_SCENE_LIST.map((line, idx) => (
                <li
                  key={line}
                  className="flex h-full rounded-full p-[1.5px] shadow-2xs"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div
                    className="flex min-h-[24px] w-full items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-center text-[9.5px] sm:text-[10.5px] font-extrabold text-[#0A2B6D]"
                    style={{ background: PINK_BLUE_PURPLE_SPRAY }}
                  >
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white text-[7px] font-extrabold"
                      style={{
                        borderColor: getAppBorderView(idx),
                        color: getSymbolView(idx).iconColor,
                      }}
                    >
                      0{idx + 1}
                    </span>
                    <span className="truncate text-center text-[#0A2B6D]">
                      {line}
                    </span>
                  </div>
                </li>
              ))}
            </ol>

            {/* All 5 Interactive Bar Tiles Under Sized & Styled Identically — Pink/Blue/Purple Spray & Dark Blue Writing Inside */}
            <div className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1.5 bg-white pt-0.5 items-stretch">
              {SCENE_MODES.map((m, idx) => {
                const Icon = m.icon;
                const active = scene === m.id;
                const sym = getSymbolView(idx);
                return (
                  <div
                    key={m.id}
                    className="flex h-full rounded-full p-[1.5px] shadow-2xs"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <button
                      type="button"
                      onClick={() => setScene(m.id)}
                      className={`flex min-h-[24px] w-full items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold text-[#0A2B6D] transition-all ${
                        active ? 'ring-2 ring-[#FF2E9A] shadow-sm' : 'hover:opacity-95'
                      }`}
                      style={{ background: PINK_BLUE_PURPLE_SPRAY }}
                    >
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white"
                        style={{ borderColor: getAppBorderView(idx) }}
                      >
                        <Icon className="h-2.5 w-2.5" style={{ color: sym.iconColor }} />
                      </span>
                      <span className="truncate text-center leading-tight text-[#0A2B6D]">
                        {m.label}
                      </span>
                    </button>
                  </div>
                );
              })}

              <div
                className="flex h-full rounded-full p-[1.5px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <button
                  type="button"
                  onClick={() =>
                    playShorelineVictoryFanfare(
                      'Beach & Deep Blue Sea Trophy',
                      'Executive Wall Grand Victory',
                      false
                    )
                  }
                  className="flex min-h-[24px] w-full items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold text-[#0A2B6D] shadow-2xs"
                  style={{ background: PINK_BLUE_PURPLE_SPRAY }}
                >
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white"
                    style={{ borderColor: getAppBorderView(5) }}
                  >
                    <Trophy className="h-2.5 w-2.5" style={{ color: getSymbolView(5).iconColor }} />
                  </span>
                  <span className="truncate text-center leading-tight text-[#0A2B6D]">
                    Play Victory Fanfare
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 50% Smaller Scenes Container (Side-by-Side 3-Column Compact Grid When 'all' Is Selected) */}
        <div className={scene === 'all' ? 'grid grid-cols-1 lg:grid-cols-3 gap-2 items-start' : 'space-y-1.5'}>
          {/* 1. TREASURE HUNT SCENE (50% Smaller) */}
          {(scene === 'treasure' || scene === 'all') && (
            <div className="space-y-1 overflow-hidden rounded-xl border border-[#0A2B6D]/20 p-1">
              <div
                className="w-full rounded-full p-[1.5px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="gradient-brand flex min-h-[24px] w-full items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white"
                  style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                >
                  <span style={{ color: '#FFFFFF' }}>
                    🏖️ 1. TREASURE HUNT ISLAND PATH
                  </span>
                </div>
              </div>
              <div className="max-h-[260px] overflow-y-auto">
                <KidsZoneTreasurePath compact={true} />
              </div>
            </div>
          )}

          {/* 2. BEACH SCENE (50% Smaller) */}
          {(scene === 'shoreline' || scene === 'all') && (
            <div className="space-y-1 overflow-hidden rounded-xl border border-[#0A2B6D]/20 p-1">
              <div
                className="w-full rounded-full p-[1.5px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="gradient-brand flex min-h-[24px] w-full items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white"
                  style={{ background: getHeaderView(2), color: '#FFFFFF' }}
                >
                  <span style={{ color: '#FFFFFF' }}>
                    🌴 2. SUNNY BEACH SHORELINE COMMAND
                  </span>
                </div>
              </div>
              <div className="max-h-[260px] overflow-y-auto">
                <ShorelineCommandCenter compact={true} />
              </div>
            </div>
          )}

          {/* 3. DEEP BLUE SEA SCENE (50% Smaller) */}
          {(scene === 'deep-sea' || scene === 'all') && (
            <div className="space-y-1 overflow-hidden rounded-xl border border-[#0A2B6D]/20 p-1">
              <div
                className="w-full rounded-full p-[1.5px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="gradient-brand flex min-h-[24px] w-full items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white"
                  style={{ background: getHeaderView(4), color: '#FFFFFF' }}
                >
                  <span style={{ color: '#FFFFFF' }}>
                    🤿 3. DEEP BLUE SEA SCUBA PROGRESS
                  </span>
                </div>
              </div>
              <div className="max-h-[260px] overflow-y-auto">
                <DeepSeaScubaProgress compact={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}