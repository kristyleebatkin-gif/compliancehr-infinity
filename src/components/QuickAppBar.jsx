import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Sparkles, Compass,
  UserCircle, Users, Heart, ShieldCheck, FileSpreadsheet, Megaphone,
  MapPin, BadgeCheck, ClipboardList, AlertTriangle, UsersRound, Vault,
  CalendarClock, Target, GraduationCap, Briefcase, Tablet, ArrowRight, Radio,
} from 'lucide-react';
import { getHeaderView } from '@/lib/fullColourTiles';

const FRAME_GRADIENT =
  'linear-gradient(120deg, #0A2B6D 0%, #0072FF 30%, #5A00D6 66%, #FF2E9A 100%)';

const SCREEN_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

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

  // Light one iPad screen at a time, every 1.8 seconds
  useEffect(() => {
    const lightTimer = setInterval(() => {
      setLitIdx((prev) => (prev + 1) % QUICK_LINKS.length);
    }, 1800);
    return () => clearInterval(lightTimer);
  }, []);

  // Rotate the view shown on every screen, every 30 seconds
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
      <div
        className="rounded-2xl p-[3px] shadow-md"
        style={{ background: FRAME_GRADIENT }}
      >
        <div className="space-y-3 rounded-[13px] bg-white p-3 sm:p-4">
          {/* Header bar — title plus live screen status, wraps cleanly at every width */}
          <div
            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl px-3 py-2 text-white"
            style={{ background: getHeaderView(1) }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20">
                <Compass className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
              </span>
              <span className="text-[11.5px] font-extrabold leading-tight text-white sm:text-xs">
                Quick App Bar — Instant Workspace Navigation
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              <Radio className="h-3 w-3 shrink-0" style={{ color: '#00C6FF' }} />
              <span className="whitespace-nowrap">
                Live iPad Screens · #{String(litIdx + 1).padStart(2, '0')}/{QUICK_LINKS.length} · View {(cycleIdx % 3) + 1}/3
              </span>
            </span>
          </div>

          {/* iPad screens — identical structure, equal heights, text sized to fit */}
          <div className="grid auto-rows-fr grid-cols-2 items-stretch gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {QUICK_LINKS.map((item, idx) => {
              const active = isActive(item.path);
              const isLit = litIdx === idx;
              const Icon = item.icon;
              const currentSub = item.views[cycleIdx % item.views.length];
              const bezelColor = active ? '#5A00D6' : isLit ? '#00C6FF' : '#0A2B6D';

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={`${item.label} — ${currentSub}`}
                  className={`group flex h-full min-h-[96px] flex-col rounded-xl border-2 p-1 transition-all duration-300 ${
                    active || isLit ? '-translate-y-0.5 shadow-md' : 'hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                  style={{ borderColor: bezelColor, background: '#0A2B6D' }}
                >
                  {/* Bezel bar: screen number and status light */}
                  <div className="flex h-3 items-center justify-between px-1">
                    <span className="flex items-center gap-0.5 text-[7px] font-extrabold uppercase tracking-wider text-white">
                      <Tablet className="h-2.5 w-2.5 shrink-0" style={{ color: '#00C6FF' }} />
                      IPAD {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        isLit ? 'animate-ping bg-[#FF2E9A]' : 'bg-[#10B981]'
                      }`}
                    />
                  </div>

                  {/* Screen: gradient frame, app-coloured title bar, white writing box */}
                  <div className="flex flex-1 rounded-lg p-[1.5px]" style={{ background: SCREEN_GRADIENT }}>
                    <div className="flex h-full w-full flex-col justify-between gap-1 rounded-[6px] bg-white p-1">
                      <div
                        className="flex min-h-[22px] w-full items-center justify-center gap-1 rounded px-1 py-0.5"
                        style={{ background: getHeaderView(idx) }}
                      >
                        <Icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                        <span className="break-words text-center text-[8.5px] font-extrabold leading-[11px] text-white">
                          {item.label}
                        </span>
                      </div>

                      <div className="w-full rounded p-[1.5px]" style={{ background: SCREEN_GRADIENT }}>
                        <div className="flex min-h-[26px] w-full items-center justify-between gap-1 rounded-[3px] bg-white px-1.5 py-1">
                          <span className="line-clamp-2 flex-1 break-words text-center text-[8px] font-bold leading-[10px] text-[#0A2B6D]">
                            {currentSub}
                          </span>
                          <ArrowRight
                            className="h-2.5 w-2.5 shrink-0 text-[#0A2B6D] transition group-hover:translate-x-0.5"
                          />
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