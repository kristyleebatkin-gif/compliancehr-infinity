import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function LandingFooter() {
  const cols = [
    { title: 'Platform', links: ['Staff Tracking', 'Participant Records', 'Incidents', 'Risk Management', 'Training', 'Audit Centre'] },
    { title: 'Company', links: ['About', 'Contact', 'Privacy Policy', 'Terms of Service'] },
    { title: 'Resources', links: ['Help Centre', 'NDIS Compliance Guide', 'Documentation', 'Security'] },
  ];

  return (
    <footer className="border-t border-violet-900 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white">Compliance<span className="text-cyan-300">HR</span></span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/60">Comprehensive compliance management for disability and community service providers.</p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold text-white">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}><a href="#features" className="text-sm text-white/55 transition-colors hover:text-cyan-300">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} ComplianceHR. All rights reserved.</p>
          <p className="text-xs text-white/40">Built for NDIS & community service providers</p>
        </div>
      </div>
    </footer>
  );
}