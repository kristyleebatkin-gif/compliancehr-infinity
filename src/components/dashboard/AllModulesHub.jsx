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
  'linear-gradient(165deg, #0A2B6D 0%, #0A2B6D 55%, #5A00D6 100%)';

const APP_DESIGN_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

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

      {/* Compact Module Hub Title Bar (Words Framed with App Design Coloured Border on White) */}
      <div
        id="all-modules-hub"
        className="flex items-center justify-between bg-white px-3 py-1.5"
      >
        <span
          className="inline-flex rounded-full p-[1.5px]"
          style={{ background: BRAND_GRADIENT }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-0.5">
            <span style={{ color: '#0072FF' }}>◉</span>
            <span
              className="bg-clip-text text-xs font-extrabold tracking-tight text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)',
              }}
            >
              All Connected Platform Modules — Remote Command Directory ({modules.length} Modules)
            </span>
          </span>
        </span>
      </div>

      {/* BOTTOM 3/4 DARK BLUE: Illuminated Page Modular Tiles with App Design Colour Symbols */}
      <div
        className="grid auto-rows-fr grid-cols-1 gap-2 p-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 items-stretch"
        style={{ background: DARK_NAVY_CHASSIS }}
      >
        {modules.map((module, idx) => {
          const Icon = module.icon;
          const symColor = APP_DESIGN_COLOURS[idx % APP_DESIGN_COLOURS.length];
          return (
            <Link
              key={module.key}
              to={module.path}
              title={`${module.label} — ${module.blurb}`}
              className="group flex h-full min-h-[68px] flex-col rounded-2xl p-[2px] shadow-[0_0_12px_rgba(90,0,214,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(0,198,255,0.75)] focus-visible:outline-none"
              style={{ background: BRAND_GRADIENT }}
            >
              <div
                className="flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[14px]"
                style={{ background: DARK_NAVY_CHASSIS }}
              >
                {/* Top 1/4 White Title Background with App Design Colour Symbol */}
                <div className="flex min-h-[30px] items-center justify-between gap-1.5 bg-white px-2.5 py-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#F5F0FF] shadow-2xs"
                      style={{ border: `1.5px solid ${symColor}` }}
                    >
                      <Icon className="h-3 w-3 shrink-0" style={{ color: symColor }} />
                    </span>
                    <span
                      className="min-w-0 text-[9.5px] font-extrabold leading-tight text-[#0A2B6D]"
                      style={{ color: '#0A2B6D' }}
                    >
                      <span style={{ color: symColor }}>◉</span> {module.label}
                    </span>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F5F0FF] px-1.5 py-0 text-[7px] font-black uppercase text-[#5A00D6]">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: symColor,
                        boxShadow: `0 0 6px 1px ${symColor}`,
                      }}
                    />
                    <span>LIVE</span>
                  </span>
                </div>

                {/* Bottom 3/4 Dark Blue Body */}
                <div className="flex flex-1 items-center justify-between gap-1 px-2.5 py-1.5">
                  <span
                    className="min-w-0 flex-1 break-words text-[8.5px] font-bold leading-snug text-white"
                    style={{ color: '#FFFFFF' }}
                  >
                    {module.blurb}
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0 transition group-hover:translate-x-0.5" style={{ color: symColor }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}