import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Compass, Sparkles,
  UserCircle, Users, Heart, ShieldCheck, FileSpreadsheet, Megaphone,
  MapPin, BadgeCheck, ClipboardList, AlertTriangle, UsersRound, Vault,
  CalendarClock, Target, GraduationCap, Briefcase, Tablet, ArrowRight, Radio,
} from 'lucide-react';
import { getHeaderView, getSymbolView, getAppBorderView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const UNIFORM_IPAD_SPRAY_BG =
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF';

const LIT_IPAD_SPRAY_BG =
  'radial-gradient(circle at 50% 25%, rgba(0, 198, 255, 0.48) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(255, 46, 154, 0.48) 0%, transparent 55%), radial-gradient(circle at 85% 75%, rgba(161, 0, 255, 0.45) 0%, transparent 55%), #FFFFFF';

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

  // Light up iPad screens one by one every 1.8 seconds
  useEffect(() => {
    const lightTimer = setInterval(() => {
      setLitIdx((prev) => (prev + 1) % QUICK_LINKS.length);
    }, 1800);
    return () => clearInterval(lightTimer);
  }, []);

  // Change all iPad screen views every 30 seconds
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
    <div className="w-full bg-white px-[0.5cm] pb-2">
      <div
        className="rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-3 py-4 sm:px-5 sm:py-5 text-center space-y-3.5">
          {/* Stretched Header — Line 1: Instant Workspace Navigation, Line 2: Live iPad Screens */}
          <div
            className="flex min-h-[62px] w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[#0A2B6D] px-4 sm:px-6 py-2.5 text-white shadow-sm"
            style={{ background: getHeaderView(1), color: '#FFFFFF' }}
          >
            <div className="flex items-center justify-center gap-2.5 text-xs sm:text-base md:text-lg font-extrabold tracking-wide text-white">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                <Compass className="h-4 w-4 text-white" style={{ color: '#FFFFFF' }} />
              </span>
              <span className="text-center" style={{ color: '#FFFFFF' }}>
                Quick App Bar — Instant Workspace Navigation
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-white">
              <Radio className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span style={{ color: '#FFFFFF' }}>
                Live iPad Screens · Screen #{String(litIdx + 1).padStart(2, '0')} of {QUICK_LINKS.length} Lit · 30s ({(cycleIdx % 3) + 1}/3)
              </span>
            </div>
          </div>

          {/* 18 Modular Tiles Styled as 50% Smaller iPad Screens With App-Coloured Headers */}
          <div className="grid w-full grid-cols-2 gap-1.5 rounded-xl bg-white p-1 sm:grid-cols-3 lg:grid-cols-6 auto-rows-fr items-stretch">
            {QUICK_LINKS.map((item, idx) => {
              const active = isActive(item.path);
              const isLit = litIdx === idx;
              const Icon = item.icon;
              const sym = getSymbolView(idx);
              const borderCol = isLit ? '#00C6FF' : getAppBorderView(idx);
              const currentSub = item.views[cycleIdx % item.views.length];

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex h-full min-h-[86px] flex-col justify-between rounded-[14px] border-2 p-1.5 transition-all duration-300 ${
                    isLit
                      ? 'bg-[#0072FF] -translate-y-0.5 ring-2 ring-[#00C6FF]/70 shadow-md'
                      : active
                      ? 'bg-[#0A2B6D] ring-2 ring-[#FF2E9A] shadow-2xs'
                      : 'bg-[#0A2B6D] shadow-2xs hover:-translate-y-0.5'
                  }`}
                  style={{ borderColor: borderCol }}
                >
                  {/* Top iPad Camera & Bezel Bar */}
                  <div className="mb-1 flex h-[12px] items-center justify-between px-1">
                    <span className="flex items-center gap-0.5 text-[7px] font-extrabold uppercase tracking-wider text-white">
                      <Tablet className="h-2.5 w-2.5 text-[#00C6FF]" />
                      IPAD {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isLit ? 'bg-[#FF2E9A] animate-ping' : 'bg-[#10B981]'
                      }`}
                    />
                  </div>

                  {/* Inner iPad Display Screen — Pink/Blue/Purple Spray Between Outer & Title Border, App-Coloured Header, White Box & Dark Blue Writing */}
                  <div
                    className="flex flex-1 rounded-xl p-[1.5px]"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div
                      className="flex h-full w-full flex-col justify-between gap-1 rounded-[9px] p-1 text-center"
                      style={{ background: isLit ? LIT_IPAD_SPRAY_BG : UNIFORM_IPAD_SPRAY_BG }}
                    >
                      {/* App-Design Coloured Header Bar for Module Title */}
                      <div
                        className="gradient-brand flex min-h-[20px] w-full items-center justify-center gap-1 rounded-md px-1.5 py-0.5 text-center text-white"
                        style={{ background: getHeaderView(idx), color: '#FFFFFF' }}
                      >
                        <Icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                        <span className="text-[8px] font-extrabold leading-tight text-white" style={{ color: '#FFFFFF' }}>
                          {item.label}
                        </span>
                      </div>

                      {/* White Writing Box Framed in App-Design Border With Dark Blue Writing */}
                      <div
                        className="w-full rounded-md p-[1.5px]"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <div className="flex min-h-[20px] w-full items-center justify-between gap-1 rounded-[4px] bg-white px-1.5 py-0.5">
                          <span className="flex-1 text-center text-[7.5px] font-extrabold leading-tight text-[#0A2B6D]">
                            {currentSub}
                          </span>
                          <ArrowRight className="h-2 w-2 shrink-0 text-[#0A2B6D]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}