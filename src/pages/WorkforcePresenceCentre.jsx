import React from 'react';
import { Siren } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import WorkforcePresenceSafetyCentre from '@/components/emergency/WorkforcePresenceSafetyCentre';
import EnterpriseOperationsAttendancePayrollFramework from '@/components/operations/EnterpriseOperationsAttendancePayrollFramework';
import FrontlineWorkerMobileRapidSuite from '@/components/operations/FrontlineWorkerMobileRapidSuite';
import MasterEnterpriseEcosystemConsolidationSuite from '@/components/operations/MasterEnterpriseEcosystemConsolidationSuite';
import UniversalRecordIntelligenceRoutingSuite from '@/components/operations/UniversalRecordIntelligenceRoutingSuite';
import UniversalUserSuccessEvidenceFirstSuite from '@/components/operations/UniversalUserSuccessEvidenceFirstSuite';

export default function WorkforcePresenceCentre() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <ModuleShell
        icon={Siren}
        moduleKey="emergency-response"
        title="Workforce Presence, Visitor Management, Site Attendance & Emergency Accountability Centre"
        subtitle="Universal User Success & Evidence-First Standard, Unified 9-Role Attendance, Emergency Roll Call, Record Intelligence Routing & Frontline Rapid Suite"
      />
      <UniversalUserSuccessEvidenceFirstSuite />
      <WorkforcePresenceSafetyCentre />
      <UniversalRecordIntelligenceRoutingSuite />
      <MasterEnterpriseEcosystemConsolidationSuite />
      <FrontlineWorkerMobileRapidSuite />
      <EnterpriseOperationsAttendancePayrollFramework />
    </div>
  );
}