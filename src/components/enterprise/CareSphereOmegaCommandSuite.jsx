import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  Cpu,
  ShieldCheck,
  Sparkles,
  Network,
  Bot,
  Calculator,
  Award,
} from 'lucide-react';
import {
  OMEGA_11_SYSTEMS,
  OMEGA_SINGLE_SOURCE_ENGINES,
  OMEGA_DESIGN_MANDATES,
  OMEGA_SCALE_TARGETS,
  UNIVERSAL_24_TRACEABILITY_CHAIN,
  OMEGA_SCORING_ENGINES,
  NDIS_CONTROL_FRAMEWORK,
  DIGITAL_TWINS_5,
  CANONICAL_DATA_DOMAINS,
  KNOWLEDGE_GRAPH_NODES,
  AI_COPILOTS_9,
  AI_GOVERNED_AGENTS_13,
  INTELLIGENCE_11_HIERARCHY,
  TARGET_CERTIFICATIONS_10,
  OMEGA_FINAL_18_DOD,
} from '@/lib/careSphereOmegaData';

export default function CareSphereOmegaCommandSuite() {
  const [subTab, setSubTab] = useState('engines');

  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      {/* Top Banner: Autonomous Care Intelligence Platform + Scale */}
      <div className="rounded-xl border border-sky-200 bg-[#F0F7FF] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2B6D] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              <Sparkles className="h-3 w-3 text-[#00C6FF]" />
              <span>Final Governing Prompt v10.0 • Omega Maturity (≥ 98)</span>
            </span>
            <h3 className="mt-1.5 text-base sm:text-lg font-extrabold text-[#0A2B6D]">
              Autonomous Care Intelligence Platform — 11 Simultaneous Systems &amp; 17 Single-Source Engines
            </h3>
          </div>
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
            Zero Orphan Artifacts • 100% Traceability
          </span>
        </div>

        {/* Scale Targets */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {OMEGA_SCALE_TARGETS.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-sky-200 bg-white px-2.5 py-2 text-center shadow-2xs"
            >
              <div className="text-sm font-black text-[#0072FF]">{item.metric}</div>
              <div className="text-[11px] font-extrabold text-[#0A2B6D]">{item.label}</div>
            </div>
          ))}
        </div>

        {/* 11 Simultaneous Systems */}
        <div className="flex flex-wrap gap-1.5">
          {OMEGA_11_SYSTEMS.map((sys) => (
            <span
              key={sys}
              className="rounded-md border border-[#0072FF]/30 bg-white px-2.5 py-1 text-xs font-extrabold text-[#0A2B6D]"
            >
              {sys}
            </span>
          ))}
        </div>
      </div>

      {/* Sub-navigation inside Omega v10.0 */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: 'engines', label: '5 Mathematical Scoring Engines', icon: Calculator },
          { id: 'traceability', label: '24-Step Traceability & NDIS Controls', icon: ShieldCheck },
          { id: 'twins', label: '5 Digital Twins & Knowledge Graph', icon: Network },
          { id: 'ai', label: 'AI Copilots, 13 Agents & Intelligence', icon: Bot },
          { id: 'certifications', label: 'Certifications & 18-Point Omega DoD', icon: Award },
        ].map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-extrabold transition ${
                active
                  ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white'
                  : 'border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: active ? '#00C6FF' : '#0072FF' }} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: 5 MATHEMATICAL SCORING ENGINES + ONE SOURCE OF TRUTH */}
      {subTab === 'engines' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {OMEGA_SCORING_ENGINES.map((eng) => (
              <div
                key={eng.id}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0A2B6D]">{eng.title}</h4>
                    <p className="text-[11px] font-semibold text-slate-600">{eng.bands}</p>
                  </div>
                  <span className="rounded-md bg-[#0A2B6D] px-2.5 py-1 text-xs font-extrabold text-white">
                    Target {eng.target}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {eng.weights.map((w) => (
                    <div
                      key={w.label}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
                    >
                      <span className="truncate">{w.label}</span>
                      <span className="ml-1.5 shrink-0 font-black text-[#0072FF]">{w.weight}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              One Source of Truth (17 Unified Engines) &amp; 13 Design Mandates
            </div>
            <div className="flex flex-wrap gap-1.5">
              {OMEGA_SINGLE_SOURCE_ENGINES.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-slate-200 bg-[#F0F7FF] px-2.5 py-1 text-xs font-bold text-[#0A2B6D]"
                >
                  {item}
                </span>
              ))}
              {OMEGA_DESIGN_MANDATES.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-[#5A00D6]/30 bg-[#F5F0FF] px-2.5 py-1 text-xs font-extrabold text-[#5A00D6]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: 24-STEP UNIVERSAL TRACEABILITY & NDIS CONTROL FRAMEWORK */}
      {subTab === 'traceability' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              Universal 24-Step Traceability Chain (No Orphan Artifacts Permitted)
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {UNIVERSAL_24_TRACEABILITY_CHAIN.map((step, idx) => (
                <React.Fragment key={step}>
                  <span className="rounded-lg border border-[#0072FF]/30 bg-[#F0F7FF] px-2.5 py-1 text-xs font-extrabold text-[#0A2B6D]">
                    {idx + 1}. {step}
                  </span>
                  {idx < UNIVERSAL_24_TRACEABILITY_CHAIN.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 text-[#0072FF]" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {NDIS_CONTROL_FRAMEWORK.map((item) => (
              <div
                key={item.pillar}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-extrabold text-[#0A2B6D]">{item.pillar}</h4>
                    <Link
                      to={item.route}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0072FF] hover:underline"
                    >
                      <span>Open</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Mandatory Controls
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {item.controls.map((c) => (
                        <span
                          key={c}
                          className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-[#0A2B6D]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                      Required Evidence Artifacts
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {item.evidence.map((ev) => (
                        <span
                          key={ev}
                          className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: 5 DIGITAL TWINS, CANONICAL DATA MODEL & KNOWLEDGE GRAPH */}
      {subTab === 'twins' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {DIGITAL_TWINS_5.map((dt) => (
              <Link
                key={dt.twin}
                to={dt.route}
                className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 transition hover:border-[#0072FF]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0072FF]">Digital Twin</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#0072FF]" />
                </div>
                <div className="text-sm font-extrabold text-[#0A2B6D]">{dt.twin}</div>
                <div className="flex flex-wrap gap-1">
                  {dt.dimensions.map((d) => (
                    <span
                      key={d}
                      className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-[#0A2B6D]"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CANONICAL_DATA_DOMAINS.map((cd) => (
              <div key={cd.domain} className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                  Canonical Domain: {cd.domain}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cd.entities.map((e) => (
                    <span
                      key={e}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-[#0A2B6D]"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              Knowledge Graph Core Nodes (1,000+ Relationship Types • Zero Orphan Nodes)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {KNOWLEDGE_GRAPH_NODES.map((node) => (
                <span
                  key={node}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#0072FF]/30 bg-[#F0F7FF] px-2.5 py-1 text-xs font-extrabold text-[#0A2B6D]"
                >
                  <Cpu className="h-3 w-3 text-[#0072FF]" />
                  <span>{node}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: AI COPILOTS, 13 GOVERNED AGENTS & 11-STEP INTELLIGENCE HIERARCHY */}
      {subTab === 'ai' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              11-Stage Intelligence Hierarchy (Data → Optimization)
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {INTELLIGENCE_11_HIERARCHY.map((step, idx) => (
                <React.Fragment key={step}>
                  <span className="rounded-lg border border-[#5A00D6]/30 bg-[#F5F0FF] px-2.5 py-1 text-xs font-extrabold text-[#5A00D6]">
                    {step}
                  </span>
                  {idx < INTELLIGENCE_11_HIERARCHY.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 text-[#5A00D6]" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                9 Role-Scoped AI Copilots
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AI_COPILOTS_9.map((c) => (
                  <Link
                    key={c}
                    to="/assistant"
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-extrabold text-[#0A2B6D] hover:border-[#0072FF] hover:bg-[#F0F7FF]"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                13 Governed Autonomous Agents (Target: 100+ Governed Agents)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AI_GOVERNED_AGENTS_13.map((ag) => (
                  <Link
                    key={ag}
                    to="/assistant"
                    className="rounded-lg border border-[#5A00D6]/30 bg-[#F5F0FF] px-2.5 py-1.5 text-xs font-extrabold text-[#5A00D6] hover:bg-[#EDE9FE]"
                  >
                    {ag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: CERTIFICATIONS & 18-POINT FINAL OMEGA DEFINITION OF DONE */}
      {subTab === 'certifications' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              10 Target Regulatory, Security &amp; Quality Certifications
            </div>
            <div className="flex flex-wrap gap-2">
              {TARGET_CERTIFICATIONS_10.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-800"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{cert}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              Final 18-Point Omega Definition of Done (Mandatory on Every Artifact)
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {OMEGA_FINAL_18_DOD.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-extrabold text-[#0A2B6D]"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}