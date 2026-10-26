import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Compass, Sparkles,
  UserCircle, Users, Heart, ShieldCheck, FileSpreadsheet, Megaphone,
  MapPin, BadgeCheck, ClipboardList, AlertTriangle, UsersRound, Vault,
  CalendarClock, Target, GraduationCap, Briefcase,
} from 'lucide-react';
import { getHeaderView, getSymbolView, getAppBorderView } from '@/lib/fullColourTiles';

const QUICK_LINKS = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'operations-centre', label: 'Operations Centre', path: '/operations-centre', icon: Sparkles },
  { key: 'rostering', label: 'Roster & Shifts', path: '/roster', icon: CalendarClock },
  { key: 'my-profile', label: 'My Profile', path: '/my-profile', icon: UserCircle },
  { key: 'our-staff', label: 'Employee Profiles', path: '/our-employees', icon: Users },
  { key: 'our-participants', label: 'Participant Profiles', path: '/our-participants', icon: Heart },
  { key: 'compliance', label: 'Compliance Centre', path: '/compliance', icon: ShieldCheck },
  { key: 'invoicing', label: 'Invoicing Centre', path: '/invoicing', icon: FileSpreadsheet },
  { key: 'communications', label: 'Communication Centre', path: '/communications', icon: Megaphone },
  { key: 'goals', label: 'Goal Progress', path: '/goals', icon: Target },
  { key: 'training', label: 'Training Centre', path: '/training', icon: GraduationCap },
  { key: 'community-council', label: 'Community Hub', path: '/community-council', icon: MapPin },
  { key: 'certificates', label: 'Recognition & Certs', path: '/certificates', icon: BadgeCheck },
  { key: 'tasks', label: 'Task Dashboard', path: '/tasks', icon: ClipboardList },
  { key: 'incidents', label: 'Incident Clinic', path: '/incidents', icon: AlertTriangle },
  { key: 'human-resources', label: 'HR & Volunteers', path: '/hr', icon: UsersRound },
  { key: 'company-safe', label: 'Company Safe', path: '/company-safe', icon: Vault },
  { key: 'intake', label: 'Intake Centre', path: '/intake', icon: Briefcase },
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
        style={{
          background:
            'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
        }}
      >
        <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-3 py-4 sm:px-5 sm:py-5 text-center space-y-3.5">
          {/* Enlarged Full-Width Stretched Instant Workspace Navigation (Live Modules) Header on One Line */}
          <div
            className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#0A2B6D] px-4 sm:px-6 py-2.5 text-xs sm:text-base md:text-lg font-extrabold tracking-wide text-white shadow-sm"
            style={{ background: getHeaderView(1) }}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <Compass className="h-4 w-4 text-white" />
            </span>
            <span className="whitespace-nowrap text-center">
              Quick App Bar — Instant Workspace Navigation (Live Modules)
            </span>
          </div>

          {/* White Background + Double-Size Modular Tiles in App Colour (Different Views), White Writing & One-Line Fit */}
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
                  className={`flex h-full min-h-[88px] sm:min-h-[96px] items-center gap-2.5 sm:gap-3 rounded-2xl border-[3px] px-3.5 sm:px-4 py-3.5 text-xs sm:text-[13px] md:text-sm lg:text-[15px] font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                    active ? 'ring-2 ring-[#0A2B6D]' : ''
                  }`}
                  style={{
                    background: getHeaderView(idx),
                    color: '#FFFFFF',
                    borderColor: borderCol,
                  }}
                >
                  <span
                    className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border-2 bg-white shadow-sm"
                    style={{ borderColor: borderCol }}
                  >
                    <Icon className="h-5 w-5" style={{ color: sym.iconColor }} />
                  </span>
                  <span className="min-w-0 flex-1 text-left leading-snug text-white break-words">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}