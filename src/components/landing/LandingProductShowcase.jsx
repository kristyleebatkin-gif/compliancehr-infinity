import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, GraduationCap, AlertTriangle, CalendarClock,
  BadgeCheck, HeartHandshake, LayoutDashboard, CheckCircle2,
  ArrowUpRight, Sparkles, TrendingUp, Lock,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import Reveal from '@/components/landing/Reveal';

const TRAJECTORY_DATA = [
  { month: 'May', readiness: 94.2, claims: 96.1 },
  { month: 'Jun', readiness: 95.6, claims: 97.0 },
  { month: 'Jul', readiness: 96.8, claims: 97.8 },
  { month: 'Aug', readiness: 97.7, claims: 98.4 },
  { month: 'Sep', readiness: 98.5, claims: 99.0 },
  { month: 'Oct', readiness: 99.2, claims: 99.4 },
];

const PILLAR_BAR_DATA = [
  { name: 'Gov', score: 99.2, fill: '#0A2B6D' },
  { name: 'HR', score: 100.0, fill: '#0072FF' },
  { name: 'Care', score: 99.1, fill: '#5A00D6' },
  { name: 'WHS', score: 98.8, fill: '#FF2E9A' },
  { name: 'LMS', score: 98.9, fill: '#0072FF' },
  { name: 'Claims', score: 99.4, fill: '#5A00D6' },
];

const SHOWCASE_PANELS = [
  {
    id: 'executive',
    shortLabel: 'Live Executive',
    title: 'Live Executive Dashboard',
    icon: LayoutDashboard,
    badge: 'Live Executive',
    color: '#0A2B6D',
    path: '/dashboard',
    summary:
      'Full-width live executive command centre uniting the compliance score gauge, workforce KPIs, participant analytics, risk alerts, and training compliance.',
    kpi: '99.2% Audit Readiness',
    metricValue: '99.2%',
    metricSub: '46 Modules Synced Live',
  },
  {
    id: 'score',
    shortLabel: 'Compliance Score',
    title: 'Compliance Score',
    icon: ShieldCheck,
    badge: '99.2% Verified',
    color: '#0072FF',
    path: '/compliance',
    summary:
      '17 Audit Categories & 356 Checkpoints continuously scored with attached auditor evidence and 1-click PDF packs.',
    kpi: '356 / 356 Checkpoints',
    metricValue: '99.2%',
    metricSub: '17 NDIS Categories Verified',
  },
  {
    id: 'credentials',
    shortLabel: 'Staff Credentials',
    title: 'Staff Credentials & Workforce KPIs',
    icon: BadgeCheck,
    badge: '100-Pt Cleared',
    color: '#5A00D6',
    path: '/hr',
    summary:
      'NDIS Worker Screening, Blue Card, Police Check, First Aid & CPR verified automatically before roster allocation.',
    kpi: 'Zero Unscreened Shifts',
    metricValue: '100%',
    metricSub: 'NDIS Screening & Blue Card Gate',
  },
  {
    id: 'participants',
    shortLabel: 'Participant Care',
    title: 'Participant Activity & Analytics',
    icon: HeartHandshake,
    badge: 'Person-Centred',
    color: '#FF2E9A',
    path: '/our-participants',
    summary:
      'Live shift notes, 3-part informed consents, goal progress milestones, and NDIS plan budget utilisation.',
    kpi: '99.1% Plan Alignment',
    metricValue: '99.1%',
    metricSub: '3-Part Consents & Goals Linked',
  },
  {
    id: 'incidents',
    shortLabel: 'Risk & Incidents',
    title: 'Open Incidents & Risk Alerts',
    icon: AlertTriangle,
    badge: '100% On-Time SLA',
    color: '#FF2E9A',
    path: '/incidents',
    summary:
      'Statutory 24-hour & 5-day NDIS Commission reportable countdowns paired with ISO 31000 risk controls.',
    kpi: '0 Overdue Alerts',
    metricValue: '100% SLA',
    metricSub: '24h & 5d Commission Timers Armed',
  },
  {
    id: 'training',
    shortLabel: 'Training & LMS',
    title: 'Training Compliance',
    icon: GraduationCap,
    badge: '98.9% Current',
    color: '#5A00D6',
    path: '/training',
    summary:
      'Mandatory NDIS worker orientation, infection control, manual handling, and medication modules tracked automatically.',
    kpi: '142 Certificates Active',
    metricValue: '98.9%',
    metricSub: 'LMS Modules, First Aid & CPR',
  },
  {
    id: 'reviews',
    shortLabel: 'Upcoming Reviews',
    title: 'Upcoming Reviews',
    icon: CalendarClock,
    badge: '90/60/30d Radar',
    color: '#0072FF',
    path: '/review-due',
    summary:
      'Automated horizon radar for 10-weekly participant progress notes, plan renewals, and 6-monthly home risk checks.',
    kpi: '100% On-Schedule',
    metricValue: '90/60/30d',
    metricSub: '10-Weekly Notes & Risk Radar',
  },
];

const TELEMETRY_CARDS = SHOWCASE_PANELS.slice(1);

export default function LandingProductShowcase() {
  const [selectedId, setSelectedId] = useState('executive');
  const activePanel = SHOWCASE_PANELS.find((p) => p.id === selectedId) || SHOWCASE_PANELS[0];

  return (
    <section id="showcase" className="w-full scroll-mt-20">
      <Reveal>
        <div
          className="rounded-3xl p-[3px] shadow-2xl"
          style={{
            background: 'linear-gradient(120deg, #0A2B6D 0%, #0072FF 32%, #5A00D6 66%, #FF2E9A 100%)',
          }}
        >
          <div className="overflow-hidden rounded-[21px] bg-white">
            {/* Top Full-Width Section Banner */}
            <div
              className="gradient-brand flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-5 sm:px-7 text-white"
              style={{
                background: 'linear-gradient(120deg, #0A2B6D 0%, #0072FF 40%, #5A00D6 75%, #FF2E9A 100%)',
              }}
            >
              <div className="text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white whitespace-nowrap">
                  <Sparkles className="h-3.5 w-3.5 text-[#00C6FF]" />
                  <span style={{ color: '#FFFFFF' }}>Full-Width Live Executive Command Centre</span>
                </div>
                <h2
                  className="mt-1.5 font-editorial text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white"
                  style={{ color: '#FFFFFF' }}
                >
                  Everything Connected — Live Executive Dashboard Showcase
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <span
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-xs"
                  style={{ color: '#FFFFFF' }}
                >
                  <Lock className="h-3.5 w-3.5 text-[#00C6FF]" />
                  <span style={{ color: '#FFFFFF' }}>NDIS Practice Standards 2026</span>
                </span>
                <Link
                  to={activePanel.path}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-[#0A2B6D] shadow-md transition hover:bg-slate-100"
                  style={{ color: '#0A2B6D' }}
                >
                  <span style={{ color: '#0A2B6D' }}>Open {activePanel.shortLabel}</span>
                  <ArrowUpRight className="h-4 w-4 text-[#0072FF]" style={{ color: '#0072FF' }} />
                </Link>
              </div>
            </div>

            {/* Glowing Circular Control Pod Switcher Bar (Hybrid Premium Remote + Mission Control) */}
            <div
              className="border-b border-[#00C6FF]/30 px-5 py-4 sm:px-7"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, rgba(0, 198, 255, 0.18) 0%, rgba(90, 0, 214, 0.32) 45%, #0A2B6D 100%)',
              }}
            >
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
                {SHOWCASE_PANELS.map((panel) => {
                  const Icon = panel.icon;
                  const isActive = panel.id === selectedId;
                  return (
                    <button
                      key={panel.id}
                      type="button"
                      onClick={() => setSelectedId(panel.id)}
                      className={`group flex items-center gap-2 rounded-full border px-3 py-2 text-left backdrop-blur-md transition-all duration-200 ${
                        isActive
                          ? 'border-[#00C6FF] bg-white text-[#0A2B6D] shadow-[0_0_20px_rgba(0,198,255,0.75)] scale-[1.02]'
                          : 'border-white/30 bg-white/10 text-white hover:border-[#00C6FF] hover:bg-white/20'
                      }`}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                        style={{
                          background: 'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
                        }}
                      >
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div
                          className="truncate text-[10.5px] font-extrabold leading-tight"
                          style={{ color: isActive ? '#0A2B6D' : '#FFFFFF' }}
                        >
                          ◉ {panel.shortLabel}
                        </div>
                        <div
                          className="truncate text-[9px] font-bold leading-tight"
                          style={{ color: isActive ? '#5A00D6' : '#00C6FF' }}
                        >
                          {panel.metricValue}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Landscape Dashboard Grid — Strictly Aligned Columns & Baselines */}
            <div className="p-5 sm:p-7 space-y-5 bg-white">
              {/* Top Row: Compliance Score Gauge + Executive Trajectory Chart + Department Benchmarks */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12 items-stretch">
                {/* Panel 1: Compliance Score Gauge Card */}
                <div className="md:col-span-4 lg:col-span-3 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                        Overall Readiness
                      </span>
                      <h3 className="font-editorial text-base font-extrabold text-[#0A2B6D]">
                        Compliance Score
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#0072FF]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#0072FF]">
                      LIVE GAUGE
                    </span>
                  </div>

                  {/* Centered SVG Radial Score Gauge */}
                  <div className="relative mx-auto my-3 flex h-36 w-36 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                      <defs>
                        <linearGradient id="showcaseGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#0072FF" />
                          <stop offset="50%" stopColor="#5A00D6" />
                          <stop offset="100%" stopColor="#FF2E9A" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="12"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="url(#showcaseGaugeGrad)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="314"
                        strokeDashoffset="4"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="font-editorial text-3xl font-extrabold text-[#0A2B6D] leading-none">
                        99.2%
                      </span>
                      <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                        Audit Ready
                      </span>
                    </div>
                  </div>

                  {/* Aligned Footer Strip */}
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-center">
                    <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                      <div className="text-xs font-extrabold text-[#0A2B6D]">356 / 356</div>
                      <div className="text-[10px] font-semibold text-[#0A2B6D]/70">Checkpoints</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                      <div className="text-xs font-extrabold text-[#5A00D6]">17 / 17</div>
                      <div className="text-[10px] font-semibold text-[#0A2B6D]/70">Categories</div>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Executive Trajectory Chart */}
                <div className="md:col-span-8 lg:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                        Executive Trajectory Chart
                      </span>
                      <h3 className="font-editorial text-base font-extrabold text-[#0A2B6D]">
                        Audit Readiness &amp; Claim Integrity (%)
                      </h3>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700">
                      <TrendingUp className="h-3 w-3" />
                      +5.0% 6-Mo Gain
                    </span>
                  </div>

                  <div className="my-2 h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TRAJECTORY_DATA} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="readinessFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0072FF" stopOpacity={0.32} />
                            <stop offset="95%" stopColor="#5A00D6" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" fontSize={11} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                        <YAxis
                          width={34}
                          domain={[92, 100]}
                          fontSize={11}
                          tick={{ fill: '#0A2B6D', fontWeight: 700 }}
                        />
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Area
                          type="monotone"
                          dataKey="readiness"
                          name="Audit Readiness"
                          stroke="#0072FF"
                          strokeWidth={3}
                          fill="url(#readinessFill)"
                        />
                        <Area
                          type="monotone"
                          dataKey="claims"
                          name="Claim Reconciliation"
                          stroke="#FF2E9A"
                          strokeWidth={2.5}
                          fillOpacity={0}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Aligned Legend Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs font-bold text-[#0A2B6D]">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#0072FF]" />
                        <span>Audit Readiness (99.2%)</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#FF2E9A]" />
                        <span>3-Way Claim Match (99.4%)</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-extrabold text-[#5A00D6]">PRODA Verified</span>
                  </div>
                </div>

                {/* Panel 3: Department Benchmarks Chart */}
                <div className="md:col-span-12 lg:col-span-4 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                        Department Benchmarks
                      </span>
                      <h3 className="font-editorial text-base font-extrabold text-[#0A2B6D]">
                        6-Domain Live Readiness (%)
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#5A00D6]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#5A00D6]">
                      &gt;98.8% ALL PILLARS
                    </span>
                  </div>

                  <div className="my-2 h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={PILLAR_BAR_DATA} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" fontSize={11} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                        <YAxis
                          width={34}
                          domain={[95, 100]}
                          fontSize={11}
                          tick={{ fill: '#0A2B6D', fontWeight: 700 }}
                        />
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Bar dataKey="score" name="Readiness (%)" radius={[6, 6, 0, 0]} barSize={24}>
                          {PILLAR_BAR_DATA.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Aligned Footer Strip */}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs font-bold text-[#0A2B6D]">
                    <span>NDIS Benchmark Threshold: 95.0%</span>
                    <span className="text-[#0072FF] font-extrabold">All 6 Exceed Target</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: 6 Connected Operational Telemetry Cards (Uniform Height & Every Word Fitted) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-stretch">
                {TELEMETRY_CARDS.map((card) => {
                  const Icon = card.icon;
                  const isSelected = card.id === selectedId;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setSelectedId(card.id)}
                      className={`flex h-full flex-col justify-between rounded-2xl border p-3.5 text-left transition-all ${
                        isSelected
                          ? 'border-[#0072FF] bg-[#0072FF]/5 shadow-md ring-2 ring-[#0072FF]/20'
                          : 'border-slate-200 bg-white shadow-2xs hover:border-[#0072FF]/50 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        {/* Card Top Row: Icon + Status Badge */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white"
                            style={{ backgroundColor: card.color }}
                          >
                            <Icon className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span
                            className="whitespace-nowrap rounded-full px-1.5 py-0.5 text-[8.5px] xl:text-[9px] font-extrabold uppercase tracking-tight leading-tight text-right"
                            style={{
                              backgroundColor: `${card.color}15`,
                              color: card.color,
                            }}
                          >
                            {card.badge}
                          </span>
                        </div>

                        {/* Card Middle Row: Value & Label */}
                        <div className="mt-2.5 font-editorial text-xl xl:text-2xl font-extrabold text-[#0A2B6D] leading-none">
                          {card.metricValue}
                        </div>
                        <div className="mt-1.5 text-[11.5px] font-extrabold text-[#0A2B6D] leading-snug">
                          {card.shortLabel}
                        </div>
                      </div>

                      {/* Card Bottom Row: Aligned Subtitle */}
                      <div className="mt-2.5 border-t border-slate-100 pt-2 text-[10.5px] font-semibold leading-snug text-[#0A2B6D]/75">
                        {card.metricSub}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Selected View Footer Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[#0A2B6D] px-5 py-3.5 text-white">
                <div className="flex items-start sm:items-center gap-2.5 text-left text-xs sm:text-sm font-bold text-white">
                  <CheckCircle2 className="mt-0.5 sm:mt-0 h-4 w-4 shrink-0 text-[#00C6FF]" />
                  <span>
                    <strong className="text-white">{activePanel.title}:</strong>{' '}
                    <span className="text-white/90">{activePanel.summary}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold text-[#00C6FF]">
                    {activePanel.kpi}
                  </span>
                  <Link
                    to={activePanel.path}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D] hover:bg-slate-100"
                  >
                    <span>Explore</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#0072FF]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}