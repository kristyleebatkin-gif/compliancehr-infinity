import React from 'react';
import { Zap } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import UniversalUserSuccessEvidenceFirstSuite from '@/components/operations/UniversalUserSuccessEvidenceFirstSuite';
import AutomaticTaskCompletionEvidenceClosureEngine from '@/components/operations/AutomaticTaskCompletionEvidenceClosureEngine';

export default function UniversalUserSuccessHub() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <ModuleShell
        icon={Zap}
        moduleKey="operations-centre"
        title="Automatic Task Completion, Evidence Closure & User Success Hub"
        subtitle="Staff complete the work; the system completes the administration — 10 automatic evidence closure pipelines, AI completion suggestions, manager exception-only review, and 5-role rapid workspaces."
      />
      <AutomaticTaskCompletionEvidenceClosureEngine />
      <UniversalUserSuccessEvidenceFirstSuite />
    </div>
  );
}