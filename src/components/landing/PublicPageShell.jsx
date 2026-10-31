import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { COMPANY_LOGO_URL, COMPANY_NAME, COMPANY_SLOGAN } from '@/lib/companyBranding';

// Branded public page shell — matches the landing page gradient frame, typography and footer.
export default function PublicPageShell({ children }) {
  return (
    <div
      className="landing-page min-h-screen w-full font-elegant text-[#0A2B6D] antialiased"
      style={{
        background:
          'linear-gradient(150deg, #0A2B6D 0%, #0072FF 30%, #5A00D6 68%, #FF2E9A 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Brand Lockup Bar */}
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/25 bg-white/15 px-4 py-3 shadow-lg backdrop-blur-md">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img
              src={COMPANY_LOGO_URL}
              alt={COMPANY_NAME}
              className="h-11 w-11 shrink-0 rounded-xl border border-white/40 bg-white object-contain p-1"
            />
            <div className="min-w-0">
              <div className="font-editorial text-base sm:text-lg font-extrabold tracking-tight text-white leading-none whitespace-nowrap">
                {COMPANY_NAME}
              </div>
              <div className="mt-1 text-[10px] sm:text-[11px] font-bold text-white/90 whitespace-nowrap">
                {COMPANY_SLOGAN}
              </div>
            </div>
          </Link>
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-[#0A2B6D] shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#0072FF]" />
            <span>Home</span>
          </Link>
        </div>

        {/* Page Content */}
        <div className="rounded-3xl bg-white p-5 shadow-2xl sm:p-8">{children}</div>

        {/* Footer Strip */}
        <div className="mt-4 flex flex-col items-center justify-between gap-2 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-center text-[11px] font-bold text-white backdrop-blur-md sm:flex-row sm:text-left">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#00C6FF]" />
            <span>© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</span>
          </span>
          <a
            href="mailto:kristyleebatkin@live.com.au"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 font-extrabold text-white transition hover:bg-white/25 whitespace-nowrap"
          >
            <Mail className="h-3.5 w-3.5 shrink-0 text-[#00C6FF]" />
            <span>kristyleebatkin@live.com.au</span>
          </a>
        </div>
      </div>
    </div>
  );
}