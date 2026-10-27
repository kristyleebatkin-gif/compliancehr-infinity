import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Calendar } from 'lucide-react';

const NAV_LINKS = [
  ['Solution', '#solution'],
  ['Product', '#showcase'],
  ['Why Us', '#why-choose'],
  ['How It Works', '#how-it-works'],
  ['46 Modules', '#blueprint'],
  ['Pricing', '#pricing'],
  ['FAQ', '#faq'],
];

export default function LandingNav({ onBookDemo }) {
  const [open, setOpen] = useState(false);

  return (
    <header
      id="top-landing"
      className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-3 min-w-0"
          aria-label="ComplianceHR Infinity home"
        >
          <img
            src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/6bf497716_generated_image.png"
            alt="ComplianceHR Infinity"
            className="h-11 w-12 shrink-0 object-contain"
          />
          <div className="min-w-0 text-left">
            <div className="font-editorial text-lg sm:text-xl font-extrabold tracking-tight text-[#0A2B6D] leading-none">
              Compliance
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                HR
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                Infinity
              </span>
            </div>
            <div className="mt-1 hidden sm:block text-[11px] font-bold text-[#0A2B6D]/70">
              Complete Control. Greater Confidence. Brighter Success.
            </div>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-6">
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-sm font-bold text-[#0A2B6D] transition hover:text-[#0072FF]"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-sm font-bold text-[#0A2B6D] transition hover:bg-slate-100"
          >
            Sign In
          </Link>

          <button
            type="button"
            onClick={() => onBookDemo && onBookDemo('Book a Personal Demo')}
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] bg-white px-4 py-2 text-sm font-extrabold text-[#0A2B6D] transition hover:bg-[#0A2B6D] hover:text-white"
          >
            <Calendar className="h-4 w-4 text-[#0072FF]" />
            <span>Book a Demo</span>
          </button>

          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:opacity-95"
            style={{
              background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
            }}
          >
            <span>Start Free Trial</span>
            <ArrowRight className="h-4 w-4 text-white" />
          </Link>

          <button
            type="button"
            className="xl:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-[#0A2B6D]"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Mobile navigation"
          className="xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2"
        >
          <div className="grid grid-cols-2 gap-2">
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-sm font-bold text-[#0A2B6D]"
              >
                {label}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                if (onBookDemo) onBookDemo('Book a Personal Demo');
              }}
              className="flex-1 rounded-xl border-2 border-[#0A2B6D] bg-white px-4 py-2.5 text-center text-sm font-extrabold text-[#0A2B6D]"
            >
              Book a Demo
            </button>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-sm font-bold text-[#0A2B6D]"
            >
              Sign In
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}