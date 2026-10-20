import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { HeartHandshake, Library, Phone, Send } from 'lucide-react';
import ModuleAuditButton from '@/components/ModuleAuditButton';
import ModuleAuditChecklistButton from '@/components/ModuleAuditChecklistButton';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';
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
      <div className="overflow-hidden rounded-2xl border border-border/60 gradient-brand p-4 text-white shadow-lg sm:p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-white/10 p-3"><HeartHandshake className="h-7 w-7" /></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Referral &amp; Support</h1>
            <p className="text-sm text-white/75">Crisis information, local services by postcode, a national resource library, and a referral form you can log, PDF and email.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <a href="tel:000" className="inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2.5 text-sm font-bold text-white hover:bg-danger/90"><Phone className="h-4 w-4" />Emergency 000</a>
          <ModuleAlertsButton />
          <ModuleComplianceStrip path="/referrals" />
          <ModuleAuditChecklistButton />
          <ModuleAuditButton />
        </div>
      </div>

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