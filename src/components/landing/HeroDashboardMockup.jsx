import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, Lock, CheckCircle2,
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

const ROLE_LENSES = [
  {
    id: 'executive',
    label: 'Executive & Admin',
    badge: 'Full 360° OS View',
    kpis: ROW_1_EXECUTIVE_KPIS,
  },
  {
    id: 'compliance',
    label: 'Compliance & Quality',
    badge: '356 Checkpoints & SIRS',
    kpis: [
      { label: 'NDIS Checkpoints', score: '356/356', delta: '100%', status: 'Evidenced', accent: '#0072FF', path: '/compliance' },
      { label: 'SIRS / 24h Timers', score: '0 Overdue', delta: 'SLA Met', status: 'Compliant', accent: '#059669', path: '/incidents' },
      { label: 'Active CAPA Items', score: '14 Open', delta: '100% On Track', status: 'Monitored', accent: '#5A00D6', path: '/quality' },
      { label: 'Policy Attestation', score: '98.8%', delta: '+4.2%', status: 'Signed', accent: '#00C6FF', path: '/documents' },
      { label: 'ISO 31000 Risks', score: '96.8%', delta: 'Controlled', status: 'Reviewed', accent: '#FF2E9A', path: '/risks' },
    ],
  },
  {
    id: 'rostering',
    label: 'Rostering & HR',
    badge: '100-Pt Screening Gate',
    kpis: [
      { label: 'Worker Screening', score: '100%', delta: 'NDIS + WWCC', status: 'Cleared', accent: '#059669', path: '/our-employees' },
      { label: 'Shift Coverage', score: '99.4%', delta: 'This Week', status: 'Filled', accent: '#0072FF', path: '/roster' },
      { label: 'Unscreened Blocks', score: '0 Shifts', delta: 'Gate Active', status: 'Protected', accent: '#5A00D6', path: '/roster' },
      { label: 'Expiring in 30d', score: '3 Certs', delta: 'Alerts Sent', status: 'Tracked', accent: '#D97706', path: '/certificates' },
      { label: 'SCHADS Forecast', score: '97.9%', delta: 'Within Budget', status: 'Aligned', accent: '#00C6FF', path: '/my-payroll' },
    ],
  },
  {
    id: 'auditor',
    label: 'External Auditor',
    badge: 'Consent-Gated Read-Only',
    kpis: [
      { label: 'Consented Dossiers', score: '100%', delta: 'RLS Verified', status: 'Audit Ready', accent: '#059669', path: '/auditor-portal' },
      { label: 'Core Module Evid.', score: '17/17', delta: 'Mapped', status: 'Complete', accent: '#0072FF', path: '/auditor-portal' },
      { label: 'Incident Chain', score: 'Verified', delta: 'Immutable Log', status: 'Traceable', accent: '#5A00D6', path: '/auditor-portal' },
      { label: 'Worker Clearances', score: '100%', delta: 'Expiry Checked', status: 'Current', accent: '#00C6FF', path: '/auditor-portal' },
      { label: '1-Click Audit Pack', score: 'Ready', delta: 'PDF + CSV', status: 'Exportable', accent: '#FF2E9A', path: '/auditor-portal' },
    ],
  },
];

export default function HeroDashboardMockup() {
  const [activeLensId, setActiveLensId] = React.useState('executive');
  const activeLens = ROLE_LENSES.find((l) => l.id === activeLensId) || ROLE_LENSES[0];

  return (
    <div className="w-full rounded-xl border border-white/20 bg-white shadow-2xl overflow-hidden text-[#0A2B6D]">
      {/* Top Two Lines: Line 1 Window Chrome + Badge · Line 2 Role Lenses + Row 1 Label */}
      <div
        className="space-y-2 px-4 py-3 text-white"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF2E9A]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#00C6FF]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#0072FF]" />
            </div>
            <span className="text-xs font-bold tracking-wide text-white">
              Executive &amp; Governance · Sample screen (illustrative data)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-[#00C6FF]">
              <Lock className="h-3 w-3" />
              <span>{activeLens.badge}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-white/15 pt-2">
          <div className="flex flex-wrap items-center gap-1">
            {ROLE_LENSES.map((lens) => {
              const active = lens.id === activeLensId;
              return (
                <button
                  key={lens.id}
                  type="button"
                  onClick={() => setActiveLensId(lens.id)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-extrabold transition ${
                    active
                      ? 'bg-[#00C6FF] text-black shadow-2xs'
                      : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {lens.label}
                </button>
              );
            })}
          </div>
          <span className="text-[11px] font-bold text-[#00C6FF]">
            Row 1 · {activeLens.label} (9 Unified Tiles)
          </span>
        </div>
      </div>

      {/* Unified 9 Tiles Directly Under Executive & Row 1 */}
      <div className="p-4 sm:p-5 space-y-3 bg-[#F8FAFC]">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {activeLens.kpis.map((kpi) => (
            <Link
              key={kpi.label}
              to={kpi.path}
              className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 text-left shadow-2xs transition hover:border-[#0072FF]"
            >
              <div className="text-xs font-bold text-[#0A2B6D] leading-snug">
                {kpi.label}
              </div>
              <div className="mt-1 font-editorial text-xl font-extrabold text-[#0A2B6D] leading-none">
                {kpi.score}
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-1 border-t border-slate-100 pt-1">
                <span className="text-[11px] font-bold" style={{ color: kpi.accent }}>
                  {kpi.status}
                </span>
                <span className="text-[11px] font-medium text-[#0A2B6D]/65">
                  {kpi.delta}
                </span>
              </div>
            </Link>
          ))}
          {ROW_3_OPERATIONAL_PERFORMANCE.map((op) => (
            <Link
              key={op.domain}
              to={op.path}
              className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 text-left shadow-2xs transition hover:border-[#0072FF]"
            >
              <div className="text-xs font-bold text-[#0A2B6D] leading-snug">
                {op.domain}
              </div>
              <div className="mt-1 font-editorial text-lg font-extrabold text-[#0072FF] leading-none">
                {op.metric}
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-1 border-t border-slate-100 pt-1">
                <span className="text-[11px] font-semibold text-[#0A2B6D]/75 truncate">
                  {op.sub}
                </span>
                <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-[#5A00D6]">
                  <CheckCircle2 className="h-3 w-3 text-[#0072FF]" />
                  <span>{op.status}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Bar: Interactive Role Switcher & Open Live Workspace Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {ROLE_LENSES.map((lens) => {
            const active = lens.id === activeLensId;
            return (
              <button
                key={lens.id}
                type="button"
                onClick={() => setActiveLensId(lens.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition ${
                  active
                    ? 'text-white shadow-2xs'
                    : 'border border-slate-200 bg-slate-50 text-[#0A2B6D] hover:border-[#0072FF]'
                }`}
                style={
                  active
                    ? { background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)' }
                    : undefined
                }
              >
                {lens.label}
              </button>
            );
          })}
        </div>

        <Link
          to={activeLensId === 'auditor' ? '/auditor-portal' : '/dashboard'}
          className="inline-flex items-center gap-1 rounded-lg bg-[#0A2B6D] px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
        >
          <span>Open Live Workspace</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-[#00C6FF]" />
        </Link>
      </div>
    </div>
  );
}