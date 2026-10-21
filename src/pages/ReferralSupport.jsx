import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { HeartHandshake, Library, Phone, Send } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ModuleAlertsButton from '@/components/ModuleAlertsButton';
import CrisisInformation from '@/components/referral/CrisisInformation';
import LocalServices from '@/components/referral/LocalServices';
import ReferralForm from '@/components/referral/ReferralForm';
import ReferralLog from '@/components/referral/ReferralLog';
import ReferralSendDialog from '@/components/referral/ReferralSendDialog';
import ResourceLibrary from '@/components/referral/ResourceLibrary';
import AutoRegisterInsights from '@/components/AutoRegisterInsights';

export default function ReferralSupport() {
  const [tab, setTab] = useState('crisis');
  const [editing, setEditing] = useState(null);
  const [sendTarget, setSendTarget] = useState(null);

  return (
    <div className="space-y-4">
      <PageHeader
        icon={HeartHandshake}
        title="Referral & Support"
        subtitle="Crisis information, local services, a national resource library and a loggable referral form."
        action={<>
          <a href="tel:000" className="inline-flex h-7 items-center gap-1 rounded-lg bg-danger px-2 text-[11px] font-bold text-white hover:bg-danger/90"><Phone className="h-3 w-3" />Emergency 000</a>
          <ModuleAlertsButton />
        </>}
      />

      <AutoRegisterInsights placement="header" />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="crisis">Crisis Information</TabsTrigger>
          <TabsTrigger value="services">Local Services</TabsTrigger>
          <TabsTrigger value="resources">Resource Library</TabsTrigger>
          <TabsTrigger value="form">Referral Form</TabsTrigger>
          <TabsTrigger value="log">Referral Log</TabsTrigger>
        </TabsList>

        <TabsContent value="crisis"><CrisisInformation /></TabsContent>
        <TabsContent value="services"><LocalServices /></TabsContent>
        <TabsContent value="resources"><ResourceLibrary /></TabsContent>
        <TabsContent value="form">
          <ReferralForm
            editing={editing}
            onSaved={() => { setEditing(null); setTab('log'); }}
            onSend={(r) => setSendTarget(r)}
          />
        </TabsContent>
        <TabsContent value="log">
          <ReferralLog
            onEdit={(r) => { setEditing(r); setTab('form'); }}
          />
        </TabsContent>
      </Tabs>

      <ReferralSendDialog referral={sendTarget} open={!!sendTarget} onClose={() => setSendTarget(null)} onSent={() => setSendTarget(null)} />
    </div>
  );
}