import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Calendar, Layers, Building2, Users } from 'lucide-react';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import FloatingQuickActionBar from '@/components/landing/FloatingQuickActionBar';

const WORKSPACE_VIEWS = [
  { id: 'both', label: 'Both Views', Icon: Layers },
];

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
  const [collapsedHeader, setCollapsedHeader] = useState(false);
  const [manualOverride, setManualOverride] = useState(null);
  const [workspaceView, setWorkspaceView] = useState(() => localStorage.getItem('chr-workspace-view-mode') || 'both');

  const switchWorkspaceView = (mode) => {
    setWorkspaceView(mode);
    localStorage.setItem('chr-workspace-view-mode', mode);
    window.dispatchEvent(new CustomEvent('chr-view-mode-change', { detail: { mode } }));
  };

  useEffect(() => {
    const onScroll = () => {
      if (manualOverride !== null) return;
      if (window.scrollY > 80) setCollapsedHeader(true);
      else if (window.scrollY < 30) setCollapsedHeader(false);
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
      className="sticky top-0 z-40 w-full bg-black shadow-sm transition-all duration-200"
    >
      {/* Top App-Design Gradient Strip — aligned flush with navigation remote */}
      <div
        className="h-1.5 w-full"
        style={{
          background:
            'linear-gradient(120deg, #00C6FF 0%, #0072FF 25%, #5A00D6 55%, #FF2E9A 100%)',
        }}
      />

      {/* Collapsible Black Header Section Above Dashboard */}
      {collapsedHeader ? (
        <div className="mx-auto flex max-w-[1440px] items-center justify-between bg-black px-4 py-1 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-1.5 text-xs font-extrabold">
            <span style={{ color: '#00C6FF' }}>Compliance</span>
            <span style={{ color: '#FF2E9A' }}>HR Infinity</span>
          </Link>
          <button
            type="button"
            onClick={toggleHeaderCollapse}
            className="inline-flex h-[24px] items-center gap-1 rounded-md px-3 text-[10px] font-extrabold text-white shadow-2xs transition"
            style={{ backgroundColor: '#FF2E9A' }}
          >
            <span>Expand Header</span>
          </button>
        </div>
      ) : (
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-end gap-0.5 bg-black px-2 pt-1 pb-0.5 sm:px-4 lg:px-6">
          {/* Top / Centre: Larger Business Logo + Name + Slogan */}
          <Link
            to="/"
            className="inline-flex flex-col items-center justify-end text-center"
            aria-label="ComplianceHR Infinity home"
          >
            <BrandLogoLockup size="md" theme="dark" showSlogan={true} />
          </Link>

          {/* Single Row Under Logo: Sign In, Book Demo, Participant Profiles, Both Views & Start Free */}
          <div className="flex w-full flex-wrap items-center justify-center gap-1.5 py-0.5">
            <Link
              to="/login"
              className="inline-flex h-[24px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-white/20 px-2.5 text-[10px] font-extrabold text-black shadow-[0_0_10px_rgba(0,198,255,0.5)] transition hover:opacity-90"
              style={{ backgroundColor: '#00C6FF' }}
            >
              Sign In
            </Link>

            <button
              type="button"
              onClick={() => onBookDemo && onBookDemo('Book a Personal Demo')}
              className="inline-flex h-[24px] shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-[#00C6FF]/50 px-2.5 text-[10px] font-extrabold text-white shadow-[0_0_10px_rgba(0,114,255,0.55)] transition hover:opacity-90"
              style={{ backgroundColor: '#0072FF' }}
            >
              <Calendar className="h-3 w-3 shrink-0" style={{ color: '#00C6FF' }} />
              <span>Book Demo</span>
            </button>

            <Link
              to="/our-participants"
              className="inline-flex h-[24px] shrink-0 items-center justify-center gap-1 rounded-full border border-[#00C6FF] bg-[#0072FF] px-3 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-[0_0_10px_rgba(0,114,255,0.5)] transition hover:opacity-95"
            >
              <Users className="h-3 w-3 shrink-0 text-[#00C6FF]" />
              <span className="whitespace-nowrap">Participant Profiles</span>
            </Link>

            {WORKSPACE_VIEWS.map(({ id, label, Icon }) => {
              const selected = workspaceView === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => switchWorkspaceView(id)}
                  aria-pressed={selected}
                  title={label}
                  className="inline-flex h-[24px] shrink-0 items-center justify-center gap-1 rounded-full border px-3 text-[10px] font-extrabold tracking-wide shadow-[0_0_10px_rgba(0,198,255,0.5)] transition-all hover:opacity-95"
                  style={{
                    background: 'linear-gradient(90deg, #00C6FF 0%, #0072FF 50%, #FF2E9A 100%)',
                    borderColor: '#00C6FF',
                    color: '#FFFFFF',
                  }}
                >
                  <Icon className="h-3 w-3 shrink-0" style={{ color: '#00C6FF' }} />
                  <span className="whitespace-nowrap uppercase">{label}</span>
                </button>
              );
            })}

            <Link
              to="/register"
              className="inline-flex h-[24px] shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-white/25 px-2.5 text-[10px] font-extrabold text-white shadow-[0_0_10px_rgba(255,46,154,0.55)] transition hover:opacity-90"
              style={{ backgroundColor: '#FF2E9A' }}
            >
              <span>Start Free</span>
              <ArrowRight className="h-3 w-3 shrink-0 text-white" />
            </Link>

            <button
              type="button"
              className="xl:hidden inline-flex items-center justify-center rounded-lg border border-[#00C6FF] bg-black p-1 text-[#00C6FF]"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Continuous App-Design Gradient Divider Line aligned with remote */}
      <div
        className="h-[3px] w-full"
        style={{
          background:
            'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)',
        }}
      />

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