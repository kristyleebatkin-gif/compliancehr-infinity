import React from 'react';
import { Link } from 'react-router-dom';
import { canAccessNav } from '@/lib/roles';
import { useRole } from '@/lib/useRole';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { ArrowRight } from 'lucide-react';
import { getHeaderView } from '@/lib/fullColourTiles';
import { Image } from '@/components/ui/image';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 42%, #A100FF 68%, #FF2E9A 100%)';

const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

export default function AllModulesHub() {
  const { role } = useRole();
  const modules = MODULE_DIRECTORY.filter(
    (module) => module.key === 'dashboard' || canAccessNav(role, module.key)
  );

  return (
    <section
      aria-labelledby="all-modules-hub"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel"
    >
      <div className="h-1 w-full" style={{ background: BRAND_GRADIENT }} />

      {/* Small Logo at Top + Platform Name Below Logo */}
      <div className="flex flex-col items-center px-3.5 pb-1 pt-2.5 text-center sm:px-4">
        <Image
          src={CHR_LOGO}
          alt="ComplianceHR Infinity"
          fittingType="fit"
          className="h-7 w-7 rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs"
        />
        <span
          id="all-modules-hub"
          className="mt-1 font-editorial text-[12px] font-extrabold leading-tight tracking-tight text-[#0A2B6D]"
        >
          Compliance
          <span className="font-editorial-italic text-[#5A00D6]">HR</span>{' '}
          <span className="bg-gradient-to-r from-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
            Infinity
          </span>
        </span>
      </div>

      {/* Screens / Modules Only Underneath — Visually Matching Quick Access */}
      <div className="grid auto-rows-fr grid-cols-2 gap-2 p-3 pt-2 sm:grid-cols-3 md:grid-cols-6 items-stretch">
        {modules.map((module, idx) => {
          const Icon = module.icon;
          const headerBg = getHeaderView(idx);
          return (
            <Link
              key={module.key}
              to={module.path}
              title={`${module.label} — ${module.blurb}`}
              className="group flex h-full min-h-[98px] flex-col gap-[3px] rounded-xl border-2 border-[#0A2B6D] bg-[#0A2B6D] p-[3px] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md focus-visible:outline-none"
            >
              <div className="flex flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
                <div
                  className="flex min-h-[38px] items-center justify-between gap-1 px-1.5 py-1 text-white"
                  style={{ background: headerBg }}
                >
                  <div className="flex min-w-0 items-center gap-1">
                    <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    <span
                      className="min-w-0 text-[9.5px] font-extrabold leading-[11px] tracking-tight text-white"
                      style={{ color: '#FFFFFF', wordBreak: 'normal', overflowWrap: 'normal' }}
                    >
                      {module.label}
                    </span>
                  </div>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/75" />
                </div>

                <div className="flex min-h-[40px] flex-1 items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-1.5 py-1">
                  <span className="line-clamp-2 min-w-0 flex-1 break-words text-[10.5px] font-bold leading-[13px] text-[#0A2B6D]/85">
                    {module.blurb}
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5 group-hover:text-[#FF2E9A]" />
                </div>
              </div>

              <div className="flex h-[5px] items-center justify-center">
                <span className="h-[2.5px] w-6 rounded-full bg-white/45 transition-all group-hover:bg-white/80" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}