import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowUpRight } from 'lucide-react';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';

export default function LandingFooter({ onBookDemo }) {
  return (
    <footer className="border-t border-slate-200 bg-white text-[#0A2B6D]">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Brand Column — Centred Logo + Centred Slogan + Single-Line 46 Connected Modules Pill */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3.5">
            <Link to="/" className="inline-flex flex-col items-center justify-center text-center">
              <BrandLogoLockup size="md" theme="light" showSlogan={true} />
            </Link>

            <p className="max-w-md text-xs sm:text-sm leading-relaxed text-[#0A2B6D]/75">
              The complete compliance, workforce, participant, and operations management platform built for NDIS &amp; Aged Care Support providers.
            </p>

            {/* 46 Connected Modules on One Single Line */}
            <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-[#0072FF]/25 bg-[#0072FF]/5 px-3 py-1.5 text-center text-[10px] xl:text-[11px] font-extrabold text-[#0072FF]">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#5A00D6]" />
              <span>Platform Modules · NDIS Reference Checkpoints · Compliance Categories</span>
            </div>
          </div>

          {/* Platform Links — Sized so Get Started, Start Free Trial & Email Fit Cleanly on One Line */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 lg:col-span-8 text-left">
            <div className="sm:col-span-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Platform Pillars
              </h3>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm font-semibold text-[#0A2B6D]/80">
                <li><a href="#solution" className="whitespace-nowrap hover:text-[#0072FF]">People &amp; Profiles</a></li>
                <li><a href="#solution" className="whitespace-nowrap hover:text-[#0072FF]">Service Delivery</a></li>
                <li><a href="#solution" className="whitespace-nowrap hover:text-[#0072FF]">Compliance &amp; Risk</a></li>
                <li><a href="#solution" className="whitespace-nowrap hover:text-[#0072FF]">Business Operations</a></li>
                <li><a href="#blueprint" className="whitespace-nowrap hover:text-[#0072FF]">Explore All 46 Modules</a></li>
              </ul>
            </div>

            <div className="sm:col-span-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Quick Access
              </h3>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm font-semibold text-[#0A2B6D]/80">
                <li><Link to="/dashboard" className="whitespace-nowrap hover:text-[#0072FF]">Live Executive Dashboard</Link></li>
                <li><Link to="/compliance" className="whitespace-nowrap hover:text-[#0072FF]">Compliance Hub</Link></li>
                <li><Link to="/roster" className="whitespace-nowrap hover:text-[#0072FF]">Smart Rostering</Link></li>
                <li><Link to="/auditor-portal" className="whitespace-nowrap hover:text-[#0072FF]">External Auditor Portal</Link></li>
                <li><Link to="/connect" className="whitespace-nowrap hover:text-[#0072FF]">Connect AI Assistant (MCP)</Link></li>
                <li><a href="#pricing" className="whitespace-nowrap hover:text-[#0072FF]">Pricing &amp; Packages</a></li>
              </ul>
            </div>

            <div className="sm:col-span-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Get Started &amp; Support
              </h3>
              <ul className="mt-3 space-y-2.5 text-xs sm:text-sm font-semibold text-[#0A2B6D]/80">
                <li>
                  <button
                    type="button"
                    onClick={() => onBookDemo && onBookDemo('Book a Personal Demo')}
                    className="inline-flex items-center gap-1 whitespace-nowrap font-extrabold text-[#0072FF] hover:underline"
                  >
                    <span>Book a Personal Demo</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-extrabold text-white shadow-2xs transition hover:opacity-95"
                    style={{
                      background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                    }}
                  >
                    <span>Start Free Trial (14 Days)</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-white" />
                  </Link>
                </li>
                <li><Link to="/login" className="whitespace-nowrap hover:text-[#0072FF]">Sign In to Workspace</Link></li>
                <li><Link to="/help" className="whitespace-nowrap hover:text-[#0072FF]">Help &amp; Support Centre</Link></li>
                <li>
                  <a
                    href="mailto:support@compliancehr.com.au"
                    className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-lg border border-[#5A00D6]/25 bg-[#5A00D6]/5 px-2.5 py-1.5 text-[11px] xl:text-xs font-extrabold text-[#5A00D6] hover:bg-[#5A00D6]/10"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-[#FF2E9A]" />
                    <span className="break-all sm:break-normal">support@compliancehr.com.au</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-5 text-xs font-semibold text-[#0A2B6D]/75">
          <div className="flex flex-wrap items-center justify-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} ComplianceHR Infinity. All rights reserved.</span>
            <span>•</span>
            <span className="font-bold text-[#0A2B6D]">ComplianceHR Enterprise Support</span>
            <span>•</span>
            <a
              href="mailto:support@compliancehr.com.au"
              className="font-extrabold text-[#5A00D6] hover:underline whitespace-nowrap"
            >
              support@compliancehr.com.au
            </a>
          </div>
          <div className="flex items-center gap-4 whitespace-nowrap">
            <Link to="/report-complaint" className="hover:text-[#0072FF]">Public Feedback Portal</Link>
            <span>•</span>
            <Link to="/volunteer-apply" className="hover:text-[#0072FF]">Volunteer Application</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}