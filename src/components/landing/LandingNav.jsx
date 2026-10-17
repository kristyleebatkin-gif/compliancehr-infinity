import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 md:px-6">
        <Link to="/" className="group flex shrink-0 items-center gap-2">
          <img src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/ce2c32d94_generated_image.png" alt="ComplianceHR Infinitely" className="h-8 w-8 rounded-xl bg-white object-contain shadow-md shadow-slate-900/10 ring-1 ring-slate-200 transition-transform group-hover:scale-105 dark:bg-white dark:ring-white/10" />
          <span className="font-editorial text-lg font-semibold tracking-tight text-foreground">
            Compliance<span className="font-editorial-italic bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">HR</span>
            <span className="ml-1.5 hidden align-middle text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600 sm:inline dark:text-violet-400">Infinitely</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex lg:gap-5">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="group relative text-[13px] font-semibold tracking-wide text-foreground/60 transition-colors hover:text-foreground">
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {authed ? (
            <Link to="/dashboard" className="rounded-full bg-slate-950 px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-md shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-white dark:text-slate-950">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-[13px] font-semibold text-foreground/60 transition-colors hover:text-foreground">Sign in</Link>
              <Link to="/register" className="rounded-full bg-slate-950 px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-md shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-white dark:text-slate-950">Get started</Link>
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