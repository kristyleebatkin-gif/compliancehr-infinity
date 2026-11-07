import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, ChevronDown, ChevronUp, Cpu, LayoutGrid } from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { PRIMARY_11_OS_NAV, FOCUSED_5_PILLAR_NAV } from '@/components/ObsidianSidebarRemote';
import { useRole } from '@/lib/useRole';
import { canAccessNav } from '@/lib/roles';
import { useAuth } from '@/lib/AuthContext';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const DARK_NAVY_CHASSIS = '#000000';

const APP_DESIGN_COLOURS = ['#0072FF', '#A855F7', '#FF2E9A'];
const APP_ICON_GRADIENTS = [
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 55%, #5A00D6 100%)',
  'linear-gradient(135deg, #0072FF 0%, #5A00D6 52%, #FF2E9A 100%)',
  'linear-gradient(135deg, #5A00D6 0%, #A100FF 50%, #FF2E9A 100%)',
  'linear-gradient(135deg, #0A2B6D 0%, #0072FF 55%, #00C6FF 100%)',
  'linear-gradient(135deg, #FF2E9A 0%, #A100FF 52%, #0072FF 100%)',
];

const HEADING_TEXT_GRADIENT =
  'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)';

export default function QuickAppBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useRole();
  const { isAuthenticated } = useAuth();
  const [remoteMode, setRemoteMode] = useState(
    () => localStorage.getItem('chr-active-remote-mode') || 'os11'
  );
  const [selectedPillarId, setSelectedPillarId] = useState(
    () => localStorage.getItem('chr-active-remote-pillar') || 'dashboard-executive'
  );
  const [collapsed, setCollapsed] = useState(false);
  const prevPathnameRef = useRef(location.pathname);

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const allAccessibleModules = useMemo(
    () =>
      MODULE_DIRECTORY.filter(
        (m) =>
          !(m.key === 'staff-progress' && MODULE_DIRECTORY.some((e) => e.key === 'staff')) &&
          !['company-safe', 'universal-storage', 'registers', 'record-intelligence'].includes(m.key)
      ),
    []
  );

  const sourceSections = useMemo(() => {
    if (remoteMode === 'all') {
      return [
        {
          id: 'all-46-modules',
          label: `All ${allAccessibleModules.length} Enterprise Modules`,
          sub: 'Complete directory of all connected workspaces',
          path: '/dashboard',
          icon: LayoutGrid,
          colourIndex: 0,
          modules: allAccessibleModules.map((m) => ({
            key: m.key || m.path,
            label: m.label,
            path: m.path,
            blurb: m.blurb || m.group || `Open ${m.label}`,
            icon: m.icon || LayoutGrid,
          })),
        },
      ];
    }

    const baseList = remoteMode === 'pillars5' ? FOCUSED_5_PILLAR_NAV : PRIMARY_11_OS_NAV;
    return baseList.map((pillar, colourIndex) => {
      const enrichedChildren = pillar.children.map((ch) => {
        const dirMatch = MODULE_DIRECTORY.find((m) => m.path === ch.path);
        return {
          key: dirMatch?.key || `${ch.path}-${ch.label}`,
          label: ch.label,
          path: ch.path,
          blurb: ch.sub || dirMatch?.blurb || `Open ${ch.label}`,
          icon: ch.icon || dirMatch?.icon || pillar.icon,
        };
      });

      return {
        ...pillar,
        colourIndex,
        modules: enrichedChildren,
      };
    });
  }, [remoteMode, allAccessibleModules]);

  useEffect(() => {
    if (remoteMode === 'all') return;
    if (prevPathnameRef.current === location.pathname) return;
    prevPathnameRef.current = location.pathname;
    const currentStillMatches = sourceSections.some(
      (p) =>
        p.id === selectedPillarId &&
        (location.pathname === p.path ||
          p.modules.some((m) => location.pathname === m.path || location.pathname.startsWith(`${m.path}/`)))
    );
    if (currentStillMatches) return;
    const match = sourceSections.find(
      (p) =>
        location.pathname === p.path ||
        p.modules.some((m) => location.pathname === m.path || location.pathname.startsWith(`${m.path}/`))
    );
    if (match) {
      setSelectedPillarId(match.id);
      localStorage.setItem('chr-active-remote-pillar', match.id);
    }
  }, [location.pathname, sourceSections, remoteMode, selectedPillarId]);

  useEffect(() => {
    const onRemoteSelect = (e) => {
      if (e?.detail?.navMode) {
        setRemoteMode(e.detail.navMode);
      }
      if (e?.detail?.pillarId) {
        setSelectedPillarId(e.detail.pillarId);
      }
      setCollapsed(false);
    };
    window.addEventListener('chr-remote-pillar-select', onRemoteSelect);
    return () => window.removeEventListener('chr-remote-pillar-select', onRemoteSelect);
  }, []);

  const expandedGroup =
    remoteMode === 'all'
      ? sourceSections[0]
      : sourceSections.find((g) => g.id === selectedPillarId) || sourceSections[0];

  const handleSelectMajorSection = (pillar, shouldNavigate = false) => {
    setSelectedPillarId(pillar.id);
    setCollapsed(false);
    localStorage.setItem('chr-active-remote-pillar', pillar.id);
    window.dispatchEvent(
      new CustomEvent('chr-remote-pillar-select', {
        detail: { pillarId: pillar.id, navMode: remoteMode, pillar },
      })
    );
    const canAutoRoute = location.pathname !== '/' || isAuthenticated;
    if (shouldNavigate && canAutoRoute && pillar?.path && location.pathname !== pillar.path) {
      navigate(pillar.path);
    }
  };

  const switchRemoteMode = (nextMode) => {
    setRemoteMode(nextMode);
    setCollapsed(false);
    localStorage.setItem('chr-active-remote-mode', nextMode);
    const list = nextMode === 'pillars5' ? FOCUSED_5_PILLAR_NAV : PRIMARY_11_OS_NAV;
    const match =
      list.find(
        (p) =>
          location.pathname === p.path ||
          p.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`))
      ) || list[0];
    const nextPillarId = nextMode === 'all' ? 'all-46-modules' : match.id;
    setSelectedPillarId(nextPillarId);
    localStorage.setItem('chr-active-remote-pillar', nextPillarId);
    window.dispatchEvent(
      new CustomEvent('chr-remote-pillar-select', {
        detail: { pillarId: nextPillarId, navMode: nextMode },
      })
    );
  };

  return (
    <div id="main-view-navigator-remote" className="scroll-mt-64 mx-auto w-full max-w-[1440px] px-3 pt-2">
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

            <div className="flex flex-wrap items-center gap-1.5">
              {/* Synced Mode Switcher inside Main View Navigator Remote */}
              <div
                className="inline-flex items-center gap-0.5 rounded-full p-[1.5px]"
                style={{ background: BRAND_GRADIENT }}
              >
                <div className="inline-flex items-center gap-0.5 rounded-full bg-white p-0.5">
                  {[
                    { id: 'pillars5', label: '5 Pillars' },
                    { id: 'os11', label: '13 Channels' },
                    { id: 'all', label: 'All 46' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => switchRemoteMode(m.id)}
                      className={`rounded-full px-2 py-0.5 text-[8.5px] font-extrabold transition ${
                        remoteMode === m.id
                          ? 'bg-[#0A2B6D] text-white'
                          : 'text-[#0A2B6D] hover:bg-[#F5F0FF]'
                      }`}
                    >
                      ◉ {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {expandedGroup?.path && (
                <Link
                  to={expandedGroup.path}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[8.5px] font-extrabold text-[#0A2B6D] shadow-2xs transition hover:bg-[#F5F0FF]"
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
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[8.5px] font-extrabold text-[#0A2B6D]">
                  {collapsed ? <ChevronDown className="h-3 w-3 text-[#0072FF]" /> : <ChevronUp className="h-3 w-3 text-[#5A00D6]" />}
                  <span style={{ color: '#0A2B6D' }}>{collapsed ? 'Expand Remote View' : 'Collapse Remote View'}</span>
                </span>
              </button>
            </div>
          </div>

          {/* TOP: Major Section Selector Buttons (Uniform 42px Modular Buttons) */}
          {!collapsed && (
            <div
              className="grid grid-cols-2 gap-1.5 px-2 pb-1.5 pt-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 items-stretch"
              style={{ background: DARK_NAVY_CHASSIS }}
            >
              {/* AI Core Button: Identical 42px Modular Remote Button */}
              <Link
                to="/assistant"
                title="AI Core — 14 live recommendations"
                className="group block w-full text-left rounded-lg p-[1.5px] shadow-[0_0_8px_rgba(0,198,255,0.45)] transition-all duration-150 hover:shadow-[0_0_12px_rgba(0,198,255,0.75)]"
                style={{ background: BRAND_GRADIENT }}
              >
                <div
                  className="flex min-h-[42px] flex-col justify-between overflow-hidden rounded-[7px]"
                  style={{ background: DARK_NAVY_CHASSIS }}
                >
                  <div className="flex h-[32px] items-center justify-between gap-1.5 bg-black px-2">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      <span
                        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] bg-black"
                        style={{
                          border: '1.5px solid #0072FF',
                          boxShadow: '0 0 6px rgba(0,114,255,0.55)',
                        }}
                      >
                        <Cpu className="h-3 w-3 shrink-0" style={{ color: '#0072FF' }} />
                      </span>
                      <span
                        className="min-w-0 truncate text-[13px] font-black leading-tight tracking-tight text-white"
                        style={{ color: '#FFFFFF' }}
                      >
                        AI Core Hub
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-black"
                      style={{
                        border: '1.5px solid #0072FF',
                        boxShadow: '0 0 7px rgba(0,114,255,0.75)',
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-[2px]"
                        style={{ backgroundColor: '#0072FF', boxShadow: '0 0 6px 1px #0072FF' }}
                      />
                    </span>
                  </div>
                </div>
              </Link>

              {sourceSections.map((item, gIdx) => {
                const isSelectedSection = expandedGroup?.id === item.id;
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
                    onClick={() => handleSelectMajorSection(item, false)}
                    aria-expanded={isSelectedSection}
                    aria-controls="quick-access-modules"
                    title={`${item.label} — Click to display ${item.modules.length} modules underneath`}
                    className={`group block w-full text-left rounded-lg p-[1.5px] transition-all duration-150 focus-visible:outline-none ${
                      isSelectedSection
                        ? 'shadow-[0_0_14px_rgba(0,198,255,0.85)]'
                        : 'shadow-[0_0_6px_rgba(90,0,214,0.3)] hover:shadow-[0_0_10px_rgba(0,198,255,0.6)]'
                    }`}
                    style={{ background: BRAND_GRADIENT }}
                  >
                    <div
                      className="flex min-h-[42px] flex-col justify-between overflow-hidden rounded-[7px]"
                      style={{ background: DARK_NAVY_CHASSIS }}
                    >
                      <div className="flex h-[32px] items-center justify-between gap-1.5 bg-black px-2">
                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                          <span
                            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] bg-black"
                            style={{
                              border: `1.5px solid ${symColor}`,
                              boxShadow: `0 0 6px ${symColor}66`,
                            }}
                          >
                            <Icon className="h-3 w-3 shrink-0" style={{ color: symColor }} />
                          </span>
                          <span
                            className="min-w-0 truncate text-[13px] font-black leading-tight tracking-tight text-white"
                            style={{ color: '#FFFFFF' }}
                          >
                            {item.label}
                          </span>
                        </div>
                        <span
                          aria-hidden="true"
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-black"
                          style={{
                            border: `1.5px solid ${symColor}`,
                            boxShadow: `0 0 7px ${symColor}88`,
                          }}
                        >
                          <span
                            className="h-2 w-2 rounded-[2px]"
                            style={{
                              backgroundColor: symColor,
                              boxShadow: `0 0 6px 1px ${symColor}`,
                            }}
                          />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* UNDERNEATH: All Sections & Their In-Between Module Buttons Displayed Underneath (Identical 42px Modular Buttons) */}
          {!collapsed && (
            <div id="quick-access-modules" className="px-2 pb-2 pt-0.5 space-y-2">
              {(remoteMode === 'all' ? sourceSections : expandedGroup ? [expandedGroup, ...sourceSections.filter((s) => s.id !== expandedGroup.id)] : sourceSections).map((group) => (
                <nav
                  key={group.id}
                  aria-label={group.label}
                  className="rounded-lg border border-[#00C6FF]/60 p-2 shadow-[0_0_12px_rgba(0,198,255,0.22)]"
                  style={{ background: DARK_NAVY_CHASSIS }}
                >
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#00C6FF] bg-white px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#0A2B6D]"
                      style={{ color: '#0A2B6D' }}
                    >
                      <span style={{ color: '#0072FF' }}>▼</span> {group.label} ({group.modules.length} Modules)
                    </span>
                    {group.path && (
                      <Link
                        to={group.path}
                        className="inline-flex items-center gap-1 rounded-full bg-[#00C6FF] px-2.5 py-0.5 text-[8.5px] font-extrabold text-[#0A2B6D] transition hover:bg-white"
                      >
                        <span>Open {group.label.replace(/^\d+\.\s*/, '')}</span>
                        <ArrowRight className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 items-stretch">
                    {group.modules.map((module, mIdx) => {
                      const Icon = module.icon;
                      const modActive = isActive(module.path);
                      const modColor = APP_DESIGN_COLOURS[mIdx % APP_DESIGN_COLOURS.length];
                      return (
                        <Link
                          key={`${group.id}-${module.key}`}
                          to={module.path}
                          aria-current={modActive ? 'page' : undefined}
                          className={`group block w-full text-left rounded-lg p-[1.5px] transition-all duration-150 ${
                            modActive
                              ? 'shadow-[0_0_14px_rgba(0,198,255,0.85)]'
                              : 'shadow-[0_0_6px_rgba(90,0,214,0.3)] hover:shadow-[0_0_10px_rgba(0,198,255,0.6)]'
                          }`}
                          style={{ background: BRAND_GRADIENT }}
                        >
                          <div
                            className="flex min-h-[42px] flex-col justify-between overflow-hidden rounded-[7px]"
                            style={{ background: DARK_NAVY_CHASSIS }}
                          >
                            <div className="flex h-[32px] items-center justify-between gap-1.5 bg-black px-2">
                              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                                <span
                                  className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] bg-black"
                                  style={{
                                    border: `1.5px solid ${modColor}`,
                                    boxShadow: `0 0 6px ${modColor}66`,
                                  }}
                                >
                                  <Icon className="h-3 w-3 shrink-0" style={{ color: modColor }} />
                                </span>
                                <span
                                  className="min-w-0 truncate text-[13px] font-black leading-tight tracking-tight text-white"
                                  style={{ color: '#FFFFFF' }}
                                >
                                  {module.label}
                                </span>
                              </div>
                              <span
                                aria-hidden="true"
                                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-black"
                                style={{
                                  border: `1.5px solid ${modColor}`,
                                  boxShadow: `0 0 7px ${modColor}88`,
                                }}
                              >
                                <span
                                  className="h-2 w-2 rounded-[2px]"
                                  style={{
                                    backgroundColor: modColor,
                                    boxShadow: `0 0 6px 1px ${modColor}`,
                                  }}
                                />
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </nav>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}