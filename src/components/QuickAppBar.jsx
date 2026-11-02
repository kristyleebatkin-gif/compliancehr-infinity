import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, ArrowRight, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import { MODULE_DIRECTORY, NAV_GROUPS } from '@/lib/moduleDirectory';
import { useRole } from '@/lib/useRole';
import { canAccessNav } from '@/lib/roles';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const DARK_NAVY_CHASSIS =
  'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)';

const APP_DESIGN_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

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
    <div className="mx-auto w-full max-w-[1440px] px-3 pt-1.5 sm:px-5 lg:px-6">
      <section
        className="preserve-island-theme overflow-hidden rounded-2xl border-2 border-[#0A2B6D] shadow-lg"
        style={{ background: DARK_NAVY_CHASSIS }}
      >
        <div className="h-1.5 w-full" style={{ background: BRAND_GRADIENT }} />

        {/* TOP 1/4 WHITE: Header Bar with Enlarged Logo, Name & Slogan inside ONE Border */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white"
              style={{ background: BRAND_GRADIENT }}
            >
              <Zap className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF' }}>OS Remote</span>
            </span>
            <p className="text-[11px] font-extrabold text-[#0A2B6D]" style={{ color: '#0A2B6D' }}>
              13-Category Command Centre
            </p>
          </div>

          <BrandLogoLockup size="xs" theme="light" showSlogan={true} />

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D]/30 bg-[#F5F0FF] px-2.5 py-0.5 text-[9px] font-extrabold text-[#0A2B6D] hover:border-[#0072FF]"
          >
            {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            <span style={{ color: '#0A2B6D' }}>{collapsed ? 'Show OS Remote' : 'Compact'}</span>
          </button>
        </div>

        {/* BOTTOM 3/4 DARK BLUE: Illuminated Modular Tiles with App Design Colour Symbols */}
        {!collapsed && (
          <div
            className="grid grid-cols-1 gap-2 p-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 items-stretch"
            style={{ background: DARK_NAVY_CHASSIS }}
          >
            {/* AI Core Button: Top 1/4 White + Bottom 3/4 Dark Blue */}
            <Link
              to="/assistant"
              title="AI Core — 14 live recommendations"
              className="group flex min-h-[64px] flex-col rounded-2xl p-[2px] text-left shadow-[0_0_16px_rgba(0,198,255,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(0,198,255,0.85)]"
              style={{ background: BRAND_GRADIENT }}
            >
              <div
                className="flex flex-1 flex-col justify-between overflow-hidden rounded-[14px]"
                style={{ background: DARK_NAVY_CHASSIS }}
              >
                {/* Top 1/4 White Title Bar */}
                <div className="flex min-h-[28px] items-center justify-between gap-1 bg-white px-2 py-0.5">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#F5F0FF]"
                      style={{ border: '1.5px solid #0072FF' }}
                    >
                      <Cpu className="h-3 w-3 shrink-0" style={{ color: '#0072FF' }} />
                    </span>
                    <span
                      className="text-[9.5px] font-extrabold leading-tight text-[#0A2B6D]"
                      style={{ color: '#0A2B6D' }}
                    >
                      <span style={{ color: '#0072FF' }}>◉</span> AI Core Hub
                    </span>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#0A2B6D] px-1.5 py-0 text-[7px] font-black uppercase text-[#00C6FF]">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: '#00C6FF', boxShadow: '0 0 8px 2px #00C6FF' }}
                    />
                    LIVE
                  </span>
                </div>

                {/* Bottom 3/4 Dark Blue Body */}
                <div className="flex flex-1 items-center justify-between gap-1 px-2.5 py-1.5">
                  <span
                    className="text-[8.5px] font-bold leading-tight text-white"
                    style={{ color: '#FFFFFF' }}
                  >
                    14 live recommendations
                  </span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-[#00C6FF]" />
                </div>
              </div>
            </Link>

            {quickGroups.map((item, gIdx) => {
              const active =
                selectedGroup === item.label ||
                item.modules.some((module) => isActive(module.path));
              const Icon = item.modules[0].icon;
              const symColor = APP_DESIGN_COLOURS[gIdx % APP_DESIGN_COLOURS.length];
              const currentSub =
                item.modules
                  .slice(0, 2)
                  .map((module) => module.label)
                  .join(' · ') +
                (item.modules.length > 2 ? ` +${item.modules.length - 2}` : '');

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
                  title={`${item.label} — ${currentSub}`}
                  className={`group flex min-h-[64px] flex-col rounded-2xl p-[2px] text-left transition-all duration-200 focus-visible:outline-none ${
                    active
                      ? 'shadow-[0_0_20px_rgba(0,198,255,0.85)] scale-[1.01]'
                      : 'shadow-[0_0_12px_rgba(90,0,214,0.35)] hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(0,198,255,0.7)]'
                  }`}
                  style={{ background: BRAND_GRADIENT }}
                >
                  <div
                    className="flex flex-1 flex-col justify-between overflow-hidden rounded-[14px]"
                    style={{ background: DARK_NAVY_CHASSIS }}
                  >
                    {/* Top 1/4 White Title Background with App Design Colour Symbol */}
                    <div className="flex min-h-[28px] items-center justify-between gap-1 bg-white px-2 py-0.5">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#F5F0FF]"
                          style={{ border: `1.5px solid ${symColor}` }}
                        >
                          <Icon className="h-3 w-3 shrink-0" style={{ color: symColor }} />
                        </span>
                        <span
                          className="text-[9.5px] font-extrabold leading-tight text-[#0A2B6D]"
                          style={{ color: '#0A2B6D' }}
                        >
                          <span style={{ color: symColor }}>◉</span> {item.label}
                        </span>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0 text-[7px] font-black uppercase ${
                          active ? 'bg-[#0A2B6D] text-[#00C6FF]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                        }`}
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor: active ? '#00C6FF' : symColor,
                            boxShadow: active
                              ? '0 0 8px 2px #00C6FF'
                              : `0 0 6px 1px ${symColor}`,
                          }}
                        />
                        {active ? 'ON' : 'LIVE'}
                      </span>
                    </div>

                    {/* Bottom 3/4 Dark Blue Body */}
                    <div className="flex flex-1 items-center justify-between gap-1 px-2.5 py-1.5">
                      <span
                        className="text-[8.5px] font-bold leading-tight text-white"
                        style={{ color: '#FFFFFF' }}
                      >
                        {currentSub}
                      </span>
                      <ArrowRight className="h-3 w-3 shrink-0" style={{ color: symColor }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Expanded Page Modular Tiles: Each Page Tile Lights Up with Top 1/4 White + Bottom 3/4 Dark Blue & App Design Colour Symbols */}
        {!collapsed && expandedGroup && (
          <div id="quick-access-modules" className="px-2.5 pb-2.5">
            <nav
              aria-label={expandedGroup.label}
              className="rounded-2xl border-2 border-[#0A2B6D] p-2.5 shadow-inner"
              style={{ background: DARK_NAVY_CHASSIS }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D] shadow-2xs"
                  style={{ color: '#0A2B6D' }}
                >
                  <span style={{ color: '#0072FF' }}>◉</span> {expandedGroup.label} — Direct Page Modular Tiles ({expandedGroup.modules.length} Pages)
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 items-stretch">
                {expandedGroup.modules.map((module, mIdx) => {
                  const Icon = module.icon;
                  const modActive = isActive(module.path);
                  const modColor = APP_DESIGN_COLOURS[mIdx % APP_DESIGN_COLOURS.length];
                  return (
                    <Link
                      key={module.key}
                      to={module.path}
                      aria-current={modActive ? 'page' : undefined}
                      className={`group flex min-h-[60px] flex-col rounded-2xl p-[2px] text-left transition-all duration-200 ${
                        modActive
                          ? 'shadow-[0_0_20px_rgba(0,198,255,0.85)] scale-[1.01]'
                          : 'shadow-[0_0_12px_rgba(90,0,214,0.35)] hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(0,198,255,0.75)]'
                      }`}
                      style={{ background: BRAND_GRADIENT }}
                    >
                      <div
                        className="flex flex-1 flex-col justify-between overflow-hidden rounded-[14px]"
                        style={{ background: DARK_NAVY_CHASSIS }}
                      >
                        {/* Top 1/4 White Title Bar with App Design Colour Symbol */}
                        <div className="flex min-h-[28px] items-center justify-between gap-1 bg-white px-2.5 py-0.5">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#F5F0FF]"
                              style={{ border: `1.5px solid ${modColor}` }}
                            >
                              <Icon className="h-3 w-3 shrink-0" style={{ color: modColor }} />
                            </span>
                            <span
                              className="min-w-0 text-[9.5px] font-extrabold leading-tight text-[#0A2B6D]"
                              style={{ color: '#0A2B6D' }}
                            >
                              <span style={{ color: modColor }}>◉</span> {module.label}
                            </span>
                          </div>
                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0 text-[7px] font-black uppercase ${
                              modActive ? 'bg-[#0A2B6D] text-[#00C6FF]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                            }`}
                          >
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor: modActive ? '#00C6FF' : modColor,
                                boxShadow: modActive
                                  ? '0 0 8px 2px #00C6FF'
                                  : `0 0 5px 1px ${modColor}`,
                              }}
                            />
                            {modActive ? 'ACTIVE' : 'LIVE'}
                          </span>
                        </div>

                        {/* Bottom 3/4 Dark Blue Body */}
                        <div className="flex flex-1 items-center justify-between gap-1 px-2.5 py-1">
                          <span
                            className="min-w-0 flex-1 break-words text-[8.5px] font-bold leading-snug text-white"
                            style={{ color: '#FFFFFF' }}
                          >
                            {module.blurb || `Open ${module.label}`}
                          </span>
                          <ArrowRight className="h-2.5 w-2.5 shrink-0 transition group-hover:translate-x-0.5" style={{ color: modColor }} />
                        </div>
                      </div>
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