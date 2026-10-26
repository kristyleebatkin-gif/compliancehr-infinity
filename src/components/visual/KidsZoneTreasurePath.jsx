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
  { id: 1, shell: '🐚', name: 'Pink Conch Cove', actionLabel: 'Splash into Morning Routine!', copy: 'Brush teeth, wash face & put on your island hat!' },
  { id: 2, shell: '🪙', name: 'Sand Dollar Shore', actionLabel: 'Pack Your Treasure Bag!', copy: 'Water bottle, lunch box & communication board ready!' },
  { id: 3, shell: '🪸', name: 'Turquoise Wave Bay', actionLabel: 'Say Ahoy to Friends!', copy: 'Big wave, smile or tap hello on your talker!' },
  { id: 4, shell: '⭐', name: 'Starfish Stepping Stone', actionLabel: 'Island Activity Quest!', copy: 'Join the group game, craft or sensory sand play!' },
  { id: 5, shell: '🐚', name: '24K Golden Shell Reef', actionLabel: 'Calm Breaths by the Sea!', copy: '3 deep ocean breaths — in like a wave, out like the tide!' },
  { id: 6, shell: '🪙', name: 'Captain’s Pier', actionLabel: 'Unlock the Golden Chest!', copy: 'You made it across Treasure Island — tap to burst the chest!' },
];

const AVATARS = [
  { id: 'crab', emoji: '🦀', label: 'Captain Claws (Crab)' },
  { id: 'pirate', emoji: '🏴‍☠️', label: 'Pirate Pip (Explorer)' },
];

const STORAGE_KEY = 'chr-kids-zone-treasure-prize-v1';

export default function KidsZoneTreasurePath({ compact = false }) {
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
      className="relative overflow-hidden rounded-2xl border-2 border-[#0A2B6D] p-4 shadow-md"
      style={{
        background: 'linear-gradient(165deg, #00C6FF 0%, #17B8C4 34%, #7FE7DC 52%, #F4E0B2 64%, #E8C988 100%)',
      }}
    >
      {/* Decorative Ocean Waves Ribbon */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16 opacity-35"
        style={{
          background: 'repeating-radial-gradient(circle at 22px 0px, rgba(255,255,255,0.65) 0, rgba(255,255,255,0.65) 8px, transparent 9px, transparent 28px)',
        }}
      />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white/95 px-3 py-2 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-6 items-center rounded-full bg-[#0072FF] px-2.5 text-[11px] font-extrabold uppercase tracking-wider text-white">
              Kids Zone · Base-44
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-[#0A2B6D]">
              🏖️ Treasure Island Path &amp; Chest Prizes
            </h3>
          </div>
          <p className="text-xs font-semibold text-[#0A2B6D]/80">
            Tap each 44×44px seashell node for island marimba chimes &amp; walk to the 132×132px chest to unlock custom prizes!
          </p>
        </div>

        {/* Avatar Picker (44x44px Active Avatar selector) & Sound Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundMuted((m) => !m)}
            className={`flex h-[44px] items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] px-2.5 text-xs font-extrabold transition-all ${
              soundMuted
                ? 'bg-slate-100 text-[#0A2B6D]'
                : 'bg-[#FFD166] text-[#0A2B6D] shadow-sm'
            }`}
            title="Toggle island marimba chimes & treasure chest fanfare"
          >
            {soundMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
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
                title={`Choose ${av.label} (44×44px Active Avatar)`}
                className={`flex h-[44px] items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] px-2.5 text-xs font-extrabold transition-transform ${
                  active
                    ? 'scale-105 bg-[#FF2E9A] text-white shadow-md'
                    : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                }`}
              >
                <span className="text-lg leading-none">{av.emoji}</span>
                <span className="hidden sm:inline">{av.label}</span>
              </button>
            );
          })}
          <Button
            size="sm"
            variant="outline"
            onClick={resetJourney}
            className="h-[44px] border-2 border-[#0A2B6D] bg-white font-extrabold text-[#0A2B6D]"
          >
            <RotateCcw className="h-3.5 w-3.5" /> New Island Run
          </Button>
        </div>
      </div>

      {/* Treasure Chest Unlocked Celebration Banner */}
      {isFinished && (
        <div
          className="relative z-10 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#0A2B6D] p-3 shadow-lg"
          style={{
            background: 'linear-gradient(120deg, #FFFDF0 0%, #FFD166 42%, #7FE7DC 85%, #00C6FF 100%)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#0A2B6D] bg-white text-2xl shadow">
              {activePreset.icon}
            </span>
            <div>
              <div className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                <Sparkles className="h-3.5 w-3.5" /> 132×132px Golden Treasure Chest Burst Open!
              </div>
              <div className="text-sm font-extrabold text-[#0A2B6D]">
                {activeAvatar.emoji} {activeAvatar.label} unlocked: <span className="underline">{displayPrizeTitle}</span>!
              </div>
              <div className="text-xs font-semibold text-[#0A2B6D]/85">
                {activePreset.subtitle} · All 6 Island Stepping Stones Completed!
              </div>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => playTreasureChestFanfare(displayPrizeTitle, activeAvatar.label, soundMuted)}
            className="border-2 border-[#0A2B6D] bg-[#0A2B6D] text-white"
          >
            <Volume2 className="h-3.5 w-3.5" /> Replay Chest Fanfare
          </Button>
        </div>
      )}

      {/* Main Beach & Ocean Path Arena */}
      <div className="relative z-10 mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12 items-stretch">
        {/* Stepping Nodes Column (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border-2 border-[#0A2B6D] bg-white/85 p-3 backdrop-blur-xs">
          <div className="mb-2 flex items-center justify-between text-xs font-extrabold text-[#0A2B6D]">
            <span>🌊 Turquoise Ocean Waves → 🏖️ Warm Golden Sand</span>
            <span>Step {Math.min(currentStep, ISLAND_STEPS.length)} of {ISLAND_STEPS.length}</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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
                  className={`group flex cursor-pointer items-center gap-2.5 rounded-xl border-2 border-[#0A2B6D] p-2 transition-all hover:-translate-y-0.5 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#FFF3C4] via-white to-[#D8F9FF] ring-2 ring-[#FF2E9A] shadow-md'
                      : reached
                      ? 'bg-[#E6FAFC]'
                      : 'bg-white/90 opacity-85'
                  }`}
                >
                  {/* 44x44px Walking Node (Seashell / Flat Sand Dollar) */}
                  <div
                    className="relative flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] shadow-sm transition-transform group-hover:scale-105"
                    style={{
                      width: 44,
                      height: 44,
                      background: reached
                        ? 'radial-gradient(circle at 30% 30%, #FFF7D6 0%, #FFD166 65%, #F4A261 100%)'
                        : 'radial-gradient(circle at 30% 30%, #FFFFFF 0%, #E9D8A6 100%)',
                    }}
                    title="44×44px Seashell / Sand Dollar Node"
                  >
                    <span className="text-xl leading-none" aria-hidden="true">{step.shell}</span>
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0A2B6D] text-[9px] font-extrabold text-white">
                      {step.id}
                    </span>
                  </div>

                  {/* Exciting Kid-Friendly Copywriting */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-extrabold text-[#0A2B6D]">
                        {step.actionLabel}
                      </span>
                      <Volume2 className="h-3 w-3 shrink-0 text-[#0072FF]" />
                    </div>
                    <p className="text-[11px] font-semibold text-[#0A2B6D]/85">
                      {step.copy}
                    </p>
                  </div>

                  {/* 44x44px Active Avatar sitting on the current node */}
                  {isCurrent && (
                    <div
                      className="flex h-[44px] w-[44px] shrink-0 animate-bounce items-center justify-center rounded-xl border-2 border-[#0A2B6D] bg-[#FF2E9A] text-white shadow-md"
                      style={{ width: 44, height: 44 }}
                      title={`Active 44×44px Avatar: ${activeAvatar.label}`}
                    >
                      <span className="text-2xl leading-none">{activeAvatar.emoji}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 132x132px Finish Line Wooden Treasure Chest & Custom Prize Picker Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white/95 p-3 text-center shadow-sm">
          <span className="rounded-full bg-[#5A00D6] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
            132×132px Finish Line Chest
          </span>

          <button
            type="button"
            onClick={handleChestClick}
            style={{ width: 132, height: 132 }}
            className={`relative my-1.5 flex h-[132px] w-[132px] flex-col items-center justify-center rounded-2xl border-4 border-[#0A2B6D] shadow-lg transition-all hover:scale-105 ${
              isFinished
                ? 'bg-gradient-to-b from-[#FFE066] via-[#F59E0B] to-[#92400E] ring-4 ring-[#FF2E9A]'
                : 'bg-gradient-to-b from-[#B45309] via-[#78350F] to-[#451A03]'
            }`}
            title="Click to burst open the 132×132px Wooden Treasure Chest!"
          >
            {/* Bursting Golden Coins */}
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
              {isFinished ? 'CHEST OPEN!' : 'TREASURE CHEST'}
            </span>
          </button>

          {/* Custom Prize Selector inside the Treasure Chest Panel */}
          <div className="w-full rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-2 text-left">
            <div className="mb-1 flex items-center justify-between gap-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-[#5A00D6]">
                <Gift className="h-3 w-3" /> Chest Prize:
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditingCustomPrize((v) => !v);
                  setCustomPrizeDraft(prizeConfig.customTitle || '');
                }}
                className="inline-flex items-center gap-0.5 rounded border border-[#0A2B6D] bg-white px-1.5 py-0.5 text-[9.5px] font-extrabold text-[#0A2B6D] hover:bg-[#FFD166]"
              >
                <Plus className="h-2.5 w-2.5" /> Custom Prize
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-1 my-1">
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

            <p className="mt-1 text-center text-[11px] font-extrabold text-[#0A2B6D]">
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