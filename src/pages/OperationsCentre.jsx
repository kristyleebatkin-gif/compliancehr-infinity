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
  { id: 'executive-os', label: 'Executive overview', sub: 'Health, Twin & Roster', icon: Cpu, ring: '#00C6FF' },
  { id: 'profiles-360', label: '360° profiles', sub: 'Staff & Participants', icon: Users, ring: '#0072FF' },
  { id: 'automation-closure', label: 'Actions & workflows', sub: 'Routing & Closure', icon: Zap, ring: '#FF2E9A' },
  { id: 'registers-storage', label: 'Registers & storage', sub: '45 Registers & Vault', icon: FolderOpen, ring: '#A100FF' },
  { id: 'workforce-frontline', label: 'Workforce', sub: 'Frontline & Payroll', icon: ShieldCheck, ring: '#00C6FF' },
  { id: 'all', label: 'All areas', sub: 'Complete Command', icon: Layers, ring: '#FF6EDB' },
];

export default function OperationsCentre() {
  const [activeTab, setActiveTab] = useState('executive-os');
  const show = (id) => activeTab === id || activeTab === 'all';

  return (
    <div className="mx-auto w-full max-w-[1440px] bg-white px-4 py-3 sm:px-6 lg:px-8 space-y-3">
      <header className="app-page-header rounded-2xl border-2 border-[#0A2B6D] px-5 py-3 text-white shadow-md">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">
            ◉ Executive Operations &amp; Mission Control
          </p>
          <h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            Operations Centre — Executive Command Pods
          </h1>
          <p className="mt-0.5 max-w-3xl text-xs font-semibold text-white/95">
            Organisation health, compliance priorities, 360° profiles, automated workflows, registers and operational workspaces.
          </p>
        </div>
      </header>

      <nav
        aria-label="Executive workspaces"
        className="preserve-island-theme grid grid-cols-2 gap-1.5 rounded-2xl border-2 border-[#0A2B6D] p-2 shadow-lg sm:grid-cols-3 lg:grid-cols-6"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(0, 198, 255, 0.20) 0%, rgba(90, 0, 214, 0.34) 40%, rgba(10, 43, 109, 0.96) 80%, #061539 100%)',
        }}
      >
        {EXEC_TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              aria-pressed={active}
              className={`group flex min-h-[48px] items-center gap-2 rounded-full border px-2.5 py-1.5 text-left backdrop-blur-md transition-all duration-200 focus:outline-none ${
                active
                  ? 'border-[#00C6FF] bg-white text-[#0A2B6D] shadow-[0_0_18px_rgba(0,198,255,0.75)] scale-[1.01]'
                  : 'border-white/25 bg-white/10 text-white hover:border-[#00C6FF] hover:bg-white/20'
              }`}
            >
              <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 28 28">
                  <circle cx="14" cy="14" r="12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
                  <circle
                    cx="14"
                    cy="14"
                    r="12"
                    fill="none"
                    stroke={t.ring}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="75"
                    strokeDashoffset="8"
                  />
                </svg>
                <span
                  className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full text-white"
                  style={{ background: 'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)' }}
                >
                  <Icon className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="block text-[9.5px] font-extrabold leading-tight"
                  style={{ color: active ? '#0A2B6D' : '#FFFFFF' }}
                >
                  ◉ {t.label}
                </span>
                <span
                  className="block text-[8px] font-bold leading-tight"
                  style={{ color: active ? '#5A00D6' : '#00C6FF' }}
                >
                  {t.sub}
                </span>
              </span>
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