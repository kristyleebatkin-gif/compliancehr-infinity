import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

const DARK_NAVY_CHASSIS =
  'radial-gradient(circle at 50% 35%, rgba(0, 198, 255, 0.38) 0%, #0072FF 42%, #0A2B6D 85%, #061539 100%)';

const APP_DESIGN_ICON_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

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

      {/* Header Area: Landing Dashboard Blue Behind & Around + White Pills with App-Design-Colour Borders */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/25 px-3 py-2">
        <BrandLogoLockup size="xs" theme="light" />
        {(title || subtitle) && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {title && (
              <span className="rounded-full p-[1.5px] shadow-2xs" style={{ background: BRAND_GRADIENT }}>
                <span
                  className="block rounded-full bg-white px-2.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider"
                  style={{ color: '#5A00D6' }}
                >
                  ◉ {title}
                </span>
              </span>
            )}
            {subtitle && (
              <span className="rounded-full p-[1.5px] shadow-2xs" style={{ background: BRAND_GRADIENT }}>
                <span
                  className="block rounded-full bg-white px-2.5 py-0.5 text-[9px] font-bold"
                  style={{ color: '#0A2B6D' }}
                >
                  {subtitle}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Optional Dual-Screen & Category Pod Filter Bar — White Pills with App-Design-Colour Borders */}
      {(screenModes.length > 0 || banks.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/25 bg-white/10 px-2.5 py-1.5 backdrop-blur-md">
          {banks.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {banks.map((b) => {
                const isBankActive = b.id === activeBank;
                return (
                  <span
                    key={b.id}
                    className="rounded-full p-[1.5px]"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectBank && onSelectBank(b.id)}
                      className={`min-h-[24px] rounded-full bg-white px-2.5 py-0.5 text-[9px] font-extrabold leading-tight transition-all ${
                        isBankActive
                          ? 'shadow-[0_0_12px_rgba(0,198,255,0.75)]'
                          : 'opacity-90 hover:opacity-100'
                      }`}
                    >
                      <span style={{ color: isBankActive ? '#5A00D6' : '#0A2B6D' }}>◉ {b.label}</span>
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {screenModes.length > 0 && (
            <div className="ml-auto flex flex-wrap items-center gap-1">
              {screenModes.map((m) => {
                const isModeActive = m.key === activeScreenMode;
                return (
                  <span
                    key={m.key}
                    className="rounded-full p-[1.5px]"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectScreenMode && onSelectScreenMode(m.key)}
                      className={`min-h-[24px] rounded-full bg-white px-2.5 py-0.5 text-[9px] font-extrabold leading-tight transition-all ${
                        isModeActive
                          ? 'shadow-[0_0_12px_rgba(255,46,154,0.75)]'
                          : 'opacity-90 hover:opacity-100'
                      }`}
                    >
                      <span style={{ color: isModeActive ? '#FF2E9A' : '#0A2B6D' }}>◉ {m.label}</span>
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* All-White Control Pods with App-Design-Colour Borders & Icons in App Design Colour on Landing Blue */}
      <div className={`grid auto-rows-fr gap-1.5 p-2 items-stretch ${columnsClass}`}>
        {channels.map((ch, idx) => {
          const Icon = ch.icon || ShieldCheck;
          const active = ch.key === activeKey;
          const resolvedSub =
            ch.sub || DEFAULT_CHANNEL_SUBTITLES[ch.key] || `${ch.label} workspace`;
          const iconColor = APP_DESIGN_ICON_COLOURS[idx % APP_DESIGN_ICON_COLOURS.length];

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
              className={`group flex h-full min-h-[48px] rounded-3xl p-[2px] text-left transition-all duration-200 focus-visible:outline-none ${
                active
                  ? 'shadow-[0_0_18px_rgba(0,198,255,0.85)] scale-[1.01]'
                  : 'hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(0,198,255,0.5)]'
              }`}
              style={{ background: BRAND_GRADIENT }}
            >
              <div className="flex w-full items-center gap-2 rounded-[22px] bg-white px-2.5 py-1.5">
                {/* Circular Orb with Icon in App Design Colour */}
                <span
                  className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F0FF]"
                  style={{ border: `2px solid ${iconColor}` }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: iconColor }} />
                </span>

                {/* Full White Surface for Clean Word Fit */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="text-[9.5px] font-extrabold leading-tight text-[#0A2B6D]"
                      style={{ color: '#0A2B6D' }}
                    >
                      <span style={{ color: iconColor }}>◉</span> {ch.label}
                    </span>

                    <span
                      className="inline-flex shrink-0 items-center rounded-full border px-1.5 py-0 text-[6.5px] font-black uppercase"
                      style={{
                        borderColor: iconColor,
                        color: active ? '#FF2E9A' : '#5A00D6',
                        backgroundColor: '#F5F0FF',
                      }}
                    >
                      {active ? 'ON' : 'LIVE'}
                    </span>
                  </div>

                  <div className="mt-0.5 flex items-center justify-between gap-1">
                    <span
                      className="min-w-0 flex-1 break-words text-[8px] font-bold leading-tight text-[#5A00D6]"
                      style={{ color: '#5A00D6' }}
                    >
                      {resolvedSub}
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 shrink-0" style={{ color: iconColor }} />
                  </div>
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