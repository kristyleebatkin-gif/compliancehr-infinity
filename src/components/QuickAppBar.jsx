import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Sparkles,
  UserCircle, Users, Heart, ShieldCheck, FileSpreadsheet, Megaphone,
  MapPin, BadgeCheck, ClipboardList, AlertTriangle, UsersRound, Vault,
  CalendarClock, Target, GraduationCap, Briefcase, ArrowRight, Radio,
} from 'lucide-react';
import { getHeaderView } from '@/lib/fullColourTiles';

const QUICK_LINKS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    views: ['Executive & Role Hub', 'Live KPI Score Ring', 'Morning Shift Brief'],
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    key: 'operations-centre',
    label: 'Operations Centre',
    views: ['1-Click Live Sweeps', '12 Armed Actions', 'Live Audit Trail'],
    path: '/operations-centre',
    icon: Sparkles,
  },
  {
    key: 'rostering',
    label: 'Roster & Shifts',
    views: ['SCHADS & Coverage', 'Fatigue Gatekeeper', '2-Way Calendar Sync'],
    path: '/roster',
    icon: CalendarClock,
  },
  {
    key: 'my-profile',
    label: 'My Profile',
    views: ['Personal Workspace', 'My Shifts & Goals', 'Staff Name Tag Studio'],
    path: '/my-profile',
    icon: UserCircle,
  },
  {
    key: 'our-staff',
    label: 'Employee Profiles',
    views: ['100-Pt Staff Files', 'Screening Alerts', '360° Appraisals'],
    path: '/our-employees',
    icon: Users,
  },
  {
    key: 'our-participants',
    label: 'Participant Profiles',
    views: ['Plans & Consents', '3-Part Consent Lock', '10-Weekly Reviews'],
    path: '/our-participants',
    icon: Heart,
  },
  {
    key: 'compliance',
    label: 'Compliance Centre',
    views: ['Audits & Readiness', '356 Checkpoints', '2-Min Express Audit'],
    path: '/compliance',
    icon: ShieldCheck,
  },
  {
    key: 'invoicing',
    label: 'Invoicing Centre',
    views: ['NDIS Claims & Pay', 'Price Guide Builder', 'Bank Reconciliation'],
    path: '/invoicing',
    icon: FileSpreadsheet,
  },
  {
    key: 'communications',
    label: 'Communication Centre',
    views: ['Shift Notes & Inbox', 'AI Compose & Email', '5-Day Complaint SLA'],
    path: '/communications',
    icon: Megaphone,
  },
  {
    key: 'goals',
    label: 'Goal Progress',
    views: ['Outcomes & AI Coach', 'Funding Utilisation', 'Goal Progress Slider'],
    path: '/goals',
    icon: Target,
  },
  {
    key: 'training',
    label: 'Training Centre',
    views: ['LMS & AI Quizzes', 'AI Course Studio', 'Signed PDF Certs'],
    path: '/training',
    icon: GraduationCap,
  },
  {
    key: 'community-council',
    label: 'Community Hub',
    views: ['Programs & Events', 'Postcode Directory', 'Event Flyer Studio'],
    path: '/community-council',
    icon: MapPin,
  },
  {
    key: 'certificates',
    label: 'Recognition & Certs',
    views: ['Signed PDF Awards', 'Milestone Badges', 'Renewal Calendar'],
    path: '/certificates',
    icon: BadgeCheck,
  },
  {
    key: 'tasks',
    label: 'Task Dashboard',
    views: ['Shared To-Do & SLA', 'Digital Sign-Off', '30-Task Batch PDF'],
    path: '/tasks',
    icon: ClipboardList,
  },
  {
    key: 'incidents',
    label: 'Incident Clinic',
    views: ['24h / 5d NDIS Timers', 'Root-Cause Review', 'Photo Evidence Log'],
    path: '/incidents',
    icon: AlertTriangle,
  },
  {
    key: 'human-resources',
    label: 'HR & Volunteers',
    views: ['Contracts & Reviews', 'Digital E-Signing', 'Volunteer Placements'],
    path: '/hr',
    icon: UsersRound,
  },
  {
    key: 'company-safe',
    label: 'Company Safe',
    views: ['Protected Vault', 'Executive Wall View', 'Insurance Register'],
    path: '/company-safe',
    icon: Vault,
  },
  {
    key: 'intake',
    label: 'Intake Centre',
    views: ['1-Click Onboarding', 'AI Resume Extract', 'Fast Profile Sync'],
    path: '/intake',
    icon: Briefcase,
  },
];

export default function QuickAppBar() {
  const location = useLocation();
  const [litIdx, setLitIdx] = useState(0);
  const [cycleIdx, setCycleIdx] = useState(0);

  // Highlight one module tile at a time every 1.8 seconds
  useEffect(() => {
    const lightTimer = setInterval(() => {
      setLitIdx((prev) => (prev + 1) % QUICK_LINKS.length);
    }, 1800);
    return () => clearInterval(lightTimer);
  }, []);

  // Rotate the featured view shown under each module every 30 seconds
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
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs sm:p-4">
        {/* Landing-style header: gradient editorial title + live status pill */}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-editorial text-sm sm:text-base font-extrabold tracking-tight text-[#0A2B6D]">
              Quick App{' '}
              <span className="bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                Bar
              </span>
            </h2>
            <p className="text-[11px] font-medium leading-snug text-[#0A2B6D]/70">
              Jump straight into any module without leaving your workspace.
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-[#0072FF]/25 bg-[#0072FF]/5 px-3 py-1 text-[10.5px] font-extrabold text-[#0072FF] sm:self-auto">
            <Radio className="h-3 w-3 shrink-0 text-[#FF2E9A]" />
            <span className="whitespace-nowrap">
              Live · {String(litIdx + 1).padStart(2, '0')}/{QUICK_LINKS.length} · View {(cycleIdx % 3) + 1}/3
            </span>
          </span>
        </div>

        {/* Clean module tiles matching the landing page cards */}
        <div className="grid auto-rows-fr grid-cols-2 items-stretch gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_LINKS.map((item, idx) => {
            const active = isActive(item.path);
            const isLit = litIdx === idx;
            const Icon = item.icon;
            const currentSub = item.views[cycleIdx % item.views.length];

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex h-full min-h-[76px] flex-col justify-between gap-1.5 rounded-xl border p-2.5 transition-all duration-200 ${
                  active
                    ? 'border-[#5A00D6] bg-[#F5F0FF] shadow-2xs'
                    : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#0072FF]/40 hover:shadow-md'
                } ${isLit && !active ? 'ring-1 ring-[#00C6FF]/60' : ''}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs"
                    style={{ background: getHeaderView(idx) }}
                  >
                    <Icon className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                  </span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-[#0A2B6D]/30 transition group-hover:translate-x-0.5 group-hover:text-[#0072FF]" />
                </div>

                <div className="min-w-0">
                  <div className="break-words text-[11px] font-extrabold leading-snug text-[#0A2B6D]">
                    {item.label}
                  </div>
                  <div className="mt-0.5 break-words text-[10px] font-medium leading-snug text-[#0A2B6D]/65">
                    {currentSub}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}