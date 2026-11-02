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
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-2">
          <div className="flex items-center gap-1.5">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white shadow-xs"
              style={{ background: BRAND_GRADIENT }}
            >
              <Zap className="h-3 w-3" />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0A2B6D] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#00C6FF]">
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
            className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D]/30 bg-[#F5F0FF] px-3 py-1 text-[10px] font-extrabold text-[#0A2B6D] hover:border-[#0072FF]"
          >
            {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            <span style={{ color: '#0A2B6D' }}>{collapsed ? 'Expand Pods' : 'Compact'}</span>
          </button>
        </div>

        {/* Glowing Circular Control Pods Router + Central AI Core Pod — Spacious Grid Where All Words Fit */}
        {!collapsed && (
          <div className="p-3.5">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 items-stretch">
              {/* Central AI Core Router Pod */}
              <Link
                to="/assistant"
                title="AI Core — 14 live recommendations"
                className="group relative flex items-center gap-3 rounded-full border-2 border-[#00C6FF] p-2.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01]"
                style={{
                  background:
                    'radial-gradient(circle at 30% 25%, rgba(0,198,255,0.4) 0%, rgba(90,0,214,0.88) 55%, #061539 100%)',
                  boxShadow:
                    '0 0 24px rgba(0, 198, 255, 0.65), inset 0 2px 6px rgba(255,255,255,0.45)',
                }}
              >
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                  <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3.5" />
                    <circle
                      cx="24"
                      cy="24"
                      r="21"
                      fill="none"
                      stroke="#00C6FF"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="132"
                      strokeDashoffset="10"
                    />
                  </svg>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#5A00D6] shadow-sm">
                    <Cpu className="h-4 w-4 text-[#5A00D6]" />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
                    <span className="text-[#0072FF]">◉</span>
                    <span style={{ color: '#0A2B6D' }}>AI Core</span>
                  </span>
                  <div
                    className="mt-1 text-[10.5px] font-extrabold text-[#00C6FF] leading-tight"
                    style={{ color: '#00C6FF' }}
                  >
                    14 recommendations
                  </div>
                </div>
              </Link>

              {/* Category Circular Control Pods — Full Unclipped Labels & Live Metrics */}
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
                const r = 21;
                const dashArray = 2 * Math.PI * r;
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
                    className={`group relative flex items-center gap-2.5 rounded-full border border-white/30 bg-white/10 p-2.5 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00C6FF] focus:outline-none ${
                      active ? 'ring-2 ring-[#00C6FF] scale-[1.01]' : ''
                    }`}
                    style={{
                      background:
                        'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.24) 0%, rgba(10, 43, 109, 0.92) 72%, #061539 100%)',
                      boxShadow: active
                        ? `0 0 24px ${meta.ring}99, inset 0 2px 5px rgba(255,255,255,0.45)`
                        : `0 8px 20px -6px rgba(0,0,0,0.5), 0 0 12px ${meta.ring}44, inset 0 1px 3px rgba(255,255,255,0.25)`,
                    }}
                  >
                    {/* Glowing Circular Ring Orb */}
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                      <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="3.5" />
                        <circle
                          cx="24"
                          cy="24"
                          r={r}
                          fill="none"
                          stroke={meta.ring}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={dashArray}
                          strokeDashoffset={dashOffset}
                        />
                      </svg>
                      <span
                        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm"
                        style={{ background: BRAND_GRADIENT }}
                      >
                        <Icon className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                      </span>
                    </div>

                    {/* Full Label on White Pill + Live Metric Underneath */}
                    <div className="min-w-0 flex-1">
                      <div className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-0.5 shadow-2xs">
                        <span
                          className={`text-[10px] leading-none ${meta.pulse ? 'animate-ping' : ''}`}
                          style={{ color: meta.ring }}
                        >
                          ◉
                        </span>
                        <span
                          className="text-[10.5px] font-extrabold leading-tight text-[#0A2B6D]"
                          style={{ color: '#0A2B6D' }}
                        >
                          {item.label}
                        </span>
                      </div>

                      <div className="mt-1">
                        <span
                          className="inline-block rounded-full px-2.5 py-0.5 text-[9.5px] font-black text-white"
                          style={{
                            backgroundColor: meta.pulse ? '#FF2E9A' : 'rgba(6, 21, 57, 0.88)',
                            border: `1px solid ${meta.ring}`,
                            color: '#FFFFFF',
                          }}
                        >
                          {meta.metric}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Expanded Sub-Module Circular & Pill Pods */}
        {!collapsed && expandedGroup && (
          <div id="quick-access-modules" className="px-3.5 pb-3.5">
            <nav
              aria-label={expandedGroup.label}
              className="rounded-2xl border border-white/25 bg-white/10 p-3 backdrop-blur-xl"
            >
              <p
                className="mb-2 text-center text-xs font-extrabold uppercase tracking-widest text-[#00C6FF]"
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
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5 ${
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