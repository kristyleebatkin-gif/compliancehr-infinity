import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarClock, ClipboardCheck, ChartNoAxesCombined, FileSignature, FolderCheck, Library, Wallet, HeartHandshake, Tv, Sun } from 'lucide-react';

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
    <TabsList aria-label="HR & Workforce Navigation">
      {ITEMS.filter(
        (item) =>
          isManager ||
          ['shoreline', 'leave', 'reviews', 'volunteering', 'media-goals', 'paperwork'].includes(item.key) ||
          (item.key === 'payroll' && payrollVisible)
      ).map(({ key, label, Icon, hint }) => (
        <TabsTrigger key={key} value={key} data-hint={hint}>
          <Icon className="h-3.5 w-3.5" />
          {key === 'paperwork' && !isManager ? 'My HR files' : key === 'payroll' && !isManager ? 'My payroll' : label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}