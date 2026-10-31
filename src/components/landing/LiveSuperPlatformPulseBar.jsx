import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Search,
  Volume2,
  ArrowUpRight,
  Radio,
} from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { getHeaderView, getAppBorderView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const PINK_BLUE_PURPLE_SPRAY =
  '#FFFFFF';

function playPulseChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.09);
      osc.stop(ctx.currentTime + i * 0.09 + 0.24);
    });
  } catch {
    // Ignore audio context restrictions
  }
}

export default function LiveSuperPlatformPulseBar() {

  const [sweeping, setSweeping] = useState(false);
  const [quickFilter, setQuickFilter] = useState('');
  const [activeTickerIdx, setActiveTickerIdx] = useState(0);

  const liveTickers = [
    'Operational metrics are not verified in this public preview',
    'Worker screening status is not assessed here',
    'Incident SLA status is not assessed here',
    'Claim reconciliation metrics are not connected here',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTickerIdx((prev) => (prev + 1) % liveTickers.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [liveTickers.length]);

  const triggerLiveSweep = () => {
    setSweeping(true);
    setTimeout(() => setSweeping(false), 650);
  };

  const matchedModules = quickFilter.trim()
    ? MODULE_DIRECTORY.filter((m) =>
        `${m.label} ${m.blurb}`.toLowerCase().includes(quickFilter.trim().toLowerCase())
      ).slice(0, 6)
    : MODULE_DIRECTORY.slice(0, 6);

  return (
    <div
      className="w-full rounded-xl p-[2.5px] shadow-sm"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="rounded-[9px] bg-white p-1.5 space-y-1.5 text-center">
        {/* Compact One-Line App-Design Coloured Header Bar */}
        <div
          className="gradient-brand flex flex-nowrap items-center justify-between gap-1.5 rounded-lg px-2 py-0.5 text-white whitespace-nowrap overflow-hidden"
          style={{ background: getHeaderView(0), color: '#FFFFFF' }}
        >
          <div className="flex min-w-0 items-center gap-1 truncate">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-white"
              style={{ boxShadow: '0 0 6px 2px #FFFFFF, 0 0 10px 2px #00C6FF' }}
            />
            <Radio className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
            <span className="truncate text-[7.5px] sm:text-[8.5px] font-extrabold uppercase tracking-wide text-white" style={{ color: '#FFFFFF' }}>
              Module launcher · public preview · metrics not verified
            </span>
          </div>

          <button
            type="button"
            onClick={triggerLiveSweep}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white bg-white/20 px-2 py-0 text-[7px] font-extrabold text-white hover:bg-white/30 whitespace-nowrap"
            style={{ color: '#FFFFFF' }}
          >
            <Zap className={`h-2 w-2 text-white ${sweeping ? 'animate-spin' : ''}`} style={{ color: '#FFFFFF' }} />
            <span style={{ color: '#FFFFFF' }}>
              {sweeping ? 'Checking…' : 'Refresh preview'}
            </span>
          </button>
        </div>

        {/* Compact Search + Live Telemetry Ticker Row — Pure White Inside Text & Search Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-1.5 items-stretch bg-white">
          <div className="md:col-span-5 rounded-lg border border-[#0A2B6D]/30 bg-white">
            <div className="relative flex h-full items-center rounded-[6px] bg-white px-2 py-0.5">
              <Search className="h-3 w-3 shrink-0 text-[#0A2B6D]" />
              <input
                type="search"
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                placeholder="Search available modules…"
                className="w-full bg-white pl-1.5 pr-1 text-[8px] font-extrabold text-[#0A2B6D] placeholder:text-[#0A2B6D]/70 focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-7 rounded-lg border border-[#0A2B6D]/30 bg-white">
            <div className="flex h-full items-center justify-between gap-1.5 rounded-[6px] bg-white px-2 py-0.5 text-left">
              <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-[#0A2B6D]">
                <Activity className="h-2.5 w-2.5 shrink-0 text-[#0A2B6D]" />
                <span>{liveTickers[activeTickerIdx]}</span>
              </span>
              <span className="shrink-0 rounded-full bg-[#10B981] px-1.5 py-0 text-[7px] font-extrabold text-white">
                PREVIEW
              </span>
            </div>
          </div>
        </div>

        {/* 6 Compact Instant-Launch Small Tiles — Pure White Inside Text Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 items-stretch">
          {matchedModules.map((mod, idx) => {
            const Icon = mod.icon || ShieldCheck;
            return (
              <Link
                key={mod.key}
                to={mod.path}
                className="flex h-full rounded-lg border border-[#0A2B6D]/30 bg-white p-1 shadow-2xs transition-transform hover:-translate-y-0.5"
              >
                <div className="flex h-full w-full flex-col justify-between gap-1 rounded-[5px] bg-white text-center">
                  <div
                    className="gradient-brand flex min-h-[18px] w-full items-center justify-center gap-1 rounded px-1.5 py-0.5 text-white"
                    style={{ background: getHeaderView(idx), color: '#FFFFFF' }}
                  >
                    <Icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    <span className="text-[7.5px] font-extrabold leading-tight text-white" style={{ color: '#FFFFFF' }}>
                      {mod.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1 rounded border border-[#0A2B6D]/20 bg-white px-1.5 py-0.5">
                    <span className="text-[7px] font-extrabold text-[#0A2B6D]">
                      Open module
                    </span>
                    <ArrowUpRight className="h-2 w-2 shrink-0 text-[#0A2B6D]" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}