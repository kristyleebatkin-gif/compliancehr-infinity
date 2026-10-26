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
          {/* Enlarged Full-Width Stretched Instant Workspace Navigation (Live Modules) Header */}
          <div
            className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#0A2B6D] px-6 py-2.5 text-sm sm:text-base md:text-lg font-extrabold tracking-wide text-white shadow-sm"
            style={{ background: getHeaderView(1) }}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <Compass className="h-4 w-4 text-white" />
            </span>
            <span className="text-center">
              Quick App Bar — Instant Workspace Navigation (Live Modules)
            </span>
          </div>

          {/* White Background Panel + Well-Shaped Rounded Card Tiles with App-Coloured Borders, App-Colour Symbols & Dark Purple Writing */}
          <div className="grid w-full grid-cols-2 gap-2.5 rounded-2xl bg-white p-1 sm:grid-cols-3 md:grid-cols-6 auto-rows-fr">
            {QUICK_LINKS.map((item, idx) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              const sym = getSymbolView(idx);
              const borderCol = getAppBorderView(idx);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex h-full min-h-[46px] items-center gap-2 rounded-xl border-2 bg-white px-3 py-2 text-[11px] font-extrabold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    active ? 'ring-2 ring-[#5A00D6]' : ''
                  }`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#5A00D6',
                    borderColor: borderCol,
                  }}
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 bg-white shadow-2xs"
                    style={{ borderColor: borderCol }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                  </span>
                  <span className="min-w-0 flex-1 whitespace-normal break-words text-left leading-tight text-[#5A00D6]">
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