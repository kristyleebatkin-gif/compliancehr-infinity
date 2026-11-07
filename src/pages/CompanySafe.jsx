import React, { useState } from 'react';
import ModuleShell from '@/components/module/ModuleShell';
import { Lock, IdCard, FolderLock, ShieldCheck, Sparkles, FileCheck2, Award } from 'lucide-react';
import BusinessIdentityCard from '@/components/safe/BusinessIdentityCard';
import BusinessDetailsCard from '@/components/safe/BusinessDetailsCard';
import ComplianceUploads from '@/components/safe/ComplianceUploads';
import SoftwareAndSafeBanner from '@/components/safe/SoftwareAndSafeBanner';
import StaffBadgeCreator from '@/components/safe/StaffBadgeCreator';
import SecurityPosture from '@/components/safe/SecurityPosture';
import LiveSecurityEvidence from '@/components/safe/LiveSecurityEvidence';
import EnterpriseStandardQualityGateSuite from '@/components/compliance/EnterpriseStandardQualityGateSuite';
import UniversalDataStorageRetentionExportSuite from '@/components/compliance/UniversalDataStorageRetentionExportSuite';
import { SQUISHED_GRADIENT } from '@/components/safe/ExecutiveWallScene';

const SAFE_MODULES = [
  { key: 'identity', icon: Sparkles, color: '#0072FF', title: 'Business Identity' },
  { key: 'evidence', icon: ShieldCheck, color: '#A855F7', title: 'Live Security Evidence' },
  { key: 'badges', icon: IdCard, color: '#FF2E9A', title: 'Staff Badge Creator' },
  { key: 'registrations', icon: Award, color: '#0072FF', title: 'Registrations & Insurances' },
  { key: 'documents', icon: FolderLock, color: '#A855F7', title: 'Compliance Documents' },
  { key: 'posture', icon: FileCheck2, color: '#FF2E9A', title: 'Security & Trust Posture' },
];

export default function CompanySafe({ embedded = false }) {
  const [openArea, setOpenArea] = useState({
    identity: true,
    evidence: false,
    badges: false,
    registrations: true,
    documents: false,
    posture: false,
  });
  const toggle = (k) => setOpenArea((prev) => ({ ...prev, [k]: !prev[k] }));

  return (
    <div className="space-y-3 bg-transparent text-white">
      {!embedded && (
        <ModuleShell
          icon={Lock}
          moduleKey="company-safe"
          title="Company Safe (Inside Document Vault)"
          subtitle="Business identity, credentials, registrations, and executive safe documents."
        />
      )}

      <SoftwareAndSafeBanner compact={embedded} />

      <div className="space-y-2">
        <div
          className="flex items-center justify-between rounded-xl px-3.5 py-2 text-white shadow-sm"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <span className="text-xs font-extrabold text-white">
            Company Safe Modular Areas (Click any tile to toggle)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
          {SAFE_MODULES.map((m) => {
            const Icon = m.icon;
            const isOpen = !!openArea[m.key];
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => toggle(m.key)}
                className="group relative flex min-w-0 items-center gap-1.5 overflow-hidden rounded-lg border px-2.5 py-1.5 text-left text-white transition-all"
                style={{
                  borderColor: isOpen ? m.color : 'rgba(255,255,255,0.2)',
                  backgroundColor: '#081018',
                }}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white"
                  style={{ background: m.color }}
                >
                  <Icon className="h-3 w-3 text-white" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[10px] font-extrabold text-white">
                  {m.title}
                </span>
              </button>
            );
          })}
        </div>

        {openArea.identity && <BusinessIdentityCard />}
        {openArea.evidence && <LiveSecurityEvidence />}
        {openArea.badges && <StaffBadgeCreator />}
        {openArea.registrations && (
          <ComplianceUploads
            defaultOpen
            docTypes={['NDIS Registration Certificate', 'Public Liability Insurance']}
            title="Registrations & insurances"
            description="Manage the provider's NDIS registration certificate and public liability policy alongside other company documents."
          />
        )}
        {openArea.documents && <ComplianceUploads defaultOpen />}
        {openArea.posture && <SecurityPosture defaultOpen />}
      </div>

      <BusinessDetailsCard />
      {!embedded && <UniversalDataStorageRetentionExportSuite />}
      {!embedded && <EnterpriseStandardQualityGateSuite />}
    </div>
  );
}