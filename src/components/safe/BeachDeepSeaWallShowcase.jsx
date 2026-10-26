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

  return (
    <div
      data-preserve-theme="true"
      className="preserve-island-theme rounded-3xl p-[4px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="rounded-[20px] bg-white p-3.5 sm:p-4 space-y-4 text-center">
        {/* Enlarged Header + 1. Tropical, 2. Sunny, 3. Deep Displayed in a Usual Centered Vertical List Order */}
        <div
          className="w-full rounded-2xl p-[3.5px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex flex-col items-center justify-center rounded-[13px] bg-white px-5 py-4 sm:px-8 sm:py-5 text-center space-y-3">
            <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
              <span className="text-[#0A2B6D]">Interactive </span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                Treasure Hunt, Beach Scene
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                &amp; Deep Blue Sea Suite
              </span>
            </h2>

            {/* 1. Tropical, 2. Sunny, 3. Deep Sentences in Usual Centered List Order */}
            <ol className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-2 text-center">
              {THREE_SCENE_LIST.map((line, idx) => (
                <li
                  key={line}
                  className="w-full rounded-xl p-[2.5px] shadow-2xs"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex min-h-[38px] w-full items-center justify-center rounded-[9px] bg-white px-4 py-1.5 text-center text-xs sm:text-sm font-extrabold text-[#0A2B6D]">
                    {line}
                  </div>
                </li>
              ))}
            </ol>

            {/* 5 Interactive Scene Tiles: Row 1 of Three + Row 2 of Two (1. Treasure Hunt Tile Identical to Others) */}
            <div className="w-full space-y-2 pt-1">
              {/* Row 1 of Three */}
              <div className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2">
                {SCENE_MODES.slice(0, 3).map((m, idx) => {
                  const Icon = m.icon;
                  const active = scene === m.id;
                  const sym = getSymbolView(idx);
                  return (
                    <div
                      key={m.id}
                      className="rounded-full p-[2.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <button
                        type="button"
                        onClick={() => setScene(m.id)}
                        className={`gradient-brand flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-extrabold text-white transition-all ${
                          active ? 'ring-2 ring-[#0A2B6D] shadow-md' : 'opacity-95 hover:opacity-100'
                        }`}
                        style={{ background: getHeaderView(idx), color: '#FFFFFF' }}
                      >
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                          style={{ borderColor: getAppBorderView(idx) }}
                        >
                          <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                        </span>
                        <span className="text-center leading-tight" style={{ color: '#FFFFFF' }}>
                          {m.label}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Row 2 of Two */}
              <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2">
                {SCENE_MODES.slice(3).map((m, idx) => {
                  const Icon = m.icon;
                  const active = scene === m.id;
                  const sym = getSymbolView(idx + 3);
                  return (
                    <div
                      key={m.id}
                      className="rounded-full p-[2.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <button
                        type="button"
                        onClick={() => setScene(m.id)}
                        className={`gradient-brand flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-extrabold text-white transition-all ${
                          active ? 'ring-2 ring-[#0A2B6D] shadow-md' : 'opacity-95 hover:opacity-100'
                        }`}
                        style={{ background: getHeaderView(idx + 3), color: '#FFFFFF' }}
                      >
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                          style={{ borderColor: getAppBorderView(idx + 3) }}
                        >
                          <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                        </span>
                        <span className="text-center leading-tight" style={{ color: '#FFFFFF' }}>
                          {m.label}
                        </span>
                      </button>
                    </div>
                  );
                })}

                <div
                  className="rounded-full p-[2.5px] shadow-2xs"
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
                    className="gradient-brand flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm"
                    style={{ background: getHeaderView(5), color: '#FFFFFF' }}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                      style={{ borderColor: getAppBorderView(5) }}
                    >
                      <Trophy className="h-3.5 w-3.5" style={{ color: getSymbolView(5).iconColor }} />
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

        {/* 1. TREASURE HUNT SCENE */}
        {(scene === 'treasure' || scene === 'all') && (
          <div className="space-y-2">
            <div
              className="w-full rounded-full p-[2.5px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div
                className="gradient-brand flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full px-4 py-1 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white"
                style={{ background: getHeaderView(0), color: '#FFFFFF' }}
              >
                <span style={{ color: '#FFFFFF' }}>
                  🏖️ SCENE 1 OF 3 · TROPICAL TREASURE HUNT ISLAND PATH &amp; CHEST PRIZES
                </span>
              </div>
            </div>
            <KidsZoneTreasurePath compact={compact} />
          </div>
        )}

        {/* 2. BEACH SCENE (SHORELINE COMMAND CENTER) */}
        {(scene === 'shoreline' || scene === 'all') && (
          <div className="space-y-2">
            <div
              className="w-full rounded-full p-[2.5px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div
                className="gradient-brand flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full px-4 py-1 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white"
                style={{ background: getHeaderView(2), color: '#FFFFFF' }}
              >
                <span style={{ color: '#FFFFFF' }}>
                  🌴 SCENE 2 OF 3 · SUNNY BEACH SCENE &amp; SHORELINE TEAM COMMAND CENTER
                </span>
              </div>
            </div>
            <ShorelineCommandCenter compact={compact} />
          </div>
        )}

        {/* 3. DEEP BLUE SEA SCENE */}
        {(scene === 'deep-sea' || scene === 'all') && (
          <div className="space-y-2">
            <div
              className="w-full rounded-full p-[2.5px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div
                className="gradient-brand flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full px-4 py-1 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white"
                style={{ background: getHeaderView(4), color: '#FFFFFF' }}
              >
                <span style={{ color: '#FFFFFF' }}>
                  🤿 SCENE 3 OF 3 · DEEP BLUE SEA SCUBA PROGRESS &amp; MILESTONE REWARDS
                </span>
              </div>
            </div>
            <DeepSeaScubaProgress compact={compact} />
          </div>
        )}
      </div>
    </div>
  );
}