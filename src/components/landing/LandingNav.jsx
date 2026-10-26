import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, Compass, Zap, Cpu, Activity, ShieldCheck, Building2,
  ClipboardCheck, Layers, Sparkles, DollarSign, BookOpen, Home,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import QuickAppBar from '@/components/QuickAppBar';

// 12 Listed Features arranged 6 on each line (2 rows of 6), with Landing Page at the right-side bottom (item #12)
const LISTED_FEATURES = [
  { label: '4-Step Quick Start', href: '#quick-start', icon: Compass, color: '#0072FF' },
  { label: '12 Core Features', href: '#features', icon: Sparkles, color: '#0A2B6D' },
  { label: '2-Min Express Audit', href: '#express-audit', icon: ClipboardCheck, color: '#5A00D6' },
  { label: 'App Map & Workspace', href: '#blueprint', icon: Layers, color: '#A100FF' },
  { label: 'Why Choose Us', href: '#benefits', icon: ShieldCheck, color: '#FF2E9A' },
  { label: 'Must-Have Review', href: '#must-haves', icon: BookOpen, color: '#00C6FF' },
  { label: '1-Click Operations', href: '#infinity-one-click-operations', icon: Zap, color: '#0072FF' },
  { label: 'Screen Audit & Checklist', href: '#screen-by-screen-audit', icon: ClipboardCheck, color: '#5A00D6' },
  { label: 'Business Health & Core', href: '#infinity-core-engine', icon: Cpu, color: '#A100FF' },
  { label: 'Unified Oversight & Office', href: '#infinity-control-centre', icon: Building2, color: '#0A2B6D' },
  { label: 'Price & Packaging', href: '#pricing', icon: DollarSign, color: '#FF2E9A' },
  { label: 'Landing Page', href: '#top-landing', isRoute: true, to: '/', icon: Home, color: '#5A00D6' },
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
      className={`sticky top-0 z-40 border-b-4 border-[#0A2B6D] bg-white transition-shadow duration-300 ${
        scrolled ? 'shadow-lg' : 'shadow-md'
      }`}
    >
      <div className="mx-auto max-w-7xl bg-white px-3 py-2 md:px-6">
        {/* App-Themed Colour Border Around App Brand & Open Dashboard */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#0A2B6D] px-3 py-2 shadow-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(0,114,255,0.08) 0%, rgba(90,0,214,0.08) 50%, rgba(255,46,154,0.08) 100%)',
          }}
        >
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white px-2.5 py-1 shadow-sm ring-2 ring-[#C084FC]/60"
          >
            <Image
              src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
              alt="ComplianceHR Infinity logo"
              className="h-9 w-9 rounded-lg border border-[#5A00D6] bg-white p-0.5 shadow-2xs transition-transform group-hover:scale-105"
              fittingType="fit"
            />
            <span className="font-editorial text-base sm:text-lg font-bold tracking-tight text-[#0A2B6D]">
              Compliance
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                HR
              </span>
              <span className="ml-1.5 align-middle text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#5A00D6]">
                Infinity
              </span>
            </span>
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
                  className="rounded-full border-2 border-[#0A2B6D] bg-white px-3.5 py-1 text-xs font-extrabold text-[#0A2B6D] transition-colors hover:bg-[#F5F0FF]"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-3.5 py-1 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-[#A100FF]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen((v) => !v)} className="md:hidden rounded-lg border-2 border-[#0A2B6D] p-1 text-[#0A2B6D]" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* App-Themed Border Around Features Listed — 6 on Each Line with Landing Page at Right-Side Bottom */}
        <nav
          aria-label="Listed features navigation"
          className="mt-2 rounded-2xl border-2 border-[#0A2B6D] p-2 shadow-sm"
          style={{
            background: 'linear-gradient(120deg, rgba(0,114,255,0.10) 0%, rgba(90,0,214,0.12) 50%, rgba(255,46,154,0.10) 100%)',
          }}
        >
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            {LISTED_FEATURES.map((l) => {
              const Icon = l.icon;
              const content = (
                <>
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white shadow-2xs"
                    style={{ backgroundColor: l.color }}
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className="min-w-0 flex-1 text-left text-[11px] font-extrabold leading-tight text-[#0A2B6D]">
                    {l.label}
                  </span>
                </>
              );

              if (l.isRoute) {
                return (
                  <Link
                    key={l.label}
                    to={l.to}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] bg-gradient-to-r from-[#FFF0F8] to-[#F5F0FF] px-2 py-1 shadow-2xs ring-1 ring-[#FF2E9A] transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <a
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] bg-white px-2 py-1 shadow-2xs transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF]"
                  style={{ borderTopWidth: '3px', borderTopColor: l.color }}
                >
                  {content}
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
                className="flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF] px-2.5 py-1.5 text-xs font-extrabold text-[#0A2B6D]"
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