import React from 'react';
import { getHeaderView } from '@/lib/fullColourTiles';
import { Image } from '@/components/ui/image';
import { LayoutGrid, CalendarDays, GraduationCap, Award, Sparkles, TrendingUp, Target, ArrowRight } from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 42%, #A100FF 68%, #FF2E9A 100%)';

const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

const ITEMS = [
  ['modules', 'Modules', LayoutGrid, 'LMS courses & completion'],
  ['calendar', 'Calendar', CalendarDays, 'Training dates & renewals'],
  ['templates', 'Role templates', GraduationCap, 'Mandatory role curricula'],
  ['ladder', 'Ladder', Award, 'Competency progression'],
  ['drills', 'AI Drills', Sparkles, 'Interactive AI quiz drills'],
  ['insights', 'Insights', TrendingUp, 'Workforce learning analytics'],
  ['skills', 'Skills', Target, 'Skills gap & matrix'],
];

export default function TrainingNavigation({ view, onChange, personalOnly = false }) {
  const visibleItems = ITEMS.filter(([value]) => !personalOnly || value !== 'templates');

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
      <div className="h-1 w-full" style={{ background: BRAND_GRADIENT }} />

      {/* Small Logo at Top + Platform Name Below Logo */}
      <div className="flex flex-col items-center px-3.5 pb-1 pt-2.5 text-center sm:px-4">
        <Image
          src={CHR_LOGO}
          alt="ComplianceHR Infinity"
          fittingType="fit"
          className="h-7 w-7 rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs"
        />
        <span className="mt-1 font-editorial text-[12px] font-extrabold leading-tight tracking-tight text-[#0A2B6D]">
          Compliance
          <span className="font-editorial-italic text-[#5A00D6]">HR</span>{' '}
          <span className="bg-gradient-to-r from-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
            Infinity
          </span>
        </span>
      </div>

      {/* Screens / Modules Only Underneath */}
      <nav
        aria-label="Training views"
        className="grid auto-rows-fr grid-cols-2 gap-2 p-3 pt-2 sm:grid-cols-3 md:grid-cols-6 items-stretch"
      >
        {visibleItems.map(([value, label, Icon, hint], idx) => {
          const active = view === value;
          const headerBg = getHeaderView(idx);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(value)}
              className={`group flex h-full min-h-[98px] flex-col gap-[3px] rounded-xl border-2 bg-[#0A2B6D] p-[3px] text-left transition-all duration-200 focus-visible:outline-none ${
                active
                  ? 'border-[#5A00D6] shadow-md ring-2 ring-[#5A00D6]/25 ring-offset-1'
                  : 'border-[#0A2B6D] hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md'
              }`}
            >
              <span className="flex w-full flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
                <span
                  className="flex min-h-[38px] w-full items-center justify-between gap-1 px-1.5 py-1 text-white"
                  style={{ background: headerBg }}
                >
                  <span className="flex min-w-0 items-center gap-1">
                    <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    <span className="min-w-0 text-[9.5px] font-extrabold leading-[11px] tracking-tight text-white">
                      {label}
                    </span>
                  </span>
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      active ? 'bg-[#00C6FF]' : 'bg-white/75'
                    }`}
                  />
                </span>

                <span className="flex min-h-[40px] w-full flex-1 items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-1.5 py-1">
                  <span className="min-w-0 flex-1 break-words text-[10px] font-bold leading-[12.5px] text-[#0A2B6D]/85">
                    {hint}
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5 group-hover:text-[#FF2E9A]" />
                </span>
              </span>

              <span className="flex h-[5px] w-full items-center justify-center">
                <span
                  className={`h-[2.5px] w-6 rounded-full transition-all ${
                    active ? 'w-8 bg-[#00C6FF]' : 'bg-white/45 group-hover:bg-white/80'
                  }`}
                />
              </span>
            </button>
          );
        })}
      </nav>
    </section>
  );
}