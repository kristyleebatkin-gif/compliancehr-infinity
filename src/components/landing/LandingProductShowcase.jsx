import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, GraduationCap, AlertTriangle, CalendarClock,
  BadgeCheck, HeartHandshake, LayoutDashboard, CheckCircle2,
  ArrowUpRight, Sparkles, TrendingUp, Lock, Users, Activity,
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
  { name: 'Governance', score: 99.2, fill: '#0A2B6D' },
  { name: 'Workforce', score: 100.0, fill: '#0072FF' },
  { name: 'Participant', score: 99.1, fill: '#5A00D6' },
  { name: 'Safety SLA', score: 98.8, fill: '#FF2E9A' },
  { name: 'Training', score: 98.9, fill: '#0072FF' },
  { name: 'Claims', score: 99.4, fill: '#5A00D6' },
];

const SHOWCASE_PANELS = [
  {
    id: 'executive',
    title: 'Executive Dashboard',
    icon: LayoutDashboard,
    badge: 'Command Centre',
    color: '#0A2B6D',
    path: '/dashboard',
    summary: 'Full-width executive command centre uniting compliance score gauge, workforce KPIs, participant analytics, risk alerts, and training compliance.',
    kpi: '99.2% Audit Readiness',
    status: 'All 46 Modules Live',
  },
  {
    id: 'score',
    title: 'Compliance Score',
    icon: ShieldCheck,
    badge: '99.2% Verified',
    color: '#0072FF',
    path: '/compliance',
    summary: '17 Audit Categories & 356 Checkpoints continuously scored with attached auditor evidence and 1-click PDF packs.',
    kpi: '356 / 356 Checkpoints',
    status: 'Audit Pack Ready',
  },
  {
    id: 'training',
    title: 'Training Compliance',
    icon: GraduationCap,
    badge: '98.9% Current',
    color: '#5A00D6',
    path: '/training',
    summary: 'Mandatory NDIS worker orientation, infection control, manual handling, and medication modules tracked automatically.',
    kpi: '142 Certificates Active',
    status: 'LMS Auto-Refresher',
  },
  {
    id: 'incidents',
    title: 'Open Incidents & Risk Alerts',
    icon: AlertTriangle,
    badge: '100% On-Time SLA',
    color: '#FF2E9A',
    path: '/incidents',
    summary: 'Statutory 24-hour & 5-day NDIS Commission reportable countdowns paired with ISO 31000 risk controls.',
    kpi: '0 Overdue Alerts',
    status: '24h / 5d Timers Armed',
  },
  {
    id: 'reviews',
    title: 'Upcoming Reviews',
    icon: CalendarClock,
    badge: '90/60/30/14d Radar',
    color: '#0072FF',
    path: '/review-due',
    summary: 'Automated horizon radar for 10-weekly participant progress notes, plan renewals, and 6-monthly home risk checks.',
    kpi: '100% On-Schedule',
    status: 'Automated Horizon Radar',
  },
  {
    id: 'credentials',
    title: 'Staff Credentials & Workforce KPIs',
    icon: BadgeCheck,
    badge: '100-Point Cleared',
    color: '#5A00D6',
    path: '/hr',
    summary: 'NDIS Worker Screening, Blue Card, Police Check, First Aid & CPR verified before roster allocation.',
    kpi: 'Zero Unscreened Shifts',
    status: 'Roster Gate Enforced',
  },
  {
    id: 'participants',
    title: 'Participant Activity & Analytics',
    icon: HeartHandshake,
    badge: 'Person-Centred',
    color: '#FF2E9A',
    path: '/our-participants',
    summary: 'Live shift notes, 3-part informed consents, goal progress milestones, and NDIS plan budget utilisation.',
    kpi: '99.1% Plan Alignment',
    status: '3-Part Consents Locked',
  },
];

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
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 text-white"
              style={{
                background: 'linear-gradient(120deg, #0A2B6D 0%, #0072FF 40%, #5A00D6 75%, #FF2E9A 100%)',
              }}
            >
              <div className="text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
                  <Sparkles className="h-3.5 w-3.5 text-[#00C6FF]" />
                  <span>Full-Width Executive Command Centre</span>
                </div>
                <h2 className="mt-1.5 font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                  Everything Connected — Live Executive Dashboard Showcase
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-xs">
                  <Lock className="h-3.5 w-3.5 text-[#00C6FF]" />
                  NDIS Practice Standards 2026
                </span>
                <Link
                  to={activePanel.path}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-[#0A2B6D] shadow-md transition hover:bg-slate-100"
                >
                  <span>Open {activePanel.title}</span>
                  <ArrowUpRight className="h-4 w-4 text-[#0072FF]" />
                </Link>
              </div>
            </div>

            {/* Horizontal Telemetry Switcher Bar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
              {SHOWCASE_PANELS.map((panel) => {
                const Icon = panel.icon;
                const isActive = panel.id === selectedId;
                return (
                  <button
                    key={panel.id}
                    type="button"
                    onClick={() => setSelectedId(panel.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                      isActive
                        ? 'bg-[#0A2B6D] text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF] hover:text-[#0072FF]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{panel.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Landscape Dashboard Grid — Zero Empty Space */}
            <div className="p-5 sm:p-6 space-y-5 bg-slate-50/40">
              {/* Top Row: Compliance Score Gauge + Active Telemetry Spotlight + Executive Trajectory Charts */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
                {/* Col 1-3: Compliance Score Gauge Card */}
                <div className="lg:col-span-3 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xs">
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                    <span>Compliance Score</span>
                    <span className="rounded-full bg-[#0072FF]/10 px-2.5 py-0.5 text-[10px] text-[#0072FF]">
                      LIVE GAUGE
                    </span>
                  </div>

                  {/* SVG Radial Score Gauge */}
                  <div className="relative mx-auto my-2 flex h-36 w-36 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
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
                        stroke="url(#gaugeGrad)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="314"
                        strokeDashoffset="4"
                      />
                      <defs>
                        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#0072FF" />
                          <stop offset="50%" stopColor="#5A00D6" />
                          <stop offset="100%" stopColor="#FF2E9A" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-editorial text-3xl font-extrabold text-[#0A2B6D]">
                        99.2%
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                        Audit Ready
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-[#0A2B6D]">
                    356 / 356 Checkpoints Verified Across 17 Categories
                  </div>
                </div>

                {/* Col 4-8: Executive Trajectory Chart */}
                <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                        Executive Trajectory Chart
                      </span>
                      <h3 className="font-editorial text-lg font-extrabold text-[#0A2B6D]">
                        Audit Readiness &amp; NDIS Claim Integrity (%)
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +5.0% 6-Mo Gain
                    </span>
                  </div>

                  <div className="mt-3 h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TRAJECTORY_DATA} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="readinessFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0072FF" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#5A00D6" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" fontSize={11} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                        <YAxis domain={[92, 100]} fontSize={11} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
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
                </div>

                {/* Col 9-12: Departmental Pillar Benchmarks Chart */}
                <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                        Department Benchmarks
                      </span>
                      <h3 className="font-editorial text-lg font-extrabold text-[#0A2B6D]">
                        6-Domain Live Readiness
                      </h3>
                    </div>
                    <span className="rounded-full bg-[#5A00D6]/10 px-2.5 py-1 text-xs font-extrabold text-[#5A00D6]">
                      &gt;98.8% All Pillars
                    </span>
                  </div>

                  <div className="mt-3 h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={PILLAR_BAR_DATA} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" fontSize={10} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                        <YAxis domain={[95, 100]} fontSize={10} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Bar dataKey="score" name="Readiness (%)" radius={[6, 6, 0, 0]} barSize={22}>
                          {PILLAR_BAR_DATA.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Bottom Row: 6 Connected Operational Telemetry Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                {/* 1. Compliance Score */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                      Compliance Score
                    </span>
                    <ShieldCheck className="h-4 w-4 text-[#0072FF]" />
                  </div>
                  <div className="mt-2 font-editorial text-2xl font-extrabold text-[#0A2B6D]">
                    99.2%
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#0A2B6D]/75">
                    17 NDIS Categories Verified
                  </p>
                </div>

                {/* 2. Workforce KPIs / Staff Credentials */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                      Staff Credentials
                    </span>
                    <BadgeCheck className="h-4 w-4 text-[#5A00D6]" />
                  </div>
                  <div className="mt-2 font-editorial text-2xl font-extrabold text-[#0A2B6D]">
                    100% Cleared
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#0A2B6D]/75">
                    NDIS Screening &amp; Blue Card Gate
                  </p>
                </div>

                {/* 3. Participant Analytics */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF2E9A]">
                      Participant Activity
                    </span>
                    <HeartHandshake className="h-4 w-4 text-[#FF2E9A]" />
                  </div>
                  <div className="mt-2 font-editorial text-2xl font-extrabold text-[#0A2B6D]">
                    99.1% Active
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#0A2B6D]/75">
                    3-Part Consents &amp; Goals Linked
                  </p>
                </div>

                {/* 4. Risk Alerts & Open Incidents */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF2E9A]">
                      Open Incidents
                    </span>
                    <AlertTriangle className="h-4 w-4 text-[#FF2E9A]" />
                  </div>
                  <div className="mt-2 font-editorial text-2xl font-extrabold text-[#0A2B6D]">
                    100% On-Time
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#0A2B6D]/75">
                    24h &amp; 5d Commission SLA Armed
                  </p>
                </div>

                {/* 5. Training Compliance */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                      Training Compliance
                    </span>
                    <GraduationCap className="h-4 w-4 text-[#5A00D6]" />
                  </div>
                  <div className="mt-2 font-editorial text-2xl font-extrabold text-[#0A2B6D]">
                    98.9% Current
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#0A2B6D]/75">
                    LMS Modules, First Aid &amp; CPR
                  </p>
                </div>

                {/* 6. Upcoming Reviews */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                      Upcoming Reviews
                    </span>
                    <CalendarClock className="h-4 w-4 text-[#0072FF]" />
                  </div>
                  <div className="mt-2 font-editorial text-2xl font-extrabold text-[#0A2B6D]">
                    90/60/30d
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#0A2B6D]/75">
                    10-Weekly Notes &amp; Risk Radar
                  </p>
                </div>
              </div>

              {/* Active Selected View Footer Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0A2B6D] px-5 py-3.5 text-white">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
                  <CheckCircle2 className="h-4 w-4 text-[#00C6FF]" />
                  <span>
                    <strong>{activePanel.title}:</strong> {activePanel.summary}
                  </span>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold text-[#00C6FF]">
                  {activePanel.kpi}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}