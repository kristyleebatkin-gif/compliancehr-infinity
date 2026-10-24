import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarClock, ClipboardCheck, ChartNoAxesCombined, FileSignature, FolderCheck, Library, Wallet } from 'lucide-react';

const ITEMS = [
  { key: 'leave', label: 'Leave requests', Icon: CalendarClock, tone: 'from-teal/40 to-teal/20 text-teal', hint: 'Requests and approvals' },
  { key: 'reviews', label: 'Performance reviews', Icon: ClipboardCheck, tone: 'from-primary/40 to-primary/20 text-primary', hint: 'Reviews and development' },
  { key: 'performance', label: 'Appraisal dashboard', Icon: ChartNoAxesCombined, tone: 'from-warning/40 to-warning/20 text-warning', hint: 'Appraisals and compliance' },
  { key: 'paperwork', label: 'Contracts & PDs', Icon: FileSignature, tone: 'from-chart-5/40 to-chart-5/20 text-chart-5', hint: 'Employment paperwork' },
  { key: 'file-completeness', label: 'File completeness', Icon: FolderCheck, tone: 'from-hr-evidence/40 to-hr-evidence/20 text-hr-evidence', hint: 'Required employee evidence' },
  { key: 'templates', label: 'Templates library', Icon: Library, tone: 'from-danger/40 to-danger/20 text-danger', hint: 'HR document templates' },
  { key: 'skills', label: 'Master skills & 17-pt', Icon: ClipboardCheck, tone: 'from-teal/40 to-teal/20 text-teal', hint: 'Competency & sign-offs' },
  { key: 'payroll', label: 'Payroll', Icon: Wallet, tone: 'from-safe/40 to-safe/20 text-safe', hint: 'Pay and employee records' },
];
export default function HrDashboardNavigation({ isManager, payrollVisible }) {
  return <TabsList aria-label="HR dashboard" className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-3 lg:grid-cols-4">
    {ITEMS.filter((item) => isManager || ['leave', 'reviews', 'paperwork'].includes(item.key) || (item.key === 'payroll' && payrollVisible)).map(({ key, label, Icon, tone, hint }) => <TabsTrigger key={key} value={key} className={`flex min-w-0 gap-1 whitespace-normal rounded-xl border border-border bg-gradient-to-br p-2 text-left shadow-sm data-[state=active]:border-primary data-[state=active]:ring-1 data-[state=active]:ring-primary ${key === 'payroll' ? 'col-span-full min-h-12 flex-row items-center justify-start gap-x-3' : 'min-h-16 flex-col items-start justify-center'} ${tone}`}>
      <span className="flex items-center gap-2"><Icon className="h-4 w-4 shrink-0" /><span className="text-xs font-bold">{key === 'paperwork' && !isManager ? 'My HR files' : key === 'payroll' && !isManager ? 'My payroll' : label}</span></span>
      <span className="text-[11px] font-medium text-muted-foreground">{hint}</span>
    </TabsTrigger>)}
  </TabsList>;
}