import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Sparkles, Presentation, FileText, Download, Database,
  Lock, ArrowRight, CheckCircle2, Layers, LayoutDashboard,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  CONSTITUTIONAL_PRINCIPLE,
  MANDATORY_CLOSING_STATEMENT,
  GOVERNANCE_OPERATING_CHAIN,
  SME_GARM_ROLES,
  DEFAULT_ORG_HEALTH_DIMENSIONS,
  computeOrganisationHealthIndex,
  DEFAULT_OMEGA_READINESS_DOMAINS,
  computeOmegaReadinessIndex,
  getOmegaReadinessBand,
  DEFAULT_LQI_METRICS,
  computeLineageQualityIndex,
  MANDATORY_EXECUTIVE_KPIS,
} from '@/lib/careSphereSmeGarmData';
import {
  exportBoardPackPdf,
  exportBoardPackWord,
  exportBoardPackPowerPoint,
  exportPowerBiSemanticModel,
} from '@/lib/careSphereBoardPackExporter';
import SmeGarmBoardDashboardTab from '@/components/enterprise/smeGarm/SmeGarmBoardDashboardTab';
import SmeGarmModulesWorkspaceTab from '@/components/enterprise/smeGarm/SmeGarmModulesWorkspaceTab';
import SmeGarmBoardPackStudioModal from '@/components/enterprise/smeGarm/SmeGarmBoardPackStudioModal';

export default function CareSphereSmeGarmSuite() {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'modules'
  const [activeModule, setActiveModule] = useState('m1_governance');
  const [activeRole, setActiveRole] = useState('Board Member');
  const [boardPackOpen, setBoardPackOpen] = useState(false);

  const [orgHealthDimensions, setOrgHealthDimensions] = useState(DEFAULT_ORG_HEALTH_DIMENSIONS);
  const [omegaDomains, setOmegaDomains] = useState(DEFAULT_OMEGA_READINESS_DOMAINS);
  const [lqiMetrics, setLqiMetrics] = useState(DEFAULT_LQI_METRICS);

  const orgHealthIndex = useMemo(
    () => computeOrganisationHealthIndex(orgHealthDimensions),
    [orgHealthDimensions]
  );
  const omegaReadinessIndex = useMemo(
    () => computeOmegaReadinessIndex(omegaDomains),
    [omegaDomains]
  );
  const lqiScore = useMemo(
    () => computeLineageQualityIndex(lqiMetrics),
    [lqiMetrics]
  );

  const omegaBand = getOmegaReadinessBand(omegaReadinessIndex);
  const currentRoleSpec = SME_GARM_ROLES.find((r) => r.id === activeRole) || SME_GARM_ROLES[0];

  const handleUpdateOrgHealthDimension = (key, score) => {
    setOrgHealthDimensions((prev) =>
      prev.map((d) => (d.key === key ? { ...d, score } : d))
    );
  };

  const handleUpdateOmegaDomain = (key, score) => {
    setOmegaDomains((prev) =>
      prev.map((d) => (d.key === key ? { ...d, score } : d))
    );
  };

  const handleUpdateLqiMetric = (key, val) => {
    setLqiMetrics((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, Number(val || 0))),
    }));
  };

  const handleExportPdf = () => {
    exportBoardPackPdf({ orgHealthIndex, omegaReadinessIndex, lqiScore });
    toast({ title: '25-Slide Board Pack PDF exported' });
  };

  const handleExportWord = () => {
    exportBoardPackWord({ orgHealthIndex, omegaReadinessIndex, lqiScore });
    toast({ title: 'Board Pack Word (.doc) exported' });
  };

  const handleExportPpt = () => {
    exportBoardPackPowerPoint({ orgHealthIndex, omegaReadinessIndex, lqiScore });
    toast({ title: '25-Slide PowerPoint Deck (.ppt) exported' });
  };

  const handleExportPowerBi = () => {
    exportPowerBiSemanticModel({ orgHealthIndex, omegaReadinessIndex, lqiScore });
    toast({ title: 'Microsoft Fabric & Power BI Semantic Model (.pbids) exported' });
  };

  const openSpecificModule = (moduleShorthand) => {
    const map = {
      governance: 'm1_governance',
      risk: 'm2_risk_assurance',
      benefits: 'm3_benefits',
      health: 'm4_org_health',
      readiness: 'm5_omega_readiness',
      raid: 'm6_raid',
      lineage: 'm7_lineage_fabric',
      board: 'm8_board_reporting',
      ai: 'm9_ai_governance',
    };
    setActiveModule(map[moduleShorthand] || 'm1_governance');
    setActiveView('modules');
  };

  // Merge live calculated OHI, Omega Readiness, and LQI into the 9 Mandatory Executive KPIs
  const liveExecutiveKpis = useMemo(
    () =>
      MANDATORY_EXECUTIVE_KPIS.map((k) => {
        if (k.key === 'ohi') return { ...k, value: orgHealthIndex };
        if (k.key === 'omega_readiness') return { ...k, value: omegaReadinessIndex, unit: omegaBand.label };
        if (k.key === 'lqi') return { ...k, value: lqiScore };
        return k;
      }),
    [orgHealthIndex, omegaReadinessIndex, omegaBand.label, lqiScore]
  );

  return (
    <section
      aria-label="CareSphere Senior Master Enterprise Governance, Assurance & Readiness Management System (SME-GARM)"
      className="preserve-island-theme overflow-hidden rounded-2xl border shadow-2xl"
      style={{ backgroundColor: '#081018', borderColor: '#39E6FF', color: '#FFFFFF' }}
    >
      {/* Top Cyan Constitutional Accent Bar */}
      <div
        className="h-1.5 w-full"
        style={{ background: 'linear-gradient(90deg, #39E6FF 0%, #22C55E 50%, #FBBF24 100%)' }}
      />

      <div className="space-y-4 p-4 sm:p-5">
        {/* CONSTITUTIONAL HEADER & ENTRA ID RBAC BAR */}
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.32)' }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                  style={{ backgroundColor: 'rgba(57,230,255,0.16)', color: '#39E6FF', border: '1px solid #39E6FF' }}
                >
                  <ShieldCheck className="h-3 w-3" /> CareSphere SME-GARM Constitutional Engine
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase"
                  style={{ backgroundColor: omegaBand.badgeBg, color: omegaBand.color, border: `1px solid ${omegaBand.color}` }}
                >
                  Ω∞ Status: {omegaBand.label} ({omegaReadinessIndex})
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase"
                  style={{ backgroundColor: 'rgba(34,197,94,0.16)', color: '#22C55E', border: '1px solid #22C55E' }}
                >
                  <Lock className="h-3 w-3" /> Microsoft Entra ID RBAC
                </span>
              </div>

              <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
                CareSphere — Senior Master Enterprise Governance, Assurance &amp; Readiness Management System
              </h2>

              <p className="text-xs font-extrabold" style={{ color: '#39E6FF' }}>
                {CONSTITUTIONAL_PRINCIPLE}
              </p>
            </div>

            {/* Entra ID Role Selector & Export Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.35)' }}>
                <span style={{ color: '#39E6FF' }}>Entra Role:</span>
                <select
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value)}
                  className="bg-transparent font-black text-white focus:outline-none"
                >
                  {SME_GARM_ROLES.map((r) => (
                    <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => setBoardPackOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition hover:opacity-95"
                style={{ backgroundColor: '#39E6FF', color: '#081018' }}
              >
                <Presentation className="h-3.5 w-3.5" /> 25-Slide Board Pack
              </button>
              <button
                type="button"
                onClick={handleExportPpt}
                className="rounded-lg border px-2.5 py-1.5 text-[11px] font-black text-white hover:opacity-90"
                style={{ backgroundColor: '#1E293B', borderColor: '#39E6FF' }}
              >
                PPTX
              </button>
              <button
                type="button"
                onClick={handleExportWord}
                className="rounded-lg border px-2.5 py-1.5 text-[11px] font-black text-white hover:opacity-90"
                style={{ backgroundColor: '#1E293B', borderColor: '#22C55E' }}
              >
                DOCX
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="rounded-lg border px-2.5 py-1.5 text-[11px] font-black text-white hover:opacity-90"
                style={{ backgroundColor: '#1E293B', borderColor: '#FBBF24' }}
              >
                PDF
              </button>
              <button
                type="button"
                onClick={handleExportPowerBi}
                className="rounded-lg border px-2.5 py-1.5 text-[11px] font-black text-white hover:opacity-90"
                style={{ backgroundColor: '#1E293B', borderColor: '#39E6FF' }}
              >
                Power BI
              </button>
            </div>
          </div>

          {/* Active Role Clearance & Permissions Strip */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/70 pt-2.5 text-[11px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold" style={{ color: '#39E6FF' }}>
                {currentRoleSpec.entraGroup}
              </span>
              <span className="text-slate-300">· {currentRoleSpec.clearance}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentRoleSpec.permissions.map((perm) => (
                <span
                  key={perm}
                  className="rounded px-2 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: '#1E293B', color: '#22C55E' }}
                >
                  ✓ {perm}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 9-STEP GOVERNANCE OPERATING CHAIN (NO PROCESS MAY BYPASS THIS CHAIN) */}
        <div
          className="rounded-xl border p-3.5"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
              Mandatory 9-Step Constitutional Governance Operating Chain · Zero-Bypass Enforcement
            </span>
            <span className="text-[10px] font-bold" style={{ color: '#22C55E' }}>
              Purpose → Ownership → Evidence → Controls → Measurement → Assurance → Benefits → Readiness → Enterprise Value
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-9">
            {GOVERNANCE_OPERATING_CHAIN.map((node) => (
              <Link
                key={node.key}
                to={node.path}
                className="group flex flex-col justify-between rounded-lg border p-2.5 transition hover:scale-[1.01]"
                style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.28)' }}
              >
                <div>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase" style={{ color: '#39E6FF' }}>
                    <span>Step {node.step}</span>
                    <span>{node.verb}</span>
                  </div>
                  <div className="mt-0.5 text-xs font-black text-white">{node.label}</div>
                  <div className="mt-0.5 text-[10px] text-slate-300">{node.question}</div>
                </div>
                <div className="mt-2 border-t border-slate-700/70 pt-1 text-[9.5px] font-extrabold" style={{ color: '#22C55E' }}>
                  {node.metric}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 9 MANDATORY EXECUTIVE KPIS SCORECARD */}
        <div
          className="rounded-xl border p-3.5"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
        >
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
              Mandatory Executive KPI Framework (All 9 Constitutional KPIs vs Targets)
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setActiveView('dashboard')}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-black"
                style={{
                  backgroundColor: activeView === 'dashboard' ? '#39E6FF' : '#1E293B',
                  color: activeView === 'dashboard' ? '#081018' : '#FFFFFF',
                }}
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard Suite (4 Views)
              </button>
              <button
                type="button"
                onClick={() => setActiveView('modules')}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-black"
                style={{
                  backgroundColor: activeView === 'modules' ? '#39E6FF' : '#1E293B',
                  color: activeView === 'modules' ? '#081018' : '#FFFFFF',
                }}
              >
                <Layers className="h-3.5 w-3.5" /> 9 Core Modules &amp; Fabric Engine
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-9">
            {liveExecutiveKpis.map((kpi) => {
              const passes = Number(kpi.value) >= Number(kpi.target);
              return (
                <div
                  key={kpi.key}
                  className="flex flex-col justify-between rounded-xl border p-2.5"
                  style={{
                    backgroundColor: '#1E293B',
                    borderColor: passes ? 'rgba(34,197,94,0.4)' : 'rgba(251,191,36,0.5)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-black uppercase" style={{ color: '#39E6FF' }}>
                        Target {kpi.targetDisplay}
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5 text-[8.5px] font-black"
                        style={{
                          backgroundColor: passes ? 'rgba(34,197,94,0.2)' : 'rgba(251,191,36,0.2)',
                          color: passes ? '#22C55E' : '#FBBF24',
                        }}
                      >
                        {kpi.trend}
                      </span>
                    </div>
                    <div className="mt-1 text-lg font-black text-white">
                      {kpi.value}
                      {kpi.unit === '%' ? '%' : ''}
                    </div>
                    <div className="text-[10.5px] font-extrabold leading-snug text-white">
                      {kpi.label}
                    </div>
                  </div>
                  <div className="mt-1.5 border-t border-slate-700/70 pt-1 text-[9px] text-slate-300">
                    {kpi.owner}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIVE WORKSPACE: DASHBOARD SUITE OR 9 CORE APPLICATION MODULES */}
        {activeView === 'dashboard' ? (
          <SmeGarmBoardDashboardTab
            orgHealthIndex={orgHealthIndex}
            omegaReadinessIndex={omegaReadinessIndex}
            lqiScore={lqiScore}
            onOpenBoardPack={() => setBoardPackOpen(true)}
            onSelectModule={openSpecificModule}
          />
        ) : (
          <SmeGarmModulesWorkspaceTab
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            orgHealthDimensions={orgHealthDimensions}
            onUpdateOrgHealthDimension={handleUpdateOrgHealthDimension}
            orgHealthIndex={orgHealthIndex}
            omegaDomains={omegaDomains}
            onUpdateOmegaDomain={handleUpdateOmegaDomain}
            omegaReadinessIndex={omegaReadinessIndex}
            lqiMetrics={lqiMetrics}
            onUpdateLqiMetric={handleUpdateLqiMetric}
            lqiScore={lqiScore}
            onOpenBoardPack={() => setBoardPackOpen(true)}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            onExportPpt={handleExportPpt}
            onExportPowerBi={handleExportPowerBi}
          />
        )}

        {/* MANDATORY CONSTITUTIONAL CLOSING STATEMENT */}
        <footer
          className="rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: '#39E6FF' }}
        >
          <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
            Mandatory Constitutional Closing Statement · CareSphere SME-GARM Standard
          </div>
          <p className="mt-1 text-xs font-extrabold leading-relaxed text-white">
            {MANDATORY_CLOSING_STATEMENT}
          </p>
        </footer>
      </div>

      {/* 25-Slide Board Pack Studio Modal */}
      <SmeGarmBoardPackStudioModal
        open={boardPackOpen}
        onClose={() => setBoardPackOpen(false)}
        activeRole={activeRole}
        orgHealthIndex={orgHealthIndex}
        omegaReadinessIndex={omegaReadinessIndex}
        lqiScore={lqiScore}
        onExportPdf={handleExportPdf}
        onExportWord={handleExportWord}
        onExportPpt={handleExportPpt}
        onExportPowerBi={handleExportPowerBi}
      />
    </section>
  );
}