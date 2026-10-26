import React, { useState, useEffect } from 'react';
import { Award, Sparkles, Anchor, Volume2, VolumeX, Gift, Plus } from 'lucide-react';
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
      className="relative overflow-hidden rounded-2xl border-2 border-[#0A2B6D] p-4 text-white shadow-lg"
      style={{
        background: 'radial-gradient(circle at 80% 10%, #0D3B66 0%, #061A40 48%, #030B1E 100%)',
      }}
    >
      {/* Deep Sea Header with Sound Effects Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#00C6FF]/70 bg-[#0A2B6D]/90 px-3.5 py-2.5 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#00C6FF] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              <Anchor className="h-3 w-3" /> Participant View · Base-44
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              🤿 Deep Sea Progress · Scuba Driver &amp; 100% Custom Rewards
            </h3>
          </div>
          <p className="text-xs text-[#7FE7DC]">
            176px neon-aqua scuba cylinders · 44×44px yellow submarine slider · Underwater bubble &amp; fanfare audio + custom 100% rewards!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundMuted((m) => !m)}
            className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-1 text-xs font-extrabold transition-all ${
              soundMuted
                ? 'border-pink-400 bg-[#041533] text-pink-300'
                : 'border-[#00F5D4] bg-[#00F5D4] text-[#0A2B6D] shadow-sm'
            }`}
            title="Toggle underwater sonar, bubble & 100% milestone fanfare sounds"
          >
            {soundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {soundMuted ? 'Sound Effects Muted' : 'Ocean Sound FX: ON'}
          </button>

          <Badge className="border border-[#00F5D4] bg-[#041533] px-2.5 py-1 text-xs font-extrabold text-[#00F5D4]">
            Fleet Dive Average: {avgDepth}%
          </Badge>
        </div>
      </div>

      {/* Live 100% Milestone Celebration Banner */}
      {celebrationBanner && (
        <div
          className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#FFE066] p-3 text-[#0A2B6D] shadow-lg"
          style={{
            background: 'linear-gradient(120deg, #FFFDF0 0%, #FFE066 38%, #00F5D4 78%, #00C6FF 100%)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#0A2B6D] bg-white text-2xl shadow">
              {celebrationBanner.rewardIcon}
            </span>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                <Sparkles className="h-3.5 w-3.5" /> 100% Scuba Tank Full · Milestone Reward Hatched!
              </div>
              <div className="text-sm font-extrabold text-[#0A2B6D]">
                {celebrationBanner.participant} unlocked <span className="underline">{celebrationBanner.rewardTitle}</span> ({celebrationBanner.rewardBadge})
              </div>
              <div className="text-xs font-semibold text-[#0A2B6D]/85">
                Goal completed: “{celebrationBanner.goalTitle}”
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              onClick={() =>
                playDeepSeaMilestoneFanfare(
                  celebrationBanner.goalTitle,
                  celebrationBanner.rewardTitle,
                  soundMuted
                )
              }
              className="border-2 border-[#0A2B6D] bg-[#0A2B6D] text-white"
            >
              <Volume2 className="h-3.5 w-3.5" /> Replay Fanfare
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCelebrationBanner(null)}
              className="border-2 border-[#0A2B6D] bg-white text-[#0A2B6D]"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Scuba Cylinders Grid */}
      <div className={`mt-3 grid grid-cols-1 gap-3 ${compact ? 'sm:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {displayedGoals.map((g, idx) => {
          const pct = getPct(g);
          const isHatched = pct >= 100;
          const reward = getRewardForGoal(g, idx);
          const isEditingThis = editingGoalId === g.id;

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
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-2 px-1 text-[8px] font-extrabold text-white/75">
                      <span>100%</span>
                      <span>75%</span>
                      <span>50%</span>
                      <span>25%</span>
                      <span>0%</span>
                    </div>
                  </div>
                </div>

                {/* Goal Details & Custom 100% Milestone Reward */}
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

                  {/* Custom Reward Selector Strip */}
                  <div className="rounded-xl border border-[#00C6FF]/40 bg-[#041533]/90 p-1.5">
                    <div className="mb-1 flex items-center justify-between gap-1">
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold uppercase text-[#FFE066]">
                        <Gift className="h-3 w-3" /> 100% Reward Badge:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGoalId(isEditingThis ? null : g.id);
                          setCustomPrizeDraft(reward.customNote || '');
                        }}
                        className="inline-flex items-center gap-0.5 rounded bg-[#0072FF] px-1.5 py-0.5 text-[9px] font-extrabold text-white hover:bg-[#5A00D6]"
                      >
                        <Plus className="h-2.5 w-2.5" /> Custom Prize
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
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
                            className={`flex h-7 w-7 items-center justify-center rounded-lg border text-sm transition-transform ${
                              selected
                                ? 'scale-105 border-[#FFE066] bg-[#0A2B6D] ring-1 ring-[#FFE066]'
                                : 'border-white/20 bg-[#031026] opacity-75 hover:opacity-100'
                            }`}
                          >
                            {item.icon}
                          </button>
                        );
                      })}
                    </div>

                    {isEditingThis && (
                      <div className="mt-1.5 flex gap-1">
                        <Input
                          value={customPrizeDraft}
                          onChange={(e) => setCustomPrizeDraft(e.target.value)}
                          placeholder="e.g. Beach Gelato Outing or Aquarium Pass"
                          className="h-7 border-[#00C6FF] bg-[#031026] px-2 text-[11px] text-white placeholder:text-slate-400"
                        />
                        <Button
                          size="sm"
                          onClick={() => saveCustomPrizeNote(g.id)}
                          className="h-7 px-2 text-[10px] font-extrabold"
                        >
                          Save
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* 100% Milestone Reward Card */}
                  {isHatched ? (
                    <div
                      className="mt-1.5 flex items-center justify-between gap-2 rounded-xl border-2 border-[#FFE066] p-2 shadow-[0_0_16px_rgba(255,224,102,0.45)]"
                      style={{ background: reward.accent }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/95 text-xl shadow-inner">
                          {reward.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-[#0A2B6D]">
                            <Sparkles className="h-3 w-3 text-[#0A2B6D]" /> 100% Reward Unlocked!
                          </div>
                          <div className="truncate text-[11px] font-extrabold text-[#0A2B6D]">
                            {reward.customNote || reward.title}
                          </div>
                          <div className="text-[9.5px] font-bold text-[#0A2B6D]/85">
                            {reward.badge}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          playDeepSeaMilestoneFanfare(
                            g.goal,
                            reward.customNote || reward.title,
                            soundMuted
                          )
                        }
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#0A2B6D] bg-white/90 text-[#0A2B6D] shadow-2xs hover:bg-white"
                        title="Play 100% Milestone Chime & Fanfare"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1.5 rounded-xl border border-[#00C6FF]/40 bg-[#041533]/80 p-2 text-[10.5px] font-semibold text-[#7FE7DC]">
                      Next at 100%: <span className="font-extrabold text-[#FFE066]">{reward.icon} {reward.customNote || reward.title}</span>
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
                        onClick={() => handleDiveChange(g, step, idx)}
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
                  <div className="h-3 w-full overflow-hidden rounded-full border border-[#00F5D4]/60 bg-[#031026]">
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
          <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-[#FFE066]" /> Deep Sea Palette &amp; Audio Engine:</span>
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