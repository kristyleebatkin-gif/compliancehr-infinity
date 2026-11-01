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

const TRAJECTORY_DATA = [];

<<<<<<< ours
const PILLAR_BAR_DATA = [];
=======
const PILLAR_BAR_DATA = [
  { name: 'Gov', score: 99.2, fill: '#0A2B6D' },
  { name: 'HR', score: 100.0, fill: '#0072FF' },
  { name: 'Care', score: 99.1, fill: '#5A00D6' },
  { name: 'WHS', score: 98.8, fill: '#FF2E9A' },
  { name: 'LMS', score: 98.9, fill: '#0072FF' },
  { name: 'Claims', score: 99.4, fill: '#5A00D6' },
];
>>>>>>> theirs

const SHOWCASE_PANELS = [
  {
    id: 'executive',
    shortLabel: 'Executive Preview',
    title: 'Executive Dashboard Preview',
    icon: LayoutDashboard,
<<<<<<< ours
    badge: 'Preview',
=======
    badge: 'Live Executive',
>>>>>>> theirs
    color: '#0A2B6D',
    path: '/dashboard',
    summary:
      'Dashboard layout preview for compliance, workforce, participant, risk, and training information. Operational data is not connected to this public preview.',
    kpi: 'Metrics not verified',
    metricValue: 'Not verified',
    metricSub: 'No organisation data loaded',
  },
  {
    id: 'score',
    shortLabel: 'Compliance Score',
    title: 'Compliance Score',
    icon: ShieldCheck,
<<<<<<< ours
    badge: 'Not verified',
=======
    badge: '99.2% Verified',
>>>>>>> theirs
    color: '#0072FF',
    path: '/compliance',
    summary:
      'Compliance score and audit evidence features are shown as a layout preview; checkpoint coverage and evidence status have not been assessed here.',
    kpi: 'Coverage not verified',
    metricValue: 'Not verified',
    metricSub: 'No organisation data loaded',
  },
  {
    id: 'credentials',
    shortLabel: 'Staff Credentials',
    title: 'Staff Credentials & Workforce KPIs',
    icon: BadgeCheck,
<<<<<<< ours
    badge: 'Status not assessed',
=======
    badge: '100-Pt Cleared',
>>>>>>> theirs
    color: '#5A00D6',
    path: '/hr',
    summary:
      'Workforce credential and screening information can be managed here. Screening status and roster controls are not assessed in this public preview.',
    kpi: 'Status not assessed',
    metricValue: 'Not verified',
    metricSub: 'No organisation data loaded',
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
      'Participant information, goals, reviews, and documents are represented in the platform. No participant records or outcome metrics are shown in this preview.',
    kpi: 'Metrics not verified',
    metricValue: 'Not verified',
    metricSub: 'No participant data loaded',
  },
  {
    id: 'incidents',
    shortLabel: 'Risk & Incidents',
    title: 'Open Incidents & Risk Alerts',
    icon: AlertTriangle,
<<<<<<< ours
    badge: 'Status not assessed',
=======
    badge: '100% On-Time SLA',
>>>>>>> theirs
    color: '#FF2E9A',
    path: '/incidents',
    summary:
      'Incident reporting deadlines and risk controls can be tracked. SLA status and overdue incidents are not assessed in this public preview.',
    kpi: 'Status not assessed',
    metricValue: 'Not verified',
    metricSub: 'No incident data loaded',
  },
  {
    id: 'training',
    shortLabel: 'Training & LMS',
    title: 'Training Compliance',
    icon: GraduationCap,
<<<<<<< ours
    badge: 'Status not assessed',
=======
    badge: '98.9% Current',
>>>>>>> theirs
    color: '#5A00D6',
    path: '/training',
    summary:
      'Training records and capability information can be maintained here. Completion and currency metrics are not assessed in this preview.',
    kpi: 'Status not assessed',
    metricValue: 'Not verified',
    metricSub: 'No training data loaded',
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
      'Upcoming reviews can be surfaced from operational records. Review schedules and completion status are not assessed in this preview.',
    kpi: 'Status not assessed',
    metricValue: 'Not verified',
    metricSub: 'No review data loaded',
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
<<<<<<< ours
                  <span style={{ color: '#FFFFFF' }}>Dashboard layout preview</span>
=======
                  <span style={{ color: '#FFFFFF' }}>Full-Width Live Executive Command Centre</span>
>>>>>>> theirs
                </div>
                <h2
                  className="mt-1.5 font-editorial text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white"
                  style={{ color: '#FFFFFF' }}
                >
<<<<<<< ours
                  Connected platform dashboard preview
=======
                  Everything Connected — Live Executive Dashboard Showcase
>>>>>>> theirs
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

            {/* Uniform 7-Tab Telemetry Switcher Grid (Every Word Fitted Cleanly Across All Viewports) */}
            <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-3 sm:px-7">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {SHOWCASE_PANELS.map((panel) => {
                  const Icon = panel.icon;
                  const isActive = panel.id === selectedId;
                  return (
                    <button
                      key={panel.id}
                      type="button"
                      onClick={() => setSelectedId(panel.id)}
                      className={`flex min-h-[38px] w-full items-center justify-center gap-1 whitespace-nowrap rounded-xl px-1.5 py-1.5 text-[10.5px] xl:text-[11px] font-extrabold leading-tight transition ${
                        isActive
                          ? 'bg-[#0A2B6D] text-white shadow-sm'
                          : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF] hover:text-[#0072FF]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-center leading-tight">{panel.shortLabel}</span>
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
<<<<<<< ours
                      PREVIEW · NOT VERIFIED
=======
                      LIVE GAUGE
>>>>>>> theirs
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
<<<<<<< ours
                        strokeDashoffset="314"
=======
                        strokeDashoffset="4"
>>>>>>> theirs
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="font-editorial text-3xl font-extrabold text-[#0A2B6D] leading-none">
<<<<<<< ours
                        Not verified
                      </span>
                      <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                        Status not assessed
=======
                        99.2%
                      </span>
                      <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                        Audit Ready
>>>>>>> theirs
                      </span>
                    </div>
                  </div>

                  {/* Aligned Footer Strip */}
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-center">
                    <div className="rounded-lg bg-slate-50 px-2 py-1.5">
<<<<<<< ours
                      <div className="text-xs font-extrabold text-[#0A2B6D]">Not verified</div>
                      <div className="text-[10px] font-semibold text-[#0A2B6D]/70">Checkpoints</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                      <div className="text-xs font-extrabold text-[#5A00D6]">Not verified</div>
=======
                      <div className="text-xs font-extrabold text-[#0A2B6D]">356 / 356</div>
                      <div className="text-[10px] font-semibold text-[#0A2B6D]/70">Checkpoints</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                      <div className="text-xs font-extrabold text-[#5A00D6]">17 / 17</div>
>>>>>>> theirs
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
<<<<<<< ours
                      Trend not available
=======
                      +5.0% 6-Mo Gain
>>>>>>> theirs
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
<<<<<<< ours
                        <span>Audit readiness · not verified</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#FF2E9A]" />
                        <span>Claim reconciliation · not verified</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-extrabold text-[#5A00D6]">Verification unavailable</span>
=======
                        <span>Audit Readiness (99.2%)</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#FF2E9A]" />
                        <span>3-Way Claim Match (99.4%)</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-extrabold text-[#5A00D6]">PRODA Verified</span>
>>>>>>> theirs
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
<<<<<<< ours
                        6-Domain Readiness Preview
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#5A00D6]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#5A00D6]">
                      NOT VERIFIED
=======
                        6-Domain Live Readiness (%)
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#5A00D6]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#5A00D6]">
                      &gt;98.8% ALL PILLARS
>>>>>>> theirs
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
<<<<<<< ours
                    <span>Benchmark not assessed</span>
                    <span className="text-[#0072FF] font-extrabold">No assessment available</span>
=======
                    <span>NDIS Benchmark Threshold: 95.0%</span>
                    <span className="text-[#0072FF] font-extrabold">All 6 Exceed Target</span>
>>>>>>> theirs
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