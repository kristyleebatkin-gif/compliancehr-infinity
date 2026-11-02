import React from 'react';
import { Link } from 'react-router-dom';
import { canAccessNav } from '@/lib/roles';
import { useRole } from '@/lib/useRole';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { ArrowRight } from 'lucide-react';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

const LANDING_TOP_LOGO_BLUE =
  'radial-gradient(circle at 50% 35%, rgba(0, 198, 255, 0.42) 0%, #0072FF 44%, #0A2B6D 86%, #061539 100%)';

const DARK_NAVY_CHASSIS =
  'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)';

const APP_DESIGN_ICON_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

export default function AllModulesHub() {
  const { role } = useRole();
  const modules = MODULE_DIRECTORY.filter(
    (module) => module.key === 'dashboard' || canAccessNav(role, module.key)
  );

  return (
    <section
      aria-labelledby="all-modules-hub"
      className="preserve-island-theme overflow-hidden rounded-2xl border-2 border-[#0072FF] shadow-xl"
      style={{ background: DARK_NAVY_CHASSIS }}
    >
      <div className="h-1 w-full" style={{ background: BRAND_GRADIENT }} />

      {/* Very Top Logo Section ONLY: Landing-Page Dashboard Blue Around Enlarged Logo & Fitted Slogan */}
      <div
        id="all-modules-hub"
        className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0072FF] px-3 py-2"
        style={{ background: LANDING_TOP_LOGO_BLUE }}
      >
        <BrandLogoLockup size="sm" theme="light" showSlogan={true} />
        <span className="rounded-full p-[1.5px]" style={{ background: BRAND_GRADIENT }}>
          <span
            className="block rounded-full bg-white px-3 py-0.5 text-[8.5px] font-black uppercase tracking-wider"
            style={{ color: '#5A00D6' }}
          >
            ◉ All {modules.length} Platform Control Pods
          </span>
        </span>
      </div>

      {/* All-White Control Pods Grid with App-Design-Colour Borders & Icons */}
      <div className="grid auto-rows-fr grid-cols-2 gap-1.5 p-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 items-stretch">
        {modules.map((module, idx) => {
          const Icon = module.icon;
          const iconColor = APP_DESIGN_ICON_COLOURS[idx % APP_DESIGN_ICON_COLOURS.length];
          return (
            <Link
              key={module.key}
              to={module.path}
              title={`${module.label} — ${module.blurb}`}
              className="group flex h-full min-h-[50px] rounded-3xl p-[2px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(0,198,255,0.75)] focus-visible:outline-none"
              style={{ background: BRAND_GRADIENT }}
            >
              <div className="flex w-full items-center gap-2 rounded-[22px] bg-white px-2.5 py-1.5">
                <span
                  className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F0FF]"
                  style={{ border: `2px solid ${iconColor}` }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: iconColor }} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="text-[9.5px] font-extrabold leading-tight text-[#0A2B6D]"
                      style={{ color: '#0A2B6D' }}
                    >
                      <span style={{ color: iconColor }}>◉</span> {module.label}
                    </span>
                    <span
                      className="rounded-full border px-1 py-0 text-[6.5px] font-black uppercase"
                      style={{
                        borderColor: iconColor,
                        color: '#5A00D6',
                        backgroundColor: '#F5F0FF',
                      }}
                    >
                      LIVE
                    </span>
                  </div>

                  <div className="mt-0.5 flex items-center justify-between gap-1">
                    <span
                      className="min-w-0 flex-1 break-words text-[8px] font-bold leading-tight text-[#5A00D6]"
                      style={{ color: '#5A00D6' }}
                    >
                      {module.blurb}
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 shrink-0" style={{ color: iconColor }} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}