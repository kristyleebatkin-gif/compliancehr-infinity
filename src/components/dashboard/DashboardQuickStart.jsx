import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, BookOpen, LayoutGrid, ShieldAlert } from 'lucide-react';
import { getTilePalette, getHeaderView, getSymbolView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const STEPS = [
  {
    icon: LayoutGrid,
    title: 'Choose a module',
    text: 'Use the role-based sidebar or dashboard tiles to open the area you need.',
  },
  {
    icon: BookOpen,
    title: 'Add or update records',
    text: 'Follow the on-screen workflow, review any pre-filled details, then save or submit.',
  },
  {
    icon: Bell,
    title: 'Check notifications',
    text: 'Review the bell for expiries, appraisals, audit reminders, escalations and updates.',
  },
  {
    icon: ShieldAlert,
    title: 'Report safety issues',
    text: 'Log incidents, hazards and risks promptly from their dashboard modules.',
  },
];

export default function DashboardQuickStart() {
  return (
    <section
      aria-labelledby="dashboard-quick-start"
      className="preserve-island-theme overflow-hidden rounded-2xl p-[3px] shadow-md"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div
        className="rounded-[13px] p-3"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        <div
          className="rounded-2xl p-[2px]"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="rounded-[14px] bg-white p-3.5 text-center space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                id="dashboard-quick-start"
                className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-full px-4 py-1 text-xs sm:text-sm font-extrabold tracking-wide text-[#0A2B6D] shadow-2xs"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${TOP_BORDER_GRADIENT} border-box`,
                  color: '#0A2B6D',
                }}
              >
                <BookOpen className="h-4 w-4 text-[#0072FF]" />
                <span>◉ Quick Start Guide — Finding Your Way Around ComplianceHR Infinity</span>
              </span>

              <Link
                to="/user-guides"
                className="inline-flex min-h-[32px] items-center justify-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold text-[#0A2B6D] shadow-2xs transition-all hover:opacity-90"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${TOP_BORDER_GRADIENT} border-box`,
                  color: '#0A2B6D',
                }}
              >
                <BookOpen className="h-3.5 w-3.5 text-[#5A00D6]" />
                <span>◉ View Full User Manual</span>
              </Link>
            </div>

            <ol
              className="grid gap-2.5 rounded-xl p-2.5 sm:grid-cols-2 lg:grid-cols-4 text-left"
              style={{
                background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
              }}
            >
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const sym = getSymbolView(index + 1);
                return (
                  <li
                    key={step.title}
                    className="flex gap-2.5 rounded-xl p-3 shadow-2xs"
                    style={{
                      border: '2px solid transparent',
                      background: `linear-gradient(#ffffff, #ffffff) padding-box, ${TOP_BORDER_GRADIENT} border-box`,
                      color: '#0A2B6D',
                    }}
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-2xs"
                      style={{
                        border: '2px solid transparent',
                        background: `linear-gradient(#ffffff, #ffffff) padding-box, ${TOP_BORDER_GRADIENT} border-box`,
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-[#0A2B6D]" style={{ color: '#0A2B6D' }}>
                        <span style={{ color: sym.iconColor }}>◉</span> {index + 1}. {step.title}
                      </div>
                      <p className="mt-0.5 text-[11px] font-bold leading-relaxed text-[#0A2B6D]" style={{ color: '#0A2B6D' }}>
                        {step.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}