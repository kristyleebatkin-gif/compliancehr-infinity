import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import {
  ChevronDown, ChevronUp, Home, LayoutDashboard, Compass, Sparkles,
  UserCircle, Users, Heart, ShieldCheck, FileSpreadsheet, Megaphone,
  MapPin, BadgeCheck, ClipboardList, AlertTriangle, UsersRound, Vault,
  CalendarClock, Target, GraduationCap, Briefcase,
} from 'lucide-react';

// Mixed-up full-colour palette so adjacent buttons never share the same background
const MIXED_FULL_COLOURS = [
  { bg: 'linear-gradient(135deg, #0072FF 0%, #0A2B6D 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #FF2E9A 0%, #A100FF 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)', text: '#0A2B6D' },
  { bg: 'linear-gradient(135deg, #5A00D6 0%, #A100FF 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #0A2B6D 0%, #5A00D6 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #A100FF 0%, #FF2E9A 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #FF6EDB 0%, #FF2E9A 100%)', text: '#0A2B6D' },
  { bg: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 100%)', text: '#ffffff' },
];

// 18 Quick Links (3 rows of 6 on each line), each in mixed full colour!
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
    <div
      className="w-full border-t-2 border-b-4 border-[#0A2B6D] shadow-md"
      style={{
        background:
          'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 38%, #A100FF 60%, #FF2E9A 82%, #0072FF 100%)',
      }}
    >
      <div className="mx-auto max-w-7xl px-3 py-2 md:px-6">
        <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white/95 p-2.5 shadow-md ring-2 ring-[#00C6FF] space-y-2">
          {/* Top Control Row: Landing Page BEFORE Quick App Bar Icon + All 46 Modules Icon Beside It */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0A2B6D]/20 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Landing Page placed right BEFORE Quick App Bar icon */}
              <Link
                to="/"
                onClick={() => setShowAllModules(false)}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] bg-gradient-to-r from-[#FF2E9A] via-[#A100FF] to-[#5A00D6] px-3 py-1 text-xs font-extrabold text-white shadow-sm ring-2 ring-[#FF6EDB] transition-transform hover:-translate-y-0.5"
              >
                <Home className="h-3.5 w-3.5 text-white" />
                Landing Page
              </Link>

              <span
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #0072FF 0%, #0A2B6D 100%)' }}
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

            <span className="rounded-full border border-[#0A2B6D] bg-[#F5F0FF] px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#0A2B6D]">
              6 Per Line · Full Mixed App Colours
            </span>
          </div>

          {/* 6-Per-Line Grid of Quick App Links in Mixed Full Colours */}
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6">
            {QUICK_LINKS.map((item, idx) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              const palette = MIXED_FULL_COLOURS[idx % MIXED_FULL_COLOURS.length];
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowAllModules(false)}
                  className={`flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] px-2 py-1.5 text-[10.5px] font-extrabold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    active ? 'ring-2 ring-[#00C6FF]' : ''
                  }`}
                  style={{ background: palette.bg, color: palette.text }}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/50 bg-black/20 text-white shadow-2xs">
                    <Icon className="h-3 w-3 text-white" />
                  </span>
                  <span className="min-w-0 flex-1 leading-tight" style={{ color: palette.text }}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* All 46 Actual App Modules Drawer — 6 on Each Line in Mixed Full Colours */}
        {showAllModules && (
          <div className="mt-2 max-h-[72vh] overflow-y-auto rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 shadow-xl">
            <div
              className="mb-2.5 flex items-center justify-between rounded-xl border-2 border-[#0A2B6D] px-3 py-2 text-white"
              style={{ background: 'var(--header-gradient)' }}
            >
              <div className="text-xs font-extrabold uppercase tracking-wider text-white">
                All {MODULE_DIRECTORY.length} Actual App Modules (6 Per Line · Full Mixed Colours)
              </div>
              <button
                type="button"
                onClick={() => setShowAllModules(false)}
                className="rounded-lg border-2 border-[#0A2B6D] bg-white px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6">
              {MODULE_DIRECTORY.map((mod, idx) => {
                const Icon = mod.icon;
                const palette = MIXED_FULL_COLOURS[idx % MIXED_FULL_COLOURS.length];
                return (
                  <Link
                    key={mod.key}
                    to={mod.path}
                    onClick={() => setShowAllModules(false)}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] px-2 py-1.5 text-[10.5px] font-extrabold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ background: palette.bg, color: palette.text }}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/50 bg-black/20 text-white shadow-2xs">
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </span>
                    <span className="min-w-0 flex-1 leading-tight" style={{ color: palette.text }}>
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