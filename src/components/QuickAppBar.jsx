import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import { MODULE_DIRECTORY, NAV_GROUPS } from '@/lib/moduleDirectory';
import { useRole } from '@/lib/useRole';
import { canAccessNav } from '@/lib/roles';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const MISSION_REMOTE_BG =
  'radial-gradient(circle at 50% 40%, rgba(0, 198, 255, 0.20) 0%, rgba(90, 0, 214, 0.34) 40%, rgba(10, 43, 109, 0.96) 80%, #061539 100%)';

const POD_LIVE_BADGES = {
  'Dashboard & Executive': { metric: '2 actions due', ring: '#00C6FF', pct: 94 },
  'People & Profiles': { metric: '7 reviews due', ring: '#0072FF', pct: 90 },
  'Communications & Workforce': { metric: '12 shifts today', ring: '#00C6FF', pct: 92 },
  'Safety, Risk & Incidents': { metric: '1 critical', ring: '#FF2E9A', pct: 96, pulse: true },
  'Compliance & Evidence': { metric: '2 actions due', ring: '#A100FF', pct: 95 },
  'Training & Capability': { metric: '3 certs due', ring: '#FF6EDB', pct: 89 },
  'Finance & Commercial': { metric: '99.4% matched', ring: '#00C6FF', pct: 94 },
  'HR, Growth & Community': { metric: '100% screened', ring: '#0072FF', pct: 96 },
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
        className="preserve-island-theme overflow-hidden rounded-3xl border-2 border-[#00C6FF]/45 shadow-[0_14px_40px_-12px_rgba(10,43,109,0.65)]"
        style={{ background: MISSION_REMOTE_BG }}
      >
        <div className="h-1.5 w-full" style={{ background: BRAND_GRADIENT }} />

        {/* Centred Header Bar on White Surface */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white shadow-xs"
              style={{ background: BRAND_GRADIENT }}
            >
              <Zap className="h-3 w-3" />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0A2B6D] px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-[#00C6FF]">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#00C6FF] animate-pulse"
                style={{ boxShadow: '0 0 6px 1px #00C6FF' }}
              />
              ◉ REMOTE NAVIGATOR ROUTER
            </span>
          </div>

          <h2
            className="text-center text-xs sm:text-sm font-extrabold tracking-tight text-[#0A2B6D]"
            style={{ color: '#0A2B6D' }}
          >
            Premium Remote + Mission Control Navigator Pods — Click Any Circular Pod to Open Modules
          </h2>

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D]/30 bg-[#F5F0FF] px-2.5 py-0.5 text-[9px] font-extrabold text-[#0A2B6D] hover:border-[#0072FF]"
          >
            {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            <span style={{ color: '#0A2B6D' }}>{collapsed ? 'Expand Pods' : 'Compact'}</span>
          </button>
        </div>

        {/* Glowing Circular Control Pods Router + Central AI Core Pod */}
        {!collapsed && (
          <div className="p-3">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {/* Central AI Core Router Pod */}
              <Link
                to="/assistant"
                title="AI Core — 14 live recommendations"
                className="group relative flex h-28 w-28 sm:h-32 sm:w-32 flex-col items-center justify-center rounded-full p-1.5 text-center transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                style={{
                  background: BRAND_GRADIENT,
                  boxShadow:
                    '0 0 28px rgba(0, 198, 255, 0.75), 0 0 50px rgba(255, 46, 154, 0.4), inset 0 2px 6px rgba(255,255,255,0.55)',
                }}
              >
                <div
                  className="flex h-full w-full flex-col items-center justify-center rounded-full border border-white/40 px-2 py-1.5 backdrop-blur-xl"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 25%, rgba(0,198,255,0.4) 0%, rgba(90,0,214,0.88) 55%, #061539 100%)',
                  }}
                >
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[8.5px] font-black text-[#0A2B6D]">
                    <Cpu className="h-2.5 w-2.5 text-[#5A00D6]" />
                    <span style={{ color: '#0A2B6D' }}>◉ AI Core</span>
                  </span>
                  <span
                    className="mt-1 rounded-full bg-[#0A2B6D]/90 px-2 py-0.5 text-[8.5px] font-extrabold text-[#00C6FF] border border-[#00C6FF]/50"
                    style={{ color: '#00C6FF' }}
                  >
                    14 recommendations
                  </span>
                  <span className="mt-0.5 text-[7.5px] font-bold text-white/90" style={{ color: '#FFFFFF' }}>
                    Mission Hub
                  </span>
                </div>
              </Link>

              {/* Category Circular Control Pods */}
              {quickGroups.map((item, idx) => {
                const active =
                  selectedGroup === item.label ||
                  item.modules.some((module) => isActive(module.path));
                const Icon = item.modules[0].icon;
                const meta = POD_LIVE_BADGES[item.label] || {
                  metric: `${item.modules.length} modules`,
                  ring: idx % 2 === 0 ? '#00C6FF' : '#FF6EDB',
                  pct: 90,
                };
                const dashArray = 2 * Math.PI * 44;
                const dashOffset = dashArray - (dashArray * meta.pct) / 100;

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
                    className={`group relative flex h-28 w-28 sm:h-32 sm:w-32 flex-col items-center justify-center rounded-full p-1.5 text-center transition-all duration-300 hover:-translate-y-1 hover:scale-105 focus:outline-none ${
                      active ? 'scale-105' : ''
                    }`}
                    style={{
                      background:
                        'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.28) 0%, rgba(10, 43, 109, 0.92) 70%, #061539 100%)',
                      boxShadow: active
                        ? `0 0 28px ${meta.ring}, inset 0 2px 6px rgba(255,255,255,0.5)`
                        : `0 10px 24px -6px rgba(0,0,0,0.55), 0 0 14px ${meta.ring}66, inset 0 2px 4px rgba(255,255,255,0.3)`,
                    }}
                  >
                    {/* Animated Notification Ring */}
                    <svg
                      className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="44"
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="44"
                        fill="none"
                        stroke={meta.ring}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                      />
                    </svg>

                    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-full border border-white/25 bg-white/10 px-2 py-1.5 backdrop-blur-md">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm"
                        style={{ background: BRAND_GRADIENT }}
                      >
                        <Icon className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                      </span>

                      <div className="mt-1 inline-flex max-w-full items-center gap-0.5 rounded-full bg-white px-2 py-0.5 shadow-2xs">
                        <span
                          className={`text-[9px] leading-none ${meta.pulse ? 'animate-ping' : ''}`}
                          style={{ color: meta.ring }}
                        >
                          ◉
                        </span>
                        <span
                          className="truncate text-[8.5px] font-extrabold text-[#0A2B6D]"
                          style={{ color: '#0A2B6D' }}
                        >
                          {item.label.split('&')[0].trim()}
                        </span>
                      </div>

                      <span
                        className="mt-1 rounded-full px-2 py-0 text-[8px] font-black text-white"
                        style={{
                          backgroundColor: meta.pulse ? '#FF2E9A' : 'rgba(6, 21, 57, 0.88)',
                          border: `1px solid ${meta.ring}`,
                          color: '#FFFFFF',
                        }}
                      >
                        {meta.metric}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Expanded Sub-Module Circular & Pill Pods */}
        {!collapsed && expandedGroup && (
          <div id="quick-access-modules" className="px-3 pb-3">
            <nav
              aria-label={expandedGroup.label}
              className="rounded-2xl border border-white/25 bg-white/10 p-3 backdrop-blur-xl"
            >
              <p
                className="mb-2 text-center text-[10.5px] font-extrabold uppercase tracking-widest text-[#00C6FF]"
                style={{ color: '#00C6FF' }}
              >
                ◉ {expandedGroup.label} — Direct Control Pods
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {expandedGroup.modules.map((module) => {
                  const Icon = module.icon;
                  const modActive = isActive(module.path);
                  return (
                    <Link
                      key={module.key}
                      to={module.path}
                      aria-current={modActive ? 'page' : undefined}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold transition-all duration-200 hover:-translate-y-0.5 ${
                        modActive
                          ? 'border-[#00C6FF] bg-white text-[#0A2B6D] shadow-[0_0_16px_rgba(0,198,255,0.75)]'
                          : 'border-white/30 bg-white/95 text-[#0A2B6D] hover:border-[#00C6FF] hover:shadow-[0_0_12px_rgba(0,198,255,0.5)]'
                      }`}
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                        style={{ background: BRAND_GRADIENT }}
                      >
                        <Icon className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                      </span>
                      <span style={{ color: '#0A2B6D' }}>◉ {module.label}</span>
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