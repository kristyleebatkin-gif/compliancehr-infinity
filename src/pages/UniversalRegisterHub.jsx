import React from 'react';
import { Database } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import UniversalRegisterManagementHubSuite from '@/components/operations/UniversalRegisterManagementHubSuite';
import AlliedHealthAndNursingOsSuite from '@/components/enterprise/AlliedHealthAndNursingOsSuite';
import CanonicalRegisterDeduplicationBar from '@/components/operations/CanonicalRegisterDeduplicationBar';

export default function UniversalRegisterHub() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <ModuleShell
        icon={Database}
        moduleKey="documents"
        title="Universal Register Management, 12 Master Registers & Allied Health OS Catalogue"
        subtitle="12 Master Enterprise Document Registers, Numbered Allied Health OS Catalogue (Owners, Review Cycles & Standards Mapping), 13-Section Form Builder & 45 Auto-Maintained Operational Registers."
      />
      <CanonicalRegisterDeduplicationBar />
      <AlliedHealthAndNursingOsSuite />
      <UniversalRegisterManagementHubSuite />
    </div>
  );
}