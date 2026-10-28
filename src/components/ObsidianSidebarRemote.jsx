import React from 'react';
import { Link } from 'react-router-dom';
import { getHeaderView } from '@/lib/fullColourTiles';
import { Image } from '@/components/ui/image';
import { LogOut, ArrowRight } from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 42%, #A100FF 68%, #FF2E9A 100%)';

const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

export default function ObsidianSidebarRemote({
  visiblePrimary = [],
  isActive,
  navLabel,
  onLogout,
}) {
  const modules = visiblePrimary.filter(
    (item) =>
      !(item.key === 'staff-progress' && visiblePrimary.some((entry) => entry.key === 'staff'))
  );

  return (
    <div className="flex h-full w-full min-w-0 min-h-0 flex-col overflow-hidden bg-white p-2.5 select-none">
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        {/* Top Brand Gradient Bar Matching Quick Access */}
        <div className="h-1 w-full shrink-0" style={{ background: BRAND_GRADIENT }} />

        {/* Small Logo at Top + Platform Name Below Logo */}
        <div className="flex shrink-0 flex-col items-center border-b border-slate-100 px-3 py-2.5 text-center">
          <Image
            src={CHR_LOGO}
            alt="ComplianceHR Infinity"
            fittingType="fit"
            className="h-8 w-8 rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs"
          />
          <span className="mt-1 font-editorial text-[12px] font-extrabold leading-tight tracking-tight text-[#0A2B6D]">
            Compliance
            <span className="font-editorial-italic text-[#5A00D6]">HR</span>{' '}
            <span className="bg-gradient-to-r from-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              Infinity
            </span>
          </span>
        </div>

        {/* Screens / Modules Only Underneath — Visually Matching Quick Access */}
        <nav
          aria-label="Page navigation"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2.5 space-y-2"
        >
          {modules.map((item, idx) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const label = navLabel(item);
            const subtitle = item.blurb || item.group || 'Open workspace';
            const headerBg = getHeaderView(idx);

            return (
              <Link
                key={item.path}
                to={item.path}
                title={`${label} — ${subtitle}`}
                className={`group flex flex-col gap-[3px] rounded-xl border-2 bg-[#0A2B6D] p-[3px] transition-all duration-200 focus-visible:outline-none ${
                  active
                    ? 'border-[#5A00D6] shadow-md ring-2 ring-[#5A00D6]/25 ring-offset-1'
                    : 'border-[#0A2B6D] hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md'
                }`}
              >
                {/* Screen */}
                <div className="flex flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
                  {/* Coloured Header Inside Screen */}
                  <div
                    className="flex min-h-[34px] items-center justify-between gap-1 px-1.5 py-1 text-white"
                    style={{ background: headerBg }}
                  >
                    <div className="flex min-w-0 items-center gap-1">
                      <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                      <span
                        className="min-w-0 text-[9.5px] font-extrabold leading-[11px] tracking-tight text-white"
                        style={{ color: '#FFFFFF', wordBreak: 'normal', overflowWrap: 'normal' }}
                      >
                        {label}
                      </span>
                    </div>
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        active ? 'bg-[#00C6FF]' : 'bg-white/75'
                      }`}
                    />
                  </div>

                  {/* White Writing Area With Supporting Detail */}
                  <div className="flex min-h-[34px] flex-1 items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-1.5 py-1">
                    <span className="min-w-0 flex-1 break-words text-[10px] font-bold leading-[12.5px] text-[#0A2B6D]/85">
                      {subtitle}
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5 group-hover:text-[#FF2E9A]" />
                  </div>
                </div>

                {/* iPad Home Indicator Bar */}
                <div className="flex h-[5px] items-center justify-center">
                  <span
                    className={`h-[2.5px] w-6 rounded-full transition-all ${
                      active ? 'w-8 bg-[#00C6FF]' : 'bg-white/45 group-hover:bg-white/80'
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Minimal Sign-Out Action */}
        {onLogout && (
          <div className="shrink-0 border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10.5px] font-extrabold text-[#0A2B6D] transition hover:border-[#0072FF]/50 hover:bg-[#F5F0FF] hover:text-[#5A00D6]"
            >
              <LogOut className="h-3 w-3 text-[#FF2E9A]" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}