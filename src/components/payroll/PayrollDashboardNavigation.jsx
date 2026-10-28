import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersRound, Clock, FileText, Wallet, Download } from 'lucide-react';

const ITEMS = [
  ['details', 'Payroll details', UsersRound, 'Staff tax, super & bank records'],
  ['timesheets', 'Timesheets', Clock, 'Verified shift hours & rates'],
  ['payslips', 'Payslips', FileText, 'Generated employee payslips'],
  ['runs', 'Pay runs & payments', Wallet, 'Process pay runs & ABA exports'],
  ['reports', 'Reports & exports', Download, 'STP, super & payroll summaries'],
];

export default function PayrollDashboardNavigation() {
  return (
    <TabsList aria-label="Payroll & Superannuation Navigation">
      {ITEMS.map(([key, label, Icon, hint]) => (
        <TabsTrigger key={key} value={key} data-hint={hint}>
          <Icon className="h-3.5 w-3.5" />
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}