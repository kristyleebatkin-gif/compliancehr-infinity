import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersRound, Clock, FileText, Wallet, Download } from 'lucide-react';

const ITEMS = [
  ['details', 'Payroll details', UsersRound, 'from-teal/40 to-teal/20 text-teal'],
  ['timesheets', 'Timesheets', Clock, 'from-primary/40 to-primary/20 text-primary'],
  ['payslips', 'Payslips', FileText, 'from-warning/40 to-warning/20 text-warning'],
  ['runs', 'Pay runs & payments', Wallet, 'from-safe/40 to-safe/20 text-safe'],
  ['reports', 'Reports & exports', Download, 'from-chart-5/40 to-chart-5/20 text-chart-5'],
];
export default function PayrollDashboardNavigation() {
  return <TabsList aria-label="Payroll dashboard" className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-3 lg:grid-cols-5">
    {ITEMS.map(([key, label, Icon, tone]) => <TabsTrigger key={key} value={key} className={`flex min-h-16 min-w-0 flex-col items-start justify-center gap-2 whitespace-normal rounded-xl border border-border bg-gradient-to-br p-2 text-left shadow-sm data-[state=active]:border-primary data-[state=active]:ring-1 data-[state=active]:ring-primary ${tone}`}>
      <Icon className="h-4 w-4" /><span className="text-xs font-bold">{label}</span>
    </TabsTrigger>)}
  </TabsList>;
}