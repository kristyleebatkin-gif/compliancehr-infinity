import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';

const LINKS = [['Platform', '#solution'], ['Pricing', '#pricing'], ['About', '#about'], ['FAQs', '#faq']];

export default function LandingNav({ onBookDemo }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);

  const closeMenu = () => setOpen(false);
  return (
    <header id="top-landing" className="sticky top-0 z-40 border-b border-white/10 bg-[#0A2B6D]/95 text-white shadow-sm backdrop-blur-xl md:static">
      <a href="#landing-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3 focus:text-[#0A2B6D]">Skip to content</a>
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" aria-label="ComplianceHR Infinity home" className="max-w-[200px]"><BrandLogoLockup size="xs" theme="dark" showSlogan compactSlogan /></Link>
        <nav aria-label="Public navigation" className="hidden items-center gap-1 lg:flex">
          {LINKS.map(([label,href]) => <a key={href} href={href} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-blue-50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{label}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="inline-flex min-h-11 items-center rounded-lg border border-white/30 px-3 py-2 text-sm font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Sign in</Link>
          <button type="button" onClick={() => onBookDemo?.('Platform walkthrough')} className="inline-flex min-h-11 items-center rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#0A2B6D] hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Book a walkthrough</button>
          <button type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-controls="public-mobile-menu" aria-expanded={open} onClick={() => setOpen(!open)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/30 lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      <nav id="public-mobile-menu" aria-label="Mobile public navigation" hidden={!open} className="border-t border-white/15 bg-[#0A2B6D]/95 px-4 py-3 lg:hidden">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-2 sm:grid-cols-4">{LINKS.map(([label,href]) => <a key={href} href={href} onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{label}</a>)}</div>
      </nav>
    </header>
  );
}