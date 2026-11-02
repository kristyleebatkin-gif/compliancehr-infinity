import React from 'react';
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Layers, RefreshCw, XCircle } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const PAIN_POINTS = [
  'Disconnected spreadsheets for staff screening, rosters, and NDIS plan budgets',
  'Duplicate data entry across intake forms, HR files, shift notes, and invoicing',
  'Missed credential expiries and last-minute stress before NDIS Commission audits',
  'Siloed incident reports with no automated link to risk registers or continuous improvement',
];

const UNIFIED_OUTCOMES = [
  'Single source of truth across all 46 modules—enter once, sync everywhere automatically',
  'Automated 100-point worker screening gates that block unscreened shifts before they happen',
  'Live 356-checkpoint NDIS audit readiness with 1-click evidence & board reporting packs',
  'Statutory 24-hour & 5-day reportable incident timers linked directly to CAPA & QMS',
];

export default function LandingProblemSection() {
  return (
    <section className="w-full py-6">
      <Reveal className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 lg:p-12 shadow-lg">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FF2E9A]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#FF2E9A]">
            <AlertTriangle className="h-3.5 w-3.5" />
            Why Legacy Systems Fail NDIS Providers
          </span>

          <h2 className="mt-4 font-editorial text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A2B6D]">
            Most Compliance Systems Create More Work
          </h2>

          <p className="mt-4 text-base sm:text-lg font-medium leading-relaxed text-[#0A2B6D]/80">
            Spreadsheets, disconnected software, duplicate data entry and audit stress increase risk and consume valuable time.
          </p>

          <p className="mt-3 text-base sm:text-lg font-extrabold leading-relaxed bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
            ComplianceHR Infinity brings everything together into one connected platform.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: The Fragmented Old Way */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-6 sm:p-7 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF2E9A] text-white">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF2E9A]">
                  The Disconnected Way
                </span>
                <h3 className="text-lg font-extrabold text-[#0A2B6D]">
                  Fragmented Spreadsheets &amp; Software Silos
                </h3>
              </div>
            </div>

            <ul className="mt-5 space-y-3">
              {PAIN_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 rounded-xl border border-rose-200/70 bg-white p-3.5 text-sm font-semibold text-[#0A2B6D]"
                >
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF2E9A]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: The ComplianceHR Infinity Connected Platform */}
          <div
            className="rounded-2xl p-[2px] shadow-md"
            style={{
              background: 'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
            }}
          >
            <div className="h-full rounded-[14px] bg-white p-6 sm:p-7 text-left">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{
                      background: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 100%)',
                    }}
                  >
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                      The ComplianceHR Infinity Way
                    </span>
                    <h3 className="text-lg font-extrabold text-[#0A2B6D]">
                      One Connected 46-Module Super-Platform
                    </h3>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#0072FF]/10 px-3 py-1 text-xs font-extrabold text-[#0072FF]">
                  <RefreshCw className="h-3 w-3" />
                  Live Sync
                </span>
              </div>

              <ul className="mt-5 space-y-3">
                {UNIFIED_OUTCOMES.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-[#0072FF]/20 bg-slate-50/60 p-3.5 text-sm font-bold text-[#0A2B6D]"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0072FF]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}