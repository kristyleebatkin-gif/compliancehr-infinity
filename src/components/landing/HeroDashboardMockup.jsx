import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Users, HeartHandshake, FolderOpen,
  AlertTriangle, FileBarChart2, Zap, GraduationCap,
  Cpu, ArrowUpRight, Sparkles, Lock,
} from 'lucide-react';

const MISSION_BG =
  'radial-gradient(circle at 50% 48%, rgba(0, 198, 255, 0.25) 0%, rgba(90, 0, 214, 0.42) 40%, rgba(10, 43, 109, 0.96) 80%, #061539 100%)';

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

export default function HeroDashboardMockup() {
  const [focusedPod, setFocusedPod] = useState('compliance');

  return (
    <div className="w-full rounded-3xl border border-white/35 bg-white/15 p-1.5 shadow-2xl backdrop-blur-xl">
      <div
        className="relative overflow-hidden rounded-[20px] border border-white/25 p-3 sm:p-4 text-white"
        style={{ background: MISSION_BG }}
      >
        {/* Top Mission Control Window Header */}
        <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex shrink-0 items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF2E9A]" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#00C6FF]" />
            </div>
            <span className="ml-1 text-[11px] xl:text-xs font-extrabold tracking-wide text-white truncate">
              NDIS &amp; Aged Care Super-Platform · Mission Control
            </span>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D] shadow-sm hover:bg-[#F5F0FF]"
          >
            <span style={{ color: '#0A2B6D' }}>Launch OS</span>
            <ArrowUpRight className="h-3 w-3 text-[#0072FF]" />
          </Link>
        </div>

        {/* Orbital 3x3 Glowing Circular Control Pods Around Central AI CORE */}
        <div className="relative my-3 grid grid-cols-3 gap-2.5 sm:gap-3 items-center justify-items-center">
          {HERO_PODS.map((pod, idx) => {
            const Icon = pod.icon;
            const active = focusedPod === pod.id;
            const dashArray = 2 * Math.PI * 42;
            const dashOffset = dashArray - (dashArray * pod.pct) / 100;

            return (
              <React.Fragment key={pod.id}>
                {idx === 4 && (
                  /* Central AI CORE Pod */
                  <Link
                    to="/dashboard"
                    className="group relative flex h-28 w-28 sm:h-32 sm:w-32 flex-col items-center justify-center rounded-full p-1.5 text-center transition-all duration-300 hover:scale-105"
                    style={{
                      background:
                        'linear-gradient(135deg, #00C6FF 0%, #0072FF 30%, #5A00D6 65%, #FF2E9A 100%)',
                      boxShadow:
                        '0 0 34px rgba(0, 198, 255, 0.8), 0 0 60px rgba(255, 46, 154, 0.45), inset 0 2px 6px rgba(255,255,255,0.65)',
                    }}
                  >
                    <div
                      className="flex h-full w-full flex-col items-center justify-center rounded-full border border-white/40 px-2 py-1 backdrop-blur-xl"
                      style={{
                        background:
                          'radial-gradient(circle at 30% 24%, rgba(0,198,255,0.45) 0%, rgba(90,0,214,0.9) 55%, #061539 100%)',
                      }}
                    >
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[7.5px] font-black uppercase text-[#0A2B6D]">
                        <Cpu className="h-2.5 w-2.5 text-[#5A00D6]" />
                        <span style={{ color: '#0A2B6D' }}>AI CORE</span>
                      </span>
                      <div className="mt-1 text-xs sm:text-sm font-black tracking-tight text-white">
                        <span className="text-[#00C6FF] animate-pulse">◉</span> AI Core
                      </div>
                      <span
                        className="mt-0.5 rounded-full border border-[#00C6FF]/60 bg-[#0A2B6D] px-2 py-0.5 text-[8.5px] font-extrabold text-[#00C6FF]"
                        style={{ color: '#00C6FF' }}
                      >
                        14 recommendations
                      </span>
                    </div>
                  </Link>
                )}

                {/* Surrounding Glowing Circular Control Pod */}
                <Link
                  to={pod.path}
                  onMouseEnter={() => setFocusedPod(pod.id)}
                  className="group relative flex h-24 w-24 sm:h-28 sm:w-28 flex-col items-center justify-center rounded-full p-1 text-center transition-all duration-300 hover:-translate-y-0.5 hover:scale-105"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.28) 0%, rgba(10, 43, 109, 0.92) 70%, #061539 100%)',
                    boxShadow: active
                      ? `0 0 24px ${pod.ringColor}, inset 0 2px 5px rgba(255,255,255,0.45)`
                      : `0 10px 20px -5px rgba(0,0,0,0.55), 0 0 14px ${pod.ringColor}66, inset 0 2px 4px rgba(255,255,255,0.25)`,
                  }}
                >
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
                    viewBox="0 0 96 96"
                  >
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      fill="none"
                      stroke={pod.ringColor}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                    />
                  </svg>

                  <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-full border border-white/25 bg-white/10 px-1.5 py-1 backdrop-blur-md">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-white"
                      style={{
                        background: 'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
                      }}
                    >
                      <Icon className="h-2.5 w-2.5 text-white" />
                    </span>

                    <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-white px-2 py-0 text-[8.5px] font-extrabold text-[#0A2B6D]">
                      <span
                        className={pod.pulse ? 'animate-ping' : ''}
                        style={{ color: pod.ringColor }}
                      >
                        ◉
                      </span>
                      <span style={{ color: '#0A2B6D' }}>{pod.label}</span>
                    </span>

                    <span
                      className="mt-0.5 rounded-full px-1.5 py-0 text-[8px] font-black text-white"
                      style={{
                        backgroundColor: pod.pulse ? '#FF2E9A' : 'rgba(6, 21, 57, 0.88)',
                        border: `1px solid ${pod.ringColor}`,
                      }}
                    >
                      {pod.metric}
                    </span>
                  </div>
                </Link>
              </React.Fragment>
            );
          })}
        </div>

        {/* Bottom AI Copilot & RLS Status Strip */}
        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-[10.5px] backdrop-blur-md">
          <div className="flex items-center gap-1.5 font-extrabold text-white">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#00C6FF]" />
            <span>◉ AI Core: 14 recommendations ready</span>
          </div>
          <div className="flex shrink-0 items-center gap-1 font-extrabold text-[#00C6FF]">
            <Lock className="h-3 w-3" />
            <span>99.2% Audit Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}