import React from 'react';
import { Siren } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import WorkforcePresenceSafetyCentre from '@/components/emergency/WorkforcePresenceSafetyCentre';
import EnterpriseOperationsAttendancePayrollFramework from '@/components/operations/EnterpriseOperationsAttendancePayrollFramework';
import FrontlineWorkerMobileRapidSuite from '@/components/operations/FrontlineWorkerMobileRapidSuite';

export default function WorkforcePresenceCentre() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <ModuleShell
        icon={Siren}
        moduleKey="emergency-response"
        title="Workforce Presence, Visitor Management, Site Attendance & Emergency Accountability Centre"
        subtitle="Frontline Mobile-First Rapid Completion ('Finish My Shift'), Unified 9-Role Attendance, SCHADS Award & Shift Integrity, Service Delivery Docs & Emergency Roll Call"
      />
      <FrontlineWorkerMobileRapidSuite />
      <WorkforcePresenceSafetyCentre />
      <EnterpriseOperationsAttendancePayrollFramework />
    </div>
  );
}