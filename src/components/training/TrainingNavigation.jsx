import React from 'react';
import { getHeaderView } from '@/lib/fullColourTiles';
import { LayoutGrid, CalendarDays, GraduationCap, Award, Sparkles, TrendingUp, Target, Compass, ArrowRight } from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 42%, #A100FF 68%, #FF2E9A 100%)';

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

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 px-3.5 pb-1 pt-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs"
            style={{ background: BRAND_GRADIENT }}
          >
            <Compass className="h-3.5 w-3.5 text-white" />
          </span>
          <div className="min-w-0">
            <h2 className="text-[13px] font-extrabold leading-tight text-[#0A2B6D]">
              Page Navigation
            </h2>
            <p className="text-[11px] font-semibold leading-tight text-slate-600">
              {visibleItems.length} live views · Training &amp; LMS workspace
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00C6FF]" />
          Live
        </span>
      </div>

      <nav
        aria-label="Training views"
        className="grid auto-rows-fr grid-cols-2 gap-2 p-3 pt-2 sm:grid-cols-3 md:grid-cols-7 items-stretch"
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
              className={`group flex h-full min-h-[92px] flex-col gap-[3px] rounded-xl border-2 bg-[#0A2B6D] p-[3px] text-left transition-all duration-200 focus-visible:outline-none ${
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

                <span className="flex min-h-[38px] w-full flex-1 items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-1.5 py-1">
                  <span className="line-clamp-2 min-w-0 flex-1 break-words text-[10.5px] font-bold leading-[13px] text-[#0A2B6D]/85">
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