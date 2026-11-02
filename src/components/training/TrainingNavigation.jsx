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

      {/* 50% Compact Brand Header */}
      <div className="flex items-center justify-between border-b border-white/15 bg-white px-3 py-1">
        <BrandLogoLockup size="xs" theme="light" showSlogan={false} />
        <span className="rounded-full bg-[#0A2B6D] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#00C6FF]">
          ◉ Training Control Pods
        </span>
      </div>

      {/* 50% Compact Circular Control Pods */}
      <nav
        aria-label="Training views"
        className="grid auto-rows-fr grid-cols-2 gap-1.5 p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 items-stretch"
      >
        {visibleItems.map(([value, label, Icon, hint], idx) => {
          const active = view === value;
          const ringColor = active ? '#00C6FF' : idx % 2 === 0 ? '#00C6FF' : '#FF6EDB';
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(value)}
              className={`group flex h-full min-h-[48px] items-center gap-2 rounded-3xl border px-2.5 py-1.5 text-left backdrop-blur-md transition-all duration-200 focus-visible:outline-none ${
                active
                  ? 'border-[#00C6FF] shadow-[0_0_18px_rgba(0,198,255,0.75)] scale-[1.01]'
                  : 'border-white/25 hover:-translate-y-0.5 hover:border-[#00C6FF] hover:shadow-[0_0_12px_rgba(161,0,255,0.5)]'
              }`}
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
                    strokeDashoffset={active ? '6' : '14'}
                  />
                </svg>
                <span
                  className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full text-white"
                  style={{ background: BRAND_GRADIENT }}
                >
                  <Icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                </span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-1">
                  <span className="inline-flex max-w-full items-center gap-0.5 rounded-full bg-white px-2 py-0.2 shadow-2xs">
                    <span className="text-[8px] leading-none" style={{ color: ringColor }}>
                      ◉
                    </span>
                    <span
                      className="text-[9px] font-extrabold leading-tight text-[#0A2B6D]"
                      style={{ color: '#0A2B6D' }}
                    >
                      {label}
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-1 py-0 text-[6.5px] font-black uppercase ${
                      active ? 'bg-[#00C6FF] text-[#0A2B6D]' : 'bg-white/15 text-white'
                    }`}
                  >
                    {active ? 'ON' : 'LIVE'}
                  </span>
                </span>

                <span className="mt-0.5 flex items-center justify-between gap-1">
                  <span
                    className="min-w-0 flex-1 break-words text-[8px] font-bold leading-tight text-white/90"
                    style={{ color: '#E2E8F0' }}
                  >
                    {hint}
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#00C6FF]" />
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </section>
  );
}