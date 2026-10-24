import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';

const SQUISHED_GRADIENT =
  'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';

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
    <footer
      className="relative overflow-hidden border-t-2 border-violet-300 text-white"
      style={{ background: SQUISHED_GRADIENT }}
    >
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-1 shadow-md">
                <Image
                  src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
                  alt="ComplianceHR Infinity logo"
                  className="h-full w-full object-contain"
                  fittingType="fit"
                />
              </div>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="font-editorial text-xl font-bold tracking-tight text-white">
                  Compliance<span className="font-editorial-italic text-amber-200">HR</span>
                </span>
                <span className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-amber-200">Infinity</span>
              </span>
            </Link>
            <p className="mt-4 text-sm font-bold leading-relaxed text-white/95">
              Complete Control. Greater Confidence. Brighter Success.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-200">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <Link to={linkHref(c, l)} className="text-sm font-semibold text-white/90 transition-colors hover:text-amber-200">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/25 pt-6 text-center sm:flex-row sm:text-left">
          <div className="space-y-0.5 text-xs font-extrabold text-white">
            <div>Software: ComplianceHR Infinity</div>
            <div className="text-amber-200">Complete Control. Greater Confidence. Brighter Success.</div>
          </div>
          <div className="space-y-0.5 text-xs font-extrabold text-white sm:text-right">
            <div>Developer: Kristy Lee Whelan</div>
            <div className="text-amber-200">Email: kristyleebatkin@live.com.au</div>
          </div>
        </div>
      </div>
    </footer>
  );
}