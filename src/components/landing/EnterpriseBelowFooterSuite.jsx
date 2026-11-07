import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Lock, Cpu, CheckCircle2, ArrowUp, Sparkles, FileCheck2, Building2, Activity, Layers,
} from 'lucide-react';

const ATTESTATION_BADGES = [
  {
    title: 'NDIS Practice Standards',
    detail: 'Core & Supplementary Modules · 356 Checkpoints Mapped',
    icon: ShieldCheck,
  },
  {
    title: 'Strengthened Aged Care Standards',
    detail: 'Aged Care Act 2024 · Priority 1 (24h) & Priority 2 (30d) SIRS',
    icon: Building2,
  },
  {
    title: 'Zero-Trust Row-Level Security',
    detail: '13-Role Access Matrix · Explicit Participant Audit Consent Gate',
    icon: Lock,
  },
  {
    title: 'AI Governance & MCP Protocol',
    detail: 'Read-Only OAuth 2.0 MCP Server · 7-Point Copilot Verification',
    icon: Cpu,
  },
  {
    title: 'Immutable Evidence Ledger',
    detail: 'Server-Verified Audit Trail · 7-Year Statutory Retention',
    icon: FileCheck2,
  },
  {
    title: 'PRODA & Single Touch Payroll Ready',
    detail: 'Automated Line-Item Claim Exports & Shift-to-Invoice Reconciliation',
    icon: Layers,
  },
];

const TECHNOLOGY_QUICK_MODULES = [
  { label: 'Command Centre', path: '/dashboard' },
  { label: 'Operations Dispatch', path: '/operations-centre' },
  { label: '45 Master Registers', path: '/registers' },
  { label: 'Auditor Pre-Flight & Portal', path: '/auditor-portal' },
  { label: '60s Frontline Hub', path: '/frontline-hub' },
  { label: '7-Point AI Copilot Suite', path: '/assistant' },
  { label: 'Governance Layer', path: '/governance' },
  { label: 'PRODA Invoicing Centre', path: '/invoicing' },
];

export default function EnterpriseBelowFooterSuite({ onBookDemo }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      aria-label="Enterprise Sovereign Architecture and Regulatory Attestation Suite"
      className="border-t-2 border-[#0A2B6D] text-white"
      style={{
        background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
      }}
    >
      {/* Top Multi-Stop Accent Line */}
      <div
        className="h-1 w-full"
        style={{
          background: 'linear-gradient(90deg, #00C6FF 0%, #0072FF 35%, #5A00D6 70%, #FF2E9A 100%)',
        }}
      />

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Row 1: World-Class Technology & Regulatory Attestation Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/15 pb-6">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#00C6FF]/40 bg-[#0072FF]/20 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider text-[#00C6FF]">
              <Sparkles className="h-3.5 w-3.5" />
              Enterprise GRC, Clinical Governance &amp; AI Operating Standard
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
              Built on Modern Enterprise Technology for Zero-Surprise Audits
            </h2>
            <p className="max-w-3xl text-xs sm:text-sm text-white/80">
              Every module is engineered with Row-Level Security, server-verified audit logging, real-time statutory countdown clocks, and one-click evidence packs.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-2">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20"
            >
              <ArrowUp className="h-4 w-4 text-[#00C6FF]" />
              <span>Back to Top</span>
            </button>

            <button
              type="button"
              onClick={() => onBookDemo && onBookDemo('Enterprise Architecture Walkthrough')}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:opacity-95"
              style={{
                background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
              }}
            >
              <Activity className="h-4 w-4" />
              <span>Request Architecture Walkthrough</span>
            </button>
          </div>
        </div>

        {/* Row 2: 6 Enterprise Attestation & Technology Pillars */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ATTESTATION_BADGES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-4 transition hover:border-[#00C6FF]/50 hover:bg-white/10"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#00C6FF]/30 bg-[#0072FF]/20">
                  <Icon className="h-4 w-4 text-[#00C6FF]" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-white">{item.title}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  </div>
                  <p className="text-xs leading-relaxed text-white/75">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Row 3: Direct Module Launch Matrix & Sovereign Legal Attestation */}
        <div className="flex flex-col gap-4 rounded-xl border border-white/15 bg-white/5 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-extrabold uppercase tracking-wider text-[#00C6FF]">
              Instant Module Launch:
            </span>
            {TECHNOLOGY_QUICK_MODULES.map((m) => (
              <Link
                key={m.path}
                to={m.path}
                className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-bold text-white transition hover:border-[#00C6FF] hover:bg-white hover:text-[#0A2B6D]"
              >
                {m.label}
              </Link>
            ))}
          </div>

          <div className="text-xs font-semibold text-white/75 lg:text-right">
            Australian Privacy Principles (APP 1–13) · Notifiable Data Breaches (NDB) Scheme Aligned
          </div>
        </div>
      </div>
    </section>
  );
}