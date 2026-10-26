import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarClock, ClipboardCheck, ChartNoAxesCombined, FileSignature, FolderCheck, Library, Wallet, HeartHandshake, Tv, Sun } from 'lucide-react';

const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';

const ITEMS = [
  { key: 'shoreline', label: 'Shoreline Command', Icon: Sun, hint: '44×44px heatmap & beach cheers' },
  { key: 'leave', label: 'Leave requests', Icon: CalendarClock, hint: 'Requests and approvals' },
  { key: 'reviews', label: 'Performance reviews', Icon: ClipboardCheck, hint: 'Reviews and development' },
  { key: 'volunteering', label: 'Volunteering & Placement', Icon: HeartHandshake, hint: 'Volunteers & student placements' },
  { key: 'media-goals', label: 'TV · Radio · Phone · PC', Icon: Tv, hint: 'Achieving goals, doors & hobbies' },
  { key: 'performance', label: 'Appraisal dashboard', Icon: ChartNoAxesCombined, hint: 'Appraisals and compliance' },
  { key: 'paperwork', label: 'Contracts & PDs', Icon: FileSignature, hint: 'Employment paperwork' },
  { key: 'file-completeness', label: 'File completeness', Icon: FolderCheck, hint: 'Required employee evidence' },
  { key: 'templates', label: 'Templates library', Icon: Library, hint: 'HR document templates' },
  { key: 'skills', label: 'Master skills & 17-pt', Icon: ClipboardCheck, hint: 'Competency & sign-offs' },
  { key: 'payroll', label: 'Payroll', Icon: Wallet, hint: 'Pay and employee records' },
];

export default function HrDashboardNavigation({ isManager, payrollVisible }) {
  return (
    <TabsList aria-label="HR dashboard" className="grid h-auto w-full grid-cols-2 gap-2.5 bg-white p-1 sm:grid-cols-3 lg:grid-cols-5 border-0 shadow-none">
      {ITEMS.filter(
        (item) =>
          isManager ||
          ['shoreline', 'leave', 'reviews', 'volunteering', 'media-goals', 'paperwork'].includes(item.key) ||
          (item.key === 'payroll' && payrollVisible)
      ).map(({ key, label, Icon, hint }) => (
        <TabsTrigger
          key={key}
          value={key}
          className="flex min-w-0 gap-2 whitespace-normal rounded-full border-2 border-[#0A2B6D] bg-white px-3.5 py-2 text-left text-[#0A2B6D] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] data-[state=active]:ring-2 data-[state=active]:ring-[#FF2E9A] min-h-[46px] flex-row items-center justify-start"
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white shadow-2xs"
            style={{ background: ICON_GRADIENT }}
          >
            <Icon className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-extrabold leading-tight">
              {key === 'paperwork' && !isManager ? 'My HR files' : key === 'payroll' && !isManager ? 'My payroll' : label}
            </span>
            <span className="block text-[10px] font-bold text-[#5A00D6] leading-tight">{hint}</span>
          </span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}