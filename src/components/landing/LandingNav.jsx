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
      className={`sticky top-0 z-40 border-b-4 border-[#0A2B6D] transition-shadow duration-300 ${
        scrolled ? 'shadow-xl' : 'shadow-md'
      }`}
      style={{
        background:
          'linear-gradient(120deg, #0072FF 0%, #0A2B6D 16%, #5A00D6 34%, #A100FF 52%, #FF2E9A 72%, #5A00D6 88%, #0072FF 100%)',
      }}
    >
      {/* Full-width app-coloured background with 0.5cm side spacing */}
      <div className="w-full px-[0.5cm] py-2.5 space-y-2.5">
        {/* Top Bar: Zero Gap Between Logo & Border, True-Centered App Name, and Small Landing Page Under Open App Dashboard */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-3xl border-3 border-[#0A2B6D] bg-white px-3 py-2.5 sm:px-4 sm:py-3 shadow-lg ring-2 ring-[#00C6FF]">
          {/* Logo Filled Tightly to Border (No Extra Gap Between Logo & Border) */}
          <Link
            to="/"
            className="flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white p-0 shadow-sm transition-transform hover:scale-102"
          >
            <Image
              src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
              alt="ComplianceHR Infinity logo"
              className="h-16 w-28 sm:h-20 sm:w-36 md:h-24 md:w-44 block object-cover"
              fittingType="fill"
            />
          </Link>

          {/* True-Centered Brand Name Fitted Properly + "NDIS & Aged Care Compliance" Centered Underneath in Bright Pink */}
          <Link
            to="/"
            className="flex min-w-0 flex-col items-center justify-center bg-white text-center px-1"
          >
            <span className="font-editorial text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide text-[#0A2B6D] leading-none whitespace-nowrap">
              Compliance
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                HR
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                Infinity
              </span>
            </span>
            <span className="mt-1.5 inline-flex items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-3.5 py-0.5 text-[9.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm">
              NDIS &amp; Aged Care Compliance
            </span>
          </Link>

          {/* Right Column: Open App Dashboard on Top, Small Landing Page Directly Underneath */}
          <div className="hidden shrink-0 flex-col items-center justify-center gap-1 md:flex">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#0A2B6D] px-3.5 py-1 text-[11px] font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5"
              style={{
                background:
                  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
              }}
            >
              Open App Dashboard
            </Link>
            <div className="flex items-center justify-center gap-1">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-[#0A2B6D] bg-white px-2.5 py-0.5 text-[9.5px] font-extrabold text-[#0A2B6D] shadow-2xs hover:bg-[#F5F0FF]"
              >
                Landing Page
              </Link>
              {!authed && (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-full border border-[#0A2B6D] bg-white px-2 py-0.5 text-[9.5px] font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-full border border-[#0A2B6D] bg-[#FF2E9A] px-2.5 py-0.5 text-[9.5px] font-extrabold text-white hover:bg-[#5A00D6]"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden rounded-xl border-2 border-[#0A2B6D] bg-white p-2 text-[#0A2B6D]"
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
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