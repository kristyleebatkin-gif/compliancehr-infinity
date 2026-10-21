import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarRange, CalendarDays, CalendarClock, ClipboardCheck, ClipboardList, Flame, Wallet, Repeat, CalendarPlus } from 'lucide-react';

const ITEMS = [
  ['roster', 'Roster board', CalendarRange, 'from-teal/40 to-teal/20 text-teal', 'Weekly shifts and planning'],
  ['calendar', 'Calendar', CalendarDays, 'from-primary/40 to-primary/20 text-primary', 'Dates and staff schedules'],
  ['shifts', 'Shift register', CalendarClock, 'from-warning/40 to-warning/20 text-warning', 'Shift records and updates'],
  ['approvals', 'Approvals', ClipboardCheck, 'from-chart-5/40 to-chart-5/20 text-chart-5', 'Review staff timesheets'],
  ['ops', 'Ops overview', ClipboardList, 'from-hr-evidence/40 to-hr-evidence/20 text-hr-evidence', 'Roster operations'],
  ['coverage', 'Coverage map', Flame, 'from-danger/40 to-danger/20 text-danger', 'Staffing and coverage'],
  ['patterns', 'Patterns', Repeat, 'from-primary/40 to-primary/20 text-primary', 'Recurring shift patterns'],
  ['shift-details', 'Shift details', ClipboardList, 'from-teal/40 to-teal/20 text-teal', 'Participant shift information'],
  ['leave', 'Leave', CalendarPlus, 'from-warning/40 to-warning/20 text-warning', 'Staff leave and absences'],
  ['availability', 'Availability', CalendarPlus, 'from-chart-5/40 to-chart-5/20 text-chart-5', 'Staff availability'],
  ['payroll', 'Payroll report', Wallet, 'from-safe/40 to-safe/20 text-safe', 'Payroll tools and shift reports'],
];
export default function RosterDashboardNavigation({ profile, profileKind }) {
  const items = ITEMS.filter(([key]) => (key !== 'payroll' || profileKind !== 'participant') && (['roster', 'calendar', 'shifts'].includes(key) || (key === 'availability' ? profileKind !== 'participant' : !profile)));
  return <TabsList aria-label="Rostering dashboard" className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-3 lg:grid-cols-4">
    {items.map(([key, label, Icon, tone, hint]) => <TabsTrigger key={key} value={key} style={key === 'payroll' ? { '--dashboard-tone': 'var(--payroll)', '--profile-tone': 'var(--profile-mint)' } : undefined} className={`flex min-w-0 whitespace-normal rounded-xl border border-border bg-gradient-to-br p-2 text-left shadow-sm data-[state=active]:border-primary data-[state=active]:ring-1 data-[state=active]:ring-primary ${key === 'payroll' ? 'col-span-full min-h-12 flex-row justify-start gap-3' : 'min-h-16 flex-col items-start justify-center gap-1'} ${tone}`}>
      <span className="flex items-center gap-2"><Icon className="h-4 w-4 shrink-0" /><span className="text-xs font-bold">{label}</span></span>
      <span className="text-[11px] font-medium text-muted-foreground">{hint}</span>
    </TabsTrigger>)}
  </TabsList>;
}