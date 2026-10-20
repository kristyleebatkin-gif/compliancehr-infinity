import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { canAccessNav, ROLES } from '@/lib/roles';
import ModuleGuide from '@/components/ModuleGuide';
import ModuleDocsFooter from '@/components/ModuleDocsFooter';
import { MODULE_DIRECTORY as PRIMARY_NAV, NAV_GROUPS } from '@/lib/moduleDirectory';
import {
  Bell, LogOut, Menu, X, ChevronDown, MoreHorizontal, ShieldQuestion, Siren, Sparkles, LifeBuoy,
  LayoutDashboard, Users, Heart, GraduationCap, ShieldCheck, PartyPopper,
  Search, Sun, Moon, User, Wallet,
} from 'lucide-react';
import GlobalSearch from '@/components/GlobalSearch';
import AutoRegisterInsights from '@/components/AutoRegisterInsights';
import { Image } from '@/components/ui/image';
import ErrorBoundary from '@/components/ErrorBoundary';

const BOTTOM_NAV = [
  { label: 'Home', path: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { label: 'Participants', path: '/participants', key: 'participants', icon: Heart },
  { label: 'Employees', path: '/staff', key: 'staff', icon: Users },
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
    if (user?.id && accountStatus === 'Active' && role !== 'Archived') {
      base44.functions.invoke('logUserAction', {
        action: 'View',
        entity_type: 'App Page',
        record_title: location.pathname,
        route: location.pathname,
        details: 'Page viewed',
      }).catch((error) => console.error(error));
    }
  }, [accountStatus, location.pathname, role, user?.id]);

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
  const currentLabel = (() => { const found = PRIMARY_NAV.find((i) => isActive(i.path)); return found ? navLabel(found) : 'Dashboard'; })();
  const initials = (user?.full_name || 'CH')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'CH';

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Image src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/8f4f0ca87_generated_image.png" alt="ComplianceHR" className="h-10 w-10 rounded-xl bg-white object-contain shadow-sm ring-1 ring-brand/10" />
        <div className="min-w-0">
          <div className="text-[15px] font-bold tracking-tight font-editorial">Compliance<span className="font-editorial-italic bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">HR</span> <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Infinity</span></div>
          <div className="mt-0.5 text-[10px] font-medium leading-snug text-brand/60 line-clamp-2">Complete Control. Greater Confidence. Brighter Success.</div>
        </div>
      </div>

      <div className="px-3 pb-2">
        <div className="rounded-lg bg-brand/5 px-3 py-2 text-xs font-medium text-brand/70">
          {role}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {NAV_GROUPS.map((group) => {
          const items = visiblePrimary.filter((item) => group.keys.includes(item.key));
          if (!items.length) return null;
          return (
            <div key={group.label} className="mb-2.5">
              <div className="mb-1 px-3 pt-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">{group.label}</div>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
                        active ? 'bg-brand/10 font-bold text-brand shadow-sm' : 'font-medium text-foreground/60 hover:bg-brand/5 hover:text-brand'
                      }`}
                    >
                      {active && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full gradient-brand" />}
                      <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${active ? 'text-brand' : 'text-foreground/40'}`} />
                      <span className="truncate">{navLabel(item)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-brand/10 px-3 py-3">
        <div className="mb-1 px-3">
          <div className="truncate text-sm font-semibold">{user?.full_name || 'User'}</div>
          <div className="truncate text-xs text-foreground/50">{user?.email || ''}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-brand/5 hover:text-brand transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

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
    <div className="flex h-screen app-workspace-bg">
      <aside className="app-sidebar-bg hidden w-64 shrink-0 border-r border-brand/10 md:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-sidebar shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-1 border-b border-brand/10 bg-background/85 px-3 py-3 shadow-sm backdrop-blur-md sm:px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="rounded-lg p-1.5 hover:bg-brand/5 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <Image
              src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/8f4f0ca87_generated_image.png"
              alt="ComplianceHR"
              fittingType="fit"
              className="h-9 w-9 shrink-0 rounded-xl bg-white shadow-sm ring-1 ring-brand/10"
            />
            <div className="hidden sm:block">
              <div className="text-sm font-bold tracking-tight font-display text-foreground">{currentLabel}</div>
              <div className="text-[11px] font-medium text-foreground/40">ComplianceHR Infinity</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GlobalSearch />
            {/* Emergency quick access (pink) */}
            <Link
              to="/emergency-response"
              title="Emergency Response"
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-bold shadow-sm transition-colors ${isActive('/emergency-response') ? 'bg-pink-600 text-white border-pink-600 hover:bg-pink-700' : 'border-pink-300 bg-pink-500/10 text-pink-600 hover:bg-pink-500/20'}`}
            >
              <Siren className="h-4 w-4" /><span className="hidden xl:inline">Emergency</span>
            </Link>
            {/* Personal Assistant quick access (purple) */}
            <Link
              to="/assistant"
              title="Personal Assistant"
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-bold shadow-sm transition-colors ${isActive('/assistant') ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700' : 'border-purple-300 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20'}`}
            >
              <Sparkles className="h-4 w-4" /><span className="hidden xl:inline">Personal Assistant</span>
            </Link>
            {/* Technical Support quick access (blue) */}
            <Link
              to="/help?tab=tech-support"
              title="Technical Support"
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-bold shadow-sm transition-colors ${location.pathname === '/help' ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'border-blue-300 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'}`}
            >
              <LifeBuoy className="h-4 w-4" /><span className="hidden xl:inline">Technical Support</span>
            </Link>
            <button
              onClick={() => setDarkMode((v) => !v)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="rounded-lg p-2 hover:bg-brand/5"
            >
              {darkMode ? <Sun className="h-5 w-5 text-foreground/60" /> : <Moon className="h-5 w-5 text-foreground/60" />}
            </button>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative rounded-lg p-2 hover:bg-brand/5"
              >
                <Bell className="h-5 w-5 text-foreground/60" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border border-border/60 bg-card p-3 shadow-xl">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm font-semibold">Notifications</div>
                      <button onClick={markAllRead} className="text-xs font-medium text-brand hover:underline">
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-80 space-y-1.5 overflow-y-auto">
                      {notifications.length === 0 && (
                        <div className="py-6 text-center text-sm text-foreground/40">No notifications</div>
                      )}
                      {notifications.map((n) => n.type === 'Birthday Shout-out' ? (
                        <div key={n.id} className={`rounded-xl border border-pink-200 p-3 text-sm dark:border-pink-500/30 ${n.read ? 'bg-pink-50/50 dark:bg-pink-500/5' : 'bg-pink-50 dark:bg-pink-500/10'}`}>
                          <div className="flex items-start gap-2.5">
                            {n.branding_logo_url ? <Image src={n.branding_logo_url} alt="" className="h-9 w-9 rounded-lg bg-white object-contain p-1" /> : <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-pink-600"><PartyPopper className="h-4 w-4" /></div>}
                            <div className="min-w-0">
                              <div className="font-semibold text-pink-900 dark:text-pink-300">{n.branding_company_name || 'Birthday Shout-out'}</div>
                              <div className="mt-0.5 text-xs leading-5 text-pink-800 dark:text-pink-300/80">{n.message}</div>
                              {n.branding_slogan && <div className="mt-1 text-[10px] font-medium text-pink-700/70 dark:text-pink-300/60">{n.branding_slogan}</div>}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div key={n.id} className={`rounded-lg p-2.5 text-sm ${n.read ? 'bg-muted/40' : 'bg-brand/5'}`}>
                          <div className="font-medium">{n.type}</div>
                          <div className="mt-0.5 text-xs text-foreground/60">{n.message}</div>
                          {n.action_url && <Link to={n.action_url} onClick={() => setNotifOpen(false)} className="mt-2 inline-flex rounded-md bg-brand px-2.5 py-1 text-[11px] font-semibold text-white">Open required document</Link>}
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="mt-2 block rounded-lg bg-brand/5 py-2 text-center text-xs font-semibold text-brand hover:bg-brand/10"
                    >
                      Open notification centre
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-brand/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white shadow-md">
                  {initials}
                </div>
                <ChevronDown className="hidden h-4 w-4 text-foreground/40 sm:block" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-border/60 bg-card p-2 shadow-xl">
                    <div className="px-3 py-2">
                      <div className="truncate text-sm font-semibold">{user?.full_name || 'User'}</div>
                      <div className="truncate text-xs text-foreground/50">{user?.email || ''}</div>
                      <div className="mt-1.5 inline-flex rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">{role}</div>
                    </div>
                    <Link
                      to="/my-profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-brand/5 hover:text-brand"
                    >
                      <User className="h-4 w-4" /> My profile
                    </Link>
                    <Link
                      to="/my-payroll"
                      onClick={() => setUserMenuOpen(false)}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-brand/5 hover:text-brand"
                    >
                      <Wallet className="h-4 w-4" /> My payroll
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-danger hover:bg-danger/5"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="mx-auto max-w-6xl px-3 pt-4 md:px-8 md:pt-6">
            <ModuleGuide />
          </div>
          <AutoRegisterInsights />
          <div className="min-w-0 px-3 md:px-0">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
          <ModuleDocsFooter />
        </main>

        {/* Bottom nav (mobile) */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border/60 bg-background px-1 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden">
          {visibleBottom.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors ${
                  active ? 'bg-brand/10 text-brand' : 'text-foreground/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate">{navLabel(item)}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-foreground/50"
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
                <div className="text-base font-semibold">More</div>
                <button onClick={() => setMoreOpen(false)} className="rounded-lg p-1 hover:bg-brand/5">
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
                        className="flex flex-col items-center gap-1.5 rounded-xl border border-border/60 p-3 text-xs font-medium text-foreground/70 hover:bg-brand/5"
                      >
                        <Icon className="h-5 w-5 text-brand" />
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