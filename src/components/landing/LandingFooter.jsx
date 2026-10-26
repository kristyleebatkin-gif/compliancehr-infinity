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
    <footer className="relative overflow-hidden border-t-4 border-[#0A2B6D] bg-white py-4 px-[0.5cm] space-y-4 text-center">
      {/* 1. Footer Brand Logo Section Matching Exact Top Header Design */}
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

              <div className="mt-1.5 mx-auto flex w-full flex-wrap items-center justify-center gap-x-2 bg-transparent px-2 text-center text-sm sm:text-base md:text-lg lg:text-xl font-extrabold">
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
              <span className="text-center">NDIS &amp; Aged Care Documentation &amp; Compliance</span>
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
                <span className="whitespace-nowrap text-center">Dashboard</span>
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

      {/* 2. Smaller Software & Developer Section Infused With Rich App-Design Colours */}
      <div
        className="mx-auto max-w-xl rounded-2xl p-[5px] shadow-md"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div
          className="rounded-[12px] p-1.5 sm:p-2 space-y-1.5 text-center"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          {/* Compact Contact Us Header */}
          <div
            className="w-full rounded-full p-[2px] shadow-2xs"
            style={{ background: BADGE_GRADIENT }}
          >
            <div
              className="gradient-brand flex min-h-[22px] w-full items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white"
              style={{ background: getHeaderView(4), color: '#FFFFFF' }}
            >
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white"
                style={{ borderColor: getAppBorderView(4) }}
              >
                <Mail className="h-2.5 w-2.5 text-[#0A2B6D]" />
              </span>
              <span className="text-center" style={{ color: '#FFFFFF' }}>
                Contact Us · Software &amp; Developer
              </span>
            </div>
          </div>

          {/* Decreased-Size Software & Developer Tiles With More App-Design Colour */}
          <div className="mx-auto grid grid-cols-1 gap-1.5 sm:grid-cols-2 items-stretch text-center">
            {[
              {
                icon: Cpu,
                title: 'Software',
                text: 'ComplianceHR Infinity — NDIS & Aged Care Compliance Super-Platform',
                headerBg: getHeaderView(0),
              },
              {
                icon: Mail,
                title: 'Developer',
                text: 'Kristy Lee Whelan · kristyleebatkin@live.com.au',
                href: 'mailto:kristyleebatkin@live.com.au',
                headerBg: getHeaderView(2),
              },
            ].map((box, idx) => {
              const Icon = box.icon;
              return (
                <div
                  key={box.title}
                  className="flex h-full rounded-xl p-[3px] shadow-sm"
                  style={{ background: BADGE_GRADIENT }}
                >
                  <div
                    className="flex h-full w-full flex-col items-center justify-between gap-1 rounded-[9px] p-1.5 text-center"
                    style={{ background: UNIFORM_SPRAY_BG }}
                  >
                    {/* App-Design Coloured Pill Title */}
                    <div
                      className="flex w-full items-center justify-center gap-1 rounded-full border border-white px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-2xs"
                      style={{ background: box.headerBg, color: '#FFFFFF' }}
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white">
                        <Icon className="h-2.5 w-2.5 text-[#0A2B6D]" />
                      </span>
                      <span style={{ color: '#FFFFFF' }}>{box.title}</span>
                    </div>

                    {/* Crisp White Inner Box Framed in App-Design Border With Dark Blue Writing */}
                    <div
                      className="w-full flex-1 rounded-lg p-[1.5px]"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-white px-2 py-1 text-center">
                        {box.href ? (
                          <a
                            href={box.href}
                            className="text-center text-[8.5px] font-extrabold leading-tight text-[#0A2B6D] underline"
                          >
                            {box.text}
                          </a>
                        ) : (
                          <p className="text-center text-[8.5px] font-extrabold leading-tight text-[#0A2B6D]">
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
        </div>
      </div>
    </footer>
  );
}