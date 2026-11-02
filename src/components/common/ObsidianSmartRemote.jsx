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
  'screen-audit-2026': '46-screen smart verification matrix',
  'audits': 'Scheduled & completed external audits',
  'internal-audits': 'Internal quality & practice audits',
  'audit-report-list': 'Archived formal audit reports',
  'weekly-audit-reports': 'Automated weekly compliance digests',
  'form-templates': 'Customisable digital intake & review forms',
  'checklists': 'Operational & safety compliance checklists',
  'consents': 'Participant & employee consent register',
  'issues': 'Open non-conformances & corrective actions',
  'participant-reviews': 'Scheduled participant plan reviews',
  'onboarding-tracker': 'New starter screening & induction progress',
  'visitors': 'Site sign-in / sign-out & WHS log',
  'kit-drills': 'First aid kit & emergency drill checks',
  'staff-matrix': 'Live employee credential matrix',
  'participant-matrix': 'Live participant folder completeness',
  'control-evidence': 'Mapped evidence per NDIS control',
  'renewal-calendar': 'Upcoming document & clearance renewals',
  'certification-calendar': 'Staff certificate expiry calendar',
  'risk-heatmap': '5×5 likelihood & consequence matrix',
  'safety-trend': 'Incident & hazard trend analytics',
  'staff-chart': 'Workforce compliance breakdown chart',
  'acknowledgements': 'Staff policy read & sign-off tracking',
  'policy-versions': 'Historical policy version control',
  'activity-feed': 'Real-time compliance audit trail',
  'bulk-actions': 'Bulk compliance reminders & updates',
  'global-search': 'Search across all compliance registers',
  'executive-summary': 'Board-ready compliance posture summary',
  'enterprise-standard': '10-stage enterprise completeness gate',
};

export default function ObsidianSmartRemote({
  title = '',
  subtitle = '',
  channels = [],
  activeKey = '',
  onSelectChannel,
  onConfirmChannel,
  confirmHref = '',
  confirmLabel = '',
  banks = [],
  activeBank = '',
  onSelectBank,
  screenModes = [],
  activeScreenMode = '',
  onSelectScreenMode,
  compact = false,
  columnsClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
}) {
  return (
    <section
      className="preserve-island-theme overflow-hidden rounded-2xl border-2 border-[#0A2B6D] shadow-xl"
      style={{ background: DARK_NAVY_CHASSIS }}
    >
      {/* Top Blue -> Purple -> Pink Gradient Strip */}
      <div className="h-1.5 w-full" style={{ background: BRAND_GRADIENT }} />

      {/* TOP 1/4 WHITE: Title Header Card with Centred Logo -> Name -> Slogan */}
      <div className="flex flex-col items-center justify-center border-b border-white/15 bg-white px-3 py-2 text-center">
        <BrandLogoLockup size={compact ? 'xs' : 'sm'} theme="light" showSlogan={true} />
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
                const active = b.id === activeBank;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBank && onSelectBank(b.id)}
                    className={`min-h-[28px] rounded-xl border px-2.5 py-1 text-[10px] font-extrabold transition-all ${
                      active
                        ? 'border-[#00C6FF] bg-white text-[#0A2B6D] shadow-[0_0_12px_rgba(0,198,255,0.65)]'
                        : 'border-white/25 bg-[#0A2B6D]/80 text-white hover:border-[#00C6FF] hover:bg-[#0A2B6D]'
                    }`}
                    style={{ color: active ? '#0A2B6D' : '#FFFFFF' }}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          )}

          {screenModes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {screenModes.map((m) => {
                const active = m.id === activeScreenMode;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectScreenMode && onSelectScreenMode(m.id)}
                    className={`min-h-[28px] rounded-xl border px-2.5 py-1 text-[10px] font-extrabold transition-all ${
                      active
                        ? 'border-[#FF2E9A] bg-white text-[#0A2B6D] shadow-[0_0_12px_rgba(255,46,154,0.65)]'
                        : 'border-white/25 bg-[#0A2B6D]/80 text-white hover:border-[#FF2E9A]'
                    }`}
                    style={{ color: active ? '#0A2B6D' : '#FFFFFF' }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BOTTOM 3/4 DARK BLUE: Glassmorphic Remote Control Buttons (Each Button Has Top 1/4 White + Bottom 3/4 Dark Blue) */}
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
              className={`group flex h-full min-h-[78px] flex-col rounded-2xl p-[2px] text-left transition-all duration-200 focus-visible:outline-none ${
                active
                  ? 'shadow-[0_0_20px_rgba(0,198,255,0.75)] scale-[1.01]'
                  : 'hover:-translate-y-0.5 hover:shadow-[0_0_14px_rgba(161,0,255,0.5)]'
              }`}
              style={{ background: BRAND_GRADIENT }}
            >
              {/* Glass Card Body */}
              <div className="flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[14px] bg-[#0A2B6D]/90 backdrop-blur-md">
                {/* Top 1/4 White Title Background */}
                <div className="flex min-h-[34px] w-full items-center justify-between gap-1.5 bg-white px-2.5 py-1">
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
                      active ? 'bg-[#0A2B6D] text-[#00C6FF]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: active ? '#00C6FF' : '#FF2E9A',
                        boxShadow: active
                          ? '0 0 8px 2px #00C6FF'
                          : '0 0 4px 1px #FF2E9A',
                      }}
                    />
                    {active ? 'ACTIVE' : ch.status || 'LIVE'}
                  </span>
                </div>

                {/* Bottom 3/4 Dark Navy Glassmorphic Body */}
                <div className="flex min-h-[34px] w-full flex-1 items-center justify-between gap-1.5 px-2.5 py-1.5">
                  <span
                    className="min-w-0 flex-1 break-words text-[9px] font-bold leading-snug text-white/95"
                    style={{ color: '#FFFFFF' }}
                  >
                    {resolvedSub}
                  </span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-[#00C6FF] transition group-hover:translate-x-0.5" />
                </div>

                {/* iPad LED Home Indicator Bar */}
                <div className="flex h-[5px] w-full items-center justify-center pb-0.5">
                  <span
                    className={`h-[2.5px] rounded-full transition-all ${
                      active
                        ? 'w-9 bg-[#00C6FF] shadow-[0_0_8px_#00C6FF]'
                        : 'w-6 bg-white/40 group-hover:bg-white/80'
                    }`}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {confirmHref && (
        <div className="flex justify-end border-t border-white/15 bg-white/10 px-3 py-2">
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