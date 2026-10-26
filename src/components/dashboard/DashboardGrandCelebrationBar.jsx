import React, { useState, useEffect } from 'react';
import { Trophy, Volume2, VolumeX, Gift, Plus, Sparkles, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  SHORELINE_REWARDS,
  playShorelineVictoryFanfare,
  playFastCheerSound,
} from '@/components/hr/shorelineSoundAndRewards';

const DASHBOARD_CELEBRATION_STORAGE = 'chr-main-dashboard-celebration-reward-v1';

export default function DashboardGrandCelebrationBar() {
  const [soundMuted, setSoundMuted] = useState(false);
  const [victoryModalOpen, setVictoryModalOpen] = useState(false);
  const [editingCustom, setEditingCustom] = useState(false);
  const [customDraft, setCustomDraft] = useState('');
  const [rewardState, setRewardState] = useState(() => {
    try {
      const raw = localStorage.getItem(DASHBOARD_CELEBRATION_STORAGE);
      return raw
        ? JSON.parse(raw)
        : { presetId: 'golden-anchor-voucher', customTitle: 'Executive 100% Compliance & Beach Milestone Trophy' };
    } catch {
      return { presetId: 'golden-anchor-voucher', customTitle: 'Executive 100% Compliance & Beach Milestone Trophy' };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(DASHBOARD_CELEBRATION_STORAGE, JSON.stringify(rewardState));
    } catch {
      // ignore
    }
  }, [rewardState]);

  const activePreset =
    SHORELINE_REWARDS.find((r) => r.id === rewardState.presetId) || SHORELINE_REWARDS[0];
  const activeRewardName = rewardState.customTitle?.trim() || activePreset.title;

  const launchMainCelebration = () => {
    setVictoryModalOpen(true);
    playShorelineVictoryFanfare(
      activeRewardName,
      'Main Executive Dashboard 100% Grand Celebration',
      soundMuted
    );
  };

  return (
    <section
      className="rounded-3xl p-[12px] shadow-lg"
      style={{
        background:
          'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
      }}
    >
      <div className="rounded-[16px] bg-white p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#0A2B6D] text-xl text-white shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
            }}
          >
            🏆
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-[#5A00D6] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                Main Dashboard Celebration
              </span>
              <h2 className="text-sm font-extrabold text-[#0A2B6D]">
                Grand Victory Fanfare, Sound FX &amp; Custom Organisation Rewards
              </h2>
            </div>
            <p className="text-xs font-semibold text-[#0A2B6D]/80">
              Active Reward: <span className="font-extrabold text-[#5A00D6]">{activePreset.icon} {activeRewardName}</span> · Celebrates 100% across Deep Sea, Kids Zone &amp; Shoreline Command!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Quick Cheer Chimes */}
          {['☀️', '🏄‍♂️', '⚓', '🌴'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => playFastCheerSound(emoji, 'Dashboard Cheer', soundMuted)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#0A2B6D] bg-[#FBF7EE] text-base shadow-2xs transition-transform hover:scale-105"
              title={`Trigger ${emoji} Cheer Chime & Confetti`}
            >
              {emoji}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setSoundMuted((m) => !m)}
            className={`inline-flex h-9 items-center gap-1 rounded-xl border-2 border-[#0A2B6D] px-2.5 text-xs font-extrabold ${
              soundMuted ? 'bg-slate-100 text-[#0A2B6D]' : 'bg-[#FFD166] text-[#0A2B6D]'
            }`}
          >
            {soundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {soundMuted ? 'Muted' : 'Audio FX'}
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingCustom((v) => !v);
              setCustomDraft(rewardState.customTitle || '');
            }}
            className="inline-flex h-9 items-center gap-1 rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF] px-2.5 text-xs font-extrabold text-[#0A2B6D] hover:bg-[#EDE9FE]"
          >
            <Gift className="h-3.5 w-3.5 text-[#5A00D6]" />
            <Plus className="h-3 w-3" /> Custom Reward
          </button>

          <Button
            size="sm"
            onClick={launchMainCelebration}
            className="h-9 border-2 border-[#0A2B6D] font-extrabold text-white shadow-sm"
          >
            <Trophy className="h-3.5 w-3.5 text-[#FFE066]" /> Celebrate 100% Victory
          </Button>
        </div>
      </div>

      {/* Custom Reward Picker & Input Drawer */}
      {editingCustom && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-2.5">
          <div className="flex items-center gap-1">
            {SHORELINE_REWARDS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRewardState((prev) => ({ ...prev, presetId: r.id, customTitle: r.title }))}
                className={`inline-flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold ${
                  rewardState.presetId === r.id
                    ? 'border-[#0A2B6D] bg-[#FFD166] text-[#0A2B6D]'
                    : 'border-[#0A2B6D]/40 bg-white text-[#0A2B6D]'
                }`}
              >
                <span>{r.icon}</span>
                <span className="hidden sm:inline">{r.title}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-1 items-center gap-1.5 min-w-[220px]">
            <Input
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              placeholder="Custom organisation or participant victory reward..."
              className="h-8 border-[#0A2B6D] bg-white text-xs text-[#0A2B6D]"
            />
            <Button
              size="sm"
              onClick={() => {
                setRewardState((prev) => ({ ...prev, customTitle: customDraft.trim() }));
                setEditingCustom(false);
              }}
              className="h-8 px-3 text-xs font-extrabold"
            >
              Save Reward
            </Button>
          </div>
        </div>
      )}

      {/* Animated Final Victory Celebration Screen Banner */}
      {victoryModalOpen && (
        <div
          className="mt-3 rounded-2xl border-2 border-[#0A2B6D] p-4 text-white shadow-xl"
          style={{
            background:
              'linear-gradient(120deg, #0072FF 0%, #0A2B6D 22%, #5A00D6 48%, #A100FF 72%, #FF2E9A 100%)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 animate-bounce items-center justify-center rounded-2xl border-2 border-[#FFE066] bg-white text-3xl shadow-md">
                {activePreset.icon}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#FFE066]">
                  <PartyPopper className="h-4 w-4" /> Final Victory Screen · Organisation &amp; Participant Milestone!
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  🎉 {activeRewardName} Unlocked!
                </h3>
                <p className="text-xs font-semibold text-white/90">
                  🤿 100% Deep Sea Scuba Pearl · 🏖️ 132×132px Kids Zone Treasure Chest · ⚓ 100% Shoreline Deep Teal Command
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() =>
                  playShorelineVictoryFanfare(
                    activeRewardName,
                    'Main Executive Dashboard 100% Grand Celebration',
                    soundMuted
                  )
                }
                className="border-2 border-white bg-[#FFE066] font-extrabold text-[#0A2B6D] hover:bg-white"
              >
                <Sparkles className="h-3.5 w-3.5" /> Replay Fanfare &amp; Confetti
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setVictoryModalOpen(false)}
                className="border-2 border-white bg-white font-extrabold text-[#0A2B6D]"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </section>
  );
}