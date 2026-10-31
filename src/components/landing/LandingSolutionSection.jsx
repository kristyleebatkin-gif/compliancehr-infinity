import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, CalendarCheck2, ShieldCheck, Briefcase, CheckCircle2, ArrowRight, Layers,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

const PILLARS = [
  {
    badge: 'PILLAR 01',
    title: 'People & Profiles',
    subtitle: 'Complete 360° lifecycle visibility for every staff member, participant, and volunteer.',
    icon: Users,
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-sm space-y-7">
        <LandingSectionHeader
          badge="Four Connected Feature Pillars"
          icon={Layers}
          title="One Unified Platform Across Every Department"
          description="Spreadsheets and disconnected software create risk. ComplianceHR Infinity connects People, Service Delivery, Compliance, and Business Operations in real time."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 items-stretch">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Reveal
                key={pillar.title}
                delay={idx * 0.06}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 text-left shadow-2xs transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600 whitespace-nowrap">
                          {pillar.badge}
                        </span>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900 whitespace-nowrap leading-tight">
                          {pillar.title}
                        </h3>
                      </div>
                    </div>
                    <Link
                      to={pillar.route}
                      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                    >
                      <span>Open</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <p className="mt-2.5 text-xs sm:text-sm font-medium text-slate-600">
                    {pillar.subtitle}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {pillar.items.map((item) => (
                      <div
                        key={item.name}
                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition group-hover:bg-white group-hover:border-indigo-200"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600" />
                          <h4 className="text-sm font-bold text-slate-900 whitespace-nowrap">
                            {item.name}
                          </h4>
                        </div>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
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