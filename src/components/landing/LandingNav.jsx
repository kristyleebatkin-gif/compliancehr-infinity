import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, Compass, Zap, Cpu, Activity, ShieldCheck, Building2,
  ClipboardCheck, Layers, Sparkles, DollarSign, BookOpen,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import QuickAppBar from '@/components/QuickAppBar';

// 12 Listed Features — 6 on each line, mixed full-colour accents + crisp WHITE background behind dark blue writing!
const LISTED_FEATURES = [
  { label: '4-Step Quick Start', href: '#quick-start', icon: Compass, color: '#0072FF', ring: '#00C6FF' },
  { label: '12 Core Features', href: '#features', icon: Sparkles, color: '#FF2E9A', ring: '#FF6EDB' },
  { label: '2-Min Express Audit', href: '#express-audit', icon: ClipboardCheck, color: '#5A00D6', ring: '#C084FC' },
  { label: 'App Map & Workspace', href: '#blueprint', icon: Layers, color: '#0A2B6D', ring: '#0072FF' },
  { label: 'Why Choose Us', href: '#benefits', icon: ShieldCheck, color: '#A100FF', ring: '#FF2E9A' },
  { label: 'Must-Have Review', href: '#must-haves', icon: BookOpen, color: '#00C6FF', ring: '#0072FF' },
  { label: '1-Click Operations', href: '#infinity-one-click-operations', icon: Zap, color: '#FF2E9A', ring: '#5A00D6' },
  { label: 'Screen Audit & Checklist', href: '#screen-by-screen-audit', icon: ClipboardCheck, color: '#0072FF', ring: '#5A00D6' },
  { label: 'Business Health', href: '#business-health-intelligence', icon: Activity, color: '#A100FF', ring: '#0A2B6D' },
  { label: 'Core Risk & Roster', href: '#infinity-core-engine', icon: Cpu, color: '#5A00D6', ring: '#00C6FF' },
  { label: 'Unified Oversight & Office', href: '#infinity-control-centre', icon: Building2, color: '#0A2B6D', ring: '#A100FF' },
  { label: 'Price & Packaging', href: '#pricing', icon: DollarSign, color: '#FF2E9A', ring: '#0072FF' },
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
      <div className="w-full px-[0.5cm] py-2 space-y-2">
        {/* Top Bar with Slightly Larger Logo, Longer ComplianceHR Infinity Name & Slightly Smaller NDIS & Workforce Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border-2 border-[#0A2B6D] bg-white px-3.5 py-2 shadow-md ring-2 ring-[#00C6FF]">
          <Link
            to="/"
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl border-2 border-[#0A2B6D] bg-white px-3 py-1.5 shadow-sm ring-1 ring-[#FF2E9A]"
          >
            <Image
              src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
              alt="ComplianceHR Infinity logo"
              className="h-14 w-20 sm:h-16 sm:w-24 shrink-0 rounded-xl border-2 border-[#0A2B6D] bg-white p-1 shadow-sm transition-transform group-hover:scale-105"
              fittingType="fit"
            />
            <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-3 gap-y-1 bg-white">
              <span className="font-editorial text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wider text-[#0A2B6D]">
                Compliance
                <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  HR
                </span>{' '}
                <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                  Infinity
                </span>
              </span>
              <span className="rounded-full border border-[#0A2B6D] bg-white px-2 py-0.5 text-[8.5px] sm:text-[9px] font-extrabold uppercase tracking-wider text-[#0A2B6D] shadow-2xs">
                NDIS &amp; Workforce Compliance
              </span>
            </div>
          </Link>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <Link
              to="/dashboard"
              className="rounded-full border-2 border-[#0A2B6D] bg-white px-4 py-1.5 text-xs font-extrabold text-[#0A2B6D] shadow-md ring-2 ring-[#FF2E9A] transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF]"
            >
              Open App Dashboard
            </Link>
            {!authed && (
              <>
                <Link
                  to="/login"
                  className="rounded-full border-2 border-[#0A2B6D] bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#0A2B6D] shadow-2xs transition-colors hover:bg-[#F5F0FF]"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-[#5A00D6]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden rounded-lg border-2 border-[#0A2B6D] bg-white p-1.5 text-[#0A2B6D]"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Features Listed — App-Coloured Outer Frame + Crisp WHITE Background Behind Dark Blue Writing (6 Per Line) */}
        <nav
          aria-label="Listed features navigation"
          className="rounded-2xl border-2 border-[#0A2B6D] p-2 shadow-md ring-2 ring-[#FF2E9A]"
          style={{
            background:
              'linear-gradient(120deg, #0072FF 0%, #5A00D6 35%, #A100FF 68%, #FF2E9A 100%)',
          }}
        >
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6">
            {LISTED_FEATURES.map((l) => {
              const Icon = l.icon;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] bg-white px-2 py-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] hover:shadow-md"
                  style={{ borderTopWidth: '4px', borderTopColor: l.color }}
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#0A2B6D] text-white shadow-2xs"
                    style={{ backgroundColor: l.color }}
                  >
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="min-w-0 flex-1 rounded bg-white px-1 text-left text-[10.5px] font-extrabold leading-tight text-[#0A2B6D]">
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
            {LISTED_FEATURES.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] bg-white px-2.5 py-1.5 text-xs font-extrabold text-[#0A2B6D]"
                style={{ borderTopWidth: '3px', borderTopColor: l.color }}
              >
                {l.label}
              </a>
            ))}
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