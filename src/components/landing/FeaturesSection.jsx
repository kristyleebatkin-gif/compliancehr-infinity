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

// Mixed-up full-colour gradients so adjacent cards never look the same
const FEATURES = [
  { icon: Users, title: 'Workforce Records', desc: 'Staff profiles, documents, certificates, teams and consent-aware audit access.', bg: 'linear-gradient(145deg, #0072FF 0%, #0A2B6D 100%)', text: '#ffffff' },
  { icon: Heart, title: 'Participant Records', desc: 'Participant profiles, support plans, agreements and folder compliance checklists.', bg: 'linear-gradient(145deg, #FF2E9A 0%, #A100FF 100%)', text: '#ffffff' },
  { icon: CalendarClock, title: 'Rostering & Shift Notes', desc: 'Plan by participant or worker, shifts, availability, handovers and payable hours.', bg: 'linear-gradient(145deg, #00C6FF 0%, #0072FF 100%)', text: '#0A2B6D' },
  { icon: BriefcaseBusiness, title: 'Performance Reviews', desc: 'Online appraisals, review schedules and connected employment records.', bg: 'linear-gradient(145deg, #5A00D6 0%, #A100FF 100%)', text: '#ffffff' },
  { icon: FileSpreadsheet, title: 'Invoicing & Payroll', desc: 'NDIS invoices from rostered shifts, price-guide items and payroll reports.', bg: 'linear-gradient(145deg, #0A2B6D 0%, #5A00D6 100%)', text: '#ffffff' },
  { icon: AlertTriangle, title: 'Incident Clinic', desc: 'Log, investigate and resolve incidents with 24h/5d alerts and full audit trails.', bg: 'linear-gradient(145deg, #A100FF 0%, #FF2E9A 100%)', text: '#ffffff' },
  { icon: ShieldAlert, title: 'Risk Management', desc: 'Identify, assess and treat risks and hazards with a live register and controls.', bg: 'linear-gradient(145deg, #5A00D6 0%, #0072FF 100%)', text: '#ffffff' },
  { icon: GraduationCap, title: 'Training Tracking', desc: 'Assign modules, track completions and stay on top of expiring certifications.', bg: 'linear-gradient(145deg, #00C6FF 0%, #5A00D6 100%)', text: '#ffffff' },
  { icon: BadgeCheck, title: 'NDIS Governance', desc: 'Registration groups, scheduled audits, renewals, reminders and Commission portals.', bg: 'linear-gradient(145deg, #FF2E9A 0%, #5A00D6 100%)', text: '#ffffff' },
  { icon: ClipboardCheck, title: 'Express Audit & Certs', desc: 'Complete internal audits in minutes with evidence attached and branded reports.', bg: 'linear-gradient(145deg, #0072FF 0%, #00C6FF 100%)', text: '#ffffff' },
  { icon: MapPinned, title: 'Community Referral', desc: 'Essential crisis contacts, verified providers and local services by postcode.', bg: 'linear-gradient(145deg, #A100FF 0%, #0A2B6D 100%)', text: '#ffffff' },
  { icon: Sparkles, title: 'Automation & Excel', desc: 'Assisted checks, scheduled reminders and secure Excel import, preview and export.', bg: 'linear-gradient(145deg, #FF6EDB 0%, #FF2E9A 100%)', text: '#0A2B6D' },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-6xl scroll-mt-16 overflow-hidden rounded-3xl border-2 border-[#0A2B6D] bg-gradient-to-br from-[#FFF0F8] via-white to-[#F5F0FF] px-4 py-7 sm:py-9 shadow-xl md:px-8"
      style={{ borderTopWidth: '4px', borderTopColor: '#FF2E9A' }}
    >
      <div
        className="mx-auto rounded-2xl border-2 border-[#0A2B6D] px-4 py-3.5 text-center text-white shadow-md"
        style={{ background: 'var(--header-gradient)' }}
      >
        <div className="inline-flex rounded-full border border-white/40 bg-[#FF2E9A] px-3.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-white">
          Latest platform capabilities · 6 Per Line · Full Mixed App Colours
        </div>
        <h2 className="mt-2 font-editorial text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          An impossible standard, achieved effortlessly
        </h2>
        <p className="mx-auto mt-1 max-w-3xl text-xs sm:text-sm font-semibold text-white/95">
          One super-platform covering the full provider lifecycle, from intake, people and rostering to safety, HR, invoicing, registration, NDIS audit preparation and the live compliance tracker.
        </p>
      </div>

      {/* 12 Core Capabilities — 6 on Each Line in Mixed Full Colours */}
      <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-6">
        {FEATURES.map((f, index) => (
          <Reveal
            key={f.title}
            delay={(index % 6) * 0.04}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#0A2B6D] p-3 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
            style={{ background: f.bg, color: f.text }}
          >
            <div>
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-white/60 bg-black/25 text-white shadow-sm transition-transform group-hover:scale-105">
                  <f.icon className="h-4 w-4 text-white" />
                </div>
                <span className="rounded-full border border-white/50 bg-black/25 px-2 py-0.5 text-[9.5px] font-extrabold text-white">
                  #{index + 1}
                </span>
              </div>
              <h3
                className="mt-2.5 font-editorial text-sm font-extrabold leading-snug"
                style={{ color: f.text }}
              >
                {f.title}
              </h3>
              <p
                className="mt-1 text-[10.5px] font-bold leading-snug opacity-95"
                style={{ color: f.text }}
              >
                {f.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}