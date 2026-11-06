import React from 'react';
import AuditReadyTodayCommandStrip from '@/components/dashboard/AuditReadyTodayCommandStrip';
import CareSpherePowerBiCommandCentre from '@/components/enterprise/powerbi/CareSpherePowerBiCommandCentre';
import CareSphereSmeGarmSuite from '@/components/enterprise/CareSphereSmeGarmSuite';
import Communications from '@/pages/Communications';

export default function Dashboard() {
  return (
    <div className="bright-dashboard mx-auto w-full max-w-[1440px] space-y-4">
      <Communications embedded={false} />
      <CareSpherePowerBiCommandCentre />
      <AuditReadyTodayCommandStrip />
      <CareSphereSmeGarmSuite />
    </div>
  );
}