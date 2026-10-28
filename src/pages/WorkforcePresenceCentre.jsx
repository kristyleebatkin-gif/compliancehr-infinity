import React from 'react';
import { Siren } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import WorkforcePresenceSafetyCentre from '@/components/emergency/WorkforcePresenceSafetyCentre';
import EnterpriseOperationsAttendancePayrollFramework from '@/components/operations/EnterpriseOperationsAttendancePayrollFramework';

export default function WorkforcePresenceCentre() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <ModuleShell
        icon={Siren}
        moduleKey="emergency-response"
        title="Workforce Presence, Visitor Management, Site Attendance & Emergency Accountability Centre"
        subtitle="Unified 9-Role Attendance, SCHADS Award & Shift Integrity, Service Delivery Docs, Medication & Vehicle Compliance, 6-Monthly Fire Drills & Emergency Roll Call"
      />
      <WorkforcePresenceSafetyCentre />
      <EnterpriseOperationsAttendancePayrollFramework />
    </div>
  );
}