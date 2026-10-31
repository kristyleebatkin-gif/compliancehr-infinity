import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function LandingFooter({ onBookDemo }) {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-900">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3.5">
            <Link to="/" className="inline-flex flex-col sm:flex-row items-center gap-3">
              <img
                src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/6bf497716_generated_image.png"
                alt="ComplianceHR Infinity logo"
                className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-white p-1 object-contain"
              />
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="text-xl font-extrabold tracking-tight text-slate-900 leading-none whitespace-nowrap">
                  Compliance<span className="text-indigo-600">HR Infinity</span>
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500 whitespace-nowrap">
                  Complete Control. Greater Confidence. Brighter Success.
                </div>
              </div>
            </Link>

            <p className="max-w-md text-xs sm:text-sm leading-relaxed text-slate-600">
              The complete compliance, workforce, participant, and operations management platform built for NDIS &amp; Aged Care Support providers.
            </p>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 whitespace-nowrap">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
              <span>46 Connected Modules · 356 NDIS Checkpoints · 17 Categories</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 lg:col-span-8 text-left">
            <div className="sm:col-span-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Platform Pillars
              </h3>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm font-medium text-slate-600">
                <li><a href="#solution" className="whitespace-nowrap hover:text-indigo-600">People &amp; Profiles</a></li>
                <li><a href="#solution" className="whitespace-nowrap hover:text-indigo-600">Service Delivery</a></li>
                <li><a href="#solution" className="whitespace-nowrap hover:text-indigo-600">Compliance &amp; Risk</a></li>
                <li><a href="#solution" className="whitespace-nowrap hover:text-indigo-600">Business Operations</a></li>
                <li><a href="#blueprint" className="whitespace-nowrap hover:text-indigo-600">Explore All 46 Modules</a></li>
              </ul>
            </div>

            <div className="sm:col-span-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Quick Access
              </h3>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm font-medium text-slate-600">
                <li><Link to="/dashboard" className="whitespace-nowrap hover:text-indigo-600">Live Executive Dashboard</Link></li>
                <li><Link to="/compliance" className="whitespace-nowrap hover:text-indigo-600">Compliance Centre</Link></li>
                <li><Link to="/roster" className="whitespace-nowrap hover:text-indigo-600">Smart Rostering</Link></li>
                <li><Link to="/auditor-portal" className="whitespace-nowrap hover:text-indigo-600">External Auditor Portal</Link></li>
                <li><a href="#pricing" className="whitespace-nowrap hover:text-indigo-600">Pricing &amp; Packages</a></li>
              </ul>
            </div>

            <div className="sm:col-span-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Get Started &amp; Support
              </h3>
              <ul className="mt-3 space-y-2.5 text-xs sm:text-sm font-medium text-slate-600">
                <li>
                  <button
                    type="button"
                    onClick={() => onBookDemo && onBookDemo('Book a Personal Demo')}
                    className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-indigo-600 hover:underline"
                  >
                    <span>Book a Personal Demo</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-indigo-700"
                  >
                    <span>Start Free Trial (14 Days)</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-white" />
                  </Link>
                </li>
                <li><Link to="/login" className="whitespace-nowrap hover:text-indigo-600">Sign In to Workspace</Link></li>
                <li><Link to="/help" className="whitespace-nowrap hover:text-indigo-600">Help &amp; Support Centre</Link></li>
                <li>
                  <a
                    href="mailto:support@compliancehr.com.au"
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                    <span>support@compliancehr.com.au</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-5 text-xs font-medium text-slate-500">
          <div>
            <span>© {new Date().getFullYear()} ComplianceHR Infinity. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 whitespace-nowrap">
            <Link to="/report-complaint" className="hover:text-indigo-600">Public Feedback Portal</Link>
            <span>•</span>
            <Link to="/volunteer-apply" className="hover:text-indigo-600">Volunteer Application</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}