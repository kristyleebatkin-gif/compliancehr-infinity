import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import {
  ChevronDown, ChevronUp, Home, LayoutDashboard, Compass, Sparkles,
  UserCircle, Users, Heart, ShieldCheck, FileSpreadsheet, Megaphone,
  MapPin, BadgeCheck, ClipboardList, AlertTriangle, UsersRound, Vault,
  CalendarClock, Target, GraduationCap, Briefcase,
} from 'lucide-react';

// Mixed-up vibrant app colours for circular icon badges while text sits on a crisp WHITE background!
const MIXED_COLOURS = [
  '#0072FF',
  '#FF2E9A',
  '#5A00D6',
  '#00C6FF',
  '#A100FF',
  '#0A2B6D',
  '#FF6EDB',
  '#0072FF',
  '#5A00D6',
  '#FF2E9A',
  '#A100FF',
  '#00C6FF',
];

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
    <div className="w-full border-t-2 border-b-4 border-[#0A2B6D] bg-white shadow-md">
      <div className="w-full px-[0.5cm] py-2">
        <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-2.5 shadow-md space-y-2.5">
          {/* Longer Full-Width Quick App Bar Header in the Same Colours as the App */}
          <div
            className="flex w-full flex-col sm:flex-row items-center justify-between gap-2.5 rounded-xl border-2 border-[#0A2B6D] px-4 py-2.5 text-white shadow-md"
            style={{
              background:
                'linear-gradient(120deg, #00C6FF 0%, #0072FF 20%, #0A2B6D 38%, #5A00D6 58%, #A100FF 78%, #FF2E9A 100%)',
            }}
          >
            <div className="flex items-center justify-center gap-2.5 text-center sm:text-left">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white text-white shadow-sm"
                style={{
                  background:
                    'linear-gradient(135deg, #00C6FF 0%, #0072FF 30%, #5A00D6 65%, #FF2E9A 100%)',
                }}
              >
                <Compass className="h-4 w-4 text-white" />
              </span>
              <h2 className="font-editorial text-base sm:text-lg md:text-xl font-extrabold uppercase tracking-wider text-white">
                Quick App Bar — Instant Workspace Navigation
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowAllModules((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border-2 border-white px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-transform hover:-translate-y-0.5"
              style={{
                background:
                  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 48%, #5A00D6 80%, #0072FF 100%)',
              }}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#5A00D6]">
                <Sparkles className="h-3 w-3 text-[#5A00D6]" />
              </span>
              <span>All {MODULE_DIRECTORY.length} Modules</span>
              {showAllModules ? <ChevronUp className="h-3.5 w-3.5 text-white" /> : <ChevronDown className="h-3.5 w-3.5 text-white" />}
            </button>
          </div>

          {/* 6-Per-Line Grid of Quick App Module Items — Clean White Around Items (Inside Border Only) & Circular App-Colour Icons */}
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6 auto-rows-fr">
            {QUICK_LINKS.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowAllModules(false)}
                  className={`flex h-full min-h-[42px] items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] bg-white px-2 py-1 text-[9.5px] lg:text-[10.5px] font-extrabold text-[#0A2B6D] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] hover:shadow-md ${
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
                  <span className="min-w-0 flex-1 whitespace-normal break-words rounded bg-white text-left leading-tight text-[#0A2B6D]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* All 46 Actual App Modules Drawer — Equal Size, Circular Icons & All Writing Fitted Inside */}
        {showAllModules && (
          <div className="mt-2 max-h-[72vh] overflow-y-auto rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 shadow-xl">
            <div className="mb-2.5 flex items-center justify-between rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF] px-3 py-2">
              <div className="rounded bg-white px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                All {MODULE_DIRECTORY.length} Live App Modules
              </div>
              <button
                type="button"
                onClick={() => setShowAllModules(false)}
                className="rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-0.5 text-xs font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6 auto-rows-fr">
              {MODULE_DIRECTORY.map((mod, idx) => {
                const Icon = mod.icon;
                const accent = MIXED_COLOURS[idx % MIXED_COLOURS.length];
                return (
                  <Link
                    key={mod.key}
                    to={mod.path}
                    onClick={() => setShowAllModules(false)}
                    className="flex h-full min-h-[42px] items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] bg-white px-2 py-1 text-[9.5px] lg:text-[10.5px] font-extrabold text-[#0A2B6D] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] hover:shadow-md"
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
                    <span className="min-w-0 flex-1 whitespace-normal break-words rounded bg-white text-left leading-tight text-[#0A2B6D]">
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
  );
}