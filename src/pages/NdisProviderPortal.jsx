import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Building2, ShieldCheck, Landmark, ReceiptText, Newspaper, Lock } from 'lucide-react';
import ModuleAuditButton from '@/components/ModuleAuditButton';
import ModuleAuditChecklistButton from '@/components/ModuleAuditChecklistButton';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';

const PORTALS = [
  { name: 'myplace Provider Portal', url: 'https://www.myplace.ndis.gov.au', icon: Landmark, desc: 'The NDIA provider portal for claims, payment requests, bulk billing and viewing participant plan information. Sign in with your own PRODA / myplace credentials.' },
  { name: 'NDIS Commission Provider Portal', url: 'https://providerportal.ndiscommission.gov.au', icon: Building2, desc: 'The Commission portal for registration applications and renewals, reportable incidents, compliance notifications and provider obligations.' },
  { name: 'NDIS Commission - Provider obligations', url: 'https://www.ndiscommission.gov.au/providers', icon: ShieldCheck, desc: 'Practice standards, code of conduct, registration requirements, audits and regulatory guidance for registered providers.' },
  { name: 'Pricing Arrangements & Price Guides', url: 'https://www.ndis.gov.au/providers/pricing', icon: ReceiptText, desc: 'Current NDIS Pricing Arrangements and Price Limits, travel claims, cancellations and annual price updates.' },
  { name: 'NDIS News & Media', url: 'https://www.ndis.gov.au/news', icon: Newspaper, desc: 'Latest NDIA news, media releases and provider announcements.' },
];

export default function NdisProviderPortal() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-white/10 p-3"><Building2 className="h-7 w-7" /></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">NDIS Registered Provider Portal</h1>
            <p className="text-sm text-slate-300">Direct access points to the official NDIS portals and provider resources.</p>
          </div>
          <ModuleComplianceStrip path="/ndis-portal" />
          <ModuleAuditChecklistButton />
          <ModuleAuditButton />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-muted/40 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-warning/10 p-2"><Lock className="h-4 w-4 text-warning" /></div>
          <div className="text-sm">
            <p className="font-semibold">How portal sign-in works</p>
            <p className="text-muted-foreground">Each portal below opens in a new tab. You sign in there with your organisation&apos;s own credentials (PRODA / myplace or Commission portal logins) - for security those credentials are never entered or stored inside this app. Track the latest NDIS changes in the <Link to="/ndis-updates" className="font-semibold text-brand underline">NDIS Updates &amp; News</Link> module.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {PORTALS.map((p) => (
          <Card key={p.url}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-brand/10 p-2.5"><p.icon className="h-5 w-5 text-brand" /></div>
                <div className="min-w-0">
                  <p className="font-semibold">{p.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
                </div>
              </div>
              <a href={p.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                <ExternalLink className="h-3.5 w-3.5" />Open {new URL(p.url).hostname}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}