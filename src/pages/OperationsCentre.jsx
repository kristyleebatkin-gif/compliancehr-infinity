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
import CareSphereSeniorMasterBlueprint from '@/components/enterprise/CareSphereSeniorMasterBlueprint';
import { Cpu, Users, Zap, ShieldCheck, FolderOpen, Layers } from 'lucide-react';

const EXEC_TABS = [
  { id: 'executive-os', label: 'Operations Dispatch & Roster', icon: Cpu },
  { id: 'master-blueprint', label: 'CareSphere Master Blueprint (12×6)', icon: Layers },
  { id: 'workforce-frontline', label: 'Frontline & Attendance', icon: ShieldCheck },
  { id: 'automation-closure', label: 'Workflows & Evidence Closure', icon: Zap },
  { id: 'registers-storage', label: 'Master Registers & Storage', icon: FolderOpen },
  { id: 'profiles-360', label: '360° Person Dossiers', icon: Users },
];

export default function OperationsCentre() {
  const [activeTab, setActiveTab] = useState('executive-os');
  const show = (id) => activeTab === id;

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="border-b border-slate-100 pb-4">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#5A00D6]/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#5A00D6]">
            ServiceNow Horizon Operations Console
          </span>
          <h1 className="mt-1.5 font-editorial text-2xl font-extrabold tracking-tight text-[#0A2B6D] sm:text-3xl">
            Operations Centre — Dispatch, Workflows &amp; Evidence Closure
          </h1>
          <p className="mt-1 max-w-3xl text-sm font-normal text-[#0A2B6D]/75">
            Coordinate daily roster coverage, frontline mobile capture, automated task closure, and master register routing.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Operations workspaces"
          className="mt-3 flex flex-wrap items-center gap-1.5"
        >
          {EXEC_TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold transition ${
                  active
                    ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-[#0A2B6D] hover:border-[#0072FF] hover:bg-white'
                }`}
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={{ color: active ? '#00C6FF' : '#0072FF' }}
                />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {show('executive-os') && (
        <div className="space-y-4">
          <CareSphereSeniorMasterBlueprint />
          <ExecutiveOperationsCentre defaultSuite="roster" />
          <OrganisationHealthScoreFramework />
          <OrganisationalOperatingSystemCommand />
        </div>
      )}

      {show('master-blueprint') && <CareSphereSeniorMasterBlueprint />}

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