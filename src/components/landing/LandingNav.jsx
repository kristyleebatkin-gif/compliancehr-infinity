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
      className={`relative z-40 border-b-4 border-[#0A2B6D] bg-white transition-shadow duration-300 ${
        scrolled ? 'shadow-xl' : 'shadow-md'
      }`}
    >
      {/* Clean white outer area with 0.5cm side spacing — colour strictly inside borders */}
      <div className="w-full bg-white px-[0.5cm] py-2 space-y-2">
        {/* Top Section with Increased App-Coloured Border Thickness */}
        <div
          className="rounded-3xl p-[12px] shadow-lg"
          style={{
            background:
              'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
          }}
        >
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[16px] bg-white px-2 pt-0 pb-4 sm:px-3 sm:pt-0 sm:pb-4 text-center">
            {/* Mobile menu toggle in top-right corner */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden absolute right-3 top-2.5 z-20 rounded-xl border-2 border-[#0A2B6D] bg-white p-1.5 text-[#0A2B6D]"
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Centred Logo (1.5x Larger, Closer to Top Border) + Balanced Space Above App Name & Below Slogan */}
            <Link
              to="/"
              className="mx-auto flex w-full flex-col items-center justify-center bg-white text-center"
            >
              {/* One Large Logo Above App Name (Logo Emblem Only — Name & Slogan Removed & Emblem Enlarged to Same Size & Location) */}
              <div
                className="mt-1 sm:mt-1.5 mx-auto relative overflow-hidden w-[15rem] sm:w-[19.5rem] md:w-[23rem]"
                style={{ aspectRatio: '100 / 50.2' }}
              >
                <img
                  src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/6bf497716_generated_image.png"
                  alt="ComplianceHR Infinity logo"
                  className="w-full pointer-events-none select-none"
                  style={{
                    marginTop: '-3.5%',
                  }}
                />
              </div>

              {/* App Name & Slogan with Equal Visual Space to Logo Above and NDIS Badge Below */}
              <div className="mt-2 sm:mt-3 mb-5 sm:mb-6 relative z-10 mx-auto flex w-full flex-col items-center justify-center text-center">
                <div className="mx-auto flex w-full items-center justify-center bg-transparent text-center font-editorial text-3xl sm:text-5xl md:text-[3.35rem] lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#0A2B6D] leading-tight whitespace-nowrap">
                  <span className="mx-auto block whitespace-nowrap text-center">
                    Compliance
                    <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                      HR
                    </span>{' '}
                    <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                      Infinity
                    </span>
                  </span>
                </div>

                <div className="mt-1 mx-auto flex w-full flex-wrap items-center justify-center gap-x-1.5 bg-transparent px-2 text-center text-xs sm:text-sm md:text-base font-extrabold">
                  <span className="text-[#0072FF]">Complete Control.</span>
                  <span className="text-[#5A00D6]">Greater Confidence.</span>
                  <span className="text-[#FF2E9A]">Brighter Success.</span>
                </div>
              </div>
            </Link>

            {/* Bottom Section: Centred NDIS Badge + Slightly Increased & Centred Open, Landing, and Sign In Icons */}
            <div className="mx-auto flex w-full flex-col items-center justify-center gap-2.5 text-center">
              {/* NDIS & Aged care Documentation & Compliance Badge */}
              <span
                className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
                style={{
                  background:
                    'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)',
                }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#FF2E9A]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#FF2E9A]" />
                </span>
                <span className="text-center">NDIS &amp; Aged care Documentation &amp; Compliance</span>
              </span>

              {/* Slightly Increased & Centred Open, Landing, and Signed In Icons */}
              <div className="mx-auto grid w-full max-w-2xl grid-cols-1 sm:grid-cols-3 items-center justify-center gap-2.5">
                <Link
                  to="/dashboard"
                  className="mx-auto inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background:
                      'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
                  }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#0072FF]">
                    <Sparkles className="h-3.5 w-3.5 text-[#0072FF]" />
                  </span>
                  <span className="whitespace-nowrap text-center">Open App Dashboard</span>
                </Link>

                <Link
                  to="/"
                  className="mx-auto inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background:
                      'linear-gradient(120deg, #5A00D6 0%, #0072FF 36%, #A100FF 70%, #FF6EDB 100%)',
                  }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#5A00D6]">
                    <Compass className="h-3.5 w-3.5 text-[#5A00D6]" />
                  </span>
                  <span className="whitespace-nowrap text-center">Landing Page</span>
                </Link>

                <Link
                  to={authed ? '/dashboard' : '/login'}
                  className="mx-auto inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background:
                      'linear-gradient(120deg, #0072FF 0%, #A100FF 48%, #FF2E9A 82%, #00C6FF 100%)',
                  }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#A100FF]">
                    <UserCheck className="h-3.5 w-3.5 text-[#A100FF]" />
                  </span>
                  <span className="whitespace-nowrap text-center">{authed ? 'Signed In' : 'Sign In'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Listed — Matching Top Section Border, Spacing, Colours & Style */}
        <nav
          aria-label="Listed features navigation"
          className="rounded-3xl p-[12px] shadow-lg"
          style={{
            background:
              'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
          }}
        >
          <div className="rounded-[16px] bg-white px-3 py-4 sm:px-4 sm:py-4 text-center space-y-3">
            <span
              className="mx-auto inline-flex min-h-[40px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm font-extrabold tracking-wide text-white shadow-sm"
              style={{
                background:
                  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)',
              }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#FF2E9A]">
                <Sparkles className="h-3.5 w-3.5 text-[#FF2E9A]" />
              </span>
              <span className="text-center">12 Listed Landing Page Sections &amp; Highlights</span>
            </span>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6 auto-rows-fr">
              {LISTED_FEATURES.map((l) => {
                const Icon = l.icon;
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    className="flex h-full min-h-[42px] items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] hover:shadow-md"
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white shadow-2xs"
                      style={{
                        background:
                          'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)',
                      }}
                    >
                      <Icon className="h-3 w-3 text-white" />
                    </span>
                    <span className="min-w-0 flex-1 whitespace-normal break-words text-left text-[10px] lg:text-[11px] font-extrabold leading-tight text-[#0A2B6D]">
                      {l.label}
                    </span>
                  </a>
                );
              })}
            </div>
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
                    style={{
                      background:
                        'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)',
                    }}
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