import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import ExecutiveOperationsCentre from '@/components/operations/ExecutiveOperationsCentre';
import UniversalDataStorageRetentionExportSuite from '@/components/compliance/UniversalDataStorageRetentionExportSuite';
import EnterpriseOperationsAttendancePayrollFramework from '@/components/operations/EnterpriseOperationsAttendancePayrollFramework';
import FrontlineWorkerMobileRapidSuite from '@/components/operations/FrontlineWorkerMobileRapidSuite';
import UniversalRecordIntelligenceRoutingSuite from '@/components/operations/UniversalRecordIntelligenceRoutingSuite';
import UniversalUserSuccessEvidenceFirstSuite from '@/components/operations/UniversalUserSuccessEvidenceFirstSuite';
import AutomaticTaskCompletionEvidenceClosureEngine from '@/components/operations/AutomaticTaskCompletionEvidenceClosureEngine';
import UniversalRegisterManagementHubSuite from '@/components/operations/UniversalRegisterManagementHubSuite';
import OrganisationalOperatingSystemCommand from '@/components/enterprise/OrganisationalOperatingSystemCommand';
import Universal360ProfileFramework from '@/components/enterprise/Universal360ProfileFramework';
import { Cpu, Users, Zap, ShieldCheck, FolderOpen, Layers } from 'lucide-react';

const EXEC_TABS = [
  { id: 'executive-os', label: '1. Executive Centre & Digital Twin', icon: Cpu },
  { id: 'profiles-360', label: '2. Universal 360° Profiles & Workflow', icon: Users },
  { id: 'automation-closure', label: '3. Automated Task Closure & Operations', icon: Zap },
  { id: 'registers-storage', label: '4. 45 Master Registers & Storage Vault', icon: FolderOpen },
  { id: 'workforce-frontline', label: '5. Workforce, Attendance & Frontline Rapid', icon: ShieldCheck },
  { id: 'all', label: '6. View All Suites', icon: Layers },
];

export default function OperationsCentre() {
  const [activeTab, setActiveTab] = useState('executive-os');
  const show = (id) => activeTab === id || activeTab === 'all';

  return (
    <div className="mx-auto w-full max-w-[1440px] bg-white px-4 py-4 sm:px-6 lg:px-8 space-y-4">
      <PageHeader
        title="Executive Centre & Organisational Digital Twin"
        description="Unified executive command across Organisation Health, NDIS & Aged Care Readiness, Strategic Objectives, Enterprise Risks, Board Actions & AI Executive Briefings."
      />

      {/* Focused Executive Tab Bar */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border-2 border-[#0A2B6D] bg-[#F6F0FF] p-2">
        {EXEC_TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                active
                  ? 'bg-[#0A2B6D] text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#00C6FF]' : 'text-[#5A00D6]'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {show('executive-os') && (
        <div className="space-y-4">
          <OrganisationalOperatingSystemCommand />
          <ExecutiveOperationsCentre defaultSuite="all" />
        </div>
      )}

      {show('profiles-360') && <Universal360ProfileFramework />}

      {show('automation-closure') && (
        <div className="space-y-4">
          <AutomaticTaskCompletionEvidenceClosureEngine />
          <UniversalRecordIntelligenceRoutingSuite />
          <UniversalUserSuccessEvidenceFirstSuite />
        </div>
      )}

      {show('registers-storage') && (
        <div className="space-y-4">
          <UniversalRegisterManagementHubSuite />
          <UniversalDataStorageRetentionExportSuite />
        </div>
      )}

      {show('workforce-frontline') && (
        <div className="space-y-4">
          <FrontlineWorkerMobileRapidSuite />
          <EnterpriseOperationsAttendancePayrollFramework />
        </div>
      )}
    </div>
  );
}