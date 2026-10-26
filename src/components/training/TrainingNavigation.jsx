import React from 'react';
import dashboardTabTone from '@/lib/dashboardTabTone';
import '@/components/dashboard/dashboardNavigation.css';
import { LayoutGrid, CalendarDays, GraduationCap, Award, Sparkles, TrendingUp, Target } from 'lucide-react';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const ITEMS = [
  ['modules', 'Modules', LayoutGrid],
  ['calendar', 'Calendar', CalendarDays],
  ['templates', 'Role templates', GraduationCap],
  ['ladder', 'Ladder', Award],
  ['drills', 'AI Drills', Sparkles],
  ['insights', 'Insights', TrendingUp],
  ['skills', 'Skills', Target],
];

export default function TrainingNavigation({ view, onChange, personalOnly = false }) {
  return (
    <div className="rounded-3xl p-[10px] shadow-md" style={{ background: TOP_BORDER_GRADIENT }}>
      <nav
        data-dashboard-tabs=""
        aria-label="Training views"
        className="grid grid-cols-2 gap-2.5 rounded-[14px] border-0 bg-white p-2.5 sm:grid-cols-4 lg:grid-cols-7 shadow-none"
      >
        {ITEMS.filter(([value]) => !personalOnly || value !== 'templates').map(([value, label, Icon]) => (
          <button
            key={value}
            data-dashboard-tab=""
            data-dashboard-tone={dashboardTabTone(value)}
            type="button"
            aria-pressed={view === value}
            onClick={() => onChange(value)}
            className="flex min-h-[42px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF]"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}