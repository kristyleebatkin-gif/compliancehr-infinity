import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Lock, Sparkles, Activity, Globe, ArrowUpRight, ClipboardCheck,
} from 'lucide-react';

export default function EnterpriseTopTrustRibbon({ onBookDemo }) {
  return (
    <div
      role="region"
      aria-label="Enterprise Sovereign Trust and Regulatory Status Bar"
      className="w-full border-b border-white/15 text-white"
      style={{
        background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
      }}
    >
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 text-xs">
        {/* Left: Live System Telemetry & Sovereign Cloud Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>99.99% Operational SLA</span>
          </span>

          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold text-white/90">
            <Globe className="h-3.5 w-3.5 text-[#00C6FF]" />
            <span>Australian Sovereign Data Residency</span>
          </span>

          <span className="hidden lg:inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/85">
            <ShieldCheck className="h-3.5 w-3.5 text-[#00C6FF]" />
            <span>NDIS 356 Checkpoints · Aged Care Act 2024 &amp; SIRS Ready</span>
          </span>
        </div>

        {/* Right: World-Class Enterprise Quick Portals */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-auto">
          <Link
            to="/auditor-portal"
            className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white transition hover:border-[#00C6FF] hover:bg-white/15"
          >
            <ClipboardCheck className="h-3 w-3 text-[#00C6FF]" />
            <span>External Auditor Portal</span>
          </Link>

          <Link
            to="/connect"
            className="hidden sm:inline-flex items-center gap-1 rounded-md border border-[#00C6FF]/35 bg-[#0072FF]/25 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-[#0072FF]/40"
          >
            <Sparkles className="h-3 w-3 text-[#00C6FF]" />
            <span>MCP AI Gateway</span>
          </Link>

          <Link
            to="/frontline-hub"
            className="hidden xl:inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white/90 transition hover:bg-white/15"
          >
            <Activity className="h-3 w-3 text-emerald-400" />
            <span>60s Frontline Express</span>
          </Link>

          <button
            type="button"
            onClick={() => onBookDemo && onBookDemo('Executive Architecture & Security Briefing')}
            className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs transition hover:bg-sky-50"
          >
            <Lock className="h-3 w-3 text-[#0072FF]" />
            <span>Security &amp; Audit Briefing</span>
            <ArrowUpRight className="h-3 w-3 text-[#5A00D6]" />
          </button>
        </div>
      </div>
    </div>
  );
}