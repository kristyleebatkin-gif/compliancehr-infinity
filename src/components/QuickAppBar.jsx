import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Compass, Sparkles,
  UserCircle, Users, Heart, ShieldCheck, FileSpreadsheet, Megaphone,
  MapPin, BadgeCheck, ClipboardList, AlertTriangle, UsersRound, Vault,
  CalendarClock, Target, GraduationCap, Briefcase, Tablet, ArrowRight,
} from 'lucide-react';
import { getHeaderView, getSymbolView, getAppBorderView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const UNIFORM_IPAD_SPRAY_BG =
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF';

const QUICK_LINKS = [
  { key: 'dashboard', label: 'Dashboard', sub: 'Executive & Role Hub', path: '/dashboard', icon: LayoutDashboard },
  { key: 'operations-centre', label: 'Operations Centre', sub: '1-Click Live Sweeps', path: '/operations-centre', icon: Sparkles },
  { key: 'rostering', label: 'Roster & Shifts', sub: 'SCHADS & Coverage', path: '/roster', icon: CalendarClock },
  { key: 'my-profile', label: 'My Profile', sub: 'Personal Workspace', path: '/my-profile', icon: UserCircle },
  { key: 'our-staff', label: 'Employee Profiles', sub: '100-Pt Staff Files', path: '/our-employees', icon: Users },
  { key: 'our-participants', label: 'Participant Profiles', sub: 'Plans & Consents', path: '/our-participants', icon: Heart },
  { key: 'compliance', label: 'Compliance Centre', sub: 'Audits & Readiness', path: '/compliance', icon: ShieldCheck },
  { key: 'invoicing', label: 'Invoicing Centre', sub: 'NDIS Claims & Pay', path: '/invoicing', icon: FileSpreadsheet },
  { key: 'communications', label: 'Communication Centre', sub: 'Shift Notes & Inbox', path: '/communications', icon: Megaphone },
  { key: 'goals', label: 'Goal Progress', sub: 'Outcomes & AI Coach', path: '/goals', icon: Target },
  { key: 'training', label: 'Training Centre', sub: 'LMS & AI Quizzes', path: '/training', icon: GraduationCap },
  { key: 'community-council', label: 'Community Hub', sub: 'Programs & Events', path: '/community-council', icon: MapPin },
  { key: 'certificates', label: 'Recognition & Certs', sub: 'Signed PDF Awards', path: '/certificates', icon: BadgeCheck },
  { key: 'tasks', label: 'Task Dashboard', sub: 'Shared To-Do & SLA', path: '/tasks', icon: ClipboardList },
  { key: 'incidents', label: 'Incident Clinic', sub: '24h / 5d NDIS Timers', path: '/incidents', icon: AlertTriangle },
  { key: 'human-resources', label: 'HR & Volunteers', sub: 'Contracts & Reviews', path: '/hr', icon: UsersRound },
  { key: 'company-safe', label: 'Company Safe', sub: 'Protected Vault', path: '/company-safe', icon: Vault },
  { key: 'intake', label: 'Intake Centre', sub: '1-Click Onboarding', path: '/intake', icon: Briefcase },
];

export default function QuickAppBar() {
  const location = useLocation();

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
          {/* Enlarged Full-Width Stretched Instant Workspace Navigation (Live iPad Modules) Header */}
          <div
            className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#0A2B6D] px-4 sm:px-6 py-2.5 text-xs sm:text-base md:text-lg font-extrabold tracking-wide text-white shadow-sm"
            style={{ background: getHeaderView(1) }}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <Compass className="h-4 w-4 text-white" />
            </span>
            <span className="text-center">
              Quick App Bar — Instant Workspace Navigation (Live iPad Screens)
            </span>
          </div>

          {/* 18 Modular Tiles Styled as iPad Screens */}
          <div className="grid w-full grid-cols-1 gap-3.5 rounded-2xl bg-white p-1.5 sm:grid-cols-2 md:grid-cols-3 auto-rows-fr">
            {QUICK_LINKS.map((item, idx) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              const sym = getSymbolView(idx);
              const borderCol = getAppBorderView(idx);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex h-full flex-col justify-between rounded-[22px] border-[3px] bg-[#0A2B6D] p-2.5 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                    active ? 'ring-2 ring-[#FF2E9A]' : ''
                  }`}
                  style={{ borderColor: borderCol }}
                >
                  {/* Top iPad Camera & Bezel Bar */}
                  <div className="mb-1.5 flex items-center justify-between px-2">
                    <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-white">
                      <Tablet className="h-2.5 w-2.5 text-[#00C6FF]" />
                      IPAD {String(idx + 1).padStart(2, '0')} · {active ? 'ACTIVE' : 'LIVE'}
                    </span>
                    <span className="h-2 w-2 rounded-full border border-white/60 bg-[#00C6FF]" />
                    <span
                      className={`h-2 w-2 rounded-full ${
                        active ? 'bg-[#FF2E9A]' : 'bg-[#10B981]'
                      }`}
                    />
                  </div>

                  {/* Inner iPad Display Screen */}
                  <div
                    className="flex flex-1 rounded-2xl p-[2.5px]"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div
                      className="flex w-full flex-col items-center justify-between gap-2 rounded-[13px] px-3 py-2.5 text-center"
                      style={{ background: UNIFORM_IPAD_SPRAY_BG }}
                    >
                      {/* Centered Module Title & Icon inside App Design Coloured Border */}
                      <div
                        className="w-full rounded-xl p-[2px] shadow-2xs"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <div className="flex items-center justify-center gap-2 rounded-[9px] bg-white px-2.5 py-1.5 text-center">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs transition-transform group-hover:scale-105"
                            style={{ borderColor: borderCol }}
                          >
                            <Icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold leading-tight text-[#0A2B6D]">
                            {item.label}
                          </span>
                        </div>
                      </div>

                      {/* Centered Subtitle & Open Pill */}
                      <div className="flex w-full items-center justify-between gap-2 px-1">
                        <span
                          className="text-[10.5px] font-extrabold leading-tight text-black"
                          style={{ color: '#000000' }}
                        >
                          {item.sub}
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

                  {/* Bottom iPad Home Indicator Bar */}
                  <div className="mt-1.5 flex items-center justify-center">
                    <span className="h-1 w-10 rounded-full bg-white/80" />
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