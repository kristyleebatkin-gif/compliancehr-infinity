import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Award, Sparkles, ShieldCheck } from 'lucide-react';
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
        {/* Footer Brand & Bottom Controls Matching Top Header Layout */}
        <div
          className="rounded-3xl p-[12px] shadow-lg"
          style={{
            background:
              'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
          }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-4 rounded-[16px] bg-white px-2 py-5 sm:px-3 sm:py-6 text-center">
            {/* Centred Logo (1.5x Larger, No Border) + Centred App Name + Centred Slogan Underneath with Clear Spacing */}
            <Link to="/" className="mx-auto flex w-full flex-col items-center justify-center gap-3.5 text-center">
              <div className="mx-auto flex h-[10.5rem] w-[10.5rem] sm:h-[13.5rem] sm:w-[13.5rem] md:h-60 md:w-60 items-center justify-center bg-white">
                <Image
                  src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
                  alt="ComplianceHR Infinity logo"
                  className="h-full w-full object-contain"
                  fittingType="fit"
                />
              </div>

              <div className="mx-auto flex w-full items-center justify-center bg-white text-center font-editorial text-3xl sm:text-5xl md:text-[3.35rem] lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#0A2B6D] leading-tight whitespace-nowrap">
                <span className="mx-auto block whitespace-nowrap text-center">
                  Compliance
                  <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                    HR
                  </span>{' '}
                  <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                    Infinity
                  </span>
                </span>
              </div>

              <div className="mx-auto flex w-full flex-wrap items-center justify-center gap-x-1.5 bg-white px-2 text-center text-xs sm:text-sm font-extrabold">
                <span className="text-[#0072FF]">Complete Control.</span>
                <span className="text-[#5A00D6]">Greater Confidence.</span>
                <span className="text-[#FF2E9A]">Brighter Success.</span>
              </div>
            </Link>

            {/* NDIS & Aged care Documentation & Compliance Placed Just Above Slightly Increased & Centred Open, Landing and Signed In */}
            <div className="mx-auto flex w-full flex-col items-center justify-center gap-3 pt-1 text-center">
              <span
                className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
                style={{
                  background:
                    'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)',
                }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#FF2E9A]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#FF2E9A]" />
                </span>
                <span className="text-center">NDIS &amp; Aged care Documentation &amp; Compliance</span>
              </span>

              <div className="mx-auto grid w-full max-w-2xl grid-cols-1 sm:grid-cols-3 items-center justify-center gap-2.5">
                <Link
                  to="/dashboard"
                  className="mx-auto inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background:
                      'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
                  }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#0072FF]">
                    <Sparkles className="h-3.5 w-3.5 text-[#0072FF]" />
                  </span>
                  <span className="whitespace-nowrap text-center">Open App Dashboard</span>
                </Link>

                <Link
                  to="/"
                  className="mx-auto inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background:
                      'linear-gradient(120deg, #5A00D6 0%, #0072FF 36%, #A100FF 70%, #FF6EDB 100%)',
                  }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#5A00D6]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#5A00D6]" />
                  </span>
                  <span className="whitespace-nowrap text-center">Landing Page</span>
                </Link>

                <Link
                  to="/dashboard"
                  className="mx-auto inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background:
                      'linear-gradient(120deg, #0072FF 0%, #A100FF 48%, #FF2E9A 82%, #00C6FF 100%)',
                  }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#A100FF]">
                    <Award className="h-3.5 w-3.5 text-[#A100FF]" />
                  </span>
                  <span className="whitespace-nowrap text-center">Signed In</span>
                </Link>
              </div>
            </div>
          </div>
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