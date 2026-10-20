import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, BookOpen, LayoutGrid, ShieldAlert } from 'lucide-react';

const STEPS = [
  {
    icon: LayoutGrid,
    colour: '#2563eb',
    title: 'Choose a module',
    text: 'Use the role-based sidebar or dashboard tiles to open the area you need.',
  },
  {
    icon: BookOpen,
    colour: '#7c3aed',
    title: 'Add or update records',
    text: 'Follow the on-screen workflow, review any pre-filled details, then save or submit.',
  },
  {
    icon: Bell,
    colour: '#ec4899',
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
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-4 shadow-panel"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="dashboard-quick-start" className="text-base font-bold font-display text-foreground">
            Quick start guide
          </h2>
          <p className="mt-0.5 text-sm text-foreground/60">
            The basics for finding your way around ComplianceHR Infinity.
          </p>
        </div>
        <Link
          to="/user-guides"
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15"
        >
          <BookOpen className="h-3.5 w-3.5" />
          View full user manual
        </Link>
      </div>

      <ol className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="flex gap-2.5 rounded-xl border bg-card p-3" style={{ borderColor: `${step.colour}45`, background: `linear-gradient(135deg, ${step.colour}20, hsl(var(--card)))` }}>
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