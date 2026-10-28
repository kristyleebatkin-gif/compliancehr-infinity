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
    gradient: 'linear-gradient(135deg, #0A2B6D 0%, #0072FF 100%)',
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
    subtitle: 'Coordinate daily frontline disability & aged care support with real-time compliance guardrails.',
    icon: CalendarCheck2,
    accent: '#5A00D6',
    gradient: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 100%)',
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
    gradient: 'linear-gradient(135deg, #5A00D6 0%, #FF2E9A 100%)',
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
    <section id="solution" className="w-full scroll-mt-20">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 lg:p-10 shadow-lg space-y-7">
        {/* Landscape Header */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 border-b border-slate-100 pb-5 text-left">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0A2B6D] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
              Four Connected Feature Pillars
            </span>
            <h2 className="mt-2.5 font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0A2B6D]">
              One Unified Platform Across Every Department
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm font-medium text-[#0A2B6D]/75">
            Spreadsheets and disconnected software create risk. ComplianceHR Infinity connects People, Service Delivery, Compliance, and Business Operations in real time.
          </p>
        </div>

        {/* 4 Large Pillar Cards — "Business Operations" & All Pillar Titles Fitted on One Line */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 items-stretch">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Reveal
                key={pillar.title}
                delay={idx * 0.06}
                className="group flex flex-col justify-between rounded-2xl border-2 border-[#0A2B6D]/15 bg-white p-5 sm:p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
                        style={{ background: pillar.gradient }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <span
                          className="block text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap"
                          style={{ color: pillar.accent }}
                        >
                          {pillar.badge}
                        </span>
                        <h3 className="font-editorial text-lg sm:text-xl lg:text-2xl font-extrabold text-[#0A2B6D] whitespace-nowrap leading-tight">
                          {pillar.title}
                        </h3>
                      </div>
                    </div>
                    <Link
                      to={pillar.route}
                      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-xl bg-[#0A2B6D] px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-[#0072FF]"
                    >
                      <span>Open</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <p className="mt-2.5 text-xs sm:text-sm font-medium text-[#0A2B6D]/75">
                    {pillar.subtitle}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {pillar.items.map((item) => (
                      <div
                        key={item.name}
                        className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 transition group-hover:bg-white group-hover:border-[#0072FF]/35"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className="h-4 w-4 shrink-0"
                            style={{ color: pillar.accent }}
                          />
                          <h4 className="text-sm font-extrabold text-[#0A2B6D] whitespace-nowrap">
                            {item.name}
                          </h4>
                        </div>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-[#0A2B6D]/75">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}