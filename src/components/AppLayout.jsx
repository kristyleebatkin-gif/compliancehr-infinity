import '@/components/dashboard/dashboardWorkspace.css';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { canAccessNav, ROLES } from '@/lib/roles';
import AuditorOnlyLayout from '@/components/AuditorOnlyLayout';
import { MODULE_DIRECTORY as PRIMARY_NAV } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import {
  Bell, LogOut, Menu, X, ChevronDown, MoreHorizontal, ShieldQuestion, Sparkles,
  LayoutDashboard, Users, Heart, GraduationCap, ShieldCheck, User, Building2, Layers,
} from 'lucide-react';
import GlobalSearch from '@/components/GlobalSearch';
import AutoRegisterInsights from '@/components/AutoRegisterInsights';
import QuickAppBar from '@/components/QuickAppBar';
import ObsidianSidebarRemote from '@/components/ObsidianSidebarRemote';
import EnterpriseWorkspaceBar from '@/components/enterprise/EnterpriseWorkspaceBar';
import VisualDesignModuleCommandStandard from '@/components/enterprise/VisualDesignModuleCommandStandard';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import ErrorBoundary from '@/components/ErrorBoundary';
import PendingApprovalNotice from '@/components/users/PendingApprovalNotice';
import ModuleGuide from '@/components/ModuleGuide';
import ModuleDocsFooter from '@/components/ModuleDocsFooter';
import UniversalDocumentViewerModal from '@/components/documents/UniversalDocumentViewerModal';
import EnterpriseFloatingWorkspaceDock from '@/components/EnterpriseFloatingWorkspaceDock';
import ProviderOnboardingDrawer from '@/components/enterprise/ProviderOnboardingDrawer';

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
  const [workspaceView, setWorkspaceView] = useState(() => localStorage.getItem('chr-workspace-view-mode') || 'both');
  const [compactHeader, setCompactHeader] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    const onModeChange = (e) => {
      if (e?.detail?.mode) setWorkspaceView(e.detail.mode);
    };
    const onOpenOnboarding = () => setOnboardingOpen(true);
    window.addEventListener('chr-view-mode-change', onModeChange);
    window.addEventListener('chr-open-onboarding-checklist', onOpenOnboarding);
    return () => {
      window.removeEventListener('chr-view-mode-change', onModeChange);
      window.removeEventListener('chr-open-onboarding-checklist', onOpenOnboarding);
    };
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
      <aside
        className="hidden w-64 shrink-0 overflow-hidden bg-white md:flex"
        style={{
          borderRight: '3px solid transparent',
          backgroundImage:
            'linear-gradient(#ffffff, #ffffff), linear-gradient(180deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      >
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
        <header className="preserve-island-theme sticky top-0 z-40 shrink-0 shadow-md">
          {/* Top App-Design Gradient Strip — matches remote top strip */}
          <div
            className="h-1.5 w-full"
            style={{
              background:
                'linear-gradient(120deg, #00C6FF 0%, #0072FF 25%, #5A00D6 55%, #FF2E9A 100%)',
            }}
          />
          {/* Top Section of White Area — auto-compacts when scrolling down workspace registers */}
          <div className={`bg-white px-3 sm:px-6 lg:px-8 transition-all duration-200 ${compactHeader ? 'hidden' : 'py-2'}`}>
            <div className="mx-auto flex min-h-[190px] max-w-[1440px] flex-col justify-between md:h-[190px] md:flex-row md:items-stretch">
              {/* Left at the Bottom: Sign In & Book Demo (App Coloured) */}
              <div className="order-2 flex shrink-0 items-center justify-center gap-2 self-center md:order-1 md:self-end md:pb-1">
                <Link
                  to="/login"
                  className="inline-flex min-h-[34px] items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm transition hover:opacity-95"
                  style={{
                    background: 'linear-gradient(115deg, #0A2B6D 0%, #0072FF 55%, #5A00D6 100%)',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/?demo=book"
                  className="inline-flex min-h-[34px] items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm transition hover:opacity-95"
                  style={{
                    background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                  }}
                >
                  Book Demo
                </Link>
              </div>

              {/* Centre: Business Logo, Name & Slogan Fitted Top-to-Bottom */}
              <div className="order-1 flex flex-1 items-center justify-center py-0.5 md:order-2">
                <Link
                  to="/dashboard"
                  className="inline-flex flex-col items-center justify-center text-center transition"
                >
                  <BrandLogoLockup size="md" theme="light" showSlogan={true} />
                </Link>
              </div>

              {/* Right at the Bottom: Demo & Start Free (App Coloured) */}
              <div className="order-3 flex shrink-0 items-center justify-center gap-2 self-center md:self-end md:pb-1">
                <Link
                  to="/dashboard"
                  className="inline-flex min-h-[34px] items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm transition hover:opacity-95"
                  style={{
                    background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #A100FF 100%)',
                  }}
                >
                  Demo
                </Link>
                <Link
                  to="/register"
                  className="inline-flex min-h-[34px] items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm transition hover:opacity-95"
                  style={{
                    background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                  }}
                >
                  Start Free
                </Link>
              </div>
            </div>
          </div>

          {/* Continuous App-Design Gradient Divider Line aligned with remote white section bottom */}
          <div
            className="h-[3px] w-full"
            style={{
              background:
                'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)',
            }}
          />

          {/* Dark Blue Command Row Below Top Logo Section */}
          <div
            className="px-3 py-1 sm:px-6 lg:px-8"
            style={{
              background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #131B4D 100%)',
            }}
          >
            <div className="mx-auto flex max-w-[1440px] w-full flex-wrap items-center justify-between gap-1.5">
              <div className="flex min-w-0 items-center gap-1.5">
                <button
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                  className="shrink-0 rounded-full border-2 border-[#0072FF] bg-white p-1 text-[#0A2B6D] shadow-2xs transition hover:border-[#FF2E9A] md:hidden"
                >
                  <Menu className="h-3 w-3" style={{ color: '#0072FF' }} />
                </button>

                <span
                  className="inline-flex rounded-full p-[1.5px] shadow-2xs"
                  style={{
                    background:
                      'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)',
                  }}
                >
                  <span className="inline-flex min-h-[22px] items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[9.5px] font-extrabold text-[#0A2B6D]">
                    <Sparkles className="h-3 w-3 shrink-0" style={{ color: '#5A00D6' }} />
                    <span className="whitespace-nowrap" style={{ color: '#0A2B6D' }}>
                      ◉ {currentLabel}
                    </span>
                  </span>
                </span>
              </div>

              <div className="flex flex-1 items-center justify-center min-w-[160px] max-w-md">
                <div
                  className="w-full rounded-full p-[1.5px] shadow-2xs"
                  style={{
                    background:
                      'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)',
                  }}
                >
                  <div className="rounded-full bg-white">
                    <GlobalSearch />
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOnboardingOpen(true)}
                  className="hidden sm:inline-flex min-h-[24px] items-center gap-1 rounded-full border border-[#00C6FF]/50 bg-white px-2.5 py-0.5 text-[9.5px] font-extrabold text-[#0A2B6D] shadow-2xs transition hover:bg-[#F5F0FF]"
                  title="Open 5-Step Provider Launch & Audit Readiness Checklist"
                >
                  <Sparkles className="h-3 w-3 text-[#5A00D6]" />
                  <span>Setup Checklist</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompactHeader((v) => !v)}
                  className="hidden md:inline-flex min-h-[24px] items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[9px] font-bold text-white transition hover:bg-white/20"
                  title={compactHeader ? 'Show full top banner' : 'Compact top banner for more table space'}
                >
                  <span>{compactHeader ? 'Expand Banner' : 'Compact View'}</span>
                </button>
                <div
                  className="rounded-full p-[1.5px] shadow-2xs"
                  style={{
                    background:
                      'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)',
                  }}
                >
                  <div className="flex items-center gap-0.5 rounded-full bg-white p-0.5">
                    {WORKSPACE_VIEWS.map(({ id, label, Icon }) => {
                      const selected = workspaceView === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => switchWorkspaceView(id)}
                          aria-pressed={selected}
                          title={label}
                          className={`inline-flex min-h-[20px] items-center gap-1 rounded-full px-2 py-0.5 text-[8.5px] font-extrabold transition-all ${
                            selected
                              ? 'bg-[#F5F0FF] text-[#5A00D6] border border-[#5A00D6]'
                              : 'text-[#0A2B6D] hover:text-[#0072FF]'
                          }`}
                        >
                          <Icon
                            className="h-2.5 w-2.5 shrink-0"
                            style={{ color: selected ? '#FF2E9A' : '#0072FF' }}
                          />
                          <span className="hidden whitespace-nowrap lg:inline" style={{ color: '#0A2B6D' }}>
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
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
                    className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0072FF] bg-white text-[#0A2B6D] shadow-2xs transition hover:border-[#FF2E9A]"
                  >
                    <Bell className="h-3.5 w-3.5 text-[#0072FF]" />
                    {unread > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF2E9A] px-1 text-[9px] font-bold text-white">
                        {unread}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl">
                      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
                          Notifications
                        </span>
                        {unread > 0 && (
                          <button
                            type="button"
                            onClick={markAllRead}
                            className="text-xs font-bold text-[#0072FF] hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 space-y-1.5 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="py-4 text-center text-xs text-muted-foreground">
                            All caught up — no unread alerts.
                          </p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`rounded-lg border p-2.5 text-xs ${
                                n.read
                                  ? 'border-slate-100 bg-white'
                                  : 'border-[#0072FF]/30 bg-[#0072FF]/5 font-semibold'
                              }`}
                            >
                              <div className="font-bold text-[#0A2B6D]">{n.title || 'System Alert'}</div>
                              {n.message && <div className="mt-0.5 text-muted-foreground">{n.message}</div>}
                            </div>
                          ))
                        )}
                      </div>
                      <Link
                        to="/notifications"
                        className="mt-2.5 block rounded-lg bg-slate-100 py-2 text-center text-xs font-bold text-[#0A2B6D] hover:bg-slate-200"
                      >
                        View All Notifications
                      </Link>
                    </div>
                  )}
                </div>

                {/* User Profile Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen((v) => !v);
                      setNotifOpen(false);
                    }}
                    aria-label="User account menu"
                    className="flex h-7 items-center gap-1.5 rounded-full border-2 border-[#5A00D6] bg-white px-2 text-xs font-extrabold text-[#0A2B6D] shadow-2xs transition hover:border-[#FF2E9A]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0A2B6D] text-[10px] font-black text-white">
                      {initials}
                    </span>
                    <span className="hidden max-w-[110px] truncate text-[10px] font-extrabold text-[#0A2B6D] xl:inline">
                      {user?.full_name || 'My Account'}
                    </span>
                    <ChevronDown className="h-3 w-3 shrink-0 text-[#5A00D6]" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-10 z-50 w-60 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl space-y-2">
                      <div className="border-b border-slate-100 pb-2.5">
                        <div className="truncate text-sm font-bold text-[#0A2B6D]">
                          {user?.full_name || 'ComplianceHR User'}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{user?.email || role}</div>
                        <span className="mt-1.5 inline-block rounded-md bg-[#0072FF]/10 px-2 py-0.5 text-xs font-bold text-[#0072FF]">
                          {role}
                        </span>
                      </div>
                      <Link
                        to="/my-profile"
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-[#0A2B6D] hover:bg-slate-50"
                      >
                        <User className="h-4 w-4 text-[#0072FF]" />
                        My Profile &amp; Dossier
                      </Link>
                      <Link
                        to="/connect"
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-[#0A2B6D] hover:bg-slate-50"
                      >
                        <Sparkles className="h-4 w-4 text-[#5A00D6]" />
                        Connect AI Agent (MCP)
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main
          id="main-workspace-content"
          onScroll={(e) => {
            const top = e.currentTarget.scrollTop;
            if (top > 120 && !compactHeader) setCompactHeader(true);
            else if (top < 20 && compactHeader) setCompactHeader(false);
          }}
          className="relative z-0 flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-6"
          style={{
            background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
          }}
        >
          <EnterpriseWorkspaceBar
            currentLabel={currentLabel}
            role={role}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((d) => !d)}
          />
          <QuickAppBar />
          <VisualDesignModuleCommandStandard />
          <div className={location.pathname === '/staff' || location.pathname.startsWith('/staff/') ? 'mx-auto max-w-[1440px] px-3' : 'mx-auto max-w-[1440px] px-3 pt-2'}>
            <PendingApprovalNotice />
            <ModuleGuide />
          </div>
          <AutoRegisterInsights />
          <div
            className="app-dashboard-canvas mx-auto w-full max-w-[1440px] min-w-0 px-3 py-3"
            style={{ '--module-colour': currentModuleColour }}
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
          {location.pathname !== '/our-employees' && <ModuleDocsFooter />}
          <UniversalDocumentViewerModal />
          <EnterpriseFloatingWorkspaceDock />
          <ProviderOnboardingDrawer open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
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
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-xs font-bold transition-colors ${
                  active ? 'text-[#0072FF]' : 'text-[#0A2B6D]/75'
                }`}
              >
                <Icon className="h-5 w-5" style={{ color: active ? '#0072FF' : modColor }} />
                <span className="max-w-full truncate">{navLabel(item)}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-xs font-bold text-[#0A2B6D]"
          >
            <MoreHorizontal className="h-5 w-5" />
            More
          </button>
        </nav>

        {moreOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-foreground/40" onClick={() => setMoreOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto rounded-t-2xl bg-white p-4 pb-8">
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="text-base font-extrabold text-[#0A2B6D]">All Enterprise Modules</div>
                <button onClick={() => setMoreOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-100">
                  <X className="h-5 w-5 text-[#0A2B6D]" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {visibleNav
                  .filter((i) => !BOTTOM_NAV.some((b) => b.path === i.path))
                  .map((item) => {
                    const Icon = item.icon;
                    const modColor = moduleKeyColour(item.key);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-left text-xs font-bold text-[#0A2B6D] shadow-2xs transition hover:border-[#0072FF]"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: modColor }}
                        >
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