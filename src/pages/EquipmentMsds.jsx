import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ModuleShell from '@/components/module/ModuleShell';
import { Wrench } from 'lucide-react';
import EquipmentManuals from '@/pages/EquipmentManuals';
import MsdsLibrary from '@/pages/MsdsLibrary';

export default function EquipmentMsds() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(() => searchParams.get('tab') === 'msds' ? 'msds' : 'manuals');
  const [manualTarget, setManualTarget] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-2 md:px-8">
      <ModuleShell
        moduleKey="equipment-manuals"
        title="Equipment & MSDS"
        subtitle="Equipment manuals, operating instructions, maintenance schedules and the chemical MSDS library, with review tracking."
        icon={Wrench}
        actions={<span ref={setReportTarget} className="flex flex-wrap items-center gap-1" />}
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