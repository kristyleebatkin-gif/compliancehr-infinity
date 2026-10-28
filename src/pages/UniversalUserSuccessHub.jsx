import React from 'react';
import { Zap } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import UniversalUserSuccessEvidenceFirstSuite from '@/components/operations/UniversalUserSuccessEvidenceFirstSuite';

export default function UniversalUserSuccessHub() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <ModuleShell
        icon={Zap}
        moduleKey="operations-centre"
        title="Universal User Success, Rapid Access & Evidence-First Hub"
        subtitle="Personalised 5-Role Workspaces, 8-Task Speed Standard (<10s Clock-In to <5m Notes), Automatic 5-Point Evidence Creation, Unified Manager Review Mode, One-Screen Audit Mode & Zero Dead Ends."
      />
      <UniversalUserSuccessEvidenceFirstSuite />
    </div>
  );
}