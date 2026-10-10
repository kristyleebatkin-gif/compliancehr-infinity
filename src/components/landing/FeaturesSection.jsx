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

const FEATURES = [
  { icon: Users, title: 'Workforce Records', desc: 'Maintain staff profiles, employment documents, certificates, teams and consent-aware audit access.', color: '#16a34a' },
  { icon: Heart, title: 'Participant Records', desc: 'Centralise participant profiles, support plans, agreements, and folder compliance checklists.', color: '#8b5cf6' },
  { icon: CalendarClock, title: 'Rostering & Shift Notes', desc: 'Plan by participant or worker, manage shifts, availability, handovers, approvals, vehicle checks and payable hours.', color: '#2563eb' },
  { icon: BriefcaseBusiness, title: 'Employee Performance Reviews', desc: 'Complete online appraisals, manage review schedules and maintain connected employment records.', color: '#7c3aed' },
  { icon: FileSpreadsheet, title: 'Invoicing & Timesheets', desc: 'Build professional NDIS invoices from rostered shifts, apply price-guide items, export Xero data and generate timesheets.', color: '#0f766e' },
  { icon: AlertTriangle, title: 'Incident Clinic', desc: 'Log, investigate, and resolve incidents with automatic alerts and full audit trails.', color: '#ef4444' },
  { icon: ShieldAlert, title: 'Risk Management', desc: 'Identify, assess, and treat risks and hazards with a live register and mitigation tracking.', color: '#f97316' },
  { icon: GraduationCap, title: 'Training Tracking', desc: 'Assign modules, track completions, and stay on top of expiring certifications automatically.', color: '#d946ef' },
  { icon: BadgeCheck, title: 'NDIS Provider Governance', desc: 'Store registration certificates and groups, schedule audits and renewals, receive reminders and open official Commission portals.', color: '#4338ca' },
  { icon: ClipboardCheck, title: 'Audit & Certification', desc: 'Run internal audits, manage NDIS deadlines, control evidence and prepare printable staff and participant file checklists.', color: '#4f46e5' },
  { icon: MapPinned, title: 'Community Referral', desc: 'Find essential crisis contacts, verified provider contacts and nearby community services from a postcode.', color: '#0284c7' },
  { icon: Sparkles, title: 'Automation & Spreadsheet Exchange', desc: 'Use assisted checks, scheduled reminders and secure Excel import, preview and export across connected modules.', color: '#be185d' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative mx-auto my-8 max-w-6xl overflow-hidden rounded-[2.5rem] border border-fuchsia-200 bg-gradient-to-br from-pink-100 via-white to-blue-100 px-4 py-20 shadow-xl shadow-fuchsia-500/5 dark:border-fuchsia-900 dark:from-pink-950/30 dark:via-background dark:to-blue-950/30 md:px-8">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-pink-400/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="relative mx-auto max-w-2xl text-center">
        <div className="mx-auto inline-flex rounded-full bg-gradient-to-r from-pink-600 to-orange-500 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-md">Latest platform capabilities</div>
        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Everything you need to <span className="bg-gradient-to-r from-pink-700 via-violet-600 to-blue-600 bg-clip-text text-transparent">stay compliant</span>
        </h2>
        <p className="mt-4 text-lg font-medium text-foreground/65">One platform covering the full provider lifecycle — from intake and rostering to invoicing, registration and audit.</p>
      </div>
      <div className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl" style={{ borderColor: `${f.color}35` }}>
            <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: f.color }} />
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md transition-transform group-hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${f.color}, ${f.color}bb)` }}
            >
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/60">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}