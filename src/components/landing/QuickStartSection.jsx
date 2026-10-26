import React from 'react';
import { Bell, Compass, LayoutDashboard, ShieldCheck, Workflow } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import {
  getHeaderView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const STEPS = [
  {
    icon: ShieldCheck,
    title: 'Register an Account & Request Access',
    text: 'Register your account and request access. New accounts are placed in pending approval for your Provider Administrator.',
  },
  {
    icon: LayoutDashboard,
    title: 'Open Your Role Dashboard',
    text: 'Your personalised dashboard displays the exact modules, live registers, and tools configured for your role.',
  },
  {
    icon: Workflow,
    title: 'Follow the Connected Workflow',
    text: 'Move seamlessly from intake, profiles, and rostering right through to safety, HR, finance, and governance.',
  },
  {
    icon: Bell,
    title: 'Stay Audit-Ready Every Day',
    text: 'Live compliance trackers monitor due dates across every module, with instant alerts and step-by-step user guides.',
  },
];

export default function QuickStartSection() {
  return (
    <section
      id="quick-start"
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4">
        {/* Heading with Generous Space Around "Start using ComplianceHR in four simple and effortless steps" */}
        <div
          className="w-full rounded-2xl border-2 border-[#0A2B6D] p-3.5 sm:p-4 shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-xl border-2 border-[#0A2B6D] bg-white px-6 py-5 sm:px-10 sm:py-7 text-center">
            <h2 className="mx-auto text-center font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug text-[#0A2B6D]">
              Start using ComplianceHR in four simple and effortless steps
            </h2>
          </div>
        </div>

        {/* Stretched Side-to-Side "Our Quick 4 Step Start Guide" Directly Above the Tiles */}
        <div
          className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
          style={{ background: getHeaderView(4) }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
            <Compass className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-center">Our Quick 4 Step Start Guide</span>
        </div>

        {/* 4 Step Tiles: App Design Colour Between Outer Border & Inner Writing Border, White Symbols & Steps, Balanced Dark Blue Wording */}
        <ol className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4 text-center items-stretch">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const borderCol = getAppBorderView(index + 1);
            return (
              <Reveal
                key={step.title}
                as="li"
                delay={index * 0.06}
                className="group flex h-full flex-col items-center justify-between rounded-2xl border-[3px] p-3.5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: getHeaderView(index),
                  borderColor: borderCol,
                }}
              >
                {/* Top Row: White Symbol & White Step Pill */}
                <div className="mb-3 flex w-full items-center justify-center gap-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white shadow-sm">
                    <Icon className="h-5 w-5 text-white" />
                  </span>
                  <span className="rounded-full border-2 border-white bg-white/20 px-3.5 py-1 font-editorial text-xs font-extrabold text-white shadow-2xs">
                    Step 0{index + 1}
                  </span>
                </div>

                {/* Information Inside a White Bordered Box with Heading in App Design Coloured Border & All Dark Blue Writing */}
                <div
                  className="flex w-full flex-1 flex-col items-center justify-between rounded-xl border-2 bg-white p-3.5 text-center shadow-2xs space-y-2.5"
                  style={{ borderColor: borderCol }}
                >
                  <div
                    className="w-full rounded-xl p-[3px] shadow-2xs"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div className="flex min-h-[46px] w-full items-center justify-center rounded-[9px] bg-white px-3 py-2 text-center">
                      <h3 className="font-editorial text-sm sm:text-[15px] font-extrabold leading-snug text-center text-[#0A2B6D]">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  <p className="flex-1 flex items-center justify-center text-xs font-bold leading-relaxed text-center text-[#0A2B6D]">
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