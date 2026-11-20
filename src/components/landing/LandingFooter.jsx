import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';

const FOOTER_LINKS = [['Platform', '#solution'], ['Pricing', '#pricing'], ['About', '#about'], ['FAQs', '#faq']];

export default function LandingFooter({ onBookDemo }) {
  return (
    <footer className="border-t border-white/10 bg-[#071D4B] px-5 py-8 text-white">
      <div className="mx-auto grid max-w-[1280px] gap-8 sm:grid-cols-3">
        <div>
          <Link to="/" aria-label="ComplianceHR Infinity home"><BrandLogoLockup size="xs" theme="dark" showSlogan /></Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100/80">A connected workspace for people, service delivery, governance and business operations.</p>
        </div>
        <nav aria-label="Footer platform navigation">
          <h2 className="mb-2 font-bold">Explore</h2>
          {FOOTER_LINKS.map(([label,href]) => <a key={href} href={href} className="block min-h-11 py-3 text-sm text-blue-100 hover:text-white">{label}</a>)}
        </nav>
        <nav aria-label="Access and support">
          <h2 className="mb-2 font-bold">Access and support</h2>
          <button type="button" onClick={() => onBookDemo?.('Platform walkthrough')} className="block min-h-11 py-3 text-left text-sm text-blue-100 hover:text-white">Book a walkthrough</button>
          <Link to="/login" className="block min-h-11 py-3 text-sm text-blue-100 hover:text-white">Sign in</Link>
          <a href="mailto:support@compliancehr.com.au" className="block min-h-11 break-words py-3 text-sm text-blue-100 hover:text-white">Contact support</a>
          <Link to="/report-complaint" className="block min-h-11 py-3 text-sm text-blue-100 hover:text-white">Feedback and complaints</Link>
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-[1280px] border-t border-white/15 pt-4 text-xs text-blue-100/70">© {new Date().getFullYear()} ComplianceHR Infinity. All rights reserved.</p>
    </footer>
  );
}
