import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Cpu, LayoutGrid, Heart, Layers } from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { PRIMARY_11_OS_NAV, FOCUSED_5_PILLAR_NAV } from '@/components/ObsidianSidebarRemote';
import { useAuth } from '@/lib/AuthContext';
import EnterpriseFloatingWorkspaceDock from '@/components/EnterpriseFloatingWorkspaceDock';
import '@/components/executive/executiveGlass.css';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const APP_DESIGN_COLOURS = ['#0072FF', '#A855F7', '#FF2E9A'];

export default function QuickAppBar({ workspaceView, onSwitchWorkspaceView }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [remoteMode, setRemoteMode] = useState(
    () => localStorage.getItem('chr-active-remote-mode') || 'os11'
  );
  const [selectedPillarId, setSelectedPillarId] = useState(
    () => localStorage.getItem('chr-active-remote-pillar') || 'dashboard-executive'
  );
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
    <div id="main-view-navigator-remote" className="scroll-mt-48 mx-auto w-full max-w-[1440px] bg-workspace-navy px-3 pt-1.5">
      <section
        aria-label="Quick Access Bar"
        className="preserve-island-theme executive-glass-surface overflow-hidden rounded-xl border border-header-foreground/20 shadow-panel"
      >
        <div className="overflow-hidden rounded-[10px] p-1.5 space-y-1 md:flex md:flex-col lg:block">
          {/* LINE 1: Quick Access Bar Title + AI Quick Ask & 4 Buttons Next To It + Mode Switcher */}
          <div className="flex flex-wrap items-center justify-start gap-1.5">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <div
                className="inline-flex min-w-0 items-center rounded-full p-[1px]"
                style={{ background: BRAND_GRADIENT }}
              >
                <div className="inline-flex min-w-0 items-center gap-1 rounded-full bg-workspace-navy px-2 py-0.5">
                  <Zap className="h-2.5 w-2.5 shrink-0" style={{ color: '#00C6FF' }} />
                  <span className="min-w-0 truncate text-[9.5px] font-extrabold tracking-tight text-white">
                    Quick Access Bar · {expandedGroup ? expandedGroup.label : 'Command Centre'}
                  </span>
                </div>
              </div>

              <div className="flex min-w-0 flex-wrap items-center gap-1">
              <div
                className="inline-flex max-w-full items-center rounded-full p-[1px]"
                style={{ background: BRAND_GRADIENT }}
              >
                <div className="flex max-w-full flex-wrap items-center gap-0.5 rounded-full bg-workspace-navy/80 p-0.5 backdrop-blur-md">
                  {[
                    { id: 'pillars5', label: '5 Pillars' },
                    { id: 'os11', label: '13 Channels' },
                    { id: 'all', label: 'All 45' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => switchRemoteMode(m.id)}
                      className={`min-h-9 whitespace-nowrap rounded-full px-3 py-1 text-xs font-extrabold transition ${
                        remoteMode === m.id
                          ? 'bg-brand text-header-foreground'
                          : 'text-header-foreground hover:bg-workspace-navy'
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
                  className="inline-flex min-h-9 max-w-full items-center gap-1 rounded-full border border-header-foreground/20 bg-workspace-navy/80 px-3 text-xs font-extrabold text-header-foreground backdrop-blur-md transition hover:bg-workspace-navy"
                >
                  <span className="truncate">Open {expandedGroup.label.replace(/^\d+\.\s*/, '')}</span>
                  <ArrowRight className="h-2 w-2 text-[#0072FF]" />
                </Link>
              )}
              </div>
            </div>
            <EnterpriseFloatingWorkspaceDock inline />
          </div>

          {/* LINE 2: 50%-Reduced Compact Section Modulars (Tight Grid Without Gaps) */}
          <div
            className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 items-stretch md:order-2 lg:order-none"
          >
            <Link
              to="/assistant"
              title="AI Core Hub"
              className="group block w-full rounded-md border border-header-foreground/20 bg-workspace-navy/80 p-[1px] text-left backdrop-blur-md transition-all duration-150"
            >
              <div className="flex min-h-11 items-center justify-between gap-2 rounded-[5px] bg-transparent px-2 py-1.5">
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] bg-[#0A2B6D]/90"
                    style={{ border: '1px solid #0072FF' }}
                  >
                    <Cpu className="h-3.5 w-3.5 shrink-0" style={{ color: '#0072FF' }} />
                  </span>
                  <span className="min-w-0 break-words text-xs font-extrabold leading-tight text-header-foreground">
                    AI Core
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-[2px] bg-[#0A2B6D]/90"
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
                  className={`group block w-full rounded-md border border-header-foreground/20 bg-workspace-navy/80 p-[1px] text-left backdrop-blur-md transition-all duration-150 focus-visible:outline-none ${
                    isSelectedSection ? 'ring-1 ring-[#00C6FF]' : ''
                  }`}
                >
                  <div className="flex min-h-11 items-center justify-between gap-2 rounded-[5px] bg-transparent px-2 py-1.5">
                    <div className="flex min-w-0 flex-1 items-center gap-1">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] bg-[#0A2B6D]/90"
                        style={{ border: `1px solid ${symColor}` }}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: symColor }} />
                      </span>
                      <span className="min-w-0 break-words text-xs font-extrabold leading-tight text-header-foreground">
                        {item.label}
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-[2px] bg-[#0A2B6D]/90"
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
            <div className="grid grid-cols-2 gap-1.5 border-t border-white/10 pt-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 items-stretch md:order-3 lg:order-none">
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
                    className={`group block w-full rounded-md border border-header-foreground/20 bg-workspace-navy/80 p-[1px] text-left backdrop-blur-md transition-all duration-150 ${
                      modActive ? 'ring-1 ring-[#00C6FF]' : ''
                    }`}
                  >
                    <div className="flex min-h-11 items-center justify-between gap-2 rounded-[5px] bg-transparent px-2 py-1.5">
                      <div className="flex min-w-0 flex-1 items-center gap-1">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] bg-[#0A2B6D]/90"
                          style={{ border: `1px solid ${modColor}` }}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: modColor }} />
                        </span>
                        <span className="min-w-0 break-words text-xs font-extrabold leading-tight text-header-foreground">
                          {module.label}
                        </span>
                      </div>
                      <span
                        aria-hidden="true"
                        className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-[2px] bg-[#0A2B6D]/90"
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
          {onSwitchWorkspaceView && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-white/10 pt-1 md:order-1 lg:order-none">
              <Link to="/login" className="hidden min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-white/20 bg-[#00C6FF] px-2.5 text-[10px] font-extrabold text-workspace-navy shadow-[0_0_10px_rgba(0,198,255,0.5)] transition hover:opacity-90 md:inline-flex lg:hidden">Sign In</Link>
              <Link to="/?demo=book" className="hidden min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[#00C6FF]/50 bg-[#0072FF] px-2.5 text-[10px] font-extrabold text-white shadow-[0_0_10px_rgba(0,114,255,0.55)] transition hover:opacity-90 md:inline-flex lg:hidden">Book Demo</Link>
              <Link to="/register" className="hidden min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-white/25 bg-[#FF2E9A] px-2.5 text-[10px] font-extrabold text-white shadow-[0_0_10px_rgba(255,46,154,0.55)] transition hover:opacity-90 md:inline-flex lg:hidden">Start Free</Link>
              <Link
                to="/our-participants"
                className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1 rounded-full border border-[#00C6FF] bg-[#0072FF] px-3 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-[0_0_10px_rgba(0,114,255,0.5)] transition hover:opacity-95"
              >
                <Heart className="h-3 w-3 shrink-0 text-[#00C6FF]" />
                <span className="whitespace-nowrap">Participant Profiles</span>
              </Link>
              <button
                type="button"
                onClick={() => onSwitchWorkspaceView('both')}
                aria-pressed={workspaceView === 'both'}
                title="Both Views"
                className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1 rounded-full border px-3 text-[10px] font-extrabold tracking-wide shadow-[0_0_10px_rgba(0,198,255,0.5)] transition-all hover:opacity-95"
                style={{ background: 'linear-gradient(90deg, #00C6FF 0%, #0072FF 50%, #FF2E9A 100%)', borderColor: '#00C6FF', color: '#FFFFFF' }}
              >
                <Layers className="h-3 w-3 shrink-0" style={{ color: '#00C6FF' }} />
                <span className="whitespace-nowrap uppercase">Both Views</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}