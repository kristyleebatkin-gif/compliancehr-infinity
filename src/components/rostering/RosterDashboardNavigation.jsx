import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarRange, CalendarDays, CalendarClock, ClipboardCheck, ClipboardList, Flame, Wallet, Repeat, CalendarPlus } from 'lucide-react';

const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';

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
    <TabsList aria-label="Rostering dashboard" className="grid h-auto w-full grid-cols-2 gap-2.5 bg-white p-1 sm:grid-cols-3 lg:grid-cols-4 border-0 shadow-none">
      {items.map(([key, label, Icon, hint]) => (
        <TabsTrigger
          key={key}
          value={key}
          className="flex min-h-[46px] min-w-0 flex-row items-center justify-start gap-2.5 whitespace-normal rounded-full border-2 border-[#0A2B6D] bg-white px-3.5 py-2 text-left text-[#0A2B6D] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] data-[state=active]:ring-2 data-[state=active]:ring-[#FF2E9A]"
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white shadow-2xs"
            style={{ background: ICON_GRADIENT }}
          >
            <Icon className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-extrabold leading-tight">{label}</span>
            <span className="block text-[10px] font-bold text-[#5A00D6] leading-tight">{hint}</span>
          </span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}