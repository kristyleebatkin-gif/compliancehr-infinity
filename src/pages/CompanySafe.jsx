import React from 'react';
import ModuleShell from '@/components/module/ModuleShell';
import { Lock, IdCard, Building2, FolderLock, ShieldCheck } from 'lucide-react';
import BusinessIdentityCard from '@/components/safe/BusinessIdentityCard';
import BusinessDetailsCard from '@/components/safe/BusinessDetailsCard';
import ComplianceUploads from '@/components/safe/ComplianceUploads';
import SoftwareAndSafeBanner from '@/components/safe/SoftwareAndSafeBanner';

import StaffBadgeCreator from '@/components/safe/StaffBadgeCreator';
import SecurityPosture from '@/components/safe/SecurityPosture';
import LiveSecurityEvidence from '@/components/safe/LiveSecurityEvidence';

export default function CompanySafe() {
  return <div className="space-y-6">
    <ModuleShell icon={Lock} moduleKey="company-safe" title="Company Safe" subtitle="Business identity, business documents and important business information, secured in one safe." />
    <SoftwareAndSafeBanner />
    <BusinessIdentityCard />
    <LiveSecurityEvidence />
    <StaffBadgeCreator />
    <BusinessDetailsCard />
    <ComplianceUploads docTypes={['NDIS Registration Certificate', 'Public Liability Insurance']} title="Registrations & insurances" description="Manage the provider's NDIS registration certificate and public liability policy alongside other company documents." />
    <ComplianceUploads />
    <SecurityPosture />
  </div>;
}