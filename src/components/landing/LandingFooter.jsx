import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Award, Sparkles, ShieldCheck, Layers } from 'lucide-react';
import { getTilePalette, getHeaderView, getSymbolView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
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
            <div
              className="mt-0 mx-auto relative overflow-hidden w-[15rem] sm:w-[19.5rem] md:w-[23rem] bg-white"
              style={{ aspectRatio: '100 / 50' }}
            >
              <img
                src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/6bf497716_generated_image.png"
                alt="ComplianceHR Infinity logo"
                className="w-full pointer-events-none select-none"
                style={{
                  marginTop: '-5.5%',
                }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-0 bg-white"
                style={{ width: '24%', height: '6%' }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 bg-white"
                style={{ left: '42.5%', width: '5.5%', height: '3.8%' }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 right-0 bg-white"
                style={{ width: '25%', height: '6%' }}
              />
            </div>

            <div className="mt-2 sm:mt-3 mb-5 sm:mb-6 relative z-10 mx-auto flex w-full flex-col items-center justify-center text-center">
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
            {cols.map((c, cIdx) => (
              <div
                key={c.title}
                className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-sm space-y-3"
              >
                <span
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-white"
                  style={{ background: getHeaderView(cIdx) }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                    <Layers className="h-3 w-3 text-white" />
                  </span>
                  <span>{c.title}</span>
                </span>
                <ul className="space-y-2">
                  {c.links.map((l, lIdx) => {
                    const tile = getTilePalette(cIdx * 3 + lIdx);
                    const sym = getSymbolView(cIdx * 3 + lIdx);
                    return (
                      <li key={l}>
                        <Link
                          to={linkHref(c, l)}
                          className="flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-3 py-1.5 text-xs font-extrabold transition-all hover:-translate-y-0.5 hover:shadow-sm"
                          style={{ backgroundColor: tile.bg, color: tile.text }}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] bg-white">
                            <Sparkles className="h-2.5 w-2.5" style={{ color: sym.iconColor }} />
                          </span>
                          <span style={{ color: tile.text }}>{l}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 items-stretch">
            {[
              { icon: Award, text: 'Software: ComplianceHR Infinity' },
              { icon: Sparkles, text: 'Complete Control. Greater Confidence. Brighter Success.' },
              { icon: Mail, text: 'Developer: Kristy Lee Whelan · kristyleebatkin@live.com.au', href: 'mailto:kristyleebatkin@live.com.au' },
            ].map((item, idx) => {
              const Icon = item.icon;
              const tile = getTilePalette(idx + 4);
              const sym = getSymbolView(idx + 4);
              return (
                <div
                  key={item.text}
                  className="flex items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-4 py-2 text-center shadow-2xs"
                  style={{ backgroundColor: tile.bg, color: tile.text }}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white">
                    <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                  </span>
                  {item.href ? (
                    <a href={item.href} className="text-xs font-extrabold underline" style={{ color: tile.text }}>
                      {item.text}
                    </a>
                  ) : (
                    <div className="text-xs font-extrabold" style={{ color: tile.text }}>
                      {item.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}