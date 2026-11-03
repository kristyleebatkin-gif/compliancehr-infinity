import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Users, HeartHandshake, FolderOpen,
  AlertTriangle, FileBarChart2, Zap, GraduationCap,
  Cpu, ArrowUpRight, Sparkles, Lock,
} from 'lucide-react';

const MISSION_BG =
  'radial-gradient(circle at 50% 48%, rgba(0, 198, 255, 0.24) 0%, rgba(90, 0, 214, 0.40) 42%, rgba(10, 43, 109, 0.97) 82%, #061539 100%)';

const HERO_PODS = [
  {
    id: 'compliance',
    label: 'Compliance',
    metric: '2 actions due',
    path: '/compliance',
    icon: ShieldCheck,
    ringColor: '#00C6FF',
    pct: 94,
  },
  {
    id: 'workforce',
    label: 'Workforce',
    metric: '7 reviews due',
    path: '/our-employees',
    icon: Users,
    ringColor: '#0072FF',
    pct: 90,
  },
  {
    id: 'participants',
    label: 'Participants',
    metric: '48 active plans',
    path: '/our-participants',
    icon: HeartHandshake,
    ringColor: '#C084FC',
    pct: 96,
  },
  {
    id: 'documents',
    label: 'Documents',
    metric: '5 renewals due',
    path: '/documents',
    icon: FolderOpen,
    ringColor: '#00C6FF',
    pct: 88,
  },
  {
    id: 'incidents',
    label: 'Incidents',
    metric: '1 critical',
    path: '/incidents',
    icon: AlertTriangle,
    ringColor: '#FF2E9A',
    pct: 98,
    pulse: true,
  },
  {
    id: 'reports',
    label: 'Reports',
    metric: '12 audit packs',
    path: '/analytics',
    icon: FileBarChart2,
    ringColor: '#A100FF',
    pct: 92,
  },
  {
    id: 'operations',
    label: 'Operations',
    metric: '8 live sweeps',
    path: '/operations-centre',
    icon: Zap,
    ringColor: '#00C6FF',
    pct: 95,
  },
  {
    id: 'training',
    label: 'Training',
    metric: '3 certs due',
    path: '/training',
    icon: GraduationCap,
    ringColor: '#FF6EDB',
    pct: 91,
  },
];

function CircularPodRing({ icon: Icon, ringColor, pct, pulse }) {
  const r = 22;
  const dashArray = 2 * Math.PI * r;
  const dashOffset = dashArray - (dashArray * pct) / 100;

  return (
    <div className="relative flex h-13 w-13 shrink-0 items-center justify-center">
      <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="3.5" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div
        className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md"
        style={{
          background: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 52%, #FF2E9A 100%)',
          boxShadow: `0 0 12px ${ringColor}88, inset 0 1px 2px rgba(255,255,255,0.5)`,
        }}
      >
        <Icon className="h-4 w-4 text-white" style={{ color: '#FFFFFF' }} />
      </div>
      <span
        className={`absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white text-[9px] font-bold text-white ${
          pulse ? 'animate-pulse bg-[#FF2E9A]' : 'bg-[#0A2B6D]'
        }`}
        style={{ boxShadow: `0 0 8px ${ringColor}` }}
      >
        ●
      </span>
    </div>
  );
}

export default function HeroDashboardMockup() {
  const [focusedPod, setFocusedPod] = useState('compliance');

  return (
    <div className="w-full rounded-3xl border border-white/35 bg-white/15 p-1.5 shadow-2xl backdrop-blur-xl">
      <div
        className="relative overflow-hidden rounded-[22px] border border-white/25 p-3.5 sm:p-4 text-white"
        style={{ background: MISSION_BG }}
      >
        {/* Top Mission Control Window Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex shrink-0 items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF2E9A]" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#00C6FF]" />
            </div>
            <span className="ml-1 text-xs font-extrabold tracking-wide text-white">
              NDIS &amp; Aged Care Super-Platform · Mission Control
            </span>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-[10.5px] font-extrabold text-[#0A2B6D] shadow-sm hover:bg-[#F5F0FF]"
          >
            <span style={{ color: '#0A2B6D' }}>Launch OS</span>
            <ArrowUpRight className="h-3 w-3 text-[#0072FF]" />
          </Link>
        </div>

        {/* Central AI CORE Feature Pod — Spacious, Full Text Visibility */}
        <div className="mt-3 flex justify-center">
          <Link
            to="/dashboard"
            className="group relative flex w-full max-w-md items-center justify-between gap-3 rounded-full border-2 border-[#00C6FF]/70 px-4 py-2.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01]"
            style={{
              background:
                'radial-gradient(circle at 25% 30%, rgba(0, 198, 255, 0.35) 0%, rgba(90, 0, 214, 0.85) 55%, #061539 100%)',
              boxShadow:
                '0 0 30px rgba(0, 198, 255, 0.6), 0 0 55px rgba(255, 46, 154, 0.35), inset 0 2px 6px rgba(255,255,255,0.45)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full p-1">
                <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="25" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5" />
                  <circle
                    cx="28"
                    cy="28"
                    r="25"
                    fill="none"
                    stroke="#00C6FF"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="157"
                    strokeDashoffset="12"
                  />
                </svg>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0A2B6D] shadow-md"
                  style={{ boxShadow: '0 0 14px #00C6FF' }}
                >
                  <Cpu className="h-5 w-5 text-[#5A00D6]" />
                </div>
              </div>

              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#0A2B6D]">
                  <span className="text-[#0072FF]">◉</span>
                  <span style={{ color: '#0A2B6D' }}>CENTRAL AI CORE</span>
                </span>
                <div className="mt-1 text-sm sm:text-base font-black tracking-tight text-white">
                  ◉ AI Core · 14 recommendations
                </div>
                <div className="text-[10.5px] font-semibold text-[#00C6FF]" style={{ color: '#00C6FF' }}>
                  Live Digital Twin · 46 Connected Modules
                </div>
              </div>
            </div>

            <span className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold text-white border border-white/30">
              <span>Active</span>
              <ArrowUpRight className="h-3 w-3 text-[#00C6FF]" />
            </span>
          </Link>
        </div>

        {/* 8 Surrounding Glowing Circular Control Pods — Clean 2x4 / 4x2 Grid Where Every Word Fits */}
        <div className="my-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {HERO_PODS.map((pod) => {
            const active = focusedPod === pod.id;
            return (
              <Link
                key={pod.id}
                to={pod.path}
                onMouseEnter={() => setFocusedPod(pod.id)}
                className="group relative flex flex-col items-center justify-between rounded-3xl border border-white/25 bg-white/10 px-2.5 py-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#00C6FF]"
                style={{
                  background:
                    'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.20) 0%, rgba(10, 43, 109, 0.88) 72%, #061539 100%)',
                  boxShadow: active
                    ? `0 0 22px ${pod.ringColor}88, inset 0 2px 5px rgba(255,255,255,0.4)`
                    : `0 8px 20px -6px rgba(0,0,0,0.5), 0 0 12px ${pod.ringColor}40, inset 0 1px 3px rgba(255,255,255,0.25)`,
                }}
              >
                <CircularPodRing
                  icon={pod.icon}
                  ringColor={pod.ringColor}
                  pct={pod.pct}
                  pulse={pod.pulse}
                />

                {/* Title & Live Metric — Clean 12px Enterprise Typography */}
                <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-full bg-white px-2.5 py-0.5 shadow-xs">
                  <span style={{ color: pod.ringColor }} className="text-xs leading-none">
                    ◉
                  </span>
                  <span
                    className="text-xs font-bold tracking-tight text-[#0A2B6D]"
                    style={{ color: '#0A2B6D' }}
                  >
                    {pod.label}
                  </span>
                </div>

                <div
                  className="mt-1.5 w-full rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                  style={{
                    backgroundColor: pod.pulse ? '#FF2E9A' : 'rgba(6, 21, 57, 0.92)',
                    border: `1px solid ${pod.ringColor}`,
                    color: '#FFFFFF',
                  }}
                >
                  {pod.metric}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom AI Copilot & RLS Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] backdrop-blur-md">
          <div className="flex items-center gap-1.5 font-extrabold text-white">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#00C6FF]" />
            <span>◉ AI Core: 14 recommendations ready</span>
          </div>
          <div className="flex shrink-0 items-center gap-1 font-extrabold text-[#00C6FF]">
            <Lock className="h-3 w-3" />
            <span>99.2% Audit Ready · Consent-Gated RLS</span>
          </div>
        </div>
      </div>
    </div>
  );
}