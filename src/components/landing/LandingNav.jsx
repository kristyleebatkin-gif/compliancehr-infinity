import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Calendar } from 'lucide-react';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';

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
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-3 py-2 sm:flex-nowrap sm:px-5">
        <Link
          to="/"
          className="inline-flex shrink-0 flex-col items-center justify-center text-center"
          aria-label="ComplianceHR Infinity home"
        >
          <BrandLogoLockup size="md" theme="light" showSlogan={true} />
        </Link>

        <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-2.5 2xl:gap-3.5">
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="whitespace-nowrap text-[11px] xl:text-xs font-extrabold text-[#0A2B6D] transition hover:text-[#0072FF]"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border-2 border-[#0A2B6D] bg-white px-2.5 py-1.5 text-[11px] xl:text-xs font-extrabold text-[#0A2B6D] shadow-2xs transition hover:border-[#0072FF] hover:text-[#0072FF]"
          >
            Dashboard
          </Link>
          <Link
            to="/connect"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border-2 border-[#5A00D6] bg-white px-2.5 py-1.5 text-[11px] xl:text-xs font-extrabold text-[#5A00D6] shadow-2xs transition hover:bg-[#5A00D6] hover:text-white"
          >
            Connect AI
          </Link>
          <Link
            to="/universal-storage"
            className="hidden 2xl:inline-flex items-center justify-center whitespace-nowrap rounded-lg border-2 border-[#5A00D6] bg-[#F5F0FF] px-2.5 py-1.5 text-[11px] xl:text-xs font-extrabold text-[#5A00D6] shadow-2xs transition hover:bg-[#5A00D6] hover:text-white"
          >
            Universal Storage Hub
          </Link>
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center justify-center whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] xl:text-xs font-extrabold text-[#0A2B6D] transition hover:text-[#0072FF]"
          >
            Sign In
          </Link>

          <button
            type="button"
            onClick={() => onBookDemo && onBookDemo('Book a Personal Demo')}
            className="hidden xl:inline-flex items-center gap-1 whitespace-nowrap rounded-lg border-2 border-[#0A2B6D] bg-white px-3 py-1.5 text-[11px] xl:text-xs font-extrabold text-[#0A2B6D] transition hover:bg-[#0A2B6D] hover:text-white"
          >
            <Calendar className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
            <span>Book a Demo</span>
          </button>

          <Link
            to="/register"
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[11px] xl:text-xs font-extrabold text-white shadow-sm transition hover:opacity-95"
            style={{
              background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
            }}
          >
            <span>Start Free Trial</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white" />
          </Link>

          <button
            type="button"
            className="xl:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-[#0A2B6D]"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Direct 1-Click Workspace & Route Bar visible across Desktop, Tablet & Mobile */}
      <div className="border-t border-slate-200/80 bg-[#F5F0FF]/80 px-3 py-1.5 sm:px-5">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
            Direct Workspace Routes:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              ['Dashboard', '/dashboard'],
              ['45 Master Registers Hub', '/registers'],
              ['User Success & Evidence Hub', '/user-success'],
              ['Record Intelligence Hub', '/record-intelligence'],
              ['Frontline Rapid Hub', '/frontline-hub'],
              ['Workforce Presence & Safety', '/workforce-presence'],
              ['Universal Storage Hub', '/universal-storage'],
              ['Document Vault', '/documents'],
              ['Company Safe', '/company-safe'],
              ['Compliance Centre', '/compliance'],
              ['Operations Centre', '/operations-centre'],
              ['Connect AI Agent', '/connect'],
            ].map(([label, path]) => (
              <Link
                key={path}
                to={path}
                className="rounded-md border border-[#0A2B6D]/30 bg-white px-2 py-0.5 text-[10.5px] font-extrabold text-[#0A2B6D] transition hover:border-[#0072FF] hover:bg-[#0A2B6D] hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Mobile navigation"
          className="xl:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2"
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