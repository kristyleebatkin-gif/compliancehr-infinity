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

// Permanent 13-Group Quick Access Architecture
const QUICK_LINKS = [
  { key: 'dashboard', label: '1. Dashboard & Executive', views: ['Dashboard & Operations Centre', 'Business Analytics & Reports', 'Suggestions Hub & AI Assistant'], path: '/dashboard', icon: LayoutDashboard },
  { key: 'our-staff', label: '2. People, Intake & Profiles', views: ['My Profile & Intake Centre', 'Employee & Participant Profiles', 'Visual Boards, Contacts & Users'], path: '/our-employees', icon: Users },
  { key: 'communications', label: '3. Comms & Workforce', views: ['Communication Centre & Rostering', 'Goals, Tasks & Meetings', 'Programs & Events'], path: '/communications', icon: Megaphone },
  { key: 'incidents', label: '4. Incidents, Risk & Safety', views: ['Incident Clinic & Analytics', 'Risk Reporting & Hazards', 'Emergency Response & MSDS'], path: '/incidents', icon: ShieldAlert },
  { key: 'compliance', label: '5. Compliance & Evidence', views: ['Compliance Centre & Auditor Portal', 'Document Vault & Company Safe', 'Quality, CAPA & Feedback'], path: '/compliance', icon: ShieldCheck },
  { key: 'training', label: '6. Training & Capability', views: ['Training Centre & Learning Academy', 'Competency & Skills Matrix', 'Certificates & Pathways'], path: '/training', icon: ClipboardList },
  { key: 'invoicing', label: '7. Finance & Commercial', views: ['Invoicing & Quote Centre', 'Receipt Hub & Procurement', 'Asset & Funding Management'], path: '/invoicing', icon: BarChart3 },
  { key: 'human-resources', label: '8. Human Resources', views: ['HR Hub & Contracts', 'Performance Reviews & Leave', 'Onboarding & Recognition'], path: '/hr', icon: Users },
  { key: 'crm', label: '9. CRM & Relationships', views: ['CRM & Leads Pipeline', 'Referrals & Support Coordinators', 'Provider Relationships'], path: '/crm', icon: Heart },
  { key: 'projects', label: '10. Governance & Strategy', views: ['Projects & Governance Hub', 'Board Packs & Strategic Planning', 'Corporate Reporting & KPIs'], path: '/projects', icon: Cpu },
  { key: 'ndis-provider', label: '11. NDIS & Regulatory', views: ['NDIS Provider Portal', 'NDIS Updates & News', 'Practice Standards & Readiness'], path: '/ndis-portal', icon: ShieldCheck },
  { key: 'community-council', label: '12. Community & Support', views: ['Community Council Hub', 'Accessibility Services', 'Community Networks'], path: '/community-council', icon: FolderOpen },
  { key: 'help', label: '13. Help, Knowledge & Support', views: ['Help Centre & Support Desk', 'User Guides & Knowledge Base', 'System Documentation'], path: '/help', icon: Settings },
];

export default function QuickAppBar() {
  const location = useLocation();
  const [cycleIdx, setCycleIdx] = useState(0);
  const [collapsed, setCollapsed] = useState(() => location.pathname !== '/dashboard');

  useEffect(() => {
    setCollapsed(location.pathname !== '/dashboard');
  }, [location.pathname]);

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
                Organisational Operating System Navigation (13 Permanent Categories)
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