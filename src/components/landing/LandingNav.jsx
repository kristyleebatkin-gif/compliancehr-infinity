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
    { label: 'Express Audit', href: '#express-audit' },
    { label: 'Features', href: '#features' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Why ComplianceHR', href: '#why' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-md shadow-slate-900/20 transition-transform group-hover:scale-105 dark:bg-white dark:text-slate-950">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-editorial text-xl font-semibold tracking-tight text-foreground">
            Compliance<span className="font-editorial-italic bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">HR</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="group relative text-[13px] font-semibold tracking-wide text-foreground/60 transition-colors hover:text-foreground">
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {authed ? (
            <Link to="/dashboard" className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-white dark:text-slate-950">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-foreground/60 transition-colors hover:text-foreground">Sign in</Link>
              <Link to="/register" className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-white dark:text-slate-950">Get started</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen((v) => !v)} className="md:hidden" aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200/70 bg-white/95 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-background/95">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-semibold text-foreground/70">{l.label}</a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {authed ? (
                <Link to="/dashboard" className="rounded-full bg-slate-950 px-4 py-2.5 text-center text-sm font-semibold text-white dark:bg-white dark:text-slate-950">Go to Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="rounded-full border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold dark:border-white/15">Sign in</Link>
                  <Link to="/register" className="rounded-full bg-slate-950 px-4 py-2.5 text-center text-sm font-semibold text-white dark:bg-white dark:text-slate-950">Get started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}