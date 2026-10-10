import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => setAuthed(false));
  }, []);

  const links = [
    { label: 'Quick Start', href: '#quick-start' },
    { label: 'Features', href: '#features' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Why ComplianceHR', href: '#why' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-violet-200/60 bg-white/90 shadow-sm shadow-violet-500/5 backdrop-blur-xl dark:border-violet-900/40 dark:bg-background/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">Compliance<span className="text-brand">HR</span></span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="relative text-sm font-medium text-foreground/70 transition-colors after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-violet-600 after:to-cyan-500 after:transition-all hover:text-violet-700 hover:after:w-full">{l.label}</a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {authed ? (
            <Link to="/dashboard" className="rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground">Sign in</Link>
              <Link to="/register" className="rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg">Get started</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen((v) => !v)} className="md:hidden" aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-foreground/70">{l.label}</a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {authed ? (
                <Link to="/dashboard" className="rounded-lg bg-brand px-4 py-2 text-center text-sm font-semibold text-white">Go to Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="rounded-lg border border-border px-4 py-2 text-center text-sm font-semibold">Sign in</Link>
                  <Link to="/register" className="rounded-lg bg-brand px-4 py-2 text-center text-sm font-semibold text-white">Get started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}