import confetti from 'canvas-confetti';

export const SHORELINE_REWARDS = [
  {
    id: 'golden-anchor-voucher',
    icon: '⚓',
    title: 'Golden Anchor Team Voucher ($100)',
    badge: '100% Deep Teal Readiness',
  },
  {
    id: 'beach-wellness-day',
    icon: '🌴',
    title: 'Paid Shoreline Wellness Afternoon',
    badge: 'Island Calm Excellence',
  },
  {
    id: 'tropical-coffee-shout',
    icon: '☀️',
    title: 'Sunshine Café & Gelato Team Shout',
    badge: 'Fast-Cheer Morale Champion',
  },
  {
    id: 'wave-rider-trophy',
    icon: '🏄‍♂️',
    title: 'Silver Wave Rider Shift Trophy',
    badge: 'Zero-Gap Roster Mastery',
  },
];

function getAudioCtx() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!window.__shorelineAudioCtx) {
    window.__shorelineAudioCtx = new Ctx();
  }
  if (window.__shorelineAudioCtx.state === 'suspended') {
    window.__shorelineAudioCtx.resume().catch(() => {});
  }
  return window.__shorelineAudioCtx;
}

/**
 * Plays a distinct tropical sound effect for each 44x44px Fast-Cheer reaction
 */
export function playFastCheerSound(emoji, label, muted = false) {
  if (!muted) {
    const ctx = getAudioCtx();
    if (ctx) {
      const now = ctx.currentTime;
      const chordMap = {
        '☀️': [523.25, 659.25, 783.99, 1046.5], // Bright Sunshine Major
        '🏄‍♂️': [392.0, 493.88, 587.33, 783.99],  // Wave Rider Glide
        '⚓': [440.0, 554.37, 659.25, 880.0],   // Solid Anchor Ship Bell
        '🌴': [349.23, 440.0, 523.25, 698.46],  // Island Calm Marimba
      };
      const notes = chordMap[emoji] || chordMap['☀️'];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + i * 0.065;
        osc.type = emoji === '⚓' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.08, start + 0.18);
        gain.gain.setValueAtTime(0.13, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.24);
      });
    }
  }

  if (typeof window !== 'undefined') {
    try {
      confetti({
        particleCount: 28,
        spread: 55,
        origin: { y: 0.72 },
        colors: ['#005F73', '#00C6FF', '#FFD166', '#FF2E9A'],
      });
    } catch {
      // ignore
    }
  }
}

/**
 * Plays a crisp sand-to-deep-teal tone when cycling a 44x44px heatmap square
 */
export function playHeatmapStepSound(pct = 50, muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const freq = 300 + (pct / 100) * 460;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.09, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.13);
}

/**
 * Plays a grand dual-cannon confetti & symphony fanfare for the Final Victory Screen & Main Dashboard Celebration
 */
export function playShorelineVictoryFanfare(rewardTitle, subtitle = 'Shoreline Command 100% Complete', muted = false) {
  if (!muted) {
    const ctx = getAudioCtx();
    if (ctx) {
      const now = ctx.currentTime;
      const melody = [
        { f: 523.25, t: 0.0, d: 0.16 },
        { f: 659.25, t: 0.14, d: 0.16 },
        { f: 783.99, t: 0.28, d: 0.16 },
        { f: 1046.5, t: 0.42, d: 0.32 },
        { f: 783.99, t: 0.7, d: 0.16 },
        { f: 1046.5, t: 0.86, d: 0.55 },
      ];
      melody.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        gain.gain.setValueAtTime(0.16, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.02);
      });
    }
  }

  // Dual side-cannon beach & Infinity confetti burst
  if (typeof window !== 'undefined') {
    try {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 65,
        origin: { x: 0.1, y: 0.65 },
        colors: ['#005F73', '#00C6FF', '#FFD166', '#FF2E9A', '#5A00D6'],
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 65,
        origin: { x: 0.9, y: 0.65 },
        colors: ['#005F73', '#00C6FF', '#FFD166', '#FF2E9A', '#5A00D6'],
      });
    } catch {
      // ignore
    }
  }

  if (!muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(
        `Victory! ${subtitle}! Custom reward unlocked: ${rewardTitle || 'Golden Anchor Team Voucher'}!`
      );
      u.rate = 0.97;
      window.speechSynthesis.speak(u);
    } catch {
      // ignore
    }
  }
}