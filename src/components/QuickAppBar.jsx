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

        {/* TOP 1/4 WHITE: Header Bar with Logo, Title, and Compact Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 bg-white px-3 py-1.5">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider text-white"
              style={{ background: BRAND_GRADIENT }}
            >
              <Zap className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF' }}>OS Remote</span>
            </span>
            <p className="text-[10.5px] font-extrabold text-[#0A2B6D]" style={{ color: '#0A2B6D' }}>
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

        {/* BOTTOM 3/4 DARK BLUE: Remote Control Buttons (Each Button Has Top 1/4 White + Bottom 3/4 Dark Blue) */}
        {!collapsed && (
          <div className="grid grid-cols-1 gap-2 p-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 items-stretch">
            {/* AI Core Button: Top 1/4 White + Bottom 3/4 Dark Blue */}
            <Link
              to="/assistant"
              title="AI Core — 14 live recommendations"
              className="group flex min-h-[60px] flex-col rounded-2xl p-[2px] text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(0,198,255,0.75)]"
              style={{ background: BRAND_GRADIENT }}
            >
              <div className="flex flex-1 flex-col justify-between overflow-hidden rounded-[14px] bg-[#0A2B6D]/90 backdrop-blur-md">
                {/* Top 1/4 White Title Bar */}
                <div className="flex min-h-[26px] items-center justify-between gap-1 bg-white px-2 py-0.5">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-white"
                      style={{ background: BRAND_GRADIENT }}
                    >
                      <Cpu className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    </span>
                    <span
                      className="text-[9.5px] font-extrabold leading-tight text-[#0A2B6D]"
                      style={{ color: '#0A2B6D' }}
                    >
                      AI Core Hub
                    </span>
                  </div>
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: '#00C6FF', boxShadow: '0 0 6px 1px #00C6FF' }}
                  />
                </div>

                {/* Bottom 3/4 Dark Navy Body */}
                <div className="flex flex-1 items-center justify-between gap-1 px-2 py-1">
                  <span
                    className="text-[8.5px] font-bold leading-tight text-white/95"
                    style={{ color: '#FFFFFF' }}
                  >
                    14 live recommendations
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#00C6FF]" />
                </div>
              </div>
            </Link>

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
                  className={`group flex min-h-[60px] flex-col rounded-2xl p-[2px] text-left transition-all duration-200 focus-visible:outline-none ${
                    active
                      ? 'shadow-[0_0_16px_rgba(0,198,255,0.75)] scale-[1.01]'
                      : 'hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(161,0,255,0.45)]'
                  }`}
                  style={{ background: BRAND_GRADIENT }}
                >
                  <div className="flex flex-1 flex-col justify-between overflow-hidden rounded-[14px] bg-[#0A2B6D]/90 backdrop-blur-md">
                    {/* Top 1/4 White Title Background */}
                    <div className="flex min-h-[26px] items-center justify-between gap-1 bg-white px-2 py-0.5">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-white"
                          style={{ background: BRAND_GRADIENT }}
                        >
                          <Icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                        </span>
                        <span
                          className="text-[9.5px] font-extrabold leading-tight text-[#0A2B6D]"
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

                    {/* Bottom 3/4 Dark Navy Body */}
                    <div className="flex flex-1 items-center justify-between gap-1 px-2 py-1">
                      <span
                        className="text-[8.5px] font-bold leading-tight text-white/95"
                        style={{ color: '#FFFFFF' }}
                      >
                        {currentSub}
                      </span>
                      <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#00C6FF]" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!collapsed && expandedGroup && (
          <div id="quick-access-modules" className="px-2 pb-2">
            <nav
              aria-label={expandedGroup.label}
              className="rounded-xl border border-white/20 bg-white/10 p-2 backdrop-blur-md"
            >
              <p
                className="mb-1.5 text-[9.5px] font-extrabold uppercase tracking-wider text-white"
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
                      className={`flex min-h-[30px] items-center justify-between gap-1.5 rounded-xl border px-2.5 py-1 text-[9.5px] font-extrabold transition-all ${
                        modActive
                          ? 'border-[#00C6FF] bg-white text-[#0A2B6D] shadow-[0_0_10px_rgba(0,198,255,0.6)]'
                          : 'border-white/25 bg-white text-[#0A2B6D] hover:border-[#00C6FF]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Icon className="h-3 w-3 shrink-0 text-[#5A00D6]" />
                        <span style={{ color: '#0A2B6D' }}>
                          {module.label}
                        </span>
                      </div>
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: modActive ? '#00C6FF' : '#FF2E9A' }}
                      />
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