import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, Compass, Zap, Cpu, Activity, ShieldCheck, Building2,
  ClipboardCheck, Layers, Sparkles, DollarSign, BookOpen, CalendarClock,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import QuickAppBar from '@/components/QuickAppBar';

// 12 Listed Features — 6 on each line, full mixed-up vibrant app colours!
const LISTED_FEATURES = [
  { label: '4-Step Quick Start', href: '#quick-start', icon: Compass, bg: 'linear-gradient(135deg, #0072FF 0%, #00C6FF 100%)', text: '#ffffff' },
  { label: '12 Core Features', href: '#features', icon: Sparkles, bg: 'linear-gradient(135deg, #FF2E9A 0%, #A100FF 100%)', text: '#ffffff' },
  { label: '2-Min Express Audit', href: '#express-audit', icon: ClipboardCheck, bg: 'linear-gradient(135deg, #5A00D6 0%, #0072FF 100%)', text: '#ffffff' },
  { label: 'App Map & Workspace', href: '#blueprint', icon: Layers, bg: 'linear-gradient(135deg, #0A2B6D 0%, #0072FF 100%)', text: '#ffffff' },
  { label: 'Why Choose Us', href: '#benefits', icon: ShieldCheck, bg: 'linear-gradient(135deg, #A100FF 0%, #FF2E9A 100%)', text: '#ffffff' },
  { label: 'Must-Have Review', href: '#must-haves', icon: BookOpen, bg: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)', text: '#0A2B6D' },
  { label: '1-Click Operations', href: '#infinity-one-click-operations', icon: Zap, bg: 'linear-gradient(135deg, #FF2E9A 0%, #5A00D6 100%)', text: '#ffffff' },
  { label: 'Screen Audit & Checklist', href: '#screen-by-screen-audit', icon: ClipboardCheck, bg: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 100%)', text: '#ffffff' },
  { label: 'Business Health', href: '#business-health-intelligence', icon: Activity, bg: 'linear-gradient(135deg, #A100FF 0%, #0A2B6D 100%)', text: '#ffffff' },
  { label: 'Core Risk & Roster', href: '#infinity-core-engine', icon: Cpu, bg: 'linear-gradient(135deg, #00C6FF 0%, #5A00D6 100%)', text: '#ffffff' },
  { label: 'Unified Oversight & Office', href: '#infinity-control-centre', icon: Building2, bg: 'linear-gradient(135deg, #0A2B6D 0%, #A100FF 100%)', text: '#ffffff' },
  { label: 'Price & Packaging', href: '#pricing', icon: DollarSign, bg: 'linear-gradient(135deg, #FF2E9A 0%, #FF6EDB 100%)', text: '#ffffff' },
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
      {/* Full-width app-coloured background between the border boxes and the sides of the page */}
      <div className="mx-auto max-w-7xl px-3 py-2.5 md:px-6 space-y-2">
        {/* Top Bar with Longer ComplianceHR Infinity Name & App-Coloured Border */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#0A2B6D] bg-white/95 px-3.5 py-2 shadow-md ring-2 ring-[#00C6FF]"
        >
          <Link
            to="/"
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl border-2 border-[#0A2B6D] bg-gradient-to-r from-[#F5F0FF] via-white to-[#FFF0F8] px-3.5 py-1.5 shadow-sm ring-1 ring-[#FF2E9A]"
          >
            <Image
              src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
              alt="ComplianceHR Infinity logo"
              className="h-10 w-12 shrink-0 rounded-lg border-2 border-[#0A2B6D] bg-white p-0.5 shadow-2xs transition-transform group-hover:scale-105"
              fittingType="fit"
            />
            <div className="min-w-0 flex-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <span className="font-editorial text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide text-[#0A2B6D]">
                Compliance
                <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  HR
                </span>{' '}
                <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                  Infinity
                </span>
              </span>
              <span className="rounded-full border border-[#0A2B6D] bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white shadow-2xs">
                NDIS &amp; Workforce Compliance Super-Platform
              </span>
            </div>
          </Link>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <Link
              to="/dashboard"
              className="rounded-full border-2 border-[#0A2B6D] bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] px-4 py-1.5 text-xs font-extrabold text-white shadow-md ring-2 ring-[#00C6FF] transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Open App Dashboard
            </Link>
            {!authed && (
              <>
                <Link
                  to="/login"
                  className="rounded-full border-2 border-[#0A2B6D] bg-[#00C6FF] px-3.5 py-1.5 text-xs font-extrabold text-[#0A2B6D] shadow-2xs transition-colors hover:bg-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-[#A100FF]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden rounded-lg border-2 border-[#0A2B6D] bg-[#F5F0FF] p-1.5 text-[#0A2B6D]"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Features Listed — App-Coloured Border & Mixed Full-Colour Pills, 6 on Each Line */}
        <nav
          aria-label="Listed features navigation"
          className="rounded-2xl border-2 border-[#0A2B6D] bg-white/95 p-2 shadow-md ring-2 ring-[#FF2E9A]"
        >
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6">
            {LISTED_FEATURES.map((l) => {
              const Icon = l.icon;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] px-2 py-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: l.bg, color: l.text }}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/50 bg-black/20 text-white">
                    <Icon className="h-3 w-3" />
                  </span>
                  <span
                    className="min-w-0 flex-1 text-left text-[10.5px] font-extrabold leading-tight"
                    style={{ color: l.text }}
                  >
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
                className="flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] px-2.5 py-1.5 text-xs font-extrabold"
                style={{ background: l.bg, color: l.text }}
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-full border-2 border-[#0A2B6D] gradient-brand px-4 py-2 text-center text-xs font-extrabold text-white"
            >
              Open App Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}