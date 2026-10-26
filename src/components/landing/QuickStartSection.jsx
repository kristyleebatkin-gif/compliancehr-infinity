import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, Compass, LayoutDashboard, ShieldCheck, Workflow } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import {
  getTilePalette,
  getHeaderView,
  getTitleGradientView,
  getSubheaderColourView,
  getSymbolView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const STEPS = [
  {
    icon: ShieldCheck,
    title: 'Register and get approved',
    text: 'Request the right role. New accounts remain Pending Approval until a Provider Administrator confirms access.',
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
          <span className="text-center">4-Step Quick Start Guide</span>
        </span>

        <div className="mx-auto max-w-3xl space-y-1.5">
          <h2
            className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent"
            style={{ backgroundImage: getTitleGradientView(1) }}
          >
            Start using ComplianceHR in four steps
          </h2>
          <p
            className="text-xs sm:text-sm md:text-base font-extrabold"
            style={{ color: getSubheaderColourView(1) }}
          >
            Sign in, open your role-based dashboard and choose the task you need to complete.
          </p>
        </div>

        <ol className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const tile = getTilePalette(index + 1);
            const sym = getSymbolView(index + 1);
            return (
              <Reveal
                key={step.title}
                as="li"
                delay={index * 0.06}
                className="group flex flex-col justify-between rounded-2xl border-2 border-[#0A2B6D] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ backgroundColor: tile.bg, color: tile.text }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white shadow-sm">
                      <Icon className="h-5 w-5" style={{ color: sym.iconColor }} />
                    </span>
                    <span className="rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-0.5 font-editorial text-xs font-extrabold text-[#0A2B6D]">
                      Step 0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-3 font-editorial text-base font-extrabold" style={{ color: tile.text }}>
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs font-bold leading-relaxed" style={{ color: tile.subtext }}>
                    {step.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ol>

        <div className="flex justify-center">
          <Link
            to="/login"
            className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
            style={{ background: getHeaderView(5) }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <ArrowRight className="h-3.5 w-3.5 text-white" />
            </span>
            <span>Sign in to ComplianceHR Infinity</span>
          </Link>
        </div>
      </div>
    </section>
  );
}