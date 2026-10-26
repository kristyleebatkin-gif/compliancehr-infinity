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

// Mixed full-colour circular icons + crisp WHITE background behind all dark blue writing, fitted cleanly across tablet & desktop!
const FEATURES = [
  { icon: Users, title: 'Workforce Records', desc: 'Staff profiles, documents, certificates, teams and consent-aware audit access.', color: '#0072FF' },
  { icon: Heart, title: 'Participant Records', desc: 'Participant profiles, support plans, agreements and folder compliance checklists.', color: '#FF2E9A' },
  { icon: CalendarClock, title: 'Rostering & Shift Notes', desc: 'Plan by participant or worker, shifts, availability, handovers and payable hours.', color: '#00C6FF' },
  { icon: BriefcaseBusiness, title: 'Performance Reviews', desc: 'Online appraisals, review schedules and connected employment records.', color: '#5A00D6' },
  { icon: FileSpreadsheet, title: 'Invoicing & Payroll', desc: 'NDIS invoices from rostered shifts, price-guide items and payroll reports.', color: '#0A2B6D' },
  { icon: AlertTriangle, title: 'Incident Clinic', desc: 'Log, investigate and resolve incidents with 24h/5d alerts and full audit trails.', color: '#A100FF' },
  { icon: ShieldAlert, title: 'Risk Management', desc: 'Identify, assess and treat risks and hazards with a live register and controls.', color: '#5A00D6' },
  { icon: GraduationCap, title: 'Training Tracking', desc: 'Assign modules, track completions and stay on top of expiring certifications.', color: '#0072FF' },
  { icon: BadgeCheck, title: 'NDIS Governance', desc: 'Registration groups, scheduled audits, renewals, reminders and Commission portals.', color: '#FF2E9A' },
  { icon: ClipboardCheck, title: 'Express Audit & Certs', desc: 'Complete internal audits in minutes with evidence attached and branded reports.', color: '#00C6FF' },
  { icon: MapPinned, title: 'Community Referral', desc: 'Essential crisis contacts, verified providers and local services by postcode.', color: '#A100FF' },
  { icon: Sparkles, title: 'Automation & Excel', desc: 'Assisted checks, scheduled reminders and secure Excel import, preview and export.', color: '#0A2B6D' },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative w-full scroll-mt-16 overflow-hidden rounded-3xl border-2 border-[#0A2B6D] bg-white px-4 py-6 shadow-xl md:px-6"
      style={{ borderTopWidth: '4px', borderTopColor: '#FF2E9A' }}
    >
      <div
        className="gradient-brand mx-auto rounded-2xl border-2 border-[#0A2B6D] px-4 py-3.5 text-center text-white shadow-md"
        style={{ background: 'var(--header-gradient)' }}
      >
        <div className="inline-flex rounded-full border border-[#0A2B6D] bg-white px-3.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
          Latest platform capabilities · 12 Connected Engines
        </div>
        <h2 className="mt-2 font-editorial text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          An impossible standard, achieved effortlessly
        </h2>
        <p className="mx-auto mt-1 max-w-3xl text-xs sm:text-sm font-semibold text-white">
          One super-platform covering the full provider lifecycle, from intake, people and rostering to safety, HR, invoicing, registration, NDIS audit preparation and the live compliance tracker.
        </p>
      </div>

      {/* Responsive Grid that Fits Tablet (3 per row) & Desktop (6 per row) with Equal-Height Cards & Circular Icons */}
      <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 auto-rows-fr">
        {FEATURES.map((f, index) => (
          <Reveal
            key={f.title}
            delay={(index % 6) * 0.04}
            className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white p-3.5 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
            style={{ borderTopWidth: '5px', borderTopColor: f.color }}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] text-white shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: f.color }}
                >
                  <f.icon className="h-4 w-4 text-white" />
                </div>
                <span
                  className="rounded-full border border-[#0A2B6D] px-2.5 py-0.5 text-[10px] font-extrabold text-white"
                  style={{ backgroundColor: f.color }}
                >
                  #{index + 1}
                </span>
              </div>
              <h3 className="mt-2.5 rounded bg-white font-editorial text-sm font-extrabold leading-snug text-[#0A2B6D]">
                {f.title}
              </h3>
              <p className="mt-1 rounded bg-white text-xs font-bold leading-snug text-[#0A2B6D]">
                {f.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}