import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, TrendingUp, Award, Sparkles, ArrowUpRight, Lock, FileCheck2, CheckCircle2,
} from 'lucide-react';

const VIEWS = [
  {
    id: 'executive',
    label: 'Live Executive',
    score: '98.7%',
    scoreLabel: 'NDIS Audit Readiness',
    metrics: [
      { label: 'Staff Screening', value: '100%', delta: '32/32 Cleared', color: '#0072FF' },
      { label: 'Active Plans', value: '48', delta: '3-Part Consents', color: '#5A00D6' },
      { label: 'Reportable SLA', value: '100%', delta: 'Zero Overdue', color: '#FF2E9A' },
      { label: 'Claim Match', value: '99.4%', delta: 'PRODA Ready', color: '#0A2B6D' },
    ],
    checkpoints: [
      { code: 'CORE 1', title: 'Participant Rights & 3-Part Informed Consents', status: 'Verified · 100%' },
      { code: 'CORE 2', title: 'Provider Governance & 356 Audit Checkpoints', status: 'Ready · 99.2%' },
      { code: 'CORE 3', title: 'Provision of Supports & 10-Weekly Reviews', status: 'Current · 98.5%' },
      { code: 'CORE 4', title: 'Safe Environment, Medication & Emergency Drills', status: 'Verified · 99.0%' },
    ],
  },
  {
    id: 'workforce',
    label: 'Workforce & Roster',
    score: '100%',
    scoreLabel: 'Worker Screening Gate',
    metrics: [
      { label: 'NDIS Screening', value: '100%', delta: 'Gate Active', color: '#0072FF' },
      { label: 'First Aid & CPR', value: '98.4%', delta: '14d Alerts', color: '#5A00D6' },
      { label: 'Shift Coverage', value: '99.1%', delta: 'Fatigue Checked', color: '#FF2E9A' },
      { label: 'Shift Notes', value: '100%', delta: 'Goal Linked', color: '#0A2B6D' },
    ],
    checkpoints: [
      { code: 'GATE 01', title: 'Unscreened Worker Shift Block', status: 'Armed · Active' },
      { code: 'GATE 02', title: 'SCHADS Award & Fatigue Break Validation', status: 'Armed · Active' },
      { code: 'GATE 03', title: '30/60/90-Day Credential Expiry Sweep', status: 'Running 24/7' },
      { code: 'GATE 04', title: 'Shift Note → NDIS Invoice Line Reconciliation', status: 'Synced Live' },
    ],
  },
  {
    id: 'audits',
    label: 'Audits & Governance',
    score: '356 / 356',
    scoreLabel: 'Checkpoints Mapped',
    metrics: [
      { label: 'Categories', value: '17', delta: 'Full NDIS Scope', color: '#0072FF' },
      { label: 'Master Policies', value: '125+', delta: 'Version Locked', color: '#5A00D6' },
      { label: 'Risk Controls', value: '98.2%', delta: '6-Mo Reviews', color: '#FF2E9A' },
      { label: 'Auditor Portal', value: 'Live', delta: 'Consent-Gated', color: '#0A2B6D' },
    ],
    checkpoints: [
      { code: 'AUD-01', title: '2-Minute Express Internal Audit Pack', status: '1-Click PDF' },
      { code: 'AUD-02', title: '24-Hour & 5-Day NDIS Commission Timers', status: 'Auto SLA' },
      { code: 'AUD-03', title: 'Continuous Improvement Register (CIR) Routing', status: 'Active' },
      { code: 'AUD-04', title: 'Consent-Gated External Auditor Portal', status: 'RLS Locked' },
    ],
  },
];

export default function HeroDashboardMockup() {
  const [activeTab, setActiveTab] = useState('executive');
  const current = VIEWS.find((v) => v.id === activeTab) || VIEWS[0];

  return (
    <div className="w-full rounded-2xl border border-white/35 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl">
      <div className="overflow-hidden rounded-xl bg-white">
        {/* Top Executive Window Bar — Live Next to Executive */}
        <div
          className="flex items-center justify-between gap-2 px-3.5 py-2 text-white"
          style={{
            background: 'linear-gradient(90deg, #0A2B6D 0%, #0072FF 48%, #5A00D6 100%)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex shrink-0 items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF2E9A]" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#00C6FF]" />
            </div>
            <span className="ml-1 text-[11px] xl:text-xs font-extrabold tracking-wide text-white leading-tight">
              ComplianceHR Infinity · Live Executive
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/15 px-2 py-0.5 text-[9.5px] font-bold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
            46 MODULES SYNCED
          </span>
        </div>

        {/* Interactive View Switcher (Live Executive First, Single Row) */}
        <div className="flex items-center justify-between gap-1.5 border-b border-slate-100 bg-slate-50 px-2.5 py-1.5">
          <div className="grid grid-cols-3 gap-1 flex-1">
            {VIEWS.map((view) => {
              const active = view.id === activeTab;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveTab(view.id)}
                  className={`rounded-lg px-1.5 py-1 text-[10px] xl:text-[11px] font-extrabold leading-tight transition ${
                    active
                      ? 'bg-[#0A2B6D] text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-[#0A2B6D] hover:bg-slate-100'
                  }`}
                >
                  {view.label}
                </button>
              );
            })}
          </div>
          <Link
            to="/dashboard"
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-[#0072FF]/10 px-2.5 py-1 text-[11px] font-extrabold text-[#0072FF] hover:bg-[#0072FF] hover:text-white transition"
          >
            <span>Open</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Main Dashboard Body — Compact Spacing With Zero Empty Gaps */}
        <div className="p-3 space-y-2.5">
          {/* Score Hero Banner — Live Executive Telemetry Next to Score */}
          <div
            className="flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-white shadow-sm"
            style={{
              background: 'linear-gradient(120deg, #0A2B6D 0%, #5A00D6 55%, #FF2E9A 100%)',
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/35 bg-white/15">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="whitespace-nowrap text-[10px] font-extrabold uppercase tracking-wider text-white">
                    {current.scoreLabel}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-extrabold text-white whitespace-nowrap">
                    LIVE EXECUTIVE
                  </span>
                </div>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="font-editorial text-2xl font-extrabold text-white leading-none whitespace-nowrap">
                    {current.score}
                  </span>
                  <span className="whitespace-nowrap text-[11px] font-semibold text-white/90">
                    +2.4% vs Q3 · Audit Pack Ready
                  </span>
                </div>
              </div>
            </div>
            <Link
              to="/compliance"
              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-[#0A2B6D] shadow-xs transition hover:bg-slate-50"
            >
              <Award className="h-3.5 w-3.5 text-[#FF2E9A]" />
              <span>Export Pack</span>
            </Link>
          </div>

          {/* 4 Symmetrical KPI Mini Cards */}
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 items-stretch">
            {current.metrics.map((m) => (
              <div
                key={m.label}
                className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 px-2 py-1.5 text-left shadow-2xs"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9.5px] font-extrabold text-[#0A2B6D]/85 leading-tight">
                    {m.label}
                  </span>
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                </div>
                <div className="my-0.5 font-editorial text-base xl:text-lg font-extrabold text-[#0A2B6D] leading-tight">
                  {m.value}
                </div>
                <div
                  className="inline-flex items-center gap-1 text-[9.5px] font-bold leading-tight"
                  style={{ color: m.color }}
                >
                  <TrendingUp className="h-2.5 w-2.5 shrink-0" />
                  <span>{m.delta}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Live Governance & Checkpoint Rows — Every Word Fits Without Truncation */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-2.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              <span className="inline-flex items-center gap-1">
                <FileCheck2 className="h-3 w-3 text-[#5A00D6]" />
                <span>Live NDIS Practice Standard Stream</span>
              </span>
              <span className="text-[#0072FF]">Real-Time Sync</span>
            </div>
            <div className="space-y-1">
              {current.checkpoints.map((cp) => (
                <div
                  key={cp.code}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/80 bg-white px-2 py-1 text-left"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0 rounded bg-[#0A2B6D] px-1.5 py-0.5 text-[9px] font-extrabold text-white whitespace-nowrap">
                      {cp.code}
                    </span>
                    <span className="text-[10.5px] font-bold leading-snug text-[#0A2B6D]">
                      {cp.title}
                    </span>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-[#0072FF]/10 px-2 py-0.5 text-[9.5px] font-extrabold text-[#0072FF]">
                    <CheckCircle2 className="h-2.5 w-2.5 text-[#0072FF]" />
                    {cp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom AI Copilot & Security Bar */}
          <div className="flex items-center justify-between gap-2 rounded-xl border border-[#5A00D6]/20 bg-[#5A00D6]/5 px-3 py-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-[#0A2B6D] whitespace-nowrap">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#FF2E9A]" />
              <span>24/7 AI Compliance Copilot active</span>
            </div>
            <div className="flex shrink-0 items-center gap-1 whitespace-nowrap font-extrabold text-[#5A00D6]">
              <Lock className="h-3 w-3" />
              <span>Role-Based Security (RLS)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}