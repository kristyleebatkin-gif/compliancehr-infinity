import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, GraduationCap, AlertTriangle, CalendarClock,
  BadgeCheck, HeartHandshake, LayoutDashboard,
  ArrowUpRight, TrendingUp,
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
        <div className="enterprise-surface rounded-2xl p-3.5 sm:p-4 space-y-3">
          {/* Header First -> Sentence -> Blue/Purple Badge After */}
          <LandingSectionHeader
            badge="Enterprise Command Architecture"
            tone="navy"
            icon={LayoutDashboard}
            title="Executive Governance & Operational Telemetry"
            description="Live executive KPIs, statutory SLA monitors, and 6-pillar audit readiness trajectories unified in one command deck."
            rightTag="5 Executive KPIs + 4 Statutory SLA Monitors"
          />

          {/* Compact Domain Switcher */}
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
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                    isActive
                      ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-[#0A2B6D] hover:border-[#0072FF] hover:bg-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: isActive ? '#00C6FF' : panel.color }} />
                  <span>{panel.shortLabel}</span>
                  <span
                    className={`rounded px-1.5 py-0 text-[10.5px] font-extrabold ${
                      isActive ? 'bg-white/15 text-[#00C6FF]' : 'bg-white text-[#5A00D6]'
                    }`}
                  >
                    {panel.metricValue}
                  </span>
                </button>
              );
            })}
          </div>

          {/* All 9 Word/Metric Tiles Together Directly Under Executive & Row 1 */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-9">
            {EXECUTIVE_KPI_ROW.map((kpi) => (
              <Link
                key={kpi.id}
                to={kpi.path}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5 text-left shadow-2xs transition hover:border-[#0072FF]"
              >
                <span
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: kpi.accent }}
                />
                <div className="text-[11px] font-extrabold text-[#0A2B6D] leading-tight">
                  {kpi.label}
                </div>
                <div className="my-1 font-editorial text-lg font-black text-[#0A2B6D] leading-none">
                  {kpi.score}
                </div>
                <div className="text-[10px] font-bold" style={{ color: kpi.accent }}>
                  {kpi.target}
                </div>
              </Link>
            ))}
            {ATTENTION_REQUIRED_ROW.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5 text-left shadow-2xs transition hover:border-[#0072FF]"
              >
                <span
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: item.color }}
                />
                <div className="text-[11px] font-extrabold text-[#0A2B6D] leading-tight">
                  {item.title}
                </div>
                <div className="my-1 font-editorial text-lg font-black text-[#0A2B6D] leading-none">
                  {item.count}
                </div>
                <div className="text-[10px] font-bold" style={{ color: item.color }}>
                  {item.severity}
                </div>
              </Link>
            ))}
          </div>

          {/* ROW 3 — Compact Operational Performance, Trends & Register Telemetry */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 items-stretch">
            {/* Panel 1: Active Domain Readiness Summary */}
            <div className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 text-left">
              <div>
                <h4 className="text-sm sm:text-base font-black text-[#0A2B6D]">
                  {activePanel.title}
                </h4>
                <p className="mt-1 text-xs font-medium leading-snug text-[#0A2B6D]/80">
                  {activePanel.summary}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-[#0072FF]/10 px-2 py-0.5 text-[10.5px] font-extrabold text-[#0072FF]">
                    {activePanel.badge}
                  </span>
                  <span className="rounded-md bg-[#5A00D6]/10 px-2 py-0.5 text-[10.5px] font-extrabold text-[#5A00D6]">
                    {activePanel.kpi}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 border-t border-slate-100 pt-2 flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#0A2B6D]">356 Checkpoints · 45 Registers</span>
                <Link
                  to={activePanel.path}
                  className="inline-flex h-7 items-center gap-1 rounded-lg bg-[#0A2B6D] px-2.5 text-[11px] font-extrabold text-white transition hover:bg-[#0072FF]"
                >
                  <span>Open</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Panel 2: Executive Trajectory Chart */}
            <div className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 text-left">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                <h4 className="text-xs sm:text-sm font-black text-[#0A2B6D]">
                  Audit Readiness &amp; Claims Trajectory (%)
                </h4>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10.5px] font-extrabold text-emerald-700">
                  <TrendingUp className="h-3 w-3" />
                  +5.0%
                </span>
              </div>

              <div className="my-1.5 h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TRAJECTORY_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" fontSize={10} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                    <YAxis width={30} domain={[92, 100]} fontSize={10} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Area type="monotone" dataKey="readiness" stroke="#0072FF" strokeWidth={2} fill="#0072FF" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="claims" stroke="#FF2E9A" strokeWidth={2} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Panel 3: Department Benchmarks Chart */}
            <div className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 text-left">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                <h4 className="text-xs sm:text-sm font-black text-[#0A2B6D]">
                  6-Pillar Domain Readiness (%)
                </h4>
                <span className="rounded bg-[#5A00D6]/10 px-2 py-0.5 text-[10.5px] font-extrabold text-[#5A00D6]">
                  &gt;98.8% All Pillars
                </span>
              </div>

              <div className="my-1.5 h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PILLAR_BAR_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" fontSize={10} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                    <YAxis width={30} domain={[95, 100]} fontSize={10} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={22}>
                      {PILLAR_BAR_DATA.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}