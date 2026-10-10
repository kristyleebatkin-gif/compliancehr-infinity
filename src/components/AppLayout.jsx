import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Users, ShieldCheck, GraduationCap, FolderOpen,
  ClipboardList, Github, Menu, LogOut, X, Building2, AlertTriangle,
  Heart, ShieldAlert, CalendarClock, Megaphone,
  Boxes, FileSpreadsheet, Siren, PartyPopper, CalendarDays,
  ClipboardCheck, UserPlus, Target, TrendingUp, BarChart3, Phone,
  HeartHandshake, CalendarRange,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Participants', path: '/participants', icon: Heart },
  { label: 'Staff', path: '/staff', icon: Users },
  { label: 'Compliance', path: '/compliance', icon: ShieldCheck },
  { label: 'Documents', path: '/documents', icon: FolderOpen },
  { label: 'Training', path: '/training', icon: GraduationCap },
  { label: 'Tasks', path: '/tasks', icon: ClipboardList },
  { label: 'Incidents', path: '/incidents', icon: AlertTriangle },
  { label: 'Risks', path: '/risks', icon: ShieldAlert },
  { label: 'Shifts', path: '/shifts', icon: CalendarClock },
  { label: 'Feedback & Complaints', path: '/feedback', icon: Megaphone },
  { label: 'Checklists', path: '/checklists', icon: ClipboardList },
  { label: 'Asset Management', path: '/assets', icon: Boxes },
  { label: 'Invoicing Centre', path: '/invoicing', icon: FileSpreadsheet },
  { label: 'Meeting Centre', path: '/meetings', icon: CalendarDays },
  { label: 'Emergency Response', path: '/emergency-response', icon: Siren },
  { label: 'Programs & Events', path: '/programs', icon: PartyPopper },
  { label: 'Communication Centre', path: '/communications', icon: Megaphone },
  { label: 'Audit Centre', path: '/audit', icon: ClipboardCheck },
  { label: 'Intake & Referrals', path: '/intake', icon: UserPlus },
  { label: 'Goal Progress', path: '/goals', icon: Target },
  { label: 'Quality & Improvement', path: '/quality', icon: TrendingUp },
  { label: 'Surveys', path: '/surveys', icon: BarChart3 },
  { label: 'Key Contacts', path: '/contacts', icon: Phone },
  { label: 'Volunteers', path: '/volunteers', icon: HeartHandshake },
  { label: 'Rostering', path: '/roster', icon: CalendarRange },
  { label: 'GitHub Activity', path: '/github', icon: Github },
];

export default function AppLayout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-4">
        <div className="rounded-lg bg-primary p-2">
          <Building2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold leading-tight">ComplianceHR</p>
          <p className="text-xs text-muted-foreground">Compliance Portal</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.full_name || 'User'}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email || ''}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => { await base44.auth.logout(); }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
        <SidebarContent />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b p-3 lg:hidden">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 hover:bg-muted">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <p className="font-bold">ComplianceHR</p>
          <div className="w-9" />
        </header>
        {mobileOpen && (
          <div className="border-b bg-background lg:hidden">
            <SidebarContent />
          </div>
        )}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}