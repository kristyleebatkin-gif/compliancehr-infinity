import React from 'react';
import ModuleShell from '@/components/module/ModuleShell';
import { Wallet } from 'lucide-react';
import MyPayroll from '@/components/payroll/MyPayroll';

export default function MyPayrollPage() {
  return (
    <div className="mx-auto min-w-0 max-w-6xl space-y-4 p-3 sm:p-3 md:p-5">
      <ModuleShell
        moduleKey="payroll"
        title="My payroll"
        subtitle="Your own timesheets, payslips and payroll details. You can update your bank and super details at any time."
        icon={Wallet}
      />
      <MyPayroll />
    </div>
  );
}