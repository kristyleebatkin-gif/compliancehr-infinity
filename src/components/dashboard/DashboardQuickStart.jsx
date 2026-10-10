import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, BookOpen, LayoutGrid, ShieldAlert } from 'lucide-react';

const STEPS = [
  {
    icon: LayoutGrid,
    colour: '#4f46e5',
    title: 'Choose a module',
    text: 'Use the role-based sidebar or dashboard tiles to open the area you need.',
  },
  {
    icon: BookOpen,
    colour: '#0891b2',
    title: 'Add or update records',
    text: 'Follow the on-screen workflow, review any pre-filled details, then save or submit.',
  },
  {
    icon: Bell,
    colour: '#ca8a04',
    title: 'Check notifications',
    text: 'Review the bell for expiries, appraisals, audit reminders, escalations and updates.',
  },
  {
    icon: ShieldAlert,
    colour: '#dc2626',
    title: 'Report safety issues',
    text: 'Log incidents, hazards and risks promptly from their dashboard modules.',
  },
];

export default function DashboardQuickStart() {
  return (
    <section
      aria-labelledby="dashboard-quick-start"
      className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-100 via-white to-cyan-100 p-4 shadow-lg shadow-violet-500/5 dark:border-violet-900 dark:from-violet-950/30 dark:via-card dark:to-cyan-950/30 sm:p-5"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="dashboard-quick-start" className="text-base font-bold font-display text-foreground">
            Quick start guide
          </h2>
          <p className="mt-0.5 text-sm text-foreground/60">
            The basics for finding your way around Compliance HR.
          </p>
        </div>
        <Link
          to="/manual"
          className="inline-flex items-center gap-1.5 self-start rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-violet-500/15 transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <BookOpen className="h-3.5 w-3.5" />
          View full user manual
        </Link>
      </div>

      <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="flex gap-3 rounded-xl border bg-card/85 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: `${step.colour}45`, background: `linear-gradient(135deg, ${step.colour}20, hsl(var(--card)))` }}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-md" style={{ background: `linear-gradient(135deg, ${step.colour}, ${step.colour}bb)` }}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {index + 1}. {step.title}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-foreground/60">{step.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}