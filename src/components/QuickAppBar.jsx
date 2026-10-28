import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Users, CalendarClock, ShieldCheck,
  ShieldAlert, FolderOpen, Megaphone, BarChart3, Cpu, Settings, Heart,
  Zap, ArrowRight, ChevronDown, ChevronUp,
} from 'lucide-react';
import { getHeaderView } from '@/lib/fullColourTiles';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 42%, #A100FF 68%, #FF2E9A 100%)';

// Master Specification: 11 Primary Navigation Pillars + Participant 360° Quick Screen (12 Clean Tiles)
const QUICK_LINKS = [
  { key: 'dashboard', label: '1. Home Command', views: ['Organisation Health (9 Pillars)', '30-Second Manager Answers', 'Organisational Digital Twin'], path: '/dashboard', icon: LayoutDashboard },
  { key: 'my-work', label: '2. My Work', views: ['Tasks, Shifts & Approvals', 'Frontline Finish My Shift', 'Personal 360° Workspace'], path: '/my-profile', icon: ClipboardList },
  { key: 'our-staff', label: '3. People (Staff 360°)', views: ['Employee 360° Profiles', '100-Pt Screening & Matrix', 'HR, Leave & Appraisals'], path: '/our-employees', icon: Users },
  { key: 'our-participants', label: 'Participant 360°', views: ['Participant 360° Profiles', '3-Part Consents & Plans', 'Goals & 10-Weekly Reviews'], path: '/our-participants', icon: Heart },
  { key: 'rostering', label: '4. Operations', views: ['Rostering & Shift Gatekeeper', 'Assets, Fleet & Programs', 'Supplier 360° & Continuity'], path: '/rostering', icon: CalendarClock },
  { key: 'compliance', label: '5. Compliance & Quality', views: ['NDIS & Aged Care Standards', '356 Audit Checkpoints', 'Continuous Improvement'], path: '/compliance', icon: ShieldCheck },
  { key: 'risks', label: '6. Risks & Incidents', views: ['Risk 360° & 5×5 Matrix', 'Incident 360° (24h/5d SLA)', 'Hazards, WHS & Complaints'], path: '/risks', icon: ShieldAlert },
  { key: 'documents', label: '7. Documents & Evidence', views: ['Document 360° & Vault', 'Company Safe Master Copies', 'Controlled Form Generator'], path: '/documents', icon: FolderOpen },
  { key: 'communications', label: '8. Communications', views: ['Emails, Notes, Calls & SMS', 'Meetings & Minutes', 'Surveys & Announcements'], path: '/communications', icon: Megaphone },
  { key: 'analytics', label: '9. Reports & Analytics', views: ['13 Enterprise Report Suites', 'Heatmaps, KPIs & Forecasts', 'NDIS Claims & Invoicing'], path: '/analytics', icon: BarChart3 },
  { key: 'operations-centre', label: '10. Executive Centre', views: ['Board & CEO Readiness', 'Strategic Risks & Actions', '6 Specialist AI Copilots'], path: '/operations-centre', icon: Cpu },
  { key: 'users', label: '11. Administration', views: ['Role-Based Security & RLS', 'Multi-Site & Delegations', 'Data Quality & Audit Logs'], path: '/users', icon: Settings },
];

export default function QuickAppBar() {
  const location = useLocation();
  const [cycleIdx, setCycleIdx] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

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
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="h-1 w-full" style={{ background: BRAND_GRADIENT }} />

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3.5 pb-1.5 pt-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs"
              style={{ background: BRAND_GRADIENT }}
            >
              <Zap className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-extrabold leading-tight text-[#0A2B6D]">
                Primary Operating System Navigation (11 Core Pillars)
              </h2>
              <p className="text-[11px] font-semibold leading-tight text-slate-600">
                People → Work → Compliance → Evidence → Intelligence · Maximum 2 clicks to any 360° record
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00C6FF]" />
              Live OS
            </span>
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-extrabold text-[#0A2B6D] hover:border-[#0072FF]"
            >
              {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              <span>{collapsed ? 'Show OS Bar' : 'Compact'}</span>
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="grid auto-rows-fr grid-cols-2 gap-2 p-3 pt-1.5 sm:grid-cols-3 lg:grid-cols-6 items-stretch">
            {QUICK_LINKS.map((item, idx) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              const currentSub = item.views[cycleIdx % item.views.length];
              const headerBg = getHeaderView(idx);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={`${item.label} — ${currentSub}`}
                  className={`group flex h-full min-h-[86px] flex-col gap-[3px] rounded-xl border-2 bg-[#0A2B6D] p-[3px] transition-all duration-200 focus-visible:outline-none ${
                    active
                      ? 'border-[#5A00D6] shadow-md ring-2 ring-[#5A00D6]/25 ring-offset-1'
                      : 'border-[#0A2B6D] hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
                    <div
                      className="flex min-h-[34px] items-center justify-between gap-1 px-1.5 py-1 text-white"
                      style={{ background: headerBg }}
                    >
                      <div className="flex min-w-0 items-center gap-1">
                        <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                        <span
                          className="min-w-0 text-[9.5px] font-extrabold leading-[11px] tracking-tight text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          active ? 'bg-[#00C6FF]' : 'bg-white/75'
                        }`}
                      />
                    </div>

                    <div className="flex min-h-[36px] flex-1 items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-1.5 py-1">
                      <span className="min-w-0 flex-1 break-words text-[10px] font-bold leading-[12px] text-[#0A2B6D]/85">
                        {currentSub}
                      </span>
                      <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5 group-hover:text-[#FF2E9A]" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}