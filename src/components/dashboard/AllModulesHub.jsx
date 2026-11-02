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

      {/* 50% Compact Brand Lockup Header */}
      <div id="all-modules-hub" className="flex items-center justify-between border-b border-white/15 bg-white px-3 py-1">
        <BrandLogoLockup size="xs" theme="light" showSlogan={false} />
        <span className="rounded-full bg-[#0A2B6D] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#00C6FF]">
          ◉ All {modules.length} Platform Control Pods
        </span>
      </div>

      {/* 50% Compact Circular Control Pods Grid */}
      <div className="grid auto-rows-fr grid-cols-2 gap-1.5 p-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 items-stretch">
        {modules.map((module, idx) => {
          const Icon = module.icon;
          const ringColor = idx % 2 === 0 ? '#00C6FF' : '#FF6EDB';
          return (
            <Link
              key={module.key}
              to={module.path}
              title={`${module.label} — ${module.blurb}`}
              className="group flex h-full min-h-[52px] items-center gap-2 rounded-3xl border border-white/25 px-2.5 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00C6FF] hover:shadow-[0_0_16px_rgba(0,198,255,0.65)] focus-visible:outline-none"
              style={{
                background:
                  'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22) 0%, rgba(10, 43, 109, 0.92) 72%, #061539 100%)',
              }}
            >
              <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 28 28">
                  <circle cx="14" cy="14" r="12" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
                  <circle
                    cx="14"
                    cy="14"
                    r="12"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="75"
                    strokeDashoffset="10"
                  />
                </svg>
                <span
                  className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full text-white"
                  style={{ background: BRAND_GRADIENT }}
                >
                  <Icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                </span>
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="inline-flex max-w-full items-center gap-0.5 rounded-full bg-white px-2 py-0.2 shadow-2xs">
                    <span className="text-[8px] leading-none" style={{ color: ringColor }}>
                      ◉
                    </span>
                    <span
                      className="text-[9.5px] font-extrabold leading-tight text-[#0A2B6D]"
                      style={{ color: '#0A2B6D' }}
                    >
                      {module.label}
                    </span>
                  </span>
                  <span className="rounded-full bg-white/15 px-1 py-0 text-[6.5px] font-black uppercase text-[#00C6FF]">
                    LIVE
                  </span>
                </div>

                <div className="mt-0.5 flex items-center justify-between gap-1">
                  <span
                    className="min-w-0 flex-1 break-words text-[8px] font-bold leading-tight text-white/90"
                    style={{ color: '#E2E8F0' }}
                  >
                    {module.blurb}
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#00C6FF] transition group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}