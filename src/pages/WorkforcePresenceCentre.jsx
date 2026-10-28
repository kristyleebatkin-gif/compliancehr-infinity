import React from 'react';
import { Siren } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import WorkforcePresenceSafetyCentre from '@/components/emergency/WorkforcePresenceSafetyCentre';

export default function WorkforcePresenceCentre() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <ModuleShell
        icon={Siren}
        moduleKey="emergency-response"
        title="Workforce Presence, Visitor Management, Site Attendance & Emergency Accountability Centre"
        subtitle="Unified 9-Role Attendance, Contractor & Visitor Registers, Live Facility Occupancy, First Aid & Fire Warden Coverage, Emergency Roll Call & 4-Format Exports"
      />
      <WorkforcePresenceSafetyCentre />
    </div>
  );
}