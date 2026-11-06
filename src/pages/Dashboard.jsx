import React from 'react';
import AuditReadyTodayCommandStrip from '@/components/dashboard/AuditReadyTodayCommandStrip';
import CareSphereSmeGarmSuite from '@/components/enterprise/CareSphereSmeGarmSuite';

export default function Dashboard() {
  return (
    <div className="bright-dashboard mx-auto w-full max-w-[1440px] space-y-4">
      <AuditReadyTodayCommandStrip />
      <CareSphereSmeGarmSuite />
    </div>
  );
}