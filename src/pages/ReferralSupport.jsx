import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { HeartHandshake, Library, Phone, Send } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleAlertsButton from '@/components/ModuleAlertsButton';
import CrisisInformation from '@/components/referral/CrisisInformation';
import LocalServices from '@/components/referral/LocalServices';
import ReferralForm from '@/components/referral/ReferralForm';
import ReferralLog from '@/components/referral/ReferralLog';
import ReferralSendDialog from '@/components/referral/ReferralSendDialog';
import ResourceLibrary from '@/components/referral/ResourceLibrary';
import AutoRegisterInsights from '@/components/AutoRegisterInsights';

export default function ReferralSupport({ embedded = false } = {}) {
  const [tab, setTab] = useState('crisis');
  const [editing, setEditing] = useState(null);
  const [sendTarget, setSendTarget] = useState(null);

  return (
    <div className="space-y-4">
      <ModuleShell
        embedded={embedded}
        icon={HeartHandshake}
        moduleKey="community-referral"
        title="Referral & Support Hub"
        subtitle="Crisis information, local services, a national resource library and a loggable referral form."
        actions={<>
          <a href="tel:000" className="inline-flex h-8 items-center gap-1.5 rounded-lg border-2 border-[#0A2B6D] bg-[#FF2E9A] px-3 text-xs font-extrabold text-white hover:opacity-95"><Phone className="h-3.5 w-3.5" />Emergency 000</a>
          <ModuleAlertsButton />
        </>}
      />

      {!embedded && <AutoRegisterInsights placement="header" />}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap gap-1.5 h-auto rounded-xl border-2 border-[#0A2B6D] bg-white p-1.5 shadow-sm">
          <TabsTrigger value="crisis" className="border border-[#0A2B6D]/40 font-extrabold">Crisis Information</TabsTrigger>
          <TabsTrigger value="services" className="border border-[#0A2B6D]/40 font-extrabold">Local Services</TabsTrigger>
          <TabsTrigger value="resources" className="border border-[#0A2B6D]/40 font-extrabold">Resource Library</TabsTrigger>
          <TabsTrigger value="form" className="border border-[#0A2B6D]/40 font-extrabold">Referral Form</TabsTrigger>
          <TabsTrigger value="log" className="border border-[#0A2B6D]/40 font-extrabold">Referral Log</TabsTrigger>
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