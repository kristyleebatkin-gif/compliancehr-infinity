import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { COMPANY_LOGO_URL, COMPANY_NAME, COMPANY_SLOGAN } from '@/lib/companyBranding';

export default function PublicPageShell({ children }) {
  return (
    <div className="landing-page min-h-screen w-full bg-slate-50 font-body text-slate-900 antialiased">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Brand Lockup Bar */}
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img
              src={COMPANY_LOGO_URL}
              alt={COMPANY_NAME}
              className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1"
            />
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 leading-none whitespace-nowrap">
                Compliance<span className="text-indigo-600">HR Infinity</span>
              </div>
              <div className="mt-1 text-[11px] font-medium text-slate-500 whitespace-nowrap">
                {COMPANY_SLOGAN}
              </div>
            </div>
          </Link>
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-indigo-600" />
            <span>Home</span>
          </Link>
        </div>

        {/* Page Content */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">{children}</div>

        {/* Footer Strip */}
        <div className="mt-4 flex flex-col items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-xs font-medium text-slate-500 sm:flex-row sm:text-left">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
            <span>© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</span>
          </span>
          <a
            href="mailto:support@compliancehr.com.au"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 font-semibold text-slate-700 transition hover:text-indigo-600 whitespace-nowrap"
          >
            <Mail className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
            <span>support@compliancehr.com.au</span>
          </a>
        </div>
      </div>
    </div>
  );
}