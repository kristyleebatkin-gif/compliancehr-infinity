import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const DARK_NAVY_CHASSIS =
  'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)';

const APP_DESIGN_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

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
  audits: 'Scheduled & completed external audits',
  'internal-audits': 'Internal quality & practice audits',
  'audit-report-list': 'Archived formal audit reports',
  'weekly-audit-reports': 'Automated weekly compliance digests',
  'form-templates': 'Customisable digital intake & review forms',
  checklists: 'Operational & safety compliance checklists',
  consents: 'Participant & employee consent register',
  issues: 'Open non-conformances & corrective actions',
  'participant-reviews': 'Scheduled participant plan reviews',
  'onboarding-tracker': 'New starter screening & induction progress',
  visitors: 'Site sign-in / sign-out & WHS log',
  'kit-drills': 'First aid kit & emergency drill checks',
  'staff-matrix': 'Live employee credential matrix',
  'participant-matrix': 'Live participant folder completeness',
  'control-evidence': 'Mapped evidence per NDIS control',
  'renewal-calendar': 'Upcoming document & clearance renewals',
  'certification-calendar': 'Staff certificate expiry calendar',
  'risk-heatmap': '5×5 likelihood & consequence matrix',
  'safety-trend': 'Incident & hazard trend analytics',
  'staff-chart': 'Workforce compliance breakdown chart',
  acknowledgements: 'Staff policy read & sign-off tracking',
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

      {/* Optional Title & Subtitle Strip (Every Word Pill Framed with App Design Coloured Border on White) */}
      {(title || subtitle) && (
        <div className="flex flex-wrap items-center justify-center gap-2 bg-white px-3 py-1.5 text-center">
          {title && (
            <span
              className="inline-flex rounded-full p-[1.5px]"
              style={{ background: BRAND_GRADIENT }}
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold">
                <span style={{ color: '#0072FF' }}>◉</span>
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)',
                  }}
                >
                  {title}
                </span>
              </span>
            </span>
          )}
          {subtitle && (
            <span
              className="inline-flex items-center gap-1 rounded-full border-2 border-[#5A00D6] bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]"
              style={{ color: '#0A2B6D' }}
            >
              <span style={{ color: '#5A00D6' }}>◉</span>
              <span>{subtitle}</span>
            </span>
          )}
        </div>
      )}

      {/* Optional Dual-Screen & Category Filter Bar */}
      {(screenModes.length > 0 || banks.length > 0) && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
          style={{ background: DARK_NAVY_CHASSIS }}
        >
          {banks.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {banks.map((b, bIdx) => {
                const active = b.id === activeBank;
                const bColor = APP_DESIGN_COLOURS[bIdx % APP_DESIGN_COLOURS.length];
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBank && onSelectBank(b.id)}
                    className={`min-h-[28px] rounded-xl border px-2.5 py-1 text-[10px] font-extrabold transition-all ${
                      active
                        ? 'border-[#00C6FF] bg-white text-[#0A2B6D] shadow-[0_0_12px_rgba(0,198,255,0.65)]'
                        : 'border-white/25 bg-[#0A2B6D] text-white hover:border-[#00C6FF]'
                    }`}
                    style={{ color: active ? '#0A2B6D' : '#FFFFFF' }}
                  >
                    <span style={{ color: bColor }}>◉</span> {b.label}
                  </button>
                );
              })}
            </div>
          )}

          {screenModes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {screenModes.map((m, mIdx) => {
                const modeKey = m.id || m.key;
                const active = modeKey === activeScreenMode;
                const mColor = APP_DESIGN_COLOURS[mIdx % APP_DESIGN_COLOURS.length];
                return (
                  <button
                    key={modeKey}
                    type="button"
                    onClick={() => onSelectScreenMode && onSelectScreenMode(modeKey)}
                    className={`min-h-[28px] rounded-xl border px-2.5 py-1 text-[10px] font-extrabold transition-all ${
                      active
                        ? 'border-[#FF2E9A] bg-white text-[#0A2B6D] shadow-[0_0_12px_rgba(255,46,154,0.65)]'
                        : 'border-white/25 bg-[#0A2B6D] text-white hover:border-[#FF2E9A]'
                    }`}
                    style={{ color: active ? '#0A2B6D' : '#FFFFFF' }}
                  >
                    <span style={{ color: mColor }}>◉</span> {m.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BOTTOM 3/4 DARK BLUE: Illuminated Modular Buttons (Top 1/4 White + Bottom 3/4 Dark Blue, App Design Colour Symbols) */}
      <div
        className={`grid auto-rows-fr gap-2.5 p-3 items-stretch ${columnsClass}`}
        style={{ background: DARK_NAVY_CHASSIS }}
      >
        {channels.map((ch, idx) => {
          const Icon = ch.icon || ShieldCheck;
          const active = ch.key === activeKey;
          const symColor = APP_DESIGN_COLOURS[idx % APP_DESIGN_COLOURS.length];
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
              className={`group flex h-full min-h-[72px] flex-col rounded-2xl p-[2px] text-left transition-all duration-200 focus-visible:outline-none ${
                active
                  ? 'shadow-[0_0_20px_rgba(0,198,255,0.85)] scale-[1.01]'
                  : 'shadow-[0_0_12px_rgba(90,0,214,0.35)] hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(0,198,255,0.7)]'
              }`}
              style={{ background: BRAND_GRADIENT }}
            >
              {/* Card Body: Top 1/4 White + Bottom 3/4 Dark Blue */}
              <div
                className="flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[14px]"
                style={{ background: DARK_NAVY_CHASSIS }}
              >
                {/* Top 1/4 White Title Background with App-Design-Colour Symbol */}
                <div className="flex min-h-[34px] w-full items-center justify-between gap-1.5 bg-white px-2.5 py-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#F5F0FF] shadow-2xs"
                      style={{ border: `1.5px solid ${symColor}` }}
                    >
                      <Icon className="h-3 w-3 shrink-0" style={{ color: symColor }} />
                    </span>
                    <span
                      className="min-w-0 bg-clip-text text-[10.5px] font-extrabold leading-tight tracking-tight text-transparent"
                      style={{
                        backgroundImage:
                          'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)',
                      }}
                    >
                      <span style={{ color: symColor }}>◉</span> {ch.label}
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
                        backgroundColor: active ? '#00C6FF' : symColor,
                        boxShadow: active
                          ? '0 0 8px 2px #00C6FF'
                          : `0 0 5px 1px ${symColor}`,
                      }}
                    />
                    {active ? 'ACTIVE' : ch.status || 'LIVE'}
                  </span>
                </div>

                {/* Bottom 3/4 Dark Blue Body */}
                <div className="flex min-h-[34px] w-full flex-1 items-center justify-between gap-1.5 px-2.5 py-1.5">
                  <span
                    className="min-w-0 flex-1 break-words text-[9px] font-bold leading-snug text-white"
                    style={{ color: '#FFFFFF' }}
                  >
                    {resolvedSub}
                  </span>
                  <ArrowRight className="h-3 w-3 shrink-0 transition group-hover:translate-x-0.5" style={{ color: symColor }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {confirmHref && (
        <div className="flex justify-end px-3 py-2" style={{ background: DARK_NAVY_CHASSIS }}>
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