import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, BookOpen, LayoutGrid, ShieldAlert } from 'lucide-react';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';
const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';

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
      className="rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="rounded-[16px] bg-white p-4 sm:p-5 text-center space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span
            id="dashboard-quick-start"
            className="inline-flex min-h-[40px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm font-extrabold tracking-wide text-white shadow-sm"
            style={{ background: BADGE_GRADIENT }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#FF2E9A]">
              <BookOpen className="h-3.5 w-3.5 text-[#FF2E9A]" />
            </span>
            <span>Quick Start Guide — Finding Your Way Around ComplianceHR Infinity</span>
          </span>

          <Link
            to="/user-guides"
            className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
            style={{
              background:
                'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
            }}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#0072FF]">
              <BookOpen className="h-3 w-3 text-[#0072FF]" />
            </span>
            <span>View Full User Manual</span>
          </Link>
        </div>

        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="flex gap-3 rounded-2xl border-2 border-[#0A2B6D] bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF]"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] text-white shadow-2xs"
                  style={{ background: ICON_GRADIENT }}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[#0A2B6D]">
                    {index + 1}. {step.title}
                  </div>
                  <p className="mt-0.5 text-xs font-bold leading-relaxed text-[#5A00D6]">
                    {step.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}