import React from 'react';
import { Database } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import UniversalRegisterManagementHubSuite from '@/components/operations/UniversalRegisterManagementHubSuite';

export default function UniversalRegisterHub() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <ModuleShell
        icon={Database}
        moduleKey="documents"
        title="Universal Register Management, Record Indexing, Register Health & Document Hub"
        subtitle="45 Auto-Maintained Master Registers, 28-Source Automatic Register Engine, 13-Attribute Indexing, 8-Metric Register Health Dashboard, 6 Auto-Generated Checklists & 4-Format Exports."
      />
      <UniversalRegisterManagementHubSuite />
    </div>
  );
}