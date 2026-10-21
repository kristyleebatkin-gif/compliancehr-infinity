import React from 'react';
import { Link } from 'react-router-dom';
import { canAccessNav } from '@/lib/roles';
import { useRole } from '@/lib/useRole';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import dashboardModuleColours from '@/components/dashboard/dashboardModuleColours';
import { ArrowRight, LayoutGrid } from 'lucide-react';

// Live status hues the hub shares with the module compliance strips.
const STATUS_MAP = {
  incidents: { label: 'Incident register', dot: '#dc2626' },
  risks: { label: 'Risk register', dot: '#ea580c' },
  compliance: { label: 'Expiry scan + audits', dot: '#7c3aed' },
  training: { label: 'Expiry alerts live', dot: '#0d9488' },
  'emergency-response': { label: 'Live alerts armed', dot: '#dc2626' },
  invoicing: { label: 'Unbilled shifts tracked', dot: '#16a34a' },
  rostering: { label: 'Reminder alerts live', dot: '#8b5cf6' },
  goals: { label: 'Progress notes due', dot: '#db2777' },
  intake: { label: 'Cases awaiting review', dot: '#2563eb' },
  documents: { label: 'Central routing on', dot: '#ca8a04' },
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

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
        {modules.map((module) => {
          const Icon = module.icon;
          const { colour: color, accent } = dashboardModuleColours(module.key);
          const status = STATUS_MAP[module.key];
          return (
            <Link
              key={module.key}
              to={module.path}
              className="group relative flex min-h-28 flex-col overflow-hidden rounded-xl border p-2.5 shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl"
              data-dashboard-module
              style={{ '--module-color': color, '--module-accent': accent }}
            >
              <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${accent})` }} />
              <div className="flex items-start gap-2">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white transition-transform group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)`, boxShadow: `0 8px 20px -8px ${color}aa` }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold leading-tight text-foreground">{module.label}</div>
                  <p className="mt-1 text-[11px] leading-4 text-foreground/60 line-clamp-2">{module.blurb}</p>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between gap-1 pt-1.5">
                {status ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground/55">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: status.dot }} />
                      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: status.dot }} />
                    </span>
                    {status.label}
                  </span>
                ) : <span />}
                <span className="inline-flex items-center gap-1 text-[11px] font-bold opacity-60 transition-opacity group-hover:opacity-100" style={{ color }}>
                  Open <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}