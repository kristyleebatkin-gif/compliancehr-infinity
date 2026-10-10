import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { HeartHandshake, Phone, Send } from 'lucide-react';
import CrisisInformation from '@/components/referral/CrisisInformation';
import LocalServices from '@/components/referral/LocalServices';
import ReferralForm from '@/components/referral/ReferralForm';
import ReferralLog from '@/components/referral/ReferralLog';
import ReferralSendDialog from '@/components/referral/ReferralSendDialog';

export default function ReferralSupport() {
  const [tab, setTab] = useState('crisis');
  const [editing, setEditing] = useState(null);
  const [sendTarget, setSendTarget] = useState(null);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/10 p-3"><HeartHandshake className="h-7 w-7" /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Referral &amp; Support</h1>
              <p className="text-sm text-slate-300">Crisis information, local supports and services by postcode, and a referral form you can log, store and email.</p>
            </div>
          </div>
          <a href="tel:000" className="inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2.5 text-sm font-bold text-white hover:bg-danger/90"><Phone className="h-4 w-4" />Emergency 000</a>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="crisis">Crisis Information</TabsTrigger>
          <TabsTrigger value="services">Local Services</TabsTrigger>
          <TabsTrigger value="form">Referral Form</TabsTrigger>
          <TabsTrigger value="log">Referral Log</TabsTrigger>
        </TabsList>

        <TabsContent value="crisis"><CrisisInformation /></TabsContent>
        <TabsContent value="services"><LocalServices /></TabsContent>
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