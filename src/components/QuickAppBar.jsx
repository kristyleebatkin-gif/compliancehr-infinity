import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MODULE_DIRECTORY, NAV_GROUPS } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import { ChevronDown, ChevronUp, Home, LayoutDashboard, Compass, Sparkles } from 'lucide-react';

const QUICK_LINKS = [
  { key: 'landing', label: 'Landing Page', path: '/', color: '#5A00D6' },
  { key: 'operations-centre', label: 'Operations Centre', path: '/operations-centre', color: '#A100FF' },
  { key: 'rostering', label: '1. Roster & Shifts', path: '/roster', color: '#0072FF' },
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', color: '#0A2B6D' },
  { key: 'my-profile', label: 'My Profile', path: '/my-profile', color: '#5A00D6' },
  { key: 'our-staff', label: 'Employees', path: '/our-employees', color: '#0072FF' },
  { key: 'our-participants', label: 'Participants', path: '/our-participants', color: '#FF2E9A' },
  { key: 'compliance', label: 'Compliance', path: '/compliance', color: '#5A00D6' },
  { key: 'invoicing', label: 'Invoicing', path: '/invoicing', color: '#00C6FF' },
  { key: 'communications', label: 'Comms', path: '/communications', color: '#A100FF' },
  { key: 'community-council', label: 'Community & Programs', path: '/community-council', color: '#00C6FF' },
  { key: 'certificates', label: 'Recognition & Certs', path: '/certificates', color: '#FF2E9A' },
  { key: 'tasks', label: 'Tasks', path: '/tasks', color: '#FF2E9A' },
  { key: 'incidents', label: 'Incidents', path: '/incidents', color: '#FF2E9A' },
  { key: 'human-resources', label: 'HR Hub & Volunteers', path: '/hr', color: '#0A2B6D' },
  { key: 'company-safe', label: 'Company Safe', path: '/company-safe', color: '#5A00D6' },
];

export default function QuickAppBar() {
  const [showAllModules, setShowAllModules] = useState(false);
  const location = useLocation();

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div
      className="w-full border-b-4 border-[#0A2B6D] bg-gradient-to-r from-[#F5F0FF] via-white to-[#F5F0FF] shadow-[0_6px_20px_-6px_rgba(10,43,109,0.28)]"
    >
      {/* Top thin spectrum highlight ribbon */}
      <div
        className="h-1.5 w-full"
        style={{ background: 'var(--header-gradient)' }}
      />
      <div className="mx-auto max-w-7xl px-3 py-2 md:px-6">
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border-2 border-[#0A2B6D] bg-white/95 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_-2px_rgba(90,0,214,0.18)]">
          <span
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md"
            style={{ background: 'var(--header-gradient)' }}
          >
            <Compass className="h-3.5 w-3.5 text-[#00C6FF]" />
            Quick App Bar
          </span>

          {QUICK_LINKS.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setShowAllModules(false)}
                className={`inline-flex items-center gap-1 rounded-xl border-2 px-2.5 py-1 text-xs font-extrabold transition-all hover:-translate-y-0.5 ${
                  active
                    ? 'border-[#0A2B6D] text-white shadow-[0_4px_10px_-2px_rgba(255,46,154,0.45)] ring-2 ring-[#FF2E9A]'
                    : 'border-[#0A2B6D] bg-gradient-to-b from-white to-[#F5F0FF] text-[#0A2B6D] shadow-2xs hover:border-[#5A00D6] hover:text-[#5A00D6]'
                }`}
                style={
                  active
                    ? { background: 'var(--header-gradient)' }
                    : { borderTopWidth: '3px', borderTopColor: item.color }
                }
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: active ? '#00C6FF' : item.color }}
                />
                {item.path === '/' ? (
                  <Home className="h-3 w-3 shrink-0" />
                ) : item.path === '/dashboard' ? (
                  <LayoutDashboard className="h-3 w-3 shrink-0" />
                ) : null}
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setShowAllModules((prev) => !prev)}
            className="ml-auto inline-flex items-center gap-1 rounded-xl border-2 border-[#0A2B6D] px-3 py-1 text-xs font-extrabold text-white shadow-md transition-transform hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(120deg, #0A2B6D 0%, #5A00D6 55%, #FF2E9A 100%)' }}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#00C6FF]" />
            All {MODULE_DIRECTORY.length} Modules
            {showAllModules ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {showAllModules && (
          <div className="mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 shadow-xl">
            <div
              className="mb-2.5 flex items-center justify-between rounded-xl border-2 border-[#0A2B6D] px-3 py-2 text-white"
              style={{ background: 'var(--header-gradient)' }}
            >
              <div className="text-xs font-extrabold uppercase tracking-wider text-white">
                Jump Directly to Any App Module ({MODULE_DIRECTORY.length} Connected Screens)
              </div>
              <button
                type="button"
                onClick={() => setShowAllModules(false)}
                className="rounded-lg border-2 border-[#0A2B6D] bg-white px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
              >
                Close
              </button>
            </div>
            <div className="space-y-3">
              {NAV_GROUPS.map((group) => {
                const items = MODULE_DIRECTORY.filter((m) => group.keys.includes(m.key));
                if (!items.length) return null;
                return (
                  <div key={group.label} className="rounded-xl border-2 border-[#0A2B6D]/30 bg-[#F5F0FF]/40 p-2.5">
                    <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                      {group.label}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((mod) => {
                        const Icon = mod.icon;
                        const color = moduleKeyColour(mod.key);
                        const active = isActive(mod.path);
                        return (
                          <Link
                            key={mod.key}
                            to={mod.path}
                            onClick={() => setShowAllModules(false)}
                            className={`inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] px-2.5 py-1.5 text-xs font-extrabold transition-all hover:-translate-y-0.5 ${
                              active ? 'text-white shadow-md' : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                            }`}
                            style={{
                              borderTopWidth: '3px',
                              borderTopColor: color,
                              backgroundColor: active ? color : undefined,
                            }}
                          >
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[#0A2B6D]/40 text-white"
                              style={{ backgroundColor: color }}
                            >
                              <Icon className="h-3 w-3" />
                            </span>
                            {mod.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}