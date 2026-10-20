import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import PayrollDashboardNavigation from '@/components/payroll/PayrollDashboardNavigation';
import { Wallet } from 'lucide-react';
import StaffPayrollTab from '@/components/payroll/StaffPayrollTab';
import TimesheetsTab from '@/components/payroll/TimesheetsTab';
import PayslipsTab from '@/components/payroll/PayslipsTab';
import PayRunsTab from '@/components/payroll/PayRunsTab';
import PayrollReportsTab from '@/components/payroll/PayrollReportsTab';

export default function PayrollHub({ embedded = false } = {}) {
  const [tab, setTab] = useState('details');
  return (
    <div className={embedded ? 'min-w-0 space-y-4' : 'mx-auto min-w-0 max-w-6xl space-y-6 p-3 sm:p-3 md:p-5'}>
      {!embedded && (
        <PageHeader
          title="Payroll"
          subtitle="Payroll details, timesheets, payslips, pay runs and compliance exports in one place."
          icon={Wallet}
          accent={['#0ea5e9', '#16a34a']}
        />
      )}
      <Tabs value={tab} onValueChange={setTab}>
        <PayrollDashboardNavigation />
        <TabsContent value="details" className="mt-4"><StaffPayrollTab /></TabsContent>
        <TabsContent value="timesheets" className="mt-4"><TimesheetsTab /></TabsContent>
        <TabsContent value="payslips" className="mt-4"><PayslipsTab /></TabsContent>
        <TabsContent value="runs" className="mt-4"><PayRunsTab /></TabsContent>
        <TabsContent value="reports" className="mt-4"><PayrollReportsTab /></TabsContent>
      </Tabs>
    </div>
  );
}