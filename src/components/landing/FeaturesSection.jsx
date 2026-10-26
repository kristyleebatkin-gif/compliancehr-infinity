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
import {
  getHeaderView,
  getSubheaderColourView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const CAPABILITY_SPRAY_BGS = [
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF',
  'radial-gradient(circle at 18% 82%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 20%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 36%, rgba(255, 133, 224, 0.56) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 16% 28%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 78%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 54% 18%, rgba(56, 189, 248, 0.58) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 84% 22%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 16% 78%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 52%, rgba(192, 132, 252, 0.58) 0%, transparent 52%), #FFFFFF',
];

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
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4">
        {/* Heading & Subheading First in Clean Bordered Frame so Writing Fits Better */}
        <div
          className="w-full rounded-2xl border-2 border-[#0A2B6D] p-3 sm:p-4 shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-xl border-2 border-[#0A2B6D] bg-white px-5 py-4 sm:px-8 sm:py-5 text-center space-y-2">
            <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              <span className="text-[#0A2B6D]">An impossible </span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                standard,
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                achieved effortlessly
              </span>
            </h2>
            <p
              className="mx-auto max-w-4xl text-xs sm:text-sm md:text-base font-extrabold leading-relaxed"
              style={{ color: getSubheaderColourView(1) }}
            >
              One super-platform covering the full provider lifecycle, from intake, people and rostering to safety, HR, invoicing, registration, NDIS audit preparation and the live compliance tracker.
            </p>
          </div>
        </div>

        {/* Stretched Side-to-Side "Latest Platform Capabilities · 12 Connected Engines" Underneath Writing */}
        <div
          className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
          style={{ background: getHeaderView(5) }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-center">Latest Platform Capabilities · 12 Connected Engines</span>
        </div>

        {/* 12 Capability Cards: Sprays of Pink, Blue & Purple Background, Symbols & Numbers Beside Each Other, Headings in App Design Coloured Borders */}
        <div className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr text-center">
          {FEATURES.map((f, index) => {
            const sym = getSymbolView(index);
            const borderCol = getAppBorderView(index);
            const sprayBg = CAPABILITY_SPRAY_BGS[index % CAPABILITY_SPRAY_BGS.length];
            return (
              <Reveal
                key={f.title}
                delay={(index % 6) * 0.04}
                className="group flex h-full flex-col rounded-2xl p-[3px] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="flex h-full flex-1 flex-col items-center justify-between rounded-[13px] p-4 text-center space-y-2.5"
                  style={{ background: sprayBg }}
                >
                  {/* Symbol and Number Beside Each Other */}
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-transform group-hover:scale-105"
                      style={{ borderColor: borderCol }}
                    >
                      <f.icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                    </span>
                    <span
                      className="rounded-full border-2 bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D] shadow-2xs"
                      style={{ borderColor: borderCol }}
                    >
                      #{index + 1}
                    </span>
                  </div>

                  {/* Heading in App Design Coloured Border */}
                  <div
                    className="w-full rounded-xl p-[3px] shadow-2xs"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div className="flex min-h-[42px] w-full items-center justify-center rounded-[9px] bg-white px-3 py-1.5 text-center">
                      <h3 className="font-editorial text-sm sm:text-base font-extrabold leading-snug text-[#0A2B6D]">
                        {f.title}
                      </h3>
                    </div>
                  </div>

                  <p className="flex-1 flex items-center justify-center text-xs font-bold leading-relaxed text-[#0A2B6D]">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}