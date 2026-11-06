import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  ArrowRight,
  Cpu,
  ShieldCheck,
  Sparkles,
  Workflow,
  Server,
  HelpCircle,
  LayoutGrid,
} from 'lucide-react';
import {
  SIX_ARCHITECTURE_LAYERS,
  CARESPHERE_12_CAPABILITIES,
  WORLD_CLASS_INTERACTION_QUESTIONS,
  WORLD_CLASS_DASHBOARD_COMPONENTS,
  MANDATORY_PLATFORM_SERVICES,
  WORLD_CLASS_TECH_STACK,
  DEFINITION_OF_DONE_23_CRITERIA,
} from '@/lib/careSphereMasterBlueprintData';

export default function CareSphereSeniorMasterBlueprint() {
  const [activeTab, setActiveTab] = useState('capabilities');
  const [selectedCapId, setSelectedCapId] = useState(1);

  const selectedCap =
    CARESPHERE_12_CAPABILITIES.find((c) => c.id === selectedCapId) ||
    CARESPHERE_12_CAPABILITIES[0];

  return (
    <section
      aria-label="CareSphere World-Class Senior Master Enterprise Blueprint"
      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2B6D] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
            <Sparkles className="h-3.5 w-3.5 text-[#00C6FF]" />
            <span>CareSphere World-Class Senior Master Enterprise Blueprint</span>
          </div>
          <h2 className="mt-2 font-editorial text-xl font-extrabold text-[#0A2B6D] sm:text-2xl">
            12 Master Capabilities × 6 Architecture Layers × 23-Point Definition of Done
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
            Features • Functions • Flows • Interactions • Capabilities • Technology — every capability engineered end-to-end across all six enterprise layers.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'capabilities', label: '12 Capabilities (6-Layer Matrix)', icon: Layers },
            { id: 'interaction', label: '6-Question Model & 10-Part Command', icon: HelpCircle },
            { id: 'services', label: '17 Platform Services & Tech Stack', icon: Server },
            { id: 'dod', label: '23-Point Definition of Done', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-extrabold transition ${
                  active
                    ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-[#0A2B6D] hover:border-[#0072FF] hover:bg-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: active ? '#00C6FF' : '#0072FF' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6-Layer Architecture Chain Banner */}
      <div className="rounded-xl border border-sky-200 bg-[#F0F7FF] p-3">
        <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
          Mandatory 6-Layer Capability Chain (No feature exists without supporting all six layers)
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {SIX_ARCHITECTURE_LAYERS.map((layer, idx) => (
            <div
              key={layer.key}
              className="flex items-center justify-between rounded-lg border border-sky-200 bg-white px-2.5 py-2 shadow-2xs"
            >
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                  Layer {layer.step}
                </div>
                <div className="truncate text-xs font-extrabold text-[#0A2B6D]">{layer.label}</div>
                <div className="truncate text-[10px] font-medium text-slate-600">{layer.desc}</div>
              </div>
              {idx < SIX_ARCHITECTURE_LAYERS.length - 1 && (
                <ArrowRight className="hidden h-3.5 w-3.5 shrink-0 text-[#0072FF] lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* TAB 1: 12 CAPABILITIES × 6 LAYERS */}
      {activeTab === 'capabilities' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left selector: 12 Capabilities */}
          <div className="space-y-1.5 lg:col-span-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              Select Capability (1–12)
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
              {CARESPHERE_12_CAPABILITIES.map((cap) => {
                const selected = cap.id === selectedCap.id;
                return (
                  <button
                    key={cap.id}
                    type="button"
                    onClick={() => setSelectedCapId(cap.id)}
                    className={`flex min-h-[42px] w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-extrabold transition ${
                      selected
                        ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white shadow-2xs'
                        : 'border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF] hover:bg-[#F0F7FF]'
                    }`}
                  >
                    <span className="truncate">{cap.title}</span>
                    <span
                      className={`ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        selected ? 'bg-[#00C6FF] text-[#0A2B6D]' : 'bg-slate-100 text-[#0A2B6D]'
                      }`}
                    >
                      {cap.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right detail: All 6 Layers for Selected Capability */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                  {selectedCap.code} • 6-Layer Enterprise Specification
                </span>
                <h3 className="text-lg font-extrabold text-[#0A2B6D]">{selectedCap.title}</h3>
              </div>
              <Link
                to={selectedCap.route}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#0A2B6D] px-3.5 py-1.5 text-xs font-extrabold text-white transition hover:bg-[#0072FF]"
              >
                <span>Open Primary Workspace</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#00C6FF]" />
              </Link>
            </div>

            {/* Layer 5: End-to-End Business Flow Chain */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                <Workflow className="h-4 w-4 text-[#0072FF]" />
                <span>Business Flow (State &amp; Lifecycle Pipeline)</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedCap.flow.map((step, i) => (
                  <React.Fragment key={step}>
                    <span className="inline-flex items-center rounded-lg border border-[#0072FF]/30 bg-[#F0F7FF] px-2.5 py-1 text-xs font-extrabold text-[#0A2B6D]">
                      {step}
                    </span>
                    {i < selectedCap.flow.length - 1 && (
                      <ArrowRight className="h-3.5 w-3.5 text-[#0072FF]" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Layers 2, 3, 4, 6 Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Features */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Features ({selectedCap.features.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCap.features.map((f) => (
                    <span
                      key={f}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-[#0A2B6D]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Functions */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Functions ({selectedCap.functions.length})
                </div>
                <ul className="space-y-1">
                  {selectedCap.functions.map((fn) => (
                    <li key={fn} className="flex items-center gap-1.5 text-xs font-bold text-[#0A2B6D]">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#059669]" />
                      <span>{fn}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* User Interactions */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  User Interactions ({selectedCap.interactions.length})
                </div>
                <ul className="space-y-1">
                  {selectedCap.interactions.map((ui) => (
                    <li key={ui} className="flex items-center gap-1.5 text-xs font-bold text-[#0A2B6D]">
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                      <span>{ui}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technology Services */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Technology Services ({selectedCap.technology.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCap.technology.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-[#5A00D6]/30 bg-[#F5F0FF] px-2.5 py-1 text-xs font-extrabold text-[#5A00D6]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Connected Platform Modules */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Connected Live Workspaces in Platform
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCap.secondaryRoutes.map((r) => (
                  <Link
                    key={r.path + r.label}
                    to={r.path}
                    className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-[#0A2B6D] transition hover:border-[#0072FF] hover:bg-[#F0F7FF]"
                  >
                    <span>{r.label}</span>
                    <ArrowRight className="h-3 w-3 text-[#0072FF]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORLD-CLASS INTERACTION MODEL & 10-PART COMMAND CENTRE PATTERN */}
      {activeTab === 'interaction' && (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-[#0A2B6D]">
              World-Class Interaction Model — The 6 Questions Every Screen Answers
            </h3>
            <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {WORLD_CLASS_INTERACTION_QUESTIONS.map((item) => (
                <Link
                  key={item.q}
                  to={item.route}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-[#0072FF] hover:shadow-sm"
                >
                  <div>
                    <div className="text-sm font-extrabold text-[#0A2B6D] group-hover:text-[#0072FF]">
                      {item.q}
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-600">{item.answer}</p>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#0072FF]">
                    <span>Inspect Live Surface</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-[#0A2B6D]">
              World-Class Dashboard Pattern — 10 Mandatory Command Centre Components
            </h3>
            <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
              {WORLD_CLASS_DASHBOARD_COMPONENTS.map((comp, idx) => (
                <Link
                  key={comp.name}
                  to={comp.route}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition hover:border-[#0072FF] hover:bg-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0072FF]">{String(idx + 1).padStart(2, '0')}</span>
                    <LayoutGrid className="h-3.5 w-3.5 text-[#0A2B6D]" />
                  </div>
                  <div className="mt-1 text-sm font-extrabold text-[#0A2B6D]">{comp.name}</div>
                  <p className="mt-0.5 text-xs font-medium text-slate-600">{comp.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 17 MANDATORY ENTERPRISE SERVICES & WORLD-CLASS TECHNOLOGY STACK */}
      {activeTab === 'services' && (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-[#0A2B6D]">
              17 Mandatory Enterprise Platform Services
            </h3>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {MANDATORY_PLATFORM_SERVICES.map((srv) => (
                <span
                  key={srv}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#F0F7FF] px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D]"
                >
                  <Cpu className="h-3.5 w-3.5 text-[#0072FF]" />
                  <span>{srv}</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-[#0A2B6D]">
              World-Class Technology &amp; Ecosystem Integration Stack
            </h3>
            <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {WORLD_CLASS_TECH_STACK.map((stack) => (
                <div
                  key={stack.layer}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2"
                >
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                    {stack.layer}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {stack.items.map((it) => (
                      <span
                        key={it}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-[#0A2B6D]"
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 23-POINT WORLD-CLASS ENTERPRISE DEFINITION OF DONE */}
      {activeTab === 'dod' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-[#0A2B6D]">
                23-Point World-Class Enterprise Definition of Done
              </h3>
              <p className="text-xs font-medium text-slate-600">
                A capability is not complete until all 23 architectural, operational, clinical, and governance dimensions are verified.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-700">
              23 / 23 Architecture Criteria Enforced
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {DEFINITION_OF_DONE_23_CRITERIA.map((criterion) => (
              <div
                key={criterion}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-extrabold text-[#0A2B6D]"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" />
                <span>{criterion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}