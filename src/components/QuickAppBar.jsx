import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MODULE_DIRECTORY, NAV_GROUPS } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import { ChevronDown, ChevronUp, Home, LayoutDashboard, Compass, Sparkles } from 'lucide-react';

const QUICK_LINKS = [
  { key: 'landing', label: 'Landing Page', path: '/', color: '#5A00D6' },
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', color: '#0072FF' },
  { key: 'operations-centre', label: 'Operations Centre', path: '/operations-centre', color: '#A100FF' },
  { key: 'our-staff', label: 'Employees', path: '/our-employees', color: '#0072FF' },
  { key: 'our-participants', label: 'Participants', path: '/our-participants', color: '#FF2E9A' },
  { key: 'compliance', label: 'Compliance', path: '/compliance', color: '#5A00D6' },
  { key: 'rostering', label: 'Rostering', path: '/roster', color: '#0A2B6D' },
  { key: 'invoicing', label: 'Invoicing', path: '/invoicing', color: '#00C6FF' },
  { key: 'communications', label: 'Comms', path: '/communications', color: '#A100FF' },
  { key: 'documents', label: 'Documents', path: '/documents', color: '#0072FF' },
  { key: 'training', label: 'Training', path: '/training', color: '#5A00D6' },
  { key: 'tasks', label: 'Tasks', path: '/tasks', color: '#FF2E9A' },
  { key: 'incidents', label: 'Incidents', path: '/incidents', color: '#FF2E9A' },
  { key: 'risks', label: 'Risks', path: '/risks', color: '#A100FF' },
  { key: 'human-resources', label: 'HR Hub', path: '/hr', color: '#0A2B6D' },
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
    <div className="w-full border-b border-[#C084FC]/45 bg-white">
      <div className="mx-auto max-w-7xl px-3 py-1.5 md:px-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-2xs">
            <Compass className="h-3.5 w-3.5" />
            Quick App Bar
          </span>

          {QUICK_LINKS.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setShowAllModules(false)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold transition-all ${
                  active
                    ? 'text-white shadow-sm'
                    : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF] hover:text-[#5A00D6]'
                }`}
                style={{
                  borderColor: active ? item.color : 'rgba(192, 132, 252, 0.55)',
                  backgroundColor: active ? item.color : undefined,
                }}
              >
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
            className="ml-auto inline-flex items-center gap-1 rounded-full border border-[#5A00D6] bg-[#F5F0FF] px-3 py-1 text-xs font-extrabold text-[#5A00D6] shadow-2xs transition-colors hover:bg-[#5A00D6] hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5" />
            All {MODULE_DIRECTORY.length} Modules
            {showAllModules ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {showAllModules && (
          <div className="mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-[#C084FC]/60 bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between border-b border-[#C084FC]/30 pb-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Jump Directly to Any App Module ({MODULE_DIRECTORY.length} Connected Screens)
              </div>
              <button
                type="button"
                onClick={() => setShowAllModules(false)}
                className="rounded-full border border-[#C084FC]/60 px-2.5 py-0.5 text-xs font-bold text-[#5A00D6] hover:bg-[#F5F0FF]"
              >
                Close
              </button>
            </div>
            <div className="space-y-3">
              {NAV_GROUPS.map((group) => {
                const items = MODULE_DIRECTORY.filter((m) => group.keys.includes(m.key));
                if (!items.length) return null;
                return (
                  <div key={group.label}>
                    <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
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
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all ${
                              active ? 'text-white shadow-sm' : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                            }`}
                            style={{
                              borderColor: active ? color : `${color}55`,
                              backgroundColor: active ? color : undefined,
                            }}
                          >
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white"
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