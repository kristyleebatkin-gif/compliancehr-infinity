import React from 'react';
import { GitBranch } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import UniversalRecordIntelligenceRoutingSuite from '@/components/operations/UniversalRecordIntelligenceRoutingSuite';

export default function UniversalRecordIntelligenceHub() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <ModuleShell
        icon={GitBranch}
        moduleKey="communications"
        title="Universal Record Intelligence, Communications & Data Routing Engine"
        subtitle="Single-entry enterprise intelligence: every document, note, call, email, SMS, assessment, review, incident, risk and attachment is automatically analysed, classified, linked, routed, stored and exportable."
      />
      <UniversalRecordIntelligenceRoutingSuite />
    </div>
  );
}