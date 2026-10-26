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

  const BLUE_WHITE_SPRAY_BG =
    'radial-gradient(circle at 16% 24%, rgba(0, 198, 255, 0.52) 0%, transparent 48%), radial-gradient(circle at 84% 72%, rgba(0, 114, 255, 0.38) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.95) 0%, #E0F2FE 100%)';

  return (
    <div
      data-preserve-theme="true"
      className="preserve-island-theme rounded-2xl p-[3px] shadow-md"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="rounded-[14px] bg-white p-2 sm:p-2.5 space-y-2 text-center">
        {/* 50% Smaller Header + Three Listed Activities With Spray Blue & White Background + Smaller Interactive Bar Tiles */}
        <div
          className="w-full rounded-xl p-[2.5px] shadow-2xs"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex flex-col items-center justify-center rounded-[10px] bg-white px-3 py-2 text-center space-y-1.5">
            <h2 className="font-editorial text-base sm:text-xl md:text-2xl font-extrabold leading-tight tracking-tight">
              <span className="text-[#0A2B6D]">Interactive </span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                Treasure Hunt, Beach Scene
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                &amp; Deep Blue Sea Suite
              </span>
            </h2>

            {/* Three Listed Activities With Spray Blue and White Background */}
            <ol
              className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-1 rounded-xl border-2 border-[#0072FF]/35 p-1.5 text-center"
              style={{ background: BLUE_WHITE_SPRAY_BG }}
            >
              {THREE_SCENE_LIST.map((line) => (
                <li
                  key={line}
                  className="w-full rounded-lg p-[1.5px] shadow-2xs"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div
                    className="flex min-h-[24px] w-full items-center justify-center rounded-[6px] px-2.5 py-0.5 text-center text-[10px] sm:text-xs font-extrabold text-[#0A2B6D]"
                    style={{ background: BLUE_WHITE_SPRAY_BG }}
                  >
                    <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[#0A2B6D] shadow-2xs">
                      {line}
                    </span>
                  </div>
                </li>
              ))}
            </ol>

            {/* Smaller Interactive Bar Tiles */}
            <div className="w-full space-y-1 pt-0.5">
              {/* Row 1 of Three (Smaller) */}
              <div className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1">
                {SCENE_MODES.slice(0, 3).map((m, idx) => {
                  const Icon = m.icon;
                  const active = scene === m.id;
                  const sym = getSymbolView(idx);
                  return (
                    <div
                      key={m.id}
                      className="rounded-full p-[1.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <button
                        type="button"
                        onClick={() => setScene(m.id)}
                        className={`gradient-brand flex min-h-[24px] w-full items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold text-white transition-all ${
                          active ? 'ring-2 ring-[#0A2B6D] shadow-sm' : 'opacity-95 hover:opacity-100'
                        }`}
                        style={{ background: getHeaderView(idx), color: '#FFFFFF' }}
                      >
                        <span
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white"
                          style={{ borderColor: getAppBorderView(idx) }}
                        >
                          <Icon className="h-2.5 w-2.5" style={{ color: sym.iconColor }} />
                        </span>
                        <span className="text-center leading-tight" style={{ color: '#FFFFFF' }}>
                          {m.label}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Row 2 of Two (Smaller) */}
              <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1">
                {SCENE_MODES.slice(3).map((m, idx) => {
                  const Icon = m.icon;
                  const active = scene === m.id;
                  const sym = getSymbolView(idx + 3);
                  return (
                    <div
                      key={m.id}
                      className="rounded-full p-[1.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <button
                        type="button"
                        onClick={() => setScene(m.id)}
                        className={`gradient-brand flex min-h-[24px] w-full items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold text-white transition-all ${
                          active ? 'ring-2 ring-[#0A2B6D] shadow-sm' : 'opacity-95 hover:opacity-100'
                        }`}
                        style={{ background: getHeaderView(idx + 3), color: '#FFFFFF' }}
                      >
                        <span
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white"
                          style={{ borderColor: getAppBorderView(idx + 3) }}
                        >
                          <Icon className="h-2.5 w-2.5" style={{ color: sym.iconColor }} />
                        </span>
                        <span className="text-center leading-tight" style={{ color: '#FFFFFF' }}>
                          {m.label}
                        </span>
                      </button>
                    </div>
                  );
                })}

                <div
                  className="rounded-full p-[1.5px] shadow-2xs"
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
                    className="gradient-brand flex min-h-[24px] w-full items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold text-white shadow-2xs"
                    style={{ background: getHeaderView(5), color: '#FFFFFF' }}
                  >
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white"
                      style={{ borderColor: getAppBorderView(5) }}
                    >
                      <Trophy className="h-2.5 w-2.5" style={{ color: getSymbolView(5).iconColor }} />
                    </span>
                    <span className="text-center leading-tight" style={{ color: '#FFFFFF' }}>
                      Play Victory Fanfare
                    </span>
                  </button>
                </div>
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