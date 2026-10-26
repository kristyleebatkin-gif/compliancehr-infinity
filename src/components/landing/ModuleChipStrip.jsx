import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';

// Mixed full-colour gradients so every module card is vibrant and adjacent tiles contrast
const MIXED_MODULE_GRADIENTS = [
  { bg: 'linear-gradient(135deg, #0072FF 0%, #0A2B6D 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #FF2E9A 0%, #A100FF 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)', text: '#0A2B6D' },
  { bg: 'linear-gradient(135deg, #5A00D6 0%, #A100FF 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #0A2B6D 0%, #5A00D6 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #A100FF 0%, #FF2E9A 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #FF6EDB 0%, #FF2E9A 100%)', text: '#0A2B6D' },
  { bg: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 100%)', text: '#ffffff' },
];

export default function ModuleChipStrip() {
  const fullGridItems = [
    ...MODULE_DIRECTORY.map((m) => ({
      key: m.key,
      label: m.label,
      path: m.path,
      icon: m.icon,
      blurb: m.blurb,
    })),
    {
      key: 'executive-suite-anchor',
      label: 'Pricing & Packages',
      path: '/#pricing',
      isAnchor: true,
      href: '#pricing',
      icon: Sparkles,
      blurb: 'Smart Enhanced All-In-One Compliance Packages',
    },
    {
      key: 'landing-page-bottom-right',
      label: 'Landing Page',
      path: '/',
      icon: Home,
      blurb: 'Main ComplianceHR Infinity Landing Page',
    },
  ];

  return (
    <div
      className="mx-auto mt-6 max-w-6xl rounded-3xl border-2 border-[#0A2B6D] p-3.5 shadow-lg"
      style={{
        background:
          'linear-gradient(120deg, #0072FF 0%, #0A2B6D 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
      }}
    >
      <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white/95 p-3 shadow-md">
        <div
          className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#0A2B6D] px-3.5 py-2 text-white shadow-sm"
          style={{ background: 'var(--header-gradient)' }}
        >
          <span className="text-xs font-extrabold uppercase tracking-wider text-white">
            All {MODULE_DIRECTORY.length} Live App Modules · 6 Per Line · Full Mixed App Colours
          </span>
          <span className="rounded-full border border-[#0A2B6D] bg-[#00C6FF] px-3 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
            Click Any Module to Open
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {fullGridItems.map((m, idx) => {
            const Icon = m.icon;
            const palette = MIXED_MODULE_GRADIENTS[idx % MIXED_MODULE_GRADIENTS.length];
            const inner = (
              <>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/60 bg-black/20 text-white shadow-sm transition-transform group-hover:scale-105">
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <span
                  className="min-w-0 flex-1 text-left text-[10.5px] font-extrabold leading-tight"
                  style={{ color: palette.text }}
                >
                  {m.label}
                </span>
              </>
            );

            if (m.isAnchor) {
              return (
                <a
                  key={m.key}
                  href={m.href}
                  title={m.blurb}
                  className="group flex items-center gap-2 rounded-xl border-2 border-[#0A2B6D] p-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: palette.bg, color: palette.text }}
                >
                  {inner}
                </a>
              );
            }

            return (
              <Link
                key={m.key}
                to={m.path}
                title={m.blurb}
                className="group flex items-center gap-2 rounded-xl border-2 border-[#0A2B6D] p-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: palette.bg, color: palette.text }}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}