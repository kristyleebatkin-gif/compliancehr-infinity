import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, Compass, Zap, Cpu, Activity, ShieldCheck, Building2,
  ClipboardCheck, Layers, Sparkles, DollarSign, BookOpen, UserCheck,
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

          {/* Top Row: Logo Centred in Its Own Area Between Name & Side of Page + Larger Centered App Name + Slogan Under App Name */}
          <div className="grid w-full grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
            {/* Left Area (Between Side of Page and App Name): Logo Centred in Its Own Area */}
            <div className="flex w-full items-center justify-center">
              <Link
                to="/"
                className="flex h-24 w-24 md:h-[116px] md:w-[116px] shrink-0 items-center justify-center rounded-2xl p-[3px] shadow-md transition-transform hover:scale-102"
                style={{
                  background:
                    'linear-gradient(135deg, #00C6FF 0%, #0072FF 25%, #5A00D6 55%, #A100FF 78%, #FF2E9A 100%)',
                }}
              >
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[13px] bg-white p-0.5">
                  <Image
                    src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
                    alt="ComplianceHR Infinity logo"
                    className="h-full w-full object-contain"
                    fittingType="fit"
                  />
                </div>
              </Link>
            </div>

            {/* Center Area: Increased App Name in App-Coloured Border + Slogan Directly Underneath in Logo Colours */}
            <Link
              to="/"
              className="flex min-w-0 flex-col items-center justify-center bg-white text-center px-1"
            >
              <div
                className="inline-flex items-center justify-center rounded-2xl p-[3px] shadow-md"
                style={{
                  background:
                    'linear-gradient(120deg, #0072FF 0%, #5A00D6 35%, #A100FF 68%, #FF2E9A 100%)',
                }}
              >
                <span className="rounded-[13px] bg-white px-5 py-2 font-editorial text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-wide text-[#0A2B6D] leading-none whitespace-nowrap">
                  Compliance
                  <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                    HR
                  </span>{' '}
                  <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                    Infinity
                  </span>
                </span>
              </div>

              {/* Slogan Under App Name in the Same Colours as on the Logo */}
              <div className="mt-2 rounded-full bg-white px-3 py-0.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide">
                <span className="text-[#0072FF]">Complete Control.</span>{' '}
                <span className="text-[#5A00D6]">Greater Confidence.</span>{' '}
                <span className="text-[#FF2E9A]">Brighter Success.</span>
              </div>
            </Link>

            {/* Right Balancing Area so App Name Stays Centred & Logo Sits Centred Between Name and Left Side */}
            <div className="hidden sm:block" aria-hidden="true" />
          </div>

          {/* Bottom Section: NDIS & Aged Care Just Above Open, Landing and Signed In (All Same Size & Centred Together) */}
          <div className="flex w-full flex-col items-center justify-center gap-2 border-t border-[#0A2B6D]/20 pt-2.5">
            {/* NDIS & Aged Care Compliance Placed Just Above Open, Landing and Signed In */}
            <span
              className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-5 py-1 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-white shadow-sm"
              style={{
                background:
                  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)',
              }}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#FF2E9A]">
                <ShieldCheck className="h-2.5 w-2.5 text-[#FF2E9A]" />
              </span>
              <span>NDIS &amp; Aged Care Compliance</span>
            </span>

            {/* Open, Landing, and Signed In Icons — Exact Same Size & Centred Together on Bottom Section */}
            <div className="grid w-full max-w-xl grid-cols-1 sm:grid-cols-3 items-stretch justify-center gap-2.5">
              <Link
                to="/dashboard"
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3 text-[11px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                style={{
                  background:
                    'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
                }}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#0072FF]">
                  <Sparkles className="h-3 w-3 text-[#0072FF]" />
                </span>
                <span className="whitespace-nowrap">Open App Dashboard</span>
              </Link>

              <Link
                to="/"
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3 text-[11px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                style={{
                  background:
                    'linear-gradient(120deg, #5A00D6 0%, #0072FF 36%, #A100FF 70%, #FF6EDB 100%)',
                }}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#5A00D6]">
                  <Compass className="h-3 w-3 text-[#5A00D6]" />
                </span>
                <span className="whitespace-nowrap">Landing Page</span>
              </Link>

              <Link
                to={authed ? '/dashboard' : '/login'}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3 text-[11px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                style={{
                  background:
                    'linear-gradient(120deg, #0072FF 0%, #A100FF 48%, #FF2E9A 82%, #00C6FF 100%)',
                }}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#A100FF]">
                  <UserCheck className="h-3 w-3 text-[#A100FF]" />
                </span>
                <span className="whitespace-nowrap">{authed ? 'Signed In' : 'Sign In'}</span>
              </Link>
            </div>
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