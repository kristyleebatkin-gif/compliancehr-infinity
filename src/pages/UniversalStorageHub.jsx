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
        moduleKey="universal-storage"
        title="Universal Storage & Export Hub"
        subtitle="Automatic 6-destination record storage, 11-attribute search, 9-way record linking, 7-layer evidence retention, and 4-format exports (PDF, Word, Excel, CSV)."
      />
      <UniversalDataStorageRetentionExportSuite />
      <FiveLayerEnterpriseAcceptanceSuite />
    </div>
  );
}