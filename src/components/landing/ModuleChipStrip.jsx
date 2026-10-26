import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';

// All 46 actual app modules displayed 6 on each line with full-colour icons,
// app-themed border around the container & chips, and Landing Page on the bottom-right!
export default function ModuleChipStrip() {
  const fullGridItems = [
    ...MODULE_DIRECTORY.map((m) => ({
      key: m.key,
      label: m.label,
      path: m.path,
      icon: m.icon,
      blurb: m.blurb,
      color: moduleKeyColour(m.key),
    })),
    {
      key: 'executive-suite-anchor',
      label: 'Pricing & Packages',
      path: '/#pricing',
      isAnchor: true,
      href: '#pricing',
      icon: Sparkles,
      blurb: 'Smart Enhanced All-In-One Compliance Packages',
      color: '#A100FF',
    },
    {
      key: 'landing-page-bottom-right',
      label: 'Landing Page',
      path: '/',
      icon: Home,
      blurb: 'Main ComplianceHR Infinity Landing Page (Bottom-Right)',
      color: '#FF2E9A',
    },
  ];

  return (
    <div
      className="mx-auto mt-8 max-w-6xl rounded-2xl border-2 border-[#0A2B6D] p-3.5 shadow-md"
      style={{
        background:
          'linear-gradient(135deg, rgba(0,114,255,0.10) 0%, rgba(90,0,214,0.10) 50%, rgba(255,46,154,0.10) 100%)',
        borderTopWidth: '4px',
        borderTopColor: '#5A00D6',
      }}
    >
      <div
        className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#0A2B6D] px-3 py-1.5 text-white shadow-sm"
        style={{ background: 'var(--header-gradient)' }}
      >
        <span className="text-xs font-extrabold uppercase tracking-wider text-white">
          All {MODULE_DIRECTORY.length} Live App Modules · 6 Per Line · Full-Colour Icons
        </span>
        <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
          One Connected Super-Platform
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {fullGridItems.map((m) => {
          const Icon = m.icon;
          const c = m.color || '#0072FF';
          const inner = (
            <>
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#0A2B6D]/40 text-white shadow-sm transition-transform group-hover:scale-105"
                style={{ backgroundColor: c }}
              >
                <Icon className="h-4 w-4 text-white" />
              </span>
              <span className="min-w-0 flex-1 text-left text-[11px] font-extrabold leading-tight text-[#0A2B6D]">
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
                className="group flex items-center gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white p-1.5 shadow-2xs transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] hover:shadow-md"
                style={{ borderTopWidth: '3px', borderTopColor: c }}
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
              className={`group flex items-center gap-2 rounded-xl border-2 border-[#0A2B6D] p-1.5 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md ${
                m.key === 'landing-page-bottom-right'
                  ? 'bg-gradient-to-r from-[#FFF0F8] to-[#F5F0FF] ring-2 ring-[#FF2E9A]'
                  : 'bg-white hover:bg-[#F5F0FF]'
              }`}
              style={{ borderTopWidth: '3px', borderTopColor: c }}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}