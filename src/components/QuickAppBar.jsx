import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import {
  ChevronDown, ChevronUp, Home, LayoutDashboard, Compass, Sparkles,
  UserCircle, Users, Heart, ShieldCheck, FileSpreadsheet, Megaphone,
  MapPin, BadgeCheck, ClipboardList, AlertTriangle, UsersRound, Vault,
  CalendarClock, Target, GraduationCap,
} from 'lucide-react';

// 18 Quick Links (3 rows of 6 on each line), with Landing Page placed at the right-side bottom!
const QUICK_LINKS = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, color: '#0A2B6D' },
  { key: 'operations-centre', label: 'Operations Centre', path: '/operations-centre', icon: Sparkles, color: '#A100FF' },
  { key: 'rostering', label: 'Roster & Shifts', path: '/roster', icon: CalendarClock, color: '#0072FF' },
  { key: 'my-profile', label: 'My Profile', path: '/my-profile', icon: UserCircle, color: '#5A00D6' },
  { key: 'our-staff', label: 'Employee Profiles', path: '/our-employees', icon: Users, color: '#0072FF' },
  { key: 'our-participants', label: 'Participant Profiles', path: '/our-participants', icon: Heart, color: '#FF2E9A' },
  { key: 'compliance', label: 'Compliance Centre', path: '/compliance', icon: ShieldCheck, color: '#5A00D6' },
  { key: 'invoicing', label: 'Invoicing Centre', path: '/invoicing', icon: FileSpreadsheet, color: '#00C6FF' },
  { key: 'communications', label: 'Comms Centre', path: '/communications', icon: Megaphone, color: '#A100FF' },
  { key: 'goals', label: 'Goal Progress', path: '/goals', icon: Target, color: '#0072FF' },
  { key: 'training', label: 'Training Centre', path: '/training', icon: GraduationCap, color: '#5A00D6' },
  { key: 'community-council', label: 'Community Hub', path: '/community-council', icon: MapPin, color: '#00C6FF' },
  { key: 'certificates', label: 'Recognition & Certs', path: '/certificates', icon: BadgeCheck, color: '#FF2E9A' },
  { key: 'tasks', label: 'Task Dashboard', path: '/tasks', icon: ClipboardList, color: '#5A00D6' },
  { key: 'incidents', label: 'Incident Clinic', path: '/incidents', icon: AlertTriangle, color: '#FF2E9A' },
  { key: 'human-resources', label: 'HR & Volunteers', path: '/hr', icon: UsersRound, color: '#0A2B6D' },
  { key: 'company-safe', label: 'Company Safe', path: '/company-safe', icon: Vault, color: '#A100FF' },
  { key: 'landing', label: 'Landing Page', path: '/', icon: Home, color: '#FF2E9A' },
];

export default function QuickAppBar() {
  const [showAllModules, setShowAllModules] = useState(false);
  const location = useLocation();

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div
      className="w-full border-t-2 border-b-4 border-[#0A2B6D] shadow-md"
      style={{
        background:
          'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 38%, #A100FF 60%, #FF2E9A 82%, #0072FF 100%)',
      }}
    >
      <div className="mx-auto max-w-7xl px-3 py-2 md:px-6">
        <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white/95 p-2 shadow-md space-y-2">
          {/* Top Control Row: Quick App Bar Icon and All 46 Modules Icon BESIDE EACH OTHER */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C084FC]/50 pb-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm"
                style={{ background: 'var(--header-gradient)' }}
              >
                <Compass className="h-3.5 w-3.5 text-[#00C6FF]" />
                Quick App Bar
              </span>

              <button
                type="button"
                onClick={() => setShowAllModules((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] px-3 py-1 text-xs font-extrabold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(120deg, #5A00D6 0%, #A100FF 50%, #FF2E9A 100%)' }}
              >
                <Sparkles className="h-3.5 w-3.5 text-[#00C6FF]" />
                All {MODULE_DIRECTORY.length} Modules
                {showAllModules ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>

            <span className="text-[10.5px] font-extrabold text-[#0A2B6D]">
              6 Per Line · Full-Colour Module Icons · Click Any Module to Launch
            </span>
          </div>

          {/* 6-Per-Line Grid of Quick App Links with Landing Page at Right-Side Bottom */}
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            {QUICK_LINKS.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowAllModules(false)}
                  className={`flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] px-2 py-1 text-[11px] font-extrabold transition-all hover:-translate-y-0.5 ${
                    active
                      ? 'text-white shadow-md ring-2 ring-[#FF2E9A]'
                      : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                  }`}
                  style={
                    active
                      ? { background: 'var(--header-gradient)' }
                      : { borderTopWidth: '3px', borderTopColor: item.color }
                  }
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[#0A2B6D]/30 text-white shadow-2xs"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* All 46 Actual App Modules Drawer — 6 on Each Line with Full-Colour Icons */}
        {showAllModules && (
          <div className="mt-2 max-h-[72vh] overflow-y-auto rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 shadow-xl">
            <div
              className="mb-2.5 flex items-center justify-between rounded-xl border-2 border-[#0A2B6D] px-3 py-2 text-white"
              style={{ background: 'var(--header-gradient)' }}
            >
              <div className="text-xs font-extrabold uppercase tracking-wider text-white">
                All {MODULE_DIRECTORY.length} Actual App Modules (6 Per Line · Full-Colour Icons)
              </div>
              <button
                type="button"
                onClick={() => setShowAllModules(false)}
                className="rounded-lg border-2 border-[#0A2B6D] bg-white px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {MODULE_DIRECTORY.map((mod) => {
                const Icon = mod.icon;
                const color = moduleKeyColour(mod.key);
                const active = isActive(mod.path);
                return (
                  <Link
                    key={mod.key}
                    to={mod.path}
                    onClick={() => setShowAllModules(false)}
                    className={`flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] px-2 py-1.5 text-[11px] font-extrabold transition-all hover:-translate-y-0.5 ${
                      active ? 'text-white shadow-md' : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                    }`}
                    style={{
                      borderTopWidth: '3px',
                      borderTopColor: color,
                      backgroundColor: active ? color : undefined,
                    }}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#0A2B6D]/40 text-white shadow-2xs"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">{mod.label}</span>
                  </Link>
                );
              })}
              <Link
                to="/"
                onClick={() => setShowAllModules(false)}
                className="flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] bg-[#FFF0F8] px-2 py-1.5 text-[11px] font-extrabold text-[#0A2B6D] ring-1 ring-[#FF2E9A] hover:bg-[#F5F0FF]"
                style={{ borderTopWidth: '3px', borderTopColor: '#FF2E9A' }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FF2E9A] text-white">
                  <Home className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1 leading-tight">Landing Page</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}