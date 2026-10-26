import React from 'react';
import { Link } from 'react-router-dom';
import { canAccessNav } from '@/lib/roles';
import { useRole } from '@/lib/useRole';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { ArrowRight, LayoutGrid } from 'lucide-react';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';
const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';

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
  const modules = MODULE_DIRECTORY.filter(
    (module) => module.key === 'dashboard' || canAccessNav(role, module.key)
  );

  return (
    <section
      aria-labelledby="all-modules-hub"
      className="rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="rounded-[16px] bg-white p-4 sm:p-6 text-center space-y-4">
        <span
          id="all-modules-hub"
          className="mx-auto inline-flex min-h-[40px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm font-extrabold tracking-wide text-white shadow-sm"
          style={{ background: BADGE_GRADIENT }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#FF2E9A]">
            <LayoutGrid className="h-3.5 w-3.5 text-[#FF2E9A]" />
          </span>
          <span>All {modules.length} Live Workspace Modules</span>
        </span>

        <p className="mx-auto max-w-3xl text-xs sm:text-sm font-extrabold text-[#5A00D6]">
          Every module, form, register and live tracker in your workspace, connected and role-filtered.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 text-left">
          {modules.map((module) => {
            const Icon = module.icon;
            const status = STATUS_MAP[module.key];
            return (
              <Link
                key={module.key}
                to={module.path}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F5F0FF] hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] text-white shadow-2xs"
                      style={{ background: ICON_GRADIENT }}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                        {module.group || 'Operations'}
                      </div>
                      <div className="text-sm font-extrabold leading-tight text-[#0A2B6D]">
                        {module.label}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-bold leading-snug text-[#0A2B6D]/85">{module.blurb}</p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-1 border-t border-[#0A2B6D]/15 pt-2">
                  {status ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#5A00D6]">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: status.dot }}
                      />
                      {status.label}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0072FF]">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}