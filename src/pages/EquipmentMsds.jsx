import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PageHeader from '@/components/PageHeader';
import { Wrench } from 'lucide-react';
import EquipmentManuals from '@/pages/EquipmentManuals';
import MsdsLibrary from '@/pages/MsdsLibrary';

export default function EquipmentMsds() {
  const [tab, setTab] = useState('manuals');
  const [manualTarget, setManualTarget] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-2 md:px-8">
      <PageHeader
        title="Equipment & MSDS"
        subtitle="Equipment manuals, operating instructions, maintenance schedules and the chemical MSDS library, with review tracking."
        icon={Wrench}
        afterAudit={<span ref={setReportTarget} className="flex flex-wrap items-center gap-1" />}
      />
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="manuals">Equipment Manuals</TabsTrigger>
          <span ref={setManualTarget} className={tab === 'manuals' ? 'module-action-bar flex items-center justify-start' : 'hidden'} />
          <TabsTrigger value="msds">MSDS Chemical Library</TabsTrigger>
        </TabsList>
        <TabsContent value="manuals"><EquipmentManuals actionTargets={{ manual: manualTarget, report: reportTarget }} /></TabsContent>
        <TabsContent value="msds"><MsdsLibrary /></TabsContent>
      </Tabs>
    </div>
  );
}