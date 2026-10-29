import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck } from 'lucide-react';
import LifecycleChain from '@/components/governance/LifecycleChain';
import GovernanceObjectRegister from '@/components/governance/GovernanceObjectRegister';
import DocumentControlRegister from '@/components/governance/DocumentControlRegister';
import AuthorityDeclarationRegister from '@/components/governance/AuthorityDeclarationRegister';
import AcknowledgementCentre from '@/components/governance/AcknowledgementCentre';
import RegisterFramework from '@/components/governance/RegisterFramework';
import AutomaticLinkEngine from '@/components/governance/AutomaticLinkEngine';
import NdisStandardsMap from '@/components/governance/NdisStandardsMap';
import EvidenceChainMap from '@/components/governance/EvidenceChainMap';
import AssuranceRegisters from '@/components/governance/AssuranceRegisters';
import NdisAuditPack from '@/components/governance/NdisAuditPack';

export default function GovernanceLayer() {
  const [tab, setTab] = useState('lifecycle');

  return (
    <div className="space-y-4">
      <PageHeader
        title="Governance Layer"
        subtitle="One governance engine: every policy, procedure, form, register, record, risk, incident, complaint, training item, consent, acknowledgement and audit evidence item linked — with document control, delegations, standards mapping and a one-click NDIS audit pack."
        icon={ShieldCheck}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto flex-wrap gap-1.5">
          <TabsTrigger value="lifecycle">Lifecycle Chain</TabsTrigger>
          <TabsTrigger value="objects">Universal Objects</TabsTrigger>
          <TabsTrigger value="document-control">Document Control</TabsTrigger>
          <TabsTrigger value="delegations">Delegations &amp; Declarations</TabsTrigger>
          <TabsTrigger value="acknowledgements">Acknowledgement Centre</TabsTrigger>
          <TabsTrigger value="registers">Register Framework</TabsTrigger>
          <TabsTrigger value="links">Automatic Links</TabsTrigger>
          <TabsTrigger value="standards">NDIS Standards Map</TabsTrigger>
          <TabsTrigger value="evidence-chain">Evidence Chain</TabsTrigger>
          <TabsTrigger value="assurance">Assurance Registers</TabsTrigger>
          <TabsTrigger value="audit-pack">Audit Mode &amp; NDIS Pack</TabsTrigger>
        </TabsList>

        <TabsContent value="lifecycle" className="mt-4">
          <LifecycleChain onOpenObjects={() => setTab('objects')} />
        </TabsContent>

        <TabsContent value="objects" className="mt-4">
          <GovernanceObjectRegister />
        </TabsContent>

        <TabsContent value="document-control" className="mt-4">
          <DocumentControlRegister />
        </TabsContent>

        <TabsContent value="delegations" className="mt-4">
          <AuthorityDeclarationRegister />
        </TabsContent>

        <TabsContent value="acknowledgements" className="mt-4">
          <AcknowledgementCentre />
        </TabsContent>

        <TabsContent value="registers" className="mt-4">
          <RegisterFramework />
        </TabsContent>

        <TabsContent value="links" className="mt-4">
          <AutomaticLinkEngine />
        </TabsContent>

        <TabsContent value="standards" className="mt-4">
          <NdisStandardsMap />
        </TabsContent>

        <TabsContent value="evidence-chain" className="mt-4">
          <EvidenceChainMap />
        </TabsContent>

        <TabsContent value="assurance" className="mt-4">
          <AssuranceRegisters />
        </TabsContent>

        <TabsContent value="audit-pack" className="mt-4">
          <NdisAuditPack />
        </TabsContent>
      </Tabs>
    </div>
  );
}