import React from 'react';
import { Link } from 'react-router-dom';
import { canAccessNav } from '@/lib/roles';
import { useRole } from '@/lib/useRole';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { ArrowRight } from 'lucide-react';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const DARK_NAVY_CHASSIS =
  'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)';

export default function AllModulesHub() {
  const { role } = useRole();
  const modules = MODULE_DIRECTORY.filter(
    (module) => module.key === 'dashboard' || canAccessNav(role, module.key)
  );

  return (
    <section
      aria-labelledby="all-modules-hub"
      className="preserve-island-theme overflow-hidden rounded-2xl border-2 border-[#0A2B6D] shadow-xl"
      style={{ background: DARK_NAVY_CHASSIS }}
    >
      <div className="h-1.5 w-full" style={{ background: BRAND_GRADIENT }} />

      {/* TOP 1/4 WHITE: Header with Centred Logo -> Name -> Slogan */}
      <div
        id="all-modules-hub"
        className="flex flex-col items-center justify-center border-b border-white/15 bg-white px-3 py-2 text-center"
      >
        <BrandLogoLockup size="xs" theme="light" showSlogan={true} />
      </div>

      {/* BOTTOM 3/4 DARK BLUE: Remote Control Buttons */}
      <div className="grid auto-rows-fr grid-cols-1 gap-2 p-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 items-stretch">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.key}
              to={module.path}
              title={`${module.label} — ${module.blurb}`}
              className="group flex h-full min-h-[72px] flex-col rounded-2xl p-[2px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(0,198,255,0.75)] focus-visible:outline-none"
              style={{ background: BRAND_GRADIENT }}
            >
              <div className="flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[14px] bg-[#0A2B6D]/90 backdrop-blur-md">
                {/* Top 1/4 White Title Background */}
                <div className="flex min-h-[30px] items-center justify-between gap-1.5 bg-white px-2.5 py-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs"
                      style={{ background: BRAND_GRADIENT }}
                    >
                      <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    </span>
                    <span
                      className="min-w-0 text-[9.5px] font-extrabold leading-tight text-[#0A2B6D]"
                      style={{ color: '#0A2B6D' }}
                    >
                      {module.label}
                    </span>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F5F0FF] px-1.5 py-0 text-[7px] font-black uppercase text-[#5A00D6]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF2E9A]" />
                    <span>LIVE</span>
                  </span>
                </div>

                {/* Bottom 3/4 Dark Navy Body */}
                <div className="flex flex-1 items-center justify-between gap-1 px-2.5 py-1">
                  <span
                    className="min-w-0 flex-1 break-words text-[8.5px] font-bold leading-snug text-white/95"
                    style={{ color: '#FFFFFF' }}
                  >
                    {module.blurb}
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#00C6FF]" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}