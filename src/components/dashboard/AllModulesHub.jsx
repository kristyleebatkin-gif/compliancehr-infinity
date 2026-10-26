import React from 'react';
import { Link } from 'react-router-dom';
import { canAccessNav } from '@/lib/roles';
import { useRole } from '@/lib/useRole';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import {
  getTilePalette,
  getHeaderView,
  getSubheaderColourView,
  getSymbolView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const STATUS_MAP = {
  incidents: { label: 'Incident register' },
  risks: { label: 'Risk register' },
  compliance: { label: 'Expiry scan + audits' },
  training: { label: 'Expiry alerts live' },
  'emergency-response': { label: 'Live alerts armed' },
  invoicing: { label: 'Unbilled shifts tracked' },
  rostering: { label: 'Reminder alerts live' },
  goals: { label: 'Progress notes due' },
  intake: { label: 'Cases awaiting review' },
  documents: { label: 'Central routing on' },
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
          style={{ background: getHeaderView(1) }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
            <LayoutGrid className="h-3.5 w-3.5 text-white" />
          </span>
          <span>All {modules.length} Live Workspace Modules</span>
        </span>

        <p
          className="mx-auto max-w-3xl text-xs sm:text-sm font-extrabold"
          style={{ color: getSubheaderColourView(1) }}
        >
          Every module, form, register and live tracker in your workspace, connected and role-filtered.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 text-left">
          {modules.map((module, idx) => {
            const Icon = module.icon;
            const status = STATUS_MAP[module.key];
            const tile = getTilePalette(idx);
            const sym = getSymbolView(idx);
            return (
              <Link
                key={module.key}
                to={module.path}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#0A2B6D] p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ backgroundColor: tile.bg, color: tile.text }}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white shadow-2xs">
                      <Icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: tile.subtext }}>
                        {module.group || 'Operations'}
                      </div>
                      <div className="text-sm font-extrabold leading-tight" style={{ color: tile.text }}>
                        {module.label}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-bold leading-snug" style={{ color: tile.subtext }}>
                    {module.blurb}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-1 border-t border-current/20 pt-2">
                  {status ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold" style={{ color: tile.text }}>
                      ● {status.label}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold" style={{ color: tile.text }}>
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