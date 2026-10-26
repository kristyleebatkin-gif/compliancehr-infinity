import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersRound, Clock, FileText, Wallet, Download } from 'lucide-react';

const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';

const ITEMS = [
  ['details', 'Payroll details', UsersRound],
  ['timesheets', 'Timesheets', Clock],
  ['payslips', 'Payslips', FileText],
  ['runs', 'Pay runs & payments', Wallet],
  ['reports', 'Reports & exports', Download],
];

export default function PayrollDashboardNavigation() {
  return (
    <TabsList aria-label="Payroll dashboard" className="grid h-auto w-full grid-cols-2 gap-2.5 bg-white p-1 sm:grid-cols-3 lg:grid-cols-5 border-0 shadow-none">
      {ITEMS.map(([key, label, Icon]) => (
        <TabsTrigger
          key={key}
          value={key}
          className="flex min-h-[44px] min-w-0 flex-row items-center justify-start gap-2.5 whitespace-normal rounded-full border-2 border-[#0A2B6D] bg-white px-3.5 py-2 text-left text-[#0A2B6D] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] data-[state=active]:ring-2 data-[state=active]:ring-[#FF2E9A]"
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white shadow-2xs"
            style={{ background: ICON_GRADIENT }}
          >
            <Icon className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-xs font-extrabold leading-tight">{label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}