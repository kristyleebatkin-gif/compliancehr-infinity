import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarClock, ClipboardCheck, ChartNoAxesCombined, FileSignature, FolderCheck, Library, Wallet } from 'lucide-react';

const ITEMS = [
  { key: 'leave', label: 'Leave requests', Icon: CalendarClock, tone: 'from-teal/15 to-teal/5 text-teal', hint: 'Requests and approvals' },
  { key: 'reviews', label: 'Performance reviews', Icon: ClipboardCheck, tone: 'from-primary/15 to-primary/5 text-primary', hint: 'Reviews and development' },
  { key: 'performance', label: 'Appraisal dashboard', Icon: ChartNoAxesCombined, tone: 'from-warning/15 to-warning/5 text-warning', hint: 'Appraisals and compliance' },
  { key: 'paperwork', label: 'Contracts & PDs', Icon: FileSignature, tone: 'from-brand/15 to-brand/5 text-brand', hint: 'Employment paperwork' },
  { key: 'file-completeness', label: 'File completeness', Icon: FolderCheck, tone: 'from-safe/15 to-safe/5 text-safe', hint: 'Required employee evidence' },
  { key: 'templates', label: 'Templates library', Icon: Library, tone: 'from-teal/15 to-primary/5 text-teal', hint: 'HR document templates' },
  { key: 'payroll', label: 'Payroll', Icon: Wallet, tone: 'from-safe/15 to-teal/5 text-safe', hint: 'Pay and employee records' },
];
export default function HrDashboardNavigation({ isManager, payrollVisible }) {
  return <TabsList aria-label="HR dashboard" className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-3 lg:grid-cols-4">
    {ITEMS.filter((item) => isManager || ['leave', 'reviews', 'paperwork'].includes(item.key) || (item.key === 'payroll' && payrollVisible)).map(({ key, label, Icon, tone, hint }) => <TabsTrigger key={key} value={key} className={`flex min-h-20 min-w-0 flex-col items-start justify-center gap-1 whitespace-normal rounded-xl border border-border bg-gradient-to-br p-3 text-left shadow-sm data-[state=active]:border-primary data-[state=active]:ring-1 data-[state=active]:ring-primary ${tone}`}>
      <span className="flex items-center gap-2"><Icon className="h-4 w-4 shrink-0" /><span className="text-xs font-bold">{key === 'paperwork' && !isManager ? 'My HR files' : key === 'payroll' && !isManager ? 'My payroll' : label}</span></span>
      <span className="text-[11px] font-medium text-muted-foreground">{hint}</span>
    </TabsTrigger>)}
  </TabsList>;
}