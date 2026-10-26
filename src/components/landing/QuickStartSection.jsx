import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, LayoutDashboard, ShieldCheck, Workflow } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const STEPS = [
  {
    icon: ShieldCheck,
    title: 'Register and get approved',
    text: 'Request the right role. New accounts remain Pending Approval until a Provider Administrator confirms access.',
    color: '#0072FF',
  },
  {
    icon: LayoutDashboard,
    title: 'Open your dashboard',
    text: 'Your dashboard shows the modules and information available for your role.',
    color: '#0A2B6D',
  },
  {
    icon: Workflow,
    title: 'Follow the connected workflow',
    text: 'Use Intake, profiles and rostering for service delivery, or open the relevant safety, HR, finance or governance module.',
    color: '#5A00D6',
  },
  {
    icon: Bell,
    title: 'Stay up to date',
    text: 'Live compliance trackers show what is in date across every module, alerts surface anything due, and the User Guides library holds current instructions.',
    color: '#FF2E9A',
  },
];

export default function QuickStartSection() {
  return (
    <section
      id="quick-start"
      className="relative mx-auto max-w-6xl scroll-mt-16 overflow-hidden rounded-3xl border-2 border-[#0A2B6D] bg-gradient-to-br from-[#F5F0FF] via-white to-[#FFF0F8] px-4 py-8 sm:py-10 shadow-lg md:px-8"
      style={{ borderTopWidth: '4px', borderTopColor: '#0072FF' }}
    >
      <div
        className="mx-auto rounded-2xl border-2 border-[#0A2B6D] px-4 py-3.5 text-center text-white shadow-md"
        style={{ background: 'var(--header-gradient)' }}
      >
        <div className="inline-flex rounded-full border border-white/40 bg-white/20 px-3.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-white">
          Quick start guide
        </div>
        <h2 className="mt-2 font-editorial text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Start using ComplianceHR in four steps
        </h2>
        <p className="mt-1 text-xs sm:text-sm font-semibold text-white/95">
          Sign in, open your role-based dashboard and choose the task you need to complete.
        </p>
      </div>

      <ol className="relative mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <Reveal
              key={step.title}
              as="li"
              delay={index * 0.06}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{
                borderTopWidth: '4px',
                borderTopColor: step.color,
                background: `linear-gradient(155deg, ${step.color}12 0%, #ffffff 85%)`,
              }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#0A2B6D] text-white shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: step.color }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span
                    className="rounded-full border border-[#0A2B6D] px-2.5 py-0.5 font-editorial text-xs font-extrabold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    Step 0{index + 1}
                  </span>
                </div>
                <h3 className="mt-3 font-editorial text-base font-extrabold text-[#0A2B6D]">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs font-semibold leading-relaxed text-[#0A2B6D]/85">
                  {step.text}
                </p>
              </div>
            </Reveal>
          );
        })}
      </ol>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="group inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] gradient-brand px-6 py-2.5 text-sm font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          Sign in to ComplianceHR
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}