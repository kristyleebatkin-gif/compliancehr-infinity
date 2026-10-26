import confetti from 'canvas-confetti';

export const DEEP_SEA_REWARD_CATALOG = [
  {
    id: 'glowing-pearl',
    icon: '🦪',
    title: '3D Glowing Abyssal Pearl',
    badge: 'Master Diver Tier I',
    accent: 'radial-gradient(circle at 25% 25%, #FFFDF0 0%, #FFD166 38%, #FF2E9A 78%, #5A00D6 100%)',
  },
  {
    id: 'coral-reef',
    icon: '🪸',
    title: 'Bioluminescent Coral Reef Crown',
    badge: 'Reef Guardian Badge',
    accent: 'radial-gradient(circle at 25% 25%, #E0FFFA 0%, #00F5D4 40%, #0072FF 80%, #0A2B6D 100%)',
  },
  {
    id: 'golden-sub',
    icon: '🚢',
    title: 'Golden Submarine Captain Medal',
    badge: 'Deep Trench Commander',
    accent: 'radial-gradient(circle at 25% 25%, #FFF9DB 0%, #FFE066 45%, #F59E0B 82%, #78350F 100%)',
  },
  {
    id: 'sea-turtle',
    icon: '🐢',
    title: 'Emerald Sea Turtle Navigator',
    badge: 'Ocean Voyager Star',
    accent: 'radial-gradient(circle at 25% 25%, #E6FFFA 0%, #00C6FF 42%, #5A00D6 85%, #0A2B6D 100%)',
  },
  {
    id: 'treasure-trident',
    icon: '🔱',
    title: 'Neptune’s Neon Trident Trophy',
    badge: '100% Milestone Champion',
    accent: 'radial-gradient(circle at 25% 25%, #FFF0F8 0%, #FF6EDB 40%, #A100FF 80%, #0A2B6D 100%)',
  },
];

function getAudioCtx() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!window.__deepSeaAudioCtx) {
    window.__deepSeaAudioCtx = new Ctx();
  }
  if (window.__deepSeaAudioCtx.state === 'suspended') {
    window.__deepSeaAudioCtx.resume().catch(() => {});
  }
  return window.__deepSeaAudioCtx;
}

/**
 * Plays a short underwater scuba bubble / sonar blip when adjusting depth
 */
export function playScubaBubbleSound(pct = 50, muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const baseFreq = 260 + (pct / 100) * 420;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.09);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.12);
}

/**
 * Plays a rich underwater sonar + bubbling arpeggio fanfare + optional voice announcement on 100% completion
 */
export function playDeepSeaMilestoneFanfare(goalTitle, rewardTitle, muted = false) {
  if (muted) return;
  const ctx = getAudioCtx();
  if (ctx) {
    const now = ctx.currentTime;

    // 1) Bubbling water rise (6 rapid pitch-rising bubbles)
    for (let i = 0; i < 6; i++) {
      const bOsc = ctx.createOscillator();
      const bGain = ctx.createGain();
      const start = now + i * 0.055;
      const freq = 320 + i * 95;
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(freq, start);
      bOsc.frequency.exponentialRampToValueAtTime(freq * 1.5, start + 0.05);
      bGain.gain.setValueAtTime(0.07, start);
      bGain.gain.exponentialRampToValueAtTime(0.001, start + 0.055);
      bOsc.connect(bGain);
      bGain.connect(ctx.destination);
      bOsc.start(start);
      bOsc.stop(start + 0.06);
    }

    // 2) Triumphant Pearl Hatching Chime Chord (C5 - E5 - G5 - C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + 0.32 + idx * 0.11;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.56);
    });
  }

  // Trigger ocean-colored confetti burst
  if (typeof window !== 'undefined') {
    try {
      confetti({
        particleCount: 55,
        spread: 68,
        origin: { y: 0.65 },
        colors: ['#00F5D4', '#00C6FF', '#FFE066', '#FF2E9A', '#A100FF'],
      });
    } catch {
      // ignore if canvas unavailable
    }
  }

  // Gentle spoken celebration if speechSynthesis is supported
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(
        `100 percent dive complete! ${rewardTitle || '3D Glowing Pearl'} unlocked for ${goalTitle || 'your goal'}!`
      );
      msg.rate = 0.98;
      window.speechSynthesis.speak(msg);
    } catch {
      // ignore
    }
  }
}