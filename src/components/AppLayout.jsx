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
  Search, Sun, Moon, User, Wallet, Building2,
} from 'lucide-react';
import ExecutiveWallScene, { SQUISHED_GRADIENT } from '@/components/safe/ExecutiveWallScene';
import GlobalSearch from '@/components/GlobalSearch';
import AutoRegisterInsights from '@/components/AutoRegisterInsights';
import QuickAppBar from '@/components/QuickAppBar';
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
    <div className="flex h-full w-full min-w-0 min-h-0 flex-col overflow-hidden bg-white p-2 space-y-2">
      <div
        className="shrink-0 rounded-2xl p-[8px] shadow-md"
        style={{
          background:
            'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
        }}
      >
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 text-center space-y-1">
          <div className="font-editorial text-base font-extrabold tracking-tight text-[#0A2B6D]">
            Compliance
            <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              HR
            </span>{' '}
            <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
              Infinity
            </span>
          </div>
          <div className="text-[9.5px] font-extrabold leading-tight">
            <span className="text-[#0072FF]">Complete Control.</span>{' '}
            <span className="text-[#5A00D6]">Greater Confidence.</span>{' '}
            <span className="text-[#FF2E9A]">Brighter Success.</span>
          </div>
          <span
            className="mt-1 inline-flex items-center justify-center rounded-full border-2 border-[#0A2B6D] px-3 py-0.5 text-[10px] font-extrabold text-white shadow-2xs"
            style={{
              background:
                'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)',
            }}
          >
            {role}
          </span>
        </div>
      </div>

      <nav aria-label="App modules" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 py-1 space-y-3">
        {NAV_GROUPS.map((group, gIdx) => {
          const items = visiblePrimary.filter((item) => group.keys.includes(item.key) && !(item.key === 'staff-progress' && visiblePrimary.some((entry) => entry.key === 'staff')));
          if (!items.length) return null;
          return (
            <div key={group.label} className="space-y-1.5">
              <div
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white"
                style={{ background: getHeaderView(gIdx) }}
              >
                {group.label}
              </div>
              <div className="space-y-1.5">
                {items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const tile = getTilePalette(gIdx * 3 + iIdx);
                  const sym = getSymbolView(gIdx * 3 + iIdx);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group relative flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-3 py-1.5 text-xs font-extrabold shadow-2xs transition-all hover:-translate-y-0.5 ${
                        active ? 'ring-2 ring-[#0A2B6D]' : ''
                      }`}
                      style={{ backgroundColor: tile.bg, color: tile.text }}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white shadow-2xs">
                        <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                      </span>
                      <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: tile.text }}>{navLabel(item)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 rounded-2xl border-2 border-[#0A2B6D] bg-white p-2.5 space-y-1.5">
        <div className="px-1">
          <div className="truncate text-xs font-extrabold text-[#0A2B6D]">{user?.full_name || 'User'}</div>
          <div className="truncate text-[11px] font-bold text-[#5A00D6]">{user?.email || ''}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF] transition-colors"
        >
          <LogOut className="h-3.5 w-3.5 text-[#FF2E9A]" />
          Sign out
        </button>
      </div>
    </div>
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
    <div className="app-readable flex h-dvh overflow-hidden bg-white">
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
        <header className="relative z-40 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-3 py-2.5 shadow-2xs backdrop-blur-md sm:px-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="rounded-lg p-1.5 hover:bg-brand/5 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <Image
              src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
              alt="ComplianceHR"
              fittingType="fit"
              className="h-9 w-9 shrink-0 rounded-xl bg-white shadow-sm ring-1 ring-brand/10"
            />
            <div className="hidden min-w-0 sm:block">
              <div className="text-sm font-extrabold tracking-tight font-display text-foreground leading-tight">{currentLabel}</div>
              <div className="text-[11px] font-bold text-violet-700 leading-tight">ComplianceHR INFINITY · Complete Control. Greater Confidence. Brighter Success.</div>
            </div>
          </div>

          {/* Global Switcher + Search + Notifications + User Menu */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden lg:block w-56">
              <GlobalSearch />
            </div>

            <div
              className="flex items-center gap-1 rounded-full p-1 shadow-sm"
              style={{ background: SQUISHED_GRADIENT }}
            >
              <button
                type="button"
                onClick={() => switchWorkspaceView('both')}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold transition-all ${
                  workspaceView === 'both'
                    ? 'bg-white text-blue-950 shadow-sm'
                    : 'text-white hover:bg-white/15'
                }`}
              >
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                <span className="hidden sm:inline">Both Views</span>
              </button>
              <button
                type="button"
                onClick={() => switchWorkspaceView('office')}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold transition-all ${
                  workspaceView === 'office'
                    ? 'bg-white text-blue-950 shadow-sm'
                    : 'text-white hover:bg-white/15'
                }`}
              >
                <Building2 className="h-3.5 w-3.5 text-pink-600" />
                <span className="hidden sm:inline">Office View</span>
              </button>
              <button
                type="button"
                onClick={() => switchWorkspaceView('profiles')}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold transition-all ${
                  workspaceView === 'profiles'
                    ? 'bg-white text-purple-950 shadow-sm'
                    : 'text-white hover:bg-white/15'
                }`}
              >
                <Users className="h-3.5 w-3.5 text-purple-600" />
                <span className="hidden sm:inline">View Profiles</span>
              </button>
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
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-violet-200 bg-white text-violet-800 shadow-2xs transition-colors hover:bg-violet-50"
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-600 px-1 text-[10px] font-black text-white">
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border-2 border-violet-200 bg-white p-3 shadow-xl">
                  <div className="mb-2 flex items-center justify-between border-b border-violet-100 pb-2">
                    <span className="text-xs font-extrabold text-violet-950">Notifications</span>
                    {unread > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="text-xs font-bold text-pink-600 hover:underline"
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
                            n.read ? 'border-violet-100 bg-white' : 'border-pink-200 bg-pink-50/50 font-semibold'
                          }`}
                        >
                          <div className="font-bold text-foreground">{n.title || 'Update'}</div>
                          {n.message && <div className="mt-0.5 text-muted-foreground">{n.message}</div>}
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    to="/notifications"
                    className="mt-2 block rounded-lg bg-violet-50 py-1.5 text-center text-xs font-bold text-violet-800 hover:bg-violet-100"
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
                className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-xs font-black text-white shadow-sm"
              >
                {initials}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border-2 border-violet-200 bg-white p-3 shadow-xl space-y-2">
                  <div className="border-b border-violet-100 pb-2">
                    <div className="truncate text-xs font-extrabold text-foreground">{user?.full_name || 'ComplianceHR User'}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{user?.email || role}</div>
                    <span className="mt-1 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-900">
                      {role}
                    </span>
                  </div>
                  <Link
                    to="/my-profile"
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-violet-50"
                  >
                    <User className="h-3.5 w-3.5 text-violet-600" />
                    My Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="relative z-0 flex-1 overflow-y-auto pb-20 md:pb-0">
          <QuickAppBar />
          <div className={location.pathname === '/staff' || location.pathname.startsWith('/staff/') ? 'mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8' : 'mx-auto max-w-[1440px] px-4 pt-3 sm:px-6 lg:px-8 md:pt-4'}>
            <PendingApprovalNotice />
            <ModuleGuide />
          </div>
          <AutoRegisterInsights />
          <div className="app-dashboard-canvas min-w-0" style={{ '--module-colour': currentModuleColour }}>
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
                        className="flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-extrabold text-foreground hover:shadow-sm"
                        style={{
                          borderColor: `${modColor}55`,
                          borderTopWidth: '3px',
                          borderTopColor: modColor,
                          background: `linear-gradient(145deg, ${modColor}18, #ffffff)`,
                        }}
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-sm" style={{ background: modColor }}>
                          <Icon className="h-4 w-4" />
                        </span>
                        {navLabel(item)}
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