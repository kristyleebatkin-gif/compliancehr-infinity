import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, TrendingUp, Award, Sparkles, ArrowUpRight, Lock, FileCheck2, CheckCircle2,
} from 'lucide-react';

const VIEWS = [
  {
    id: 'executive',
    label: 'Executive Command',
    score: '98.7%',
    scoreLabel: 'NDIS Audit Readiness',
    metrics: [
      { label: '100-Pt Staff Screening', value: '100%', delta: '32/32 Cleared', color: '#0072FF' },
      { label: 'Active Participant Plans', value: '48', delta: '3-Part Consents', color: '#5A00D6' },
      { label: '24h / 5d Reportable SLA', value: '100%', delta: 'Zero Overdue', color: '#FF2E9A' },
      { label: '3-Way Claim Match', value: '99.4%', delta: 'PRODA Ready', color: '#0A2B6D' },
    ],
    checkpoints: [
      { code: 'CORE 1', title: 'Participant Rights & 3-Part Informed Consents', status: 'Verified · 100%' },
      { code: 'CORE 2', title: 'Provider Governance & 356 Audit Checkpoints', status: 'Audit Ready · 99.2%' },
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
      { label: 'NDIS Worker Screening', value: '100%', delta: 'Auto-Gate Active', color: '#0072FF' },
      { label: 'First Aid & CPR', value: '98.4%', delta: '14d Auto-Alerts', color: '#5A00D6' },
      { label: 'Rostered Shift Coverage', value: '99.1%', delta: 'Fatigue Checked', color: '#FF2E9A' },
      { label: 'Completed Shift Notes', value: '100%', delta: 'Goal Linked', color: '#0A2B6D' },
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
      { label: 'Audit Categories', value: '17', delta: 'Full NDIS Scope', color: '#0072FF' },
      { label: 'Controlled Policies', value: '125+', delta: 'Version Locked', color: '#5A00D6' },
      { label: 'ISO 31000 Risk Controls', value: '98.2%', delta: '6-Mo Reviews', color: '#FF2E9A' },
      { label: 'Auditor Portal', value: 'Live', delta: 'Consent-Gated', color: '#0A2B6D' },
    ],
    checkpoints: [
      { code: 'AUD-01', title: '2-Minute Express Internal Audit Pack', status: '1-Click PDF Ready' },
      { code: 'AUD-02', title: '24-Hour & 5-Day NDIS Commission Timers', status: 'Automated SLA' },
      { code: 'AUD-03', title: 'Continuous Improvement Register (CIR) Auto-Routing', status: 'Active' },
      { code: 'AUD-04', title: 'Consent-Gated External Auditor Portal', status: 'RLS Enforced' },
    ],
  },
];

export default function HeroDashboardMockup() {
  const [activeTab, setActiveTab] = useState('executive');
  const current = VIEWS.find((v) => v.id === activeTab) || VIEWS[0];

  return (
    <div className="flex w-full flex-col justify-between rounded-2xl border border-white/35 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl">
      <div className="flex h-full flex-col justify-between overflow-hidden rounded-xl bg-white">
        {/* Top Executive Window Bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-white"
          style={{
            background: 'linear-gradient(90deg, #0A2B6D 0%, #0072FF 48%, #5A00D6 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF2E9A]" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#00C6FF]" />
            </div>
            <span className="ml-1.5 text-xs font-extrabold tracking-wide text-white">
              ComplianceHR Infinity · Live Executive Mockup
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
            46 MODULES SYNCED
          </span>
        </div>

        {/* Interactive View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {VIEWS.map((view) => {
              const active = view.id === activeTab;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveTab(view.id)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
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
            className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0072FF] hover:text-[#5A00D6]"
          >
            <span>Open Workspace</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Main Dashboard Body */}
        <div className="flex flex-1 flex-col justify-between p-4 space-y-3.5">
          {/* Score Hero Banner */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl p-3.5 text-white shadow-sm"
            style={{
              background: 'linear-gradient(120deg, #0A2B6D 0%, #5A00D6 55%, #FF2E9A 100%)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/35 bg-white/15 backdrop-blur-xs">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/85">
                    {current.scoreLabel}
                  </span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    LIVE NDIS TELEMETRY
                  </span>
                </div>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="font-editorial text-2xl sm:text-3xl font-extrabold text-white">
                    {current.score}
                  </span>
                  <span className="text-xs font-semibold text-white/90">
                    +2.4% vs Q3 · Audit Pack Ready
                  </span>
                </div>
              </div>
            </div>
            <Link
              to="/compliance"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-[#0A2B6D] shadow-xs transition hover:bg-slate-50"
            >
              <Award className="h-3.5 w-3.5 text-[#FF2E9A]" />
              <span>Export Board Pack</span>
            </Link>
          </div>

          {/* 4 Glassmorphism-Styled KPI Mini Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {current.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-2.5 text-left shadow-2xs"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-[#0A2B6D]/75 leading-tight">
                    {m.label}
                  </span>
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                </div>
                <div className="mt-1 font-editorial text-lg font-extrabold text-[#0A2B6D]">
                  {m.value}
                </div>
                <div
                  className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold"
                  style={{ color: m.color }}
                >
                  <TrendingUp className="h-2.5 w-2.5" />
                  <span className="truncate">{m.delta}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Live Governance & Checkpoint Rows */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              <span className="inline-flex items-center gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5 text-[#5A00D6]" />
                <span>Live NDIS Practice Standard Stream</span>
              </span>
              <span className="text-[#0072FF]">Real-Time Sync</span>
            </div>
            <div className="space-y-1.5">
              {current.checkpoints.map((cp) => (
                <div
                  key={cp.code}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 rounded bg-[#0A2B6D] px-2 py-0.5 text-[10px] font-extrabold text-white">
                      {cp.code}
                    </span>
                    <span className="truncate text-xs font-bold text-[#0A2B6D]">
                      {cp.title}
                    </span>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#0072FF]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#0072FF]">
                    <CheckCircle2 className="h-3 w-3 text-[#0072FF]" />
                    {cp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom AI Copilot & Security Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#5A00D6]/20 bg-[#5A00D6]/5 px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#0A2B6D]">
              <Sparkles className="h-3.5 w-3.5 text-[#FF2E9A]" />
              <span>24/7 AI Compliance Copilot active</span>
            </div>
            <div className="flex items-center gap-1 font-extrabold text-[#5A00D6]">
              <Lock className="h-3.5 w-3.5" />
              <span>Role-Based Security (RLS)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}