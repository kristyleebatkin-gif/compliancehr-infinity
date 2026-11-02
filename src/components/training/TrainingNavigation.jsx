import React from 'react';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import { LayoutGrid, CalendarDays, GraduationCap, Award, Sparkles, TrendingUp, Target, ArrowRight } from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const DARK_NAVY_CHASSIS =
  'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)';

const ITEMS = [
  ['modules', 'Modules', LayoutGrid, 'LMS courses & completion'],
  ['calendar', 'Calendar', CalendarDays, 'Training dates & renewals'],
  ['templates', 'Packages & assignments', GraduationCap, 'Build training & assign learning'],
  ['ladder', 'Ladder', Award, 'Competency progression'],
  ['drills', 'AI Drills', Sparkles, 'Interactive AI quiz drills'],
  ['insights', 'Insights', TrendingUp, 'Workforce learning analytics'],
  ['skills', 'Skills', Target, 'Skills gap & matrix'],
];

export default function TrainingNavigation({ view, onChange, personalOnly = false }) {
  const visibleItems = ITEMS.filter(([value]) => !personalOnly || value !== 'templates');

  return (
    <section
      className="preserve-island-theme overflow-hidden rounded-2xl border-2 border-[#0A2B6D] shadow-xl"
      style={{ background: DARK_NAVY_CHASSIS }}
    >
      <div className="h-1.5 w-full" style={{ background: BRAND_GRADIENT }} />

      {/* Centred Brand Lockup: Logo Top -> Name Middle -> Slogan Bottom */}
      <div className="flex flex-col items-center border-b border-white/15 bg-white px-3.5 py-2 text-center">
        <BrandLogoLockup size="xs" theme="light" />
      </div>

      {/* Remote Control + Command Centre + Glassmorphism Buttons */}
      <nav
        aria-label="Training views"
        className="grid auto-rows-fr grid-cols-2 gap-2.5 p-3 sm:grid-cols-3 md:grid-cols-6 items-stretch"
      >
        {visibleItems.map(([value, label, Icon, hint]) => {
          const active = view === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(value)}
              className={`group flex h-full min-h-[82px] flex-col rounded-2xl p-[2px] text-left transition-all duration-200 focus-visible:outline-none ${
                active
                  ? 'shadow-[0_0_20px_rgba(0,198,255,0.75)] scale-[1.01]'
                  : 'hover:-translate-y-0.5 hover:shadow-[0_0_14px_rgba(161,0,255,0.5)]'
              }`}
              style={{ background: BRAND_GRADIENT }}
            >
              <span className="flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[14px] bg-[#0A2B6D]/90 backdrop-blur-md">
                {/* White Title Background */}
                <span className="flex min-h-[34px] w-full items-center justify-between gap-1.5 bg-white px-2.5 py-1">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ background: BRAND_GRADIENT }}
                    >
                      <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    </span>
                    <span
                      className="min-w-0 text-[9.5px] font-extrabold leading-tight tracking-tight text-[#0A2B6D]"
                      style={{ color: '#0A2B6D' }}
                    >
                      {label}
                    </span>
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0 text-[7px] font-black uppercase ${
                      active ? 'bg-[#0A2B6D] text-[#00C6FF]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: active ? '#00C6FF' : '#FF2E9A',
                        boxShadow: active ? '0 0 6px 1px #00C6FF' : 'none',
                      }}
                    />
                    {active ? 'ON' : 'LIVE'}
                  </span>
                </span>

                {/* Dark Navy Glassmorphic Body */}
                <span className="flex min-h-[34px] w-full flex-1 items-center justify-between gap-1 px-2.5 py-1">
                  <span
                    className="min-w-0 flex-1 break-words text-[9px] font-bold leading-snug text-white/95"
                    style={{ color: '#FFFFFF' }}
                  >
                    {hint}
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#00C6FF] transition group-hover:translate-x-0.5" />
                </span>

                <span className="flex h-[5px] w-full items-center justify-center pb-0.5">
                  <span
                    className={`h-[2.5px] rounded-full transition-all ${
                      active ? 'w-9 bg-[#00C6FF] shadow-[0_0_8px_#00C6FF]' : 'w-6 bg-white/40 group-hover:bg-white/80'
                    }`}
                  />
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </section>
  );
}