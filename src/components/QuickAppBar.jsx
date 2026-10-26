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

          {/* 18 Modular Tiles Styled as Identical-Size iPad Screens — All Sections Lined Up Horizontally */}
          <div className="grid w-full grid-cols-1 gap-3.5 rounded-2xl bg-white p-1.5 sm:grid-cols-2 md:grid-cols-3 auto-rows-fr items-stretch">
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
                  className={`group flex h-full min-h-[184px] flex-col justify-between rounded-[22px] border-[3px] p-2.5 transition-all duration-300 ${
                    isLit
                      ? 'bg-[#0072FF] -translate-y-0.5 ring-4 ring-[#00C6FF]/70 shadow-xl'
                      : active
                      ? 'bg-[#0A2B6D] ring-2 ring-[#FF2E9A] shadow-md'
                      : 'bg-[#0A2B6D] shadow-md hover:-translate-y-0.5 hover:shadow-lg'
                  }`}
                  style={{ borderColor: borderCol }}
                >
                  {/* Top iPad Camera & Bezel Bar */}
                  <div className="mb-1.5 flex h-[18px] items-center justify-between px-2">
                    <span className="flex items-center gap-1 text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                      <Tablet className="h-3 w-3 text-[#00C6FF]" />
                      IPAD {String(idx + 1).padStart(2, '0')} · {isLit ? 'LIT UP ✦' : `CH ${(cycleIdx % 3) + 1}`}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full border border-white/80 ${
                        isLit ? 'bg-[#FFF3FA] scale-125' : 'bg-[#00C6FF]'
                      }`}
                    />
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isLit ? 'bg-[#FF2E9A] animate-ping' : active ? 'bg-[#FF2E9A]' : 'bg-[#10B981]'
                      }`}
                    />
                  </div>

                  {/* Inner iPad Display Screen — Fixed Equal Heights So Every iPad Section Lines Up With Neighbour */}
                  <div
                    className="flex flex-1 rounded-2xl p-[2.5px]"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div
                      className="grid h-full w-full grid-cols-1 grid-rows-[1fr_auto] gap-2 rounded-[13px] px-3 py-2.5 text-center"
                      style={{ background: isLit ? LIT_IPAD_SPRAY_BG : UNIFORM_IPAD_SPRAY_BG }}
                    >
                      {/* Section 1: Fixed-Height Module Title Box with App-Design Coloured Symbol & App-Design Coloured Words */}
                      <div
                        className="flex h-full w-full rounded-xl p-[2.5px] shadow-2xs"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <div className="flex min-h-[54px] h-full w-full items-center justify-center gap-2.5 rounded-[9px] bg-white px-2.5 py-1.5 text-center">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-transform group-hover:scale-105"
                            style={{ borderColor: getAppBorderView(idx) }}
                          >
                            <Icon className="h-4.5 w-4.5" style={{ color: sym.iconColor }} />
                          </span>
                          <span
                            className="text-xs sm:text-sm font-extrabold leading-tight"
                            style={{ color: sym.iconColor }}
                          >
                            {item.label}
                          </span>
                        </div>
                      </div>

                      {/* Section 2: Fixed-Height 30-Second Rotating Info Box With App-Design Coloured Words */}
                      <div
                        className="w-full rounded-xl p-[2.5px] shadow-2xs"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <div className="flex min-h-[40px] w-full items-center justify-between gap-2 rounded-[9px] bg-white px-2.5 py-1">
                          <span
                            className="flex-1 text-center text-[11px] font-extrabold leading-tight text-[#5A00D6]"
                          >
                            {currentSub}
                          </span>
                          <span
                            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold text-white shadow-2xs"
                            style={{ background: getHeaderView(idx), color: '#FFFFFF' }}
                          >
                            <span style={{ color: '#FFFFFF' }}>Open</span>
                            <ArrowRight className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom iPad Home Indicator Bar */}
                  <div className="mt-1.5 flex h-[8px] items-center justify-center">
                    <span
                      className={`h-1 w-10 rounded-full ${
                        isLit ? 'bg-[#FFF3FA]' : 'bg-white/80'
                      }`}
                    />
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