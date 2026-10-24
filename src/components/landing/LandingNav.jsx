import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';

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

  const links = [
    { label: 'Control Centre', href: '#infinity-control-centre' },
    { label: '1-Click Ops', href: '#infinity-one-click-operations' },
    { label: 'Core Engine', href: '#infinity-core-engine' },
    { label: 'Live Office & Profiles', href: '#live-workspace' },
    { label: 'Quick Start', href: '#quick-start' },
    { label: 'Features', href: '#features' },
    { label: 'Express Audit', href: '#express-audit' },
    { label: 'Blueprint', href: '#blueprint' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <header className={`sticky top-0 z-40 border-b border-violet-200 bg-white/95 backdrop-blur-2xl transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 md:px-6">
        <Link to="/" className="group flex shrink-0 items-center gap-2">
          <Image src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png" alt="ComplianceHR Infinity logo" className="h-10 w-10 rounded-xl shadow-md ring-1 ring-violet-200 transition-transform group-hover:scale-105" fittingType="fit" />
          <span className="font-editorial text-lg font-semibold tracking-tight text-foreground">
            Compliance<span className="font-editorial-italic bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">HR</span>
            <span className="ml-1.5 hidden align-middle text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600 sm:inline">Infinity</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-3 md:flex lg:gap-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="group relative text-xs font-bold tracking-wide text-foreground/75 transition-colors hover:text-violet-700">
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {authed ? (
            <Link to="/dashboard" className="rounded-full gradient-brand px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-xs font-bold text-violet-800 transition-colors hover:text-violet-950">Sign in</Link>
              <Link to="/register" className="rounded-full gradient-brand px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">Get started</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen((v) => !v)} className="md:hidden" aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-violet-200 bg-white/95 px-4 py-4 backdrop-blur-xl">
          <div className="flex flex-col gap-2">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-violet-50 hover:text-violet-700">{l.label}</a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {authed ? (
                <Link to="/dashboard" className="rounded-full gradient-brand px-4 py-2.5 text-center text-sm font-bold text-white">Go to Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="rounded-full border border-violet-300 px-4 py-2.5 text-center text-sm font-bold text-violet-900">Sign in</Link>
                  <Link to="/register" className="rounded-full gradient-brand px-4 py-2.5 text-center text-sm font-bold text-white">Get started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}