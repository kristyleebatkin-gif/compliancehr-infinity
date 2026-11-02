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

      {/* 50% Compact White Header Card with Centred Logo -> Name -> Slogan */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 bg-white px-3 py-1.5">
        <BrandLogoLockup size="xs" theme="light" />
        {(title || subtitle) && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {title && (
              <span
                className="rounded-full px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider text-white"
                style={{ background: BRAND_GRADIENT }}
              >
                ◉ {title}
              </span>
            )}
            {subtitle && (
              <span className="text-[9.5px] font-bold text-[#0A2B6D]/85" style={{ color: '#0A2B6D' }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Optional Dual-Screen & Category Pod Filter Bar (50% Reduced) */}
      {(screenModes.length > 0 || banks.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/15 bg-white/10 px-2.5 py-1.5 backdrop-blur-md">
          {banks.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {banks.map((b) => {
                const isBankActive = b.id === activeBank;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBank && onSelectBank(b.id)}
                    className={`min-h-[24px] rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold leading-tight transition-all ${
                      isBankActive
                        ? 'bg-white text-[#0A2B6D] shadow-[0_0_12px_rgba(0,198,255,0.65)]'
                        : 'border border-white/25 bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <span style={{ color: isBankActive ? '#0A2B6D' : '#FFFFFF' }}>◉ {b.label}</span>
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
                    className={`min-h-[24px] rounded-full px-2.5 py-0.5 text-[9px] font-extrabold leading-tight transition-all ${
                      isModeActive
                        ? 'bg-white text-[#5A00D6] shadow-[0_0_12px_rgba(255,46,154,0.65)]'
                        : 'border border-white/25 bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <span style={{ color: isModeActive ? '#5A00D6' : '#FFFFFF' }}>◉ {m.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Glowing Circular Control Pods on Dark Navy Chassis (50% Compact & Better Data Fit) */}
      <div className={`grid auto-rows-fr gap-1.5 p-2 items-stretch ${columnsClass}`}>
        {channels.map((ch, idx) => {
          const Icon = ch.icon || ShieldCheck;
          const active = ch.key === activeKey;
          const resolvedSub =
            ch.sub || DEFAULT_CHANNEL_SUBTITLES[ch.key] || `${ch.label} workspace`;
          const ringColor = active ? '#00C6FF' : idx % 2 === 0 ? '#00C6FF' : '#FF6EDB';

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
              className={`group flex h-full min-h-[52px] items-center gap-2 rounded-3xl border px-2.5 py-1.5 text-left backdrop-blur-md transition-all duration-200 focus-visible:outline-none ${
                active
                  ? 'border-[#00C6FF] shadow-[0_0_18px_rgba(0,198,255,0.75)] scale-[1.01]'
                  : 'border-white/25 hover:-translate-y-0.5 hover:border-[#00C6FF] hover:shadow-[0_0_12px_rgba(161,0,255,0.5)]'
              }`}
              style={{
                background:
                  'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22) 0%, rgba(10, 43, 109, 0.92) 72%, #061539 100%)',
              }}
            >
              {/* Circular Ring Orb */}
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="88"
                    strokeDashoffset={active ? '6' : '16'}
                  />
                </svg>
                <span
                  className="relative z-10 flex h-5.5 w-5.5 items-center justify-center rounded-full text-white shadow-2xs"
                  style={{ background: BRAND_GRADIENT }}
                >
                  <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                </span>
              </span>

              {/* White Title Pill + Subtitle */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-white px-2 py-0.5 shadow-2xs">
                    <span className="text-[8px] leading-none" style={{ color: ringColor }}>
                      ◉
                    </span>
                    <span
                      className="text-[9.5px] font-extrabold leading-tight text-[#0A2B6D]"
                      style={{ color: '#0A2B6D' }}
                    >
                      {ch.label}
                    </span>
                  </span>

                  <span
                    className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0 text-[6.5px] font-black uppercase ${
                      active ? 'bg-[#00C6FF] text-[#0A2B6D]' : 'bg-white/15 text-white'
                    }`}
                  >
                    {active ? 'ON' : 'LIVE'}
                  </span>
                </div>

                <div className="mt-0.5 flex items-center justify-between gap-1">
                  <span
                    className="min-w-0 flex-1 break-words text-[8.5px] font-bold leading-tight text-white/95"
                    style={{ color: '#E2E8F0' }}
                  >
                    {resolvedSub}
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#00C6FF] transition group-hover:translate-x-0.5" />
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