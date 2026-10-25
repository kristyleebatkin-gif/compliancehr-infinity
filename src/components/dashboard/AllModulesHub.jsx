import React from 'react';
import { Link } from 'react-router-dom';
import { canAccessNav } from '@/lib/roles';
import { useRole } from '@/lib/useRole';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import dashboardModuleColours from '@/components/dashboard/dashboardModuleColours';
import { ArrowRight, LayoutGrid } from 'lucide-react';

// Live status hues the hub shares with the module compliance strips.
const STATUS_MAP = {
  incidents: { label: 'Incident register', dot: '#FF2E9A' },
  risks: { label: 'Risk register', dot: '#A100FF' },
  compliance: { label: 'Expiry scan + audits', dot: '#5A00D6' },
  training: { label: 'Expiry alerts live', dot: '#0072FF' },
  'emergency-response': { label: 'Live alerts armed', dot: '#FF6EDB' },
  invoicing: { label: 'Unbilled shifts tracked', dot: '#00C6FF' },
  rostering: { label: 'Reminder alerts live', dot: '#5A00D6' },
  goals: { label: 'Progress notes due', dot: '#FF2E9A' },
  intake: { label: 'Cases awaiting review', dot: '#0072FF' },
  documents: { label: 'Central routing on', dot: '#C084FC' },
};

export default function AllModulesHub() {
  const { role } = useRole();
  const modules = MODULE_DIRECTORY.filter((module) => module.key === 'dashboard' || canAccessNav(role, module.key));

  return (
    <section aria-labelledby="all-modules-hub" className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-4 shadow-lg shadow-violet-500/5 dark:border-violet-900 dark:from-violet-950/25 dark:via-card dark:to-cyan-950/20 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500" />
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="all-modules-hub" className="flex items-center gap-2 text-base font-bold font-display text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand text-white shadow-sm">
              <LayoutGrid className="h-4 w-4" />
            </span>
            All modules
          </h2>
          <p className="mt-0.5 text-sm text-foreground/60">
            Every module, form, register and live tracker in your workspace, connected and role-filtered.
          </p>
        </div>
        <span className="self-start rounded-full gradient-brand px-3 py-1 text-xs font-bold text-white shadow-sm">
          {modules.length} modules
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {modules.map((module) => {
          const Icon = module.icon;
          const { colour: color, accent } = dashboardModuleColours(module.key);
          const status = STATUS_MAP[module.key];
          return (
            <Link
              key={module.key}
              to={module.path}
              className="group relative flex flex-col overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              data-dashboard-module
              style={{ '--module-color': color, '--module-accent': accent, borderColor: color }}
            >
              {/* Bordered & Highlighted Subject Header Bar (Larger than body text underneath) */}
              <div
                className="flex items-center gap-2 border-b-2 px-3 py-2 text-white"
                style={{
                  background: `linear-gradient(125deg, ${color} 0%, #5A00D6 85%)`,
                  borderBottomColor: '#FF2E9A',
                }}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/50 bg-white/20 text-white shadow-sm transition-transform group-hover:scale-105">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-white/90">
                    Subject: {module.group || 'Operations'}
                  </div>
                  <div className="text-sm font-extrabold leading-tight text-white">{module.label}</div>
                </div>
              </div>

              {/* Slightly Smaller Body Writing Under the Header */}
              <div className="flex flex-1 flex-col justify-between p-2.5 bg-white">
                <p className="text-[11px] font-medium leading-snug text-[#0A2B6D]/80">{module.blurb}</p>
                <div className="mt-2 flex items-center justify-between gap-1 border-t border-[#C084FC]/30 pt-1.5">
                  {status ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#0A2B6D]/75">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: status.dot }} />
                        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: status.dot }} />
                      </span>
                      {status.label}
                    </span>
                  ) : <span />}
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold" style={{ color }}>
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}