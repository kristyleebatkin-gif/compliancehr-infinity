import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { MODULE_DIRECTORY, NAV_GROUPS } from '@/lib/moduleDirectory';
import { useRole } from '@/lib/useRole';
import { canAccessNav } from '@/lib/roles';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const DARK_NAVY_CHASSIS =
  'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)';

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
  const [collapsed, setCollapsed] = useState(() => location.pathname !== '/dashboard');

  useEffect(() => {
    setCollapsed(location.pathname !== '/dashboard');
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
        <div className="h-1 w-full" style={{ background: BRAND_GRADIENT }} />

        {/* Centred Dashboard & Organisational Operating System Title on White Background (50% Reduced Size) */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-1">
          <div className="flex items-center gap-1.5">
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md text-white"
              style={{ background: BRAND_GRADIENT }}
            >
              <Zap className="h-2.5 w-2.5" />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0A2B6D] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#00C6FF]">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#00C6FF]"
                style={{ boxShadow: '0 0 6px 1px #00C6FF' }}
              />
              LIVE OS
            </span>
          </div>

          <h2
            className="text-center text-[10.5px] sm:text-xs font-extrabold tracking-tight text-[#0A2B6D]"
            style={{ color: '#0A2B6D' }}
          >
            Dashboard &amp; Organisational Operating System Command (13 Categories · 2-Row Remote)
          </h2>

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#0A2B6D]/30 bg-[#F5F0FF] px-2 py-0.5 text-[8.5px] font-extrabold text-[#0A2B6D] hover:border-[#0072FF]"
          >
            {collapsed ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronUp className="h-2.5 w-2.5" />}
            <span style={{ color: '#0A2B6D' }}>{collapsed ? 'Show OS Remote' : 'Compact'}</span>
          </button>
        </div>

        {/* 50% Squashed Remote Control Buttons Fitted in Two Rows */}
        {!collapsed && (
          <div className="grid grid-cols-2 gap-1.5 p-2 sm:grid-cols-4 lg:grid-cols-7 items-stretch">
            {quickGroups.map((item) => {
              const active =
                selectedGroup === item.label ||
                item.modules.some((module) => isActive(module.path));
              const Icon = item.modules[0].icon;
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
                  className={`group flex min-h-[42px] flex-col rounded-xl p-[1.5px] text-left transition-all duration-200 focus-visible:outline-none ${
                    active
                      ? 'shadow-[0_0_14px_rgba(0,198,255,0.75)] scale-[1.01]'
                      : 'hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(161,0,255,0.45)]'
                  }`}
                  style={{ background: BRAND_GRADIENT }}
                >
                  <div className="flex flex-1 flex-col justify-between overflow-hidden rounded-[10px] bg-[#0A2B6D]/90 backdrop-blur-md">
                    {/* White Title Background */}
                    <div className="flex min-h-[22px] items-center justify-between gap-1 bg-white px-1.5 py-0.5">
                      <div className="flex min-w-0 items-center gap-1">
                        <span
                          className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded text-white"
                          style={{ background: BRAND_GRADIENT }}
                        >
                          <Icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                        </span>
                        <span
                          className="truncate text-[8.5px] font-extrabold leading-tight text-[#0A2B6D]"
                          style={{ color: '#0A2B6D' }}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: active ? '#00C6FF' : '#FF2E9A',
                          boxShadow: active ? '0 0 6px 1px #00C6FF' : 'none',
                        }}
                      />
                    </div>

                    {/* Dark Navy Glassmorphic Sub-Row */}
                    <div className="flex min-h-[18px] items-center justify-between gap-1 px-1.5 py-0.5">
                      <span
                        className="truncate text-[8px] font-bold leading-tight text-white/95"
                        style={{ color: '#FFFFFF' }}
                      >
                        {currentSub}
                      </span>
                      <ArrowRight className="h-2 w-2 shrink-0 text-[#00C6FF]" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!collapsed && (
          <div id="quick-access-modules">
            {expandedGroup && (
              <nav
                aria-label={expandedGroup.label}
                className="mx-2 mb-2 rounded-xl border border-white/25 bg-white/10 p-2 backdrop-blur-md"
              >
                <p
                  className="mb-1.5 text-center text-[10px] font-extrabold uppercase tracking-wider text-white"
                  style={{ color: '#FFFFFF' }}
                >
                  {expandedGroup.label} — Direct Remote Channels
                </p>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
                  {expandedGroup.modules.map((module) => {
                    const Icon = module.icon;
                    const modActive = isActive(module.path);
                    return (
                      <Link
                        key={module.key}
                        to={module.path}
                        aria-current={modActive ? 'page' : undefined}
                        className={`flex min-h-[28px] items-center justify-between gap-1.5 rounded-xl border px-2 py-1 text-[9.5px] font-extrabold transition-all ${
                          modActive
                            ? 'border-[#00C6FF] bg-white text-[#0A2B6D] shadow-[0_0_10px_rgba(0,198,255,0.6)]'
                            : 'border-white/25 bg-white text-[#0A2B6D] hover:border-[#00C6FF]'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-1">
                          <Icon className="h-3 w-3 shrink-0 text-[#5A00D6]" />
                          <span className="truncate" style={{ color: '#0A2B6D' }}>
                            {module.label}
                          </span>
                        </div>
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor: modActive ? '#00C6FF' : '#5A00D6',
                            boxShadow: modActive ? '0 0 6px 1px #00C6FF' : 'none',
                          }}
                        />
                      </Link>
                    );
                  })}
                </div>
              </nav>
            )}
          </div>
        )}
      </section>
    </div>
  );
}