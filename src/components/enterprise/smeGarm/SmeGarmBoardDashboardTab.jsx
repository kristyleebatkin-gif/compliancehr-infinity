import React, { useState } from 'react';
import { ArrowUpRight, Sparkles,
} from 'lucide-react';
import {
  ENTERPRISE_RISKS_SEED,
  BENEFITS_REALISATION_SEED,
  computeRiskScore,
  getRiskRatingBand,
  computeBenefitAchievement,
  getOmegaReadinessBand,
} from '@/lib/careSphereSmeGarmData';

function RadialGaugeCard({ title, subtitle, value, target, statusLabel, accentColor }) {
  const pct = Math.max(0, Math.min(100, Number(value || 0)));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div
      className="flex items-center justify-between gap-4 rounded-xl border p-4"
      style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.28)' }}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
          {subtitle}
        </div>
        <h4 className="text-sm font-black text-white">{title}</h4>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase"
            style={{
              backgroundColor: 'rgba(57,230,255,0.14)',
              color: accentColor,
              border: `1px solid ${accentColor}`,
            }}
          >
            {statusLabel}
          </span>
          <span className="text-[11px] font-bold text-slate-300">Target: {target}</span>
        </div>
      </div>

      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#081018"
            strokeWidth="9"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={accentColor}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-black text-white">{pct.toFixed(1)}</span>
          <span className="text-[9px] font-bold uppercase text-slate-300">/ 100</span>
        </div>
      </div>
    </div>
  );
}

const QUARTERLY_TRENDS = [
  { q: 'Q3 25', gei: 81.2, ohi: 82.4, omega: 79.5, bri: 76.0 },
  { q: 'Q4 25', gei: 84.0, ohi: 84.8, omega: 82.1, bri: 80.2 },
  { q: 'Q1 26', gei: 86.5, ohi: 86.3, omega: 85.0, bri: 83.4 },
  { q: 'Q2 26', gei: 88.2, ohi: 87.9, omega: 87.2, bri: 85.8 },
  { q: 'Q3 26', gei: 89.8, ohi: 89.1, omega: 88.9, bri: 87.1 },
  { q: 'Q4 26', gei: 91.4, ohi: 90.0, omega: 90.4, bri: 88.6 },
];

export default function SmeGarmBoardDashboardTab({
  orgHealthIndex,
  omegaReadinessIndex,
  lqiScore,
  onOpenBoardPack,
  onSelectModule,
}) {
  const [subDashboard, setSubDashboard] = useState('board'); // 'board' | 'audit_risk' | 'governance' | 'executive'
  const [inspectedRecord, setInspectedRecord] = useState(ENTERPRISE_RISKS_SEED[0]);

  const omegaBand = getOmegaReadinessBand(omegaReadinessIndex);

  return (
    <div className="space-y-4">
      {/* Sub-Dashboard Switcher: Board | Audit & Risk | Governance | Executive */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-2.5"
        style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.25)' }}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'board', label: '1. Board Dashboard' },
            { id: 'audit_risk', label: '2. Audit & Risk Dashboard' },
            { id: 'governance', label: '3. Governance Dashboard' },
            { id: 'executive', label: '4. Executive Action Dashboard' },
          ].map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSubDashboard(d.id)}
              className="rounded-lg px-3 py-1.5 text-xs font-black transition-all"
              style={{
                backgroundColor: subDashboard === d.id ? '#39E6FF' : '#1E293B',
                color: subDashboard === d.id ? '#081018' : '#FFFFFF',
                border: subDashboard === d.id ? '1px solid #39E6FF' : '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenBoardPack}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition hover:opacity-95"
          style={{ backgroundColor: '#22C55E', color: '#081018' }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Open 25-Slide Board Pack &amp; Speaker Notes
        </button>
      </div>

      {/* Row 1: 3 Constitutional Radial Gauges */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <RadialGaugeCard
          title="Governance Effectiveness Gauge"
          subtitle="Module 1 · GEI Telemetry"
          value={91.4}
          target=">85.0"
          statusLabel="EXCEEDS TARGET (+6.4)"
          accentColor="#39E6FF"
        />
        <RadialGaugeCard
          title="Organisation Health Gauge"
          subtitle="Module 4 · 8-Dimension Weighted"
          value={orgHealthIndex}
          target=">85.0"
          statusLabel="HEALTHY ENTERPRISE"
          accentColor="#22C55E"
        />
        <RadialGaugeCard
          title="Ω∞ Readiness Gauge"
          subtitle="Module 5 · 9 Readiness Domains"
          value={omegaReadinessIndex}
          target=">80.0"
          statusLabel={omegaBand.label}
          accentColor={omegaBand.color}
        />
      </div>

      {/* Row 2: 5×5 Enterprise Risk Heatmap + Benefits Realisation Waterfall */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* 5x5 Enterprise Risk Heatmap (Impact x Likelihood) */}
        <div
          className="rounded-xl border p-4 lg:col-span-7"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.22)' }}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
                Module 2 · Formula: Risk Score = Impact × Likelihood
              </div>
              <h3 className="text-sm font-black text-white">
                Enterprise 5×5 Risk Heatmap &amp; Appetite Thresholds
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black">
              <span className="rounded px-2 py-0.5" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#EF4444' }}>
                20–25 Extreme
              </span>
              <span className="rounded px-2 py-0.5" style={{ backgroundColor: 'rgba(249,115,22,0.2)', color: '#F97316' }}>
                15–19 High
              </span>
              <span className="rounded px-2 py-0.5" style={{ backgroundColor: 'rgba(251,191,36,0.2)', color: '#FBBF24' }}>
                8–14 Medium
              </span>
              <span className="rounded px-2 py-0.5" style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }}>
                1–7 Low
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {[5, 4, 3, 2, 1].map((impact) =>
              [1, 2, 3, 4, 5].map((likelihood) => {
                const score = computeRiskScore(impact, likelihood);
                const band = getRiskRatingBand(score);
                const matchingRisks = ENTERPRISE_RISKS_SEED.filter(
                  (r) => r.impact === impact && r.likelihood === likelihood
                );
                return (
                  <div
                    key={`${impact}-${likelihood}`}
                    className="flex min-h-[54px] flex-col justify-between rounded-lg border p-1.5 transition"
                    style={{
                      backgroundColor: '#1E293B',
                      borderColor: matchingRisks.length ? band.color : 'rgba(255,255,255,0.08)',
                      boxShadow: matchingRisks.length ? `0 0 10px ${band.color}44` : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between text-[9px] font-black">
                      <span style={{ color: band.color }}>Score {score}</span>
                      <span className="text-slate-400">I{impact}×L{likelihood}</span>
                    </div>
                    {matchingRisks.length > 0 ? (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {matchingRisks.map((mr) => (
                          <button
                            key={mr.id}
                            type="button"
                            onClick={() => setInspectedRecord(mr)}
                            className="rounded px-1.5 py-0.5 text-[9px] font-black text-slate-950"
                            style={{ backgroundColor: band.color }}
                            title={`${mr.id}: ${mr.title}`}
                          >
                            {mr.id}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[8px] font-semibold text-slate-500">{band.rating}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Benefits Realisation Waterfall & ROI Summary */}
        <div
          className="rounded-xl border p-4 lg:col-span-5"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.22)' }}
        >
          <div className="mb-2.5 space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <h3 className="text-sm font-black text-white">
                Benefits Waterfall ($4.82M Realised · 3.4x ROI)
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#22C55E' }}>
                Module 3 · (Current − Baseline) ÷ (Target − Baseline)
              </span>
            </div>
            {/* Board & Audit Controls Positioned Directly Above B1 on One Line */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-700/60 pt-1.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSubDashboard('board')}
                  className="rounded px-2 py-0.5 text-[10px] font-black text-white"
                  style={{ backgroundColor: subDashboard === 'board' ? '#0072FF' : '#1E293B' }}
                >
                  Board
                </button>
                <button
                  type="button"
                  onClick={() => setSubDashboard('audit_risk')}
                  className="rounded px-2 py-0.5 text-[10px] font-black text-white"
                  style={{ backgroundColor: subDashboard === 'audit_risk' ? '#A855F7' : '#1E293B' }}
                >
                  Audit &amp; Risk
                </button>
              </div>
              <button
                type="button"
                onClick={() => onSelectModule('benefits')}
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black"
                style={{ backgroundColor: '#1E293B', color: '#39E6FF' }}
              >
                Open Module 3 <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {BENEFITS_REALISATION_SEED.map((b) => {
              const achievement = computeBenefitAchievement(b.current, b.baseline, b.target);
              return (
                <div
                  key={b.id}
                  className="rounded-lg border p-2.5"
                  style={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-white">
                      {b.id} · {b.title}
                    </span>
                    <span className="text-xs font-black" style={{ color: '#22C55E' }}>
                      ${(b.benefitValue / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-300">
                    <span>Owner: {b.owner}</span>
                    <span className="font-black" style={{ color: '#39E6FF' }}>
                      Achievement: {achievement}% · Payback: {b.paybackMonths}m
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-900">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, achievement)}%`,
                        background: 'linear-gradient(90deg, #39E6FF 0%, #22C55E 100%)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: 6-Quarter Constitutional Trajectory + 8-Point Governance Test Inspector */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* 6-Quarter Trend Table & Bars */}
        <div
          className="rounded-xl border p-4 lg:col-span-6"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.22)' }}
        >
          <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
            Multi-Quarter Trajectory · FactGovernanceAssessment &amp; FactReadiness
          </div>
          <h3 className="mb-3 text-sm font-black text-white">
            Governance, Organisation Health, Ω∞ Readiness &amp; Benefits Trends
          </h3>

          <div className="space-y-2">
            {QUARTERLY_TRENDS.map((row) => (
              <div
                key={row.q}
                className="grid grid-cols-12 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs"
                style={{ backgroundColor: '#1E293B' }}
              >
                <span className="col-span-2 font-black text-white">{row.q}</span>
                <div className="col-span-10 grid grid-cols-4 gap-2 text-[11px] font-bold">
                  <span style={{ color: '#39E6FF' }}>GEI: {row.gei}</span>
                  <span style={{ color: '#22C55E' }}>OHI: {row.ohi}</span>
                  <span style={{ color: '#FBBF24' }}>Ω∞: {row.omega}</span>
                  <span className="text-white">BRI: {row.bri}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Three Lines Assurance Quick Summary */}
          <div className="mt-3 grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60">
            <div className="rounded-lg p-2" style={{ backgroundColor: '#1E293B' }}>
              <div className="text-[9px] font-black uppercase" style={{ color: '#39E6FF' }}>
                Line 1 · Operational
              </div>
              <div className="text-sm font-black text-white">94.0% Effective</div>
            </div>
            <div className="rounded-lg p-2" style={{ backgroundColor: '#1E293B' }}>
              <div className="text-[9px] font-black uppercase" style={{ color: '#22C55E' }}>
                Line 2 · GRC &amp; AI
              </div>
              <div className="text-sm font-black text-white">94.5% Effective</div>
            </div>
            <div className="rounded-lg p-2" style={{ backgroundColor: '#1E293B' }}>
              <div className="text-[9px] font-black uppercase" style={{ color: '#FBBF24' }}>
                Line 3 · Internal Audit
              </div>
              <div className="text-sm font-black text-white">94.1% Verified</div>
            </div>
          </div>
        </div>

        {/* 8-Point Constitutional Governance Test Inspector */}
        <div
          className="rounded-xl border p-4 lg:col-span-6"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.22)' }}
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
                Mandatory 8-Question Constitutional Governance Test
              </div>
              <h3 className="text-sm font-black text-white">
                Inspect Record: {inspectedRecord.id} — {inspectedRecord.title}
              </h3>
            </div>
            <div className="flex gap-1">
              {ENTERPRISE_RISKS_SEED.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setInspectedRecord(r)}
                  className="rounded px-2 py-0.5 text-[10px] font-black transition"
                  style={{
                    backgroundColor: inspectedRecord.id === r.id ? '#39E6FF' : '#1E293B',
                    color: inspectedRecord.id === r.id ? '#081018' : '#FFFFFF',
                  }}
                >
                  {r.id}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { q: '1. Purpose — Why does it exist?', a: `Govern & prevent ${inspectedRecord.category} exposure.` },
              { q: '2. Ownership — Who is accountable?', a: inspectedRecord.owner },
              { q: '3. Evidence — What proves it?', a: inspectedRecord.evidence },
              { q: '4. Controls — How is it governed?', a: inspectedRecord.control },
              {
                q: '5. Measurement — How is success measured?',
                a: `Risk Score ${computeRiskScore(inspectedRecord.impact, inspectedRecord.likelihood)} vs Appetite ${inspectedRecord.appetite}`,
              },
              { q: '6. Assurance — How is it validated?', a: inspectedRecord.assuranceLine },
              { q: '7. Benefits — What value does it deliver?', a: inspectedRecord.benefitProtected },
              { q: '8. Readiness — How does it sustain readiness?', a: inspectedRecord.readinessImpact },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-lg border p-2.5"
                style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.18)' }}
              >
                <div className="text-[10px] font-black uppercase" style={{ color: '#39E6FF' }}>
                  {item.q}
                </div>
                <div className="mt-0.5 text-xs font-bold text-white">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}