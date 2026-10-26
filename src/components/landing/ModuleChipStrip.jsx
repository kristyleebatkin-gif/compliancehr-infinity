import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';

// Mixed vibrant colours for borders & circular icon badges while every module box is the EXACT SAME SIZE!
const MIXED_COLOURS = [
  '#0072FF',
  '#FF2E9A',
  '#5A00D6',
  '#00C6FF',
  '#A100FF',
  '#0A2B6D',
  '#FF6EDB',
  '#0072FF',
  '#A100FF',
  '#FF2E9A',
  '#00C6FF',
  '#5A00D6',
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
      className="mt-5 w-full rounded-3xl border-2 border-[#0A2B6D] p-3 shadow-lg"
      style={{
        background:
          'linear-gradient(120deg, #0072FF 0%, #0A2B6D 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
      }}
    >
      <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 shadow-md">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white px-3.5 py-2 text-center shadow-2xs">
          <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
            All {MODULE_DIRECTORY.length} Live App Modules · 6 Per Line
          </span>
        </div>

        {/* Every module card has fixed uniform h-12 height, circular icon badge, and identical dimensions */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 auto-rows-fr">
          {fullGridItems.map((m, idx) => {
            const Icon = m.icon;
            const accent = MIXED_COLOURS[idx % MIXED_COLOURS.length];
            const inner = (
              <>
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: accent }}
                >
                  <Icon className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="min-w-0 flex-1 truncate rounded bg-white text-left text-[10.5px] font-extrabold text-[#0A2B6D]">
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
                  className="group flex h-12 w-full items-center gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white px-2.5 py-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] hover:shadow-md"
                  style={{ borderTopWidth: '4px', borderTopColor: accent }}
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
                className="group flex h-12 w-full items-center gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white px-2.5 py-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] hover:shadow-md"
                style={{ borderTopWidth: '4px', borderTopColor: accent }}
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