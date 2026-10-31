import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MODULE_DIRECTORY, NAV_GROUPS } from '@/lib/moduleDirectory';
import {
  Home,
  ChevronRight,
  Activity,
  Sparkles,
  Command,
  ShieldCheck,
  Clock,
  RefreshCw,
  X,
  ArrowRight,
  Sun,
  Moon,
  Bot,
  Send,
  CheckCircle2,
  FileText,
  Bookmark,
  History,
  Compass,
  Wifi,
  WifiOff,
  Trash2,
  Plus,
} from 'lucide-react';

const AI_COPILOT_MODES = [
  {
    id: 'insights',
    label: 'AI Compliance Insights',
    prompts: [
      'Summarise our NDIS Practice Standards audit readiness across all 8 modules',
      'Identify top compliance risks and expiring staff credentials this week',
    ],
  },
  {
    id: 'policy',
    label: 'AI Policy Support',
    prompts: [
      'Explain 24-hour vs 5-day NDIS reportable incident notification rules',
      'Draft an NDIS Worker Screening and Code of Conduct compliance checklist',
    ],
  },
  {
    id: 'reports',
    label: 'AI Report & Summary',
    prompts: [
      'Generate a Board Executive Summary of incidents, risks, and training KPIs',
      'Create a 10-weekly participant progress review summary template',
    ],
  },
  {
    id: 'documents',
    label: 'AI Document & Notes',
    prompts: [
      'Draft a participant progress note for a daily community support shift',
      'Write a formal follow-up letter for an internal quality audit action',
    ],
  },
  {
    id: 'workflows',
    label: 'AI Workflow Suggestions',
    prompts: [
      'Recommend automated escalation rules for overdue high-priority tasks',
      'Suggest roster fatigue and SCHADS compliance validation checks',
    ],
  },
];

const ONBOARDING_STEPS = [
  {
    id: 'step-dashboard',
    title: '1. Explore the Executive Dashboard & Smart Remote',
    desc: 'Switch between all 8 executive dashboard suites or personalise your layout.',
    path: '/dashboard',
  },
  {
    id: 'step-profiles',
    title: '2. Review Employee & Participant 100-Point Profiles',
    desc: 'Verify screening checks, NDIS plans, 3-part consents, and fillable forms.',
    path: '/our-employees',
  },
  {
    id: 'step-compliance',
    title: '3. Run a 2-Minute Express Compliance Audit',
    desc: 'Inspect 356 checkpoints mapped to the 8 NDIS Practice Standards.',
    path: '/compliance',
  },
  {
    id: 'step-rostering',
    title: '4. Check Roster Coverage & SCHADS Validation',
    desc: 'Manage shifts, availability, fatigue gates, and payroll exports.',
    path: '/roster',
  },
  {
    id: 'step-safety',
    title: '5. Inspect Incident Clinic & Risk Heatmaps',
    desc: 'Track 24h/5d NDIS reportable timers, root causes, and safety checks.',
    path: '/incidents',
  },
  {
    id: 'step-ai',
    title: '6. Launch Infinity AI Copilot & Command Palette (⌘K)',
    desc: 'Press Ctrl+K / ⌘K anywhere to search records or ask Infinity AI.',
    path: '/assistant',
  },
];

export default function EnterpriseWorkspaceBar({
  currentLabel,
  role,
  darkMode,
  onToggleDarkMode,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerMode, setDrawerMode] = useState(null); // 'activity' | 'ai' | 'onboarding' | null
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [aiMode, setAiMode] = useState('insights');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Saved Views & Recent History (persisted in localStorage)
  const [savedViews, setSavedViews] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chr-saved-views') || '[]');
    } catch {
      return [];
    }
  });
  const [recentPages, setRecentPages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chr-recent-pages') || '[]');
    } catch {
      return [];
    }
  });
  const [completedOnboarding, setCompletedOnboarding] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chr-onboarding-done') || '[]');
    } catch {
      return [];
    }
  });
  const [savedDropdownOpen, setSavedDropdownOpen] = useState(false);
  const [recentDropdownOpen, setRecentDropdownOpen] = useState(false);

  // Track online/offline status
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Listen for custom events from Command Palette
  useEffect(() => {
    const onOpenActivity = () => setDrawerMode('activity');
    const onOpenAi = () => setDrawerMode('ai');
    const onOpenOnboarding = () => setDrawerMode('onboarding');
    window.addEventListener('chr-open-activity-drawer', onOpenActivity);
    window.addEventListener('chr-open-ai-drawer', onOpenAi);
    window.addEventListener('chr-open-onboarding-drawer', onOpenOnboarding);
    return () => {
      window.removeEventListener('chr-open-activity-drawer', onOpenActivity);
      window.removeEventListener('chr-open-ai-drawer', onOpenAi);
      window.removeEventListener('chr-open-onboarding-drawer', onOpenOnboarding);
    };
  }, []);

  // Resolve breadcrumb trail from current path and URL search params
  const seg = `/${location.pathname.split('/')[1] || 'dashboard'}`;
  const matchedModule =
    MODULE_DIRECTORY.find((m) => m.path === location.pathname) ||
    MODULE_DIRECTORY.find((m) => m.path === seg);
  const matchedGroup = NAV_GROUPS.find((g) =>
    g.keys.includes(matchedModule?.key || 'dashboard')
  );

  const searchParams = new URLSearchParams(location.search);
  const activeTabParam = searchParams.get('tab') || searchParams.get('view');
  const fullPath = `${location.pathname}${location.search || ''}`;
  const viewTitle = activeTabParam
    ? `${currentLabel || matchedModule?.label || 'Workspace'} (${activeTabParam.replace(/[-_]/g, ' ')})`
    : currentLabel || matchedModule?.label || 'Dashboard';

  // Record recent page visits automatically
  useEffect(() => {
    setSavedDropdownOpen(false);
    setRecentDropdownOpen(false);
    setRecentPages((prev) => {
      const entry = {
        path: fullPath,
        label: viewTitle,
        group: matchedGroup?.label || 'Workspace',
        ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const next = [entry, ...prev.filter((p) => p.path !== fullPath)].slice(0, 8);
      localStorage.setItem('chr-recent-pages', JSON.stringify(next));
      return next;
    });
  }, [fullPath, viewTitle, matchedGroup?.label]);

  const isCurrentSaved = savedViews.some((v) => v.path === fullPath);

  const toggleSaveCurrentView = () => {
    setSavedViews((prev) => {
      const exists = prev.some((v) => v.path === fullPath);
      const next = exists
        ? prev.filter((v) => v.path !== fullPath)
        : [
            {
              path: fullPath,
              label: viewTitle,
              group: matchedGroup?.label || 'Workspace',
            },
            ...prev,
          ].slice(0, 12);
      localStorage.setItem('chr-saved-views', JSON.stringify(next));
      return next;
    });
  };

  const removeSavedView = (pathToRemove) => {
    setSavedViews((prev) => {
      const next = prev.filter((v) => v.path !== pathToRemove);
      localStorage.setItem('chr-saved-views', JSON.stringify(next));
      return next;
    });
  };

  const toggleOnboardingStep = (stepId) => {
    setCompletedOnboarding((prev) => {
      const next = prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId];
      localStorage.setItem('chr-onboarding-done', JSON.stringify(next));
      return next;
    });
  };

  const fetchAuditActivity = async () => {
    setLoadingLogs(true);
    try {
      const page = await base44.entities.AuditLog.list({
        sort: '-created_date',
        limit: 30,
      });
      const items = Array.isArray(page) ? page : page?.items || [];
      setAuditLogs(items);
    } catch {
      setAuditLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (drawerMode === 'activity') {
      fetchAuditActivity();
    }
  }, [drawerMode]);

  const filteredLogs = auditLogs.filter((entry) => {
    const action = (entry.action || '').toLowerCase();
    if (logFilter === 'views' && action !== 'view') return false;
    if (logFilter === 'changes' && action === 'view') return false;
    if (logSearch.trim()) {
      const q = logSearch.trim().toLowerCase();
      const hay = `${entry.record_title || ''} ${entry.entity_type || ''} ${entry.details || ''} ${entry.user_name || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const handleAiQuickSend = (promptText) => {
    const q = (promptText || aiPrompt).trim();
    setDrawerMode(null);
    navigate(q ? `/assistant?q=${encodeURIComponent(q)}` : '/assistant');
  };

  const activeAiModeObj =
    AI_COPILOT_MODES.find((m) => m.id === aiMode) || AI_COPILOT_MODES[0];

  return (
    <>
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-2.5 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 sm:px-4">
          {/* Left: Interactive Enterprise Breadcrumbs + Save View Bookmark */}
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 flex-wrap items-center gap-1 text-[11px] font-bold text-[#0A2B6D]"
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[#0A2B6D] transition hover:bg-[#F5F0FF] hover:text-[#0072FF]"
            >
              <Home className="h-3 w-3 shrink-0 text-[#0072FF]" />
              <span>Workspace</span>
            </Link>

            {matchedGroup && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="rounded-md bg-[#F5F0FF] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                  {matchedGroup.label}
                </span>
              </>
            )}

            <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
            <span
              className="truncate font-extrabold text-[#0A2B6D]"
              aria-current="page"
            >
              {currentLabel || matchedModule?.label || 'Dashboard'}
            </span>

            {activeTabParam && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="rounded-full border border-[#C084FC]/60 bg-white px-2 py-0.5 text-[10px] font-extrabold capitalize text-[#5A00D6]">
                  {activeTabParam.replace(/[-_]/g, ' ')}
                </span>
              </>
            )}

            {/* Bookmark / Save Current View Button */}
            <button
              type="button"
              onClick={toggleSaveCurrentView}
              title={isCurrentSaved ? 'Remove from Saved Views' : 'Pin to Saved Views'}
              className={`ml-1 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold transition ${
                isCurrentSaved
                  ? 'border-[#5A00D6] bg-[#F5F0FF] text-[#5A00D6]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-[#0072FF] hover:text-[#0072FF]'
              }`}
            >
              <Bookmark
                className="h-2.5 w-2.5"
                style={{ fill: isCurrentSaved ? '#5A00D6' : 'none' }}
              />
              <span className="hidden md:inline">{isCurrentSaved ? 'Saved' : 'Save View'}</span>
            </button>
          </nav>

          {/* Right: Enterprise Action Strip */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Network / Sync Status Badge */}
            <span
              title={isOnline ? 'Workspace connected & synced' : 'Offline mode — changes queued'}
              className={`hidden xl:inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${
                isOnline
                  ? 'border-slate-200 bg-white text-[#0A2B6D]'
                  : 'border-[#FF2E9A] bg-[#FF2E9A]/10 text-[#FF2E9A]'
              }`}
            >
              {isOnline ? (
                <Wifi className="h-2.5 w-2.5 text-[#0072FF]" />
              ) : (
                <WifiOff className="h-2.5 w-2.5 text-[#FF2E9A]" />
              )}
              <span>{isOnline ? 'Synced' : 'Offline'}</span>
            </span>

            {/* Saved Views Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSavedDropdownOpen((v) => !v);
                  setRecentDropdownOpen(false);
                }}
                title="Saved Views"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs transition hover:border-[#5A00D6] hover:text-[#5A00D6]"
              >
                <Bookmark className="h-3 w-3 text-[#5A00D6]" />
                <span className="hidden sm:inline">Saved</span>
                {savedViews.length > 0 && (
                  <span className="rounded-full bg-[#F5F0FF] px-1.5 text-[9.5px] font-black text-[#5A00D6]">
                    {savedViews.length}
                  </span>
                )}
              </button>
              {savedDropdownOpen && (
                <div className="absolute right-0 top-9 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-xs font-extrabold text-[#0A2B6D]">
                      Pinned &amp; Saved Views
                    </span>
                    <button
                      type="button"
                      onClick={toggleSaveCurrentView}
                      className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-[#0072FF] hover:underline"
                    >
                      <Plus className="h-3 w-3" />
                      <span>{isCurrentSaved ? 'Unpin Current' : 'Pin Current'}</span>
                    </button>
                  </div>
                  {savedViews.length === 0 ? (
                    <p className="py-3 text-center text-[11px] font-medium text-slate-500">
                      Click &ldquo;Save View&rdquo; on any module or tab to pin it here for 1-click access.
                    </p>
                  ) : (
                    <div className="max-h-56 space-y-1 overflow-y-auto">
                      {savedViews.map((v) => (
                        <div
                          key={v.path}
                          className="flex items-center justify-between gap-1 rounded-xl border border-slate-100 bg-white px-2.5 py-1.5 hover:bg-[#F5F0FF]"
                        >
                          <Link
                            to={v.path}
                            onClick={() => setSavedDropdownOpen(false)}
                            className="min-w-0 flex-1"
                          >
                            <div className="truncate text-xs font-extrabold text-[#0A2B6D]">
                              {v.label}
                            </div>
                            <div className="text-[10px] font-semibold text-[#5A00D6]">
                              {v.group}
                            </div>
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeSavedView(v.path)}
                            aria-label="Remove saved view"
                            className="rounded p-1 text-slate-400 hover:text-[#FF2E9A]"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Pages Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setRecentDropdownOpen((v) => !v);
                  setSavedDropdownOpen(false);
                }}
                title="Recently Visited Pages"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs transition hover:border-[#0072FF] hover:text-[#0072FF]"
              >
                <History className="h-3 w-3 text-[#0072FF]" />
                <span className="hidden md:inline">Recent</span>
              </button>
              {recentDropdownOpen && (
                <div className="absolute right-0 top-9 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl space-y-2">
                  <div className="border-b border-slate-100 pb-1.5 text-xs font-extrabold text-[#0A2B6D]">
                    Recent Workspace History
                  </div>
                  <div className="max-h-60 space-y-1 overflow-y-auto">
                    {recentPages.map((p) => (
                      <Link
                        key={p.path}
                        to={p.path}
                        onClick={() => setRecentDropdownOpen(false)}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white px-2.5 py-1.5 hover:bg-[#F5F0FF]"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-xs font-extrabold text-[#0A2B6D]">
                            {p.label}
                          </div>
                          <div className="text-[10px] font-semibold text-[#5A00D6]">
                            {p.group}
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold text-slate-400">
                          {p.ts}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent('chr-open-command-palette'))
              }
              title="Open Command Palette (Ctrl+K)"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs transition hover:border-[#0072FF] hover:text-[#0072FF]"
            >
              <Command className="h-3 w-3 text-[#0072FF]" />
              <span className="hidden sm:inline">Command</span>
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.2 text-[9.5px] font-extrabold text-[#5A00D6]">
                ⌘K
              </kbd>
            </button>

            {/* Guided Onboarding & Tour */}
            <button
              type="button"
              onClick={() =>
                setDrawerMode((prev) =>
                  prev === 'onboarding' ? null : 'onboarding'
                )
              }
              title="Guided Onboarding & Tour"
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-extrabold shadow-2xs transition ${
                drawerMode === 'onboarding'
                  ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white'
                  : 'border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
              }`}
            >
              <Compass className="h-3 w-3 text-[#FF2E9A]" />
              <span className="hidden lg:inline">Guide</span>
              <span className="rounded-full bg-[#F5F0FF] px-1.5 text-[9.5px] font-black text-[#5A00D6]">
                {completedOnboarding.length}/{ONBOARDING_STEPS.length}
              </span>
            </button>

            {/* Activity & Audit Feed */}
            <button
              type="button"
              onClick={() =>
                setDrawerMode((prev) => (prev === 'activity' ? null : 'activity'))
              }
              title="Live Activity Feed & Audit Logging"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-extrabold shadow-2xs transition ${
                drawerMode === 'activity'
                  ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white'
                  : 'border-slate-200 bg-white text-[#0A2B6D] hover:border-[#5A00D6] hover:text-[#5A00D6]'
              }`}
            >
              <Activity
                className={`h-3 w-3 ${
                  drawerMode === 'activity' ? 'text-[#00C6FF]' : 'text-[#5A00D6]'
                }`}
              />
              <span>Activity &amp; Audit</span>
            </button>

            {/* AI Assistant Copilot */}
            <button
              type="button"
              onClick={() =>
                setDrawerMode((prev) => (prev === 'ai' ? null : 'ai'))
              }
              title="Open Infinity AI Copilot"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-extrabold text-white shadow-2xs transition hover:opacity-95"
              style={{
                background:
                  'linear-gradient(120deg, #0072FF 0%, #5A00D6 52%, #FF2E9A 100%)',
              }}
            >
              <Sparkles className="h-3 w-3 text-white" />
              <span>Ask AI</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#0A2B6D] shadow-2xs transition hover:border-[#0072FF] hover:text-[#0072FF]"
            >
              {darkMode ? (
                <Sun className="h-3.5 w-3.5 text-[#FF2E9A]" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-[#5A00D6]" />
              )}
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Slide-Over Enterprise Drawer */}
      {drawerMode && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-2xs"
            onClick={() => setDrawerMode(null)}
          />
          <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l-2 border-[#0A2B6D] bg-white shadow-2xl">
            {/* Drawer Header */}
            <div
              className="flex items-center justify-between gap-2 px-4 py-3 text-white"
              style={{
                background:
                  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 28%, #5A00D6 65%, #FF2E9A 100%)',
              }}
            >
              <div className="flex items-center gap-2">
                {drawerMode === 'activity' ? (
                  <ShieldCheck className="h-4 w-4 text-white" />
                ) : drawerMode === 'onboarding' ? (
                  <Compass className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
                <div>
                  <h2 className="text-sm font-extrabold text-white">
                    {drawerMode === 'activity'
                      ? 'Enterprise Activity & Audit Log'
                      : drawerMode === 'onboarding'
                        ? 'Guided Platform Onboarding'
                        : 'Infinity AI Copilot Suite'}
                  </h2>
                  <p className="text-[11px] font-medium text-white/90">
                    {drawerMode === 'activity'
                      ? 'Real-time user actions, record updates & compliance trail'
                      : drawerMode === 'onboarding'
                        ? 'Step-by-step interactive walkthrough of ComplianceHR Infinity'
                        : 'AI Insights · Policy Support · Summaries · Documents · Workflows'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerMode(null)}
                className="rounded-lg border border-white/30 bg-white/10 p-1 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {drawerMode === 'activity' ? (
              <div className="flex min-h-0 flex-1 flex-col p-4 space-y-3">
                {/* Search + Filter Tabs */}
                <input
                  type="search"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Filter audit trail by record, user, or module…"
                  className="h-8 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
                    {[
                      { id: 'all', label: 'All Events' },
                      { id: 'changes', label: 'Record Updates' },
                      { id: 'views', label: 'Page Views' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setLogFilter(tab.id)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
                          logFilter === tab.id
                            ? 'bg-[#0A2B6D] text-white'
                            : 'text-[#0A2B6D] hover:bg-[#F5F0FF]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={fetchAuditActivity}
                    title="Refresh audit log"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#0A2B6D] hover:border-[#0072FF]"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${loadingLogs ? 'animate-spin' : ''}`}
                    />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Audit Log Stream */}
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  {loadingLogs ? (
                    <div className="py-12 text-center text-xs font-bold text-[#5A00D6]">
                      Loading live audit trail…
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-1">
                      <CheckCircle2 className="mx-auto h-6 w-6 text-[#0072FF]" />
                      <div className="text-xs font-extrabold text-[#0A2B6D]">
                        Audit stream ready
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Actions and page views across your session are logged automatically for NDIS audit readiness.
                      </p>
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F0FF] px-2 py-0.5 text-[10px] font-extrabold text-[#5A00D6]">
                            <FileText className="h-2.5 w-2.5" />
                            {log.action || 'Action'} · {log.entity_type || 'Workspace'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                            <Clock className="h-2.5 w-2.5" />
                            {log.created_date
                              ? new Date(log.created_date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Just now'}
                          </span>
                        </div>
                        <div className="text-xs font-extrabold text-[#0A2B6D]">
                          {log.record_title || log.route || 'Workspace Activity'}
                        </div>
                        {log.details && (
                          <div className="text-[11px] font-medium text-slate-600">
                            {log.details}
                          </div>
                        )}
                        {log.user_name && (
                          <div className="text-[10px] font-bold text-[#0072FF]">
                            By {log.user_name} ({log.user_role || role})
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Links */}
                <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-3">
                  <Link
                    to="/compliance"
                    onClick={() => setDrawerMode(null)}
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0072FF] hover:underline"
                  >
                    <span>Open Full Compliance &amp; Audit Centre</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to="/documents"
                    onClick={() => setDrawerMode(null)}
                    className="text-xs font-extrabold text-[#5A00D6] hover:underline"
                  >
                    Data Control Vault
                  </Link>
                </div>
              </div>
            ) : drawerMode === 'onboarding' ? (
              /* Guided Onboarding Checklist */
              <div className="flex min-h-0 flex-1 flex-col justify-between p-4 space-y-4">
                <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
                  <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#0A2B6D]">
                      <span>Executive Onboarding Progress</span>
                      <span className="text-[#5A00D6]">
                        {completedOnboarding.length} / {ONBOARDING_STEPS.length} Completed
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.round(
                            (completedOnboarding.length / ONBOARDING_STEPS.length) * 100
                          )}%`,
                          background:
                            'linear-gradient(90deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
                        }}
                      />
                    </div>
                  </div>

                  {ONBOARDING_STEPS.map((step) => {
                    const done = completedOnboarding.includes(step.id);
                    return (
                      <div
                        key={step.id}
                        className={`rounded-xl border p-3 transition ${
                          done
                            ? 'border-[#0072FF]/40 bg-[#F5F0FF]/50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => toggleOnboardingStep(step.id)}
                            className="flex items-start gap-2 text-left"
                          >
                            <CheckCircle2
                              className={`mt-0.5 h-4 w-4 shrink-0 ${
                                done ? 'text-[#0072FF]' : 'text-slate-300'
                              }`}
                            />
                            <div>
                              <div className="text-xs font-extrabold text-[#0A2B6D]">
                                {step.title}
                              </div>
                              <p className="mt-0.5 text-[11px] font-medium text-slate-600">
                                {step.desc}
                              </p>
                            </div>
                          </button>
                          <Link
                            to={step.path}
                            onClick={() => {
                              if (!done) toggleOnboardingStep(step.id);
                              setDrawerMode(null);
                            }}
                            className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10.5px] font-extrabold text-[#0072FF] hover:border-[#0072FF]"
                          >
                            Open →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <Link
                    to="/user-guides"
                    onClick={() => setDrawerMode(null)}
                    className="block rounded-xl bg-[#F5F0FF] py-2 text-center text-xs font-extrabold text-[#5A00D6] hover:bg-[#EDE9FE]"
                  >
                    Open Full Platform User Guides &amp; Manuals →
                  </Link>
                </div>
              </div>
            ) : (
              /* AI Copilot Suite Panel */
              <div className="flex min-h-0 flex-1 flex-col justify-between p-4 space-y-4">
                <div className="space-y-3 overflow-y-auto">
                  <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#5A00D6]">
                      <Sparkles className="h-3.5 w-3.5 text-[#FF2E9A]" />
                      <span>Context-Aware AI Copilot · {currentLabel}</span>
                    </div>
                    <p className="text-[11px] font-medium text-[#0A2B6D]">
                      Choose an AI capability below to generate compliance insights, policy answers, executive reports, documents, or workflow recommendations.
                    </p>
                  </div>

                  {/* 5 AI Capability Mode Pills */}
                  <div className="flex flex-wrap gap-1">
                    {AI_COPILOT_MODES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setAiMode(m.id)}
                        className={`rounded-lg border px-2 py-1 text-[10.5px] font-extrabold transition ${
                          aiMode === m.id
                            ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white'
                            : 'border-slate-200 bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                      {activeAiModeObj.label} — Instant Actions
                    </div>
                    {activeAiModeObj.prompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleAiQuickSend(prompt)}
                        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2.5 text-left text-xs font-bold text-[#0A2B6D] shadow-2xs transition hover:border-[#0072FF] hover:bg-[#F5F0FF]"
                      >
                        <span>{prompt}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAiQuickSend(aiPrompt);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ask Infinity AI anything…"
                      className="h-9 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-xs font-extrabold text-white shadow-sm"
                      style={{
                        background:
                          'linear-gradient(120deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                      }}
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Ask</span>
                    </button>
                  </form>
                  <Link
                    to="/assistant"
                    onClick={() => setDrawerMode(null)}
                    className="block rounded-xl bg-[#F5F0FF] py-2 text-center text-xs font-extrabold text-[#5A00D6] hover:bg-[#EDE9FE]"
                  >
                    Open Full AI Assistant Studio →
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}