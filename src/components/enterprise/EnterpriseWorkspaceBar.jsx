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
  Search,
  Sun,
  Moon,
  Bot,
  Send,
  CheckCircle2,
  FileText,
} from 'lucide-react';

const AI_QUICK_PROMPTS = [
  'Summarise our NDIS Practice Standards audit readiness',
  'Check overdue tasks and expiring staff credentials',
  'Draft a participant progress note for a daily support shift',
  'Explain 24-hour vs 5-day NDIS reportable incident rules',
];

export default function EnterpriseWorkspaceBar({
  currentLabel,
  role,
  darkMode,
  onToggleDarkMode,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerMode, setDrawerMode] = useState(null); // 'activity' | 'ai' | null
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState('all');
  const [aiPrompt, setAiPrompt] = useState('');

  // Listen for custom events from Command Palette
  useEffect(() => {
    const onOpenActivity = () => setDrawerMode('activity');
    const onOpenAi = () => setDrawerMode('ai');
    window.addEventListener('chr-open-activity-drawer', onOpenActivity);
    window.addEventListener('chr-open-ai-drawer', onOpenAi);
    return () => {
      window.removeEventListener('chr-open-activity-drawer', onOpenActivity);
      window.removeEventListener('chr-open-ai-drawer', onOpenAi);
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

  const fetchAuditActivity = async () => {
    setLoadingLogs(true);
    try {
      const page = await base44.entities.AuditLog.list({
        sort: '-created_date',
        limit: 25,
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
    if (logFilter === 'all') return true;
    const action = (entry.action || '').toLowerCase();
    if (logFilter === 'views') return action === 'view';
    if (logFilter === 'changes') return action !== 'view';
    return true;
  });

  const handleAiQuickSend = (promptText) => {
    const q = (promptText || aiPrompt).trim();
    setDrawerMode(null);
    navigate(q ? `/assistant?q=${encodeURIComponent(q)}` : '/assistant');
  };

  return (
    <>
      <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-1.5 sm:px-6 lg:px-8">
          {/* Left: Interactive Enterprise Breadcrumbs */}
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
          </nav>

          {/* Right: Enterprise Action Strip (Command Palette, Activity & Audit Log, AI Assistant, Theme) */}
          <div className="flex flex-wrap items-center gap-1.5">
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

            <button
              type="button"
              onClick={() =>
                setDrawerMode((prev) => (prev === 'ai' ? null : 'ai'))
              }
              title="Open Infinity AI Assistant"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-extrabold text-white shadow-2xs transition hover:opacity-95"
              style={{
                background:
                  'linear-gradient(120deg, #0072FF 0%, #5A00D6 52%, #FF2E9A 100%)',
              }}
            >
              <Sparkles className="h-3 w-3 text-white" />
              <span>Ask AI</span>
            </button>

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

      {/* Slide-Over Enterprise Drawer: Live Activity Feed & Audit Logging OR AI Assistant */}
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
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
                <div>
                  <h2 className="text-sm font-extrabold text-white">
                    {drawerMode === 'activity'
                      ? 'Enterprise Activity & Audit Log'
                      : 'Infinity AI Copilot'}
                  </h2>
                  <p className="text-[11px] font-medium text-white/90">
                    {drawerMode === 'activity'
                      ? 'Real-time user actions, record updates & compliance trail'
                      : 'Instant NDIS compliance, rostering & document intelligence'}
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
                {/* Filter Tabs + Refresh */}
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
            ) : (
              /* AI Assistant Quick Panel */
              <div className="flex min-h-0 flex-1 flex-col justify-between p-4 space-y-4">
                <div className="space-y-3 overflow-y-auto">
                  <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#5A00D6]">
                      <Sparkles className="h-3.5 w-3.5 text-[#FF2E9A]" />
                      <span>Context-Aware AI Copilot</span>
                    </div>
                    <p className="text-xs font-medium text-[#0A2B6D]">
                      Currently viewing <strong>{currentLabel}</strong>. Select a quick compliance action below or ask any question to launch the full AI Assistant.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                      Recommended Prompts
                    </div>
                    {AI_QUICK_PROMPTS.map((prompt) => (
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