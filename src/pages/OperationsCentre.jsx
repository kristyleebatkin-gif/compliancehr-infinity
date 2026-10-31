import React, { useState } from 'react';

import ExecutiveOperationsCentre from '@/components/operations/ExecutiveOperationsCentre';
import UniversalDataStorageRetentionExportSuite from '@/components/compliance/UniversalDataStorageRetentionExportSuite';
import EnterpriseOperationsAttendancePayrollFramework from '@/components/operations/EnterpriseOperationsAttendancePayrollFramework';
import FrontlineWorkerMobileRapidSuite from '@/components/operations/FrontlineWorkerMobileRapidSuite';
import UniversalRecordIntelligenceRoutingSuite from '@/components/operations/UniversalRecordIntelligenceRoutingSuite';
import UniversalUserSuccessEvidenceFirstSuite from '@/components/operations/UniversalUserSuccessEvidenceFirstSuite';
import AutomaticTaskCompletionEvidenceClosureEngine from '@/components/operations/AutomaticTaskCompletionEvidenceClosureEngine';
import UniversalRegisterManagementHubSuite from '@/components/operations/UniversalRegisterManagementHubSuite';
import OrganisationalOperatingSystemCommand from '@/components/enterprise/OrganisationalOperatingSystemCommand';
import OrganisationHealthScoreFramework from '@/components/enterprise/OrganisationHealthScoreFramework';
import Universal360ProfileFramework from '@/components/enterprise/Universal360ProfileFramework';
import LivingOrganisationalEcosystemSuite from '@/components/enterprise/LivingOrganisationalEcosystemSuite';
import { Cpu, Users, Zap, ShieldCheck, FolderOpen, Layers } from 'lucide-react';

const EXEC_TABS = [
  { id: 'executive-os', label: 'Executive overview', icon: Cpu },
  { id: 'profiles-360', label: '360° profiles', icon: Users },
  { id: 'automation-closure', label: 'Actions & workflows', icon: Zap },
  { id: 'registers-storage', label: 'Registers & storage', icon: FolderOpen },
  { id: 'workforce-frontline', label: 'Workforce', icon: ShieldCheck },
  { id: 'all', label: 'All areas', icon: Layers },
];

export default function OperationsCentre() {
  const [activeTab, setActiveTab] = useState('executive-os');
  const show = (id) => activeTab === id || activeTab === 'all';

  return (
    <div className="mx-auto w-full max-w-[1440px] bg-white px-4 py-4 sm:px-6 lg:px-8 space-y-4">
      <header className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5A00D6]">ComplianceHR Infinity</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0A2B6D] sm:text-3xl">Executive Command</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">Organisation health, compliance priorities and operational workspaces.</p>
      </header>

      <nav aria-label="Executive workspaces" className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:grid-cols-3 lg:grid-cols-6">
        {EXEC_TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              aria-pressed={active}
              className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-center text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-[#0072FF] focus:ring-offset-2 ${
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
      </nav>

      {show('executive-os') && (
        <div className="space-y-4">
          <OrganisationHealthScoreFramework />
          <OrganisationalOperatingSystemCommand />
          <details className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-[#0A2B6D]">Organisation ecosystem tools</summary>
            <div className="mt-4"><LivingOrganisationalEcosystemSuite initialTab="security-whitelabel-exec" /></div>
          </details>
          <ExecutiveOperationsCentre defaultSuite="roster" />
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