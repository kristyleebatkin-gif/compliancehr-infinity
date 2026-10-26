import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Award, Sparkles, ShieldCheck, Layers, User, Cpu, FileText } from 'lucide-react';
import { getTilePalette, getHeaderView, getSymbolView, getAppBorderView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';

export default function LandingFooter() {
  const cols = [
    {
      title: 'Platform',
      links: [
        { label: 'Staff Tracking', to: '/staff' },
        { label: 'Participant Records', to: '/participants' },
        { label: 'Incidents', to: '/incidents' },
        { label: 'Risk Management', to: '/risks' },
        { label: 'Training', to: '/training' },
        { label: 'Audit Centre', to: '/compliance' },
      ],
    },
    {
      title: 'Company & Get Involved',
      links: [
        { label: 'About', to: '#why' },
        { label: 'Contact Us', to: '/help' },
        { label: 'Volunteer With Us', to: '/volunteer-apply' },
        { label: 'Raise a Complaint', to: '/report-complaint' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Help Centre', to: '/help' },
        { label: 'NDIS Compliance Guide', to: '/ndis-portal' },
        { label: 'Documentation', to: '/user-guides' },
        { label: 'Security', to: '/compliance' },
      ],
    },
  ];

  const contactItems = [
    {
      icon: Award,
      label: 'App Name',
      value: 'ComplianceHR Infinity',
    },
    {
      icon: Sparkles,
      label: 'App Slogan',
      value: 'Complete Control. Greater Confidence. Brighter Success.',
    },
    {
      icon: Cpu,
      label: 'Software',
      value: 'ComplianceHR Infinity Super-Platform',
    },
    {
      icon: FileText,
      label: 'Software Description',
      value:
        'All-in-one NDIS & Aged Care documentation, compliance, rostering, HR, incident, risk, invoicing, training and 2-minute express audit software.',
    },
    {
      icon: User,
      label: 'Developer',
      value: 'Kristy Lee Whelan',
    },
    {
      icon: User,
      label: 'Name',
      value: 'Kristy Lee Whelan',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'kristyleebatkin@live.com.au',
      href: 'mailto:kristyleebatkin@live.com.au',
    },
  ];

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

      {/* Footer Navigation & Contact Us Section Framed in Top Section Design */}
      <div
        className="rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] bg-white p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {cols.map((c, cIdx) => (
              <div
                key={c.title}
                className="flex flex-col justify-between rounded-2xl border-2 bg-white p-4 shadow-sm space-y-3"
                style={{ borderColor: getAppBorderView(cIdx) }}
              >
                <div className="space-y-3">
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
                        <li key={l.label}>
                          <Link
                            to={l.to}
                            className="flex items-center gap-2 rounded-2xl border-2 px-3 py-1.5 text-xs font-extrabold transition-all hover:-translate-y-0.5 hover:shadow-sm"
                            style={{
                              backgroundColor: tile.bg,
                              color: tile.text,
                              borderColor: getAppBorderView(cIdx * 3 + lIdx),
                            }}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] bg-white">
                              <Sparkles className="h-2.5 w-2.5" style={{ color: sym.iconColor }} />
                            </span>
                            <span style={{ color: tile.text }}>{l.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}

            {/* 4th Column: Contact Us with App Name, Slogan, Software, Description, Developer, Name & Email */}
            <div
              className="flex flex-col justify-between rounded-2xl border-2 bg-white p-4 shadow-sm space-y-3"
              style={{ borderColor: getAppBorderView(3) }}
            >
              <div className="space-y-2.5">
                <span
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-white"
                  style={{ background: getHeaderView(3) }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                    <Mail className="h-3 w-3 text-white" />
                  </span>
                  <span>Contact Us</span>
                </span>

                <div className="space-y-1.5">
                  {contactItems.map((item, idx) => {
                    const Icon = item.icon;
                    const tile = getTilePalette(idx);
                    const sym = getSymbolView(idx);
                    return (
                      <div
                        key={item.label}
                        className="flex items-start gap-2 rounded-2xl border-2 px-3 py-1.5 text-left shadow-2xs"
                        style={{
                          backgroundColor: tile.bg,
                          color: tile.text,
                          borderColor: getAppBorderView(idx),
                        }}
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] bg-white">
                          <Icon className="h-2.5 w-2.5" style={{ color: sym.iconColor }} />
                        </span>
                        <div className="min-w-0 flex-1 text-[11px] leading-snug">
                          <span className="font-extrabold uppercase tracking-wider" style={{ color: tile.text }}>
                            {item.label}:{' '}
                          </span>
                          {item.href ? (
                            <a
                              href={item.href}
                              className="font-extrabold underline break-all"
                              style={{ color: tile.text }}
                            >
                              {item.value}
                            </a>
                          ) : (
                            <span className="font-bold" style={{ color: tile.subtext }}>
                              {item.value}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Full-Width Contact Us Summary Strip */}
          <div
            className="rounded-2xl border-2 bg-white p-4 text-center space-y-3 shadow-sm"
            style={{ borderColor: getAppBorderView(4) }}
          >
            <span
              className="mx-auto inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-6 py-1 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white shadow-sm"
              style={{ background: getHeaderView(4) }}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                <Mail className="h-3 w-3 text-white" />
              </span>
              <span>Contact Us — Official Software &amp; Developer Details</span>
            </span>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 text-left">
              {[
                {
                  icon: Award,
                  title: 'App Name & Slogan',
                  text: 'ComplianceHR Infinity — Complete Control. Greater Confidence. Brighter Success.',
                },
                {
                  icon: Cpu,
                  title: 'Software',
                  text: 'ComplianceHR Infinity NDIS & Aged Care Super-Platform',
                },
                {
                  icon: FileText,
                  title: 'Software Description',
                  text: 'End-to-end compliance, documentation, rostering, HR, incident, risk, invoicing, training & audit management platform.',
                },
                {
                  icon: Mail,
                  title: 'Developer, Name & Email',
                  text: 'Developer & Name: Kristy Lee Whelan · Email: kristyleebatkin@live.com.au',
                  href: 'mailto:kristyleebatkin@live.com.au',
                },
              ].map((box, idx) => {
                const Icon = box.icon;
                const tile = getTilePalette(idx + 4);
                const sym = getSymbolView(idx + 4);
                return (
                  <div
                    key={box.title}
                    className="flex items-start gap-2.5 rounded-2xl border-2 p-3 shadow-2xs"
                    style={{
                      backgroundColor: tile.bg,
                      color: tile.text,
                      borderColor: getAppBorderView(idx + 4),
                    }}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white">
                      <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-extrabold" style={{ color: tile.text }}>
                        {box.title}
                      </div>
                      {box.href ? (
                        <a
                          href={box.href}
                          className="mt-0.5 block text-[11px] font-bold leading-snug underline"
                          style={{ color: tile.subtext }}
                        >
                          {box.text}
                        </a>
                      ) : (
                        <div className="mt-0.5 text-[11px] font-bold leading-snug" style={{ color: tile.subtext }}>
                          {box.text}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}