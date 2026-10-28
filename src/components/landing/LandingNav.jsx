import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Calendar } from 'lucide-react';

const NAV_LINKS = [
  ['Dashboard', '#showcase'],
  ['Pillars', '#solution'],
  ['Why Us', '#why-choose'],
  ['How It Works', '#how-it-works'],
  ['Reviews', '#testimonials'],
  ['Pricing', '#pricing'],
  ['46 Modules', '#blueprint'],
  ['FAQ', '#faq'],
];

export default function LandingNav({ onBookDemo }) {
  const [open, setOpen] = useState(false);

  return (
    <header
      id="top-landing"
      className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs"
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-3 py-1.5 sm:px-5">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="ComplianceHR Infinity home"
        >
          <img
            src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/6bf497716_generated_image.png"
            alt="ComplianceHR Infinity"
            className="h-8 w-9 shrink-0 object-contain"
          />
          <div className="flex flex-col items-center text-center">
            <div className="font-editorial text-base sm:text-lg font-extrabold tracking-tight text-[#0A2B6D] leading-none whitespace-nowrap">
              Compliance
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                HR
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                Infinity
              </span>
            </div>
            <div className="mt-0.5 text-[8.5px] sm:text-[9px] font-extrabold text-[#0A2B6D]/80 text-center whitespace-nowrap">
              Complete Control. Greater Confidence. Brighter Success.
            </div>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-3 xl:gap-4">
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="whitespace-nowrap text-xs font-extrabold text-[#0A2B6D] transition hover:text-[#0072FF]"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center justify-center whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-[#0A2B6D] transition hover:bg-slate-100"
          >
            Sign In
          </Link>

          <button
            type="button"
            onClick={() => onBookDemo && onBookDemo('Book a Personal Demo')}
            className="hidden md:inline-flex items-center gap-1 whitespace-nowrap rounded-lg border-2 border-[#0A2B6D] bg-white px-2.5 py-1.5 text-xs font-extrabold text-[#0A2B6D] transition hover:bg-[#0A2B6D] hover:text-white"
          >
            <Calendar className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
            <span>Book a Demo</span>
          </button>

          <Link
            to="/register"
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-extrabold text-white shadow-sm transition hover:opacity-95"
            style={{
              background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
            }}
          >
            <span>Start Free Trial</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white" />
          </Link>

          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-[#0A2B6D]"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2"
        >
          <div className="grid grid-cols-2 gap-1.5">
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs font-extrabold text-[#0A2B6D]"
              >
                {label}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                if (onBookDemo) onBookDemo('Book a Personal Demo');
              }}
              className="flex-1 rounded-lg border-2 border-[#0A2B6D] bg-white px-3 py-2 text-center text-xs font-extrabold text-[#0A2B6D]"
            >
              Book a Demo
            </button>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-extrabold text-[#0A2B6D]"
            >
              Sign In
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}