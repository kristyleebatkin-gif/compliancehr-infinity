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
    <footer className="relative overflow-hidden border-t border-slate-900 bg-slate-950 text-white">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[48rem] -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="font-editorial text-xl font-semibold tracking-tight text-white">
                Compliance<span className="font-editorial-italic bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">HR</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/55">Comprehensive compliance management for disability and community service providers.</p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}><a href="#features" className="text-sm text-white/55 transition-colors hover:text-white">{l}</a></li>
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