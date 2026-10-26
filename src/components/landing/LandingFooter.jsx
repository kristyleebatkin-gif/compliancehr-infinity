import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Award, Sparkles, ShieldCheck, Cpu, FileText } from 'lucide-react';
import { getHeaderView, getSymbolView, getAppBorderView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';
const UNIFORM_SPRAY_BG =
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF';

export default function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t-4 border-[#0A2B6D] bg-white py-2 px-[0.5cm] space-y-2.5 text-center">
      {/* 1. Footer Brand Logo Section Matching Exact Top Header Design */}
      <div
        className="rounded-3xl p-[10px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="flex w-full flex-col items-center justify-center overflow-hidden rounded-[16px] bg-white px-2 pt-2 pb-2.5 sm:px-3 sm:pt-2.5 sm:pb-3 text-center">
          <Link to="/" className="mx-auto flex w-full flex-col items-center justify-center text-center">
            <div
              className="mt-3.5 sm:mt-4 mx-auto relative overflow-hidden w-[13.5rem] sm:w-[17rem] md:w-[20rem] bg-white"
              style={{ aspectRatio: '100 / 46' }}
            >
              <img
                src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/6bf497716_generated_image.png"
                alt="ComplianceHR Infinity logo"
                className="w-full pointer-events-none select-none"
                style={{
                  marginTop: '-9.5%',
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

            <div className="mt-1.5 sm:mt-2 mb-2 sm:mb-2.5 relative z-10 mx-auto inline-flex max-w-full flex-col items-center justify-center text-center">
              <div className="mx-auto flex items-center justify-center bg-transparent text-center font-editorial text-3xl sm:text-5xl md:text-[3.35rem] lg:text-6xl font-extrabold tracking-tight text-[#0A2B6D] leading-tight whitespace-nowrap">
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

              <div className="mt-1 mx-auto flex w-[96%] items-center justify-between gap-x-1.5 bg-transparent text-center text-[10px] sm:text-sm md:text-[15.5px] lg:text-[18.5px] font-extrabold tracking-wide whitespace-nowrap">
                <span className="text-[#0072FF]">Complete Control.</span>
                <span className="text-[#5A00D6]">Greater Confidence.</span>
                <span className="text-[#FF2E9A]">Brighter Success.</span>
              </div>
            </div>
          </Link>

          <div className="mx-auto flex w-full flex-col items-center justify-center gap-1.5 text-center">
            {/* Smaller NDIS Stretched From Side to Side */}
            <span
              className="flex min-h-[20px] w-full items-center justify-center gap-1.5 rounded-full border border-[#0A2B6D] px-3 py-0.5 text-[9.5px] sm:text-[10.5px] font-extrabold tracking-wide text-white shadow-2xs"
              style={{ background: BADGE_GRADIENT }}
            >
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#FF2E9A]">
                <ShieldCheck className="h-2 w-2 text-[#FF2E9A]" />
              </span>
              <span className="text-center">NDIS &amp; Aged Care Documentation &amp; Compliance</span>
            </span>

            {/* Dashboard, Landing Page & Signed In 50% Smaller */}
            <div className="grid w-full grid-cols-1 sm:grid-cols-3 items-center justify-center gap-1.5">
              <Link
                to="/dashboard"
                className="inline-flex min-h-[22px] w-full items-center justify-center gap-1.5 rounded-full border border-[#0A2B6D] px-2.5 py-0.5 text-[9.5px] sm:text-[10.5px] font-extrabold text-white shadow-2xs transition-all hover:-translate-y-0.5"
                style={{
                  background:
                    'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
                }}
              >
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#0072FF]">
                  <Sparkles className="h-2 w-2 text-[#0072FF]" />
                </span>
                <span className="whitespace-nowrap text-center">Dashboard</span>
              </Link>

              <Link
                to="/"
                className="inline-flex min-h-[22px] w-full items-center justify-center gap-1.5 rounded-full border border-[#0A2B6D] px-2.5 py-0.5 text-[9.5px] sm:text-[10.5px] font-extrabold text-white shadow-2xs transition-all hover:-translate-y-0.5"
                style={{
                  background:
                    'linear-gradient(120deg, #5A00D6 0%, #0072FF 36%, #A100FF 70%, #FF6EDB 100%)',
                }}
              >
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#5A00D6]">
                  <ShieldCheck className="h-2 w-2 text-[#5A00D6]" />
                </span>
                <span className="whitespace-nowrap text-center">Landing Page</span>
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex min-h-[22px] w-full items-center justify-center gap-1.5 rounded-full border border-[#0A2B6D] px-2.5 py-0.5 text-[9.5px] sm:text-[10.5px] font-extrabold text-white shadow-2xs transition-all hover:-translate-y-0.5"
                style={{
                  background:
                    'linear-gradient(120deg, #0072FF 0%, #A100FF 48%, #FF2E9A 82%, #00C6FF 100%)',
                }}
              >
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#A100FF]">
                  <Award className="h-2 w-2 text-[#A100FF]" />
                </span>
                <span className="whitespace-nowrap text-center">Signed In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Minimised Contact Us Section With White Writing Background */}
      <div
        className="rounded-3xl p-[10px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div
          className="flex w-full flex-col items-center justify-center overflow-hidden rounded-[16px] px-3 py-2 sm:px-4 sm:py-2.5 text-center space-y-1.5"
          style={{ background: UNIFORM_SPRAY_BG }}
        >
          {/* Minimised Contact ComplianceHR Infinity on One Line Inside Pure White Writing Box */}
          <div className="mx-auto flex w-full flex-col items-center justify-center rounded-xl border border-[#0A2B6D]/25 bg-white px-3 py-1 text-center space-y-0.5">
            <div className="mx-auto flex w-full items-center justify-center text-center font-editorial text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-[#0A2B6D] leading-tight whitespace-nowrap">
              <span className="mx-auto block whitespace-nowrap text-center">
                Contact{' '}
                <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  ComplianceHR
                </span>{' '}
                <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                  Infinity
                </span>
              </span>
            </div>
            <div className="mx-auto flex w-full flex-wrap items-center justify-center gap-x-2 px-2 text-center text-[9px] sm:text-[10px] font-extrabold">
              <span className="text-[#0072FF]">Software Enquiries.</span>
              <span className="text-[#5A00D6]">Onboarding Support.</span>
              <span className="text-[#FF2E9A]">Direct Developer Contact.</span>
            </div>
          </div>

          {/* Minimised Contact Stretched From Side to Side */}
          <span
            className="flex min-h-[20px] w-full items-center justify-center gap-1.5 rounded-full border border-[#0A2B6D] px-3 py-0.5 text-[9.5px] sm:text-[10.5px] font-extrabold tracking-wide text-white shadow-2xs"
            style={{ background: BADGE_GRADIENT, color: '#FFFFFF' }}
          >
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#FF2E9A]">
              <Mail className="h-2 w-2 text-[#FF2E9A]" />
            </span>
            <span className="text-center" style={{ color: '#FFFFFF' }}>
              Contact Us · Software &amp; Developer Support
            </span>
          </span>

          {/* Minimised Software & Lead Developer Cards Stretched Side-to-Side — White Writing Background */}
          <div className="grid w-full grid-cols-1 gap-1 sm:grid-cols-2 items-stretch text-center">
            {[
              {
                num: '01',
                icon: Cpu,
                title: '01 · Software Platform',
                text: 'ComplianceHR Infinity — NDIS & Aged Care Compliance Super-Platform',
                headerBg: getHeaderView(0),
                symColor: getSymbolView(0).iconColor,
              },
              {
                num: '02',
                icon: Mail,
                title: '02 · Lead Developer',
                text: 'Kristy Lee Whelan · kristyleebatkin@live.com.au',
                href: 'mailto:kristyleebatkin@live.com.au',
                headerBg: getHeaderView(2),
                symColor: getSymbolView(2).iconColor,
              },
            ].map((box, idx) => {
              const Icon = box.icon;
              return (
                <div
                  key={box.title}
                  className="flex h-full rounded-lg p-[1.5px] shadow-2xs"
                  style={{ background: getHeaderView(idx) }}
                >
                  <div
                    className="grid h-full w-full grid-cols-1 grid-rows-[16px_20px] gap-0.5 rounded-[7px] p-0.5 text-center"
                    style={{ background: UNIFORM_SPRAY_BG }}
                  >
                    {/* Minimised App-Design Coloured Pill Title */}
                    <div
                      className="gradient-brand flex h-[16px] w-full items-center justify-center gap-1 rounded-full border border-white px-1.5 py-0 text-[7.5px] font-extrabold uppercase tracking-wider text-white shadow-2xs"
                      style={{ background: box.headerBg, color: '#FFFFFF' }}
                    >
                      <span className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full bg-white">
                        <Icon className="h-1.5 w-1.5" style={{ color: box.symColor }} />
                      </span>
                      <span style={{ color: '#FFFFFF' }}>{box.title}</span>
                    </div>

                    {/* Minimised Clean White Inner Writing Box */}
                    <div
                      className="w-full rounded p-[1px]"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div className="flex h-[18px] w-full items-center justify-center rounded-[3px] bg-white px-1.5 py-0 text-center">
                        {box.href ? (
                          <a
                            href={box.href}
                            className="truncate text-center text-[8px] sm:text-[8.5px] font-extrabold leading-none text-[#0A2B6D] underline"
                          >
                            {box.text}
                          </a>
                        ) : (
                          <p className="truncate text-center text-[8px] sm:text-[8.5px] font-extrabold leading-none text-[#0A2B6D]">
                            {box.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Email, Help & Start 50% Smaller & Stretched Side-to-Side */}
          <div className="grid w-full grid-cols-1 sm:grid-cols-3 items-center justify-center gap-1.5 pt-0.5">
            <a
              href="mailto:kristyleebatkin@live.com.au"
              className="inline-flex min-h-[22px] w-full items-center justify-center gap-1.5 rounded-full border border-[#0A2B6D] px-2.5 py-0.5 text-[9.5px] sm:text-[10.5px] font-extrabold text-white shadow-2xs transition-all hover:-translate-y-0.5"
              style={{
                background:
                  'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
                color: '#FFFFFF',
              }}
            >
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#0072FF]">
                <Mail className="h-2 w-2 text-[#0072FF]" />
              </span>
              <span className="whitespace-nowrap text-center" style={{ color: '#FFFFFF' }}>
                Email Developer
              </span>
            </a>

            <Link
              to="/help"
              className="inline-flex min-h-[22px] w-full items-center justify-center gap-1.5 rounded-full border border-[#0A2B6D] px-2.5 py-0.5 text-[9.5px] sm:text-[10.5px] font-extrabold text-white shadow-2xs transition-all hover:-translate-y-0.5"
              style={{
                background:
                  'linear-gradient(120deg, #5A00D6 0%, #0072FF 36%, #A100FF 70%, #FF6EDB 100%)',
                color: '#FFFFFF',
              }}
            >
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#5A00D6]">
                <ShieldCheck className="h-2 w-2 text-[#5A00D6]" />
              </span>
              <span className="whitespace-nowrap text-center" style={{ color: '#FFFFFF' }}>
                Help &amp; Support Centre
              </span>
            </Link>

            <Link
              to="/register"
              className="inline-flex min-h-[22px] w-full items-center justify-center gap-1.5 rounded-full border border-[#0A2B6D] px-2.5 py-0.5 text-[9.5px] sm:text-[10.5px] font-extrabold text-white shadow-2xs transition-all hover:-translate-y-0.5"
              style={{
                background:
                  'linear-gradient(120deg, #0072FF 0%, #A100FF 48%, #FF2E9A 82%, #00C6FF 100%)',
                color: '#FFFFFF',
              }}
            >
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#A100FF]">
                <Sparkles className="h-2 w-2 text-[#A100FF]" />
              </span>
              <span className="whitespace-nowrap text-center" style={{ color: '#FFFFFF' }}>
                Start 14-Day Trial
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}