import React from 'react';
import dashboardTabTone from '@/lib/dashboardTabTone';
import '@/components/dashboard/dashboardNavigation.css';
import { LayoutGrid, CalendarDays, GraduationCap, Award, Sparkles, TrendingUp, Target } from 'lucide-react';

const ITEMS = [
  ['modules', 'Modules', LayoutGrid, 'border-primary/50 bg-primary/25'],
  ['calendar', 'Calendar', CalendarDays, 'border-teal/50 bg-teal/25'],
  ['templates', 'Role templates', GraduationCap, 'border-safe/50 bg-safe/25'],
  ['ladder', 'Ladder', Award, 'border-warning/50 bg-warning/30'],
  ['drills', 'AI Drills', Sparkles, 'border-chart-5/50 bg-chart-5/25'],
  ['insights', 'Insights', TrendingUp, 'border-primary/50 bg-primary/25'],
  ['skills', 'Skills', Target, 'border-teal/50 bg-teal/25'],
];
export default function TrainingNavigation({ view, onChange }) {
  return <nav data-dashboard-tabs="" aria-label="Training views" className="grid grid-cols-2 gap-2 rounded-xl border border-primary/20 bg-card/80 p-2 sm:grid-cols-4 lg:grid-cols-7">
    {ITEMS.map(([value, label, Icon, tone]) => <button key={value} data-dashboard-tab="" data-dashboard-tone={dashboardTabTone(value)} type="button" aria-pressed={view === value} onClick={() => onChange(value)} className={`flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold text-foreground transition-shadow hover:shadow-md ${tone} ${view === value ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}><Icon className="h-4 w-4 shrink-0" />{label}</button>)}
  </nav>;
}