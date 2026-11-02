import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, ChevronDown, ChevronUp, Cpu, ArrowRight } from 'lucide-react';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import { MODULE_DIRECTORY, NAV_GROUPS } from '@/lib/moduleDirectory';
import { useRole } from '@/lib/useRole';
import { canAccessNav } from '@/lib/roles';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

const LANDING_TOP_LOGO_BLUE =
  'radial-gradient(circle at 50% 35%, rgba(0, 198, 255, 0.42) 0%, #0072FF 44%, #0A2B6D 86%, #061539 100%)';

const DARK_NAVY_CHASSIS =
  'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #131B4D 100%)';

const APP_DESIGN_ICON_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

const POD_LIVE_BADGES = {
  '1. Dashboard & Executive Command': { short: '1. Dashboard & Executive', metric: '2 actions due', ring: '#0072FF', pct: 94 },
  '2. People, Intake & Profiles': { short: '2. People, Intake & Profiles', metric: '7 reviews due', ring: '#5A00D6', pct: 90 },
  '3. Communications & Workforce': { short: '3. Comms & Workforce', metric: '12 shifts today', ring: '#0072FF', pct: 92 },
  '4. Incidents, Risk & Safety': { short: '4. Incidents, Risk & Safety', metric: '1 critical', ring: '#FF2E9A', pct: 96, pulse: true },
  '5. Compliance, Quality & Evidence': { short: '5. Compliance & Quality', metric: '2 actions due', ring: '#A100FF', pct: 95 },
  '6. Training & Capability': { short: '6. Training & Capability', metric: '3 certs due', ring: '#FF2E9A', pct: 89 },
  '7. Finance & Commercial': { short: '7. Finance & Commercial', metric: '99.4% matched', ring: '#0072FF', pct: 94 },
  '8. Human Resources': { short: '8. Human Resources Hub', metric: '100% screened', ring: '#5A00D6', pct: 96 },
  '9. CRM, Growth & Relationships': { short: '9. CRM & Relationships', metric: 'Active leads', ring: '#A100FF', pct: 91 },
  '10. Governance & Strategy': { short: '10. Governance & Strategy', metric: 'Board ready', ring: '#0072FF', pct: 95 },
  '11. NDIS & Regulatory': { short: '11. NDIS & Regulatory', metric: '8 standards', ring: '#5A00D6', pct: 98 },
  '12. Community & Support Services': { short: '12. Community & Support', metric: 'Local hub', ring: '#FF2E9A', pct: 90 },
  '13. Help, Knowledge & Support': { short: '13. Help & User Guides', metric: '46 guides', ring: '#0072FF', pct: 100 },
};

export default function QuickAppBar() {
  const location = useLocation();
  const { role } = useRole();
  const [selectedGroup, setSelectedGroup] = useState(null);

  const quickGroups = NAV_GROUPS.map((group, colourIndex) => ({
    ...group,
    colourIndex,
    modules: group.keys
      .map((key) => MODULE_DIRECTORY.find((module) => module.key === key))
      .filter((module) => module && canAccessNav(role, module.key)),
  })).filter((group) => group.modules.length);

  const expandedGroup = quickGroups.find((group) => group.label === selectedGroup);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setSelectedGroup(null);
  }, [location.pathname]);

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-3 pt-1 sm:px-5 lg:px-6">
      <section
        className="preserve-island-theme overflow-hidden rounded-2xl border-2 border-[#0A2B6D] shadow-lg"
        style={{ background: DARK_NAVY_CHASSIS }}
      >
        <div className="h-1.5 w-full" style={{ background: BRAND_GRADIENT }} />

        {/* Very Top Logo Section ONLY: Landing-Page Dashboard Blue Around Enlarged Logo & Fitted Slogan */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0072FF] px-3 py-2"
          style={{ background: LANDING_TOP_LOGO_BLUE }}
        >
          <div className="flex items-center gap-2">
            <div
              className="rounded-full p-[1.5px] shadow-2xs"
              style={{ background: BRAND_GRADIENT }}
            >
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5">
                <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: '#0072FF' }} />
                <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#0A2B6D' }}>
                  ◉ REMOTE NAVIGATOR ROUTER
                </span>
              </div>
            </div>
          </div>

          <BrandLogoLockup size="xs" theme="light" showSlogan={true} />

          <div
            className="rounded-full p-[1.5px] shadow-2xs"
            style={{ background: BRAND_GRADIENT }}
          >
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[9.5px] font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
            >
              {collapsed ? (
                <ChevronDown className="h-3.5 w-3.5" style={{ color: '#5A00D6' }} />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" style={{ color: '#5A00D6' }} />
              )}
              <span style={{ color: '#0A2B6D' }}>{collapsed ? 'Show 13 Pods' : 'Hide'}</span>
            </button>
          </div>
        </div>

        {/* Dark Blue Chassis Below Top Logo Header + Slightly Larger 13 Main Modular All-White Buttons */}
        {!collapsed && (
          <div className="p-2 sm:p-2.5" style={{ background: DARK_NAVY_CHASSIS }}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 items-stretch">
              {/* Central AI Core Router Pod — Full White Button with App Design Colour Border & Icon */}
              <Link
                to="/assistant"
                title="AI Core — 14 live recommendations"
                className="group flex min-h-[54px] rounded-2xl p-[2px] text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(0,198,255,0.75)]"
                style={{ background: BRAND_GRADIENT }}
              >
                <div className="flex w-full items-center justify-between gap-2 rounded-[14px] bg-white px-3 py-1.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#5A00D6] bg-[#F5F0FF]">
                      <Cpu className="h-4 w-4" style={{ color: '#5A00D6' }} />
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-[10.5px] font-extrabold leading-snug"
                        style={{ color: '#0A2B6D' }}
                      >
                        <span style={{ color: '#0072FF' }}>◉</span> AI Core Hub
                      </div>
                      <div
                        className="mt-0.5 inline-block rounded-full border border-[#5A00D6]/50 bg-[#F5F0FF] px-2 py-0 text-[8.5px] font-extrabold leading-tight"
                        style={{ color: '#5A00D6' }}
                      >
                        14 live insights
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" style={{ color: '#5A00D6' }} />
                </div>
              </Link>

              {/* 13 Main Modular Control Pods — Slightly Larger, Full White Button Area, App Design Icon Colours */}
              {quickGroups.map((item, idx) => {
                const active =
                  selectedGroup === item.label ||
                  item.modules.some((module) => isActive(module.path));
                const Icon = item.modules[0].icon;
                const iconColor = APP_DESIGN_ICON_COLOURS[idx % APP_DESIGN_ICON_COLOURS.length];
                const meta = POD_LIVE_BADGES[item.label] || {
                  short: item.label,
                  metric: `${item.modules.length} modules`,
                  ring: iconColor,
                  pct: 90,
                };

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      setSelectedGroup((current) =>
                        current === item.label ? null : item.label
                      )
                    }
                    aria-expanded={selectedGroup === item.label}
                    aria-controls="quick-access-modules"
                    title={`${item.label} — ${meta.metric}`}
                    className={`group flex min-h-[54px] rounded-2xl p-[2px] text-left transition-all duration-200 hover:-translate-y-0.5 focus:outline-none ${
                      active
                        ? 'shadow-[0_0_18px_rgba(0,198,255,0.85)] scale-[1.01]'
                        : 'hover:shadow-[0_0_12px_rgba(0,198,255,0.55)]'
                    }`}
                    style={{ background: BRAND_GRADIENT }}
                  >
                    <div className="flex w-full items-center justify-between gap-2 rounded-[14px] bg-white px-3 py-1.5">
                      <div className="flex min-w-0 items-center gap-2">
                        {/* Circular Ring Orb with Icon in App Design Colour */}
                        <div
                          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F0FF]"
                          style={{ border: `2px solid ${iconColor}` }}
                        >
                          <Icon className="h-4 w-4 shrink-0" style={{ color: iconColor }} />
                        </div>

                        {/* Full White Area for Crisp Unclipped Words & Metric */}
                        <div className="min-w-0 flex-1">
                          <div
                            className="text-[10.5px] font-extrabold leading-snug"
                            style={{ color: '#0A2B6D' }}
                          >
                            <span style={{ color: iconColor }}>◉</span> {meta.short || item.label}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1">
                            <span
                              className="inline-block rounded-full bg-[#F5F0FF] px-2 py-0 text-[8.5px] font-extrabold leading-tight"
                              style={{
                                border: `1.5px solid ${iconColor}`,
                                color: meta.pulse ? '#FF2E9A' : '#5A00D6',
                              }}
                            >
                              {meta.metric}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" style={{ color: iconColor }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Expanded Sub-Module Direct Control Pods — All-White Buttons with App-Design-Colour Borders & Icons */}
        {!collapsed && expandedGroup && (
          <div id="quick-access-modules" className="px-2 pb-2">
            <nav
              aria-label={expandedGroup.label}
              className="rounded-2xl border border-white/30 bg-white/15 p-2 backdrop-blur-md"
            >
              <div className="mb-1.5 flex justify-center">
                <div
                  className="rounded-full p-[1.5px]"
                  style={{ background: BRAND_GRADIENT }}
                >
                  <p
                    className="rounded-full bg-white px-3 py-0.5 text-center text-[9px] font-extrabold uppercase tracking-wider"
                    style={{ color: '#0A2B6D' }}
                  >
                    ◉ {expandedGroup.label} — Direct Control Pods ({expandedGroup.modules.length} Modules)
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {expandedGroup.modules.map((module, mIdx) => {
                  const Icon = module.icon;
                  const modActive = isActive(module.path);
                  const modIconColor = APP_DESIGN_ICON_COLOURS[mIdx % APP_DESIGN_ICON_COLOURS.length];
                  return (
                    <Link
                      key={module.key}
                      to={module.path}
                      aria-current={modActive ? 'page' : undefined}
                      className={`inline-flex rounded-full p-[2px] transition-all duration-200 hover:-translate-y-0.5 ${
                        modActive ? 'shadow-[0_0_14px_rgba(0,198,255,0.85)] scale-[1.02]' : ''
                      }`}
                      style={{ background: BRAND_GRADIENT }}
                    >
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] font-extrabold text-[#0A2B6D]">
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F5F0FF]"
                          style={{ border: `1.5px solid ${modIconColor}` }}
                        >
                          <Icon className="h-3 w-3 shrink-0" style={{ color: modIconColor }} />
                        </span>
                        <span style={{ color: '#0A2B6D' }}>◉ {module.label}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        )}
      </section>
    </div>
  );
}