import React from 'react';
import { Database } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import UniversalDataStorageRetentionExportSuite from '@/components/compliance/UniversalDataStorageRetentionExportSuite';
import FiveLayerEnterpriseAcceptanceSuite from '@/components/compliance/FiveLayerEnterpriseAcceptanceSuite';

export default function UniversalStorageHub() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <ModuleShell
        icon={Database}
        moduleKey="documents"
        title="Universal Data Storage, Retention, Traceability & Export Hub"
        subtitle="Automatic 6-Destination Record Storage (25 Item Types), 11-Attribute Search, 9-Way Zero-Orphan Linking, 7-Layer Evidence Retention & 4-Format Exports (PDF, Word, Excel, CSV)"
      />
      <UniversalDataStorageRetentionExportSuite />
      <FiveLayerEnterpriseAcceptanceSuite />
    </div>
  );
}