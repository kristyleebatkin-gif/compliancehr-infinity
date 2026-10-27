import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Users, Calendar, AlertTriangle, CheckCircle2,
  TrendingUp, Award, Sparkles, ArrowUpRight, Lock, FileCheck2,
} from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 28%, #5A00D6 64%, #FF2E9A 100%)';

const VIEWS = [
  {
    id: 'executive',
    label: 'Executive Overview',
    score: '98.7%',
    scoreLabel: 'NDIS Audit Readiness',
    metrics: [
      { label: '100-Pt Staff Screening', value: '100%', delta: '32/32 Cleared', color: '#0072FF' },
      { label: 'Active Participant Plans', value: '48', delta: '3-Part Consents Locked', color: '#5A00D6' },
      { label: '24h / 5d Reportable SLA', value: '100%', delta: 'Zero Overdue', color: '#FF2E9A' },
      { label: '3-Way NDIS Claim Match', value: '99.4%', delta: 'PRODA Ready', color: '#0A2B6D' },
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
      { label: 'First Aid & CPR (HLTAID)', value: '98.4%', delta: '14d Auto-Alerts', color: '#5A00D6' },
      { label: 'Rostered Shift Coverage', value: '99.1%', delta: 'Fatigue Rules Checked', color: '#FF2E9A' },
      { label: 'Completed Shift Notes', value: '100%', delta: 'Linked to Goals', color: '#0A2B6D' },
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
    label: 'Audits & Risk',
    score: '356 / 356',
    scoreLabel: 'Checkpoints Mapped',
    metrics: [
      { label: 'Audit Categories', value: '17', delta: 'Full NDIS Scope', color: '#0072FF' },
      { label: 'Controlled Policies & SOPs', value: '125+', delta: 'Version Locked', color: '#5A00D6' },
      { label: 'ISO 31000 Risk Controls', value: '98.2%', delta: '6-Mo Reviews Active', color: '#FF2E9A' },
      { label: 'External Auditor Portal', value: 'Live', delta: 'Consent-Gated RLS', color: '#0A2B6D' },
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
    <div className="relative w-full">
      {/* Ambient Brand Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-3xl opacity-25 blur-2xl"
        style={{ background: BRAND_GRADIENT }}
      />

      <div
        className="relative overflow-hidden rounded-3xl p-[3px] shadow-2xl"
        style={{ background: BRAND_GRADIENT }}
      >
        <div className="rounded-[21px] bg-white">
          {/* Top Executive Window Bar */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-white"
            style={{ background: BRAND_GRADIENT }}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF2E9A]" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#00C6FF]" />
              </div>
              <span className="ml-2 text-xs font-extrabold tracking-wide text-white">
                ComplianceHR Infinity · Executive Command Suite
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              LIVE TELEMETRY · 46 MODULES
            </span>
          </div>

          {/* Interactive View Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {VIEWS.map((view) => {
                const active = view.id === activeTab;
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setActiveTab(view.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? 'bg-[#0A2B6D] text-white shadow-xs'
                        : 'bg-white text-[#0A2B6D] hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {view.label}
                  </button>
                );
              })}
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0072FF] hover:text-[#5A00D6]"
            >
              <span>Open Live App</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Main Dashboard Body */}
          <div className="p-4 sm:p-5 space-y-4">
            {/* Score Hero Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#0072FF]/20 bg-gradient-to-r from-[#0A2B6D] via-[#5A00D6] to-[#0072FF] p-4 text-white shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-white/40 bg-white/15 backdrop-blur-xs">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/85">
                      {current.scoreLabel}
                    </span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      2026 NDIS STANDARDS
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-2">
                    <span className="font-editorial text-2xl sm:text-3xl font-extrabold text-white">
                      {current.score}
                    </span>
                    <span className="text-xs font-semibold text-white/90">
                      +2.4% vs last quarter · Audit Pack Ready
                    </span>
                  </div>
                </div>
              </div>
              <Link
                to="/compliance"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-[#0A2B6D] shadow-xs transition hover:bg-slate-50"
              >
                <Award className="h-3.5 w-3.5 text-[#FF2E9A]" />
                <span>Export Board Pack</span>
              </Link>
            </div>

            {/* 4 Live KPI Mini Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {current.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-slate-200/90 bg-white p-3 text-left shadow-2xs transition hover:border-[#0072FF]/40"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-[#0A2B6D]/70 leading-tight">
                      {m.label}
                    </span>
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                  </div>
                  <div className="mt-1.5 font-editorial text-xl font-extrabold text-[#0A2B6D]">
                    {m.value}
                  </div>
                  <div
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold"
                    style={{ color: m.color }}
                  >
                    <TrendingUp className="h-3 w-3" />
                    <span>{m.delta}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Governance & Checkpoint Rows */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                <span className="inline-flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-[#5A00D6]" />
                  <span>Live Governance &amp; Verification Stream</span>
                </span>
                <span className="text-[#0072FF]">Real-Time Sync</span>
              </div>
              <div className="space-y-1.5">
                {current.checkpoints.map((cp) => (
                  <div
                    key={cp.code}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="shrink-0 rounded-md bg-[#0A2B6D] px-2 py-0.5 text-[10px] font-extrabold text-white">
                        {cp.code}
                      </span>
                      <span className="truncate text-xs font-bold text-[#0A2B6D]">
                        {cp.title}
                      </span>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#0072FF]/10 px-2.5 py-0.5 text-[11px] font-extrabold text-[#0072FF]">
                      <CheckCircle2 className="h-3 w-3 text-[#0072FF]" />
                      {cp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom AI Copilot & Security Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#5A00D6]/20 bg-[#5A00D6]/5 px-3.5 py-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-[#0A2B6D]">
                <Sparkles className="h-4 w-4 text-[#FF2E9A]" />
                <span>24/7 AI Compliance Copilot active across all 46 modules</span>
              </div>
              <div className="flex items-center gap-1.5 font-extrabold text-[#5A00D6]">
                <Lock className="h-3.5 w-3.5" />
                <span>Strict Role-Based Security (RLS)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}