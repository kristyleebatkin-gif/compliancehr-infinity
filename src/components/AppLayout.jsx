import '@/components/dashboard/dashboardWorkspace.css';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { canAccessNav, ROLES } from '@/lib/roles';
import ModuleGuide from '@/components/ModuleGuide';
import AuditorOnlyLayout from '@/components/AuditorOnlyLayout';
import ModuleDocsFooter from '@/components/ModuleDocsFooter';
import { MODULE_DIRECTORY as PRIMARY_NAV } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import {
  Bell, LogOut, Menu, X, ChevronDown, MoreHorizontal, ShieldQuestion, Sparkles,
  LayoutDashboard, Users, Heart, GraduationCap, ShieldCheck,
  User, Building2, Layers,
} from 'lucide-react';
import GlobalSearch from '@/components/GlobalSearch';
import AutoRegisterInsights from '@/components/AutoRegisterInsights';
import QuickAppBar from '@/components/QuickAppBar';
import ObsidianSidebarRemote from '@/components/ObsidianSidebarRemote';
import EnterpriseWorkspaceBar from '@/components/enterprise/EnterpriseWorkspaceBar';
import VisualDesignModuleCommandStandard from '@/components/enterprise/VisualDesignModuleCommandStandard';
import { Image } from '@/components/ui/image';
import ErrorBoundary from '@/components/ErrorBoundary';
import PendingApprovalNotice from '@/components/users/PendingApprovalNotice';

const BOTTOM_NAV = [
  { label: 'Home', path: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { label: 'Participants', path: '/our-participants', key: 'our-participants', icon: Heart },
  { label: 'Employees', path: '/our-employees', key: 'our-staff', icon: Users },
  { label: 'Training', path: '/training', key: 'training', icon: GraduationCap },
  { label: 'Compliance', path: '/compliance', key: 'compliance', icon: ShieldCheck },
];

const WORKSPACE_VIEWS = [
  { id: 'both', label: 'Both Views', Icon: Layers },
  { id: 'office', label: 'Office View', Icon: Building2 },
  { id: 'profiles', label: 'View Profiles', Icon: Users },
];

export default function AppLayout() {
  const location = useLocation();
  const { role, user } = useRole();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ch-theme') === 'dark');
  const [workspaceView, setWorkspaceView] = useState(() => localStorage.getItem('chr-workspace-view-mode') || 'office');

  useEffect(() => {
    const onModeChange = (e) => {
      if (e?.detail?.mode) setWorkspaceView(e.detail.mode);
    };
    window.addEventListener('chr-view-mode-change', onModeChange);
    return () => window.removeEventListener('chr-view-mode-change', onModeChange);
  }, []);

  const switchWorkspaceView = (mode) => {
    setWorkspaceView(mode);
    localStorage.setItem('chr-workspace-view-mode', mode);
    window.dispatchEvent(new CustomEvent('chr-view-mode-change', { detail: { mode } }));
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('ch-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  const accountStatus = user?.account_status || (role === 'Pending Approval' ? 'Pending Approval' : 'Active');

  const visiblePrimary = PRIMARY_NAV.filter((item) => canAccessNav(role, item.key));
  const visibleNav = visiblePrimary;
  const visibleBottom = BOTTOM_NAV.filter((item) => canAccessNav(role, item.key));

  useEffect(() => {
    if (!user?.id || accountStatus !== 'Active') return;
    const loadNotifications = () => {
      base44.entities.Notification.filter({ recipient_id: user.id }, { sort: '-created_date', limit: 10 })
        .then((page) => setNotifications(page.items || []))
        .catch((error) => console.error(error));
    };
    loadNotifications();
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === 'create' && event.data?.recipient_id === user.id) {
        setNotifications((prev) => [event.data, ...prev].slice(0, 10));
      } else {
        loadNotifications();
      }
    });
    return unsubscribe;
  }, [accountStatus, user?.id]);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
    setUserMenuOpen(false);
    setNotifOpen(false);
    if (user?.id && accountStatus === 'Active' && role !== 'Archived') {
      base44.functions.invoke('logUserAction', {
        action: 'View',
        entity_type: 'App Page',
        record_title: location.pathname,
        route: location.pathname,
        details: 'Page viewed',
      }).catch((error) => console.error(error));
    }
  }, [accountStatus, location.pathname, location.search, role, user?.id]);

  useEffect(() => {
    const closeMenus = (event) => {
      if (event.key === 'Escape') {
        setNotifOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', closeMenus);
    return () => window.removeEventListener('keydown', closeMenus);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const markAllRead = async () => {
    const unreadList = notifications.filter((n) => !n.read);
    if (unreadList.length) {
      await base44.entities.Notification.updateMany(
        { id: { $in: unreadList.map((notification) => notification.id) } },
        { $set: { read: true } }
      );
    }
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast({ title: 'All notifications marked as read' });
  };

  const isActive = (path) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const navLabel = (item) => (item.key === 'my-profile' ? (role === ROLES.PARTICIPANT ? 'My participant profile' : 'My employee profile') : item.label);
  const activeNavItem = PRIMARY_NAV.find((i) => isActive(i.path));
  const currentLabel = activeNavItem ? navLabel(activeNavItem) : 'Dashboard';
  const currentModuleColour = moduleKeyColour(activeNavItem?.key || 'dashboard');
  const initials = (user?.full_name || 'CH')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'CH';

  const sidebarContent = (
    <ObsidianSidebarRemote
      visiblePrimary={visiblePrimary}
      role={role}
      user={user}
      isActive={isActive}
      navLabel={navLabel}
      currentLabel={currentLabel}
      onLogout={handleLogout}
    />
  );

  if (role === ROLES.AUDITOR) return <AuditorOnlyLayout />;
  if (role === ROLES.TEAM_LEADER && location.pathname === '/my-payroll') return <Navigate to="/dashboard" replace />;

  if (role === 'Archived') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldQuestion className="mx-auto h-10 w-10 text-rose-600" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Account access archived</h1>
          <p className="mt-2 text-sm text-slate-600">This account no longer has access to ComplianceHR. Contact a Provider Administrator if access should be restored.</p>
          <button onClick={handleLogout} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Sign out</button>
        </div>
      </div>
    );
  }

  if (accountStatus === 'Pending Approval' || role === 'Pending Approval') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldQuestion className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Awaiting administrator approval</h1>
          <p className="mt-2 text-sm text-slate-600">Your request for {user?.requested_role || 'ComplianceHR'} access has been sent. You cannot open app records until a Provider Administrator approves the account.</p>
          <button onClick={handleLogout} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Sign out</button>
        </div>
      </div>
    );
  }

  if (accountStatus === 'Rejected') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldQuestion className="mx-auto h-10 w-10 text-rose-600" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Account request not approved</h1>
          <p className="mt-2 text-sm text-slate-600">A Provider Administrator rejected this access request. Contact your organisation administrator if you believe access is required.</p>
          <button onClick={handleLogout} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-readable flex h-dvh overflow-hidden bg-slate-50 text-slate-900">
      <a
        href="#main-workspace-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>
      <aside className="hidden w-64 shrink-0 overflow-hidden border-r border-slate-200 bg-white md:flex">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 shrink-0 border-b border-slate-200 bg-white/95 shadow-2xs backdrop-blur-md">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2.5 px-3 py-2.5 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="shrink-0 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 shadow-2xs transition hover:border-indigo-300 md:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>

              <Link
                to="/dashboard"
                className="flex shrink-0 items-center gap-2.5 text-left transition hover:opacity-95"
              >
                <Image
                  src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
                  alt="ComplianceHR Infinity"
                  fittingType="fit"
                  className="h-8 w-8 shrink-0 rounded-lg border border-slate-200 bg-white p-1 shadow-2xs"
                />
                <div>
                  <div className="text-sm sm:text-base font-extrabold leading-none tracking-tight text-slate-900 whitespace-nowrap">
                    Compliance<span className="text-indigo-600">HR Infinity</span>
                  </div>
                  <div className="mt-0.5 text-[10px] font-medium leading-none text-slate-500 whitespace-nowrap">
                    Complete Control. Greater Confidence. Brighter Success.
                  </div>
                </div>
              </Link>

              <span className="hidden min-h-[28px] items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 md:inline-flex">
                <Sparkles className="h-3 w-3 shrink-0 text-indigo-600" />
                <span className="whitespace-nowrap">{currentLabel}</span>
              </span>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <div className="block">
                <GlobalSearch />
              </div>

              {/* Workspace view selector */}
              <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 md:flex">
                {WORKSPACE_VIEWS.map(({ id, label, Icon }) => {
                  const selected = workspaceView === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => switchWorkspaceView(id)}
                      aria-pressed={selected}
                      title={label}
                      className={`inline-flex min-h-[26px] items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                        selected ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-700 hover:text-indigo-600'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${selected ? 'text-white' : 'text-indigo-600'}`} />
                      <span className="hidden whitespace-nowrap lg:inline">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setUserMenuOpen(false);
                  }}
                  aria-label="Notifications"
                  className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs transition hover:border-indigo-300 hover:text-indigo-600"
                >
                  <Bell className="h-4 w-4" />
                  {unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                    <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-900">Notifications</span>
                      {unread > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 space-y-1.5 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="py-4 text-center text-xs text-slate-500">All caught up — no notifications.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`rounded-xl border p-2.5 text-xs ${
                              n.read ? 'border-slate-100 bg-white' : 'border-indigo-200 bg-indigo-50/50 font-semibold'
                            }`}
                          >
                            <div className="font-bold text-slate-900">{n.title || 'Update'}</div>
                            {n.message && <div className="mt-0.5 text-slate-600">{n.message}</div>}
                          </div>
                        ))
                      )}
                    </div>
                    <Link
                      to="/notifications"
                      className="mt-2 block rounded-lg bg-slate-50 py-1.5 text-center text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* User Avatar & Quick Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen((v) => !v);
                    setNotifOpen(false);
                  }}
                  aria-label="User menu"
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-indigo-700"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20">{initials}</span>
                  <span className="hidden max-w-[130px] truncate text-xs font-semibold xl:inline">
                    {user?.full_name || 'My account'}
                  </span>
                  <ChevronDown className="hidden h-3 w-3 shrink-0 xl:block" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl space-y-2">
                    <div className="border-b border-slate-100 pb-2">
                      <div className="truncate text-xs font-bold text-slate-900">{user?.full_name || 'ComplianceHR User'}</div>
                      <div className="truncate text-[11px] text-slate-500">{user?.email || role}</div>
                      <span className="mt-1 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                        {role}
                      </span>
                    </div>
                    <Link
                      to="/my-profile"
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <User className="h-3.5 w-3.5 text-indigo-600" />
                      My Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile band: current module and view switch */}
          <div className="flex items-center gap-2 border-t border-slate-100 px-3 pb-2 pt-1.5 md:hidden">
            <span className="inline-flex min-h-[24px] min-w-0 flex-1 items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
              <Sparkles className="h-3 w-3 shrink-0 text-indigo-600" />
              <span className="truncate">{currentLabel}</span>
            </span>
            <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {WORKSPACE_VIEWS.map(({ id, label, Icon }) => {
                const selected = workspaceView === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => switchWorkspaceView(id)}
                    aria-pressed={selected}
                    aria-label={label}
                    title={label}
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-md transition ${
                      selected ? 'bg-indigo-600 text-white' : 'text-slate-700'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${selected ? 'text-white' : 'text-indigo-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <main id="main-workspace-content" className="relative z-0 flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 pb-20 md:pb-0">
          <EnterpriseWorkspaceBar
            currentLabel={currentLabel}
            role={role}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((d) => !d)}
          />
          <QuickAppBar />
          <VisualDesignModuleCommandStandard />
          <div className={location.pathname === '/staff' || location.pathname.startsWith('/staff/') ? 'mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8' : 'mx-auto max-w-[1440px] px-4 pt-3 sm:px-6 lg:px-8'}>
            <PendingApprovalNotice />
            <ModuleGuide />
          </div>
          <AutoRegisterInsights />
          <div className="app-dashboard-canvas mx-auto w-full max-w-[1440px] min-w-0 px-4 py-3 sm:px-6 lg:px-8" style={{ '--module-colour': currentModuleColour }}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
          {location.pathname !== '/our-employees' && <ModuleDocsFooter />}
        </main>

        {/* Bottom nav (mobile) */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white px-1 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden">
          {visibleBottom.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors ${
                  active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate">{navLabel(item)}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-semibold text-slate-600"
          >
            <MoreHorizontal className="h-5 w-5" />
            More
          </button>
        </nav>

        {moreOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMoreOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white p-4 pb-8">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-base font-bold text-slate-900">All Modules</div>
                <button onClick={() => setMoreOpen(false)} className="rounded-lg p-1 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {visibleNav
                  .filter((i) => !BOTTOM_NAV.some((b) => b.path === i.path))
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-3 text-center text-xs font-semibold text-slate-800 shadow-2xs transition hover:border-indigo-300 hover:text-indigo-600"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="break-words leading-snug">{navLabel(item)}</span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}