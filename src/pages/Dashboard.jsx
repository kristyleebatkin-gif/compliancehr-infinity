import React from 'react';
import CareSpherePowerBiCommandCentre from '@/components/enterprise/powerbi/CareSpherePowerBiCommandCentre';
import Communications from '@/pages/Communications';

export default function Dashboard() {
  return (
    <div className="bright-dashboard mx-auto w-full max-w-[1440px] space-y-3">
      <Communications embedded={false} />
      <CareSpherePowerBiCommandCentre />
    </div>
  );
}