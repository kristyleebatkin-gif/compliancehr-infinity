import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const DEFAULT_CHANNEL_SUBTITLES = {
  'auditor-portal': 'Read-only external NDIS auditor view',
  'standards-map': 'Practice Standards & evidence links',
  policies: 'Controlled policies & version history',
  requirements: 'Legislative & statutory obligations',
  'control-centre': '356 audit checks · 98 docs · approvals',
  'one-click-operations': '12 instant executive compliance sweeps',
  'infinity-core-engine': '104 functions · 65 workflows · smart-fill',
  'health-intelligence': '8-pillar readiness & predictive radar',
  'master-checklist': '17 categories & 356 NDIS checkpoints',
  'master-audit-forms': 'Dual A4 master audit checklists',
  'printable-2026-templates': '100+ tailored NDIS & HR templates',
  'screen-audit-2026': '46-screen smart-fill verification',
  audits: 'External & certification audit log',
  'internal-audits': 'Internal audit schedule & findings',
  'audit-report-list': 'Saved A4 audit packs & board PDFs',
  'weekly-audit-reports': 'Automated weekly compliance digests',
  'executive-summary': 'Board-level governance & KPI brief',
  issues: 'Open non-conformities & CAPA register',
  readiness: 'Live readiness gauge & domain scores',
  checklists: 'Operational & onboarding checklists',
  consents: '3-part participant informed consents',
  'form-templates': 'Review & assessment form masters',
  'participant-reviews': '10-weekly & 3-monthly plan reviews',
  'staff-compliance': 'Workforce credential & training matrix',
  'worker-screening': 'NDIS Worker Screening & Blue Card gate',
  'cert-renewals': '90/60/30-day qualification renewals',
  'renewal-calendar': 'Interactive document expiry calendar',
  'onboarding-progress': '100-point staff onboarding tracker',
  'staff-bulk-actions': 'Bulk credential & reminder actions',
  'risk-status': 'ISO 31000 risk register & controls',
  'risk-heatmap': 'Likelihood × consequence matrix',
  'trend-charts': 'Incident, risk & expiry trajectories',
  'kits-drills': 'First aid kits & 6-monthly fire drills',
  visitors: 'Digital visitor sign-in & sign-out log',
  'quick-tasks': 'Rapid compliance task dispatch',
  'task-kanban': 'Visual compliance task board',
  'activity-feed': 'Live platform audit & action stream',
};

export default function ObsidianSmartRemote({
  screenModes = [],
  activeScreenMode,
  onSelectScreenMode,
  banks = [],
  activeBank,
  onSelectBank,
  channels = [],
  activeKey,
  onSelectChannel,
  onConfirmChannel,
  columnsClass = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      {(screenModes.length > 0 || banks.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3.5 py-2.5">
          {banks.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {banks.map((b) => {
                const isBankActive = b.id === activeBank;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBank && onSelectBank(b.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold leading-tight transition ${
                      isBankActive
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          )}

          {screenModes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 ml-auto">
              {screenModes.map((m) => {
                const isModeActive = m.key === activeScreenMode;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => onSelectScreenMode && onSelectScreenMode(m.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold leading-tight transition ${
                      isModeActive
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className={`grid auto-rows-fr gap-2.5 p-3 items-stretch ${columnsClass}`}>
        {channels.map((ch) => {
          const Icon = ch.icon || ShieldCheck;
          const active = ch.key === activeKey;
          const resolvedSub =
            ch.sub || DEFAULT_CHANNEL_SUBTITLES[ch.key] || `${ch.label} workspace`;

          return (
            <button
              key={ch.key}
              type="button"
              onClick={() => {
                if (onSelectChannel) onSelectChannel(ch.key);
                if (onConfirmChannel && active) onConfirmChannel(ch);
              }}
              aria-pressed={active}
              title={`${ch.label} — ${resolvedSub}`}
              className={`group flex h-full flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                active
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-600/20'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                        active ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 text-xs font-bold leading-snug text-slate-900">
                      {ch.label}
                    </span>
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] font-medium leading-snug text-slate-600">
                  {resolvedSub}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-end">
                <ArrowRight className="h-3 w-3 text-indigo-600 transition group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}