import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const DARK_NAVY_CHASSIS =
  'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)';

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
 * Remote Control + Command Centre + Glassmorphism iPad Screen Suite:
 * - White title backgrounds
 * - Blue -> Purple -> Pink gradients
 * - Rounded "remote buttons"
 * - LED active glow
 * - Glass cards on Dark navy background
 * - Enterprise spacing, large touch targets, consistent button sizes
 * - Status indicators on every module
 * - BrandLogoLockup (Logo top -> Name middle -> Slogan bottom, all centred)
 */
export default function ObsidianSmartRemote({
  compact = false,
  title = '',
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
  confirmHref,
  confirmLabel,
  columnsClass = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
}) {
  return (
    <section
      className="preserve-island-theme overflow-hidden rounded-2xl border-2 border-[#0A2B6D] shadow-xl"
      style={{ background: DARK_NAVY_CHASSIS }}
    >
      {/* Top Blue -> Purple -> Pink Gradient Strip */}
      <div className="h-1.5 w-full" style={{ background: BRAND_GRADIENT }} />

      {/* White Title Header Card with Larger Readable Centred Logo -> Name -> Slogan */}
      <div className="flex flex-col items-center justify-center border-b border-white/15 bg-white px-3 py-2.5 text-center">
        <BrandLogoLockup size={compact ? 'sm' : 'md'} theme="light" />
        {(title || subtitle) && (
          <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
            {title && (
              <span
                className="rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-white"
                style={{ background: BRAND_GRADIENT }}
              >
                {title}
              </span>
            )}
            {subtitle && (
              <span className="text-[10px] font-bold text-[#0A2B6D]/85" style={{ color: '#0A2B6D' }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Optional Dual-Screen & Category Filter Bar */}
      {(screenModes.length > 0 || banks.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 bg-white/10 px-3 py-2 backdrop-blur-md">
          {banks.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {banks.map((b) => {
                const isBankActive = b.id === activeBank;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBank && onSelectBank(b.id)}
                    className={`min-h-[30px] rounded-xl px-2.5 py-1 text-[10.5px] font-extrabold leading-tight transition-all ${
                      isBankActive
                        ? 'bg-white text-[#0A2B6D] shadow-[0_0_12px_rgba(0,198,255,0.6)]'
                        : 'border border-white/25 bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <span style={{ color: isBankActive ? '#0A2B6D' : '#FFFFFF' }}>{b.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {screenModes.length > 0 && (
            <div className="ml-auto flex flex-wrap items-center gap-1">
              {screenModes.map((m) => {
                const isModeActive = m.key === activeScreenMode;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => onSelectScreenMode && onSelectScreenMode(m.key)}
                    className={`min-h-[28px] rounded-xl px-2.5 py-1 text-[10px] font-extrabold leading-tight transition-all ${
                      isModeActive
                        ? 'bg-white text-[#5A00D6] shadow-[0_0_12px_rgba(255,46,154,0.6)]'
                        : 'border border-white/25 bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <span style={{ color: isModeActive ? '#5A00D6' : '#FFFFFF' }}>{m.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Glassmorphic Remote Control Buttons on Dark Navy Chassis */}
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
              className={`group flex h-full min-h-[84px] flex-col rounded-2xl p-[2px] text-left transition-all duration-200 focus-visible:outline-none ${
                active
                  ? 'shadow-[0_0_20px_rgba(0,198,255,0.75)] scale-[1.01]'
                  : 'hover:-translate-y-0.5 hover:shadow-[0_0_14px_rgba(161,0,255,0.5)]'
              }`}
              style={{ background: BRAND_GRADIENT }}
            >
              {/* Glass Card Body */}
              <div className="flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[14px] bg-[#0A2B6D]/90 backdrop-blur-md">
                {/* White Title Background */}
                <div className="flex min-h-[36px] w-full items-center justify-between gap-1.5 bg-white px-2.5 py-1.5">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs"
                      style={{ background: BRAND_GRADIENT }}
                    >
                      <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    </span>
                    <span
                      className="min-w-0 text-[10px] font-extrabold leading-tight tracking-tight text-[#0A2B6D]"
                      style={{ color: '#0A2B6D' }}
                    >
                      {ch.label}
                    </span>
                  </div>

                  {/* Status Indicator + LED Active Glow */}
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[7.5px] font-black uppercase tracking-wider ${
                      active
                        ? 'bg-[#0A2B6D] text-[#00C6FF]'
                        : 'bg-[#F5F0FF] text-[#5A00D6]'
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: active ? '#00C6FF' : '#FF2E9A',
                        boxShadow: active
                          ? '0 0 8px 2px #00C6FF'
                          : '0 0 5px 1px #FF2E9A',
                      }}
                    />
                    {active ? 'ACTIVE' : 'LIVE'}
                  </span>
                </div>

                {/* Dark Navy Glassmorphic Detail Area */}
                <div className="flex min-h-[36px] w-full flex-1 items-center justify-between gap-1.5 px-2.5 py-1.5">
                  <span
                    className="min-w-0 flex-1 break-words text-[9.5px] font-bold leading-snug text-white/95"
                    style={{ color: '#FFFFFF' }}
                  >
                    {resolvedSub}
                  </span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-[#00C6FF] transition group-hover:translate-x-0.5" />
                </div>

                {/* iPad LED Home Bar */}
                <div className="flex h-[5px] w-full items-center justify-center pb-0.5">
                  <span
                    className={`h-[2.5px] rounded-full transition-all ${
                      active ? 'w-9 bg-[#00C6FF] shadow-[0_0_8px_#00C6FF]' : 'w-6 bg-white/40 group-hover:bg-white/80'
                    }`}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {confirmHref && (
        <div className="flex items-center justify-end border-t border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-md">
          <Link
            to={confirmHref}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1 text-[10px] font-extrabold text-[#0A2B6D] shadow-sm transition hover:bg-[#F5F0FF]"
          >
            <span style={{ color: '#0A2B6D' }}>{confirmLabel || 'Open Selected Screen'}</span>
            <ArrowRight className="h-3 w-3 text-[#5A00D6]" />
          </Link>
        </div>
      )}
    </section>
  );
}