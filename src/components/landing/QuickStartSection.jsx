import React from 'react';
import { Bell, Compass, LayoutDashboard, ShieldCheck, Workflow } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import {
  getTilePalette,
  getHeaderView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const STEPS = [
  {
    icon: ShieldCheck,
    title: 'Register an account, request access',
    text: 'Register an account, request access, new accounts approval pending for Provider Administrator.',
  },
  {
    icon: LayoutDashboard,
    title: 'Open your dashboard',
    text: 'Your dashboard shows the modules and information available for your role.',
  },
  {
    icon: Workflow,
    title: 'Follow the connected workflow',
    text: 'Use Intake, profiles and rostering for service delivery, or open the relevant safety, HR, finance or governance module.',
  },
  {
    icon: Bell,
    title: 'Stay up to date',
    text: 'Live compliance trackers show what is in date across every module, alerts surface anything due, and the User Guides library holds current instructions.',
  },
];

export default function QuickStartSection() {
  return (
    <section
      id="quick-start"
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-5">
        <span
          className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
          style={{ background: getHeaderView(4) }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
            <Compass className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-center">Our Quick 4 Step Start Guide</span>
        </span>

        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            <span className="text-[#0A2B6D]">Start using </span>
            <span className="text-[#0A2B6D]">Compliance</span>
            <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              HR
            </span>{' '}
            <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
              in four steps
            </span>
          </h2>
        </div>

        <ol className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4 text-center items-stretch">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const tile = getTilePalette(index + 1);
            const sym = getSymbolView(index + 1);
            return (
              <Reveal
                key={step.title}
                as="li"
                delay={index * 0.06}
                className="group flex flex-col items-center justify-between rounded-2xl border-2 p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  backgroundColor: tile.bg,
                  color: tile.text,
                  borderColor: getAppBorderView(index + 1),
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white shadow-sm">
                      <Icon className="h-5 w-5" style={{ color: sym.iconColor }} />
                    </span>
                    <span className="rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-0.5 font-editorial text-xs font-extrabold text-[#0A2B6D]">
                      Step 0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-3 font-editorial text-base font-extrabold text-center" style={{ color: tile.text }}>
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs font-bold leading-relaxed text-center" style={{ color: tile.subtext }}>
                    {step.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}