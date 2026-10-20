import React from 'react';
import PageHeader from '@/components/PageHeader';
import { Wallet } from 'lucide-react';
import MyPayroll from '@/components/payroll/MyPayroll';

export default function MyPayrollPage() {
  return (
    <div className="mx-auto min-w-0 max-w-6xl space-y-6 p-3 sm:p-4 md:p-8">
      <PageHeader
        title="My payroll"
        subtitle="Your own timesheets, payslips and payroll details. You can update your bank and super details at any time."
        icon={Wallet}
        accent={['#0ea5e9', '#16a34a']}
      />
      <MyPayroll />
    </div>
  );
}