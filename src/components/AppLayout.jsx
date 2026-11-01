import '@/components/dashboard/dashboardWorkspace.css';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { canAccessNav, ROLES } from '@/lib/roles';
import ModuleGuide from '@/components/ModuleGuide';
import { Navigate } from 'react-router-dom';
import AuditorOnlyLayout from '@/components/AuditorOnlyLayout';
import ModuleDocsFooter from '@/components/ModuleDocsFooter';
import { MODULE_DIRECTORY as PRIMARY_NAV, NAV_GROUPS } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import { getTilePalette, getHeaderView, getSymbolView } from '@/lib/fullColourTiles';
import {
  Bell, LogOut, Menu, X, ChevronDown, MoreHorizontal, ShieldQuestion, Siren, Sparkles, LifeBuoy,
  LayoutDashboard, Users, Heart, GraduationCap, ShieldCheck, PartyPopper,
  Search, Sun, Moon, User, Wallet, Building2, Layers,
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
  const { role, user, isAdmin } = useRole();
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
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-2xl border border-danger/20 bg-card p-8 text-center shadow-sm">
          <ShieldQuestion className="mx-auto h-10 w-10 text-danger" />
          <h1 className="mt-4 text-xl font-bold font-display">Account access archived</h1>
          <p className="mt-2 text-sm text-foreground/60">This account no longer has access to ComplianceHR. Contact a Provider Administrator if access should be restored.</p>
          <button onClick={handleLogout} className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Sign out</button>
        </div>
      </div>
    );
  }

  if (accountStatus === 'Pending Approval' || role === 'Pending Approval') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-2xl border border-warning/30 bg-card p-8 text-center shadow-sm">
          <ShieldQuestion className="mx-auto h-10 w-10 text-warning" />
          <h1 className="mt-4 text-xl font-bold font-display">Awaiting administrator approval</h1>
          <p className="mt-2 text-sm text-foreground/60">Your request for {user?.requested_role || 'ComplianceHR'} access has been sent. You cannot open app records until a Provider Administrator approves the account.</p>
          <button onClick={handleLogout} className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Sign out</button>
        </div>
      </div>
    );
  }

  if (accountStatus === 'Rejected') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-2xl border border-danger/20 bg-card p-8 text-center shadow-sm">
          <ShieldQuestion className="mx-auto h-10 w-10 text-danger" />
          <h1 className="mt-4 text-xl font-bold font-display">Account request not approved</h1>
          <p className="mt-2 text-sm text-foreground/60">A Provider Administrator rejected this access request. Contact your organisation administrator if you believe access is required.</p>
          <button onClick={handleLogout} className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-readable flex h-dvh overflow-hidden bg-background text-foreground">
      <a
        href="#main-workspace-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-[#0A2B6D] focus:px-4 focus:py-2 focus:text-xs focus:font-extrabold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>
      <aside className="hidden w-64 shrink-0 overflow-hidden border-r-4 border-[#0A2B6D] bg-white md:flex">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-sidebar shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 shrink-0 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
          <div
            className="h-1 w-full"
            style={{
              background:
                'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 42%, #A100FF 68%, #FF2E9A 100%)',
            }}
          />
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2.5 px-3 py-2 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="shrink-0 rounded-lg border border-slate-200 bg-white p-1.5 text-[#0A2B6D] shadow-2xs transition hover:border-[#0072FF]/50 md:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>

              <Link
                to="/dashboard"
                className="flex shrink-0 flex-col items-center rounded-xl border border-slate-200/90 bg-[#F5F0FF]/50 px-3 py-1 text-center shadow-2xs transition hover:border-[#0072FF]/50"
              >
                <span className="font-editorial text-[13px] font-extrabold leading-none tracking-tight text-[#0A2B6D] sm:text-[15px] whitespace-nowrap">
                  Compliance
                  <span className="font-editorial-italic text-[#5A00D6]">HR</span>{' '}
                  <span className="bg-gradient-to-r from-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                    Infinity
                  </span>
                </span>
                <Image
                  src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
                  alt="ComplianceHR Infinity"
                  fittingType="fit"
                  className="mt-1 h-5 w-14 shrink-0 rounded-md border border-slate-200 bg-white px-1 py-0.5 shadow-2xs"
                />
                <span className="mt-1 text-[8.5px] font-extrabold leading-none whitespace-nowrap">
                  <span style={{ color: '#0072FF' }}>Complete Control.</span>{' '}
                  <span style={{ color: '#5A00D6' }}>Greater Confidence.</span>{' '}
                  <span style={{ color: '#FF2E9A' }}>Brighter Success.</span>
                </span>
              </Link>

              <span
                className="hidden min-h-[28px] items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3 py-1 text-[10.5px] font-extrabold text-white shadow-2xs md:inline-flex"
                style={{ background: getHeaderView(1) }}
              >
                <Sparkles className="h-3 w-3 shrink-0" style={{ color: '#00C6FF' }} />
                <span className="whitespace-nowrap">{currentLabel}</span>
              </span>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <div className="block">
                <GlobalSearch />
              </div>

              {/* Workspace view selector */}
              <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs md:flex">
                {WORKSPACE_VIEWS.map(({ id, label, Icon }) => {
                  const selected = workspaceView === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => switchWorkspaceView(id)}
                      aria-pressed={selected}
                      title={label}
                      className={`inline-flex min-h-[26px] items-center gap-1 rounded-lg px-2 py-1 text-[10.5px] font-extrabold transition-all ${
                        selected ? 'bg-[#0A2B6D] text-white shadow-sm' : 'text-[#0A2B6D] hover:text-[#0072FF]'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${selected ? 'text-white' : 'text-[#5A00D6]'}`} />
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
                  className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#0A2B6D] shadow-2xs transition hover:border-[#0072FF]/50 hover:text-[#0072FF]"
                >
                  <Bell className="h-4 w-4" />
                  {unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF2E9A] px-1 text-[10px] font-black text-white">
                      {unread}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                    <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-extrabold text-[#0A2B6D]">Notifications</span>
                      {unread > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="text-xs font-bold text-[#FF2E9A] hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 space-y-1.5 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="py-4 text-center text-xs text-muted-foreground">All caught up — no notifications.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`rounded-xl border p-2.5 text-xs ${
                              n.read ? 'border-slate-100 bg-white' : 'border-[#FF2E9A]/30 bg-[#FF2E9A]/5 font-semibold'
                            }`}
                          >
                            <div className="font-bold text-[#0A2B6D]">{n.title || 'Update'}</div>
                            {n.message && <div className="mt-0.5 text-muted-foreground">{n.message}</div>}
                          </div>
                        ))
                      )}
                    </div>
                    <Link
                      to="/notifications"
                      className="mt-2 block rounded-lg bg-[#F5F0FF] py-1.5 text-center text-xs font-bold text-[#5A00D6] hover:bg-[#5A00D6]/10"
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
                  className="flex h-8 items-center gap-1.5 rounded-lg gradient-brand px-1.5 text-xs font-black text-white shadow-sm sm:px-2"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20">{initials}</span>
                  <span className="hidden max-w-[130px] truncate text-[10.5px] font-extrabold xl:inline">
                    {user?.full_name || 'My account'}
                  </span>
                  <ChevronDown className="hidden h-3 w-3 shrink-0 xl:block" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl space-y-2">
                    <div className="border-b border-slate-100 pb-2">
                      <div className="truncate text-xs font-extrabold text-[#0A2B6D]">{user?.full_name || 'ComplianceHR User'}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{user?.email || role}</div>
                      <span className="mt-1 inline-block rounded-full bg-[#F5F0FF] px-2 py-0.5 text-[10px] font-bold text-[#5A00D6]">
                        {role}
                      </span>
                    </div>
                    <Link
                      to="/my-profile"
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D] hover:bg-[#F5F0FF]"
                    >
                      <User className="h-3.5 w-3.5 text-[#5A00D6]" />
                      My Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#FF2E9A] hover:bg-[#FF2E9A]/5"
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
            <span
              className="inline-flex min-h-[24px] min-w-0 flex-1 items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-2.5 py-0.5 text-[10px] font-extrabold text-white"
              style={{ background: getHeaderView(1) }}
            >
              <Sparkles className="h-3 w-3 shrink-0" style={{ color: '#00C6FF' }} />
              <span className="truncate">{currentLabel}</span>
            </span>
            <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
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
                      selected ? 'bg-[#0A2B6D] text-white' : 'text-[#0A2B6D]'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${selected ? 'text-white' : 'text-[#5A00D6]'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <main id="main-workspace-content" className="relative z-0 flex-1 overflow-y-auto overflow-x-hidden bg-background pb-20 md:pb-0">
          <EnterpriseWorkspaceBar
            currentLabel={currentLabel}
            role={role}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((d) => !d)}
          />
          <QuickAppBar />
          <VisualDesignModuleCommandStandard />
<<<<<<< ours
          <div className={location.pathname === '/staff' || location.pathname.startsWith('/staff/') ? 'mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8' : 'mx-auto max-w-[1440px] px-4 pt-3 sm:px-6 lg:px-8'}>
=======
          <div className={location.pathname === '/staff' || location.pathname.startsWith('/staff/') ? 'mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8' : 'mx-auto max-w-[1440px] px-4 pt-3 sm:px-6 lg:px-8 md:pt-4'}>
>>>>>>> theirs
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
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border/60 bg-background px-1 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden">
          {visibleBottom.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const modColor = moduleKeyColour(item.key);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition-colors ${
                  active ? 'shadow-sm' : 'text-foreground/75'
                }`}
                style={{
                  color: active ? modColor : undefined,
                  background: active ? `${modColor}18` : undefined,
                }}
              >
                <Icon className="h-5 w-5" style={{ color: modColor }} />
                <span className="max-w-full truncate">{navLabel(item)}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-bold text-violet-700"
          >
            <MoreHorizontal className="h-5 w-5" />
            More
          </button>
        </nav>

        {moreOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-foreground/40" onClick={() => setMoreOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-background p-4 pb-8">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-base font-extrabold text-violet-900">All Modules</div>
                <button onClick={() => setMoreOpen(false)} className="rounded-lg p-1 hover:bg-brand/5">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {visibleNav
                  .filter((i) => !BOTTOM_NAV.some((b) => b.path === i.path))
                  .map((item) => {
                    const Icon = item.icon;
                    const modColor = moduleKeyColour(item.key);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-3 text-center text-xs font-extrabold text-[#0A2B6D] shadow-2xs transition hover:-translate-y-0.5 hover:border-[#0072FF]/40 hover:shadow-md"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-2xs" style={{ background: modColor }}>
                          <Icon className="h-4 w-4 text-white" style={{ color: '#FFFFFF' }} />
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