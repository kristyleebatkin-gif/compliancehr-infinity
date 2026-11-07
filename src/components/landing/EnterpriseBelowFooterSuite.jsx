import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Lock, Cpu, CheckCircle2, ArrowUp, Sparkles, FileCheck2, Building2, Activity, Layers, Download,
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
    detail: '15-Role Access Matrix · Explicit Participant Audit Consent Gate',
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

  const exportAttestationCsv = () => {
    const headers = ['Attestation Pillar', 'Specification'];
    const rows = [
      headers.join(','),
      ...ATTESTATION_BADGES.map((b) => `"${b.title}","${b.detail}"`),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ComplianceHR-Infinity-Enterprise-Attestation.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      aria-label="Enterprise Sovereign Architecture and Regulatory Attestation Suite"
      className="mx-auto w-full max-w-[1440px] px-3 sm:px-4 pt-1 pb-2"
    >
      <div
        className="overflow-hidden rounded-2xl p-[2.5px] shadow-xl"
        style={{
          background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 30%, #A855F7 65%, #FF2E9A 100%)',
        }}
      >
        <div
          className="rounded-[14px] px-4 py-4 sm:px-5 text-white space-y-3"
          style={{
            background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
          }}
        >
          {/* Row 1: Header First Spread Full Line -> Sentence Full Line -> Enterprise Badge & Request/Back-to-Top Under Sentence */}
          <div className="space-y-1.5 border-b border-[#00C6FF]/55 pb-3 text-left">
            <h2 className="w-full text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-white lg:whitespace-nowrap">
              Built on Modern Enterprise Technology for Zero-Surprise Audits
            </h2>

            <p className="w-full text-xs sm:text-[13px] font-semibold leading-snug text-white/90">
              Every module is engineered with Row-Level Security, server-verified audit logging, real-time statutory countdown clocks, and one-click evidence packs across all 46 connected workspaces.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[#00C6FF]/70 bg-[#0072FF]/25 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15"
                  style={{ boxShadow: '0 0 8px 1px rgba(255,255,255,0.9)' }}
                >
                  <Sparkles className="h-2.5 w-2.5 text-white" />
                </span>
                <span>Enterprise GRC, Clinical Governance &amp; AI Operating Standard</span>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onBookDemo && onBookDemo('Enterprise Architecture Walkthrough')}
                  className="inline-flex h-7 items-center justify-center gap-1.5 rounded-lg border border-white/40 px-3 text-[11px] font-extrabold text-white shadow-md transition hover:opacity-95"
                  style={{
                    background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                  }}
                >
                  <Activity className="h-3.5 w-3.5 text-white" style={{ filter: 'drop-shadow(0 0 4px #FFFFFF)' }} />
                  <span>Request Architecture Walkthrough</span>
                </button>

                <button
                  type="button"
                  onClick={scrollToTop}
                  className="inline-flex h-7 items-center justify-center gap-1.5 rounded-lg border border-[#00C6FF]/70 bg-white/10 px-3 text-[11px] font-bold text-white transition hover:bg-white/20"
                >
                  <ArrowUp className="h-3.5 w-3.5 text-white" style={{ filter: 'drop-shadow(0 0 4px #FFFFFF)' }} />
                  <span>Back to Top</span>
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: 6 Enterprise Attestation & Technology Pillars with White Lights in Each Symbol */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {ATTESTATION_BADGES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-2.5 rounded-xl border border-[#00C6FF]/60 bg-[#081018]/75 p-2.5 transition hover:border-[#00C6FF]"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/60 bg-[#0072FF]/30"
                    style={{
                      boxShadow: '0 0 10px 1px rgba(255, 255, 255, 0.75), inset 0 0 6px rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <Icon
                      className="h-4 w-4 text-white"
                      style={{ filter: 'drop-shadow(0 0 4px #FFFFFF)' }}
                    />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-white">{item.title}</span>
                      <CheckCircle2
                        className="h-3.5 w-3.5 shrink-0 text-white"
                        style={{ filter: 'drop-shadow(0 0 4px #FFFFFF)' }}
                      />
                    </div>
                    <p className="text-[11px] leading-snug text-white/80">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Row 3: Bottom Section — Line 1: Australian Privacy Info on One Line + Small Space + Instant Module Launch + Export Neatly Above · Lines 2 & 3: 8 Instant Module Names on Two Bottom Lines */}
          <div className="rounded-xl border border-[#00C6FF]/60 bg-[#081018]/75 p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#00C6FF]/45 pb-2">
              <div className="flex flex-wrap items-center gap-3 min-w-0">
                <span className="text-[11px] font-semibold text-white/90 whitespace-nowrap">
                  Australian Privacy Principles (APP 1–13) · Notifiable Data Breaches (NDB) Scheme Aligned
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#00C6FF] whitespace-nowrap">
                  · Instant Module Launch (8):
                </span>
              </div>

              <button
                type="button"
                onClick={exportAttestationCsv}
                className="inline-flex h-6 items-center gap-1.5 rounded-md border border-[#00C6FF] bg-[#0072FF]/35 px-2.5 text-[10.5px] font-extrabold text-white transition hover:bg-[#0072FF]"
              >
                <Download className="h-3 w-3 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                <span>Export Attestation CSV</span>
              </button>
            </div>

            {/* 8 Instant Module Names on the Two Bottom Lines (4 per row) */}
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {TECHNOLOGY_QUICK_MODULES.map((m) => (
                <Link
                  key={m.path}
                  to={m.path}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-[#00C6FF]/60 bg-white/10 px-2.5 py-1 text-center text-[11px] font-bold text-white transition hover:border-white hover:bg-white hover:text-[#0A2B6D] truncate"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-white"
                    style={{ boxShadow: '0 0 6px 1px #FFFFFF' }}
                  />
                  <span className="truncate">{m.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}