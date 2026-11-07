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
    title: 'People & 360° Profiles',
    subtitle: 'Complete lifecycle governance for every employee, participant, contractor, and volunteer.',
    icon: Users,
    accent: '#0072FF',
    route: '/our-participants',
    items: [
      { name: 'Staff Dossiers', desc: '100-point HR verification, contracts, position descriptions & appraisals.' },
      { name: 'Participant Profiles', desc: 'NDIS plans, 3-part informed consents, support teams & 10-weekly reviews.' },
      { name: 'Credential Gate', desc: 'NDIS Worker Screening, Blue Cards, First Aid, CPR & police checks.' },
      { name: 'Structured Onboarding', desc: 'Online intake forms with 1-click conversion into verified profiles.' },
    ],
  },
  {
    badge: 'PILLAR 02',
    title: 'Frontline Service Delivery',
    subtitle: 'Coordinate disability, aged care, and allied health delivery with real-time compliance gates.',
    icon: CalendarCheck2,
    accent: '#5A00D6',
    route: '/roster',
    items: [
      { name: 'Smart Rostering', desc: 'Shift scheduling with automated worker screening and fatigue gates.' },
      { name: 'Communications', desc: 'Shift handover notes, 6-stage lifecycle tracking, and team diary.' },
      { name: 'Goal Outcomes', desc: 'Participant NDIS goal tracking linked directly to shift evidence.' },
      { name: 'Statutory Incidents', desc: '24-hour & 5-day NDIS Commission and Aged Care SIRS timers.' },
    ],
  },
  {
    badge: 'PILLAR 03',
    title: 'Compliance, Risk & Audit',
    subtitle: 'Continuous audit readiness mapped to NDIS Practice Standards and Aged Care Quality Standards.',
    icon: ShieldCheck,
    accent: '#FF2E9A',
    route: '/compliance',
    items: [
      { name: 'Master Audits', desc: '17 categories & 356 checkpoints with 1-click PDF evidence packs.' },
      { name: 'ISO 31000 Risk Matrix', desc: 'Hierarchy of controls, home risk assessments, and Take-5 safety checks.' },
      { name: 'Competency LMS', desc: 'Interactive training modules, AI quizzes, and certificate tracking.' },
      { name: 'External Auditor Portal', desc: 'Read-only, consent-gated portal for external NDIS & Aged Care auditors.' },
    ],
  },
  {
    badge: 'PILLAR 04',
    title: 'Commercial & Back-Office Operations',
    subtitle: 'Unify NDIS claiming, SCHADS payroll, procurement, and board-level financial governance.',
    icon: Briefcase,
    accent: '#0A2B6D',
    route: '/invoicing',
    items: [
      { name: 'HR & Contracts', desc: 'Employment contracts, leave approvals, supervision, and file completeness.' },
      { name: 'NDIS Invoicing', desc: 'Price Guide billing, 3-way shift-to-claim matching, and payroll runs.' },
      { name: 'Procurement & Assets', desc: 'Approved suppliers, 3-way PO matching, fleet maintenance, and MSDS.' },
      { name: 'Executive Analytics', desc: 'Board packs, compliance trajectory charts, and labour forecasting.' },
    ],
  },
];

export default function LandingSolutionSection() {
  return (
    <section id="solution" className="w-full scroll-mt-20">
      <div className="enterprise-surface rounded-2xl p-3.5 sm:p-4 space-y-3">
        <LandingSectionHeader
          badge="Four Architectural Pillars"
          tone="blue"
          icon={Layers}
          title="One Unified Operating System Across Every Department"
          description="Disconnected point solutions create compliance blind spots — ComplianceHR Infinity connects People, Service Delivery, Governance, and Finance on a single data model."
          rightTag="4 Pillars · 46 Modules"
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 items-stretch">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Reveal
                key={pillar.title}
                delay={idx * 0.03}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left transition hover:border-[#0072FF]"
              >
                <div>
                  {/* Header First -> Sentence -> Blue/Purple Badge & Open Link After */}
                  <div className="space-y-1 border-b border-slate-100 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-editorial text-sm sm:text-base font-black text-[#0A2B6D] leading-snug">
                        {pillar.title}
                      </h3>
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white"
                        style={{
                          backgroundColor: pillar.accent,
                          boxShadow: '0 0 8px 1px rgba(255,255,255,0.85)',
                        }}
                      >
                        <Icon className="h-3.5 w-3.5 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                      </div>
                    </div>

                    <p className="text-xs font-medium leading-snug text-[#0A2B6D]/80">
                      {pillar.subtitle}
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span
                        className="rounded px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider"
                        style={{ backgroundColor: `${pillar.accent}14`, color: pillar.accent }}
                      >
                        {pillar.badge}
                      </span>
                      <Link
                        to={pillar.route}
                        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-extrabold text-[#0A2B6D] transition hover:border-[#0072FF] hover:bg-[#0A2B6D] hover:text-white"
                      >
                        <span>Open</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {pillar.items.map((item) => (
                      <div
                        key={item.name}
                        className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-2.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2
                            className="h-3.5 w-3.5 shrink-0"
                            style={{ color: pillar.accent }}
                          />
                          <h4 className="text-xs font-extrabold text-[#0A2B6D]">
                            {item.name}
                          </h4>
                        </div>
                        <p className="mt-0.5 text-[11px] font-medium leading-snug text-[#0A2B6D]/80">
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