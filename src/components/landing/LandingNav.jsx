import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, Compass, Zap, Cpu, Activity, ShieldCheck, Building2,
  ClipboardCheck, Layers, Sparkles, DollarSign, BookOpen, UserCheck, ArrowRight,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import QuickAppBar from '@/components/QuickAppBar';
import { getHeaderView, getSymbolView, getAppBorderView } from '@/lib/fullColourTiles';

// 12 Compact Highlights & Features (smaller, fewer words, light pink bg, white font, app-colour symbols & borders)
const LISTED_FEATURES = [
  { label: '4-Step Start', href: '#quick-start', icon: Compass },
  { label: '12 Core Engines', href: '#features', icon: Sparkles },
  { label: '2-Min Audit', href: '#express-audit', icon: ClipboardCheck },
  { label: 'App Map', href: '#blueprint', icon: Layers },
  { label: 'Why Choose Us', href: '#benefits', icon: ShieldCheck },
  { label: 'Must-Haves', href: '#must-haves', icon: BookOpen },
  { label: '1-Click Ops', href: '#infinity-one-click-operations', icon: Zap },
  { label: 'Screen Audit', href: '#screen-by-screen-audit', icon: ClipboardCheck },
  { label: 'Health AI', href: '#business-health-intelligence', icon: Activity },
  { label: 'Core Engine', href: '#infinity-core-engine', icon: Cpu },
  { label: 'Control Centre', href: '#infinity-control-centre', icon: Building2 },
  { label: 'Pricing & Packs', href: '#pricing', icon: DollarSign },
];

// Three small purple clipboards with a small checklist + ticks on each and a flow between them
function MiniClipboardWithTicks({ accent = '#5A00D6' }) {
  return (
    <div
      className="relative flex h-8 w-6 sm:h-9 sm:w-7 shrink-0 flex-col justify-between rounded-md border-2 border-white bg-[#5A00D6] px-1 pt-1.5 pb-1 shadow-2xs"
      style={{ backgroundColor: accent }}
    >
      {/* Top clipboard clip */}
      <span
        className="absolute -top-1 left-1/2 h-1.5 w-3.5 -translate-x-1/2 rounded-sm border border-white bg-[#A100FF]"
      />
      {/* 3 mini checklist rows with ticks */}
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex items-center gap-0.5 leading-none">
          <span
            className="flex h-2 w-2 shrink-0 items-center justify-center rounded-[2px] bg-white text-[6px] font-black text-[#5A00D6]"
          >
            ✓
          </span>
          <span
            className="h-[2px] flex-1 rounded-full bg-white/90"
          />
        </div>
      ))}
    </div>
  );
}

function ThreeClipboardsFlow() {
  const purples = ['#5A00D6', '#7C3AED', '#A100FF'];
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0" aria-hidden="true">
      <MiniClipboardWithTicks accent={purples[0]} />
      <ArrowRight className="h-3.5 w-3.5 text-white shrink-0 stroke-[3]" />
      <MiniClipboardWithTicks accent={purples[1]} />
      <ArrowRight className="h-3.5 w-3.5 text-white shrink-0 stroke-[3]" />
      <MiniClipboardWithTicks accent={purples[2]} />
    </div>
  );
}

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
      {/* Clean white outer area with 0.5cm side spacing */}
      <div className="w-full bg-white px-[0.5cm] py-2 space-y-2">
        {/* Top Section — Protected & Untouched Design */}
        <div
          className="rounded-3xl p-[12px] shadow-lg"
          style={{
            background:
              'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
          }}
        >
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[16px] bg-white px-2 pt-0 pb-4 sm:px-3 sm:pt-0 sm:pb-4 text-center">
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden absolute right-3 top-2.5 z-20 rounded-xl border-2 border-[#0A2B6D] bg-white p-1.5 text-[#0A2B6D]"
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link
              to="/"
              className="mx-auto flex w-full flex-col items-center justify-center bg-white text-center"
            >
              <div
                className="mt-0 mx-auto relative overflow-hidden w-[15rem] sm:w-[19.5rem] md:w-[23rem] bg-white"
                style={{ aspectRatio: '100 / 50' }}
              >
                <img
                  src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/6bf497716_generated_image.png"
                  alt="ComplianceHR Infinity logo"
                  className="w-full pointer-events-none select-none"
                  style={{
                    marginTop: '-5.5%',
                  }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-0 bg-white"
                  style={{ width: '24%', height: '6%' }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 bg-white"
                  style={{ left: '42.5%', width: '5.5%', height: '3.8%' }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 right-0 bg-white"
                  style={{ width: '25%', height: '6%' }}
                />
              </div>

              {/* App Name & Slogan */}
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

                <div className="mt-1.5 mx-auto flex w-full flex-wrap items-center justify-center gap-x-2 bg-transparent px-2 text-center text-sm sm:text-base md:text-lg lg:text-xl font-extrabold">
                  <span className="text-[#0072FF]">Complete Control.</span>
                  <span className="text-[#5A00D6]">Greater Confidence.</span>
                  <span className="text-[#FF2E9A]">Brighter Success.</span>
                </div>
              </div>
            </Link>

            {/* Bottom Section: Centred NDIS Badge + Open, Landing, and Sign In Icons */}
            <div className="mx-auto flex w-full flex-col items-center justify-center gap-2.5 text-center">
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
                <span className="text-center">NDIS &amp; Aged Care Documentation &amp; Compliance</span>
              </span>

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

        {/* ComplianceHR Infinity Highlights & Features — Full-Width Stretched Header with 3 Clipboards Flow on Both Sides */}
        <nav
          aria-label="ComplianceHR Infinity Highlights & Features"
          className="rounded-3xl p-[12px] shadow-lg"
          style={{
            background:
              'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
          }}
        >
          <div className="rounded-[16px] bg-white px-3 py-3.5 sm:px-4 sm:py-4 text-center space-y-2.5">
            {/* Full-Width Stretched Title Bar: 2 Centred Lines (No Symbol) + 3 Purple Clipboards Flow on Both Sides */}
            <div
              className="flex w-full items-center justify-between gap-2 rounded-2xl border-2 border-[#0A2B6D] px-3 sm:px-5 py-2 text-white shadow-sm"
              style={{ background: getHeaderView(0) }}
            >
              <ThreeClipboardsFlow />

              <div className="flex min-w-0 flex-1 items-center justify-center text-center leading-tight">
                <span className="font-editorial text-lg sm:text-xl md:text-2xl font-extrabold tracking-wide text-white">
                  Highlights and Features
                </span>
              </div>

              <ThreeClipboardsFlow />
            </div>

            {/* Feature Tiles in App Design Colour with White Font Tone, App-Colour Symbols & Different App-Colour Borders */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 auto-rows-fr">
              {LISTED_FEATURES.map((l, idx) => {
                const Icon = l.icon;
                const sym = getSymbolView(idx);
                const borderCol = getAppBorderView(idx);
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    className="flex h-full min-h-[38px] items-center justify-center gap-1.5 rounded-xl border-2 px-2.5 py-1 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      background: getHeaderView(idx),
                      color: '#FFFFFF',
                      borderColor: borderCol,
                    }}
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-white shadow-2xs"
                      style={{ borderColor: borderCol }}
                    >
                      <Icon className="h-3 w-3" style={{ color: sym.iconColor }} />
                    </span>
                    <span className="min-w-0 flex-1 whitespace-normal break-words text-center text-[10.5px] font-extrabold leading-tight text-white">
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
            {LISTED_FEATURES.map((l, idx) => {
              const Icon = l.icon;
              const sym = getSymbolView(idx);
              const borderCol = getAppBorderView(idx);
              return (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-1.5 text-[11px] font-extrabold text-white"
                  style={{
                    background: getHeaderView(idx),
                    borderColor: borderCol,
                  }}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-white" style={{ borderColor: borderCol }}>
                    <Icon className="h-3 w-3" style={{ color: sym.iconColor }} />
                  </span>
                  <span className="whitespace-normal break-words leading-snug text-white">{l.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}