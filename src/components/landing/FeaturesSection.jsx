import React from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardCheck,
  FileSpreadsheet,
  GraduationCap,
  Heart,
  MapPinned,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';
const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';

const FEATURES = [
  { icon: Users, title: 'Workforce Records', desc: 'Staff profiles, documents, certificates, teams and consent-aware audit access.' },
  { icon: Heart, title: 'Participant Records', desc: 'Participant profiles, support plans, agreements and folder compliance checklists.' },
  { icon: CalendarClock, title: 'Rostering & Shift Notes', desc: 'Plan by participant or worker, shifts, availability, handovers and payable hours.' },
  { icon: BriefcaseBusiness, title: 'Performance Reviews', desc: 'Online appraisals, review schedules and connected employment records.' },
  { icon: FileSpreadsheet, title: 'Invoicing & Payroll', desc: 'NDIS invoices from rostered shifts, price-guide items and payroll reports.' },
  { icon: AlertTriangle, title: 'Incident Clinic', desc: 'Log, investigate and resolve incidents with 24h/5d alerts and full audit trails.' },
  { icon: ShieldAlert, title: 'Risk Management', desc: 'Identify, assess and treat risks and hazards with a live register and controls.' },
  { icon: GraduationCap, title: 'Training Tracking', desc: 'Assign modules, track completions and stay on top of expiring certifications.' },
  { icon: BadgeCheck, title: 'NDIS Governance', desc: 'Registration groups, scheduled audits, renewals, reminders and Commission portals.' },
  { icon: ClipboardCheck, title: 'Express Audit & Certs', desc: 'Complete internal audits in minutes with evidence attached and branded reports.' },
  { icon: MapPinned, title: 'Community Referral', desc: 'Essential crisis contacts, verified providers and local services by postcode.' },
  { icon: Sparkles, title: 'Automation & Excel', desc: 'Assisted checks, scheduled reminders and secure Excel import, preview and export.' },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-5">
        <span
          className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
          style={{ background: BADGE_GRADIENT }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#FF2E9A]">
            <Sparkles className="h-3.5 w-3.5 text-[#FF2E9A]" />
          </span>
          <span className="text-center">Latest Platform Capabilities · 12 Connected Engines</span>
        </span>

        <div className="mx-auto max-w-3xl space-y-1.5">
          <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0A2B6D]">
            An impossible standard,{' '}
            <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              achieved effortlessly
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base font-extrabold text-[#5A00D6]">
            One super-platform covering the full provider lifecycle, from intake, people and rostering to safety, HR, invoicing, registration, NDIS audit preparation and the live compliance tracker.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 auto-rows-fr text-left">
          {FEATURES.map((f, index) => (
            <Reveal
              key={f.title}
              delay={(index % 6) * 0.04}
              className="group flex h-full flex-col justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] text-white shadow-sm transition-transform group-hover:scale-105"
                    style={{ background: ICON_GRADIENT }}
                  >
                    <f.icon className="h-4 w-4 text-white" />
                  </span>
                  <span
                    className="rounded-full border-2 border-[#0A2B6D] px-2.5 py-0.5 text-[10px] font-extrabold text-white"
                    style={{ background: BADGE_GRADIENT }}
                  >
                    #{index + 1}
                  </span>
                </div>
                <h3 className="mt-3 font-editorial text-sm font-extrabold leading-snug text-[#0A2B6D]">
                  {f.title}
                </h3>
                <p className="mt-1 text-xs font-bold leading-snug text-[#0A2B6D]">
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}