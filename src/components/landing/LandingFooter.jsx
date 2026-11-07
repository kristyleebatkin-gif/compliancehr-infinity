import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowUpRight, Layers, Briefcase, PhoneCall } from 'lucide-react';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';

export default function LandingFooter({ onBookDemo }) {
  return (
    <footer className="bg-[#F8FAFC] text-[#0A2B6D]">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-4 py-2 space-y-3 pb-4">
        {/* 1. Compact White Architectural Pillars Section (Above Logo, Under Blue Dashboard) */}
        <div className="enterprise-surface rounded-2xl px-4 py-3 space-y-2.5">
          {/* Header First, One Straight Sentence, Slightly Bigger -> Sentence -> Blue/Purple Badge After */}
          <div className="space-y-0.5 border-b border-sky-300 pb-2 text-left">
            <h2 className="font-editorial text-base sm:text-lg font-black tracking-tight text-[#0A2B6D]">
              Enterprise Architectural Pillars, Core Workspaces &amp; Direct Support Directory
            </h2>
            <p className="text-xs font-semibold text-[#0A2B6D]/80">
              Navigate directly to any architectural pillar, operational register hub, or executive support channel.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[#0072FF]/50 bg-[#0072FF]/10 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                <span
                  className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#0A2B6D]"
                  style={{ boxShadow: '0 0 6px 1px rgba(255,255,255,0.9)' }}
                >
                  <ShieldCheck className="h-2.5 w-2.5 text-white" />
                </span>
                <span>46 Modules · 45 Master Registers · 356 Checkpoints</span>
              </span>
              <span className="rounded-md border border-[#5A00D6]/50 bg-[#F5F0FF] px-2 py-0.5 text-[10.5px] font-extrabold text-[#5A00D6]">
                Enterprise GRC &amp; Care Operating System
              </span>
            </div>
          </div>

          {/* Squished 3-Column Navigation Grid with Vivid Card Borders */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-left">
            <div className="rounded-lg border border-sky-300 bg-[#F8FAFC] px-3 py-2">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                <span
                  className="flex h-4 w-4 items-center justify-center rounded bg-[#0072FF]"
                  style={{ boxShadow: '0 0 6px rgba(255,255,255,0.9)' }}
                >
                  <Layers className="h-2.5 w-2.5 text-white" />
                </span>
                <span>Architectural Pillars</span>
              </div>
              <ul className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-xs font-semibold text-[#0A2B6D]/85">
                <li><a href="#solution" className="hover:text-[#0072FF]">People &amp; 360° Profiles</a></li>
                <li><a href="#solution" className="hover:text-[#0072FF]">Frontline Delivery</a></li>
                <li><a href="#solution" className="hover:text-[#0072FF]">Compliance &amp; Audit</a></li>
                <li><a href="#solution" className="hover:text-[#0072FF]">Commercial &amp; Finance</a></li>
                <li className="sm:col-span-2"><a href="#blueprint" className="hover:text-[#0072FF]">46-Module Register Table</a></li>
              </ul>
            </div>

            <div className="rounded-lg border border-sky-300 bg-[#F8FAFC] px-3 py-2">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                <span
                  className="flex h-4 w-4 items-center justify-center rounded bg-[#5A00D6]"
                  style={{ boxShadow: '0 0 6px rgba(255,255,255,0.9)' }}
                >
                  <Briefcase className="h-2.5 w-2.5 text-white" />
                </span>
                <span>Core Workspaces</span>
              </div>
              <ul className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-xs font-semibold text-[#0A2B6D]/85">
                <li><Link to="/dashboard" className="hover:text-[#0072FF]">Executive Command</Link></li>
                <li><Link to="/compliance" className="hover:text-[#0072FF]">Compliance Hub</Link></li>
                <li><Link to="/registers" className="hover:text-[#0072FF]">45 Master Registers</Link></li>
                <li><Link to="/roster" className="hover:text-[#0072FF]">Smart Rostering</Link></li>
                <li><Link to="/auditor-portal" className="hover:text-[#0072FF]">Auditor Portal</Link></li>
                <li><Link to="/connect" className="hover:text-[#0072FF]">Connect AI (MCP)</Link></li>
              </ul>
            </div>

            <div className="rounded-lg border border-sky-300 bg-[#F8FAFC] px-3 py-2">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                <span
                  className="flex h-4 w-4 items-center justify-center rounded bg-[#0A2B6D]"
                  style={{ boxShadow: '0 0 6px rgba(255,255,255,0.9)' }}
                >
                  <PhoneCall className="h-2.5 w-2.5 text-white" />
                </span>
                <span>Access &amp; Support</span>
              </div>
              <ul className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-xs font-semibold text-[#0A2B6D]/85">
                <li>
                  <button
                    type="button"
                    onClick={() => onBookDemo && onBookDemo('Executive Platform Demo')}
                    className="inline-flex items-center gap-1 font-extrabold text-[#0072FF] hover:underline"
                  >
                    <span>Book Demo</span>
                    <ArrowUpRight className="h-3 w-3 shrink-0" />
                  </button>
                </li>
                <li><Link to="/register" className="font-extrabold text-[#5A00D6] hover:underline">14-Day Free Trial</Link></li>
                <li><Link to="/login" className="hover:text-[#0072FF]">Sign In</Link></li>
                <li><Link to="/help" className="hover:text-[#0072FF]">Help &amp; Diagnostics</Link></li>
                <li className="sm:col-span-2">
                  <a
                    href="mailto:support@compliancehr.com.au"
                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#0A2B6D] hover:text-[#0072FF]"
                  >
                    <Mail className="h-3 w-3 shrink-0 text-[#0072FF]" />
                    <span>support@compliancehr.com.au</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Single-Line Copyright & Public Portals Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-sky-300 pt-2 text-[11px] font-semibold text-[#0A2B6D]/80">
            <div className="flex flex-wrap items-center gap-2">
              <span>© {new Date().getFullYear()} ComplianceHR Infinity. All rights reserved.</span>
              <span>•</span>
              <span className="font-bold text-[#0A2B6D]">Enterprise GRC &amp; Care Operating System</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/report-complaint" className="font-bold text-[#0072FF] hover:underline">
                Public Feedback &amp; Complaints Portal
              </Link>
              <span>•</span>
              <Link to="/volunteer-apply" className="font-bold text-[#5A00D6] hover:underline">
                Volunteer Intake Portal
              </Link>
            </div>
          </div>
        </div>

        {/* 2. FINAL LOGO SECTION — LAST ON THE PAGE WITH ENLARGED (+1CM) LOGO & ONE STRAIGHT LINE UNDER SLOGAN */}
        <div
          className="overflow-hidden rounded-2xl p-[2.5px] shadow-xl"
          style={{
            background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 30%, #A855F7 65%, #FF2E9A 100%)',
          }}
        >
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-[14px] bg-[#0A2B6D]/95 backdrop-blur-sm px-4 py-3.5 text-center text-white">
            <Link to="/" className="inline-flex items-center justify-center">
              <BrandLogoLockup size="lg" theme="dark" showSlogan={true} />
            </Link>

            {/* "Enterprise..." and "Built for..." together on ONE straight line directly under the slogan */}
            <p className="w-full overflow-x-auto text-[11px] sm:text-xs font-extrabold tracking-tight text-white lg:whitespace-nowrap">
              <span className="text-[#00C6FF]">
                Enterprise Compliance, Clinical Governance, Workforce Screening &amp; Operations Platform
              </span>
              <span className="mx-1.5 text-[#A855F7]">·</span>
              <span className="text-white/95">
                Built for Australian NDIS, Strengthened Aged Care, and Allied Health providers — one unified source of truth across every register, profile, and audit checkpoint.
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}