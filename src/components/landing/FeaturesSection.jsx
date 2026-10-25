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

const FEATURES = [
  { icon: Users, title: 'Workforce Records', desc: 'Maintain staff profiles, employment documents, certificates, teams and consent-aware audit access.', color: '#0072FF' },
  { icon: Heart, title: 'Participant Records', desc: 'Centralise participant profiles, support plans, agreements, and folder compliance checklists.', color: '#0A2B6D' },
  { icon: CalendarClock, title: 'Rostering & Shift Notes', desc: 'Plan by participant or worker, manage shifts, availability, handovers, approvals, vehicle checks and payable hours.', color: '#5A00D6' },
  { icon: BriefcaseBusiness, title: 'Employee Performance Reviews', desc: 'Complete online appraisals, manage review schedules and maintain connected employment records.', color: '#A100FF' },
  { icon: FileSpreadsheet, title: 'Invoicing & Payroll', desc: 'Build professional NDIS invoices from rostered shifts, apply price-guide items and generate payroll-ready reports.', color: '#FF2E9A' },
  { icon: AlertTriangle, title: 'Incident Clinic', desc: 'Log, investigate, and resolve incidents with automatic alerts and full audit trails.', color: '#A100FF' },
  { icon: ShieldAlert, title: 'Risk Management', desc: 'Identify, assess, and treat risks and hazards with a live register and mitigation tracking.', color: '#5A00D6' },
  { icon: GraduationCap, title: 'Training Tracking', desc: 'Assign modules, track completions, and stay on top of expiring certifications automatically.', color: '#0A2B6D' },
  { icon: BadgeCheck, title: 'NDIS Provider Governance', desc: 'Store registration certificates and groups, schedule audits and renewals, receive reminders and open official Commission portals.', color: '#0072FF' },
  { icon: ClipboardCheck, title: 'Express Audit & Certification', desc: 'Complete internal audits in minutes from checklists with evidence attached, generate branded reports, manage NDIS deadlines and prepare printable file checklists.', color: '#00C6FF' },
  { icon: MapPinned, title: 'Community Referral', desc: 'Find essential crisis contacts, verified provider contacts and nearby community services from a postcode.', color: '#FF6EDB' },
  { icon: Sparkles, title: 'Automation & Spreadsheet Exchange', desc: 'Use assisted checks, scheduled reminders and secure Excel import, preview and export across connected modules.', color: '#C084FC' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative mx-auto my-8 max-w-6xl scroll-mt-16 overflow-hidden rounded-[2rem] border-2 border-[#0A2B6D] bg-white px-4 py-12 sm:py-16 shadow-xl md:px-8">
      <div className="relative mx-auto max-w-2xl text-center">
        <div className="inline-flex rounded-full border-2 border-[#0A2B6D] bg-[#F5F0FF] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#5A00D6]">Latest platform capabilities</div>
        <h2 className="mt-4 font-editorial text-3xl font-bold tracking-tight text-[#0A2B6D] md:text-[2.6rem] md:leading-tight">
          An impossible standard, <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">achieved effortlessly</span>
        </h2>
        <p className="mt-3 text-base font-medium text-[#0A2B6D]/80">One super platform covering the full provider lifecycle, from intake, people and rostering to safety, HR, invoicing, registration, NDIS audit preparation and the live compliance tracker that shows you are audit prepared, every day.</p>
      </div>
      <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, index) => (
          <Reveal key={f.title} delay={(index % 3) * 0.07} className="group relative overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl" style={{ borderTopWidth: '4px', borderTopColor: f.color }}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#0A2B6D]/30 text-white shadow-sm transition-transform group-hover:scale-105" style={{ backgroundColor: f.color }}>
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-editorial text-lg font-bold text-[#0A2B6D]">{f.title}</h3>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-[#0A2B6D]/80">{f.desc}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}