import React from 'react';
import AuditReadyTodayCommandStrip from '@/components/dashboard/AuditReadyTodayCommandStrip';

export default function Dashboard() {
  return (
    <div className="bright-dashboard mx-auto w-full max-w-[1440px] space-y-3">
      <AuditReadyTodayCommandStrip />
    </div>
  );
}