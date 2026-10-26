import React, { useState, useEffect } from 'react';
import { Sparkles, UsersRound, Volume2, VolumeX, Trophy, Gift, Plus, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  SHORELINE_REWARDS,
  playFastCheerSound,
  playHeatmapStepSound,
  playShorelineVictoryFanfare,
} from '@/components/hr/shorelineSoundAndRewards';

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

const STORAGE_KEY = 'chr-shoreline-custom-reward-v1';

export default function ShorelineCommandCenter({ compact = false }) {
  const [squares, setSquares] = useState(INITIAL_HEATMAP);
  const [cheers, setCheers] = useState({ '☀️': 14, '🏄‍♂️': 9, '⚓': 18, '🌴': 11 });
  const [lastCheer, setLastCheer] = useState('⚓ Solid Anchor sent to the support team!');
  const [soundMuted, setSoundMuted] = useState(false);
  const [victoryOpen, setVictoryOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(false);
  const [customRewardDraft, setCustomRewardDraft] = useState('');
  const [burstEmoji, setBurstEmoji] = useState(null);
  const [rewardConfig, setRewardConfig] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { presetId: 'golden-anchor-voucher', customTitle: '' };
    } catch {
      return { presetId: 'golden-anchor-voucher', customTitle: '' };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rewardConfig));
    } catch {
      // ignore storage errors
    }
  }, [rewardConfig]);

  const activePreset =
    SHORELINE_REWARDS.find((r) => r.id === rewardConfig.presetId) || SHORELINE_REWARDS[0];
  const displayRewardTitle = rewardConfig.customTitle?.trim() || activePreset.title;

  const avgReadiness = Math.round(
    squares.reduce((acc, s) => acc + s.pct, 0) / (squares.length || 1)
  );
  const totalCheers = Object.values(cheers).reduce((a, b) => a + b, 0);

  const triggerVictoryScreen = (reason = 'Shoreline 100% Deep Teal Victory') => {
    setVictoryOpen(true);
    playShorelineVictoryFanfare(displayRewardTitle, reason, soundMuted);
  };

  const cycleSquare = (id) => {
    setSquares((prev) => {
      const updated = prev.map((sq) => {
        if (sq.id !== id) return sq;
        const next = sq.pct >= 100 ? 0 : sq.pct + 25;
        playHeatmapStepSound(next, soundMuted);
        return { ...sq, pct: next };
      });
      if (updated.every((s) => s.pct >= 100)) {
        setTimeout(() => triggerVictoryScreen('All 16 Heatmap Squares Reached 100% Deep Teal'), 120);
      }
      return updated;
    });
  };

  const completeAllTo100 = () => {
    setSquares((prev) => prev.map((sq) => ({ ...sq, pct: 100 })));
    triggerVictoryScreen('100% Shoreline Workforce Readiness Achieved');
  };

  const sendFastCheer = (c) => {
    setCheers((prev) => ({ ...prev, [c.emoji]: (prev[c.emoji] || 0) + 1 }));
    setLastCheer(`${c.emoji} ${c.label} — "${c.desc}" dispatched! Reward track: ${displayRewardTitle}`);
    setBurstEmoji(c.emoji);
    setTimeout(() => setBurstEmoji(null), 900);
    playFastCheerSound(c.emoji, c.label, soundMuted);
  };

  const saveCustomReward = () => {
    setRewardConfig((prev) => ({ ...prev, customTitle: customRewardDraft.trim() }));
    setEditingReward(false);
  };

  return (
    <div
      data-preserve-theme="true"
      className="preserve-island-theme relative overflow-hidden rounded-2xl border-2 border-[#0A2B6D] p-4 shadow-sm"
      style={{
        background: 'linear-gradient(180deg, #FBF7EE 0%, #F3E9D2 100%)',
      }}
    >
      {/* Floating Fast-Cheer Animation Pop */}
      {burstEmoji && (
        <div className="pointer-events-none absolute right-8 top-4 z-30 flex animate-bounce items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] bg-[#FFD166] px-3 py-1 text-sm font-extrabold text-[#0A2B6D] shadow-lg">
          <span className="text-xl">{burstEmoji}</span> +1 Shoreline Cheer!
        </div>
      )}

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
            44×44px Sand-to-Deep-Teal Heatmap · 44×44px Fast-Cheer Audio Reactions · Custom Team Rewards &amp; Final Victory Screen!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSoundMuted((m) => !m)}
            className={`inline-flex items-center gap-1 rounded-xl border-2 border-[#0A2B6D] px-2.5 py-1 text-xs font-extrabold ${
              soundMuted
                ? 'bg-slate-100 text-[#0A2B6D]'
                : 'bg-[#FFD166] text-[#0A2B6D] shadow-2xs'
            }`}
            title="Toggle Shoreline cheer chimes & victory fanfare"
          >
            {soundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {soundMuted ? 'Sound Muted' : 'Shoreline Audio: ON'}
          </button>

          <Button
            size="sm"
            onClick={completeAllTo100}
            className="border-2 border-[#0A2B6D] bg-[#005F73] text-xs font-extrabold text-white hover:bg-[#0A2B6D]"
          >
            <Trophy className="h-3.5 w-3.5 text-[#FFD166]" /> 100% Victory Screen
          </Button>
        </div>
      </div>

      {/* Final Victory Screen Animation Overlay Card */}
      {victoryOpen && (
        <div
          className="mt-3 relative overflow-hidden rounded-2xl border-2 border-[#0A2B6D] p-4 text-white shadow-xl"
          style={{
            background: 'linear-gradient(125deg, #005F73 0%, #0A2B6D 38%, #5A00D6 72%, #FF2E9A 100%)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-16 w-16 shrink-0 animate-bounce items-center justify-center rounded-2xl border-2 border-[#FFD166] bg-white text-3xl shadow-lg">
                <span>{activePreset.icon}</span>
                <span className="absolute -top-2 -right-2 rounded-full border border-[#0A2B6D] bg-[#FFD166] px-1.5 py-0.5 text-[9px] font-extrabold text-[#0A2B6D]">
                  100%
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#FFD166]">
                  <PartyPopper className="h-4 w-4" /> Final Shoreline Victory Screen · {avgReadiness}% Readiness · {totalCheers} Team Cheers!
                </div>
                <h4 className="text-base sm:text-lg font-extrabold text-white">
                  🏆 Custom Team Reward Unlocked: {displayRewardTitle}
                </h4>
                <p className="text-xs font-semibold text-white/90">
                  {activePreset.badge} — Every 44×44px Shoreline square &amp; team cheer milestone is glowing Deep Teal!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                onClick={() => playShorelineVictoryFanfare(displayRewardTitle, 'Shoreline Grand Victory', soundMuted)}
                className="border-2 border-white bg-[#FFD166] font-extrabold text-[#0A2B6D] hover:bg-white"
              >
                <Volume2 className="h-3.5 w-3.5" /> Replay Victory Fanfare
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setVictoryOpen(false)}
                className="border-2 border-white bg-white/90 font-extrabold text-[#0A2B6D]"
              >
                Close Victory Screen
              </Button>
            </div>
          </div>

          {/* Animated Wave & Trophy Ribbon */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FAST_CHEERS.map((c) => (
              <div
                key={c.emoji}
                className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/15 px-2.5 py-1.5 backdrop-blur-xs"
              >
                <span className="text-xl animate-pulse">{c.emoji}</span>
                <div>
                  <div className="text-[11px] font-extrabold text-white">{c.label}</div>
                  <div className="text-[10px] font-bold text-[#FFD166]">{cheers[c.emoji]} Cheers Logged</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* 44x44px Heatmap Squares (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
              <span className="text-xs font-extrabold uppercase tracking-wide text-[#0A2B6D]">
                44×44px Workforce Readiness Heatmap ({avgReadiness}% Avg)
              </span>
              <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#0A2B6D]">
                <span className="rounded border border-[#0A2B6D] bg-[#E6D5B8] px-1.5 py-0.5">0% Sand</span>
                <span>→</span>
                <span className="rounded border border-[#0A2B6D] bg-[#005F73] px-1.5 py-0.5 text-white">100% Deep Teal</span>
              </div>
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

          {/* Custom Shoreline Reward Picker Strip */}
          <div className="mt-3 rounded-xl border-2 border-[#0A2B6D] bg-[#FBF7EE] p-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase text-[#0A2B6D]">
                <Gift className="h-3.5 w-3.5 text-[#5A00D6]" /> Shoreline Victory Reward: <span className="text-[#5A00D6] underline">{displayRewardTitle}</span>
              </span>
              <div className="flex items-center gap-1">
                {SHORELINE_REWARDS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setRewardConfig((prev) => ({ ...prev, presetId: r.id }));
                      playHeatmapStepSound(80, soundMuted);
                    }}
                    title={r.title}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border text-sm ${
                      rewardConfig.presetId === r.id
                        ? 'border-[#0A2B6D] bg-[#FFD166] ring-1 ring-[#0A2B6D]'
                        : 'border-[#0A2B6D]/30 bg-white'
                    }`}
                  >
                    {r.icon}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setEditingReward((v) => !v);
                    setCustomRewardDraft(rewardConfig.customTitle || '');
                  }}
                  className="inline-flex items-center gap-0.5 rounded-lg border border-[#0A2B6D] bg-white px-2 py-1 text-[10px] font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
                >
                  <Plus className="h-3 w-3" /> Custom
                </button>
              </div>
            </div>

            {editingReward && (
              <div className="mt-2 flex gap-1.5">
                <Input
                  value={customRewardDraft}
                  onChange={(e) => setCustomRewardDraft(e.target.value)}
                  placeholder="Enter custom staff reward (e.g. Friday Beach BBQ & $50 Gift Card)"
                  className="h-7 border-[#0A2B6D] bg-white text-xs text-[#0A2B6D]"
                />
                <Button size="sm" onClick={saveCustomReward} className="h-7 px-2.5 text-xs font-extrabold">
                  Save
                </Button>
              </div>
            )}
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
                    title={`Send ${c.label} with sound & confetti (44×44px)`}
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

          <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-[#0A2B6D] bg-[#F5F0FF] px-2.5 py-1.5 text-[11px] font-extrabold text-[#0A2B6D]">
            <span className="truncate">{lastCheer}</span>
            <button
              type="button"
              onClick={() => triggerVictoryScreen('Shoreline Fast-Cheer Team Celebration')}
              className="shrink-0 rounded border border-[#0A2B6D] bg-[#FFD166] px-2 py-0.5 text-[10px] font-extrabold text-[#0A2B6D] hover:bg-white"
            >
              🎉 Celebrate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}