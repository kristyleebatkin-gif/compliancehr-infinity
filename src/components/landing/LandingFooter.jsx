import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Award, Sparkles } from 'lucide-react';
import { Image } from '@/components/ui/image';

const SQUISHED_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';

export default function LandingFooter() {
  const cols = [
    {
      title: 'Platform',
      color: '#0072FF',
      links: ['Staff Tracking', 'Participant Records', 'Incidents', 'Risk Management', 'Training', 'Audit Centre'],
    },
    {
      title: 'Company',
      color: '#5A00D6',
      links: ['About', 'Contact'],
    },
    {
      title: 'Resources',
      color: '#A100FF',
      links: ['Help Centre', 'NDIS Compliance Guide', 'Documentation', 'Security'],
    },
    {
      title: 'Get Involved',
      color: '#FF2E9A',
      links: ['Volunteer With Us', 'Raise a Complaint'],
    },
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
      className="relative overflow-hidden border-t-4 border-[#0A2B6D] py-6 px-[0.5cm]"
      style={{ background: SQUISHED_GRADIENT }}
    >
      <div className="w-full rounded-3xl border-3 border-[#0A2B6D] bg-white p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Open Dashboard Placed at Bottom of Screen ABOVE Landing Page & Shown in App Colours */}
        <div className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 text-center shadow-sm">
          <Link
            to="/dashboard"
            className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-6 py-3 text-sm sm:text-base font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{
              background:
                'linear-gradient(120deg, #0072FF 0%, #0A2B6D 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
            }}
          >
            <Sparkles className="h-4 w-4 text-white" />
            <span>Open App Dashboard</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-5 py-1.5 text-xs font-extrabold text-[#0A2B6D] shadow-sm hover:bg-[#F5F0FF]"
          >
            <span>Landing Page</span>
          </Link>

          <Link to="/" className="mt-1 flex flex-col items-center gap-1.5">
            <div className="flex h-20 w-36 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white p-0 shadow-sm">
              <Image
                src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
                alt="ComplianceHR Infinity logo"
                className="h-full w-full block object-cover"
                fittingType="fill"
              />
            </div>
            <span className="font-editorial text-2xl sm:text-3xl font-extrabold tracking-wide text-[#0A2B6D]">
              Compliance
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                HR
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                Infinity
              </span>
            </span>
            <span className="inline-flex items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-4 py-0.5 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-2xs">
              NDIS &amp; Aged Care Compliance
            </span>
          </Link>
        </div>

        {/* 4 Spacious White Columns for Navigation Links — Never Jammed & 100% Readable */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cols.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-sm"
              style={{ borderTopWidth: '4px', borderTopColor: c.color }}
            >
              <h4
                className="inline-block rounded-full border border-[#0A2B6D] px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-white"
                style={{ backgroundColor: c.color }}
              >
                {c.title}
              </h4>
              <ul className="mt-3 space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <Link
                      to={linkHref(c, l)}
                      className="block rounded-lg border border-[#0A2B6D]/20 bg-white px-2.5 py-1 text-xs font-extrabold text-[#0A2B6D] transition-colors hover:bg-[#F5F0FF] hover:text-[#5A00D6]"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Software & Developer Attribution Bar — Crisp White Cards, Centered & Uncluttered */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 items-stretch">
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 text-center shadow-2xs">
            <span className="mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#0072FF] text-white">
              <Award className="h-3.5 w-3.5 text-white" />
            </span>
            <div className="text-xs font-extrabold text-[#0A2B6D]">
              Software: ComplianceHR Infinity
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 text-center shadow-2xs">
            <span className="mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF2E9A] text-white">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </span>
            <div className="text-xs font-extrabold text-[#0A2B6D]">
              Complete Control. <span className="text-[#5A00D6]">Greater Confidence.</span>{' '}
              <span className="text-[#FF2E9A]">Brighter Success.</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 text-center shadow-2xs">
            <span className="mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#5A00D6] text-white">
              <Mail className="h-3.5 w-3.5 text-white" />
            </span>
            <div className="text-xs font-extrabold text-[#0A2B6D]">
              Developer: Kristy Lee Whelan
            </div>
            <a
              href="mailto:kristyleebatkin@live.com.au"
              className="text-xs font-extrabold text-[#5A00D6] underline hover:text-[#FF2E9A]"
            >
              kristyleebatkin@live.com.au
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}