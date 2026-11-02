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
  '1. Dashboard & Executive Command': { short: '1. Executive', metric: '2 actions due', ring: '#00C6FF', pct: 94 },
  '2. People, Intake & Profiles': { short: '2. People & Profiles', metric: '7 reviews due', ring: '#0072FF', pct: 90 },
  '3. Communications & Workforce': { short: '3. Comms & Roster', metric: '12 shifts today', ring: '#00C6FF', pct: 92 },
  '4. Incidents, Risk & Safety': { short: '4. Safety & Risks', metric: '1 critical', ring: '#FF2E9A', pct: 96, pulse: true },
  '5. Compliance, Quality & Evidence': { short: '5. Compliance', metric: '2 actions due', ring: '#A100FF', pct: 95 },
  '6. Training & Capability': { short: '6. Training & LMS', metric: '3 certs due', ring: '#FF6EDB', pct: 89 },
  '7. Finance & Commercial': { short: '7. Finance & Billing', metric: '99.4% matched', ring: '#00C6FF', pct: 94 },
  '8. Human Resources': { short: '8. HR Hub', metric: '100% screened', ring: '#0072FF', pct: 96 },
  '9. CRM, Growth & Relationships': { short: '9. CRM & Referrals', metric: 'Active leads', ring: '#A100FF', pct: 91 },
  '10. Governance & Strategy': { short: '10. Governance', metric: 'Board ready', ring: '#00C6FF', pct: 95 },
  '11. NDIS & Regulatory': { short: '11. NDIS Portal', metric: '8 standards', ring: '#0072FF', pct: 98 },
  '12. Community & Support Services': { short: '12. Community', metric: 'Local hub', ring: '#FF6EDB', pct: 90 },
  '13. Help, Knowledge & Support': { short: '13. Help & Guides', metric: '46 guides', ring: '#00C6FF', pct: 100 },
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
        className="preserve-island-theme overflow-hidden rounded-2xl border border-[#00C6FF]/50 shadow-md"
        style={{ background: MISSION_REMOTE_BG }}
      >
        <div className="h-1 w-full" style={{ background: BRAND_GRADIENT }} />

        {/* 50% Reduced Compact Header Bar on White Surface */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 bg-white px-2.5 py-1">
          <div className="flex items-center gap-1">
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: BRAND_GRADIENT }}
            >
              <Zap className="h-2.5 w-2.5" />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0A2B6D] px-2 py-0.2 text-[8px] font-black uppercase tracking-wider text-[#00C6FF]">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#00C6FF] animate-pulse"
                style={{ boxShadow: '0 0 5px 1px #00C6FF' }}
              />
              ◉ REMOTE NAVIGATOR ROUTER
            </span>
          </div>

          <h2
            className="text-center text-[10px] sm:text-[11px] font-extrabold tracking-tight text-[#0A2B6D]"
            style={{ color: '#0A2B6D' }}
          >
            50% Compact Circular Control Pods — Click Any Pod to Open Module Group
          </h2>

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D]/30 bg-[#F5F0FF] px-2 py-0.5 text-[9px] font-extrabold text-[#0A2B6D] hover:border-[#0072FF]"
          >
            {collapsed ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronUp className="h-2.5 w-2.5" />}
            <span style={{ color: '#0A2B6D' }}>{collapsed ? 'Show Pods' : 'Hide'}</span>
          </button>
        </div>

        {/* 50% Reduced Glowing Circular Control Pods Router + Central AI Core Pod */}
        {!collapsed && (
          <div className="p-1.5 sm:p-2">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 items-stretch">
              {/* Central AI Core Router Pod (50% Compact) */}
              <Link
                to="/assistant"
                title="AI Core — 14 live recommendations"
                className="group relative flex min-h-[42px] items-center gap-1.5 rounded-full border border-[#00C6FF] px-2 py-1 text-left transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background:
                    'radial-gradient(circle at 30% 25%, rgba(0,198,255,0.4) 0%, rgba(90,0,214,0.88) 55%, #061539 100%)',
                  boxShadow:
                    '0 0 14px rgba(0, 198, 255, 0.55), inset 0 1px 4px rgba(255,255,255,0.4)',
                }}
              >
                <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                  <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r="12" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" />
                    <circle
                      cx="14"
                      cy="14"
                      r="12"
                      fill="none"
                      stroke="#00C6FF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="75"
                      strokeDashoffset="6"
                    />
                  </svg>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#5A00D6] shadow-2xs">
                    <Cpu className="h-2.5 w-2.5 text-[#5A00D6]" />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="inline-flex max-w-full items-center gap-0.5 rounded-full bg-white px-1.5 py-0.2 text-[8.5px] font-extrabold leading-tight text-[#0A2B6D]">
                    <span className="text-[#0072FF]">◉</span>
                    <span className="truncate" style={{ color: '#0A2B6D' }}>AI Core</span>
                  </span>
                  <div
                    className="mt-0.5 text-[8px] font-extrabold text-[#00C6FF] leading-tight"
                    style={{ color: '#00C6FF' }}
                  >
                    14 insights
                  </div>
                </div>
              </Link>

              {/* Category Circular Control Pods — 50% Compact & Clean Data Fit */}
              {quickGroups.map((item, idx) => {
                const active =
                  selectedGroup === item.label ||
                  item.modules.some((module) => isActive(module.path));
                const Icon = item.modules[0].icon;
                const meta = POD_LIVE_BADGES[item.label] || {
                  short: item.label.replace(/^\d+\.\s*/, ''),
                  metric: `${item.modules.length} modules`,
                  ring: idx % 2 === 0 ? '#00C6FF' : '#FF6EDB',
                  pct: 90,
                };
                const r = 12;
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
                    className={`group relative flex min-h-[42px] items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-2 py-1 text-left backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00C6FF] focus:outline-none ${
                      active ? 'ring-1 ring-[#00C6FF] scale-[1.01]' : ''
                    }`}
                    style={{
                      background:
                        'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22) 0%, rgba(10, 43, 109, 0.92) 72%, #061539 100%)',
                      boxShadow: active
                        ? `0 0 14px ${meta.ring}88, inset 0 1px 4px rgba(255,255,255,0.4)`
                        : `0 4px 10px -4px rgba(0,0,0,0.45), 0 0 8px ${meta.ring}33`,
                    }}
                  >
                    {/* 50% Reduced Glowing Circular Ring Orb */}
                    <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                      <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 28 28">
                        <circle cx="14" cy="14" r={r} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2.5" />
                        <circle
                          cx="14"
                          cy="14"
                          r={r}
                          fill="none"
                          stroke={meta.ring}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray={dashArray}
                          strokeDashoffset={dashOffset}
                        />
                      </svg>
                      <span
                        className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-2xs"
                        style={{ background: BRAND_GRADIENT }}
                      >
                        <Icon className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                      </span>
                    </div>

                    {/* Concise Label on White Pill + Live Metric Underneath */}
                    <div className="min-w-0 flex-1">
                      <div className="inline-flex max-w-full items-center gap-0.5 rounded-full bg-white px-1.5 py-0.2 shadow-2xs">
                        <span
                          className={`text-[8px] leading-none shrink-0 ${meta.pulse ? 'animate-ping' : ''}`}
                          style={{ color: meta.ring }}
                        >
                          ◉
                        </span>
                        <span
                          className="text-[8.5px] font-extrabold leading-tight text-[#0A2B6D]"
                          style={{ color: '#0A2B6D' }}
                        >
                          {meta.short || item.label}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-center gap-1">
                        <span
                          className="inline-block rounded-full px-1.5 py-0 text-[7.5px] font-black leading-tight text-white"
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

        {/* Expanded Sub-Module Circular Control Pods (50% Compact) */}
        {!collapsed && expandedGroup && (
          <div id="quick-access-modules" className="px-2 pb-2">
            <nav
              aria-label={expandedGroup.label}
              className="rounded-xl border border-white/25 bg-white/10 p-2 backdrop-blur-xl"
            >
              <p
                className="mb-1.5 text-center text-[9.5px] font-extrabold uppercase tracking-wider text-[#00C6FF]"
                style={{ color: '#00C6FF' }}
              >
                ◉ {expandedGroup.label} — Direct Control Pods ({expandedGroup.modules.length} Modules)
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {expandedGroup.modules.map((module) => {
                  const Icon = module.icon;
                  const modActive = isActive(module.path);
                  return (
                    <Link
                      key={module.key}
                      to={module.path}
                      aria-current={modActive ? 'page' : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold transition-all duration-200 hover:-translate-y-0.5 ${
                        modActive
                          ? 'border-[#00C6FF] bg-white text-[#0A2B6D] shadow-[0_0_12px_rgba(0,198,255,0.75)]'
                          : 'border-white/30 bg-white/95 text-[#0A2B6D] hover:border-[#00C6FF] hover:shadow-[0_0_10px_rgba(0,198,255,0.5)]'
                      }`}
                    >
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white"
                        style={{ background: BRAND_GRADIENT }}
                      >
                        <Icon className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
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