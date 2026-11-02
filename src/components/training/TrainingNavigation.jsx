import React from 'react';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import { LayoutGrid, CalendarDays, GraduationCap, Award, Sparkles, TrendingUp, Target, ArrowRight } from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

const LANDING_TOP_LOGO_BLUE =
  'radial-gradient(circle at 50% 35%, rgba(0, 198, 255, 0.42) 0%, #0072FF 44%, #0A2B6D 86%, #061539 100%)';

const DARK_NAVY_CHASSIS =
  'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)';

const APP_DESIGN_ICON_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

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
      className="preserve-island-theme overflow-hidden rounded-2xl border-2 border-[#0072FF] shadow-lg"
      style={{ background: DARK_NAVY_CHASSIS }}
    >
      <div className="h-1 w-full" style={{ background: BRAND_GRADIENT }} />

      {/* Very Top Logo Section ONLY: Landing-Page Dashboard Blue Around Enlarged Logo & Fitted Slogan */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0072FF] px-3 py-2"
        style={{ background: LANDING_TOP_LOGO_BLUE }}
      >
        <BrandLogoLockup size="sm" theme="light" showSlogan={true} />
        <span className="rounded-full p-[1.5px]" style={{ background: BRAND_GRADIENT }}>
          <span
            className="block rounded-full bg-white px-3 py-0.5 text-[8.5px] font-black uppercase tracking-wider"
            style={{ color: '#5A00D6' }}
          >
            ◉ Training Control Pods
          </span>
        </span>
      </div>

      {/* All-White Control Pods with App-Design-Colour Borders & Icons */}
      <nav
        aria-label="Training views"
        className="grid auto-rows-fr grid-cols-2 gap-1.5 p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 items-stretch"
      >
        {visibleItems.map(([value, label, Icon, hint], idx) => {
          const active = view === value;
          const iconColor = APP_DESIGN_ICON_COLOURS[idx % APP_DESIGN_ICON_COLOURS.length];
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(value)}
              className={`group flex h-full min-h-[48px] rounded-3xl p-[2px] text-left transition-all duration-200 focus-visible:outline-none ${
                active
                  ? 'shadow-[0_0_18px_rgba(0,198,255,0.85)] scale-[1.01]'
                  : 'hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(0,198,255,0.5)]'
              }`}
              style={{ background: BRAND_GRADIENT }}
            >
              <span className="flex w-full items-center gap-2 rounded-[22px] bg-white px-2.5 py-1.5">
                <span
                  className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F0FF]"
                  style={{ border: `2px solid ${iconColor}` }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: iconColor }} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-1">
                    <span
                      className="text-[9.5px] font-extrabold leading-tight text-[#0A2B6D]"
                      style={{ color: '#0A2B6D' }}
                    >
                      <span style={{ color: iconColor }}>◉</span> {label}
                    </span>
                    <span
                      className="rounded-full border px-1 py-0 text-[6.5px] font-black uppercase"
                      style={{
                        borderColor: iconColor,
                        color: active ? '#FF2E9A' : '#5A00D6',
                        backgroundColor: '#F5F0FF',
                      }}
                    >
                      {active ? 'ON' : 'LIVE'}
                    </span>
                  </span>

                  <span className="mt-0.5 flex items-center justify-between gap-1">
                    <span
                      className="min-w-0 flex-1 break-words text-[8px] font-bold leading-tight text-[#5A00D6]"
                      style={{ color: '#5A00D6' }}
                    >
                      {hint}
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 shrink-0" style={{ color: iconColor }} />
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </section>
  );
}