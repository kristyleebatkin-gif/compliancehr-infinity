import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Presentation, Lock, Layers, LayoutDashboard,
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
  const [activeView, setActiveView] = useState('dashboard');
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
      <div
        className="h-1.5 w-full"
        style={{ background: 'linear-gradient(90deg, #0072FF 0%, #A855F7 50%, #FF2E9A 100%)' }}
      />

      <div className="space-y-3 p-3.5 sm:p-4">
        {/* CONSTITUTIONAL HEADER: All Words in One Section (2-3 Lines Max), Entra Role + 25-Slide on Left Above View All Dashboards, Document Types on Bottom Line */}
        <div
          className="rounded-xl border p-3.5 space-y-2.5"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.32)' }}
        >
          {/* Single 2-3 Line Text Block */}
          <div className="space-y-0.5">
            <h2 className="text-sm sm:text-base font-black tracking-tight text-white line-clamp-1">
              CareSphere SME-GARM — Senior Master Enterprise Governance, Assurance &amp; Readiness · Ω∞ {omegaBand.label} ({omegaReadinessIndex}) · Entra ID RBAC
            </h2>
            <p className="text-xs font-bold leading-snug text-white/90 line-clamp-2">
              {CONSTITUTIONAL_PRINCIPLE} · { currentRoleSpec.entraGroup } ({ currentRoleSpec.clearance })
            </p>
          </div>

          {/* Left Side Above View All Dashboards: Entra Role & 25-Slide Board Pack */}
          <div className="flex flex-col items-start gap-2 border-t border-slate-700/70 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <label
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: '#1E293B', borderColor: '#0072FF' }}
              >
                <span className="text-white">Entra Role:</span>
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
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-black text-white transition hover:opacity-95"
                style={{ backgroundColor: '#A855F7' }}
              >
                <Presentation className="h-3.5 w-3.5 text-white" /> 25-Slide Board Pack
              </button>
            </div>

            {/* View All Dashboards & Role Permissions Row Directly Underneath on Left */}
            <div className="flex flex-wrap gap-1.5">
              {currentRoleSpec.permissions.map((perm) => (
                <span
                  key={perm}
                  className="rounded px-2 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: '#1E293B', border: '1px solid rgba(57,230,255,0.3)' }}
                >
                  ✓ {perm}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Line in Section: All Document Types (PPTX, DOCX, PDF, Power BI) */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/70 pt-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-white">
              Board &amp; Audit Export Formats:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleExportPpt}
                className="rounded-lg border px-2.5 py-1 text-[11px] font-black text-white hover:opacity-90"
                style={{ backgroundColor: '#0072FF', borderColor: '#39E6FF' }}
              >
                PPTX
              </button>
              <button
                type="button"
                onClick={handleExportWord}
                className="rounded-lg border px-2.5 py-1 text-[11px] font-black text-white hover:opacity-90"
                style={{ backgroundColor: '#A855F7', borderColor: '#C084FC' }}
              >
                DOCX
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="rounded-lg border px-2.5 py-1 text-[11px] font-black text-white hover:opacity-90"
                style={{ backgroundColor: '#FF2E9A', borderColor: '#F472B6' }}
              >
                PDF
              </button>
              <button
                type="button"
                onClick={handleExportPowerBi}
                className="rounded-lg border px-2.5 py-1 text-[11px] font-black text-white hover:opacity-90"
                style={{ backgroundColor: '#1E293B', borderColor: '#39E6FF' }}
              >
                Power BI (PBIDS)
              </button>
            </div>
          </div>
        </div>

        {/* 9-STEP GOVERNANCE OPERATING CHAIN */}
        <div
          className="rounded-xl border p-3"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-white">
              9-Step Constitutional Governance Chain · Purpose → Ownership → Evidence → Controls → Measurement → Assurance → Benefits → Readiness → Value
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-9">
            {GOVERNANCE_OPERATING_CHAIN.map((node) => (
              <Link
                key={node.key}
                to={node.path}
                className="group flex flex-col justify-between rounded-lg border p-2 transition hover:scale-[1.01]"
                style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.28)' }}
              >
                <div className="text-[10px] font-black text-white">
                  {node.step}. {node.label}
                </div>
                <div className="mt-1 text-[9px] font-bold text-slate-300 line-clamp-1">
                  {node.metric}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 9 MANDATORY EXECUTIVE KPIS SCORECARD */}
        <div
          className="rounded-xl border p-3"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-white">
              Mandatory Executive KPI Framework (9 Constitutional KPIs)
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setActiveView('dashboard')}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black text-white"
                style={{
                  backgroundColor: activeView === 'dashboard' ? '#0072FF' : '#1E293B',
                }}
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard Suite
              </button>
              <button
                type="button"
                onClick={() => setActiveView('modules')}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black text-white"
                style={{
                  backgroundColor: activeView === 'modules' ? '#A855F7' : '#1E293B',
                }}
              >
                <Layers className="h-3.5 w-3.5" /> 9 Core Modules
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-9">
            {liveExecutiveKpis.map((kpi) => (
              <div
                key={kpi.key}
                className="flex flex-col justify-between rounded-xl border p-2"
                style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.3)' }}
              >
                <div className="text-base font-black text-white">
                  {kpi.value}
                  {kpi.unit === '%' ? '%' : ''}
                </div>
                <div className="text-[10px] font-bold leading-tight text-white line-clamp-2">
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>
        </div>

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

        {/* MANDATORY CONSTITUTIONAL CLOSING STATEMENT (Compact 2-3 Lines) */}
        <footer
          className="rounded-xl border p-3"
          style={{ backgroundColor: '#162235', borderColor: '#39E6FF' }}
        >
          <p className="text-xs font-bold leading-snug text-white line-clamp-3">
            {MANDATORY_CLOSING_STATEMENT}
          </p>
        </footer>
      </div>

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