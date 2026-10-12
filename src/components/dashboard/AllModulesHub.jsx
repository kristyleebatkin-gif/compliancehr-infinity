import React from 'react';
import { Link } from 'react-router-dom';
import { canAccessNav } from '@/lib/roles';
import { useRole } from '@/lib/useRole';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleColour } from '@/lib/moduleColours';
import { ArrowRight, LayoutGrid } from 'lucide-react';

// Live status hues the hub shares with the module compliance strips.
const STATUS_MAP = {
  incidents: { label: 'Incident register', dot: '#dc2626' },
  risks: { label: 'Risk register', dot: '#ea580c' },
  compliance: { label: 'Expiry scan + audits', dot: '#4f46e5' },
  training: { label: 'Expiry alerts live', dot: '#0d9488' },
  'emergency-response': { label: 'Live alerts armed', dot: '#dc2626' },
  invoicing: { label: 'Unbilled shifts tracked', dot: '#16a34a' },
  rostering: { label: 'Reminder alerts live', dot: '#6366f1' },
  goals: { label: 'Progress notes due', dot: '#db2777' },
  intake: { label: 'Cases awaiting review', dot: '#2563eb' },
  documents: { label: 'Central routing on', dot: '#ca8a04' },
};

export default function AllModulesHub() {
  const { role } = useRole();
  const modules = MODULE_DIRECTORY.filter((module) => module.key === 'dashboard' || canAccessNav(role, module.key));

  return (
    <section aria-labelledby="all-modules-hub" className="rounded-2xl border bg-card p-4 shadow-lg shadow-indigo-500/5 dark:border-slate-800 sm:p-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="all-modules-hub" className="flex items-center gap-2 text-base font-bold font-display text-foreground">
            <LayoutGrid className="h-4 w-4 text-indigo-600" />
            All modules
          </h2>
          <p className="mt-0.5 text-sm text-foreground/60">
            Every module, form, register and live tracker in your workspace, connected and role-filtered.
          </p>
        </div>
        <span className="self-start rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
          {modules.length} modules
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.map((module) => {
          const Icon = module.icon;
          const color = moduleColour(module.label);
          const status = STATUS_MAP[module.key];
          return (
            <Link
              key={module.key}
              to={module.path}
              className="group relative flex min-h-36 flex-col overflow-hidden rounded-xl border p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              style={{ borderColor: `${color}30`, background: `linear-gradient(150deg, ${color}12 0%, hsl(var(--card)) 55%)` }}
            >
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold leading-tight text-foreground">{module.label}</div>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/60 line-clamp-3">{module.blurb}</p>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                {status ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground/55">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: status.dot }} />
                      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: status.dot }} />
                    </span>
                    {status.label}
                  </span>
                ) : <span />}
                <span className="inline-flex items-center gap-1 text-[11px] font-bold opacity-0 transition-opacity group-hover:opacity-100" style={{ color }}>
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