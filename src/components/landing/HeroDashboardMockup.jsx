import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, Users, FileCheck2, Activity,
  ArrowUpRight, Lock, CheckCircle2, Clock,
} from 'lucide-react';

// ROW 1 — 5 Mandatory Executive KPIs
const ROW_1_EXECUTIVE_KPIS = [
  { label: 'Organisation Health', score: '98.4%', delta: '+2.1%', status: 'Optimal', accent: '#00C6FF', path: '/dashboard' },
  { label: 'Compliance Score', score: '99.2%', delta: '356/356', status: 'Verified', accent: '#0072FF', path: '/compliance' },
  { label: 'Risk Score', score: '96.8%', delta: 'ISO 31000', status: 'Controlled', accent: '#5A00D6', path: '/risks' },
  { label: 'Workforce Score', score: '100%', delta: '100-Pt Gate', status: 'Cleared', accent: '#00C6FF', path: '/our-employees' },
  { label: 'Quality Score', score: '98.9%', delta: 'CIR Active', status: 'Compliant', accent: '#FF2E9A', path: '/quality' },
];

// ROW 2 — 5 Mandatory Attention Required Items
const ROW_2_ATTENTION_REQUIRED = [
  { label: 'Critical Incidents', value: '1 Active', detail: '24h Commission timer armed', tone: '#FF2E9A', path: '/incidents' },
  { label: 'High Risks', value: '2 Monitored', detail: 'Controls verified on schedule', tone: '#5A00D6', path: '/risks' },
  { label: 'Overdue Actions', value: '0 Overdue', detail: '100% CAPA SLA compliance', tone: '#0072FF', path: '/tasks' },
  { label: 'Expiring Credentials', value: '3 in 30d', detail: 'Auto-reminders dispatched', tone: '#00C6FF', path: '/certificates' },
  { label: 'Compliance Gaps', value: '0 Open', detail: 'All 17 categories evidenced', tone: '#0072FF', path: '/compliance' },
];

// ROW 3 — Operational Performance & Live Registers
const ROW_3_OPERATIONAL_PERFORMANCE = [
  { domain: 'Participant Care & Consents', metric: '48 Active Plans', sub: '100% 3-Part Consents Signed', status: 'Verified', path: '/our-participants' },
  { domain: 'Smart Rostering & Screening Gate', metric: '0 Unscreened Shifts', sub: 'NDIS Worker Screening & Blue Card', status: 'Enforced', path: '/roster' },
  { domain: '45 Self-Maintaining Registers', metric: '100% Synced', sub: 'Single-entry evidence routing', status: 'Live', path: '/registers' },
  { domain: 'External Auditor Portal', metric: 'Consent-Gated', sub: 'Read-only RLS evidence verification', status: 'Ready', path: '/auditor-portal' },
];

export default function HeroDashboardMockup() {
  return (
    <div className="w-full rounded-xl border border-white/20 bg-white shadow-2xl overflow-hidden text-[#0A2B6D]">
      {/* Top Window Chrome (Microsoft Purview / ServiceNow GRC Standard) */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-white"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF2E9A]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#00C6FF]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#0072FF]" />
          </div>
          <span className="text-xs font-bold tracking-wide text-white">
            ComplianceHR Infinity · Executive GRC Command Centre
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-[#00C6FF]">
            <Lock className="h-3 w-3" />
            <span>RLS Enforced</span>
          </span>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1 text-xs font-bold text-[#0A2B6D] transition hover:bg-slate-100"
          >
            <span style={{ color: '#0A2B6D' }}>Open Live Workspace</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#0072FF]" />
          </Link>
        </div>
      </div>

      {/* Main 3-Row Enterprise Dashboard Body */}
      <div className="p-4 sm:p-5 space-y-4 bg-[#F8FAFC]">
        {/* ROW 1: Executive KPIs */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
              Row 1 · Executive Governance KPIs
            </span>
            <span className="text-xs font-semibold text-[#5A00D6]">
              Live Organisational Telemetry
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {ROW_1_EXECUTIVE_KPIS.map((kpi) => (
              <Link
                key={kpi.label}
                to={kpi.path}
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 text-left shadow-2xs transition hover:border-[#0072FF]"
              >
                <div className="text-xs font-semibold text-[#0A2B6D]/80 leading-snug">
                  {kpi.label}
                </div>
                <div className="mt-1.5 font-editorial text-xl font-extrabold text-[#0A2B6D] leading-none">
                  {kpi.score}
                </div>
                <div className="mt-2 flex items-center justify-between gap-1 border-t border-slate-100 pt-1.5">
                  <span className="text-xs font-semibold" style={{ color: kpi.accent }}>
                    {kpi.status}
                  </span>
                  <span className="text-xs font-medium text-[#0A2B6D]/65">
                    {kpi.delta}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ROW 2: Attention Required */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
              Row 2 · Attention Required &amp; SLA Monitors
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0072FF]">
              <Clock className="h-3.5 w-3.5" />
              <span>24h / 5d Statutory Watch</span>
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
            {ROW_2_ATTENTION_REQUIRED.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-[#0072FF]"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-[#0A2B6D]/80 leading-snug">
                    {item.label}
                  </span>
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.tone }}
                  />
                </div>
                <div className="mt-1 text-sm font-extrabold text-[#0A2B6D]">
                  {item.value}
                </div>
                <div className="mt-1 text-xs font-normal text-[#0A2B6D]/70 leading-snug">
                  {item.detail}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ROW 3: Operational Performance */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
              Row 3 · Operational Performance &amp; Evidence Registers
            </span>
            <Link to="/registers" className="text-xs font-bold text-[#0072FF] hover:underline">
              View All 45 Registers →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {ROW_3_OPERATIONAL_PERFORMANCE.map((op) => (
              <Link
                key={op.domain}
                to={op.path}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-left transition hover:border-[#0072FF]"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#0A2B6D]">
                    {op.domain}
                  </div>
                  <div className="mt-0.5 text-xs font-normal text-[#0A2B6D]/75">
                    {op.sub}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs font-extrabold text-[#0072FF]">
                    {op.metric}
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-[#5A00D6]">
                    <CheckCircle2 className="h-3 w-3 text-[#0072FF]" />
                    <span>{op.status}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}