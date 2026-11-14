import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import { MODULE_DIRECTORY, NAV_GROUPS, buildNavigationGroups } from '@/lib/moduleDirectory';
import { useAuth } from '@/lib/AuthContext';
import {
  LogOut,
} from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #A855F7 50%, #FF2E9A 100%)';

const DARK_NAVY_CHASSIS = 'linear-gradient(165deg, #0A2B6D 0%, #0A2B6D 55%, #5A00D6 100%)';

// Strict repeating symbol & square indicator sequence: Blue, Purple, Pink, Blue, Purple, Pink...
const SYMBOL_COLOR_SEQUENCE = ['#0072FF', '#A855F7', '#FF2E9A'];

// Keep legacy export names and stored modes compatible; derive contents centrally.
export const PRIMARY_11_OS_NAV = buildNavigationGroups();
export const FOCUSED_5_PILLAR_NAV = buildNavigationGroups(MODULE_DIRECTORY, [
  { id: 'pillar-today', label: '1. My Workspace', keys: NAV_GROUPS[0].keys },
  { id: 'pillar-people', label: '2. People & Service Delivery', keys: [...NAV_GROUPS[1].keys, ...NAV_GROUPS[2].keys] },
  { id: 'pillar-workforce', label: '3. Workforce & Communication', keys: [...NAV_GROUPS[3].keys, ...NAV_GROUPS[4].keys] },
  { id: 'pillar-safety', label: '4. Safety, Quality & Evidence', keys: [...NAV_GROUPS[5].keys, ...NAV_GROUPS[6].keys] },
  { id: 'pillar-audit', label: '5. Business & Administration', keys: [...NAV_GROUPS[7].keys, ...NAV_GROUPS[8].keys, ...NAV_GROUPS[9].keys] },
]);

function restrictGroups(groups, modules) {
  const paths = new Set(modules.map((module) => module.path));
  return groups.map((group) => {
    const children = group.children.filter((child) => paths.has(child.path));
    return children.length ? { ...group, children, path: children[0].path } : null;
  }).filter(Boolean);
}

export default function ObsidianSidebarRemote({
  visiblePrimary,
  isActive: isActiveProp,
  navLabel: navLabelProp,
  onLogout,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [navMode, setNavMode] = useState(() => localStorage.getItem('chr-active-remote-mode') || 'os11');
  const [selectedPillarId, setSelectedPillarId] = useState(
    () => localStorage.getItem('chr-active-remote-pillar') || 'my-workspace'
  );
  const prevPathnameRef = useRef(location.pathname);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  React.useEffect(() => {
    if (prevPathnameRef.current === location.pathname) return;
    prevPathnameRef.current = location.pathname;
    setCollapsedGroups({});
    const list = navMode === 'pillars5' ? focusedGroups : primaryGroups;
    const currentStillMatches = list.some(
      (p) =>
        p.id === selectedPillarId &&
        (location.pathname === p.path ||
          p.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`)))
    );
    if (currentStillMatches) return;
    const match = list.find(
      (p) =>
        location.pathname === p.path ||
        p.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`))
    );
    if (match) {
      setSelectedPillarId(match.id);
      localStorage.setItem('chr-active-remote-pillar', match.id);
    }
  }, [location.pathname, navMode, selectedPillarId]);

  React.useEffect(() => {
    const onPillarSync = (e) => {
      if (e?.detail?.pillarId) setSelectedPillarId(e.detail.pillarId);
      if (e?.detail?.navMode) setNavMode(e.detail.navMode);
    };
    window.addEventListener('chr-remote-pillar-select', onPillarSync);
    return () => window.removeEventListener('chr-remote-pillar-select', onPillarSync);
  }, []);

  const scrollWorkspaceToTop = () => {
    const mainEl = document.getElementById('main-workspace-content');
    if (mainEl && typeof mainEl.scrollTo === 'function') {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openMajorSectionInMainView = (pillar, modeOverride, shouldNavigate = true) => {
    if (!pillar) return;
    const activeMode = modeOverride || navMode;
    setSelectedPillarId(pillar.id);
    localStorage.setItem('chr-active-remote-pillar', pillar.id);
    localStorage.setItem('chr-active-remote-mode', activeMode);
    window.dispatchEvent(
      new CustomEvent('chr-remote-pillar-select', {
        detail: { pillarId: pillar.id, navMode: activeMode, pillar },
      })
    );
    const canAutoRoute = location.pathname !== '/' || isAuthenticated;
    if (shouldNavigate && canAutoRoute && pillar?.path && location.pathname !== pillar.path) {
      navigate(pillar.path);
    }
    scrollWorkspaceToTop();
  };

  const sourceList =
    Array.isArray(visiblePrimary)
      ? visiblePrimary
      : MODULE_DIRECTORY;

  const isActive =
    isActiveProp ||
    ((path) =>
      location.pathname === path ||
      (path !== '/' && location.pathname.startsWith(`${path}/`)));

  const navLabel = navLabelProp || ((item) => item.label);

  const modules = sourceList.filter(
    (item) =>
      !(item.key === 'staff-progress' && sourceList.some((entry) => entry.key === 'staff')) &&
      !['company-safe', 'universal-storage', 'registers', 'record-intelligence'].includes(item.key)
  );

  const primaryGroups = restrictGroups(PRIMARY_11_OS_NAV, modules);
  const focusedGroups = restrictGroups(FOCUSED_5_PILLAR_NAV, modules);

  return (
    <div
      className="preserve-island-theme flex w-full min-w-0 flex-col select-none"
      style={{ background: DARK_NAVY_CHASSIS }}
    >
      <section
        className="flex flex-col shadow-2xl"
        style={{ background: DARK_NAVY_CHASSIS }}
      >
        <div className="h-1.5 w-full shrink-0" style={{ background: BRAND_GRADIENT }} />

        <div className="flex shrink-0 flex-col items-center justify-end gap-1 bg-white px-1.5 pt-1 pb-1 text-center">
          <Link
            to="/dashboard"
            aria-label="ComplianceHR Infinity Home"
            className="flex w-full items-center justify-center"
          >
            <BrandLogoLockup size="xs" theme="light" lightBackground showSlogan compactSlogan className="w-full" />
          </Link>

          {/* Remote Control Mode Switcher (Blue, Purple, Pink with White Writing) */}
          <div
            className="grid w-full shrink-0 grid-cols-3 gap-0.5 rounded-lg p-[1.5px]"
            style={{ background: BRAND_GRADIENT }}
          >
            <button
              type="button"
              onClick={() => {
                setNavMode('pillars5');
                const match =
                  focusedGroups.find(
                    (p) =>
                      location.pathname === p.path ||
                      p.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`))
                  ) || focusedGroups[0];
                openMajorSectionInMainView(match, 'pillars5', false);
              }}
              className={`min-h-[26px] min-w-0 whitespace-nowrap rounded-[6px] px-0.5 py-0.5 text-[10px] font-extrabold tracking-tight text-white transition-all ${
                navMode === 'pillars5' ? 'ring-2 ring-white' : 'opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: '#0072FF',
                color: '#FFFFFF',
              }}
            >
              ◉ 5 Pillars
            </button>
            <button
              type="button"
              onClick={() => {
                setNavMode('os11');
                const match =
                  primaryGroups.find(
                    (p) =>
                      location.pathname === p.path ||
                      p.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`))
                  ) || primaryGroups[0];
                openMajorSectionInMainView(match, 'os11', false);
              }}
              className={`min-h-[26px] min-w-0 whitespace-nowrap rounded-[6px] px-0.5 py-0.5 text-[10px] font-extrabold tracking-tight text-white transition-all ${
                navMode === 'os11' ? 'ring-2 ring-white' : 'opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: '#A855F7',
                color: '#FFFFFF',
              }}
            >
              ◉ 10 Groups
            </button>
            <button
              type="button"
              onClick={() => {
                setNavMode('all');
                localStorage.setItem('chr-active-remote-mode', 'all');
                window.dispatchEvent(
                  new CustomEvent('chr-remote-pillar-select', {
                    detail: { pillarId: selectedPillarId, navMode: 'all' },
                  })
                );
              }}
              className={`min-h-[26px] min-w-0 whitespace-nowrap rounded-[6px] px-0.5 py-0.5 text-[10px] font-extrabold tracking-tight text-white transition-all ${
                navMode === 'all' ? 'ring-2 ring-white' : 'opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: '#FF2E9A',
                color: '#FFFFFF',
              }}
            >
              ◉ All {modules.length}
            </button>
          </div>
        </div>

        <div className="h-[2px] w-full shrink-0" style={{ background: BRAND_GRADIENT }} />

        {/* Navigation Router Buttons: White Writing, Blue-Purple-Pink Symbols, Square Indicator Button Without Text */}
        <nav
          aria-label="Page navigation"
          className="flex-1 p-1.5 space-y-1"
          style={{ background: DARK_NAVY_CHASSIS }}
        >
          {(() => {
            let colorCounter = 0;
            const nextSymbolColor = () => {
              const color = SYMBOL_COLOR_SEQUENCE[colorCounter % SYMBOL_COLOR_SEQUENCE.length];
              colorCounter += 1;
              return color;
            };

            if (navMode === 'os11' || navMode === 'pillars5') {
              const list = navMode === 'pillars5' ? focusedGroups : primaryGroups;
              return list.map((pillar) => {
                const Icon = pillar.icon;
                const symColor = nextSymbolColor();
                const pillarActive =
                  selectedPillarId === pillar.id ||
                  isActive(pillar.path) ||
                  pillar.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`));

                return (
                  <div key={pillar.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCollapsedGroups((previous) => ({ ...previous, [pillar.id]: !(previous[pillar.id] ?? !pillarActive) }));
                        openMajorSectionInMainView(pillar, undefined, false);
                      }}
                      aria-expanded={!(collapsedGroups[pillar.id] ?? !pillarActive)}
                      title={pillar.label}
                      className={`group block w-full text-left rounded-lg p-[1.5px] transition-all duration-150 focus-visible:outline-none ${
                        pillarActive
                          ? 'shadow-[0_0_12px_rgba(0,114,255,0.85)]'
                          : 'shadow-[0_0_5px_rgba(168,85,247,0.35)] hover:shadow-[0_0_10px_rgba(255,46,154,0.65)]'
                      }`}
                      style={{ background: BRAND_GRADIENT }}
                    >
                      <div
                        className="flex h-[38px] items-center justify-between gap-1.5 overflow-hidden rounded-[7px] bg-[#0A2B6D]/90 px-2"
                        style={{ background: 'linear-gradient(135deg, #0A2B6D, #16468A)' }}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span
                            className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[4px] bg-[#0A2B6D]/90"
                            style={{
                              border: `1.5px solid ${symColor}`,
                              boxShadow: `0 0 6px ${symColor}66`,
                            }}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: symColor }} />
                          </span>
                          <span
                            className="min-w-0 truncate text-[13.5px] font-black leading-tight tracking-tight text-white"
                            style={{ color: '#FFFFFF' }}
                          >
                            {pillar.label}
                          </span>
                        </div>

                        {/* Square Indicator Button (No Text) */}
                        <span
                          aria-hidden="true"
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-[#0A2B6D]/90"
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
                    </button>

                    {!(collapsedGroups[pillar.id] ?? !pillarActive) && pillar.children?.length > 0 && (
                      <div className="mt-1 space-y-1 pl-2 border-l-2 border-[#A855F7]/70">
                        {pillar.children.map((child, cIdx) => {
                          const childSymColor = nextSymbolColor();
                          const matchedMod = MODULE_DIRECTORY.find((m) => m.path === child.path);
                          const ChildIcon = child.icon || matchedMod?.icon || Icon;
                          const childActive =
                            location.pathname === child.path ||
                            location.pathname.startsWith(`${child.path}/`);
                          return (
                            <Link
                              key={`${pillar.id}-${child.path}-${cIdx}`}
                              to={child.path}
                              onClick={scrollWorkspaceToTop}
                              title={child.label}
                              className={`group block w-full text-left rounded-lg p-[1.5px] transition-all duration-150 focus-visible:outline-none ${
                                childActive
                                  ? 'shadow-[0_0_12px_rgba(0,114,255,0.85)]'
                                  : 'shadow-[0_0_5px_rgba(168,85,247,0.35)] hover:shadow-[0_0_10px_rgba(255,46,154,0.65)]'
                              }`}
                              style={{ background: BRAND_GRADIENT }}
                            >
                              <div
                                className="flex h-[36px] items-center justify-between gap-1.5 overflow-hidden rounded-[7px] bg-[#0A2B6D]/90 px-2"
                                style={{ background: 'linear-gradient(135deg, #0A2B6D, #16468A)' }}
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  <span
                                    className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] bg-[#0A2B6D]/90"
                                    style={{
                                      border: `1.5px solid ${childSymColor}`,
                                      boxShadow: `0 0 6px ${childSymColor}66`,
                                    }}
                                  >
                                    <ChildIcon className="h-3.5 w-3.5 shrink-0" style={{ color: childSymColor }} />
                                  </span>
                                  <span
                                    className="min-w-0 truncate text-[13px] font-black leading-tight tracking-tight text-white"
                                    style={{ color: '#FFFFFF' }}
                                  >
                                    {child.label}
                                  </span>
                                </div>

                                {/* Square Indicator Button (No Text) */}
                                <span
                                  aria-hidden="true"
                                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-[#0A2B6D]/90"
                                  style={{
                                    border: `1.5px solid ${childSymColor}`,
                                    boxShadow: `0 0 7px ${childSymColor}88`,
                                  }}
                                >
                                  <span
                                    className="h-2 w-2 rounded-[2px]"
                                    style={{
                                      backgroundColor: childSymColor,
                                      boxShadow: `0 0 6px 1px ${childSymColor}`,
                                    }}
                                  />
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              });
            }

            return modules.map((item) => {
              const Icon = item.icon;
              const modSymColor = nextSymbolColor();
              const active = isActive(item.path);
              const label = navLabel(item);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={scrollWorkspaceToTop}
                  title={label}
                  className={`group block w-full text-left rounded-lg p-[1.5px] transition-all duration-150 focus-visible:outline-none ${
                    active
                      ? 'shadow-[0_0_12px_rgba(0,114,255,0.85)]'
                      : 'shadow-[0_0_5px_rgba(168,85,247,0.35)] hover:shadow-[0_0_10px_rgba(255,46,154,0.65)]'
                  }`}
                  style={{ background: BRAND_GRADIENT }}
                >
                  <div
                    className="flex h-[36px] items-center justify-between gap-1.5 overflow-hidden rounded-[7px] bg-[#0A2B6D]/90 px-2"
                    style={{ background: 'linear-gradient(135deg, #0A2B6D, #16468A)' }}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span
                        className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] bg-[#0A2B6D]/90"
                        style={{
                          border: `1.5px solid ${modSymColor}`,
                          boxShadow: `0 0 6px ${modSymColor}66`,
                        }}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: modSymColor }} />
                      </span>
                      <span
                        className="min-w-0 truncate text-[13px] font-black leading-tight tracking-tight text-white"
                        style={{ color: '#FFFFFF' }}
                      >
                        {label}
                      </span>
                    </div>

                    {/* Square Indicator Button (No Text) */}
                    <span
                      aria-hidden="true"
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-[#0A2B6D]/90"
                      style={{
                        border: `1.5px solid ${modSymColor}`,
                        boxShadow: `0 0 7px ${modSymColor}88`,
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-[2px]"
                        style={{
                          backgroundColor: modSymColor,
                          boxShadow: `0 0 6px 1px ${modSymColor}`,
                        }}
                      />
                    </span>
                  </div>
                </Link>
              );
            });
          })()}
        </nav>

        {onLogout && (
          <div className="shrink-0 p-1" style={{ background: DARK_NAVY_CHASSIS }}>
            <button
              type="button"
              onClick={onLogout}
              className="flex min-h-[30px] w-full items-center justify-center gap-1.5 rounded-md border border-[#0072FF] bg-[#0A2B6D]/90 px-2 py-1 text-xs font-extrabold text-white shadow-2xs transition hover:border-[#FF2E9A]"
            >
              <LogOut className="h-3.5 w-3.5 text-[#FF2E9A]" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}