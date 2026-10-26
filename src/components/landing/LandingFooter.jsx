import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Award, Sparkles, ShieldCheck, Layers } from 'lucide-react';
import { Image } from '@/components/ui/image';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';
const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';

export default function LandingFooter() {
  const cols = [
    {
      title: 'Platform',
      links: ['Staff Tracking', 'Participant Records', 'Incidents', 'Risk Management', 'Training', 'Audit Centre'],
    },
    {
      title: 'Company',
      links: ['About', 'Contact'],
    },
    {
      title: 'Resources',
      links: ['Help Centre', 'NDIS Compliance Guide', 'Documentation', 'Security'],
    },
    {
      title: 'Get Involved',
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
    <footer className="relative overflow-hidden border-t-4 border-[#0A2B6D] bg-white py-4 px-[0.5cm] space-y-4">
      {/* Footer Brand Section Matching Exact Top Header Design */}
      <div
        className="rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="flex w-full flex-col items-center justify-center overflow-hidden rounded-[16px] bg-white px-2 pt-0 pb-4 sm:px-3 sm:pt-0 sm:pb-4 text-center">
          <Link to="/" className="mx-auto flex w-full flex-col items-center justify-center text-center">
            <div className="-mt-3 sm:-mt-4 md:-mt-5 mx-auto flex h-[10.5rem] w-[10.5rem] sm:h-[13.5rem] sm:w-[13.5rem] md:h-60 md:w-60 items-center justify-center">
              <Image
                src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
                alt="ComplianceHR Infinity logo"
                className="h-full w-full object-contain"
                fittingType="fit"
              />
            </div>

            <div className="-mt-7 sm:-mt-9 md:-mt-11 mb-5 sm:mb-6 relative z-10 mx-auto flex w-full flex-col items-center justify-center text-center">
              <div className="mx-auto flex w-full items-center justify-center bg-transparent text-center font-editorial text-3xl sm:text-5xl md:text-[3.35rem] lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#0A2B6D] leading-tight whitespace-nowrap">
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

              <div className="mt-1 mx-auto flex w-full flex-wrap items-center justify-center gap-x-1.5 bg-transparent px-2 text-center text-xs sm:text-sm md:text-base font-extrabold">
                <span className="text-[#0072FF]">Complete Control.</span>
                <span className="text-[#5A00D6]">Greater Confidence.</span>
                <span className="text-[#FF2E9A]">Brighter Success.</span>
              </div>
            </div>
          </Link>

          <div className="mx-auto flex w-full flex-col items-center justify-center gap-2.5 text-center">
            <span
              className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
              style={{ background: BADGE_GRADIENT }}
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

      {/* Footer Navigation & Attribution Framed in Top Section Design */}
      <div
        className="rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] bg-white p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cols.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-sm space-y-3"
              >
                <span
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-white"
                  style={{ background: BADGE_GRADIENT }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white text-[#5A00D6]">
                    <Layers className="h-3 w-3 text-[#5A00D6]" />
                  </span>
                  <span>{c.title}</span>
                </span>
                <ul className="space-y-2">
                  {c.links.map((l) => (
                    <li key={l}>
                      <Link
                        to={linkHref(c, l)}
                        className="flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF]"
                      >
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                          style={{ background: ICON_GRADIENT }}
                        >
                          <Sparkles className="h-2.5 w-2.5 text-white" />
                        </span>
                        <span>{l}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 items-stretch">
            <div className="flex items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] bg-white px-4 py-2 text-center shadow-2xs">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                style={{ background: ICON_GRADIENT }}
              >
                <Award className="h-3.5 w-3.5 text-white" />
              </span>
              <div className="text-xs font-extrabold text-[#0A2B6D]">
                Software: ComplianceHR Infinity
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] bg-white px-4 py-2 text-center shadow-2xs">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                style={{ background: ICON_GRADIENT }}
              >
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </span>
              <div className="text-xs font-extrabold text-[#0A2B6D]">
                <span className="text-[#0072FF]">Complete Control.</span>{' '}
                <span className="text-[#5A00D6]">Greater Confidence.</span>{' '}
                <span className="text-[#FF2E9A]">Brighter Success.</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] bg-white px-4 py-2 text-center shadow-2xs">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                style={{ background: ICON_GRADIENT }}
              >
                <Mail className="h-3.5 w-3.5 text-white" />
              </span>
              <div className="text-xs font-extrabold text-[#0A2B6D]">
                Developer: Kristy Lee Whelan ·{' '}
                <a
                  href="mailto:kristyleebatkin@live.com.au"
                  className="text-[#5A00D6] underline hover:text-[#FF2E9A]"
                >
                  kristyleebatkin@live.com.au
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}