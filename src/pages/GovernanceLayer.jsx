import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck } from 'lucide-react';
import LifecycleChain from '@/components/governance/LifecycleChain';
import GovernanceObjectRegister from '@/components/governance/GovernanceObjectRegister';
import AcknowledgementCentre from '@/components/governance/AcknowledgementCentre';
import RegisterFramework from '@/components/governance/RegisterFramework';
import NdisAuditPack from '@/components/governance/NdisAuditPack';

export default function GovernanceLayer() {
  const [tab, setTab] = useState('lifecycle');

  return (
    <div className="space-y-4">
      <PageHeader
        title="Governance Layer"
        subtitle="Every object follows one chain — policy, procedure, plan, form, register, record, task, evidence, review, audit, improvement — with acknowledgements, automatic register updates and a one-click NDIS audit pack."
        icon={ShieldCheck}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto flex-wrap gap-1.5">
          <TabsTrigger value="lifecycle">Lifecycle Chain</TabsTrigger>
          <TabsTrigger value="objects">Universal Objects</TabsTrigger>
          <TabsTrigger value="acknowledgements">Acknowledgement Centre</TabsTrigger>
          <TabsTrigger value="registers">Register Framework</TabsTrigger>
          <TabsTrigger value="audit-pack">Audit Mode &amp; NDIS Pack</TabsTrigger>
        </TabsList>

        <TabsContent value="lifecycle" className="mt-4">
          <LifecycleChain onOpenObjects={() => setTab('objects')} />
        </TabsContent>

        <TabsContent value="objects" className="mt-4">
          <GovernanceObjectRegister />
        </TabsContent>

        <TabsContent value="acknowledgements" className="mt-4">
          <AcknowledgementCentre />
        </TabsContent>

        <TabsContent value="registers" className="mt-4">
          <RegisterFramework />
        </TabsContent>

        <TabsContent value="audit-pack" className="mt-4">
          <NdisAuditPack />
        </TabsContent>
      </Tabs>
    </div>
  );
}