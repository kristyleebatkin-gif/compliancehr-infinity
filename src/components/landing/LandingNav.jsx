import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';

const LINKS = [['Platform', '#blueprint'], ['Solutions', '#solution'], ['Pricing', '#pricing'], ['About', '#about'], ['FAQs', '#faq']];

export default function LandingNav({ onBookDemo }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  return <header id="top-landing" className="sticky top-0 z-40 bg-[#0A2B6D]/95 text-white backdrop-blur-md">
    <a href="#landing-content" className="sr-only focus:not-sr-only focus:block focus:bg-white focus:p-3 focus:text-[#0A2B6D]">Skip to content</a>
    <div className="h-1 bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A]" />
    <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <Link to="/" aria-label="ComplianceHR Infinity home" className="max-w-[200px]"><BrandLogoLockup size="xs" theme="dark" showSlogan compactSlogan /></Link>
      <nav aria-label="Public navigation" className="hidden items-center gap-1 xl:flex">
        {LINKS.map(([label, href]) => <a key={href} href={href} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white">{label}</a>)}
      </nav>
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/login" className="rounded-lg border border-white/40 px-3 py-3 text-sm font-semibold">Sign In</Link>
        <button type="button" onClick={() => onBookDemo?.('Book a Personal Demo')} className="rounded-lg bg-[#0072FF] px-3 py-3 text-sm font-bold text-white">Book Demo</button>
        <Link to="/register" className="hidden rounded-lg bg-[#FF2E9A] px-3 py-3 text-sm font-bold text-white sm:inline-flex">Start Free Trial</Link>
        <button type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-controls="public-mobile-menu" aria-expanded={open} onClick={() => setOpen(!open)} className="rounded-lg border border-white/40 p-3 xl:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </div>
    <nav id="public-mobile-menu" aria-label="Mobile public navigation" hidden={!open} className="border-t border-white/20 px-4 py-3 xl:hidden">
      <div className="grid grid-cols-2 gap-2">{LINKS.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-white/10">{label}</a>)}
        <Link to="/register" className="rounded-lg bg-[#FF2E9A] px-3 py-3 text-sm font-bold">Start Free Trial</Link>
      </div>
    </nav>
  </header>;
}
