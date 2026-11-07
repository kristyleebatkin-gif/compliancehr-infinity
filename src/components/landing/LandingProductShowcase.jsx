import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, GraduationCap, AlertTriangle, CalendarClock,
  BadgeCheck, HeartHandshake, LayoutDashboard, CheckCircle2,
  ArrowUpRight, TrendingUp, Lock, Activity, FileCheck2,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

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

// ROW 1 — Mandatory Executive KPIs
const EXECUTIVE_KPI_ROW = [
  {
    id: 'org-health',
    label: 'Organisation Health',
    score: '98.4%',
    target: 'Target ≥95.0%',
    status: 'Optimal',
    accent: '#0A2B6D',
    path: '/dashboard',
  },
  {
    id: 'compliance',
    label: 'Compliance Score',
    score: '99.2%',
    target: '356 / 356 Verified',
    status: 'Audit Ready',
    accent: '#0072FF',
    path: '/compliance',
  },
  {
    id: 'risk',
    label: 'Risk Score',
    score: '96.8%',
    target: 'ISO 31000 Controls',
    status: 'Controlled',
    accent: '#5A00D6',
    path: '/risks',
  },
  {
    id: 'workforce',
    label: 'Workforce Score',
    score: '100%',
    target: '100-Pt Cleared',
    status: 'Enforced',
    accent: '#0072FF',
    path: '/hr',
  },
  {
    id: 'quality',
    label: 'Quality Score',
    score: '98.9%',
    target: 'CIR & CAPA Linked',
    status: 'Compliant',
    accent: '#FF2E9A',
    path: '/quality',
  },
];

// ROW 2 — Mandatory Attention Required Items
const ATTENTION_REQUIRED_ROW = [
  {
    id: 'incidents',
    title: 'Critical Incidents',
    count: '1 Active',
    sla: '24h NDIS Commission Timer Armed',
    severity: 'High Priority',
    color: '#FF2E9A',
    path: '/incidents',
  },
  {
    id: 'risks',
    title: 'High Risks',
    count: '2 Monitored',
    sla: 'Mitigation plans verified on schedule',
    severity: 'Controlled',
    color: '#5A00D6',
    path: '/risks',
  },
  {
    id: 'actions',
    title: 'Overdue Actions',
    count: '0 Overdue',
    sla: '14 actions completed this week',
    severity: 'On Track',
    color: '#0072FF',
    path: '/tasks',
  },
  {
    id: 'credentials',
    title: 'Expiring Credentials',
    count: '3 in 30 Days',
    sla: '90/60/30d automated renewal alerts active',
    severity: 'Scheduled',
    color: '#0A2B6D',
    path: '/certificates',
  },
  {
    id: 'gaps',
    title: 'Compliance Gaps',
    count: '0 Unverified',
    sla: 'All 17 NDIS categories evidenced',
    severity: 'Verified',
    color: '#0072FF',
    path: '/compliance',
  },
];

const SHOWCASE_PANELS = [
  {
    id: 'executive',
    shortLabel: 'Executive Overview',
    title: 'Live Executive Command Centre',
    icon: LayoutDashboard,
    badge: 'Executive OS',
    color: '#0A2B6D',
    path: '/dashboard',
    summary:
      'Unified executive command centre connecting Organisation Health, Compliance Score, Risk Score, Workforce Clearance, and Quality Governance.',
    kpi: '99.2% Audit Readiness',
    metricValue: '99.2%',
  },
  {
    id: 'score',
    shortLabel: 'Compliance Score',
    title: 'Compliance & Audit Readiness',
    icon: ShieldCheck,
    badge: '356 Checkpoints',
    color: '#0072FF',
    path: '/compliance',
    summary:
      '17 Audit Categories & 356 Checkpoints continuously scored with attached auditor evidence and 1-click PDF board packs.',
    kpi: '356 / 356 Checkpoints',
    metricValue: '99.2%',
  },
  {
    id: 'credentials',
    shortLabel: 'Workforce & HR',
    title: 'Staff Credentials & Workforce KPIs',
    icon: BadgeCheck,
    badge: '100-Pt Cleared',
    color: '#5A00D6',
    path: '/hr',
    summary:
      'NDIS Worker Screening, Blue Card, Police Check, First Aid & CPR verified automatically before roster allocation.',
    kpi: 'Zero Unscreened Shifts',
    metricValue: '100%',
  },
  {
    id: 'participants',
    shortLabel: 'Participant Care',
    title: 'Participant Activity & Clinical Governance',
    icon: HeartHandshake,
    badge: 'Person-Centred',
    color: '#FF2E9A',
    path: '/our-participants',
    summary:
      'Live shift notes, 3-part informed consents, goal progress milestones, and NDIS plan budget utilisation.',
    kpi: '99.1% Plan Alignment',
    metricValue: '99.1%',
  },
  {
    id: 'incidents',
    shortLabel: 'Risk & Incidents',
    title: 'Statutory Incidents & ISO 31000 Risk Matrix',
    icon: AlertTriangle,
    badge: '24h / 5d SLA',
    color: '#FF2E9A',
    path: '/incidents',
    summary:
      'Statutory 24-hour & 5-day NDIS Commission reportable countdowns paired with ISO 31000 risk controls.',
    kpi: '0 Overdue Alerts',
    metricValue: '100% SLA',
  },
  {
    id: 'training',
    shortLabel: 'Training & LMS',
    title: 'Workforce Training & Competency LMS',
    icon: GraduationCap,
    badge: '98.9% Current',
    color: '#5A00D6',
    path: '/training',
    summary:
      'Mandatory NDIS worker orientation, infection control, manual handling, and medication modules tracked automatically.',
    kpi: '142 Certificates Active',
    metricValue: '98.9%',
  },
  {
    id: 'reviews',
    shortLabel: 'Review Horizon',
    title: '90 / 60 / 30-Day Review & Expiry Radar',
    icon: CalendarClock,
    badge: 'Horizon Radar',
    color: '#0072FF',
    path: '/review-due',
    summary:
      'Automated horizon radar for 10-weekly participant progress notes, plan renewals, and 6-monthly home risk checks.',
    kpi: '100% On-Schedule',
    metricValue: '90/60/30d',
  },
];

export default function LandingProductShowcase() {
  const [selectedId, setSelectedId] = useState('executive');
  const activePanel = SHOWCASE_PANELS.find((p) => p.id === selectedId) || SHOWCASE_PANELS[0];

  return (
    <section id="showcase" className="w-full scroll-mt-20">
      <Reveal>
        <div className="enterprise-surface rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6">
          {/* Top Two Lines: Line 1 Badge + Heading + Summary · Line 2 Domain View Switcher */}
          <div className="space-y-2.5 border-b border-slate-200 pb-3.5 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[#0A2B6D]/25 bg-[#0A2B6D]/10 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  <LayoutDashboard className="h-3.5 w-3.5 text-[#0072FF]" />
                  <span>Enterprise Command Architecture</span>
                </span>
                <h2 className="font-editorial text-xl sm:text-2xl font-extrabold tracking-tight text-[#0A2B6D]">
                  Executive Governance &amp; Operational Telemetry
                </h2>
              </div>
              <span className="text-xs font-semibold text-[#0A2B6D]/80">
                Row 1 Executive KPIs · Attention Required SLA Monitors · Operational Performance
              </span>
            </div>

            <div
              role="tablist"
              aria-label="Executive dashboard showcase views"
              className="flex flex-wrap items-center gap-1.5"
            >
              {SHOWCASE_PANELS.map((panel) => {
                const Icon = panel.icon;
                const isActive = panel.id === selectedId;
                return (
                  <button
                    key={panel.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedId(panel.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-[#0A2B6D] hover:border-[#0072FF] hover:bg-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: isActive ? '#00C6FF' : panel.color }} />
                    <span>{panel.shortLabel}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[11px] font-extrabold ${
                        isActive ? 'bg-white/15 text-[#00C6FF]' : 'bg-white text-[#5A00D6]'
                      }`}
                    >
                      {panel.metricValue}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* All 9 Word/Metric Tiles Together Directly Under Executive & Row 1 */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Row 1 · Executive &amp; Governance Command (All 9 Core Telemetry Tiles)
              </h3>
              <span className="text-xs font-semibold text-[#5A00D6]">
                5 Executive KPIs + 4 Statutory SLA Monitors Unified
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
              {EXECUTIVE_KPI_ROW.map((kpi) => (
                <Link
                  key={kpi.id}
                  to={kpi.path}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-2xs transition hover:border-[#0072FF] hover:shadow-md"
                >
                  <span
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ backgroundColor: kpi.accent }}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0A2B6D]">
                      {kpi.label}
                    </span>
                    <span
                      className="rounded px-2 py-0.5 text-[11px] font-bold"
                      style={{ backgroundColor: `${kpi.accent}12`, color: kpi.accent }}
                    >
                      {kpi.status}
                    </span>
                  </div>
                  <div className="mt-2 font-editorial text-2xl font-extrabold text-[#0A2B6D] leading-none">
                    {kpi.score}
                  </div>
                  <div className="mt-2 border-t border-slate-100 pt-1.5 text-xs font-medium text-[#0A2B6D]/75">
                    {kpi.target}
                  </div>
                </Link>
              ))}
              {ATTENTION_REQUIRED_ROW.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-2xs transition hover:border-[#0072FF] hover:shadow-md"
                >
                  <span
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0A2B6D]">
                      {item.title}
                    </span>
                    <span
                      className="rounded px-2 py-0.5 text-[11px] font-bold"
                      style={{ backgroundColor: `${item.color}12`, color: item.color }}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <div className="mt-2 font-editorial text-2xl font-extrabold text-[#0A2B6D] leading-none">
                    {item.count}
                  </div>
                  <div className="mt-2 border-t border-slate-100 pt-1.5 text-xs font-medium text-[#0A2B6D]/75">
                    {item.sla}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ROW 3 — Operational Performance (Trends, Analytics, Registers, Workforce Metrics) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Row 3 · Operational Performance, Trends &amp; Register Telemetry
              </h3>
              <span className="text-xs font-semibold text-[#0A2B6D]/70">
                Active Focus: {activePanel.title}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
              {/* Panel 1: Active Domain Readiness Summary */}
              <div className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-[#0072FF]">
                        {activePanel.badge}
                      </span>
                      <h4 className="mt-0.5 text-lg font-extrabold text-[#0A2B6D]">
                        {activePanel.title}
                      </h4>
                    </div>
                    <span className="rounded-md bg-[#0072FF]/10 px-2.5 py-1 text-xs font-bold text-[#0072FF]">
                      {activePanel.metricValue}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-normal leading-relaxed text-[#0A2B6D]/80">
                    {activePanel.summary}
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                      <span className="font-semibold text-[#0A2B6D]">NDIS Practice Standards</span>
                      <span className="font-bold text-[#0072FF]">356 / 356 Checkpoints</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                      <span className="font-semibold text-[#0A2B6D]">Master Registers Linked</span>
                      <span className="font-bold text-[#5A00D6]">45 Auto-Maintained</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                      <span className="font-semibold text-[#0A2B6D]">Row-Level Security (RLS)</span>
                      <span className="font-bold text-[#0A2B6D]">15 Role Tiers Enforced</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5A00D6]">{activePanel.kpi}</span>
                  <Link
                    to={activePanel.path}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A2B6D] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#0072FF]"
                  >
                    <span>Open Module</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Panel 2: Executive Trajectory Chart */}
              <div className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#0072FF]">
                      6-Month Trend
                    </span>
                    <h4 className="mt-0.5 text-lg font-extrabold text-[#0A2B6D]">
                      Audit Readiness &amp; Claims (%)
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +5.0% Gain
                  </span>
                </div>

                <div className="my-3 h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={TRAJECTORY_DATA} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="readinessFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0072FF" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#5A00D6" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" fontSize={12} tick={{ fill: '#0A2B6D', fontWeight: 600 }} />
                      <YAxis
                        width={36}
                        domain={[92, 100]}
                        fontSize={12}
                        tick={{ fill: '#0A2B6D', fontWeight: 600 }}
                      />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Area
                        type="monotone"
                        dataKey="readiness"
                        name="Audit Readiness"
                        stroke="#0072FF"
                        strokeWidth={2.5}
                        fill="url(#readinessFill)"
                      />
                      <Area
                        type="monotone"
                        dataKey="claims"
                        name="Claim Reconciliation"
                        stroke="#FF2E9A"
                        strokeWidth={2}
                        fillOpacity={0}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs font-semibold text-[#0A2B6D]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#0072FF]" />
                    <span>Readiness (99.2%)</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF2E9A]" />
                    <span>3-Way Claim Match (99.4%)</span>
                  </span>
                </div>
              </div>

              {/* Panel 3: Department Benchmarks Chart */}
              <div className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#5A00D6]">
                      Domain Benchmarks
                    </span>
                    <h4 className="mt-0.5 text-lg font-extrabold text-[#0A2B6D]">
                      6-Pillar Readiness (%)
                    </h4>
                  </div>
                  <span className="rounded-md bg-[#5A00D6]/10 px-2.5 py-1 text-xs font-bold text-[#5A00D6]">
                    &gt;98.8% All Pillars
                  </span>
                </div>

                <div className="my-3 h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PILLAR_BAR_DATA} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" fontSize={12} tick={{ fill: '#0A2B6D', fontWeight: 600 }} />
                      <YAxis
                        width={36}
                        domain={[95, 100]}
                        fontSize={12}
                        tick={{ fill: '#0A2B6D', fontWeight: 600 }}
                      />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Bar dataKey="score" name="Readiness (%)" radius={[4, 4, 0, 0]} barSize={26}>
                        {PILLAR_BAR_DATA.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs font-semibold text-[#0A2B6D]">
                  <span>Benchmark Threshold: 95.0%</span>
                  <span className="text-[#0072FF] font-bold">All 6 Exceed Target</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}