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
import { SQUISHED_GRADIENT } from '@/components/safe/ExecutiveWallScene';

const SAFE_MODULES = [
  {
    key: 'identity',
    icon: Sparkles,
    color: '#2563eb',
    title: 'Business Identity',
    shared: ['Logo, Name & Slogan', 'ComplianceHR Infinity', 'Complete Control. Greater Confidence.'],
  },
  {
    key: 'evidence',
    icon: ShieldCheck,
    color: '#7c3aed',
    title: 'Live Security Evidence',
    shared: ['Status-Trail Entries', 'Platform Audit-Log', 'Controlled User Accounts'],
  },
  {
    key: 'badges',
    icon: IdCard,
    color: '#0d9488',
    title: 'Staff Badge Creator',
    shared: ['Official Photo & Logo Badges', 'Save to Profile & Safe', 'Download or Email PDF'],
  },
  {
    key: 'registrations',
    icon: Award,
    color: '#db2777',
    title: 'Registrations & Insurances',
    shared: ['NDIS Registration Certificate', 'Public Liability Insurance', 'Download & Upload Templates'],
  },
  {
    key: 'documents',
    icon: FolderLock,
    color: '#ea580c',
    title: 'Compliance Documents',
    shared: ['18 Statutory Safe Subjects', 'Certificates & Registers', 'Filed to Document Vault'],
  },
  {
    key: 'posture',
    icon: FileCheck2,
    color: '#16a34a',
    title: 'Security & Trust Posture',
    shared: ['Encryption & Role Access', 'Immutable Audit Trail', 'OAIC Breach Workflow'],
  },
];

export default function CompanySafe() {
  const [openArea, setOpenArea] = useState({});
  const toggle = (k) => setOpenArea((prev) => ({ ...prev, [k]: !prev[k] }));

  return (
    <div className="space-y-4">
      <ModuleShell
        icon={Lock}
        moduleKey="company-safe"
        title="Company Safe"
        subtitle="Business identity, business documents and important business information, secured in one safe."
      />

      {/* Top-Left Picture Frame (Logo, Name, Slogan + Front-Left Chair Back) & Twice-Size Top-Right Colour Area */}
      <SoftwareAndSafeBanner />

      {/* Very Small Modular Icon Tiles for Core Company Safe Areas — Sharing All Under Name */}
      <div className="space-y-2">
        <div
          className="comm-panel-bar flex items-center justify-between rounded-xl px-3.5 py-2 text-white shadow-sm"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <span className="text-xs font-extrabold">
            Company Safe Modular Areas (Small Icon Tiles — Shared Under Name)
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/95">
            Click any tile to open below
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {SAFE_MODULES.map((m) => {
            const Icon = m.icon;
            const isOpen = !!openArea[m.key];
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => toggle(m.key)}
                className="group relative flex min-w-0 items-center gap-1.5 overflow-hidden rounded-lg border px-2 py-1.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  borderColor: isOpen ? m.color : `${m.color}55`,
                  background: `linear-gradient(165deg, ${m.color}24 0%, ${m.color}0d 48%, #ffffff 90%)`,
                }}
              >
                <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: m.color }} />
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white shadow-sm"
                  style={{ background: m.color }}
                >
                  <Icon className="h-3 w-3" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[10px] font-extrabold text-foreground">
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

      {/* All 10 Business Safe Subjects as Very Small Modular Icon Tiles with Shared Details Under Name */}
      <BusinessDetailsCard />
    </div>
  );
}