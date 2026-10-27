import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function LandingFooter({ onBookDemo }) {
  return (
    <footer className="border-t border-slate-200 bg-white text-[#0A2B6D]">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-5 text-left space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/6bf497716_generated_image.png"
                alt="ComplianceHR Infinity logo"
                className="h-12 w-14 object-contain"
              />
              <div>
                <div className="font-editorial text-2xl font-extrabold tracking-tight text-[#0A2B6D]">
                  Compliance
                  <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                    HR
                  </span>{' '}
                  <span className="bg-gradient-to-r from-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                    Infinity
                  </span>
                </div>
                <div className="text-xs font-bold text-[#0A2B6D]/75">
                  Complete Control. Greater Confidence. Brighter Success.
                </div>
              </div>
            </Link>

            <p className="max-w-md text-sm leading-relaxed text-[#0A2B6D]/75">
              The complete compliance, workforce, participant, and operations management platform built for NDIS providers and disability support organisations.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#0072FF]/20 bg-[#0072FF]/5 px-3.5 py-1.5 text-xs font-extrabold text-[#0072FF]">
              <ShieldCheck className="h-4 w-4 text-[#5A00D6]" />
              <span>46 Connected Modules · 356 NDIS Checkpoints · 17 Categories</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 text-left">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Platform Pillars
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm font-semibold text-[#0A2B6D]/80">
                <li><a href="#solution" className="hover:text-[#0072FF]">People &amp; Profiles</a></li>
                <li><a href="#solution" className="hover:text-[#0072FF]">Service Delivery</a></li>
                <li><a href="#solution" className="hover:text-[#0072FF]">Compliance &amp; Risk</a></li>
                <li><a href="#solution" className="hover:text-[#0072FF]">Business Operations</a></li>
                <li><a href="#blueprint" className="hover:text-[#0072FF]">Explore All 46 Modules</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Quick Access
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm font-semibold text-[#0A2B6D]/80">
                <li><Link to="/dashboard" className="hover:text-[#0072FF]">Executive Dashboard</Link></li>
                <li><Link to="/compliance" className="hover:text-[#0072FF]">Compliance Hub</Link></li>
                <li><Link to="/roster" className="hover:text-[#0072FF]">Smart Rostering</Link></li>
                <li><Link to="/auditor-portal" className="hover:text-[#0072FF]">External Auditor Portal</Link></li>
                <li><a href="#pricing" className="hover:text-[#0072FF]">Pricing &amp; Packages</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Get Started &amp; Support
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm font-semibold text-[#0A2B6D]/80">
                <li>
                  <button
                    type="button"
                    onClick={() => onBookDemo && onBookDemo('Book a Personal Demo')}
                    className="inline-flex items-center gap-1 font-bold text-[#0072FF] hover:underline"
                  >
                    <span>Book a Personal Demo</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </li>
                <li><Link to="/register" className="hover:text-[#0072FF]">Start 14-Day Free Trial</Link></li>
                <li><Link to="/login" className="hover:text-[#0072FF]">Sign In to Workspace</Link></li>
                <li><Link to="/help" className="hover:text-[#0072FF]">Help &amp; Support Centre</Link></li>
                <li>
                  <a
                    href="mailto:kristyleebatkin@live.com.au"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A00D6] hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>kristyleebatkin@live.com.au</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs font-semibold text-[#0A2B6D]/70">
          <div>
            © {new Date().getFullYear()} ComplianceHR Infinity. All rights reserved. Lead Developer: Kristy Lee Whelan.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/report-complaint" className="hover:text-[#0072FF]">Public Feedback Portal</Link>
            <span>•</span>
            <Link to="/volunteer-apply" className="hover:text-[#0072FF]">Volunteer Application</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}