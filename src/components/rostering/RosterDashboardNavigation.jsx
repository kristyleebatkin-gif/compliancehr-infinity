import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarRange, CalendarDays, CalendarClock, ClipboardCheck, ClipboardList, Flame, Wallet, Repeat, CalendarPlus } from 'lucide-react';

const ITEMS = [
  ['roster', 'Roster board', CalendarRange, 'Weekly shifts and planning'],
  ['calendar', 'Calendar', CalendarDays, 'Dates and staff schedules'],
  ['shifts', 'Shift register', CalendarClock, 'Shift records and updates'],
  ['approvals', 'Approvals', ClipboardCheck, 'Review staff timesheets'],
  ['ops', 'Ops overview', ClipboardList, 'Roster operations'],
  ['coverage', 'Coverage map', Flame, 'Staffing and coverage'],
  ['patterns', 'Patterns', Repeat, 'Recurring shift patterns'],
  ['shift-details', 'Shift details', ClipboardList, 'Participant shift information'],
  ['leave', 'Leave', CalendarPlus, 'Staff leave and absences'],
  ['availability', 'Availability', CalendarPlus, 'Staff availability'],
  ['benchmark', 'SCHADS & PRODA Suite', ClipboardCheck, 'Award forecaster & PRODA CSV'],
  ['payroll', 'Payroll report', Wallet, 'Payroll tools and shift reports'],
];

export default function RosterDashboardNavigation({ profile, profileKind }) {
  const items = ITEMS.filter(
    ([key]) =>
      (key !== 'payroll' || profileKind !== 'participant') &&
      (['roster', 'calendar', 'shifts'].includes(key) || (key === 'availability' ? profileKind !== 'participant' : !profile))
  );
  return (
    <TabsList aria-label="Rostering & Shifts Navigation">
      {items.map(([key, label, Icon, hint]) => (
        <TabsTrigger key={key} value={key} data-hint={hint}>
          <Icon className="h-3.5 w-3.5" />
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}