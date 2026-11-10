import React from 'react';
import { LayoutGrid, CalendarDays, GraduationCap, Award, Sparkles, TrendingUp, Target, ArrowRight } from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

const DARK_NAVY_CHASSIS =
  'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)';

const APP_DESIGN_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

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

      {/* Compact Training Command Strip (Words Framed with App Design Coloured Border on White) */}
      <div className="flex items-center justify-between bg-white px-3 py-1.5">
        <span
          className="inline-flex rounded-full p-[1.5px]"
          style={{ background: BRAND_GRADIENT }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-0.5">
            <span style={{ color: '#0072FF' }}>◉</span>
            <span
              className="bg-clip-text text-[10.5px] font-extrabold tracking-tight text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)',
              }}
            >
              Training &amp; Competency Command Remote
            </span>
          </span>
        </span>
      </div>

      {/* BOTTOM 3/4 DARK BLUE: Illuminated Modular Buttons with App Design Colour Symbols */}
      <nav
        aria-label="Training views"
        className="grid auto-rows-fr grid-cols-1 gap-2 p-2.5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 items-stretch"
        style={{ background: DARK_NAVY_CHASSIS }}
      >
        {visibleItems.map(([value, label, Icon, hint], idx) => {
          const active = view === value;
          const symColor = APP_DESIGN_COLOURS[idx % APP_DESIGN_COLOURS.length];
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(value)}
              className={`group flex h-full min-h-[68px] flex-col rounded-2xl p-[2px] text-left transition-all duration-200 focus-visible:outline-none ${
                active
                  ? 'shadow-[0_0_20px_rgba(0,198,255,0.85)] scale-[1.01]'
                  : 'shadow-[0_0_12px_rgba(90,0,214,0.35)] hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(0,198,255,0.7)]'
              }`}
              style={{ background: BRAND_GRADIENT }}
            >
              <span
                className="flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[14px]"
                style={{ background: DARK_NAVY_CHASSIS }}
              >
                {/* Top 1/4 White Title Background with App Design Colour Symbol */}
                <span className="flex min-h-[30px] w-full items-center justify-between gap-1.5 bg-white px-2 py-1">
                  <span className="flex min-w-0 items-center gap-1.5">
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
                      <span style={{ color: symColor }}>◉</span> {label}
                    </span>
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0 text-[7px] font-black uppercase ${
                      active ? 'bg-[#0A2B6D] text-[#00C6FF]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: active ? '#00C6FF' : symColor,
                        boxShadow: active ? '0 0 8px 2px #00C6FF' : `0 0 5px 1px ${symColor}`,
                      }}
                    />
                    {active ? 'ON' : 'LIVE'}
                  </span>
                </span>

                {/* Bottom 3/4 Dark Blue Body */}
                <span className="flex flex-1 items-center justify-between gap-1 px-2.5 py-1.5">
                  <span
                    className="min-w-0 flex-1 break-words text-[8.5px] font-bold leading-snug text-white"
                    style={{ color: '#FFFFFF' }}
                  >
                    {hint}
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0" style={{ color: symColor }} />
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </section>
  );
}