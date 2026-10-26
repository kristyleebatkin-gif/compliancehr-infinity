import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Volume2, VolumeX, Gift, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  KIDS_ZONE_PRIZES,
  playSteppingStoneChime,
  playTreasureChestFanfare,
} from '@/components/visual/kidsZoneSoundAndPrizes';

const ISLAND_STEPS = [
  { id: 1, shell: '🐚', name: 'Pink Conch Cove', actionLabel: '1. Splash into Morning Routine!', copy: 'Brush teeth, wash face & put on your island hat!' },
  { id: 2, shell: '🪙', name: 'Sand Dollar Shore', actionLabel: '2. Pack Your Treasure Bag!', copy: 'Water bottle, lunch box & communication board ready!' },
  { id: 3, shell: '🪸', name: 'Turquoise Wave Bay', actionLabel: '3. Say Ahoy to Friends!', copy: 'Big wave, smile or tap hello on your talker!' },
  { id: 4, shell: '⭐', name: 'Starfish Stepping Stone', actionLabel: '4. Island Activity Quest!', copy: 'Join the group game, craft or sensory sand play!' },
  { id: 5, shell: '🐚', name: '24K Golden Shell Reef', actionLabel: '5. Calm Breaths by the Sea!', copy: '3 deep ocean breaths — in like a wave, out like the tide!' },
  { id: 6, shell: '🪙', name: 'Captain’s Pier', actionLabel: '6. Unlock the Golden Chest!', copy: 'You made it across Treasure Island — tap to burst the chest!' },
];

const AVATARS = [
  { id: 'crab', emoji: '🦀', label: 'Captain Claws' },
  { id: 'pirate', emoji: '🏴‍☠️', label: 'Pirate Pip' },
];

const STORAGE_KEY = 'chr-kids-zone-treasure-prize-v1';

export default function KidsZoneTreasurePath() {
  const [currentStep, setCurrentStep] = useState(2);
  const [avatarId, setAvatarId] = useState('crab');
  const [chestOpened, setChestOpened] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [editingCustomPrize, setEditingCustomPrize] = useState(false);
  const [customPrizeDraft, setCustomPrizeDraft] = useState('');
  const [prizeConfig, setPrizeConfig] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { presetId: 'pirate-crown', customTitle: '' };
    } catch {
      return { presetId: 'pirate-crown', customTitle: '' };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prizeConfig));
    } catch {
      // ignore storage errors
    }
  }, [prizeConfig]);

  const activeAvatar = AVATARS.find((a) => a.id === avatarId) || AVATARS[0];
  const activePreset =
    KIDS_ZONE_PRIZES.find((p) => p.id === prizeConfig.presetId) || KIDS_ZONE_PRIZES[0];
  const displayPrizeTitle = prizeConfig.customTitle?.trim() || activePreset.title;
  const isFinished = currentStep >= ISLAND_STEPS.length || chestOpened;

  const speakStep = (text) => {
    if (soundMuted) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  const handleNodeClick = (stepId, step) => {
    setCurrentStep(stepId);
    if (stepId === ISLAND_STEPS.length) {
      setChestOpened(true);
      playTreasureChestFanfare(displayPrizeTitle, activeAvatar.label, soundMuted);
    } else {
      playSteppingStoneChime(stepId, soundMuted);
      speakStep(`${step.actionLabel} ${step.copy}`);
    }
  };

  const handleChestClick = () => {
    const nextOpen = !isFinished;
    setCurrentStep(ISLAND_STEPS.length);
    setChestOpened(nextOpen);
    if (nextOpen) {
      playTreasureChestFanfare(displayPrizeTitle, activeAvatar.label, soundMuted);
    } else {
      playSteppingStoneChime(1, soundMuted);
    }
  };

  const saveCustomPrize = () => {
    setPrizeConfig((prev) => ({ ...prev, customTitle: customPrizeDraft.trim() }));
    setEditingCustomPrize(false);
  };

  const resetJourney = () => {
    setCurrentStep(1);
    setChestOpened(false);
    playSteppingStoneChime(1, soundMuted);
  };

  return (
    <div
      data-preserve-theme="true"
      className="preserve-island-theme relative overflow-hidden rounded-2xl border-[3px] border-[#0A2B6D] p-4 shadow-md text-center"
      style={{
        background: 'linear-gradient(165deg, #00C6FF 0%, #17B8C4 34%, #7FE7DC 52%, #F4E0B2 64%, #E8C988 100%)',
      }}
    >
      {/* Centered Header Bar */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#0A2B6D] bg-white px-4 py-3 text-center shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex h-6 items-center rounded-full bg-[#0072FF] px-3 text-[11px] font-extrabold uppercase tracking-wider text-white">
            Treasure Hunt · Visual Routine
          </span>
          <h3 className="font-editorial text-base sm:text-lg md:text-xl font-extrabold text-[#0A2B6D]">
            🏖️ Tropical Treasure Hunt Island Path &amp; Chest Prizes
          </h3>
        </div>
        <p
          className="mx-auto max-w-3xl text-center text-xs font-extrabold text-black"
          style={{ color: '#000000' }}
        >
          Tap each seashell stepping stone for island marimba chimes &amp; walk across the beach to burst open the golden treasure chest!
        </p>

        {/* Centered Controls Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSoundMuted((m) => !m)}
            className={`flex h-[38px] items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3.5 text-xs font-extrabold transition-all ${
              soundMuted
                ? 'bg-slate-100 text-[#0A2B6D]'
                : 'bg-[#FFD166] text-[#0A2B6D] shadow-sm'
            }`}
          >
            {soundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span>{soundMuted ? 'Muted' : 'Island FX: ON'}</span>
          </button>

          {AVATARS.map((av) => {
            const active = av.id === avatarId;
            return (
              <button
                key={av.id}
                type="button"
                onClick={() => {
                  setAvatarId(av.id);
                  playSteppingStoneChime(3, soundMuted);
                }}
                className={`flex h-[38px] items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3.5 text-xs font-extrabold transition-transform ${
                  active
                    ? 'scale-105 bg-[#FF2E9A] text-white shadow-md'
                    : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                }`}
              >
                <span className="text-base leading-none">{av.emoji}</span>
                <span>{av.label}</span>
              </button>
            );
          })}

          <Button
            size="sm"
            variant="outline"
            onClick={resetJourney}
            className="h-[38px] rounded-full border-2 border-[#0A2B6D] bg-white px-3.5 text-xs font-extrabold text-[#0A2B6D]"
          >
            <RotateCcw className="h-3.5 w-3.5" /> New Island Run
          </Button>
        </div>
      </div>

      {/* Treasure Chest Unlocked Celebration Banner */}
      {isFinished && (
        <div
          className="relative z-10 mt-3 flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 text-center shadow-lg"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#0A2B6D] bg-[#FFD166] text-2xl shadow">
            {activePreset.icon}
          </span>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
              <Sparkles className="h-3.5 w-3.5" /> Golden Treasure Chest Burst Open!
            </div>
            <div className="text-sm font-extrabold text-[#0A2B6D]">
              {activeAvatar.emoji} {activeAvatar.label} unlocked: <span className="underline">{displayPrizeTitle}</span>!
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => playTreasureChestFanfare(displayPrizeTitle, activeAvatar.label, soundMuted)}
            className="rounded-full border-2 border-[#0A2B6D] bg-[#0A2B6D] text-white"
          >
            <Volume2 className="h-3.5 w-3.5" /> Replay Fanfare
          </Button>
        </div>
      )}

      {/* Main Beach & Ocean Path Arena — Centered & Aligned */}
      <div className="relative z-10 mt-3 grid grid-cols-1 gap-3.5 lg:grid-cols-12 items-stretch">
        {/* 6 Stepping Nodes in a 2x3 Symmetrical Grid (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white/95 p-3.5">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-full border border-[#0A2B6D]/20 bg-[#E6FAFC] px-4 py-1 text-xs font-extrabold text-[#0A2B6D]">
            <span>🌊 Turquoise Ocean Waves → 🏖️ Warm Golden Sand</span>
            <span className="rounded-full bg-[#0A2B6D] px-2.5 py-0.5 text-[10px] text-white">
              Step {Math.min(currentStep, ISLAND_STEPS.length)} of {ISLAND_STEPS.length}
            </span>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2 items-stretch">
            {ISLAND_STEPS.map((step) => {
              const reached = step.id <= currentStep;
              const isCurrent = step.id === currentStep;
              return (
                <div
                  key={step.id}
                  onClick={() => handleNodeClick(step.id, step)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNodeClick(step.id, step)}
                  className={`group flex h-full cursor-pointer flex-col items-center justify-between gap-2 rounded-2xl border-2 border-[#0A2B6D] p-3 text-center transition-all hover:-translate-y-0.5 ${
                    isCurrent
                      ? 'bg-gradient-to-b from-[#FFF3C4] via-white to-[#D8F9FF] ring-2 ring-[#FF2E9A] shadow-md'
                      : reached
                      ? 'bg-[#E6FAFC]'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="relative flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] shadow-sm transition-transform group-hover:scale-105"
                      style={{
                        background: reached
                          ? 'radial-gradient(circle at 30% 30%, #FFF7D6 0%, #FFD166 65%, #F4A261 100%)'
                          : 'radial-gradient(circle at 30% 30%, #FFFFFF 0%, #E9D8A6 100%)',
                      }}
                    >
                      <span className="text-xl leading-none" aria-hidden="true">{step.shell}</span>
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0A2B6D] text-[9px] font-extrabold text-white">
                        {step.id}
                      </span>
                    </div>

                    {isCurrent && (
                      <div
                        className="flex h-[40px] w-[40px] shrink-0 animate-bounce items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] text-white shadow-md"
                      >
                        <span className="text-xl leading-none">{activeAvatar.emoji}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-center">
                    <div className="flex items-center justify-center gap-1 text-xs font-extrabold text-[#0A2B6D]">
                      <span>{step.actionLabel}</span>
                      <Volume2 className="h-3 w-3 shrink-0 text-[#0072FF]" />
                    </div>
                    <p
                      className="text-center text-[11px] font-bold leading-snug text-black"
                      style={{ color: '#000000' }}
                    >
                      {step.copy}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Finish Line Wooden Treasure Chest & Custom Prize Picker Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white/95 p-3.5 text-center shadow-sm">
          <span className="rounded-full bg-[#5A00D6] px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-white">
            Finish Line Golden Treasure Chest
          </span>

          <button
            type="button"
            onClick={handleChestClick}
            style={{ width: 132, height: 132 }}
            className={`relative my-2 flex h-[132px] w-[132px] flex-col items-center justify-center rounded-2xl border-4 border-[#0A2B6D] shadow-lg transition-all hover:scale-105 ${
              isFinished
                ? 'bg-gradient-to-b from-[#FFE066] via-[#F59E0B] to-[#92400E] ring-4 ring-[#FF2E9A]'
                : 'bg-gradient-to-b from-[#B45309] via-[#78350F] to-[#451A03]'
            }`}
          >
            {isFinished && (
              <div className="pointer-events-none absolute -top-3 inset-x-0 flex justify-center gap-1 text-lg animate-bounce">
                <span>🪙</span>
                <span>✨</span>
                <span>{activePreset.icon}</span>
                <span>🪙</span>
              </div>
            )}
            <span className="text-5xl leading-none">{isFinished ? activePreset.icon : '🧰'}</span>
            <span className="mt-1 rounded bg-[#0A2B6D] px-2 py-0.5 text-[10px] font-extrabold text-[#FFE066]">
              {isFinished ? 'CHEST OPEN!' : 'TAP CHEST'}
            </span>
          </button>

          <div className="w-full rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-2.5 text-center space-y-1.5">
            <div className="flex items-center justify-between gap-1">
              <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase text-[#5A00D6]">
                <Gift className="h-3.5 w-3.5" /> Chest Prize:
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditingCustomPrize((v) => !v);
                  setCustomPrizeDraft(prizeConfig.customTitle || '');
                }}
                className="inline-flex items-center gap-0.5 rounded-full border border-[#0A2B6D] bg-white px-2 py-0.5 text-[9.5px] font-extrabold text-[#0A2B6D] hover:bg-[#FFD166]"
              >
                <Plus className="h-2.5 w-2.5" /> Custom Prize
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5">
              {KIDS_ZONE_PRIZES.map((p) => {
                const selected = p.id === prizeConfig.presetId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPrizeConfig((prev) => ({ ...prev, presetId: p.id }));
                      playSteppingStoneChime(5, soundMuted);
                    }}
                    title={p.title}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 text-base transition-transform ${
                      selected
                        ? 'scale-105 border-[#0A2B6D] bg-[#FFD166] shadow-2xs'
                        : 'border-[#0A2B6D]/40 bg-white opacity-80 hover:opacity-100'
                    }`}
                  >
                    {p.icon}
                  </button>
                );
              })}
            </div>

            {editingCustomPrize && (
              <div className="mt-1.5 flex gap-1">
                <Input
                  value={customPrizeDraft}
                  onChange={(e) => setCustomPrizeDraft(e.target.value)}
                  placeholder="e.g. 15 mins iPad / Sensory Sand Play"
                  className="h-7 border-[#0A2B6D] bg-white px-2 text-[11px] text-[#0A2B6D]"
                />
                <Button
                  size="sm"
                  onClick={saveCustomPrize}
                  className="h-7 px-2 text-[10px] font-extrabold"
                >
                  Save
                </Button>
              </div>
            )}

            <p className="text-center text-xs font-extrabold text-[#0A2B6D]">
              {isFinished
                ? `🎉 Won: ${displayPrizeTitle}!`
                : `Next Chest Prize: ${activePreset.icon} ${displayPrizeTitle}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}