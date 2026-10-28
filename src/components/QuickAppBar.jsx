import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { MODULE_DIRECTORY, NAV_GROUPS } from '@/lib/moduleDirectory';
import { useRole } from '@/lib/useRole';
import { canAccessNav } from '@/lib/roles';
import { getHeaderView } from '@/lib/fullColourTiles';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 42%, #A100FF 68%, #FF2E9A 100%)';

// Labels, routes, icons and group membership come from the existing registry.

export default function QuickAppBar() {
  const location = useLocation();
  const { role } = useRole();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const quickGroups = NAV_GROUPS.map((group, colourIndex) => ({
    ...group,
    colourIndex,
    modules: group.keys.map((key) => MODULE_DIRECTORY.find((module) => module.key === key))
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
    <div className="mx-auto w-full max-w-[1440px] bg-white px-4 pt-3 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="h-1 w-full" style={{ background: BRAND_GRADIENT }} />

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3.5 pb-1.5 pt-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs"
              style={{ background: BRAND_GRADIENT }}
            >
              <Zap className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-extrabold leading-tight text-[#0A2B6D]">
                Organisational Operating System Navigation (13 Permanent Categories)
              </h2>
              <p className="text-[11px] font-semibold leading-tight text-slate-600">
                People → Work → Compliance → Evidence → Intelligence · Maximum 2 clicks to any 360° record
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00C6FF]" />
              Live OS
            </span>
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-extrabold text-[#0A2B6D] hover:border-[#0072FF]"
            >
              {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              <span>{collapsed ? 'Show OS Bar' : 'Compact'}</span>
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="grid auto-rows-fr grid-cols-2 gap-2 p-3 pt-1.5 sm:grid-cols-3 lg:grid-cols-6 items-stretch">
            {quickGroups.map((item) => {
              const active = item.modules.some((module) => isActive(module.path));
              const Icon = item.modules[0].icon;
              const currentSub = item.modules.slice(0, 2).map((module) => module.label).join(' · ') + (item.modules.length > 2 ? ` · +${item.modules.length - 2} more` : '');
              const headerBg = getHeaderView(item.colourIndex);

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSelectedGroup((current) => current === item.label ? null : item.label)}
                  aria-expanded={selectedGroup === item.label}
                  aria-controls="quick-access-modules"
                  title={`${item.label} — ${currentSub}`}
                  className={`group flex h-full min-h-[86px] flex-col gap-[3px] rounded-xl border-2 bg-[#0A2B6D] p-[3px] text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072FF] focus-visible:ring-offset-2 ${
                    active
                      ? 'border-[#5A00D6] shadow-md ring-2 ring-[#5A00D6]/25 ring-offset-1'
                      : 'border-[#0A2B6D] hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
                    <div
                      className="flex min-h-[34px] items-center justify-between gap-1 px-1.5 py-1 text-white"
                      style={{ background: headerBg }}
                    >
                      <div className="flex min-w-0 items-center gap-1">
                        <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                        <span
                          className="min-w-0 text-[9.5px] font-extrabold leading-[11px] tracking-tight text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          active ? 'bg-[#00C6FF]' : 'bg-white/75'
                        }`}
                      />
                    </div>

                    <div className="flex min-h-[36px] flex-1 items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-1.5 py-1">
                      <span className="min-w-0 flex-1 break-words text-[10px] font-bold leading-[12px] text-[#0A2B6D]/85">
                        {currentSub}
                      </span>
                      <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5 group-hover:text-[#FF2E9A]" />
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
              <nav aria-label={expandedGroup.label} className="mx-3 mb-3 rounded-xl border border-[#C084FC]/60 bg-[#F6F0FF] p-3">
                <p className="mb-2 text-sm font-bold text-[#0A2B6D]">{expandedGroup.label}</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {expandedGroup.modules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <Link key={module.key} to={module.path}
                        aria-current={isActive(module.path) ? 'page' : undefined}
                        className="flex min-h-[48px] items-center gap-3 rounded-xl border border-[#C084FC]/60 bg-white px-3 py-2 text-sm font-semibold text-[#0A2B6D] hover:border-[#0072FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072FF]">
                        <Icon className="h-4 w-4 shrink-0 text-[#5A00D6]" />
                        <span className="flex-1">{module.label}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[#0072FF]" />
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