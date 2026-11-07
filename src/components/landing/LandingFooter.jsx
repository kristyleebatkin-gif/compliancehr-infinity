import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowUpRight } from 'lucide-react';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';

export default function LandingFooter({ onBookDemo }) {
  return (
    <footer className="border-t border-slate-200 bg-white text-[#0A2B6D]">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        {/* Full-Width Brand Banner & Summary Above Navigation Columns */}
        <div className="mb-8 flex flex-col items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5 sm:p-6 lg:flex-row">
          <Link to="/" className="inline-flex shrink-0 items-center justify-center">
            <BrandLogoLockup size="sm" theme="light" showSlogan={true} />
          </Link>

          <div className="flex flex-1 flex-col items-center lg:items-end text-center lg:text-right space-y-2">
            <p className="max-w-2xl text-sm font-semibold leading-relaxed text-[#0A2B6D]">
              Enterprise compliance, clinical governance, workforce screening, and operations management platform built for NDIS, Aged Care, and Allied Health providers.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0072FF]/30 bg-white px-3.5 py-1 text-xs font-extrabold text-[#0A2B6D] shadow-2xs">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#0072FF]" />
              <span>46 Modules · 45 Master Registers · 356 Checkpoints</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 items-start">
          {/* Structured Enterprise Navigation Columns */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-left">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
                Architectural Pillars
              </h3>
              <ul className="mt-3 space-y-2.5 text-sm font-medium text-[#0A2B6D]/80">
                <li><a href="#solution" className="hover:text-[#0072FF]">People &amp; 360° Profiles</a></li>
                <li><a href="#solution" className="hover:text-[#0072FF]">Frontline Service Delivery</a></li>
                <li><a href="#solution" className="hover:text-[#0072FF]">Compliance, Risk &amp; Audit</a></li>
                <li><a href="#solution" className="hover:text-[#0072FF]">Commercial &amp; Finance</a></li>
                <li><a href="#blueprint" className="hover:text-[#0072FF]">46-Module Register Table</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
                Core Workspaces
              </h3>
              <ul className="mt-3 space-y-2.5 text-sm font-medium text-[#0A2B6D]/80">
                <li><Link to="/dashboard" className="hover:text-[#0072FF]">Executive Command Centre</Link></li>
                <li><Link to="/compliance" className="hover:text-[#0072FF]">Compliance &amp; Audit Hub</Link></li>
                <li><Link to="/registers" className="hover:text-[#0072FF]">45 Master Registers Hub</Link></li>
                <li><Link to="/roster" className="hover:text-[#0072FF]">Smart Rostering</Link></li>
                <li><Link to="/auditor-portal" className="hover:text-[#0072FF]">External Auditor Portal</Link></li>
                <li><Link to="/connect" className="hover:text-[#0072FF]">Connect AI Agent (MCP)</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
                Access &amp; Support
              </h3>
              <ul className="mt-3 space-y-2.5 text-sm font-medium text-[#0A2B6D]/80">
                <li>
                  <button
                    type="button"
                    onClick={() => onBookDemo && onBookDemo('Executive Platform Demo')}
                    className="inline-flex items-center gap-1 font-bold text-[#0072FF] hover:underline"
                  >
                    <span>Book Executive Demo</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </li>
                <li><Link to="/register" className="font-bold text-[#5A00D6] hover:underline">Start 14-Day Free Trial</Link></li>
                <li><Link to="/login" className="hover:text-[#0072FF]">Sign In to Workspace</Link></li>
                <li><Link to="/help" className="hover:text-[#0072FF]">Help &amp; Diagnostics Centre</Link></li>
                <li>
                  <a
                    href="mailto:support@compliancehr.com.au"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A2B6D] hover:text-[#0072FF]"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                    <span>support@compliancehr.com.au</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs font-medium text-[#0A2B6D]/75">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} ComplianceHR Infinity. All rights reserved.</span>
            <span>•</span>
            <span className="font-semibold text-[#0A2B6D]">Enterprise GRC &amp; Care Operating System</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/report-complaint" className="hover:text-[#0072FF]">Public Feedback &amp; Complaints Portal</Link>
            <span>•</span>
            <Link to="/volunteer-apply" className="hover:text-[#0072FF]">Volunteer Intake Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}