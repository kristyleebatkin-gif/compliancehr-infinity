import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, CalendarCheck2, ShieldCheck, Briefcase, CheckCircle2, ArrowRight,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const PILLARS = [
  {
    badge: 'PILLAR 01',
    title: 'People & Profiles',
    subtitle: 'Complete 360° lifecycle visibility for every staff member, participant, and volunteer.',
    icon: Users,
    accent: '#0072FF',
    gradient: 'linear-gradient(135deg, #0072FF 0%, #0A2B6D 100%)',
    route: '/our-participants',
    items: [
      { name: 'Staff Records', desc: '100-point HR dossiers, contracts, position descriptions & appraisals' },
      { name: 'Participant Profiles', desc: 'NDIS plans, 3-part informed consents, support teams & 10-weekly reviews' },
      { name: 'Credential Tracking', desc: 'NDIS Worker Screening, Blue Cards, First Aid, CPR & police checks' },
      { name: 'Onboarding', desc: 'Online fillable intake forms with 1-click conversion into live profiles' },
    ],
  },
  {
    badge: 'PILLAR 02',
    title: 'Service Delivery',
    subtitle: 'Coordinate daily frontline disability support with real-time compliance guardrails.',
    icon: CalendarCheck2,
    accent: '#5A00D6',
    gradient: 'linear-gradient(135deg, #5A00D6 0%, #0072FF 100%)',
    route: '/roster',
    items: [
      { name: 'Rostering', desc: 'Smart NDIS shift scheduling with screening & fatigue gatekeepers' },
      { name: 'Communications', desc: 'Shift handover notes, branded emails, broadcasts & team diary' },
      { name: 'Goals', desc: 'Participant NDIS goal progress sliders linked to shift notes & outcomes' },
      { name: 'Incidents', desc: 'Statutory 24-hour & 5-day NDIS Commission timers & investigations' },
    ],
  },
  {
    badge: 'PILLAR 03',
    title: 'Compliance & Risk',
    subtitle: 'Continuous audit readiness mapped directly to the NDIS Practice Standards.',
    icon: ShieldCheck,
    accent: '#FF2E9A',
    gradient: 'linear-gradient(135deg, #FF2E9A 0%, #5A00D6 100%)',
    route: '/compliance',
    items: [
      { name: 'Audits', desc: '17 categories & 356 checkpoints with 2-minute express audit exports' },
      { name: 'Risk Registers', desc: 'ISO 31000 hierarchy of controls, home risk assessments & Take-5 checks' },
      { name: 'Training', desc: 'Interactive LMS academy, AI competency quizzes & certificate studio' },
      { name: 'Governance', desc: 'Controlled policies, legislative registers, board packs & auditor portal' },
    ],
  },
  {
    badge: 'PILLAR 04',
    title: 'Business Operations',
    subtitle: 'Streamline back-office finance, HR paperwork, procurement, and executive reporting.',
    icon: Briefcase,
    accent: '#0A2B6D',
    gradient: 'linear-gradient(135deg, #0A2B6D 0%, #5A00D6 100%)',
    route: '/invoicing',
    items: [
      { name: 'HR', desc: 'Digital employment contracts, leave approvals, supervision & file audits' },
      { name: 'Invoicing', desc: 'NDIS Price Guide billing, 3-way claim matching, payroll & payslips' },
      { name: 'Procurement', desc: 'Approved suppliers, purchase orders, AI receipt scanner & bank match' },
      { name: 'Analytics', desc: 'Executive KPIs, compliance trajectories, labour forecasting & board PDFs' },
    ],
  },
];

export default function LandingSolutionSection() {
  return (
    <section id="solution" className="w-full scroll-mt-20 py-6">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#0072FF]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
          Four Connected Enterprise Pillars
        </span>
        <h2 className="mt-3 font-editorial text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A2B6D]">
          Built for Every Corner of Your Organisation
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#0A2B6D]/75">
          Four foundational pillars unite frontline care, workforce compliance, clinical governance, and financial operations.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {PILLARS.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <Reveal
              key={pillar.title}
              delay={idx * 0.07}
              className="group flex flex-col justify-between rounded-3xl p-[2.5px] shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: 'linear-gradient(120deg, #0072FF 0%, #5A00D6 52%, #FF2E9A 100%)',
              }}
            >
              <div className="flex h-full flex-col justify-between rounded-[21px] bg-white p-6 sm:p-8 text-left">
                <div>
                  {/* Pillar Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
                        style={{ background: pillar.gradient }}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <span
                          className="text-xs font-extrabold uppercase tracking-wider"
                          style={{ color: pillar.accent }}
                        >
                          {pillar.badge}
                        </span>
                        <h3 className="font-editorial text-2xl font-extrabold text-[#0A2B6D]">
                          {pillar.title}
                        </h3>
                      </div>
                    </div>
                    <Link
                      to={pillar.route}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#0A2B6D] transition hover:border-[#0072FF] hover:text-[#0072FF]"
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <p className="mt-3 text-sm font-medium leading-relaxed text-[#0A2B6D]/75">
                    {pillar.subtitle}
                  </p>

                  {/* 4 Sub-Feature Cards */}
                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {pillar.items.map((item) => (
                      <div
                        key={item.name}
                        className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 transition group-hover:bg-white group-hover:border-[#0072FF]/30"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className="h-4 w-4 shrink-0"
                            style={{ color: pillar.accent }}
                          />
                          <h4 className="text-sm font-extrabold text-[#0A2B6D]">
                            {item.name}
                          </h4>
                        </div>
                        <p className="mt-1.5 text-xs font-medium leading-relaxed text-[#0A2B6D]/75">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}