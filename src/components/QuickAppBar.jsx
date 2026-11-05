import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, ArrowRight, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { PRIMARY_11_OS_NAV, FOCUSED_5_PILLAR_NAV } from '@/components/ObsidianSidebarRemote';
import { useRole } from '@/lib/useRole';
import { canAccessNav } from '@/lib/roles';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const DARK_NAVY_CHASSIS =
  'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)';

const APP_DESIGN_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

const HEADING_TEXT_GRADIENT =
  'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)';

export default function QuickAppBar() {
  const location = useLocation();
  const { role } = useRole();
  const [remoteMode, setRemoteMode] = useState(
    () => localStorage.getItem('chr-active-remote-mode') || 'os11'
  );
  const [selectedPillarId, setSelectedPillarId] = useState(
    () => localStorage.getItem('chr-active-remote-pillar') || 'dashboard-executive'
  );
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const sourceSections = useMemo(() => {
    const baseList = remoteMode === 'pillars5' ? FOCUSED_5_PILLAR_NAV : PRIMARY_11_OS_NAV;
    return baseList.map((pillar, colourIndex) => {
      const enrichedChildren = pillar.children
        .map((ch) => {
          const dirMatch = MODULE_DIRECTORY.find((m) => m.path === ch.path);
          return {
            key: dirMatch?.key || ch.path,
            label: ch.label,
            path: ch.path,
            blurb: ch.sub || dirMatch?.blurb || `Open ${ch.label}`,
            icon: dirMatch?.icon || pillar.icon,
          };
        })
        .filter((mod) => !role || !mod.key || mod.key.startsWith('/') || canAccessNav(role, mod.key));

      return {
        ...pillar,
        colourIndex,
        modules: enrichedChildren.length > 0 ? enrichedChildren : pillar.children.map((ch) => ({
          key: ch.path,
          label: ch.label,
          path: ch.path,
          blurb: ch.sub,
          icon: pillar.icon,
        })),
      };
    });
  }, [remoteMode, role]);

  useEffect(() => {
    const match = sourceSections.find(
      (p) =>
        location.pathname === p.path ||
        p.modules.some((m) => location.pathname === m.path || location.pathname.startsWith(`${m.path}/`))
    );
    if (match) {
      setSelectedPillarId(match.id);
      localStorage.setItem('chr-active-remote-pillar', match.id);
    }
  }, [location.pathname, sourceSections]);

  useEffect(() => {
    const onRemoteSelect = (e) => {
      if (e?.detail?.navMode) {
        setRemoteMode(e.detail.navMode);
      }
      if (e?.detail?.pillarId) {
        setSelectedPillarId(e.detail.pillarId);
        setCollapsed(false);
      }
    };
    window.addEventListener('chr-remote-pillar-select', onRemoteSelect);
    return () => window.removeEventListener('chr-remote-pillar-select', onRemoteSelect);
  }, []);

  const expandedGroup =
    sourceSections.find((g) => g.id === selectedPillarId) || sourceSections[0];

  const handleSelectMajorSection = (pillar) => {
    setSelectedPillarId(pillar.id);
    setCollapsed(false);
    localStorage.setItem('chr-active-remote-pillar', pillar.id);
    window.dispatchEvent(
      new CustomEvent('chr-remote-pillar-select', {
        detail: { pillarId: pillar.id, navMode: remoteMode, pillar },
      })
    );
  };

  return (
    <div id="main-view-navigator-remote" className="scroll-mt-16 mx-auto w-full max-w-[1440px] px-3 pt-2">
      <section
        aria-label="Navigator Remote — Main View Section Deck"
        className="preserve-island-theme overflow-hidden rounded-2xl p-[2px] shadow-lg"
        style={{ background: BRAND_GRADIENT }}
      >
        <div
          className="overflow-hidden rounded-[14px]"
          style={{ background: DARK_NAVY_CHASSIS }}
        >
          {/* Compact Top Command Strip: White Pill with App Design Border & Dark Blue -> App Colour Heading */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 px-2.5 py-1">
            <div
              className="inline-flex items-center gap-1.5 rounded-full p-[1.5px]"
              style={{ background: BRAND_GRADIENT }}
            >
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5">
                <Zap className="h-3 w-3 shrink-0" style={{ color: '#0072FF' }} />
                <span
                  className="bg-clip-text text-[10.5px] font-extrabold tracking-tight text-transparent"
                  style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
                >
                  Navigator Remote Main View · {expandedGroup ? expandedGroup.label : '13-Category Command Centre'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {expandedGroup?.path && (
                <Link
                  to={expandedGroup.path}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[9px] font-extrabold text-[#0A2B6D] shadow-2xs transition hover:bg-[#F5F0FF]"
                >
                  <span style={{ color: '#0A2B6D' }}>Open {expandedGroup.label.replace(/^\d+\.\s*/, '')} Home</span>
                  <ArrowRight className="h-2.5 w-2.5 text-[#0072FF]" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                className="inline-flex items-center gap-1 rounded-full p-[1.5px] transition hover:scale-[1.02]"
                style={{ background: BRAND_GRADIENT }}
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[9px] font-extrabold text-[#0A2B6D]">
                  {collapsed ? <ChevronDown className="h-3 w-3 text-[#0072FF]" /> : <ChevronUp className="h-3 w-3 text-[#5A00D6]" />}
                  <span style={{ color: '#0A2B6D' }}>{collapsed ? 'Expand Remote View' : 'Collapse Remote View'}</span>
                </span>
              </button>
            </div>
          </div>

          {/* Selected Major Section Opened Prominently in Main View on the Navigator Remote */}
          {!collapsed && expandedGroup && (
            <div id="quick-access-modules" className="px-2 pb-2 pt-0.5">
              <nav
                aria-label={expandedGroup.label}
                className="rounded-xl border border-[#00C6FF]/40 p-2 shadow-[0_0_20px_rgba(0,198,255,0.25)]"
                style={{ background: DARK_NAVY_CHASSIS }}
              >
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#00C6FF] bg-white px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D] shadow-2xs"
                    style={{ color: '#0A2B6D' }}
                  >
                    <span style={{ color: '#0072FF' }}>◉</span> {expandedGroup.label} — Opened in Main View on Navigator Remote ({expandedGroup.modules.length} Modules)
                  </span>
                  <span className="text-[8.5px] font-bold text-[#00C6FF]">
                    Select any module below to open its workspace
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 items-stretch">
                  {expandedGroup.modules.map((module, mIdx) => {
                    const Icon = module.icon;
                    const modActive = isActive(module.path);
                    const modColor = APP_DESIGN_COLOURS[mIdx % APP_DESIGN_COLOURS.length];
                    return (
                      <Link
                        key={module.key}
                        to={module.path}
                        aria-current={modActive ? 'page' : undefined}
                        className={`group flex min-h-[52px] flex-col rounded-xl p-[1.5px] text-left transition-all duration-200 ${
                          modActive
                            ? 'shadow-[0_0_18px_rgba(0,198,255,0.85)] scale-[1.01]'
                            : 'shadow-[0_0_10px_rgba(90,0,214,0.35)] hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(0,198,255,0.75)]'
                        }`}
                        style={{ background: BRAND_GRADIENT }}
                      >
                        <div
                          className="flex flex-1 flex-col justify-between overflow-hidden rounded-[10.5px]"
                          style={{ background: DARK_NAVY_CHASSIS }}
                        >
                          <div className="flex min-h-[24px] items-center justify-between gap-1 bg-white px-2 py-0.5">
                            <div className="flex min-w-0 items-center gap-1">
                              <span
                                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-[#F5F0FF]"
                                style={{ border: `1.5px solid ${modColor}` }}
                              >
                                <Icon className="h-2.5 w-2.5 shrink-0" style={{ color: modColor }} />
                              </span>
                              <span
                                className="min-w-0 bg-clip-text text-[10px] font-extrabold leading-tight text-transparent"
                                style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
                              >
                                <span style={{ color: modColor }}>◉</span> {module.label}
                              </span>
                            </div>
                            <span
                              className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1 py-0 text-[6.5px] font-black uppercase ${
                                modActive ? 'bg-[#0A2B6D] text-[#00C6FF]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                              }`}
                            >
                              <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: modActive ? '#00C6FF' : modColor,
                                  boxShadow: modActive
                                    ? '0 0 6px 1px #00C6FF'
                                    : `0 0 5px 1px ${modColor}`,
                                }}
                              />
                              {modActive ? 'ACTIVE' : 'OPEN'}
                            </span>
                          </div>

                          <div className="flex flex-1 items-center justify-between gap-1 px-2 py-1">
                            <span
                              className="min-w-0 flex-1 break-words text-[8px] font-bold leading-snug text-white"
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

          {/* Uniform Small Remote Buttons (Capped at ≤ 5cm Vertical Height on Desktop/Tablet) */}
          {!collapsed && (
            <div
              className="grid grid-cols-2 gap-1.5 px-2 pb-2 pt-0.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 lg:max-h-[4.3cm] lg:overflow-y-auto items-stretch"
              style={{ background: DARK_NAVY_CHASSIS }}
            >
              {/* AI Core Button: Uniform Small Remote Tile */}
              <Link
                to="/assistant"
                title="AI Core — 14 live recommendations"
                className="group flex min-h-[46px] flex-col rounded-xl p-[1.5px] text-left shadow-[0_0_14px_rgba(0,198,255,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(0,198,255,0.85)]"
                style={{ background: BRAND_GRADIENT }}
              >
                <div
                  className="flex flex-1 flex-col justify-between overflow-hidden rounded-[10.5px]"
                  style={{ background: DARK_NAVY_CHASSIS }}
                >
                  {/* Top Title Bar: Slightly Larger Heading (Dark Blue -> App Design Colour) */}
                  <div className="flex min-h-[22px] items-center justify-between gap-1 bg-white px-2 py-0.5">
                    <div className="flex min-w-0 items-center gap-1">
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-[#F5F0FF]"
                        style={{ border: '1.5px solid #0072FF' }}
                      >
                        <Cpu className="h-2.5 w-2.5 shrink-0" style={{ color: '#0072FF' }} />
                      </span>
                      <span
                        className="min-w-0 bg-clip-text text-[10px] font-extrabold leading-tight text-transparent"
                        style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
                      >
                        ◉ AI Core Hub
                      </span>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#0A2B6D] px-1 py-0 text-[6.5px] font-black uppercase text-[#00C6FF]">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: '#00C6FF', boxShadow: '0 0 6px 1px #00C6FF' }}
                      />
                      LIVE
                    </span>
                  </div>

                  {/* Bottom Dark Navy Body: Smaller Crisp White Writing */}
                  <div className="flex flex-1 items-center justify-between gap-1 px-2 py-1">
                    <span
                      className="text-[8px] font-bold leading-tight text-white"
                      style={{ color: '#FFFFFF' }}
                    >
                      14 live recommendations
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#00C6FF]" />
                  </div>
                </div>
              </Link>

              {sourceSections.map((item, gIdx) => {
                const active =
                  expandedGroup?.id === item.id ||
                  item.modules.some((module) => isActive(module.path));
                const Icon = item.icon || item.modules[0]?.icon || Cpu;
                const symColor = APP_DESIGN_COLOURS[gIdx % APP_DESIGN_COLOURS.length];
                const currentSub =
                  item.sub ||
                  item.modules
                    .slice(0, 2)
                    .map((module) => module.label)
                    .join(' · ') +
                    (item.modules.length > 2 ? ` +${item.modules.length - 2}` : '');

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMajorSection(item)}
                    aria-expanded={expandedGroup?.id === item.id}
                    aria-controls="quick-access-modules"
                    title={`${item.label} — ${currentSub}`}
                    className={`group flex min-h-[46px] flex-col rounded-xl p-[1.5px] text-left transition-all duration-200 focus-visible:outline-none ${
                      active
                        ? 'shadow-[0_0_18px_rgba(0,198,255,0.85)] scale-[1.01]'
                        : 'shadow-[0_0_10px_rgba(90,0,214,0.35)] hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(0,198,255,0.7)]'
                    }`}
                    style={{ background: BRAND_GRADIENT }}
                  >
                    <div
                      className="flex flex-1 flex-col justify-between overflow-hidden rounded-[10.5px]"
                      style={{ background: DARK_NAVY_CHASSIS }}
                    >
                      {/* Top Title Bar: Slightly Larger Heading (Dark Blue -> App Design Colour) */}
                      <div className="flex min-h-[22px] items-center justify-between gap-1 bg-white px-2 py-0.5">
                        <div className="flex min-w-0 items-center gap-1">
                          <span
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-[#F5F0FF]"
                            style={{ border: `1.5px solid ${symColor}` }}
                          >
                            <Icon className="h-2.5 w-2.5 shrink-0" style={{ color: symColor }} />
                          </span>
                          <span
                            className="min-w-0 bg-clip-text text-[10px] font-extrabold leading-tight text-transparent"
                            style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
                          >
                            <span style={{ color: symColor }}>◉</span> {item.label}
                          </span>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1 py-0 text-[6.5px] font-black uppercase ${
                            active ? 'bg-[#0A2B6D] text-[#00C6FF]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                          }`}
                        >
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor: active ? '#00C6FF' : symColor,
                              boxShadow: active
                                ? '0 0 6px 1px #00C6FF'
                                : `0 0 5px 1px ${symColor}`,
                            }}
                          />
                          {active ? 'ON' : 'LIVE'}
                        </span>
                      </div>

                      {/* Bottom Dark Navy Body: Smaller Crisp White Writing */}
                      <div className="flex flex-1 items-center justify-between gap-1 px-2 py-1">
                        <span
                          className="text-[8px] font-bold leading-tight text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          {currentSub}
                        </span>
                        <ArrowRight className="h-2.5 w-2.5 shrink-0" style={{ color: symColor }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* All Major Sections Switcher Bar */}
          {!collapsed && (
            <div className="px-2 pb-1.5 pt-0.5">
              <div className="text-[8.5px] font-extrabold uppercase tracking-wider text-white/80 px-1">
                Major Sections (Click any section here or in the left remote to open its modules above)
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}