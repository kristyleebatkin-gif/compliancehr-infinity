import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessagesSquare,
  Mail,
  BellRing,
  ListTodo,
  LayoutDashboard,
  Radio,
  Sparkles,
  Video,
  Inbox as InboxIcon,
  NotebookPen,
  Briefcase,
  CheckCircle2,
  Plus,
  ArrowRight,
  MessageSquare,
  StickyNote,
  PartyPopper,
  Megaphone,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getHeaderView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const LIVE_METHOD_TILES = [
  { key: 'messages', label: 'Messages', tab: 'inbox', color: '#0072FF', Icon: MessageSquare, kind: 'Message' },
  { key: 'notes', label: 'Shift Notes', tab: 'shift-notes', color: '#A855F7', Icon: StickyNote, kind: 'Shift Note' },
  { key: 'banter', label: 'Team Banter', tab: 'banter', color: '#FF2E9A', Icon: PartyPopper, kind: 'Team Banter' },
  { key: 'broadcasts', label: 'Broadcasts', tab: 'bulk', color: '#0072FF', Icon: Megaphone, kind: 'Broadcast' },
];

const MINI_COMM_SQUARES = [
  { key: 'tasks', label: 'Tasks', tab: 'todo', icon: LayoutDashboard, color: '#0072FF' },
  { key: 'todo', label: 'To-Do', tab: 'todo', icon: ListTodo, color: '#0A2B6D' },
  { key: 'feed', label: 'Feed', tab: 'feed', icon: Radio, color: '#A100FF' },
  { key: 'banter', label: 'Banter', tab: 'banter', icon: MessagesSquare, color: '#FF2E9A' },
  { key: 'shoutouts', label: 'Shoutouts', tab: 'shoutouts', icon: Sparkles, color: '#5A00D6' },
  { key: 'video', label: 'Video', tab: 'video', icon: Video, color: '#0072FF' },
  { key: 'inbox', label: 'Inbox', tab: 'inbox', icon: InboxIcon, color: '#A100FF' },
  { key: 'email', label: 'Email', tab: 'email', icon: Mail, color: '#FF2E9A' },
  { key: 'notes', label: 'Shift Notes', tab: 'shift-notes', icon: NotebookPen, color: '#5A00D6' },
  { key: 'log', label: 'Staff Log', tab: 'employee-log', icon: Briefcase, color: '#0A2B6D' },
];

function resolveEntryTab(entryKind = '') {
  const lower = String(entryKind).toLowerCase();
  if (lower.includes('shift')) return 'shift-notes';
  if (lower.includes('banter')) return 'banter';
  if (lower.includes('broadcast') || lower.includes('bulk')) return 'bulk';
  if (lower.includes('email')) return 'email';
  return 'inbox';
}

export default function MiniCommunicationCentrePanel({
  alertCount = 0,
  recentComms = [],
  onSelectTab,
  activeTab,
  tabs = [],
}) {
  const channelItems =
    Array.isArray(tabs) && tabs.length > 0
      ? tabs.map(([value, Icon, label]) => ({
          key: value,
          label,
          tab: value,
          icon: Icon || MessagesSquare,
        }))
      : MINI_COMM_SQUARES;
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [methodStats, setMethodStats] = useState({
    messages: 0,
    notes: 0,
    banter: 0,
    broadcasts: 0,
  });

  const selectCommMethod = (tabKey) => {
    if (typeof onSelectTab === 'function') {
      onSelectTab(tabKey);
    } else {
      navigate('/communications');
    }
  };

  useEffect(() => {
    let active = true;
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    Promise.all(
      LIVE_METHOD_TILES.map(({ kind }) =>
        base44.entities.CommunicationEntry.count({ entry_kind: kind, entry_date: { $gte: weekAgo } }).catch(() => 0)
      )
    ).then((counts) => {
      if (!active) return;
      const next = {};
      LIVE_METHOD_TILES.forEach(({ key }, i) => {
        next[key] = counts[i] || 0;
      });
      setMethodStats(next);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadTodos = () => {
      base44.entities.TodoTask.filter(
        { status: { $in: ['Pending', 'Open', 'In Progress'] } },
        { sort: '-created_date', limit: 4 }
      )
        .then((page) => {
          if (!active) return;
          setTodos(
            (page?.items || []).slice(0, 4).map((t) => ({
              id: t.id,
              title: t.title,
              module: t.module || 'Team',
              status: t.status || 'Open',
            }))
          );
        })
        .catch(() => {
          if (active) setTodos([]);
        });
    };
    loadTodos();
    const unsub = base44.entities.TodoTask.subscribe(() => loadTodos());
    return () => {
      active = false;
      unsub();
    };
  }, []);

  const handleAddSmallTodo = async () => {
    const clean = newTodoText.trim();
    if (!clean) return;
    const optimistic = {
      id: `local-${Date.now()}`,
      title: clean,
      module: 'Shared',
      status: 'Pending',
    };
    setTodos((prev) => [optimistic, ...prev.slice(0, 3)]);
    setNewTodoText('');
    try {
      await base44.entities.TodoTask.create({
        title: clean,
        status: 'Pending',
        priority: 'Medium',
        module: 'Communications',
        task_date: new Date().toISOString().slice(0, 10),
      });
    } catch {
      // Keep local preview item if guest
    }
  };

  const handleCompleteTodo = async (item) => {
    setTodos((prev) => prev.filter((t) => t.id !== item.id));
    if (!String(item.id).startsWith('local-') && !String(item.id).startsWith('st-')) {
      try {
        await base44.entities.TodoTask.update(item.id, { status: 'Completed' });
      } catch {
        // Ignore guest error
      }
    }
  };

  return (
    <div
      className="h-full rounded-xl p-[3px] shadow-sm"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex h-full flex-col justify-between gap-2 rounded-[9px] bg-[#162235] p-2 text-center text-white">
        {/* 1. Merged Mini Comms + Mini Communication Centre + Live Methods Header */}
        <div
          className="gradient-brand flex flex-wrap items-center justify-between gap-1.5 rounded-lg px-2.5 py-1 text-white"
          style={{ background: getHeaderView(1), color: '#FFFFFF' }}
        >
          <span
            className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white"
            style={{ color: '#FFFFFF' }}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-white"
              style={{ boxShadow: '0 0 8px 2px #FFFFFF' }}
            />
            <MessagesSquare className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
            <span style={{ color: '#FFFFFF' }}>
              Merged Mini Comms &amp; Communication Centre
            </span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-black/30 px-2 py-0.5 text-[7.5px] font-extrabold text-white">
              27 Oct · 24°C · 7-Day Live
            </span>
            <button
              type="button"
              onClick={() => selectCommMethod('inbox')}
              className="inline-flex items-center gap-0.5 rounded-full bg-white px-2 py-0.5 text-[7.5px] font-extrabold text-[#0A2B6D]"
            >
              <span>Open Inbox</span>
              <ArrowRight className="h-2 w-2 text-[#0A2B6D]" />
            </button>
          </div>
        </div>

        {/* 2. Merged 7-Day Live Communication Method Counters (Messages, Shift Notes, Team Banter, Broadcasts) */}
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {LIVE_METHOD_TILES.map(({ key, label, tab, color, Icon }) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectCommMethod(tab)}
                className={`flex min-w-0 items-center gap-2 rounded-lg border p-2 text-left transition hover:-translate-y-0.5 ${
                  isSelected
                    ? 'border-[#00C6FF] bg-[#081018] ring-1 ring-[#00C6FF]'
                    : 'border-white/15 bg-[#081018] hover:border-[#00C6FF]/60'
                }`}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white"
                  style={{ backgroundColor: color }}
                >
                  <Icon className="h-3.5 w-3.5 text-white" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-extrabold leading-tight text-white">
                    {methodStats[key]}
                  </p>
                  <p className="text-[9.5px] font-bold leading-tight text-slate-300 break-words">
                    {label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* 3. Alert Mailbox, Unread Alerts & Auto Logs Row — Linked to Active Communication Method */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => selectCommMethod('inbox')}
            className="flex min-w-0 items-center justify-between gap-1 rounded-md border border-[#0A2B6D] px-2 py-1 text-white"
            style={{ background: 'linear-gradient(125deg, #FF2E9A 0%, #dc2626 55%, #A100FF 100%)' }}
          >
            <span className="inline-flex min-w-0 items-center gap-1 text-[7.5px] font-extrabold leading-tight text-white break-words">
              <Mail className="h-2.5 w-2.5 shrink-0 text-white" />
              <span>Alert Mailbox</span>
            </span>
            <span className="shrink-0 rounded-full bg-white px-1.5 py-0 text-[7px] font-extrabold text-[#0A2B6D]">
              {alertCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => selectCommMethod('alerts')}
            className="flex min-w-0 items-center justify-between gap-1 rounded-md border border-[#FF2E9A]/50 bg-[#081018] px-2 py-1 text-[7.5px] font-extrabold leading-tight text-white transition hover:border-[#00C6FF]"
          >
            <span className="inline-flex min-w-0 items-center gap-1 break-words">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#EF4444]" style={{ boxShadow: '0 0 5px #EF4444' }} />
              <span>Unread Alerts</span>
            </span>
            <BellRing className="h-2.5 w-2.5 shrink-0 text-[#FF2E9A]" />
          </button>

          <button
            type="button"
            onClick={() => selectCommMethod('logs')}
            className="flex min-w-0 items-center justify-between gap-1 rounded-md border border-[#00C6FF]/50 bg-[#081018] px-2 py-1 text-[7.5px] font-extrabold leading-tight text-white transition hover:border-[#FF2E9A]"
          >
            <span className="inline-flex min-w-0 items-center gap-1 break-words">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#10B981]" style={{ boxShadow: '0 0 5px #10B981' }} />
              <span>Auto Logs</span>
            </span>
            <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-[#00C6FF]" />
          </button>
        </div>

        {/* 4. Merged Mini Comms Live Stream + 10 Quick-Press Communication Channels */}
        <div className="grid grid-cols-1 gap-1.5 xl:grid-cols-12">
          {/* Left: Merged Mini Comms Live Feed */}
          <div className="xl:col-span-5 flex flex-col justify-between rounded-lg border border-white/15 bg-[#081018] p-1.5 text-left">
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-[7px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                Mini Comms Live Stream
              </span>
              <span className="text-[7px] font-bold text-slate-300">Click to open</span>
            </div>
            <div className="space-y-1">
              {recentComms.length > 0 ? (
                recentComms.slice(0, 3).map((msg) => {
                  const targetTab = resolveEntryTab(msg.entry_kind);
                  return (
                    <button
                      key={msg.id}
                      type="button"
                      onClick={() => selectCommMethod(targetTab)}
                      className="flex w-full items-center justify-between gap-1.5 rounded border border-white/15 bg-[#162235] px-1.5 py-1 text-left text-[8px] font-extrabold text-white transition hover:border-[#00C6FF]"
                    >
                      <span className="shrink-0 rounded-full bg-[#0072FF] px-1.5 py-0 text-[6.5px] text-white">
                        {msg.entry_kind || 'Comms'}
                      </span>
                      <span className="min-w-0 flex-1 leading-tight text-right text-white break-words">
                        {msg.subject || msg.body || 'New communication'}
                      </span>
                    </button>
                  );
                })
              ) : (
                <button
                  type="button"
                  onClick={() => selectCommMethod('inbox')}
                  className="flex w-full items-center justify-between gap-1.5 rounded border border-white/15 bg-[#162235] px-1.5 py-1.5 text-left text-[8px] font-extrabold text-white transition hover:border-[#00C6FF]"
                >
                  <span className="shrink-0 rounded-full bg-[#0072FF] px-1.5 py-0 text-[6.5px] text-white">
                    Live Inbox
                  </span>
                  <span className="min-w-0 flex-1 leading-tight text-right text-white break-words">
                    No unread communications · 8:30 AM daily summary active
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Unified Communication Method Channels */}
          <div className="xl:col-span-7 rounded-lg border border-white/15 bg-[#081018] p-1.5">
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-[7px] font-extrabold uppercase tracking-wider text-white">
                Unified Communication Channels
              </span>
              <span className="text-[7px] font-extrabold text-[#00C6FF]">{channelItems.length} Channels</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1">
              {channelItems.map((sq, idx) => {
                const SqIcon = sq.icon;
                const seqColors = ['#0072FF', '#A855F7', '#FF2E9A'];
                const symColor = seqColors[idx % seqColors.length];
                const isSelected = activeTab === sq.tab;
                return (
                  <button
                    key={sq.key}
                    type="button"
                    onClick={() => selectCommMethod(sq.tab)}
                    className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded border p-1 text-center transition-transform hover:-translate-y-0.5 ${
                      isSelected
                        ? 'border-[#00C6FF] bg-[#0A2B6D]/60 ring-1 ring-[#00C6FF]'
                        : 'border-white/15 bg-[#162235]'
                    }`}
                    style={{ borderTopWidth: '2.5px', borderTopColor: symColor }}
                  >
                    <span
                      className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded text-white"
                      style={{ background: symColor }}
                    >
                      <SqIcon className="h-2 w-2 text-white" style={{ color: '#FFFFFF' }} />
                    </span>
                    <span className="text-[7px] font-extrabold leading-tight text-white break-words">
                      {sq.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. Small Shared To-Do List Inside Merged Communication Centre */}
        <div className="flex w-full flex-col justify-between gap-1 rounded-lg border border-white/15 bg-[#081018] p-1.5 text-left text-white">
          <div
            className="gradient-brand flex items-center justify-between gap-1 rounded px-2 py-0.5 text-white"
            style={{ background: getHeaderView(4), color: '#FFFFFF' }}
          >
            <span
              className="inline-flex items-center gap-1 text-[7.5px] font-extrabold uppercase tracking-wider text-white"
              style={{ color: '#FFFFFF' }}
            >
              <ListTodo className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF' }}>Small Shared To-Do List</span>
            </span>
            {typeof onSelectTab === 'function' ? (
              <button
                type="button"
                onClick={() => selectCommMethod('todo')}
                className="rounded-full bg-white px-1.5 py-0 text-[6.5px] font-extrabold text-[#0A2B6D]"
              >
                Full Board →
              </button>
            ) : (
              <Link
                to="/shared-to-do"
                className="rounded-full bg-white px-1.5 py-0 text-[6.5px] font-extrabold text-[#0A2B6D]"
              >
                Full Board →
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSmallTodo();
              }}
              placeholder="Quick add shared to-do…"
              className="min-w-0 flex-1 rounded border border-white/25 bg-[#162235] px-1.5 py-0.5 text-[7.5px] font-extrabold text-white placeholder:text-slate-400 focus:border-[#00C6FF] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSmallTodo}
              className="gradient-brand inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[7px] font-extrabold text-white"
              style={{ background: getHeaderView(2), color: '#FFFFFF' }}
            >
              <Plus className="h-2 w-2 text-white" style={{ color: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF' }}>Add</span>
            </button>
          </div>

          <div className="space-y-0.5">
            {todos.length === 0 && (
              <div className="rounded border border-white/15 bg-[#162235] px-1.5 py-1 text-[7.5px] font-extrabold text-white">
                No open shared to-do tasks — add a task above to dispatch in real time.
              </div>
            )}
            {todos.slice(0, 3).map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-1 rounded border border-white/15 bg-[#162235] px-1.5 py-0.5 text-[7.5px] font-extrabold text-white"
              >
                <button
                  type="button"
                  onClick={() => handleCompleteTodo(item)}
                  title="Mark shared task done"
                  className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-white/40 bg-[#081018] text-[#00C6FF] hover:bg-[#0072FF] hover:text-white"
                >
                  <CheckCircle2 className="h-2 w-2" />
                </button>
                <span className="min-w-0 flex-1 leading-tight text-left text-white break-words">
                  {item.title}
                </span>
                <span
                  className="shrink-0 rounded px-1 py-0 text-[6.5px] font-extrabold text-white"
                  style={{ background: getHeaderView(idx) }}
                >
                  {item.module}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}