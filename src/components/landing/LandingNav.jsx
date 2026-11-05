import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Calendar, ChevronDown, ChevronUp, LayoutGrid, Minimize2, Maximize2, ShieldAlert } from 'lucide-react';
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

const WORKSPACE_ROUTES = [
  ['Live Executive Dashboard', '/dashboard'],
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
  ['Connect AI Agent (MCP)', '/connect'],
];

export default function LandingNav({ onBookDemo, showLiveDashboard = true, onToggleLiveDashboard }) {
  const [open, setOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [collapsedHeader, setCollapsedHeader] = useState(true);
  const [manualOverride, setManualOverride] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      if (manualOverride !== null) return;
      if (window.scrollY > 140) setCollapsedHeader(true);
      else if (window.scrollY < 40) setCollapsedHeader(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [manualOverride]);

  const toggleHeaderCollapse = () => {
    setCollapsedHeader((prev) => {
      const next = !prev;
      setManualOverride(next);
      return next;
    });
  };

  return (
    <header
      id="top-landing"
      className="sticky top-0 z-40 w-full bg-white shadow-sm transition-all duration-200"
    >
      {/* Top App-Design Gradient Strip — aligned flush with navigation remote */}
      <div
        className="h-1.5 w-full"
        style={{
          background:
            'linear-gradient(120deg, #00C6FF 0%, #0072FF 25%, #5A00D6 55%, #FF2E9A 100%)',
        }}
      />

      {/* Collapsible White Header Section Above Dashboard — aligned with navigation remote (+1cm logo height) */}
      {!collapsedHeader && (
        <div className="mx-auto flex min-h-[calc(190px+1cm)] max-w-[1440px] flex-col justify-between bg-white px-4 py-1.5 sm:px-6 lg:px-8 md:h-[calc(190px+1cm)] md:flex-row md:items-stretch">
          {/* Left at the Bottom: Sign In & Book Demo (Slightly Reduced) */}
          <div className="order-2 flex shrink-0 items-center justify-center gap-1.5 self-center md:order-1 md:self-end md:pb-1">
            <Link
              to="/login"
              className="inline-flex min-h-[27px] items-center justify-center whitespace-nowrap rounded-md px-2.5 py-1 text-[10.5px] font-extrabold text-white shadow-2xs transition hover:opacity-95"
              style={{
                background: 'linear-gradient(115deg, #0A2B6D 0%, #0072FF 55%, #5A00D6 100%)',
              }}
            >
              Sign In
            </Link>

            <button
              type="button"
              onClick={() => onBookDemo && onBookDemo('Book a Personal Demo')}
              className="inline-flex min-h-[27px] items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1 text-[10.5px] font-extrabold text-white shadow-2xs transition hover:opacity-95"
              style={{
                background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
              }}
            >
              <Calendar className="h-3 w-3 shrink-0 text-white" />
              <span>Book Demo</span>
            </button>
          </div>

          {/* Centre: Business Logo (+1cm x +1cm), Name & Slogan Under Name Fitted Top-to-Bottom */}
          <div className="order-1 flex flex-1 items-center justify-center py-0.5 md:order-2">
            <Link
              to="/"
              className="inline-flex flex-col items-center justify-center text-center"
              aria-label="ComplianceHR Infinity home"
            >
              <BrandLogoLockup size="md" theme="light" showSlogan={true} />
            </Link>
          </div>

          {/* Right at the Bottom: Demo & Start Free (Slightly Reduced) */}
          <div className="order-3 flex shrink-0 items-center justify-center gap-1.5 self-center md:self-end md:pb-1">
            <Link
              to="/dashboard"
              className="inline-flex min-h-[27px] items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1 text-[10.5px] font-extrabold text-white shadow-2xs transition hover:opacity-95"
              style={{
                background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #A100FF 100%)',
              }}
            >
              <span>Demo</span>
            </Link>

            <Link
              to="/register"
              className="inline-flex min-h-[27px] shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1 text-[10.5px] font-extrabold text-white shadow-2xs transition hover:opacity-95"
              style={{
                background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
              }}
            >
              <span>Start Free</span>
              <ArrowRight className="h-3 w-3 shrink-0 text-white" />
            </Link>

            <button
              type="button"
              className="xl:hidden inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-[#0A2B6D]"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Continuous App-Design Gradient Divider Line aligned with remote white section bottom */}
      <div
        className="h-[3px] w-full"
        style={{
          background:
            'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)',
        }}
      />

      {/* Compact Section Navigation Bar Below Divider */}
      <div
        className="px-3 py-1 sm:px-6"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        <nav aria-label="Main navigation" className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#00C6FF]/40 bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]"
            >
              <span style={{ color: '#0072FF' }}>◉</span>
              <span>ComplianceHR Infinity</span>
            </Link>
            <button
              type="button"
              onClick={toggleHeaderCollapse}
              className="inline-flex items-center gap-1 rounded-full border border-[#00C6FF]/50 bg-white/10 px-2.5 py-0.5 text-[10px] font-extrabold text-white transition hover:bg-white/20"
              title={collapsedHeader ? 'Expand full brand header' : 'Collapse top banner for maximum screen space'}
            >
              {collapsedHeader ? (
                <>
                  <Maximize2 className="h-2.5 w-2.5 text-[#00C6FF]" />
                  <span>Expand Header</span>
                  <ChevronDown className="h-2.5 w-2.5 text-[#00C6FF]" />
                </>
              ) : (
                <>
                  <Minimize2 className="h-2.5 w-2.5 text-[#00C6FF]" />
                  <span>Collapse Header</span>
                  <ChevronUp className="h-2.5 w-2.5 text-[#00C6FF]" />
                </>
              )}
            </button>
            {onToggleLiveDashboard && (
              <button
                type="button"
                onClick={onToggleLiveDashboard}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold transition ${
                  showLiveDashboard
                    ? 'border-[#00C6FF] bg-[#00C6FF] text-[#0A2B6D] shadow-[0_0_10px_rgba(0,198,255,0.5)]'
                    : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                }`}
                title="Switch between Live Executive Dashboard and Marketing Overview"
              >
                <LayoutGrid className="h-2.5 w-2.5" />
                <span>{showLiveDashboard ? 'Live Executive Dashboard: ON' : 'Show Live Executive Dashboard'}</span>
              </button>
            )}
            <Link
              to="/incidents"
              className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#FF2E9A]/60 bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D] transition hover:bg-[#F5F0FF]"
              title="Open Incident Clinic & 1-Click CAPA/Risk Escalation"
            >
              <ShieldAlert className="h-2.5 w-2.5 text-[#FF2E9A]" />
              <span>1-Click Incident Escalation</span>
            </Link>
          </div>

          <div className="hidden xl:flex items-center justify-center gap-5">
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="whitespace-nowrap text-[11px] font-semibold text-white/90 transition hover:text-[#00C6FF]"
            >
              {label}
            </a>
          ))}

          {/* Progressive Disclosure Workspace Launcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setWorkspaceMenuOpen((v) => !v)}
              aria-expanded={workspaceMenuOpen}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:border-[#00C6FF] hover:text-[#00C6FF]"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span>Workspaces</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${workspaceMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {workspaceMenuOpen && (
              <div
                onMouseLeave={() => setWorkspaceMenuOpen(false)}
                className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl z-50"
              >
                <div className="px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#5A00D6]">
                  Direct Workspace Routes
                </div>
                <div className="mt-1 grid grid-cols-1 gap-1">
                  {WORKSPACE_ROUTES.map(([label, path]) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setWorkspaceMenuOpen(false)}
                      className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0A2B6D] transition hover:bg-[#F5F0FF] hover:text-[#0072FF]"
                    >
                      <span>{label}</span>
                      <ArrowRight className="h-3 w-3 text-[#5A00D6]" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
        </nav>
      </div>

      {open && (
        <nav
          aria-label="Mobile navigation"
          className="xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-[#0A2B6D]"
              >
                {label}
              </a>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-2">
            <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[#5A00D6]">
              Quick Workspaces
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {WORKSPACE_ROUTES.slice(0, 6).map(([label, path]) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0A2B6D]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                if (onBookDemo) onBookDemo('Book a Personal Demo');
              }}
              className="flex-1 rounded-lg border border-[#0A2B6D] bg-white px-3 py-2 text-center text-xs font-bold text-[#0A2B6D]"
            >
              Book a Demo
            </button>
            <Link
              to="/connect"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-[#5A00D6] bg-[#F5F0FF] px-3 py-2 text-center text-xs font-bold text-[#5A00D6]"
            >
              Connect AI
            </Link>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-[#0A2B6D]"
            >
              Sign In
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}