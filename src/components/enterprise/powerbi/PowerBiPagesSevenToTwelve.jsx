import React, { useState } from 'react';
import {
  CheckCircle2, AlertTriangle, TrendingUp, Vote, Database, ArrowRight,
} from 'lucide-react';
import {
  PAGE7_CAPA_DATA,
  PAGE8_BENEFITS_WATERFALL,
  PAGE9_RAID_DATA,
  PAGE10_EXECUTIVE_ACTIONS,
  PAGE11_BOARD_DECISIONS,
  PAGE12_FABRIC_AI_DATA,
} from '@/lib/careSpherePowerBiData';
import { PowerBiRadialGauge } from '@/components/enterprise/powerbi/PowerBiPagesOneToSix';

export default function PowerBiPagesSevenToTwelve({ activePage }) {
  const [selectedAction, setSelectedAction] = useState(PAGE10_EXECUTIVE_ACTIONS.actions[0]);
  const [decisions, setDecisions] = useState(PAGE11_BOARD_DECISIONS);

  const handleUpdateDecisionStatus = (id, status) => {
    setDecisions((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  };

  // PAGE 7: CORRECTIVE ACTIONS
  if (activePage === 'p7_capa') {
    return (
      <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PAGE7_CAPA_DATA.kpis.map((k) => (
            <div key={k.label} className="rounded-xl border p-3.5" style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.22)' }}>
              <div className="text-[12px] text-slate-300">{k.label}</div>
              <div className="mt-1 text-[32px] font-bold leading-none" style={{ color: k.color }}>{k.value}</div>
              <div className="mt-1 text-[11px] text-slate-400">{k.sub}</div>
            </div>
          ))}
        </div>

        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
        >
          <div className="mb-3 text-[16px] font-semibold text-white">
            Corrective Actions Heatmap: Severity × Days Open (Age Buckets: 0-30 · 31-60 · 61-90 · 90+)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] text-white">
              <thead>
                <tr className="border-b border-slate-700 text-[11px] font-bold uppercase" style={{ color: '#39E6FF' }}>
                  <th className="py-2 pr-3">Severity</th>
                  {PAGE7_CAPA_DATA.ageBuckets.map((b) => (
                    <th key={b} className="py-2 px-3 text-center">{b} Days</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {PAGE7_CAPA_DATA.heatmapRows.map((row) => (
                  <tr key={row.severity}>
                    <td className="py-2.5 pr-3 font-bold" style={{ color: row.color }}>{row.severity}</td>
                    {PAGE7_CAPA_DATA.ageBuckets.map((b) => {
                      const val = row.buckets[b] || 0;
                      return (
                        <td key={b} className="p-2 text-center">
                          <span
                            className="inline-block min-w-[44px] rounded-lg py-1.5 text-sm font-black"
                            style={{
                              backgroundColor: val > 0 ? `${row.color}33` : '#1E293B',
                              color: val > 0 ? row.color : '#64748B',
                              border: val > 0 ? `1px solid ${row.color}` : '1px solid transparent',
                            }}
                          >
                            {val}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 8: BENEFITS REALISATION
  if (activePage === 'p8_benefits') {
    return (
      <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border p-4" style={{ backgroundColor: '#1E293B', borderColor: '#22C55E' }}>
            <div className="text-[12px] text-slate-300">ROI Card</div>
            <div className="mt-1 text-[32px] font-bold" style={{ color: '#22C55E' }}>
              ROI = {PAGE8_BENEFITS_WATERFALL.roi}
            </div>
            <div className="mt-1 text-[11px] text-slate-300">Validated Enterprise Return on Investment</div>
          </div>

          <div className="rounded-xl border p-4" style={{ backgroundColor: '#1E293B', borderColor: '#39E6FF' }}>
            <div className="text-[12px] text-slate-300">Payback Card</div>
            <div className="mt-1 text-[32px] font-bold" style={{ color: '#39E6FF' }}>
              {PAGE8_BENEFITS_WATERFALL.payback}
            </div>
            <div className="mt-1 text-[11px] text-slate-300">Capital Recovery Velocity</div>
          </div>

          <PowerBiRadialGauge
            title="Benefits Achievement Gauge"
            value={PAGE8_BENEFITS_WATERFALL.achievement}
            target=">85%"
            status="84% Realised"
            color="#22C55E"
          />
        </div>

        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
        >
          <div className="mb-3 text-[16px] font-semibold text-white">
            Benefits Waterfall (Investment → Executive Productivity → Workforce Optimisation → Operational Efficiency → Risk Avoidance → Net Benefit)
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {PAGE8_BENEFITS_WATERFALL.steps.map((s, idx) => (
              <div
                key={s.step}
                className="flex flex-col justify-between rounded-xl border p-3.5"
                style={{ backgroundColor: '#1E293B', borderColor: s.color }}
              >
                <div>
                  <div className="text-[10px] font-bold uppercase" style={{ color: '#39E6FF' }}>
                    Stage {idx + 1}
                  </div>
                  <div className="mt-1 text-sm font-bold text-white">{s.step}</div>
                </div>
                <div className="mt-3 text-xl font-black" style={{ color: s.color }}>
                  {s.display}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // PAGE 9: RAID ANALYTICS
  if (activePage === 'p9_raid') {
    return (
      <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PAGE9_RAID_DATA.kpis.map((k) => (
            <div key={k.measure} className="rounded-xl border p-3.5" style={{ backgroundColor: '#1E293B', borderColor: k.color }}>
              <div className="text-[12px] text-slate-300">{k.measure}</div>
              <div className="mt-1 text-[32px] font-bold leading-none" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="rounded-xl border p-4 lg:col-span-4" style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}>
            <div className="mb-2 text-[16px] font-semibold text-white">RAID Trend</div>
            <div className="space-y-2">
              {PAGE9_RAID_DATA.trend.map((t) => (
                <div key={t.month} className="flex items-center justify-between rounded-lg px-3 py-2 text-[12px]" style={{ backgroundColor: '#1E293B' }}>
                  <span className="font-bold text-white">{t.month}</span>
                  <span style={{ color: '#EF4444' }}>R:{t.risks}</span>
                  <span style={{ color: '#39E6FF' }}>A:{t.assumptions}</span>
                  <span style={{ color: '#FBBF24' }}>I:{t.issues}</span>
                  <span style={{ color: '#22C55E' }}>D:{t.dependencies}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-4 lg:col-span-4" style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}>
            <div className="mb-2 text-[16px] font-semibold text-white">Issues by Age (Bar Chart)</div>
            <div className="space-y-2.5">
              {PAGE9_RAID_DATA.issuesByAge.map((b) => (
                <div key={b.bucket} className="space-y-1">
                  <div className="flex justify-between text-[12px] font-bold text-white">
                    <span>{b.bucket}</span>
                    <span style={{ color: '#39E6FF' }}>{b.count} Issues</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-900">
                    <div className="h-full rounded-full" style={{ width: `${(b.count / 8) * 100}%`, backgroundColor: '#39E6FF' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-4 lg:col-span-4" style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}>
            <div className="mb-2 text-[16px] font-semibold text-white">Risks by Severity (17 Total)</div>
            <div className="space-y-2.5">
              {PAGE9_RAID_DATA.risksBySeverity.map((s) => (
                <div key={s.severity} className="space-y-1">
                  <div className="flex justify-between text-[12px] font-bold text-white">
                    <span>{s.severity}</span>
                    <span style={{ color: s.color }}>{s.count}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-900">
                    <div className="h-full rounded-full" style={{ width: `${(s.count / 17) * 100}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 10: EXECUTIVE ACTIONS
  if (activePage === 'p10_exec_actions') {
    return (
      <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PAGE10_EXECUTIVE_ACTIONS.kpis.map((k) => (
            <div key={k.label} className="rounded-xl border p-3.5" style={{ backgroundColor: '#1E293B', borderColor: k.color }}>
              <div className="text-[12px] text-slate-300">{k.label}</div>
              <div className="mt-1 text-[32px] font-bold leading-none" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="rounded-xl border p-4 lg:col-span-8" style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}>
            <div className="mb-2 text-[16px] font-semibold text-white">
              Executive Action Table (Click a row to drill through)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] text-white">
                <thead>
                  <tr className="border-b border-slate-700 text-[11px] font-bold uppercase" style={{ color: '#39E6FF' }}>
                    <th className="py-2 pr-3">Action</th>
                    <th className="py-2 pr-3">Owner</th>
                    <th className="py-2 pr-3">Due Date</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">RAG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {PAGE10_EXECUTIVE_ACTIONS.actions.map((act) => (
                    <tr
                      key={act.id}
                      onClick={() => setSelectedAction(act)}
                      className="cursor-pointer transition hover:bg-slate-800/70"
                    >
                      <td className="py-2.5 pr-3 font-bold">{act.action}</td>
                      <td className="py-2.5 pr-3 text-slate-300">{act.owner}</td>
                      <td className="py-2.5 pr-3 text-slate-300">{act.dueDate}</td>
                      <td className="py-2.5 pr-3 text-slate-200">{act.status}</td>
                      <td className="py-2.5 pr-3">
                        <span
                          className="rounded px-2 py-0.5 text-[10px] font-black text-slate-950"
                          style={{
                            backgroundColor:
                              act.rag === 'Green' ? '#22C55E' : act.rag === 'Amber' ? '#FBBF24' : '#EF4444',
                          }}
                        >
                          {act.rag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border p-4 lg:col-span-4" style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}>
            <div className="text-[16px] font-semibold text-white">
              Drill-Through: Action → Owner → Committee → Board Decision
            </div>
            <div className="mt-3 space-y-2">
              {[
                { label: 'Action', val: selectedAction.action, color: '#39E6FF' },
                { label: '↓ Owner', val: selectedAction.owner, color: '#22C55E' },
                { label: '↓ Committee', val: selectedAction.committee, color: '#FBBF24' },
                { label: '↓ Board Decision', val: selectedAction.boardDecision, color: '#39E6FF' },
              ].map((step) => (
                <div key={step.label} className="rounded-lg border p-2.5" style={{ backgroundColor: '#1E293B', borderColor: step.color }}>
                  <div className="text-[10px] font-bold uppercase" style={{ color: step.color }}>{step.label}</div>
                  <div className="text-xs font-bold text-white">{step.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 11: BOARD DECISIONS
  if (activePage === 'p11_board_decisions') {
    const counts = {
      Approved: decisions.filter((d) => d.status === 'Approved').length,
      Deferred: decisions.filter((d) => d.status === 'Deferred').length,
      Rejected: decisions.filter((d) => d.status === 'Rejected').length,
      Open: decisions.filter((d) => d.status === 'Open').length,
    };

    return (
      <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        {/* Voting Status Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Approved', count: counts.Approved, color: '#22C55E' },
            { label: 'Deferred', count: counts.Deferred, color: '#FBBF24' },
            { label: 'Rejected', count: counts.Rejected, color: '#EF4444' },
            { label: 'Open', count: counts.Open, color: '#39E6FF' },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border p-3.5" style={{ backgroundColor: '#1E293B', borderColor: c.color }}>
              <div className="text-[12px] text-slate-300">Voting Status: {c.label}</div>
              <div className="mt-1 text-[32px] font-bold leading-none" style={{ color: c.color }}>{c.count}</div>
            </div>
          ))}
        </div>

        {/* Decision Register */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}>
          <div className="mb-3 text-[16px] font-semibold text-white">
            Board Decision Register (Decision ID · Decision · Owner · Committee · Status)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] text-white">
              <thead>
                <tr className="border-b border-slate-700 text-[11px] font-bold uppercase" style={{ color: '#39E6FF' }}>
                  <th className="py-2 pr-3">Decision ID</th>
                  <th className="py-2 pr-3">Decision</th>
                  <th className="py-2 pr-3">Owner</th>
                  <th className="py-2 pr-3">Committee</th>
                  <th className="py-2 pr-3">Status &amp; Vote</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {decisions.map((d) => (
                  <tr key={d.id}>
                    <td className="py-2.5 pr-3 font-bold" style={{ color: '#39E6FF' }}>{d.id}</td>
                    <td className="py-2.5 pr-3 font-bold text-white">{d.decision}</td>
                    <td className="py-2.5 pr-3 text-slate-300">{d.owner}</td>
                    <td className="py-2.5 pr-3 text-slate-300">{d.committee}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex flex-wrap gap-1">
                        {['Approved', 'Deferred', 'Rejected', 'Open'].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateDecisionStatus(d.id, st)}
                            className="rounded px-2 py-0.5 text-[10px] font-bold"
                            style={{
                              backgroundColor: d.status === st ? '#39E6FF' : '#1E293B',
                              color: d.status === st ? '#081018' : '#FFFFFF',
                            }}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 12: FABRIC, DATA & AI GOVERNANCE
  return (
    <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {PAGE12_FABRIC_AI_DATA.kpis.map((k) => (
          <div key={k.label} className="rounded-xl border p-3.5" style={{ backgroundColor: '#1E293B', borderColor: k.color }}>
            <div className="text-[12px] text-slate-300">{k.label}</div>
            <div className="mt-1 text-[32px] font-bold leading-none" style={{ color: k.color }}>{k.value}</div>
            <div className="mt-1 text-[11px] text-slate-400">Target: {k.target}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-4" style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}>
        <div className="mb-3 text-[16px] font-semibold text-white">
          Microsoft Fabric End-to-End Architecture Flow
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-8">
          {PAGE12_FABRIC_AI_DATA.architectureFlow.map((node) => (
            <div
              key={node.step}
              className="flex flex-col justify-between rounded-xl border p-3"
              style={{ backgroundColor: '#1E293B', borderColor: '#39E6FF' }}
            >
              <div>
                <div className="text-[10px] font-bold uppercase" style={{ color: '#39E6FF' }}>
                  Stage {node.step}
                </div>
                <div className="mt-1 text-sm font-bold text-white">{node.name}</div>
                <div className="mt-1 text-[11px] text-slate-300">{node.sub}</div>
              </div>
              <div className="mt-2 text-right text-[10px] font-bold" style={{ color: '#22C55E' }}>
                ONLINE →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}