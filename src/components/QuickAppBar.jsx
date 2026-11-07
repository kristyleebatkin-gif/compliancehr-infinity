import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Cpu, LayoutGrid, Heart, Layers } from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { PRIMARY_11_OS_NAV, FOCUSED_5_PILLAR_NAV } from '@/components/ObsidianSidebarRemote';
import { useAuth } from '@/lib/AuthContext';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const DARK_NAVY_CHASSIS = '#000000';

const APP_DESIGN_COLOURS = ['#0072FF', '#A855F7', '#FF2E9A'];

const HEADING_TEXT_GRADIENT =
  'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)';

export default function QuickAppBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [remoteMode, setRemoteMode] = useState(
    () => localStorage.getItem('chr-active-remote-mode') || 'os11'
  );
  const [selectedPillarId, setSelectedPillarId] = useState(
    () => localStorage.getItem('chr-active-remote-pillar') || 'dashboard-executive'
  );
  const [workspaceView, setWorkspaceView] = useState(
    () => localStorage.getItem('chr-workspace-view-mode') || 'both'
  );
  const prevPathnameRef = useRef(location.pathname);

  const switchWorkspaceView = (mode) => {
    setWorkspaceView(mode);
    localStorage.setItem('chr-workspace-view-mode', mode);
    window.dispatchEvent(new CustomEvent('chr-view-mode-change', { detail: { mode } }));
  };

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
          label: `All ${allAccessibleModules.length} Modules`,
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
      if (e?.detail?.navMode) setRemoteMode(e.detail.navMode);
      if (e?.detail?.pillarId) setSelectedPillarId(e.detail.pillarId);
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
    <div id="main-view-navigator-remote" className="scroll-mt-48 mx-auto w-full max-w-[1440px] px-3 pt-1.5">
      <section
        aria-label="Quick Access Bar"
        className="preserve-island-theme overflow-hidden rounded-xl p-[1.5px] shadow-md"
        style={{ background: BRAND_GRADIENT }}
      >
        <div
          className="overflow-hidden rounded-[10px] p-1.5 space-y-1"
          style={{ background: DARK_NAVY_CHASSIS }}
        >
          {/* LINE 1: Quick Access Bar Title + Moved Header Controls (Participant Profiles, Both Views, Start Free) + Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div className="flex flex-wrap items-center gap-1">
              <div
                className="inline-flex items-center rounded-full p-[1px]"
                style={{ background: BRAND_GRADIENT }}
              >
                <div className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5">
                  <Zap className="h-2.5 w-2.5 shrink-0" style={{ color: '#0072FF' }} />
                  <span
                    className="bg-clip-text text-[9.5px] font-extrabold tracking-tight text-transparent"
                    style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
                  >
                    Quick Access Bar · {expandedGroup ? expandedGroup.label : 'Command Centre'}
                  </span>
                </div>
              </div>

              <Link
                to="/our-participants"
                className="inline-flex h-[20px] items-center justify-center gap-1 rounded-full border border-[#00C6FF] bg-[#0072FF] px-2.5 text-[9px] font-extrabold uppercase tracking-wide text-white transition hover:opacity-95"
              >
                <Heart className="h-2.5 w-2.5 shrink-0 text-[#00C6FF]" />
                <span className="whitespace-nowrap">Participant Profiles</span>
              </Link>

              <button
                type="button"
                onClick={() => switchWorkspaceView('both')}
                aria-pressed={workspaceView === 'both'}
                className="inline-flex h-[20px] items-center justify-center gap-1 rounded-full border border-[#00C6FF] px-2.5 text-[9px] font-extrabold uppercase tracking-wide text-white transition hover:opacity-95"
                style={{
                  background: 'linear-gradient(90deg, #00C6FF 0%, #0072FF 50%, #FF2E9A 100%)',
                  color: '#FFFFFF',
                }}
              >
                <Layers className="h-2.5 w-2.5 shrink-0 text-[#00C6FF]" />
                <span className="whitespace-nowrap">Both Views</span>
              </button>

              <Link
                to="/register"
                className="inline-flex h-[20px] items-center justify-center gap-1 rounded-full border border-white/25 bg-[#FF2E9A] px-2.5 text-[9px] font-extrabold uppercase tracking-wide text-white transition hover:opacity-95"
              >
                <span className="whitespace-nowrap">Start Free</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <div
                className="inline-flex items-center rounded-full p-[1px]"
                style={{ background: BRAND_GRADIENT }}
              >
                <div className="inline-flex items-center gap-0.5 rounded-full bg-white p-0.5">
                  {[
                    { id: 'pillars5', label: '5 Pillars' },
                    { id: 'os11', label: '13 Channels' },
                    { id: 'all', label: 'All 45' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => switchRemoteMode(m.id)}
                      className={`rounded-full px-1.5 py-0 text-[8px] font-extrabold transition ${
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
                  className="inline-flex h-[20px] items-center gap-1 rounded-full bg-white px-2 text-[8px] font-extrabold text-[#0A2B6D] transition hover:bg-[#F5F0FF]"
                >
                  <span style={{ color: '#0A2B6D' }}>Open {expandedGroup.label.replace(/^\d+\.\s*/, '')}</span>
                  <ArrowRight className="h-2 w-2 text-[#0072FF]" />
                </Link>
              )}
            </div>
          </div>

          {/* LINE 2: 50%-Reduced Compact Section Modulars (Tight Grid Without Gaps) */}
          <div
            className="grid grid-cols-3 gap-1 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-7 items-stretch"
            style={{ background: DARK_NAVY_CHASSIS }}
          >
            <Link
              to="/assistant"
              title="AI Core Hub"
              className="group block w-full text-left rounded-md p-[1px] transition-all duration-150"
              style={{ background: BRAND_GRADIENT }}
            >
              <div className="flex h-[22px] items-center justify-between gap-1 rounded-[5px] bg-black px-1.5">
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <span
                    className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] bg-black"
                    style={{ border: '1px solid #0072FF' }}
                  >
                    <Cpu className="h-2 w-2 shrink-0" style={{ color: '#0072FF' }} />
                  </span>
                  <span className="min-w-0 truncate text-[9.5px] font-extrabold leading-none text-white">
                    AI Core
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-[2px] bg-black"
                  style={{ border: '1px solid #0072FF' }}
                >
                  <span className="h-1 w-1 rounded-[1px]" style={{ backgroundColor: '#0072FF' }} />
                </span>
              </div>
            </Link>

            {sourceSections.map((item, gIdx) => {
              const isSelectedSection = expandedGroup?.id === item.id;
              const Icon = item.icon || item.modules[0]?.icon || Cpu;
              const symColor = APP_DESIGN_COLOURS[gIdx % APP_DESIGN_COLOURS.length];

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectMajorSection(item, true)}
                  aria-expanded={isSelectedSection}
                  title={item.label}
                  className={`group block w-full text-left rounded-md p-[1px] transition-all duration-150 focus-visible:outline-none ${
                    isSelectedSection ? 'ring-1 ring-[#00C6FF]' : ''
                  }`}
                  style={{ background: BRAND_GRADIENT }}
                >
                  <div className="flex h-[22px] items-center justify-between gap-1 rounded-[5px] bg-black px-1.5">
                    <div className="flex min-w-0 flex-1 items-center gap-1">
                      <span
                        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] bg-black"
                        style={{ border: `1px solid ${symColor}` }}
                      >
                        <Icon className="h-2 w-2 shrink-0" style={{ color: symColor }} />
                      </span>
                      <span className="min-w-0 truncate text-[9.5px] font-extrabold leading-none text-white">
                        {item.label}
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-[2px] bg-black"
                      style={{ border: `1px solid ${symColor}` }}
                    >
                      <span className="h-1 w-1 rounded-[1px]" style={{ backgroundColor: symColor }} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* LINE 3: Active Section's 50%-Reduced Compact Module Buttons */}
          {expandedGroup && expandedGroup.modules?.length > 0 && (
            <div className="grid grid-cols-3 gap-1 border-t border-white/10 pt-1 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 items-stretch">
              {expandedGroup.modules.map((module, mIdx) => {
                const Icon = module.icon;
                const modActive = isActive(module.path);
                const modColor = APP_DESIGN_COLOURS[mIdx % APP_DESIGN_COLOURS.length];
                return (
                  <Link
                    key={`${expandedGroup.id}-${module.key}`}
                    to={module.path}
                    aria-current={modActive ? 'page' : undefined}
                    title={module.label}
                    className={`group block w-full text-left rounded-md p-[1px] transition-all duration-150 ${
                      modActive ? 'ring-1 ring-[#00C6FF]' : ''
                    }`}
                    style={{ background: BRAND_GRADIENT }}
                  >
                    <div className="flex h-[22px] items-center justify-between gap-1 rounded-[5px] bg-black px-1.5">
                      <div className="flex min-w-0 flex-1 items-center gap-1">
                        <span
                          className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] bg-black"
                          style={{ border: `1px solid ${modColor}` }}
                        >
                          <Icon className="h-2 w-2 shrink-0" style={{ color: modColor }} />
                        </span>
                        <span className="min-w-0 truncate text-[9.5px] font-extrabold leading-none text-white">
                          {module.label}
                        </span>
                      </div>
                      <span
                        aria-hidden="true"
                        className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-[2px] bg-black"
                        style={{ border: `1px solid ${modColor}` }}
                      >
                        <span className="h-1 w-1 rounded-[1px]" style={{ backgroundColor: modColor }} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}