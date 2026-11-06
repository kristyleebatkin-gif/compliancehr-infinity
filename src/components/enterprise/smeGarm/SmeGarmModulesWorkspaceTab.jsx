import React, { useState } from 'react';
import {
  ShieldCheck, AlertTriangle, TrendingUp, Activity, Cpu, Database,
  FileSpreadsheet, BrainCircuit, CheckCircle2, Lock, Layers,
} from 'lucide-react';
import {
  ENTERPRISE_RISKS_SEED,
  THREE_LINES_ASSURANCE_SEED,
  BENEFITS_REALISATION_SEED,
  RAID_ANALYTICS_SEED,
  TRACEABILITY_LINEAGE_SEED,
  MICROSOFT_FABRIC_MODEL,
  AI_GOVERNANCE_SEED,
  DELIVERY_ROADMAP_6_PHASES,
  SME_GARM_ROLES,
  computeRiskScore,
  getRiskRatingBand,
  computeBenefitAchievement,
  getOmegaReadinessBand,
} from '@/lib/careSphereSmeGarmData';

const MODULE_TABS = [
  { id: 'm1_governance', label: 'M1: Governance' },
  { id: 'm2_risk_assurance', label: 'M2: Risk & 3-Lines Assurance' },
  { id: 'm3_benefits', label: 'M3: Benefits Realisation' },
  { id: 'm4_org_health', label: 'M4: Organisation Health' },
  { id: 'm5_omega_readiness', label: 'M5: Ω∞ Readiness' },
  { id: 'm6_raid', label: 'M6: RAID Analytics' },
  { id: 'm7_lineage_fabric', label: 'M7: Lineage, LQI & Fabric' },
  { id: 'm8_board_reporting', label: 'M8: Board Reporting' },
  { id: 'm9_ai_governance', label: 'M9: AI Governance & Roadmap' },
];

export default function SmeGarmModulesWorkspaceTab({
  activeModule,
  setActiveModule,
  orgHealthDimensions,
  onUpdateOrgHealthDimension,
  orgHealthIndex,
  omegaDomains,
  onUpdateOmegaDomain,
  omegaReadinessIndex,
  lqiMetrics,
  onUpdateLqiMetric,
  lqiScore,
  onOpenBoardPack,
  onExportPdf,
  onExportWord,
  onExportPpt,
  onExportPowerBi,
}) {
  const [simImpact, setSimImpact] = useState(4);
  const [simLikelihood, setSimLikelihood] = useState(3);
  const [raidFilter, setRaidFilter] = useState('All');

  const simScore = computeRiskScore(simImpact, simLikelihood);
  const simBand = getRiskRatingBand(simScore);
  const omegaBand = getOmegaReadinessBand(omegaReadinessIndex);

  return (
    <div className="space-y-4">
      {/* 9-Module Selector Bar */}
      <div
        className="flex flex-wrap gap-1.5 rounded-xl border p-2"
        style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.25)' }}
      >
        {MODULE_TABS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveModule(m.id)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-black transition-all"
            style={{
              backgroundColor: activeModule === m.id ? '#39E6FF' : '#1E293B',
              color: activeModule === m.id ? '#081018' : '#FFFFFF',
              border: activeModule === m.id ? '1px solid #39E6FF' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* MODULE 1: GOVERNANCE */}
      {activeModule === 'm1_governance' && (
        <div
          className="space-y-4 rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.25)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
                Core Module 1 · Constitutional Governance Authority
              </div>
              <h3 className="text-base font-black text-white">
                Governance Assessments, Maturity, Charter Compliance, Delegations &amp; Board Resolutions
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg px-3 py-1 text-xs font-black" style={{ backgroundColor: '#1E293B', color: '#39E6FF' }}>
                GEI: 91.4 (Target &gt;85)
              </span>
              <span className="rounded-lg px-3 py-1 text-xs font-black" style={{ backgroundColor: '#1E293B', color: '#22C55E' }}>
                Control Effectiveness: 92.8% (Target &gt;90%)
              </span>
              <span className="rounded-lg px-3 py-1 text-xs font-black" style={{ backgroundColor: '#1E293B', color: '#22C55E' }}>
                Compliance: 97.2% (Target &gt;95%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Governance Assessments', metric: '12/12 Completed', status: '91.4 GEI', owner: 'Governance Officer', detail: 'Quarterly board & committee effectiveness reviews' },
              { title: 'Charter Compliance', metric: '100% Compliant', status: 'Verified', owner: 'Company Secretary', detail: 'Board, Audit & Risk, and Digital/AI Charters current' },
              { title: 'Delegations & Decision Rights', metric: '48 Signed Limits', status: 'v4.2 Active', owner: 'CEO & CFO', detail: 'Financial & clinical authority matrix enforced' },
              { title: 'Board Resolutions & Policy Control', metric: '100% Version Locked', status: '92.8% Effective', owner: 'Chief Assurance Officer', detail: 'Every resolution traced to FactDecision' },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl border p-3.5"
                style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.2)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase" style={{ color: '#39E6FF' }}>
                    {card.owner}
                  </span>
                  <span className="rounded px-2 py-0.5 text-[10px] font-black" style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }}>
                    {card.status}
                  </span>
                </div>
                <div className="mt-1.5 text-sm font-black text-white">{card.title}</div>
                <div className="mt-1 text-base font-black" style={{ color: '#39E6FF' }}>{card.metric}</div>
                <p className="mt-1 text-xs text-slate-300">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 2: RISK & THREE LINES ASSURANCE */}
      {activeModule === 'm2_risk_assurance' && (
        <div
          className="space-y-4 rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.25)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
                Core Module 2 · Chief Risk Officer &amp; Three Lines Assurance
              </div>
              <h3 className="text-base font-black text-white">
                Enterprise Risk Register (Impact × Likelihood) &amp; Three Lines Assurance Ledger
              </h3>
            </div>

            {/* Interactive Risk Calculator */}
            <div
              className="flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2"
              style={{ backgroundColor: '#1E293B', borderColor: simBand.color }}
            >
              <span className="text-xs font-black text-white">Live Risk Calculator:</span>
              <label className="flex items-center gap-1 text-xs font-bold text-slate-200">
                Impact (1–5):
                <select
                  value={simImpact}
                  onChange={(e) => setSimImpact(Number(e.target.value))}
                  className="rounded bg-slate-900 px-2 py-0.5 font-black text-white"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-1 text-xs font-bold text-slate-200">
                Likelihood (1–5):
                <select
                  value={simLikelihood}
                  onChange={(e) => setSimLikelihood(Number(e.target.value))}
                  className="rounded bg-slate-900 px-2 py-0.5 font-black text-white"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-black text-slate-950"
                style={{ backgroundColor: simBand.color }}
              >
                Score: {simScore} ({simBand.rating} {simBand.range})
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white">
              <thead>
                <tr className="border-b border-slate-700 text-[10px] font-black uppercase" style={{ color: '#39E6FF' }}>
                  <th className="py-2 pr-3">ID &amp; Risk Title</th>
                  <th className="py-2 pr-3">Owner</th>
                  <th className="py-2 pr-3">I × L = Score</th>
                  <th className="py-2 pr-3">Appetite</th>
                  <th className="py-2 pr-3">Governing Control</th>
                  <th className="py-2 pr-3">Assurance Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ENTERPRISE_RISKS_SEED.map((r) => {
                  const score = computeRiskScore(r.impact, r.likelihood);
                  const band = getRiskRatingBand(score);
                  return (
                    <tr key={r.id}>
                      <td className="py-2.5 pr-3 font-bold">
                        <span style={{ color: '#39E6FF' }}>{r.id}</span> · {r.title}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-300">{r.owner}</td>
                      <td className="py-2.5 pr-3">
                        <span
                          className="rounded px-2 py-0.5 text-[10px] font-black text-slate-950"
                          style={{ backgroundColor: band.color }}
                        >
                          {r.impact} × {r.likelihood} = {score} ({band.rating})
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-300">{r.appetite}</td>
                      <td className="py-2.5 pr-3 text-slate-200">{r.control}</td>
                      <td className="py-2.5 pr-3 font-bold" style={{ color: '#22C55E' }}>{r.assuranceLine}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Three Lines Assurance Table */}
          <div className="pt-2">
            <h4 className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
              Three Lines Assurance Register (Owner · Frequency · Evidence · Rating · Findings · Actions)
            </h4>
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
              {THREE_LINES_ASSURANCE_SEED.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border p-3"
                  style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.2)' }}
                >
                  <div className="flex items-center justify-between text-[10px] font-black">
                    <span style={{ color: '#39E6FF' }}>{a.line}</span>
                    <span style={{ color: '#22C55E' }}>{a.rating}</span>
                  </div>
                  <div className="mt-1 text-xs font-black text-white">{a.activity}</div>
                  <div className="mt-1 text-[11px] text-slate-300">
                    <strong>Owner:</strong> {a.owner} ({a.frequency})
                  </div>
                  <div className="mt-1 text-[11px] text-slate-300">
                    <strong>Evidence:</strong> {a.evidence}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-300">
                    <strong>Findings:</strong> {a.findings}
                  </div>
                  <div className="mt-1 text-[11px]" style={{ color: '#FBBF24' }}>
                    <strong>Action:</strong> {a.actions}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: BENEFITS REALISATION */}
      {activeModule === 'm3_benefits' && (
        <div
          className="space-y-4 rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.25)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#22C55E' }}>
                Core Module 3 · Formula: Benefit Achievement % = (Current − Baseline) ÷ (Target − Baseline)
              </div>
              <h3 className="text-base font-black text-white">
                Benefits Realisation Register, Value Waterfall, ROI (3.4x) &amp; Payback Dashboard
              </h3>
            </div>
            <span className="rounded-lg px-3 py-1 text-xs font-black" style={{ backgroundColor: '#1E293B', color: '#22C55E' }}>
              Total Realised Value: $4.82M · BRI: 88.6%
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {BENEFITS_REALISATION_SEED.map((b) => {
              const achievement = computeBenefitAchievement(b.current, b.baseline, b.target);
              const roiMultiple = (b.benefitValue / b.investmentCost).toFixed(1);
              return (
                <div
                  key={b.id}
                  className="rounded-xl border p-3.5"
                  style={{ backgroundColor: '#1E293B', borderColor: 'rgba(34,197,94,0.3)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase" style={{ color: '#39E6FF' }}>
                      {b.id} · {b.strategicObjective}
                    </span>
                    <span className="rounded px-2 py-0.5 text-[10px] font-black" style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }}>
                      {b.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-black text-white">{b.title}</div>
                  <div className="mt-1 text-xs text-slate-300">
                    <strong>Benefit Owner:</strong> {b.owner} · <strong>KPI:</strong> {b.kpi}
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2 rounded-lg p-2 text-center text-xs" style={{ backgroundColor: '#081018' }}>
                    <div>
                      <div className="text-[9px] text-slate-400">Baseline</div>
                      <div className="font-black text-white">{b.baseline}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400">Current</div>
                      <div className="font-black" style={{ color: '#39E6FF' }}>{b.current}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400">Target</div>
                      <div className="font-black" style={{ color: '#22C55E' }}>{b.target}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400">Achievement</div>
                      <div className="font-black" style={{ color: '#FBBF24' }}>{achievement}%</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-extrabold">
                    <span style={{ color: '#22C55E' }}>Benefit Value: ${(b.benefitValue / 1000000).toFixed(2)}M</span>
                    <span style={{ color: '#39E6FF' }}>ROI: {roiMultiple}x · Payback: {b.paybackMonths} Months</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODULE 4: ORGANISATION HEALTH (8 WEIGHTED DIMENSIONS) */}
      {activeModule === 'm4_org_health' && (
        <div
          className="space-y-4 rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.25)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
                Core Module 4 · Formula: Organisation Health Index = Weighted Average (100% Weight)
              </div>
              <h3 className="text-base font-black text-white">
                Interactive 8-Dimension Organisation Health Model (Target &gt;85)
              </h3>
            </div>
            <div className="rounded-xl border px-4 py-2 text-right" style={{ backgroundColor: '#1E293B', borderColor: '#22C55E' }}>
              <div className="text-[10px] font-black uppercase" style={{ color: '#22C55E' }}>
                Organisation Health Index
              </div>
              <div className="text-xl font-black text-white">{orgHealthIndex} / 100</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {orgHealthDimensions.map((dim) => (
              <div
                key={dim.key}
                className="rounded-xl border p-3"
                style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.2)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{dim.label}</span>
                  <span className="rounded px-2 py-0.5 text-[10px] font-black" style={{ backgroundColor: '#081018', color: '#39E6FF' }}>
                    Weight: {Math.round(dim.weight * 100)}%
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-slate-300">Owner: {dim.owner}</div>
                <div className="mt-2 flex items-center justify-between">
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={dim.score}
                    onChange={(e) => onUpdateOrgHealthDimension(dim.key, Number(e.target.value))}
                    className="w-3/4 accent-[#39E6FF]"
                  />
                  <span className="text-sm font-black" style={{ color: dim.score >= 85 ? '#22C55E' : '#FBBF24' }}>
                    {dim.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 5: Ω∞ READINESS (9 DOMAINS) */}
      {activeModule === 'm5_omega_readiness' && (
        <div
          className="space-y-4 rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.25)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
                Core Module 5 · Formula: Ω∞ Readiness = Average Readiness Domain Scores
              </div>
              <h3 className="text-base font-black text-white">
                9-Domain Ω∞ Readiness Engine (90–100 Ω∞ Ready · 75–89 Ready · 60–74 Watch · 40–59 At Risk · &lt;40 Critical)
              </h3>
            </div>
            <div
              className="rounded-xl border px-4 py-2 text-right"
              style={{ backgroundColor: '#1E293B', borderColor: omegaBand.color }}
            >
              <div className="text-[10px] font-black uppercase" style={{ color: omegaBand.color }}>
                {omegaBand.label}
              </div>
              <div className="text-xl font-black text-white">{omegaReadinessIndex} / 100</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {omegaDomains.map((dom) => {
              const b = getOmegaReadinessBand(dom.score);
              return (
                <div
                  key={dom.key}
                  className="rounded-xl border p-3"
                  style={{ backgroundColor: '#1E293B', borderColor: b.color }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{dom.label}</span>
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-black"
                      style={{ backgroundColor: b.badgeBg, color: b.color }}
                    >
                      {b.label}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-300">
                    Owner: {dom.owner} · Control: {dom.control}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={dom.score}
                      onChange={(e) => onUpdateOmegaDomain(dom.key, Number(e.target.value))}
                      className="w-3/4 accent-[#39E6FF]"
                    />
                    <span className="text-sm font-black" style={{ color: b.color }}>
                      {dom.score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODULE 6: RAID ANALYTICS */}
      {activeModule === 'm6_raid' && (
        <div
          className="space-y-4 rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.25)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
                Core Module 6 · Risks · Assumptions · Issues · Dependencies
              </div>
              <h3 className="text-base font-black text-white">
                Enterprise RAID Analytics, Escalations &amp; Committee Lineage
              </h3>
            </div>
            <div className="flex gap-1.5">
              {['All', 'Risk', 'Assumption', 'Issue', 'Dependency'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setRaidFilter(t)}
                  className="rounded-lg px-2.5 py-1 text-xs font-black"
                  style={{
                    backgroundColor: raidFilter === t ? '#39E6FF' : '#1E293B',
                    color: raidFilter === t ? '#081018' : '#FFFFFF',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {RAID_ANALYTICS_SEED.filter((item) => raidFilter === 'All' || item.type === raidFilter).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border p-3.5"
                style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.2)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase" style={{ color: '#39E6FF' }}>
                    {item.id} · {item.type}
                  </span>
                  <span className="rounded px-2 py-0.5 text-[10px] font-black" style={{ backgroundColor: '#081018', color: '#FBBF24' }}>
                    {item.severity} · {item.status}
                  </span>
                </div>
                <div className="mt-1 text-sm font-black text-white">{item.title}</div>
                <div className="mt-1 text-xs text-slate-300">
                  <strong>Owner:</strong> {item.owner} · <strong>Due:</strong> {item.dueDate}
                </div>
                <div className="mt-1 text-xs" style={{ color: '#22C55E' }}>
                  <strong>Escalation:</strong> {item.escalation} ({item.lineageRef})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 7: TRACEABILITY, LINEAGE QUALITY INDEX (LQI) & MICROSOFT FABRIC */}
      {activeModule === 'm7_lineage_fabric' && (
        <div
          className="space-y-4 rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.25)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
                Core Module 7 · LQI = 20% Completeness + 20% Accuracy + 15% Currency + 15% Traceability + 10% Ownership + 10% Evidence + 10% Assurance
              </div>
              <h3 className="text-base font-black text-white">
                Enterprise Traceability, Lineage Quality Index &amp; Microsoft Fabric OneLake Architecture
              </h3>
            </div>
            <div className="rounded-xl border px-4 py-2 text-right" style={{ backgroundColor: '#1E293B', borderColor: '#39E6FF' }}>
              <div className="text-[10px] font-black uppercase" style={{ color: '#39E6FF' }}>
                Lineage Quality Index (LQI)
              </div>
              <div className="text-xl font-black text-white">{lqiScore}% (Target &gt;90%)</div>
            </div>
          </div>

          {/* Interactive LQI 7-Factor Calculator */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {[
              { key: 'completeness', label: 'Completeness (20%)' },
              { key: 'accuracy', label: 'Accuracy (20%)' },
              { key: 'currency', label: 'Currency (15%)' },
              { key: 'traceability', label: 'Traceability (15%)' },
              { key: 'ownership', label: 'Ownership (10%)' },
              { key: 'evidence', label: 'Evidence (10%)' },
              { key: 'assurance', label: 'Assurance (10%)' },
            ].map((f) => (
              <div key={f.key} className="rounded-lg border p-2.5" style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.2)' }}>
                <div className="text-[10px] font-black text-slate-200">{f.label}</div>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={lqiMetrics[f.key]}
                  onChange={(e) => onUpdateLqiMetric(f.key, Number(e.target.value))}
                  className="mt-1 w-full rounded bg-slate-900 px-2 py-1 text-xs font-black text-white"
                />
              </div>
            ))}
          </div>

          {/* 9-Stage Microsoft Fabric Pipeline */}
          <div>
            <h4 className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
              Microsoft Fabric End-to-End Architecture Pipeline
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-9">
              {MICROSOFT_FABRIC_MODEL.pipeline.map((p) => (
                <div
                  key={p.stage}
                  className="rounded-lg border p-2.5"
                  style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.25)' }}
                >
                  <div className="text-[9px] font-black uppercase" style={{ color: '#39E6FF' }}>
                    Stage {p.stage}
                  </div>
                  <div className="mt-0.5 text-xs font-black text-white">{p.name}</div>
                  <div className="mt-1 text-[10px] text-slate-300">{p.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 9 Fact Tables + 10 Dimensions */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="space-y-1.5 lg:col-span-8">
              <div className="text-xs font-black uppercase" style={{ color: '#39E6FF' }}>
                9 Microsoft Fabric Warehouse Fact Tables
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {MICROSOFT_FABRIC_MODEL.factTables.map((ft) => (
                  <div key={ft.name} className="rounded-lg border p-2.5" style={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="text-xs font-black" style={{ color: '#39E6FF' }}>{ft.name}</div>
                    <div className="text-[10px] text-slate-300">{ft.grain}</div>
                    <div className="mt-1 text-[10px] font-bold" style={{ color: '#22C55E' }}>
                      {ft.rows} rows · {ft.owner}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 lg:col-span-4">
              <div className="text-xs font-black uppercase" style={{ color: '#22C55E' }}>
                10 Conformed Star-Schema Dimensions
              </div>
              <div className="flex flex-wrap gap-1.5 rounded-xl border p-3" style={{ backgroundColor: '#1E293B', borderColor: 'rgba(34,197,94,0.25)' }}>
                {MICROSOFT_FABRIC_MODEL.dimensions.map((dim) => (
                  <span
                    key={dim}
                    className="rounded-md px-2.5 py-1 text-xs font-black"
                    style={{ backgroundColor: '#081018', color: '#22C55E', border: '1px solid rgba(34,197,94,0.35)' }}
                  >
                    {dim}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Traceability Matrix */}
          <div>
            <h4 className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
              Enterprise Traceability Matrix (KPI · Decision · Benefits · AI · Data Lineage)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white">
                <thead>
                  <tr className="border-b border-slate-700 text-[10px] font-black uppercase" style={{ color: '#39E6FF' }}>
                    <th className="py-2 pr-3">Lineage Domain</th>
                    <th className="py-2 pr-3">Operational Source</th>
                    <th className="py-2 pr-3">Fabric Fact &amp; Dimensions</th>
                    <th className="py-2 pr-3">Executive KPI</th>
                    <th className="py-2 pr-3">Board Decision</th>
                    <th className="py-2 pr-3">LQI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {TRACEABILITY_LINEAGE_SEED.map((lin) => (
                    <tr key={lin.id}>
                      <td className="py-2 pr-3 font-black" style={{ color: '#39E6FF' }}>{lin.domain}</td>
                      <td className="py-2 pr-3 text-slate-200">{lin.source}</td>
                      <td className="py-2 pr-3 text-slate-300">{lin.fabricFact} ({lin.fabricDim})</td>
                      <td className="py-2 pr-3 font-bold text-white">{lin.executiveKpi}</td>
                      <td className="py-2 pr-3" style={{ color: '#22C55E' }}>{lin.boardDecision}</td>
                      <td className="py-2 pr-3 font-black" style={{ color: '#FBBF24' }}>{lin.lqiScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 8: BOARD REPORTING */}
      {activeModule === 'm8_board_reporting' && (
        <div
          className="space-y-4 rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.25)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
                Core Module 8 · 25-Slide Constitutional Board Pack &amp; Speaker Note Standard
              </div>
              <h3 className="text-base font-black text-white">
                Board Pack, Audit &amp; Risk Pack, Governance Committee Pack &amp; Multi-Format Exports
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onOpenBoardPack}
                className="rounded-lg px-3 py-1.5 text-xs font-black"
                style={{ backgroundColor: '#39E6FF', color: '#081018' }}
              >
                Launch Interactive 25-Slide Board Pack Studio
              </button>
              <button
                type="button"
                onClick={onExportPpt}
                className="rounded-lg border px-3 py-1.5 text-xs font-black text-white"
                style={{ backgroundColor: '#1E293B', borderColor: '#39E6FF' }}
              >
                Export PowerPoint (.ppt)
              </button>
              <button
                type="button"
                onClick={onExportWord}
                className="rounded-lg border px-3 py-1.5 text-xs font-black text-white"
                style={{ backgroundColor: '#1E293B', borderColor: '#22C55E' }}
              >
                Export Word (.doc)
              </button>
              <button
                type="button"
                onClick={onExportPdf}
                className="rounded-lg border px-3 py-1.5 text-xs font-black text-white"
                style={{ backgroundColor: '#1E293B', borderColor: '#FBBF24' }}
              >
                Export PDF
              </button>
              <button
                type="button"
                onClick={onExportPowerBi}
                className="rounded-lg border px-3 py-1.5 text-xs font-black text-white"
                style={{ backgroundColor: '#1E293B', borderColor: '#39E6FF' }}
              >
                Export Power BI (.pbids)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {[
              { pack: 'Board Pack', slides: 'All 25 Constitutional Slides', audience: 'Full Board of Directors', status: 'Certified Ready' },
              { pack: 'Audit & Risk Pack', slides: 'Slides 9–12, 15, 19, 23', audience: 'Audit & Risk Committee', status: 'Line-3 Verified' },
              { pack: 'Governance & Performance Pack', slides: 'Slides 3–8, 13, 16–18, 24', audience: 'Governance Committee', status: 'Charter Aligned' },
              { pack: 'Executive Dashboard Pack', slides: 'Slides 5, 14, 20–22, 25', audience: 'CEO & Executive Team', status: 'DirectLake Synced' },
            ].map((p) => (
              <div key={p.pack} className="rounded-xl border p-3.5" style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.2)' }}>
                <div className="text-[10px] font-black uppercase" style={{ color: '#39E6FF' }}>{p.audience}</div>
                <div className="mt-1 text-sm font-black text-white">{p.pack}</div>
                <div className="mt-1 text-xs text-slate-300">{p.slides}</div>
                <div className="mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-black" style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }}>
                  {p.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 9: AI GOVERNANCE + 6-PHASE ROADMAP + ENTRA ID RBAC */}
      {activeModule === 'm9_ai_governance' && (
        <div
          className="space-y-4 rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.25)' }}
        >
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
              Core Module 9 · AI Registry · AI Risk Register · Explainability · AI Assurance · AI Lineage
            </div>
            <h3 className="text-base font-black text-white">
              Enterprise AI Governance Registry, 6-Phase Delivery Roadmap &amp; Microsoft Entra ID RBAC
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {AI_GOVERNANCE_SEED.map((ai) => (
              <div key={ai.id} className="rounded-xl border p-3.5" style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.22)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase" style={{ color: '#39E6FF' }}>
                    {ai.id} · {ai.riskTier}
                  </span>
                  <span className="rounded px-2 py-0.5 text-[10px] font-black" style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }}>
                    AI Readiness: {ai.readinessScore}%
                  </span>
                </div>
                <div className="mt-1 text-sm font-black text-white">{ai.modelName}</div>
                <p className="mt-1 text-xs text-slate-300">{ai.purpose}</p>
                <div className="mt-1.5 text-[11px] text-slate-200">
                  <strong>Explainability:</strong> {ai.explainability}
                </div>
                <div className="mt-1 text-[11px]" style={{ color: '#39E6FF' }}>
                  <strong>Lineage:</strong> {ai.lineage} · <strong>Assurance:</strong> {ai.assuranceStatus}
                </div>
              </div>
            ))}
          </div>

          {/* 6-Phase Delivery Roadmap */}
          <div>
            <h4 className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
              6-Phase Enterprise Delivery Roadmap
            </h4>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
              {DELIVERY_ROADMAP_6_PHASES.map((ph) => (
                <div key={ph.phase} className="rounded-xl border p-3" style={{ backgroundColor: '#1E293B', borderColor: 'rgba(34,197,94,0.3)' }}>
                  <div className="text-[10px] font-black uppercase" style={{ color: '#39E6FF' }}>{ph.phase}</div>
                  <div className="mt-0.5 text-xs font-black text-white">{ph.title}</div>
                  <div className="mt-1 text-[10px] font-bold" style={{ color: '#22C55E' }}>{ph.status}</div>
                  <div className="mt-1 text-[10px] text-slate-300">{ph.deliverables}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Microsoft Entra ID RBAC Matrix */}
          <div>
            <h4 className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
              Microsoft Entra ID Role-Based Access Control (RBAC) Security Model
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {SME_GARM_ROLES.map((r) => (
                <div key={r.id} className="rounded-lg border p-2.5" style={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{r.label}</span>
                    <span className="text-[9px] font-black" style={{ color: '#39E6FF' }}>{r.clearance}</span>
                  </div>
                  <div className="mt-0.5 text-[9px] font-mono text-slate-400">{r.entraGroup}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {r.permissions.map((perm) => (
                      <span key={perm} className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-slate-200">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}