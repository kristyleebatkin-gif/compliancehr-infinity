import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, Compass, Zap, Cpu, Activity, ShieldCheck, Building2,
  ClipboardCheck, Layers, Sparkles, DollarSign, BookOpen,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import QuickAppBar from '@/components/QuickAppBar';

// 12 Listed Features — 6 on each line, CIRCULAR feature icons + crisp WHITE background behind dark blue writing!
const LISTED_FEATURES = [
  { label: '4-Step Quick Start', href: '#quick-start', icon: Compass, color: '#0072FF' },
  { label: '12 Core Features', href: '#features', icon: Sparkles, color: '#FF2E9A' },
  { label: '2-Min Express Audit', href: '#express-audit', icon: ClipboardCheck, color: '#5A00D6' },
  { label: 'App Map & Workspace', href: '#blueprint', icon: Layers, color: '#00C6FF' },
  { label: 'Why Choose Us', href: '#benefits', icon: ShieldCheck, color: '#A100FF' },
  { label: 'Must-Have Review', href: '#must-haves', icon: BookOpen, color: '#0072FF' },
  { label: '1-Click Operations', href: '#infinity-one-click-operations', icon: Zap, color: '#FF2E9A' },
  { label: 'Screen Audit & Checklist', href: '#screen-by-screen-audit', icon: ClipboardCheck, color: '#0072FF' },
  { label: 'Business Health', href: '#business-health-intelligence', icon: Activity, color: '#A100FF' },
  { label: 'Core Risk & Roster', href: '#infinity-core-engine', icon: Cpu, color: '#5A00D6' },
  { label: 'Unified Oversight & Office', href: '#infinity-control-centre', icon: Building2, color: '#00C6FF' },
  { label: 'Price & Packaging', href: '#pricing', icon: DollarSign, color: '#FF2E9A' },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => setAuthed(false));
  }, []);

  return (
    <header
      id="top-landing"
      className={`relative z-40 border-b-4 border-[#0A2B6D] transition-shadow duration-300 ${
        scrolled ? 'shadow-xl' : 'shadow-md'
      }`}
      style={{
        background:
          'linear-gradient(120deg, #0072FF 0%, #0A2B6D 16%, #5A00D6 34%, #A100FF 52%, #FF2E9A 72%, #5A00D6 88%, #0072FF 100%)',
      }}
    >
      {/* Full-width app-coloured background with 0.5cm side spacing */}
      <div className="w-full px-[0.5cm] py-2 space-y-2">
        {/* Clean, Balanced Top Bar: Square Logo Fitted to Border + Single-Line Centered App Name + Bottom Action Row */}
        <div className="relative flex flex-col items-center justify-between gap-2.5 rounded-2xl border-3 border-[#0A2B6D] bg-white px-4 py-3 sm:px-5 sm:py-3.5 shadow-lg ring-2 ring-[#00C6FF]">
          {/* Mobile menu toggle in top-right corner */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden absolute right-3 top-3 rounded-xl border-2 border-[#0A2B6D] bg-white p-1.5 text-[#0A2B6D]"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Balanced 3-Column Top Row so App Name is Mathematically Dead-Center and Fits on One Line */}
          <div className="grid w-full grid-cols-1 sm:grid-cols-[96px_1fr_96px] md:grid-cols-[108px_1fr_108px] items-center gap-3">
            {/* Left: Entire Logo Fitted Cleanly Inside Square Border */}
            <Link
              to="/"
              className="mx-auto sm:mx-0 flex h-24 w-24 md:h-[108px] md:w-[108px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white p-0.5 shadow-sm transition-transform hover:scale-102"
            >
              <Image
                src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
                alt="ComplianceHR Infinity logo"
                className="h-full w-full object-contain"
                fittingType="fit"
              />
            </Link>

            {/* Center: Single-Line App Name + Bright Pink Subtitle */}
            <Link
              to="/"
              className="flex min-w-0 flex-col items-center justify-center bg-white text-center px-1"
            >
              <span className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide text-[#0A2B6D] leading-none whitespace-nowrap">
                Compliance
                <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  HR
                </span>{' '}
                <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                  Infinity
                </span>
              </span>
              <span className="mt-1.5 inline-flex items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-4 py-0.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-white shadow-sm">
                NDIS &amp; Aged Care Compliance
              </span>
            </Link>

            {/* Right: Sign In / Get Started Stack Balancing the Logo Width */}
            <div className="hidden sm:flex flex-col items-end justify-center gap-1">
              {!authed ? (
                <>
                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white px-2.5 py-1 text-[10px] font-extrabold text-[#0A2B6D] shadow-2xs hover:bg-[#F5F0FF]"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex w-full items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm hover:bg-[#5A00D6]"
                  >
                    Get started
                  </Link>
                </>
              ) : (
                <span className="inline-flex w-full items-center justify-center rounded-full border border-[#0A2B6D] bg-[#F5F0FF] px-2 py-1 text-[9.5px] font-extrabold text-[#0A2B6D]">
                  Signed In
                </span>
              )}
            </div>
          </div>

          {/* Bottom of Top Bar Section: Open App Dashboard (in App Colours) + Landing Page Icons Centered */}
          <div className="flex w-full flex-wrap items-center justify-center gap-2 border-t border-[#0A2B6D]/20 pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-[11px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
              style={{
                background:
                  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
              }}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white bg-white text-[#5A00D6]">
                <Sparkles className="h-2.5 w-2.5 text-[#5A00D6]" />
              </span>
              <span>Open App Dashboard</span>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] bg-white px-3.5 py-1 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF]"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#0A2B6D] bg-[#0072FF] text-white">
                <ShieldCheck className="h-2.5 w-2.5 text-white" />
              </span>
              <span>Landing Page</span>
            </Link>
          </div>
        </div>

        {/* Features Listed — Circular Feature Icons + All Writing Fitted Properly Inside Every Pill (6 Per Line) */}
        <nav
          aria-label="Listed features navigation"
          className="rounded-2xl border-2 border-[#0A2B6D] p-2 shadow-md ring-2 ring-[#FF2E9A]"
          style={{
            background:
              'linear-gradient(120deg, #0072FF 0%, #5A00D6 35%, #A100FF 68%, #FF2E9A 100%)',
          }}
        >
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6 auto-rows-fr">
            {LISTED_FEATURES.map((l) => {
              const Icon = l.icon;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className="flex h-full min-h-[42px] items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] bg-white px-2 py-1 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] hover:shadow-md"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white shadow-2xs"
                    style={{ backgroundColor: l.color }}
                  >
                    <Icon className="h-3 w-3 text-white" />
                  </span>
                  <span className="min-w-0 flex-1 whitespace-normal break-words rounded bg-white text-left text-[9.5px] lg:text-[10.5px] font-extrabold leading-tight text-[#0A2B6D]">
                    {l.label}
                  </span>
                </a>
              );
            })}
          </div>
        </nav>
      </div>

      <QuickAppBar />

      {open && (
        <div className="border-t-2 border-[#0A2B6D] bg-white px-4 py-3">
          <div className="grid grid-cols-2 gap-1.5">
            {LISTED_FEATURES.map((l) => {
              const Icon = l.icon;
              return (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-2.5 py-1.5 text-xs font-extrabold text-[#0A2B6D]"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                    style={{ backgroundColor: l.color }}
                  >
                    <Icon className="h-3 w-3 text-white" />
                  </span>
                  <span className="truncate">{l.label}</span>
                </a>
              );
            })}
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-full border-2 border-[#0A2B6D] bg-white px-4 py-2 text-center text-xs font-extrabold text-[#0A2B6D]"
            >
              Open App Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}