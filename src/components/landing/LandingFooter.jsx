import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import { MODULE_DIRECTORY, NAV_GROUPS } from '@/lib/moduleDirectory';

export default function LandingFooter({ onBookDemo }) {
  return <footer className="border-t border-[#0072FF]/20 bg-[#0A2B6D] px-5 py-8 text-white">
    <div className="mx-auto grid max-w-[1440px] gap-6 sm:grid-cols-3">
      <div><Link to="/" aria-label="ComplianceHR Infinity home"><BrandLogoLockup size="xs" theme="dark" showSlogan /></Link><p className="mt-4 text-sm">{MODULE_DIRECTORY.length} connected workspaces across {NAV_GROUPS.length} navigation groups.</p></div>
      <nav aria-label="Footer platform navigation"><h2 className="mb-2 font-bold">Explore</h2>{[['Platform', '#blueprint'], ['Solutions', '#solution'], ['Pricing', '#pricing'], ['About', '#about'], ['FAQs', '#faq']].map(([label, href]) => <a key={href} href={href} className="block min-h-11 py-3 text-sm">{label}</a>)}</nav>
      <nav aria-label="Footer support navigation"><h2 className="mb-2 font-bold">Access & support</h2>
        <button type="button" onClick={() => onBookDemo?.('Book a Personal Demo')} className="block min-h-11 py-3 text-sm">Book Demo</button>
        <Link to="/login" className="block min-h-11 py-3 text-sm">Sign In</Link>
        <Link to="/register" className="block min-h-11 py-3 text-sm">Start Free Trial</Link>
        <a href="mailto:support@compliancehr.com.au" className="block min-h-11 break-words py-3 text-sm">Contact support</a>
        <Link to="/report-complaint" className="block min-h-11 py-3 text-sm">Public Feedback & Complaints</Link>
        <Link to="/volunteer-apply" className="block min-h-11 py-3 text-sm">Volunteer Intake</Link>
      </nav>
    </div>
    <p className="mx-auto mt-6 max-w-[1440px] border-t border-white/20 pt-4 text-sm">© {new Date().getFullYear()} ComplianceHR Infinity. All rights reserved.</p>
  </footer>;
}
