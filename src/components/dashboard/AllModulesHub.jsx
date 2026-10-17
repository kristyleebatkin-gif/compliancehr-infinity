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
    <section aria-labelledby="all-modules-hub" className="rounded-2xl border bg-card p-4 shadow-lg shadow-violet-500/5 dark:border-slate-800 sm:p-6">
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.map((module) => {
          const Icon = module.icon;
          const color = moduleColour(module.label);
          const status = STATUS_MAP[module.key];
          return (
            <Link
              key={module.key}
              to={module.path}
              className="group relative flex min-h-40 flex-col overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl"
              style={{ borderColor: `${color}45`, background: `linear-gradient(150deg, ${color}26 0%, ${color}0d 40%, hsl(var(--card)) 72%)` }}
            >
              <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}66)` }} />
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white transition-transform group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)`, boxShadow: `0 8px 20px -8px ${color}aa` }}
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