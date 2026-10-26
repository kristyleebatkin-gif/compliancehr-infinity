import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import {
  ChevronDown, ChevronUp, LayoutDashboard, Compass, Sparkles,
  UserCircle, Users, Heart, ShieldCheck, FileSpreadsheet, Megaphone,
  MapPin, BadgeCheck, ClipboardList, AlertTriangle, UsersRound, Vault,
  CalendarClock, Target, GraduationCap, Briefcase,
} from 'lucide-react';

const QUICK_LINKS = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'operations-centre', label: 'Operations Centre', path: '/operations-centre', icon: Sparkles },
  { key: 'rostering', label: 'Roster & Shifts', path: '/roster', icon: CalendarClock },
  { key: 'my-profile', label: 'My Profile', path: '/my-profile', icon: UserCircle },
  { key: 'our-staff', label: 'Employee Profiles', path: '/our-employees', icon: Users },
  { key: 'our-participants', label: 'Participant Profiles', path: '/our-participants', icon: Heart },
  { key: 'compliance', label: 'Compliance Centre', path: '/compliance', icon: ShieldCheck },
  { key: 'invoicing', label: 'Invoicing Centre', path: '/invoicing', icon: FileSpreadsheet },
  { key: 'communications', label: 'Comms Centre', path: '/communications', icon: Megaphone },
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
  const [showAllModules, setShowAllModules] = useState(false);
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
        <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-3 py-4 sm:px-4 sm:py-4 text-center space-y-3">
          {/* Centred Header Badge + Toggle Button Matching Top Section Design */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span
              className="inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
              style={{
                background:
                  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)',
              }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#FF2E9A]">
                <Compass className="h-3.5 w-3.5 text-[#FF2E9A]" />
              </span>
              <span className="text-center">Quick App Bar — Instant Workspace Navigation</span>
            </span>

            <button
              type="button"
              onClick={() => setShowAllModules((prev) => !prev)}
              className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
              style={{
                background:
                  'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
              }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#0072FF]">
                <Sparkles className="h-3.5 w-3.5 text-[#0072FF]" />
              </span>
              <span>All {MODULE_DIRECTORY.length} Modules</span>
              {showAllModules ? <ChevronUp className="h-3.5 w-3.5 text-white" /> : <ChevronDown className="h-3.5 w-3.5 text-white" />}
            </button>
          </div>

          {/* 6-Per-Line Grid of Quick App Module Items */}
          <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6 auto-rows-fr">
            {QUICK_LINKS.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowAllModules(false)}
                  className={`flex h-full min-h-[42px] items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-1.5 text-[10px] lg:text-[11px] font-extrabold text-[#0A2B6D] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] hover:shadow-md ${
                    active ? 'ring-2 ring-[#FF2E9A]' : ''
                  }`}
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white shadow-2xs"
                    style={{
                      background:
                        'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)',
                    }}
                  >
                    <Icon className="h-3 w-3 text-white" />
                  </span>
                  <span className="min-w-0 flex-1 whitespace-normal break-words text-left leading-tight text-[#0A2B6D]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* All 46 Actual App Modules Drawer */}
          {showAllModules && (
            <div className="w-full pt-2 space-y-2.5 border-t-2 border-[#0A2B6D]/20">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  All {MODULE_DIRECTORY.length} Live App Modules
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllModules(false)}
                  className="rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-0.5 text-xs font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6 auto-rows-fr">
                {MODULE_DIRECTORY.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <Link
                      key={mod.key}
                      to={mod.path}
                      onClick={() => setShowAllModules(false)}
                      className="flex h-full min-h-[42px] items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-1.5 text-[10px] lg:text-[11px] font-extrabold text-[#0A2B6D] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] hover:shadow-md"
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white shadow-2xs"
                        style={{
                          background:
                            'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)',
                        }}
                      >
                        <Icon className="h-3 w-3 text-white" />
                      </span>
                      <span className="min-w-0 flex-1 whitespace-normal break-words text-left leading-tight text-[#0A2B6D]">
                        {mod.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}