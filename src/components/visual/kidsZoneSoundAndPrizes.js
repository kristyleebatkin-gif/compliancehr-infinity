import confetti from 'canvas-confetti';

export const KIDS_ZONE_PRIZES = [
  {
    id: 'pirate-crown',
    icon: '👑',
    title: '24K Golden Island Crown & Coins',
    subtitle: 'Captain of Treasure Island',
  },
  {
    id: 'rainbow-shell',
    icon: '🐚',
    title: 'Magical Singing Conch Shell',
    subtitle: 'Ocean Explorer Sticker Star',
  },
  {
    id: 'beach-icecream',
    icon: '🍦',
    title: 'Tropical Gelato & Playground Time',
    subtitle: 'Special Sunshine Treat',
  },
  {
    id: 'dolphin-medal',
    icon: '🐬',
    title: 'Sparkling Dolphin Jump Trophy',
    subtitle: 'Super Swimmer Champion',
  },
  {
    id: 'pirate-ship',
    icon: '⛵',
    title: 'Pirate Captain’s Sailboat Pass',
    subtitle: 'Choose the Next Group Game!',
  },
];

function getAudioCtx() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!window.__kidsZoneAudioCtx) {
    window.__kidsZoneAudioCtx = new Ctx();
  }
  if (window.__kidsZoneAudioCtx.state === 'suspended') {
    window.__kidsZoneAudioCtx.resume().catch(() => {});
  }
  return window.__kidsZoneAudioCtx;
}

/**
 * Plays a cheerful tropical marimba / seashell chime when tapping a stepping stone (steps 1..6)
 */
export function playSteppingStoneChime(stepNumber = 1, muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  const scale = [392.0, 440.0, 493.88, 523.25, 587.33, 659.25];
  const freq = scale[(Math.max(1, stepNumber) - 1) % scale.length];
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.14);

  gain.gain.setValueAtTime(0.14, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.17);
}

/**
 * Plays a golden coin cascade + pirate victory fanfare + confetti when the 132x132px treasure chest opens
 */
export function playTreasureChestFanfare(prizeTitle, avatarLabel, muted = false) {
  if (!muted) {
    const ctx = getAudioCtx();
    if (ctx) {
      const now = ctx.currentTime;

      // 1) Sparkling Golden Coin Cascade (rapid high chimes)
      const coinNotes = [987.77, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0];
      coinNotes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + i * 0.055;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.11, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.15);
      });

      // 2) Island Victory Brass/Marimba Fanfare (G4 - C5 - E5 - G5 - C6)
      const fanfare = [392.0, 523.25, 659.25, 783.99, 1046.5];
      fanfare.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + 0.3 + idx * 0.1;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.52);
      });
    }
  }

  // Confetti burst in gold, turquoise, and pink
  if (typeof window !== 'undefined') {
    try {
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#FFD166', '#FFE066', '#00C6FF', '#FF2E9A', '#5A00D6'],
      });
    } catch {
      // ignore
    }
  }

  // Spoken cheer if not muted
  if (!muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(
        `Hooray! ${avatarLabel || 'Captain'} opened the Golden Treasure Chest and won ${prizeTitle || 'Golden Coins'}!`
      );
      u.rate = 0.96;
      window.speechSynthesis.speak(u);
    } catch {
      // ignore
    }
  }
}