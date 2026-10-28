import React from 'react';
import { getHeaderView } from '@/lib/fullColourTiles';
import { Image } from '@/components/ui/image';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 42%, #A100FF 68%, #FF2E9A 100%)';

const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

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

/**
 * Page Navigation — Small logo at top, platform name below logo, optional category/screen filters,
 * and iPad-style screens underneath visually matching Quick Access.
 */
export default function ObsidianSmartRemote({
  subtitle = 'Interactive workspace screens',
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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
      {/* Top Brand Gradient Strip Matching Quick Access */}
      <div className="h-1 w-full" style={{ background: BRAND_GRADIENT }} />

      {/* Small Logo at Top + Platform Name Below Logo */}
      <div className="flex flex-col items-center px-3.5 pb-1.5 pt-2.5 text-center sm:px-4">
        <Image
          src={CHR_LOGO}
          alt="ComplianceHR Infinity"
          fittingType="fit"
          className="h-7 w-7 rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs"
        />
        <span className="mt-1 font-editorial text-[12px] font-extrabold leading-tight tracking-tight text-[#0A2B6D]">
          Compliance
          <span className="font-editorial-italic text-[#5A00D6]">HR</span>{' '}
          <span className="bg-gradient-to-r from-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
            Infinity
          </span>
        </span>
      </div>

      {/* Optional Dual-Screen & Category Filter Bar (Used on Compliance Hub) */}
      {(screenModes.length > 0 || banks.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-y border-slate-100 bg-slate-50/70 px-3 py-2">
          {banks.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {banks.map((b) => {
                const isBankActive = b.id === activeBank;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBank && onSelectBank(b.id)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold leading-tight transition ${
                      isBankActive
                        ? 'bg-[#0A2B6D] text-white shadow-2xs'
                        : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF] hover:text-[#0072FF]'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          )}

          {screenModes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 ml-auto">
              {screenModes.map((m) => {
                const isModeActive = m.key === activeScreenMode;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => onSelectScreenMode && onSelectScreenMode(m.key)}
                    className={`rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold leading-tight transition ${
                      isModeActive
                        ? 'bg-[#5A00D6] text-white shadow-2xs'
                        : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#5A00D6]'
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

      {/* Screens / Modules Underneath — Visually Matching Quick Access */}
      <div className={`grid auto-rows-fr gap-2.5 p-3 pt-2.5 items-stretch ${columnsClass}`}>
        {channels.map((ch, idx) => {
          const Icon = ch.icon || ShieldCheck;
          const active = ch.key === activeKey;
          const headerBg = getHeaderView(idx);
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
              className={`group flex h-full min-h-[100px] flex-col gap-[3px] rounded-xl border-2 bg-[#0A2B6D] p-[3px] text-left transition-all duration-200 focus-visible:outline-none ${
                active
                  ? 'border-[#5A00D6] shadow-md ring-2 ring-[#5A00D6]/25 ring-offset-1'
                  : 'border-[#0A2B6D] hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md'
              }`}
            >
              {/* Screen */}
              <div className="flex w-full flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
                {/* Coloured Header Inside Screen */}
                <div
                  className="flex min-h-[40px] w-full items-center justify-between gap-1.5 px-2 py-1.5 text-white"
                  style={{ background: headerBg }}
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    <span
                      className="min-w-0 text-[10px] font-extrabold leading-[12px] tracking-tight text-white"
                      style={{ color: '#FFFFFF', wordBreak: 'normal', overflowWrap: 'normal' }}
                    >
                      {ch.label}
                    </span>
                  </div>
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      active ? 'bg-[#00C6FF]' : 'bg-white/75'
                    }`}
                  />
                </div>

                {/* White Writing Area With Supporting Detail */}
                <div className="flex min-h-[42px] w-full flex-1 items-center justify-between gap-1.5 border-t border-[#0A2B6D]/10 bg-white px-2 py-1.5">
                  <span className="min-w-0 flex-1 break-words text-[10px] font-bold leading-[12.5px] text-[#0A2B6D]/85">
                    {resolvedSub}
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5 group-hover:text-[#FF2E9A]" />
                </div>
              </div>

              {/* iPad Home Indicator Bar */}
              <div className="flex h-[5px] w-full items-center justify-center">
                <span
                  className={`h-[2.5px] w-6 rounded-full transition-all ${
                    active ? 'w-8 bg-[#00C6FF]' : 'bg-white/45 group-hover:bg-white/80'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}