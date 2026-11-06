import React, { useState } from 'react';
import {
  Shield, AlertTriangle, TrendingUp, CheckCircle2, ArrowUpRight,
  Activity, Award, Compass, Eye,
} from 'lucide-react';
import {
  PAGE1_TOP_KPIS,
  PAGE2_GOVERNANCE_DATA,
  PAGE3_ORG_HEALTH_DATA,
  PAGE4_READINESS_DATA,
  PAGE5_ENTERPRISE_RISKS,
  PAGE5_EXPOSURE_TREND,
  PAGE6_ASSURANCE_DATA,
  PAGE8_BENEFITS_WATERFALL,
  PAGE10_EXECUTIVE_ACTIONS,
  PAGE11_BOARD_DECISIONS,
} from '@/lib/careSpherePowerBiData';

export function PowerBiRadialGauge({ title, value, target, status, color = '#39E6FF', onClick }) {
  const pct = Math.max(0, Math.min(100, Number(value || 0)));
  const r = 38;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition ${
        onClick ? 'cursor-pointer hover:border-[#39E6FF]' : ''
      }`}
      style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.24)' }}
    >
      <div className="space-y-1">
        <div className="text-[12px] font-semibold text-slate-300">{title}</div>
        <div className="text-[32px] font-bold leading-none text-white">{value}</div>
        <div className="flex items-center gap-2 pt-1 text-[11px]">
          {target && <span className="text-slate-300">Target: {target}</span>}
          <span
            className="rounded px-2 py-0.5 text-[10px] font-bold uppercase"
            style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}` }}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="transparent" stroke="#081018" strokeWidth="8" />
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xs font-bold text-white">{pct}%</span>
      </div>
    </div>
  );
}

function SvgRadarChart({ dimensions }) {
  const size = 240;
  const center = size / 2;
  const maxR = 86;
  const count = dimensions.length;

  const pointFor = (idx, val) => {
    const angle = (Math.PI * 2 * idx) / count - Math.PI / 2;
    const r = (Number(val || 0) / 100) * maxR;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };

  const polygonPoints = dimensions
    .map((d, i) => pointFor(i, d.score).join(','))
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[25, 50, 75, 100].map((ring) => {
          const pts = dimensions.map((_, i) => pointFor(i, ring).join(',')).join(' ');
          return (
            <polygon
              key={ring}
              points={pts}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />
          );
        })}
        {dimensions.map((d, i) => {
          const [x, y] = pointFor(i, 100);
          const [lx, ly] = pointFor(i, 116);
          return (
            <g key={d.dimension}>
              <line x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.12)" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="700"
              >
                {d.dimension} ({d.score})
              </text>
            </g>
          );
        })}
        <polygon
          points={polygonPoints}
          fill="rgba(57,230,255,0.25)"
          stroke="#39E6FF"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

export default function PowerBiPagesOneToSix({ activePage, onNavigatePage }) {
  const [selectedGovDrill, setSelectedGovDrill] = useState(PAGE2_GOVERNANCE_DATA.drillThrough[0]);
  const [selectedHealthDim, setSelectedHealthDim] = useState(PAGE3_ORG_HEALTH_DATA.radarDimensions[0]);

  // PAGE 1: CARESPHERE EXECUTIVE COMMAND CENTRE (WIREFRAME LANDING PAGE)
  if (activePage === 'p1_command') {
    return (
      <div className="space-y-3.5" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        {/* WIREFRAME ROW 1: GEI | OHI | ORI | BRI | ACS | LQI */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {PAGE1_TOP_KPIS.map((kpi) => (
            <button
              key={kpi.code}
              type="button"
              onClick={() => onNavigatePage(kpi.targetPage)}
              className="group rounded-xl border p-3 text-left transition hover:border-[#39E6FF]"
              style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.22)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#39E6FF' }}>
                  {kpi.code}
                </span>
                <span
                  className="rounded px-1.5 py-0.5 text-[9.5px] font-bold"
                  style={{ backgroundColor: `${kpi.color}22`, color: kpi.color }}
                >
                  Target {kpi.target}
                </span>
              </div>
              <div className="mt-1 text-[32px] font-bold leading-none text-white">{kpi.value}</div>
              <div className="mt-1 truncate text-[12px] text-slate-300">{kpi.label}</div>
            </button>
          ))}
        </div>

        {/* WIREFRAME ROW 2: Governance Gauge | Health Gauge | Readiness Gauge */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <PowerBiRadialGauge
            title="Governance Gauge (GEI)"
            value={89}
            target=">85"
            status="Green"
            color="#22C55E"
            onClick={() => onNavigatePage('p2_governance')}
          />
          <PowerBiRadialGauge
            title="Organisation Health Gauge (OHI)"
            value={87}
            target=">85"
            status="Healthy"
            color="#22C55E"
            onClick={() => onNavigatePage('p3_health')}
          />
          <PowerBiRadialGauge
            title="Ω∞ Readiness Gauge (ORI)"
            value={82}
            target=">80"
            status="Ready"
            color="#39E6FF"
            onClick={() => onNavigatePage('p4_readiness')}
          />
        </div>

        {/* WIREFRAME ROW 3: Risk Heatmap | Top Risks */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div
            className="rounded-xl border p-3.5 lg:col-span-6"
            style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.22)' }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="text-[16px] font-semibold text-white">Enterprise 5×5 Risk Heatmap</div>
                <div className="text-[12px] text-slate-300">Plot: R1 AI · R2 Workforce · R3 Cyber · R4 Data · R5 Benefits</div>
              </div>
              <button
                type="button"
                onClick={() => onNavigatePage('p5_risk')}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-bold"
                style={{ backgroundColor: '#1E293B', color: '#39E6FF' }}
              >
                Drill to Page 5 <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[5, 4, 3, 2, 1].map((imp) =>
                [1, 2, 3, 4, 5].map((lik) => {
                  const s = imp * lik;
                  const cellColor = s >= 20 ? '#EF4444' : s >= 15 ? '#F97316' : s >= 8 ? '#FBBF24' : '#22C55E';
                  const plotted = PAGE5_ENTERPRISE_RISKS.slice(0, 5).filter(
                    (r) => r.impact === imp && r.likelihood === lik
                  );
                  return (
                    <div
                      key={`${imp}-${lik}`}
                      className="flex min-h-[42px] flex-col justify-between rounded border p-1"
                      style={{
                        backgroundColor: '#1E293B',
                        borderColor: plotted.length ? cellColor : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      <span className="text-[9px] font-bold" style={{ color: cellColor }}>{s}</span>
                      <div className="flex flex-wrap gap-0.5">
                        {plotted.map((p) => (
                          <span
                            key={p.id}
                            className="rounded px-1 text-[9px] font-black text-slate-950"
                            style={{ backgroundColor: cellColor }}
                          >
                            {p.id}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div
            className="rounded-xl border p-3.5 lg:col-span-6"
            style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.22)' }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[16px] font-semibold text-white">Top Enterprise Risks (R1–R5)</div>
              <span className="text-[12px] font-bold" style={{ color: '#FBBF24' }}>Click Page 5 for Top 10</span>
            </div>
            <div className="space-y-1.5">
              {PAGE5_ENTERPRISE_RISKS.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[12px]"
                  style={{ backgroundColor: '#1E293B' }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-white">{r.title}</div>
                    <div className="text-[11px] text-slate-300">Owner: {r.owner} · Due: {r.dueDate}</div>
                  </div>
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-black text-slate-950"
                    style={{
                      backgroundColor:
                        r.rating === 'Extreme' ? '#EF4444' : r.rating === 'High' ? '#F97316' : '#FBBF24',
                    }}
                  >
                    {r.score} · {r.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WIREFRAME ROW 4: Benefits Waterfall | ROI Dashboard */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div
            className="rounded-xl border p-3.5 lg:col-span-7"
            style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.22)' }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[16px] font-semibold text-white">Benefits Waterfall</div>
              <button
                type="button"
                onClick={() => onNavigatePage('p8_benefits')}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-bold"
                style={{ backgroundColor: '#1E293B', color: '#39E6FF' }}
              >
                Open Page 8 <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
              {PAGE8_BENEFITS_WATERFALL.steps.map((st) => (
                <div
                  key={st.step}
                  className="flex flex-col justify-between rounded-lg border p-2.5"
                  style={{ backgroundColor: '#1E293B', borderColor: st.color }}
                >
                  <div className="text-[10px] font-bold text-slate-300">{st.step}</div>
                  <div className="mt-2 text-sm font-black" style={{ color: st.color }}>{st.display}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="grid grid-cols-3 gap-2.5 rounded-xl border p-3.5 lg:col-span-5"
            style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.22)' }}
          >
            <div className="rounded-lg p-3" style={{ backgroundColor: '#1E293B' }}>
              <div className="text-[11px] text-slate-300">ROI Dashboard</div>
              <div className="mt-1 text-[28px] font-bold leading-none" style={{ color: '#22C55E' }}>
                {PAGE8_BENEFITS_WATERFALL.roi}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Validated Net Return</div>
            </div>
            <div className="rounded-lg p-3" style={{ backgroundColor: '#1E293B' }}>
              <div className="text-[11px] text-slate-300">Payback Period</div>
              <div className="mt-1 text-[24px] font-bold leading-none" style={{ color: '#39E6FF' }}>
                6.8m
              </div>
              <div className="mt-1 text-[11px] text-slate-400">6.8 months</div>
            </div>
            <div className="rounded-lg p-3" style={{ backgroundColor: '#1E293B' }}>
              <div className="text-[11px] text-slate-300">Achievement</div>
              <div className="mt-1 text-[28px] font-bold leading-none" style={{ color: '#FBBF24' }}>
                {PAGE8_BENEFITS_WATERFALL.achievement}%
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Target &gt;85%</div>
            </div>
          </div>
        </div>

        {/* WIREFRAME ROW 5: Executive Actions | Decisions Required */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div
            className="rounded-xl border p-3.5 lg:col-span-6"
            style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.22)' }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[16px] font-semibold text-white">Executive Actions</div>
              <button
                type="button"
                onClick={() => onNavigatePage('p10_exec_actions')}
                className="text-[11px] font-bold"
                style={{ color: '#39E6FF' }}
              >
                Open Page 10 →
              </button>
            </div>
            <div className="space-y-1.5">
              {PAGE10_EXECUTIVE_ACTIONS.actions.slice(0, 3).map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[12px]"
                  style={{ backgroundColor: '#1E293B' }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-white">{act.action}</div>
                    <div className="text-[11px] text-slate-300">{act.owner} · Due {act.dueDate}</div>
                  </div>
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-black text-slate-950"
                    style={{
                      backgroundColor:
                        act.rag === 'Green' ? '#22C55E' : act.rag === 'Amber' ? '#FBBF24' : '#EF4444',
                    }}
                  >
                    {act.rag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl border p-3.5 lg:col-span-6"
            style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.22)' }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[16px] font-semibold text-white">Decisions Required (Board Register)</div>
              <button
                type="button"
                onClick={() => onNavigatePage('p11_board_decisions')}
                className="text-[11px] font-bold"
                style={{ color: '#39E6FF' }}
              >
                Open Page 11 →
              </button>
            </div>
            <div className="space-y-1.5">
              {PAGE11_BOARD_DECISIONS.slice(0, 3).map((dec) => (
                <div
                  key={dec.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[12px]"
                  style={{ backgroundColor: '#1E293B' }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-white">
                      <span style={{ color: '#39E6FF' }}>{dec.id}</span> · {dec.decision}
                    </div>
                    <div className="text-[11px] text-slate-300">{dec.committee} · {dec.owner}</div>
                  </div>
                  <span className="rounded px-2 py-0.5 text-[10px] font-black" style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }}>
                    {dec.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 2: GOVERNANCE PERFORMANCE
  if (activePage === 'p2_governance') {
    return (
      <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <PowerBiRadialGauge
              title="Governance Gauge"
              value={PAGE2_GOVERNANCE_DATA.gauge.current}
              target={PAGE2_GOVERNANCE_DATA.gauge.target}
              status={PAGE2_GOVERNANCE_DATA.gauge.status}
              color="#22C55E"
            />
          </div>

          <div
            className="rounded-xl border p-4 lg:col-span-4"
            style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
          >
            <div className="text-[16px] font-semibold text-white">Governance Trend (FY25 → FY27)</div>
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {PAGE2_GOVERNANCE_DATA.trend.map((t) => (
                <div key={t.period} className="rounded-lg p-3 text-center" style={{ backgroundColor: '#1E293B' }}>
                  <div className="text-[12px] text-slate-300">{t.period}</div>
                  <div className="mt-1 text-[28px] font-bold" style={{ color: '#39E6FF' }}>{t.score}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl border p-4 lg:col-span-4"
            style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
          >
            <div className="text-[16px] font-semibold text-white">Governance Maturity Breakdown</div>
            <div className="mt-2 space-y-2">
              {PAGE2_GOVERNANCE_DATA.maturityBreakdown.map((m) => (
                <div key={m.domain} className="space-y-1">
                  <div className="flex justify-between text-[12px] font-bold">
                    <span className="text-white">{m.domain}</span>
                    <span style={{ color: m.score >= 85 ? '#22C55E' : '#FBBF24' }}>{m.score}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${m.score}%`, backgroundColor: m.score >= 85 ? '#22C55E' : '#FBBF24' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drill-through: Capability → Assessment → Finding → Action */}
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[16px] font-semibold text-white">
                Interactive Governance Drill-Through: Capability → Assessment → Finding → Action
              </div>
              <div className="text-[12px] text-slate-300">Select a capability to trace its full governance chain</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PAGE2_GOVERNANCE_DATA.drillThrough.map((item) => (
                <button
                  key={item.capability}
                  type="button"
                  onClick={() => setSelectedGovDrill(item)}
                  className="rounded-lg px-3 py-1 text-[12px] font-bold"
                  style={{
                    backgroundColor: selectedGovDrill.capability === item.capability ? '#39E6FF' : '#1E293B',
                    color: selectedGovDrill.capability === item.capability ? '#081018' : '#FFFFFF',
                  }}
                >
                  {item.capability}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {[
              { step: '1. Capability', val: selectedGovDrill.capability, color: '#39E6FF' },
              { step: '2. Assessment', val: selectedGovDrill.assessment, color: '#22C55E' },
              { step: '3. Finding', val: selectedGovDrill.finding, color: '#FBBF24' },
              { step: '4. Action', val: selectedGovDrill.action, color: '#39E6FF' },
            ].map((s) => (
              <div key={s.step} className="rounded-xl border p-3.5" style={{ backgroundColor: '#1E293B', borderColor: s.color }}>
                <div className="text-[11px] font-bold uppercase" style={{ color: s.color }}>{s.step}</div>
                <div className="mt-1 text-[13px] font-semibold text-white">{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // PAGE 3: ORGANISATION HEALTH
  if (activePage === 'p3_health') {
    return (
      <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-4">
            <PowerBiRadialGauge
              title="Organisation Health Gauge"
              value={PAGE3_ORG_HEALTH_DATA.gauge.score}
              target=">85"
              status={PAGE3_ORG_HEALTH_DATA.gauge.status}
              color="#22C55E"
            />
            <div
              className="rounded-xl border p-4"
              style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
            >
              <div className="text-[16px] font-semibold text-white">Health Trend (65 → 78 → 87)</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {PAGE3_ORG_HEALTH_DATA.trend.map((t) => (
                  <div key={t.period} className="rounded-lg p-2.5 text-center" style={{ backgroundColor: '#1E293B' }}>
                    <div className="text-[11px] text-slate-300">{t.period}</div>
                    <div className="text-[24px] font-bold" style={{ color: '#22C55E' }}>{t.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center rounded-xl border p-4 lg:col-span-4"
            style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
          >
            <div className="mb-1 text-[16px] font-semibold text-white">8-Dimension Health Radar Chart</div>
            <SvgRadarChart dimensions={PAGE3_ORG_HEALTH_DATA.radarDimensions} />
          </div>

          <div
            className="rounded-xl border p-4 lg:col-span-4"
            style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
          >
            <div className="text-[16px] font-semibold text-white">
              Drill-Through: Health Domain → Contributing KPI → Action Plan
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {PAGE3_ORG_HEALTH_DATA.radarDimensions.map((d) => (
                <button
                  key={d.dimension}
                  type="button"
                  onClick={() => setSelectedHealthDim(d)}
                  className="rounded px-2 py-1 text-[11px] font-bold"
                  style={{
                    backgroundColor: selectedHealthDim.dimension === d.dimension ? '#39E6FF' : '#1E293B',
                    color: selectedHealthDim.dimension === d.dimension ? '#081018' : '#FFFFFF',
                  }}
                >
                  {d.dimension} ({d.score})
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <div className="rounded-lg p-2.5" style={{ backgroundColor: '#1E293B' }}>
                <div className="text-[10px] font-bold uppercase" style={{ color: '#39E6FF' }}>Health Domain</div>
                <div className="text-sm font-bold text-white">
                  {selectedHealthDim.dimension} (Weight {selectedHealthDim.weight} · Score {selectedHealthDim.score}/100)
                </div>
              </div>
              <div className="rounded-lg p-2.5" style={{ backgroundColor: '#1E293B' }}>
                <div className="text-[10px] font-bold uppercase" style={{ color: '#22C55E' }}>↓ Contributing KPI</div>
                <div className="text-sm font-bold text-white">{selectedHealthDim.kpi}</div>
              </div>
              <div className="rounded-lg p-2.5" style={{ backgroundColor: '#1E293B' }}>
                <div className="text-[10px] font-bold uppercase" style={{ color: '#FBBF24' }}>↓ Action Plan</div>
                <div className="text-sm font-bold text-white">{selectedHealthDim.actionPlan}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 4: Ω∞ READINESS
  if (activePage === 'p4_readiness') {
    return (
      <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-4">
            <PowerBiRadialGauge
              title="Ω∞ Readiness Gauge"
              value={PAGE4_READINESS_DATA.gauge.score}
              target=">80"
              status={PAGE4_READINESS_DATA.gauge.status}
              color="#39E6FF"
            />
            <div
              className="rounded-xl border p-4"
              style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
            >
              <div className="text-[16px] font-semibold text-white">Readiness Trend Visual (58 → 73 → 82)</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {PAGE4_READINESS_DATA.trend.map((t) => (
                  <div key={t.period} className="rounded-lg p-2.5 text-center" style={{ backgroundColor: '#1E293B' }}>
                    <div className="text-[11px] text-slate-300">{t.period}</div>
                    <div className="text-[24px] font-bold" style={{ color: '#39E6FF' }}>{t.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border p-4 lg:col-span-8"
            style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
          >
            <div className="mb-3 text-[16px] font-semibold text-white">
              9-Domain Ω∞ Readiness Heatmap
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {PAGE4_READINESS_DATA.domains.map((d) => {
                const c = d.score >= 75 ? '#22C55E' : '#FBBF24';
                return (
                  <div
                    key={d.domain}
                    className="rounded-xl border p-3"
                    style={{ backgroundColor: '#1E293B', borderColor: c }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{d.domain}</span>
                      <span
                        className="rounded px-2 py-0.5 text-[10px] font-black text-slate-950"
                        style={{ backgroundColor: c }}
                      >
                        {d.status}
                      </span>
                    </div>
                    <div className="mt-1 text-[28px] font-bold" style={{ color: c }}>{d.score}</div>
                    <div className="text-[11px] text-slate-300">Owner: {d.owner}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 5: ENTERPRISE RISK
  if (activePage === 'p5_risk') {
    return (
      <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* 5x5 Heatmap */}
          <div
            className="rounded-xl border p-4 lg:col-span-6"
            style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
          >
            <div className="mb-2 text-[16px] font-semibold text-white">
              5×5 Heat Map (R1 AI · R2 Workforce · R3 Cyber · R4 Data · R5 Benefits)
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[5, 4, 3, 2, 1].map((imp) =>
                [1, 2, 3, 4, 5].map((lik) => {
                  const score = imp * lik;
                  const c = score >= 20 ? '#EF4444' : score >= 15 ? '#F97316' : score >= 8 ? '#FBBF24' : '#22C55E';
                  const items = PAGE5_ENTERPRISE_RISKS.filter((r) => r.impact === imp && r.likelihood === lik);
                  return (
                    <div
                      key={`${imp}-${lik}`}
                      className="flex min-h-[52px] flex-col justify-between rounded-lg border p-1.5"
                      style={{ backgroundColor: '#1E293B', borderColor: items.length ? c : 'rgba(255,255,255,0.08)' }}
                    >
                      <span className="text-[9px] font-bold" style={{ color: c }}>I{imp}×L{lik}={score}</span>
                      <div className="flex flex-wrap gap-1">
                        {items.map((it) => (
                          <span key={it.id} className="rounded px-1.5 py-0.5 text-[9px] font-black text-slate-950" style={{ backgroundColor: c }}>
                            {it.id}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Risk Exposure Trend */}
          <div
            className="rounded-xl border p-4 lg:col-span-6"
            style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
          >
            <div className="mb-3 text-[16px] font-semibold text-white">
              Risk Exposure Trend (Critical · High · Open Risks)
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {PAGE5_EXPOSURE_TREND.map((t) => (
                <div key={t.period} className="rounded-xl p-3" style={{ backgroundColor: '#1E293B' }}>
                  <div className="text-sm font-bold text-white">{t.period}</div>
                  <div className="mt-2 space-y-1 text-[12px] font-bold">
                    <div style={{ color: '#EF4444' }}>Critical: {t.critical}</div>
                    <div style={{ color: '#FBBF24' }}>High: {t.high}</div>
                    <div style={{ color: '#39E6FF' }}>Open: {t.open}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 10 Risk Register */}
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
        >
          <div className="mb-2 text-[16px] font-semibold text-white">
            Enterprise Risk Register — Top 10 Risks (Risk · Owner · Rating · Trend · Due Date)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] text-white">
              <thead>
                <tr className="border-b border-slate-700 text-[11px] font-bold uppercase" style={{ color: '#39E6FF' }}>
                  <th className="py-2 pr-3">Risk</th>
                  <th className="py-2 pr-3">Owner</th>
                  <th className="py-2 pr-3">Rating</th>
                  <th className="py-2 pr-3">Trend</th>
                  <th className="py-2 pr-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {PAGE5_ENTERPRISE_RISKS.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 pr-3 font-bold">{r.title}</td>
                    <td className="py-2 pr-3 text-slate-300">{r.owner}</td>
                    <td className="py-2 pr-3">
                      <span
                        className="rounded px-2 py-0.5 text-[10px] font-black text-slate-950"
                        style={{
                          backgroundColor:
                            r.rating === 'Extreme' ? '#EF4444' : r.rating === 'High' ? '#F97316' : r.rating === 'Medium' ? '#FBBF24' : '#22C55E',
                        }}
                      >
                        {r.score} · {r.rating}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-bold" style={{ color: '#39E6FF' }}>{r.trend}</td>
                    <td className="py-2 pr-3 text-slate-300">{r.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 6: ASSURANCE DASHBOARD
  return (
    <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {PAGE6_ASSURANCE_DATA.kpis.map((k) => (
          <div key={k.label} className="rounded-xl border p-3.5" style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.22)' }}>
            <div className="text-[12px] text-slate-300">{k.label}</div>
            <div className="mt-1 text-[32px] font-bold leading-none" style={{ color: k.color }}>{k.value}</div>
            <div className="mt-1 text-[11px] text-slate-400">Target: {k.target}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div
          className="rounded-xl border p-4 lg:col-span-7"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
        >
          <div className="mb-3 text-[16px] font-semibold text-white">
            Audit Findings by Severity (Stacked Column: Critical · High · Medium · Low)
          </div>
          <div className="space-y-3">
            {PAGE6_ASSURANCE_DATA.findingsBySeverity.map((row) => (
              <div key={row.line} className="rounded-lg p-3" style={{ backgroundColor: '#1E293B' }}>
                <div className="flex items-center justify-between text-[12px] font-bold text-white">
                  <span>{row.line}</span>
                  <span className="text-slate-300">
                    Critical: {row.critical} · High: {row.high} · Medium: {row.medium} · Low: {row.low}
                  </span>
                </div>
                <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-slate-900">
                  <div style={{ width: `${row.critical * 15}%`, backgroundColor: '#EF4444' }} />
                  <div style={{ width: `${row.high * 20}%`, backgroundColor: '#F97316' }} />
                  <div style={{ width: `${row.medium * 25}%`, backgroundColor: '#FBBF24' }} />
                  <div style={{ width: `${row.low * 20}%`, backgroundColor: '#22C55E' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-xl border p-4 lg:col-span-5"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
        >
          <div className="mb-3 text-[16px] font-semibold text-white">
            Assurance Coverage Trend (74 → 85 → 92)
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {PAGE6_ASSURANCE_DATA.coverageTrend.map((t) => (
              <div key={t.period} className="rounded-xl p-3 text-center" style={{ backgroundColor: '#1E293B' }}>
                <div className="text-[12px] text-slate-300">{t.period}</div>
                <div className="mt-1 text-[28px] font-bold" style={{ color: '#22C55E' }}>{t.coverage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}