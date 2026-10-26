import React, { useState, useEffect } from 'react';
import { Sparkles, Anchor, Volume2, VolumeX, Gift, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DEEP_SEA_REWARD_CATALOG,
  playScubaBubbleSound,
  playDeepSeaMilestoneFanfare,
} from '@/components/goals/deepSeaSoundAndRewards';

const FALLBACK_DIVE_GOALS = [
  { id: 'demo-1', participant_name: 'Deep Sea Explorer', goal: 'Independent Community Transport & Safety', category: 'Daily Living', progress: 100, status: 'Achieved' },
  { id: 'demo-2', participant_name: 'Deep Sea Explorer', goal: 'Weekly Hydrotherapy & Ocean Swim Confidence', category: 'Health & Wellbeing', progress: 75, status: 'In Progress' },
  { id: 'demo-3', participant_name: 'Deep Sea Explorer', goal: 'Social Group Participation & Peer Connections', category: 'Social & Community', progress: 50, status: 'In Progress' },
];

const STORAGE_KEY = 'chr-deep-sea-custom-rewards-v1';

export default function DeepSeaScubaProgress({ goals = [], onProgress, compact = false }) {
  const [localProgress, setLocalProgress] = useState({});
  const [soundMuted, setSoundMuted] = useState(false);
  const [celebrationBanner, setCelebrationBanner] = useState(null);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [customPrizeDraft, setCustomPrizeDraft] = useState('');
  const [goalRewards, setGoalRewards] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goalRewards));
    } catch {
      // ignore storage errors
    }
  }, [goalRewards]);

  const sourceGoals = goals.length > 0 ? goals : FALLBACK_DIVE_GOALS;
  const displayedGoals = compact ? sourceGoals.slice(0, 3) : sourceGoals.slice(0, 6);

  const getPct = (g) => {
    if (localProgress[g.id] !== undefined) return localProgress[g.id];
    return Math.max(0, Math.min(100, Math.round(Number(g.progress) || 0)));
  };

  const getRewardForGoal = (g, idx) => {
    const saved = goalRewards[g.id];
    const preset =
      DEEP_SEA_REWARD_CATALOG.find((r) => r.id === saved?.presetId) ||
      DEEP_SEA_REWARD_CATALOG[idx % DEEP_SEA_REWARD_CATALOG.length];
    return {
      ...preset,
      customNote: saved?.customNote || '',
    };
  };

  const selectPresetReward = (goalId, presetId) => {
    setGoalRewards((prev) => ({
      ...prev,
      [goalId]: { ...(prev[goalId] || {}), presetId },
    }));
  };

  const saveCustomPrizeNote = (goalId) => {
    setGoalRewards((prev) => ({
      ...prev,
      [goalId]: { ...(prev[goalId] || {}), customNote: customPrizeDraft.trim() },
    }));
    setEditingGoalId(null);
    setCustomPrizeDraft('');
  };

  const handleDiveChange = (g, nextVal, idx = 0) => {
    const prevPct = getPct(g);
    const clamped = Math.max(0, Math.min(100, Number(nextVal) || 0));
    setLocalProgress((prev) => ({ ...prev, [g.id]: clamped }));

    const reward = getRewardForGoal(g, idx);
    if (clamped >= 100 && prevPct < 100) {
      playDeepSeaMilestoneFanfare(g.goal, reward.customNote || reward.title, soundMuted);
      setCelebrationBanner({
        goalTitle: g.goal,
        participant: g.participant_name || 'Participant',
        rewardTitle: reward.customNote || reward.title,
        rewardIcon: reward.icon,
        rewardBadge: reward.badge,
      });
    } else if (clamped !== prevPct) {
      playScubaBubbleSound(clamped, soundMuted);
    }

    if (onProgress && !String(g.id).startsWith('demo-')) {
      onProgress(g, clamped);
    }
  };

  const avgDepth = displayedGoals.length
    ? Math.round(displayedGoals.reduce((sum, g) => sum + getPct(g), 0) / displayedGoals.length)
    : 0;

  return (
    <div
      data-preserve-theme="true"
      className="preserve-island-theme relative overflow-hidden rounded-2xl border-2 border-[#0A2B6D] p-3 shadow-lg"
      style={{
        background: 'linear-gradient(160deg, #0072FF 0%, #0A2B6D 45%, #00C6FF 100%)',
      }}
    >
      {/* Compact Deep Blue Sea Header on Crisp White */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white px-3 py-2 shadow-sm">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D] bg-[#0072FF] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              <Anchor className="h-3 w-3 text-white" /> Deep Blue Sea
            </span>
            <h3 className="rounded bg-white text-xs sm:text-sm font-extrabold text-[#0A2B6D]">
              🤿 Deep Sea Scuba Progress &amp; 100% Custom Milestone Rewards
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSoundMuted((m) => !m)}
            className={`inline-flex items-center gap-1 rounded-full border-2 border-[#0A2B6D] px-2.5 py-0.5 text-[10px] font-extrabold transition-all ${
              soundMuted
                ? 'bg-white text-[#0A2B6D]'
                : 'bg-[#00C6FF] text-[#0A2B6D] shadow-2xs'
            }`}
          >
            {soundMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            {soundMuted ? 'Muted' : 'Ocean FX: ON'}
          </button>

          <Badge className="border-2 border-[#0A2B6D] bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
            Avg: {avgDepth}%
          </Badge>
        </div>
      </div>

      {/* Live 100% Milestone Celebration Banner */}
      {celebrationBanner && (
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white p-2.5 text-[#0A2B6D] shadow-md">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-[#FFE066] text-xl">
              {celebrationBanner.rewardIcon}
            </span>
            <div className="bg-white text-xs">
              <div className="font-extrabold text-[#5A00D6]">
                100% Tank Full · {celebrationBanner.rewardTitle} Unlocked!
              </div>
              <div className="font-bold text-[#0A2B6D]">“{celebrationBanner.goalTitle}”</div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCelebrationBanner(null)}
            className="h-7 border-2 border-[#0A2B6D] bg-white px-2.5 text-[10px] font-extrabold text-[#0A2B6D]"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Fitted 3-Column Scuba Cylinders Grid — Compact Height & Clean Fit on Tablet & Desktop */}
      <div className="mt-2.5 grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {displayedGoals.map((g, idx) => {
          const pct = getPct(g);
          const isHatched = pct >= 100;
          const reward = getRewardForGoal(g, idx);
          const isEditingThis = editingGoalId === g.id;

          return (
            <div
              key={g.id}
              className="flex flex-col justify-between rounded-xl border-2 border-[#0A2B6D] bg-white p-2.5 shadow-md"
              style={{ borderTopWidth: '4px', borderTopColor: '#0072FF' }}
            >
              <div className="flex items-start gap-2.5">
                {/* Compact 110px Vertical Neon-Aqua Scuba Cylinder */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-2 w-5 rounded-t border border-[#0A2B6D] bg-[#00C6FF]" />
                  <div
                    style={{ height: 110, width: 42 }}
                    className="relative flex h-[110px] w-[42px] shrink-0 flex-col justify-end overflow-hidden rounded-xl border-2 border-[#0A2B6D] bg-[#031026] shadow-sm"
                  >
                    <div
                      className="w-full transition-all duration-500"
                      style={{
                        height: `${pct}%`,
                        background: isHatched
                          ? 'linear-gradient(180deg, #00F5D4 0%, #00C6FF 55%, #0072FF 100%)'
                          : 'linear-gradient(180deg, rgba(0,245,212,0.92) 0%, rgba(0,198,255,0.85) 100%)',
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-1 px-1 text-[7px] font-extrabold text-white">
                      <span>100%</span>
                      <span>50%</span>
                      <span>0%</span>
                    </div>
                  </div>
                </div>

                {/* Goal Details on Crisp White Surface */}
                <div className="min-w-0 flex-1 space-y-1 bg-white">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate rounded border border-[#0A2B6D] bg-[#F5F0FF] px-1.5 py-0.5 text-[9.5px] font-extrabold text-[#0A2B6D]">
                      {g.participant_name || 'Participant'}
                    </span>
                    <span className="rounded border border-[#0A2B6D] bg-[#FFE066] px-1.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
                      {pct}%
                    </span>
                  </div>
                  <p className="rounded bg-white text-[11px] font-extrabold leading-snug text-[#0A2B6D]">
                    {g.goal}
                  </p>

                  {/* Compact Reward Selector */}
                  <div className="rounded-lg border border-[#0A2B6D] bg-[#F5F0FF] p-1">
                    <div className="mb-1 flex items-center justify-between gap-1">
                      <span className="inline-flex items-center gap-0.5 rounded bg-white px-1 py-0 text-[8.5px] font-extrabold uppercase text-[#0A2B6D]">
                        <Gift className="h-2.5 w-2.5 text-[#5A00D6]" /> Reward:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGoalId(isEditingThis ? null : g.id);
                          setCustomPrizeDraft(reward.customNote || '');
                        }}
                        className="inline-flex items-center gap-0.5 rounded border border-[#0A2B6D] bg-white px-1 py-0 text-[8px] font-extrabold text-[#0A2B6D] hover:bg-[#FFE066]"
                      >
                        <Plus className="h-2 w-2" /> Custom
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-0.5">
                      {DEEP_SEA_REWARD_CATALOG.map((item) => {
                        const selected = reward.id === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              selectPresetReward(g.id, item.id);
                              playScubaBubbleSound(85, soundMuted);
                            }}
                            title={`Choose ${item.title}`}
                            className={`flex h-6 w-6 items-center justify-center rounded border text-xs ${
                              selected
                                ? 'border-[#0A2B6D] bg-[#FFE066]'
                                : 'border-[#0A2B6D]/30 bg-white opacity-80'
                            }`}
                          >
                            {item.icon}
                          </button>
                        );
                      })}
                    </div>

                    {isEditingThis && (
                      <div className="mt-1 flex gap-1">
                        <Input
                          value={customPrizeDraft}
                          onChange={(e) => setCustomPrizeDraft(e.target.value)}
                          placeholder="Custom prize…"
                          className="h-6 border-[#0A2B6D] bg-white px-1.5 text-[10px] text-[#0A2B6D]"
                        />
                        <Button
                          size="sm"
                          onClick={() => saveCustomPrizeNote(g.id)}
                          className="h-6 px-2 text-[9px] font-extrabold"
                        >
                          Save
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Reward Status Line */}
                  <div className="flex items-center justify-between gap-1 rounded-lg border border-[#0A2B6D] bg-white px-2 py-1 text-[9.5px] font-extrabold text-[#0A2B6D]">
                    <span className="truncate">
                      {isHatched ? '🎉 Unlocked: ' : 'Next: '}
                      <span className="text-[#5A00D6]">{reward.icon} {reward.customNote || reward.title}</span>
                    </span>
                    {isHatched && (
                      <button
                        type="button"
                        onClick={() =>
                          playDeepSeaMilestoneFanfare(
                            g.goal,
                            reward.customNote || reward.title,
                            soundMuted
                          )
                        }
                        className="shrink-0 rounded border border-[#0A2B6D] bg-[#FFE066] p-0.5 text-[#0A2B6D]"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Compact Submarine Slider Control */}
              <div className="mt-2 border-t border-[#0A2B6D]/20 bg-white pt-1.5">
                <div className="mb-1 flex items-center justify-between text-[9px] font-extrabold text-[#0A2B6D]">
                  <span>Submarine Slider</span>
                  <div className="flex gap-1">
                    {[25, 50, 75, 100].map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => handleDiveChange(g, step, idx)}
                        className={`rounded border border-[#0A2B6D] px-1 py-0 text-[8.5px] font-extrabold ${
                          pct === step
                            ? 'bg-[#FFE066] text-[#0A2B6D]'
                            : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                        }`}
                      >
                        {step}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative flex h-8 items-center">
                  <div className="h-2.5 w-full overflow-hidden rounded-full border border-[#0A2B6D] bg-[#031026]">
                    <div
                      className="h-full bg-gradient-to-r from-[#0072FF] via-[#00C6FF] to-[#00F5D4]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={pct}
                    onChange={(e) => handleDiveChange(g, Number(e.target.value), idx)}
                    aria-label={`Adjust scuba progress for ${g.goal}`}
                    className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                  />
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      left: `calc(${pct}% - ${(pct / 100) * 30}px)`,
                    }}
                    className="pointer-events-none absolute z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-[#FFE066] text-sm shadow transition-all"
                  >
                    <span role="img" aria-label="Yellow Submarine">🚢</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}