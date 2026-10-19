import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';

export default function LandingFooter() {
  const cols = [
    { title: 'Platform', links: ['Staff Tracking', 'Participant Records', 'Incidents', 'Risk Management', 'Training', 'Audit Centre'] },
    { title: 'Company', links: ['About', 'Contact'] },
    { title: 'Resources', links: ['Help Centre', 'NDIS Compliance Guide', 'Documentation', 'Security'] },
    { title: 'Get Involved', links: ['Volunteer With Us', 'Raise a Complaint'] },
  ];

  const linkHref = (col, link) => {
    if (col.title === 'Get Involved') {
      return link === 'Volunteer With Us' ? '/volunteer-apply' : '/report-complaint';
    }
    const paths = {
      'Staff Tracking': '/staff',
      'Participant Records': '/participants',
      'Incidents': '/incidents',
      'Risk Management': '/risks',
      'Training': '/training',
      'Audit Centre': '/compliance',
      'Help Centre': '/help',
      'NDIS Compliance Guide': '/ndis-portal',
      'Documentation': '/user-guides',
      'Security': '/compliance',
      'About': '#why',
      'Contact': '/help',
    };
    return paths[link] || '#features';
  };

  return (
    <footer className="relative overflow-hidden border-t border-slate-900 bg-slate-950 text-white">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[48rem] -translate-x-1/2 rounded-full bg-violet-500/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-56 w-56 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-10 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <Image src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/4498c433a_generated_image.png" alt="ComplianceHR Infinity logo" className="h-14 w-14 shrink-0 rounded-2xl shadow-md ring-1 ring-white/20" fittingType="fit" />
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="font-editorial text-xl font-semibold tracking-tight text-white">
                  Compliance<span className="font-editorial-italic bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">HR</span>
                </span>
                <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-300">Infinity</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/55">Complete Control. Greater Confidence. Brighter Success.</p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}><Link to={linkHref(c, l)} className="text-sm text-white/55 transition-colors hover:text-white">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} ComplianceHR Infinity. All rights reserved.</p>
          <p className="text-xs text-white/40">Built for NDIS & community service providers</p>
        </div>
      </div>
    </footer>
  );
}