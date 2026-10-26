import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

const links = [
  ['Features', '#features'],
  ['How it works', '#quick-start'],
  ['App overview', '#blueprint'],
  ['Pricing', '#pricing'],
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header id="top-landing" className="business-landing-nav bg-white">
      <div className="business-nav-inner">
        <Link to="/" className="business-brand" aria-label="ComplianceHR Infinity home">
          <img src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/6bf497716_generated_image.png" alt="" />
          <span><strong>ComplianceHR <span>Infinity</span></strong><small>Complete Control. Greater Confidence. Brighter Success.</small></span>
        </Link>
        <nav aria-label="Main navigation" className="business-desktop-links">
          {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <div className="business-nav-actions">
          <Link to="/login" className="business-sign-in">Sign in</Link>
          <Link to="/register" className="business-trial">Start free trial <ArrowRight size={16} aria-hidden="true" /></Link>
          <button type="button" className="business-menu" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="landing-mobile-navigation" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && <nav id="landing-mobile-navigation" aria-label="Mobile navigation" className="business-mobile-links">
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>}
    </header>
  );
}
