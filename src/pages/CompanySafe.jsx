import React from 'react';
import PageHeader from '@/components/PageHeader';
import { Lock, IdCard, Building2, FolderLock, ShieldCheck } from 'lucide-react';
import BusinessIdentityCard from '@/components/safe/BusinessIdentityCard';
import BusinessDetailsCard from '@/components/safe/BusinessDetailsCard';
import ComplianceUploads from '@/components/safe/ComplianceUploads';

import StaffBadgeCreator from '@/components/safe/StaffBadgeCreator';
import SecurityPosture from '@/components/safe/SecurityPosture';
import LiveSecurityEvidence from '@/components/safe/LiveSecurityEvidence';

export default function CompanySafe() {
  return <div className="space-y-4">
    <PageHeader icon={Lock} title="Company Safe" subtitle="Business identity, business documents and important business information, secured in one safe." showAlerts={false} />
    <LiveSecurityEvidence />
    <div className="flex items-center gap-2 text-sm font-bold font-editorial"><IdCard className="h-4 w-4 text-primary" />Staff Badge Creator</div>
    <StaffBadgeCreator />
    <BusinessIdentityCard />
    <div className="flex items-center gap-2 text-sm font-bold font-editorial"><Building2 className="h-4 w-4 text-primary" />Important Business Information</div>
    <BusinessDetailsCard />
    <ComplianceUploads docTypes={['NDIS Registration Certificate', 'Public Liability Insurance']} title="Registrations & insurances" description="Manage the provider's NDIS registration certificate and public liability policy alongside other company documents." />
    <div className="flex items-center gap-2 text-sm font-bold font-editorial"><FolderLock className="h-4 w-4 text-primary" />Compliance &amp; Business Documents</div>
    <ComplianceUploads />
    <div className="flex items-center gap-2 text-sm font-bold font-editorial"><ShieldCheck className="h-4 w-4 text-primary" />Security &amp; Trust</div>
    <SecurityPosture />
  </div>;
}