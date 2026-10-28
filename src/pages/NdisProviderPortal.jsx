import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, Landmark, ReceiptText, Newspaper, Lock } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import NdisPortalCards from '@/components/ndis/NdisPortalCards';
import '@/components/ndis/ndisWorkspace.css';
import ModuleAlertsButton from '@/components/ModuleAlertsButton';
import NdisDeadlineTracker from '@/components/ndis/NdisDeadlineTracker';
import GovernanceControlsRegister from '@/components/ndis/GovernanceControlsRegister';
import AutoRegisterInsights from '@/components/AutoRegisterInsights';
import BestInClassBenchmarkSuite from '@/components/operations/BestInClassBenchmarkSuite';
import EnterpriseToolsAiIntelligencePlatform from '@/components/compliance/EnterpriseToolsAiIntelligencePlatform';

const PORTALS = [
  { name: 'myplace Provider Portal', url: 'https://www.myplace.ndis.gov.au', icon: Landmark, desc: 'The NDIA provider portal for claims, payment requests, bulk billing and viewing participant plan information. Sign in with your own PRODA / myplace credentials.' },
  { name: 'NDIS Commission Provider Portal', url: 'https://providerportal.ndiscommission.gov.au', icon: Building2, desc: 'The Commission portal for registration applications and renewals, reportable incidents, compliance notifications and provider obligations.' },
  { name: 'NDIS Commission - Provider obligations', url: 'https://www.ndiscommission.gov.au/providers', icon: ShieldCheck, desc: 'Practice standards, code of conduct, registration requirements, audits and regulatory guidance for registered providers.' },
  { name: 'Pricing Arrangements & Price Guides', url: 'https://www.ndis.gov.au/providers/pricing', icon: ReceiptText, desc: 'Current NDIS Pricing Arrangements and Price Limits, travel claims, cancellations and annual price updates.' },
  { name: 'NDIS News & Media', url: 'https://www.ndis.gov.au/news', icon: Newspaper, desc: 'Latest NDIA news, media releases and provider announcements.' },
];

export default function NdisProviderPortal() {
  return (
    <div className="ndis-workspace space-y-4">
      <ModuleShell moduleKey="ndis-provider" title="NDIS Registered Provider Portal" subtitle="Direct access points to the official NDIS portals and provider resources." icon={Building2} actions={<ModuleAlertsButton />} />
      <AutoRegisterInsights placement="header" />
      <EnterpriseToolsAiIntelligencePlatform />
      <div className="ndis-dashboard-panels grid items-start gap-3 xl:grid-cols-2"><NdisDeadlineTracker /><GovernanceControlsRegister /></div>
      <div className="ndis-panel ndis-accent-warning p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-warning/10 p-2"><Lock className="h-4 w-4 text-warning" /></div>
          <div className="text-sm">
            <p className="font-semibold">How portal sign-in works</p>
            <p className="text-muted-foreground">Each portal below opens in a new tab. You sign in there with your organisation&apos;s own credentials (PRODA / myplace or Commission portal logins) - for security those credentials are never entered or stored inside this app. Track the latest NDIS changes in the <Link to="/ndis-updates" className="font-semibold text-brand underline">NDIS Updates &amp; News</Link> module.</p>
          </div>
        </div>
      </div>

      <NdisPortalCards portals={PORTALS} />
      <BestInClassBenchmarkSuite />
    </div>
  );
}