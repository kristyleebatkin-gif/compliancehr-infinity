import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Sparkles,
  UserCircle, Users, Heart, ShieldCheck, FileSpreadsheet, Megaphone,
  MapPin, BadgeCheck, ClipboardList, AlertTriangle, UsersRound, Vault,
  CalendarClock, Target, GraduationCap, Briefcase,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Power, Tv,
} from 'lucide-react';

const QUICK_LINKS = [
  { key: 'dashboard', label: 'Dashboard', views: ['Executive & Role Hub', 'Live KPI Score Ring', 'Morning Shift Brief'], path: '/dashboard', icon: LayoutDashboard },
  { key: 'operations-centre', label: 'Operations Centre', views: ['1-Click Live Sweeps', '12 Armed Actions', 'Live Audit Trail'], path: '/operations-centre', icon: Sparkles },
  { key: 'rostering', label: 'Roster & Shifts', views: ['SCHADS & Coverage', 'Fatigue Gatekeeper', 'Calendar Sync'], path: '/roster', icon: CalendarClock },
  { key: 'my-profile', label: 'My Profile', views: ['Personal Workspace', 'My Shifts & Goals', 'Staff Name Tags'], path: '/my-profile', icon: UserCircle },
  { key: 'our-staff', label: 'Employee Profiles', views: ['100-Pt Staff Files', 'Screening Alerts', '360° Appraisals'], path: '/our-employees', icon: Users },
  { key: 'compliance', label: 'Compliance Centre', views: ['Audits & Readiness', '356 Checkpoints', 'Express 2-Min Audit'], path: '/compliance', icon: ShieldCheck },
  { key: 'invoicing', label: 'Invoicing Centre', views: ['NDIS Claims & Pay', 'Price Guide Builder', 'Bank Reconciliation'], path: '/invoicing', icon: FileSpreadsheet },
  { key: 'communications', label: 'Communication Centre', views: ['Shift Notes & Inbox', 'AI Compose & Email', '5-Day Complaint SLA'], path: '/communications', icon: Megaphone },
  { key: 'goals', label: 'Goal Progress', views: ['Outcomes & AI Coach', 'Funding Utilisation', 'Goal Progress Slider'], path: '/goals', icon: Target },
  { key: 'training', label: 'Training Centre', views: ['LMS & AI Quizzes', 'AI Course Studio', 'Signed PDF Certs'], path: '/training', icon: GraduationCap },
  { key: 'community-council', label: 'Community Hub', views: ['Programs & Events', 'Postcode Directory', 'Event Flyer Studio'], path: '/community-council', icon: MapPin },
  { key: 'certificates', label: 'Recognition & Certs', views: ['Signed PDF Awards', 'Milestone Badges', 'Renewal Calendar'], path: '/certificates', icon: BadgeCheck },
  { key: 'our-participants', label: 'Participant Profiles', views: ['Plans & Consents', '3-Part Consent Lock', '10-Weekly Reviews'], path: '/our-participants', icon: Heart },
  { key: 'tasks', label: 'Task Dashboard', views: ['Shared To-Do & SLA', 'Digital Sign-Off', '30-Task Batch PDF'], path: '/tasks', icon: ClipboardList },
  { key: 'incidents', label: 'Incident Clinic', views: ['24h / 5d NDIS Timers', 'Root-Cause Review', 'Photo Evidence Log'], path: '/incidents', icon: AlertTriangle },
  { key: 'human-resources', label: 'HR & Volunteers', views: ['Contracts & Reviews', 'Digital E-Signing', 'Volunteer Placements'], path: '/hr', icon: UsersRound },
  { key: 'company-safe', label: 'Company Safe', views: ['Protected Vault', 'Executive Wall View', 'Insurance Register'], path: '/company-safe', icon: Vault },
  { key: 'intake', label: 'Intake Centre', views: ['1-Click Onboarding', 'AI Resume Extract', 'Fast Profile Sync'], path: '/intake', icon: Briefcase },
];

export default function QuickAppBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cycleIdx, setCycleIdx] = useState(0);

  // Rotate the supporting line shown on every channel every 30 seconds
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

  const activeIdx = Math.max(
    0,
    QUICK_LINKS.findIndex((item) => isActive(item.path))
  );
  const currentChannel = QUICK_LINKS[activeIdx] || QUICK_LINKS[0];
  const currentChannelSub = currentChannel.views[cycleIdx % currentChannel.views.length];

  const stepChannel = (delta) => {
    const nextIdx = (activeIdx + delta + QUICK_LINKS.length) % QUICK_LINKS.length;
    const target = QUICK_LINKS[nextIdx];
    if (target) {
      navigate(target.path);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] bg-white px-4 pt-3 sm:px-6 lg:px-8">
      <section
        aria-label="Obsidian Smart Screen Remote"
        className="preserve-island-theme relative overflow-hidden rounded-2xl border p-3 sm:p-3.5 shadow-xl"
        style={{
          background: 'linear-gradient(145deg, #1E293B 0%, #0F172A 60%, #090F1C 100%)',
          borderColor: '#475569',
          color: '#F8FAFC',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.14), 0 10px 26px -6px rgba(15,23,42,0.45)',
        }}
      >
        {/* Brushed Obsidian Metallic Grain */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'repeating-linear-gradient(176deg, transparent 0 3px, rgba(148,163,184,0.22) 4px, transparent 5px 8px)',
          }}
        />

        <div className="relative z-10 space-y-2.5">
          {/* Top OLED Channel Readout Strip */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2"
            style={{
              backgroundColor: '#090F1C',
              borderColor: '#334155',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
                style={{
                  backgroundColor: 'rgba(56,189,248,0.15)',
                  borderColor: 'rgba(56,189,248,0.45)',
                  color: '#38BDF8',
                  boxShadow: '0 0 12px rgba(56,189,248,0.35)',
                }}
              >
                <Tv className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="rounded border px-1.5 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider"
                    style={{
                      backgroundColor: 'rgba(56,189,248,0.16)',
                      borderColor: 'rgba(56,189,248,0.45)',
                      color: '#38BDF8',
                    }}
                  >
                    CH {String(activeIdx + 1).padStart(2, '0')}/{String(QUICK_LINKS.length).padStart(2, '0')}
                  </span>
                  <h2
                    className="text-xs sm:text-sm font-extrabold tracking-tight"
                    style={{ color: '#F8FAFC' }}
                  >
                    {currentChannel.label}
                  </h2>
                  <span
                    className="hidden sm:inline-block text-[11px] font-semibold"
                    style={{ color: '#94A3B8' }}
                  >
                    · {currentChannelSub}
                  </span>
                </div>
                <p
                  className="text-[10px] font-medium leading-tight"
                  style={{ color: '#CBD5E1' }}
                >
                  {QUICK_LINKS.length} live workspace channels · tap any backlit key or use the D-pad rocker
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Previous / Next Channel Stepper Rockers */}
              <div
                className="inline-flex items-center rounded-lg border p-0.5"
                style={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
              >
                <button
                  type="button"
                  onClick={() => stepChannel(-1)}
                  title="Previous workspace channel"
                  className="inline-flex h-6 items-center gap-0.5 rounded-md px-2 text-[10px] font-extrabold transition hover:opacity-90"
                  style={{ color: '#F8FAFC' }}
                >
                  <ChevronUp className="h-3 w-3" style={{ color: '#38BDF8' }} />
                  <span style={{ color: '#F8FAFC' }}>CH-</span>
                </button>
                <span className="h-3.5 w-px" style={{ backgroundColor: '#334155' }} />
                <button
                  type="button"
                  onClick={() => stepChannel(1)}
                  title="Next workspace channel"
                  className="inline-flex h-6 items-center gap-0.5 rounded-md px-2 text-[10px] font-extrabold transition hover:opacity-90"
                  style={{ color: '#F8FAFC' }}
                >
                  <span style={{ color: '#F8FAFC' }}>CH+</span>
                  <ChevronDown className="h-3 w-3" style={{ color: '#38BDF8' }} />
                </button>
              </div>

              {/* Glowing Cyan LIVE Status Pill */}
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider"
                style={{
                  backgroundColor: '#0F172A',
                  borderColor: 'rgba(56,189,248,0.45)',
                  color: '#38BDF8',
                }}
              >
                <span
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ backgroundColor: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }}
                />
                <span style={{ color: '#38BDF8' }}>LIVE</span>
              </span>
            </div>
          </div>

          {/* Main Remote Deck: Left D-Pad Rocker Pod + Right 18-Key Backlit Channel Matrix */}
          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-12 items-stretch">
            {/* Left Pod: Tactile Circular D-Pad Channel Rocker */}
            <div
              className="lg:col-span-2 flex flex-row lg:flex-col items-center justify-between gap-2 rounded-xl border p-2.5"
              style={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.45)',
              }}
            >
              <div
                className="flex lg:w-full items-center justify-between gap-1.5 text-[9.5px] font-extrabold uppercase tracking-wider"
                style={{ color: '#94A3B8' }}
              >
                <span style={{ color: '#94A3B8' }}>REMOTE</span>
                <Power className="h-3 w-3" style={{ color: '#38BDF8' }} />
              </div>

              {/* Circular Tactile D-Pad */}
              <div
                className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2"
                style={{
                  background: 'radial-gradient(circle at 32% 28%, #1E293B 0%, #090F1C 78%)',
                  borderColor: '#475569',
                  boxShadow:
                    'inset 0 2px 6px rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.6)',
                }}
              >
                <button
                  type="button"
                  onClick={() => stepChannel(-6)}
                  aria-label="Up channel row"
                  title="Previous row (-6)"
                  className="absolute top-1 left-1/2 -translate-x-1/2 rounded-full p-1 transition hover:scale-110 active:scale-95"
                >
                  <ChevronUp className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
                </button>
                <button
                  type="button"
                  onClick={() => stepChannel(6)}
                  aria-label="Down channel row"
                  title="Next row (+6)"
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full p-1 transition hover:scale-110 active:scale-95"
                >
                  <ChevronDown className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
                </button>
                <button
                  type="button"
                  onClick={() => stepChannel(-1)}
                  aria-label="Previous channel"
                  title="Previous channel"
                  className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full p-1 transition hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
                </button>
                <button
                  type="button"
                  onClick={() => stepChannel(1)}
                  aria-label="Next channel"
                  title="Next channel"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1 transition hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate(currentChannel.path)}
                  title={`Active: ${currentChannel.label}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border text-[9.5px] font-extrabold uppercase tracking-wider transition hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
                    borderColor: '#BAE6FD',
                    color: '#0F172A',
                    boxShadow: '0 0 12px rgba(56,189,248,0.55)',
                  }}
                >
                  OK
                </button>
              </div>

              <div
                className="text-center font-mono text-[9px] font-extrabold uppercase tracking-wider"
                style={{ color: '#38BDF8' }}
              >
                18 CHANNELS
              </div>
            </div>

            {/* Right Keypad: 3-Row × 6-Column Numbered Backlit Channel Keys */}
            <div className="lg:col-span-10 grid auto-rows-fr grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6 items-stretch">
              {QUICK_LINKS.map((item, idx) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                const currentSub = item.views[cycleIdx % item.views.length];

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={`${item.label} — ${currentSub}`}
                    className="group relative flex h-full min-h-[60px] flex-col justify-between rounded-xl border p-2 text-left transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-none"
                    style={
                      active
                        ? {
                            backgroundColor: '#1E293B',
                            borderColor: '#38BDF8',
                            color: '#F8FAFC',
                            boxShadow:
                              'inset 0 0 12px rgba(56,189,248,0.22), 0 0 12px rgba(56,189,248,0.38)',
                          }
                        : {
                            backgroundColor: '#0F172A',
                            borderColor: '#334155',
                            color: '#E2E8F0',
                          }
                    }
                  >
                    {/* Key Top Row: Backlit Channel Number + Icon + Glowing Cyan LED Dot */}
                    <div className="flex w-full items-center justify-between gap-1">
                      <span
                        className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[9px] font-extrabold tracking-wider leading-none"
                        style={
                          active
                            ? { backgroundColor: '#38BDF8', color: '#0F172A' }
                            : { backgroundColor: '#1E293B', color: '#94A3B8' }
                        }
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      <div className="flex items-center gap-1">
                        <Icon
                          className="h-3 w-3 shrink-0"
                          style={{ color: active ? '#38BDF8' : '#94A3B8' }}
                        />
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={
                            active
                              ? { backgroundColor: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }
                              : { backgroundColor: '#475569' }
                          }
                        />
                      </div>
                    </div>

                    {/* Key Label & Subtitle */}
                    <div className="mt-1 min-w-0">
                      <div
                        className="text-[11px] font-extrabold leading-tight tracking-tight"
                        style={{ color: '#F8FAFC' }}
                      >
                        {item.label}
                      </div>
                      <div
                        className="mt-0.5 truncate text-[9.5px] font-medium leading-tight"
                        style={{ color: active ? '#BAE6FD' : '#94A3B8' }}
                      >
                        {currentSub}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}