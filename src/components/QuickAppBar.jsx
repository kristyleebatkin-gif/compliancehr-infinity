import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Sparkles,
  UserCircle, Users, Heart, ShieldCheck, FileSpreadsheet, Megaphone,
  MapPin, BadgeCheck, ClipboardList, AlertTriangle, UsersRound, Vault,
  CalendarClock, Target, GraduationCap, Briefcase, Zap, ArrowRight,
} from 'lucide-react';
import { getHeaderView } from '@/lib/fullColourTiles';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 42%, #A100FF 68%, #FF2E9A 100%)';

const QUICK_LINKS = [
  { key: 'dashboard', label: 'Dashboard', views: ['Executive & Role Hub', 'Live KPI Score Ring', 'Morning Shift Brief'], path: '/dashboard', icon: LayoutDashboard },
  { key: 'operations-centre', label: 'Operations Centre', views: ['1-Click Live Sweeps', '12 Armed Actions', 'Live Audit Trail'], path: '/operations-centre', icon: Sparkles },
  { key: 'rostering', label: 'Roster & Shifts', views: ['SCHADS & Coverage', 'Fatigue Gatekeeper', 'Calendar Sync'], path: '/roster', icon: CalendarClock },
  { key: 'my-profile', label: 'My Profile', views: ['Personal Workspace', 'My Shifts & Goals', 'Staff Name Tags'], path: '/my-profile', icon: UserCircle },
  { key: 'our-staff', label: 'Employee Profiles', views: ['100-Pt Staff Files', 'Screening Alerts', '360° Appraisals'], path: '/our-employees', icon: Users },
  { key: 'compliance', label: 'Compliance Centre', views: ['Audits & Readiness', '356 Checkpoints', 'Express 2-Min Audit'], path: '/compliance', icon: ShieldCheck },
  { key: 'invoicing', label: 'Invoicing Centre', views: ['NDIS Claims & Pay', 'Price Guide Builder', 'Bank Reconciliation'], path: '/invoicing', icon: FileSpreadsheet },
  { key: 'communications', label: 'Communication Centre', views: ['Shift Notes & Inbox', 'AI Compose & Email', '5-Day Complaint SLA'], path: '/communications', icon: Megaphone },
  { key: 'goals', label: 'Goal Progress', views: ['Outcomes & AI Coach', 'Funding Utilisation', 'Goal Progress Slider'], path: '/goals', icon: Target },
  { key: 'training', label: 'Training Centre', views: ['LMS & AI Quizzes', 'AI Course Studio', 'Signed PDF Certs'], path: '/training', icon: GraduationCap },
  { key: 'community-council', label: 'Community Hub', views: ['Programs & Events', 'Postcode Directory', 'Event Flyer Studio'], path: '/community-council', icon: MapPin },
  { key: 'certificates', label: 'Recognition & Certs', views: ['Signed PDF Awards', 'Milestone Badges', 'Renewal Calendar'], path: '/certificates', icon: BadgeCheck },
  { key: 'our-participants', label: 'Participant Profiles', views: ['Plans & Consents', '3-Part Consent Lock', '10-Weekly Reviews'], path: '/our-participants', icon: Heart },
  { key: 'tasks', label: 'Task Dashboard', views: ['Shared To-Do & SLA', 'Digital Sign-Off', '30-Task Batch PDF'], path: '/tasks', icon: ClipboardList },
  { key: 'incidents', label: 'Incident Clinic', views: ['24h / 5d NDIS Timers', 'Root-Cause Review', 'Photo Evidence Log'], path: '/incidents', icon: AlertTriangle },
  { key: 'human-resources', label: 'HR & Volunteers', views: ['Contracts & Reviews', 'Digital E-Signing', 'Volunteer Placements'], path: '/hr', icon: UsersRound },
  { key: 'company-safe', label: 'Company Safe', views: ['Protected Vault', 'Executive Wall View', 'Insurance Register'], path: '/company-safe', icon: Vault },
  { key: 'intake', label: 'Intake Centre', views: ['1-Click Onboarding', 'AI Resume Extract', 'Fast Profile Sync'], path: '/intake', icon: Briefcase },
];

export default function QuickAppBar() {
  const location = useLocation();
  const [cycleIdx, setCycleIdx] = useState(0);

  // Rotate the supporting line shown on every screen, every 30 seconds
  useEffect(() => {
    const viewTimer = setInterval(() => {
      setCycleIdx((prev) => (prev + 1) % 3);
    }, 30000);
    return () => clearInterval(viewTimer);
  }, []);

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="mx-auto w-full max-w-[1440px] bg-white px-4 pt-3 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="h-1 w-full" style={{ background: BRAND_GRADIENT }} />

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3.5 pb-1 pt-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs"
              style={{ background: BRAND_GRADIENT }}
            >
              <Zap className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-extrabold leading-tight text-[#0A2B6D]">Quick Access</h2>
              <p className="text-[11px] font-semibold leading-tight text-slate-600">
                18 live screens · one tap into any workspace
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00C6FF]" />
            Live
          </span>
        </div>

        {/* 18 iPad-style screens */}
        <div className="grid auto-rows-fr grid-cols-2 gap-2 p-3 pt-2 sm:grid-cols-3 md:grid-cols-6 items-stretch">
          {QUICK_LINKS.map((item, idx) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            const currentSub = item.views[cycleIdx % item.views.length];
            const headerBg = getHeaderView(idx);

            return (
              <Link
                key={item.path}
                to={item.path}
                title={`${item.label} — ${currentSub}`}
                className={`group flex h-full min-h-[98px] flex-col gap-[3px] rounded-xl border-2 bg-[#0A2B6D] p-[3px] transition-all duration-200 focus-visible:outline-none ${
                  active
                    ? 'border-[#5A00D6] shadow-md ring-2 ring-[#5A00D6]/25 ring-offset-1'
                    : 'border-[#0A2B6D] hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md'
                }`}
              >
                {/* Screen */}
                <div className="flex flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
                  {/* Coloured header inside screen */}
                  <div
                    className="flex min-h-[38px] items-center justify-between gap-1 px-1.5 py-1 text-white"
                    style={{ background: headerBg }}
                  >
                    <div className="flex min-w-0 items-center gap-1">
                      <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                      <span
                        className="min-w-0 text-[9.5px] font-extrabold leading-[11px] tracking-tight text-white"
                        style={{ color: '#FFFFFF', wordBreak: 'normal', overflowWrap: 'normal' }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        active ? 'bg-[#00C6FF]' : 'bg-white/75'
                      }`}
                    />
                  </div>

                  {/* White writing area with the supported detail */}
                  <div className="flex min-h-[40px] flex-1 items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-1.5 py-1">
                    <span className="line-clamp-2 min-w-0 flex-1 break-words text-[10.5px] font-bold leading-[13px] text-[#0A2B6D]/85">
                      {currentSub}
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5 group-hover:text-[#FF2E9A]" />
                  </div>
                </div>

                {/* iPad home indicator bar */}
                <div className="flex h-[5px] items-center justify-center">
                  <span
                    className={`h-[2.5px] w-6 rounded-full transition-all ${
                      active ? 'w-8 bg-[#00C6FF]' : 'bg-white/45 group-hover:bg-white/80'
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}