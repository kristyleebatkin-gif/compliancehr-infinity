import React, { useEffect, useRef, useState } from 'react';
import { Moon, Music, Coffee, HeartPulse, ExternalLink } from 'lucide-react';
import { Panel, Pill } from '@/components/today/todayUi';

const FACTS = [
  'Mum said eat your vegetables — five serves a day keeps the afternoon slump away.',
  'Two minutes of standing every hour does more for your focus than a third coffee.',
  'Water first. Most 3pm headaches are just a glass behind.',
  'Look away from the screen every 20 minutes, at something 20 metres away, for 20 seconds.',
  'A ten-minute walk after lunch resets attention better than scrolling.'
];

export default function YouPanel() {
  const [sleep, setSleep] = useState(() => Number(localStorage.getItem('cs-today-sleep') || 7));
  const [playing, setPlaying] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => () => audioRef.current?.close(), []);

  const saveSleep = (value) => {
    setSleep(value);
    localStorage.setItem('cs-today-sleep', String(value));
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      audioRef.current.close();
      audioRef.current = null;
      setPlaying(false);
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const gain = ctx.createGain();
    gain.gain.value = 0.03;
    gain.connect(ctx.destination);
    [174, 261.63, 392].forEach((frequency) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      osc.connect(gain);
      osc.start();
    });
    audioRef.current = ctx;
    setPlaying(true);
  };

  return (
    <Panel title="You" subtitle="The person doing the work" action={<Pill tone="pink">Wellbeing</Pill>}>
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-xl border border-[#0A2B6D]/10 bg-white/60 p-2.5">
          <Moon className="h-4 w-4 shrink-0 text-[#5A00D6]" />
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-extrabold text-[#0A2B6D]">Sleep last night</p>
            <p className="text-[10.5px] text-[#4B6392]">
              {sleep >= 7 ? 'Solid night — protect the run today.' : 'Short night. Keep the afternoon light.'}
            </p>
          </div>
          <input
            type="number"
            min="0"
            max="14"
            step="0.5"
            value={sleep}
            onChange={(event) => saveSleep(Number(event.target.value))}
            aria-label="Hours slept"
            className="w-14 rounded-lg border border-[#0A2B6D]/15 bg-white px-2 py-1 text-[12px] font-bold text-[#0A2B6D] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#0A2B6D]/10 bg-white/60 p-2.5">
          <HeartPulse className="h-4 w-4 shrink-0 text-[#B0126A]" />
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-extrabold text-[#0A2B6D]">Stress, energy &amp; sleep</p>
            <p className="text-[10.5px] text-[#4B6392]">Check your readings in Welltory — opens in a new tab.</p>
          </div>
          <a
            href="https://welltory.com"
            target="_blank"
            rel="noopener noreferrer"
            className="t-btn t-btn-ghost inline-flex shrink-0 items-center gap-1 !px-2.5 !py-1 !text-[10.5px]"
          >
            Open Welltory
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#0A2B6D]/10 bg-white/60 p-2.5">
          <Music className="h-4 w-4 shrink-0 text-[#0072FF]" />
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-extrabold text-[#0A2B6D]">Focus music</p>
            <p className="text-[10.5px] text-[#4B6392]">{playing ? 'Soft ambient tone playing' : 'Low, steady background tone'}</p>
          </div>
          <button type="button" onClick={toggleMusic} className="t-btn t-btn-ghost !px-2.5 !py-1 !text-[10.5px]">
            {playing ? 'Stop' : 'Play'}
          </button>
        </div>

        <div className="rounded-xl border border-[#FFC7E4] bg-white/70 p-2.5">
          <div className="flex items-center gap-1.5">
            <Coffee className="h-3.5 w-3.5 text-[#B0126A]" />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#B0126A]">Break time</p>
          </div>
          <p className="mt-1 text-[11.5px] leading-relaxed text-[#2E4472]">{FACTS[factIndex]}</p>
          <button
            type="button"
            onClick={() => setFactIndex((index) => (index + 1) % FACTS.length)}
            className="t-btn t-btn-ghost mt-1.5 !px-2 !py-1 !text-[10.5px]"
          >
            Another fact
          </button>
        </div>
      </div>
    </Panel>
  );
}