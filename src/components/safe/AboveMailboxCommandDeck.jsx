import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Radar,
  Send,
  CalendarClock,
  ShieldCheck,
  Zap,
  Radio,
  Award,
} from 'lucide-react';
import { getHeaderView, getSymbolView, getAppBorderView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const UNIFORM_SPRAY_BG =
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.65) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.65) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.65) 0%, transparent 52%), #FFFFFF';

const DECK_MODES = [
  { id: 'drone', label: 'Air-Mail Drone', icon: Send },
  { id: 'radar', label: '360° Radar', icon: Radar },
  { id: 'roster', label: 'Live Roster', icon: CalendarClock },
];

export default function AboveMailboxCommandDeck({ onDropExpressMail, mailAlertCount = 3 }) {
  const [activeMode, setActiveMode] = useState('drone');
  const [dropping, setDropping] = useState(false);
  const [pulseStep, setPulseStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseStep((prev) => (prev + 1) % 4);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const handleLaunchDrop = () => {
    setDropping(true);
    if (onDropExpressMail) onDropExpressMail();
    setTimeout(() => setDropping(false), 1200);
  };

  const statusTicker = [
    'Drone #01 Armed · Express Audit Pack Ready',
    '3 Shifts Active · 100% NDIS Worker Screened',
    'Zero Overdue Incidents · 24h SLA Locked',
    'All 8 Practice Standard Pillars Green (98.4%)',
  ];

  return (
    <div
      className="rounded-xl p-[2.5px] shadow-2xs"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      {/* White Area Outside the Inner Writing Borders */}
      <div className="flex flex-col justify-between gap-1 rounded-[9px] bg-white p-1.5 text-center">
        {/* Top App-Coloured Header Bar With Glowing White Lights */}
        <div
          className="gradient-brand flex w-full items-center justify-between gap-1 rounded-lg px-2 py-0.5 text-white"
          style={{
            background: getHeaderView(2),
            color: '#FFFFFF',
            boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.9)',
          }}
        >
          <span className="inline-flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-wider text-white">
            <span
              className="h-2 w-2 shrink-0 rounded-full border border-white bg-white"
              style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF' }}
            />
            <Sparkles className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
            <span style={{ color: '#FFFFFF' }}>Sky-Drop &amp; Radar Command Above Mailbox</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-1.5 py-0 text-[6.5px] font-extrabold text-white">
            <Radio className="h-2 w-2 text-white animate-pulse" style={{ color: '#FFFFFF' }} />
            <span style={{ color: '#FFFFFF' }}>LIVE ✦</span>
          </span>
        </div>

        {/* 3 Mode Switcher Pills */}
        <div className="grid grid-cols-3 gap-1">
          {DECK_MODES.map((m, idx) => {
            const Icon = m.icon;
            const isAct = activeMode === m.id;
            return (
              <div
                key={m.id}
                className="rounded-full p-[1.5px]"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <button
                  type="button"
                  onClick={() => setActiveMode(m.id)}
                  className={`flex h-[20px] w-full items-center justify-center gap-1 rounded-full px-1.5 text-[7px] font-extrabold transition-all ${
                    isAct ? 'ring-1 ring-[#FF2E9A]' : ''
                  }`}
                  style={{
                    background: isAct ? getHeaderView(idx) : UNIFORM_SPRAY_BG,
                    color: isAct ? '#FFFFFF' : '#0A2B6D',
                  }}
                >
                  <Icon
                    className="h-2.5 w-2.5 shrink-0"
                    style={{ color: isAct ? '#FFFFFF' : getSymbolView(idx).iconColor }}
                  />
                  <span style={{ color: isAct ? '#FFFFFF' : '#0A2B6D' }}>{m.label}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Interactive Visual Stage — Framed in App-Design Border With Pink/Blue/Purple Spray & Dark Blue Writing */}
        <div
          className="w-full rounded-lg p-[1.5px]"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="flex flex-col items-center justify-between gap-1 rounded-[6px] px-2 py-1 text-center"
            style={{ background: UNIFORM_SPRAY_BG }}
          >
            {activeMode === 'drone' && (
              <div className="flex w-full flex-col items-center gap-0.5">
                <svg
                  viewBox="0 0 240 54"
                  className="h-10 w-full max-w-[200px]"
                  aria-label="Express Compliance Air-Mail Drone Above Mailbox"
                >
                  <defs>
                    <linearGradient id="droneBodyGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#00C6FF" />
                      <stop offset="50%" stopColor="#5A00D6" />
                      <stop offset="100%" stopColor="#FF2E9A" />
                    </linearGradient>
                  </defs>
                  {/* Glowing Sky Beam Down to Mailbox */}
                  <polygon
                    points="95,24 145,24 170,54 70,54"
                    fill="#00C6FF"
                    fillOpacity={dropping ? '0.38' : '0.18'}
                  />
                  {/* Left & Right Rotors */}
                  <ellipse cx="64" cy="10" rx="22" ry="3.5" fill="#0A2B6D" fillOpacity="0.35" />
                  <ellipse cx="176" cy="10" rx="22" ry="3.5" fill="#0A2B6D" fillOpacity="0.35" />
                  <line x1="64" y1="10" x2="96" y2="18" stroke="#0A2B6D" strokeWidth="2.5" />
                  <line x1="176" y1="10" x2="144" y2="18" stroke="#0A2B6D" strokeWidth="2.5" />
                  {/* Drone Core Body */}
                  <rect
                    x="86"
                    y="12"
                    width="68"
                    height="15"
                    rx="7.5"
                    fill="url(#droneBodyGrad)"
                    stroke="#0A2B6D"
                    strokeWidth="2"
                  />
                  <circle cx="104" cy="19.5" r="3" fill="#FFFFFF" />
                  <circle cx="120" cy="19.5" r="3.5" fill="#10B981" />
                  <circle cx="136" cy="19.5" r="3" fill="#FFFFFF" />
                  {/* VIP Sealed Compliance Envelope Dropping into Mailbox */}
                  <g transform={dropping ? 'translate(103, 31) scale(1.08)' : 'translate(103, 27)'}>
                    <rect
                      width="34"
                      height="20"
                      rx="3"
                      fill="#FFFFFF"
                      stroke="#FF2E9A"
                      strokeWidth="2"
                    />
                    <polyline
                      points="2,3 17,12 32,3"
                      fill="none"
                      stroke="#0A2B6D"
                      strokeWidth="1.8"
                    />
                    <circle cx="17" cy="11" r="3" fill="#FF2E9A" />
                  </g>
                </svg>
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="text-[7.5px] font-extrabold text-[#0A2B6D] truncate">
                    Express Air-Drop → Mailbox ({mailAlertCount} Ready)
                  </span>
                  <button
                    type="button"
                    onClick={handleLaunchDrop}
                    className="gradient-brand inline-flex shrink-0 items-center gap-1 rounded-full border border-white px-2 py-0.5 text-[7px] font-extrabold text-white shadow-2xs"
                    style={{ background: getHeaderView(4), color: '#FFFFFF' }}
                  >
                    <Zap className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                    <span style={{ color: '#FFFFFF' }}>
                      {dropping ? 'Dropping Mail ✦' : 'Drop Express Mail'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {activeMode === 'radar' && (
              <div className="flex w-full items-center justify-between gap-2 py-0.5">
                <svg
                  viewBox="0 0 64 64"
                  className="h-11 w-11 shrink-0"
                  aria-label="360 Degree Compliance Radar"
                >
                  <circle cx="32" cy="32" r="29" fill="#FFFFFF" stroke="#0A2B6D" strokeWidth="2.5" />
                  <circle cx="32" cy="32" r="20" fill="none" stroke="#5A00D6" strokeWidth="1.2" strokeDasharray="3 2" />
                  <circle cx="32" cy="32" r="10" fill="none" stroke="#0072FF" strokeWidth="1.2" />
                  <line x1="32" y1="3" x2="32" y2="61" stroke="#0A2B6D" strokeOpacity="0.25" strokeWidth="1" />
                  <line x1="3" y1="32" x2="61" y2="32" stroke="#0A2B6D" strokeOpacity="0.25" strokeWidth="1" />
                  <path
                    d="M32 32 L54 14 A28 28 0 0 1 60 32 Z"
                    fill="#FF2E9A"
                    fillOpacity="0.35"
                  />
                  <circle cx="44" cy="20" r="3" fill="#10B981" />
                  <circle cx="20" cy="24" r="2.8" fill="#0072FF" />
                  <circle cx="40" cy="44" r="3" fill="#FF2E9A" />
                  <circle cx="32" cy="32" r="3.5" fill="#0A2B6D" />
                </svg>
                <div className="flex flex-1 flex-col items-start text-left space-y-0.5">
                  <div className="inline-flex items-center gap-1 text-[8px] font-extrabold text-[#0A2B6D]">
                    <ShieldCheck className="h-3 w-3 shrink-0 text-[#0A2B6D]" />
                    <span>360° NDIS &amp; WHS Radar Sweep</span>
                  </div>
                  <p className="text-[7px] font-extrabold leading-tight text-[#0A2B6D]">
                    {statusTicker[pulseStep]}
                  </p>
                  <div className="flex items-center gap-1 pt-0.5">
                    <span className="rounded-full border border-[#0A2B6D]/25 bg-white/90 px-1.5 py-0 text-[6.5px] font-extrabold text-[#0A2B6D]">
                      98.4% Score
                    </span>
                    <Link
                      to="/compliance"
                      className="gradient-brand rounded-full px-2 py-0 text-[6.5px] font-extrabold text-white"
                      style={{ background: getHeaderView(1), color: '#FFFFFF' }}
                    >
                      Audit Hub →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeMode === 'roster' && (
              <div className="flex w-full flex-col gap-1 py-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="inline-flex items-center gap-1 text-[7.5px] font-extrabold text-[#0A2B6D]">
                    <Award className="h-3 w-3 text-[#0A2B6D]" />
                    <span>3 Shifts Active · 100% Screened</span>
                  </span>
                  <Link
                    to="/roster"
                    className="gradient-brand rounded-full px-2 py-0 text-[6.5px] font-extrabold text-white"
                    style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                  >
                    Open Roster →
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  {[
                    { who: 'Sarah M.', shift: 'SIL 07:00', status: 'Verified' },
                    { who: 'David K.', shift: 'Community', status: 'On Shift' },
                    { who: 'Emma R.', shift: 'High Care', status: 'Screened' },
                  ].map((s, sIdx) => (
                    <div
                      key={s.who}
                      className="rounded border bg-white/85 px-1 py-0.5 text-[6.5px] font-extrabold text-[#0A2B6D]"
                      style={{ borderColor: getAppBorderView(sIdx) }}
                    >
                      <div className="truncate font-black text-[#0A2B6D]">{s.who}</div>
                      <div className="truncate text-[#0A2B6D]">{s.shift}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}