import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessagesSquare,
  Mail,
  BellRing,
  ListTodo,
  Radio,
  Sparkles,
  Video,
  Inbox as InboxIcon,
  NotebookPen,
  Briefcase,
  CheckCircle2,
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
  { key: 'todo', label: 'Tasks', tab: 'todo', icon: ListTodo, color: '#0072FF' },
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
  const [methodStats, setMethodStats] = useState({
    messages: 0,
    notes: 0,
    banter: 0,
    broadcasts: 0,
  });

  const selectCommMethod = (tabKey) => {
    if (tabKey === 'todo' || tabKey === 'task-dashboard') {
      navigate('/tasks?tab=shared-todo');
    } else if (typeof onSelectTab === 'function') {
      onSelectTab(tabs.length && !tabs.some(([value]) => value === tabKey) ? tabs[0][0] : tabKey);
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

  return (
    <div
      className="w-full rounded-xl p-[2px] shadow-sm"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex flex-col gap-2 rounded-[9px] bg-[#16468A]/80 p-2.5 text-center text-white">
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
              Communication Board
            </span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-[#0A2B6D]/70 px-2 py-0.5 text-[10px] font-extrabold text-white">
              Last 7 days
            </span>

          </div>
        </div>

        {/* 2. Merged 7-Day Live Communication Method Counters (Messages, Shift Notes, Team Banter, Broadcasts) */}
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {LIVE_METHOD_TILES.filter(({ tab }) => !tabs.length || tabs.some(([value]) => value === tab)).map(({ key, label, tab, color, Icon }) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectCommMethod(tab)}
                className={`flex min-w-0 items-center gap-2 rounded-lg border p-2 text-left transition hover:-translate-y-0.5 ${
                  isSelected
                    ? 'border-[#00C6FF] bg-[#0A2B6D]/90 backdrop-blur-sm ring-1 ring-[#00C6FF]'
                    : 'border-white/15 bg-[#0A2B6D]/90 backdrop-blur-sm hover:border-[#00C6FF]/60'
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

        {/* Quick access to available mailbox and alert channels */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => selectCommMethod('inbox')}
            className="flex min-w-0 items-center justify-between gap-1 rounded-md border border-[#0A2B6D] px-2 py-1 text-white"
            style={{ background: 'linear-gradient(125deg, #FF2E9A 0%, #dc2626 55%, #A100FF 100%)' }}
          >
            <span className="inline-flex min-w-0 items-center gap-1 text-[10px] font-extrabold leading-tight text-white break-words">
              <Mail className="h-2.5 w-2.5 shrink-0 text-white" />
              <span>Alert Mailbox</span>
            </span>
            <span className="shrink-0 rounded-full bg-white px-1.5 py-0 text-[10px] font-extrabold text-[#0A2B6D]">
              {alertCount}
            </span>
          </button>

          {(!tabs.length || tabs.some(([value]) => value === 'alerts')) && <button
            type="button"
            onClick={() => selectCommMethod('alerts')}
            className="flex min-w-0 items-center justify-between gap-1 rounded-md border border-[#FF2E9A]/50 bg-[#0A2B6D]/90 backdrop-blur-sm px-2 py-1 text-[10px] font-extrabold leading-tight text-white transition hover:border-[#00C6FF]"
          >
            <span className="inline-flex min-w-0 items-center gap-1 break-words">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#EF4444]" style={{ boxShadow: '0 0 5px #EF4444' }} />
              <span>Unread Alerts</span>
            </span>
            <BellRing className="h-2.5 w-2.5 shrink-0 text-[#FF2E9A]" />
          </button>}

          {(!tabs.length || tabs.some(([value]) => value === 'logs')) && <button
            type="button"
            onClick={() => selectCommMethod('logs')}
            className="flex min-w-0 items-center justify-between gap-1 rounded-md border border-[#00C6FF]/50 bg-[#0A2B6D]/90 backdrop-blur-sm px-2 py-1 text-[10px] font-extrabold leading-tight text-white transition hover:border-[#FF2E9A]"
          >
            <span className="inline-flex min-w-0 items-center gap-1 break-words">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#10B981]" style={{ boxShadow: '0 0 5px #10B981' }} />
              <span>Auto Logs</span>
            </span>
            <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-[#00C6FF]" />
          </button>}
        </div>

        {/* 4. Merged Mini Comms Live Stream + 10 Quick-Press Communication Channels */}
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-12">
          {/* Left: Merged Mini Comms Live Feed */}
          <div className="xl:col-span-4 flex flex-col rounded-lg border border-white/15 bg-[#0A2B6D]/90 backdrop-blur-sm p-2 text-left">
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                Mini Comms Live Stream
              </span>
              <span className="text-[10px] font-bold text-slate-300">Click to open</span>
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
                      className="flex w-full items-center justify-between gap-1.5 rounded border border-white/15 bg-[#16468A]/80 px-1.5 py-1 text-left text-[11px] font-extrabold text-white transition hover:border-[#00C6FF]"
                    >
                      <span className="shrink-0 rounded-full bg-[#0072FF] px-1.5 py-0 text-[10px] text-white">
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
                  className="flex w-full items-center justify-between gap-1.5 rounded border border-white/15 bg-[#16468A]/80 px-1.5 py-1.5 text-left text-[11px] font-extrabold text-white transition hover:border-[#00C6FF]"
                >
                  <span className="shrink-0 rounded-full bg-[#0072FF] px-1.5 py-0 text-[10px] text-white">
                    Live Inbox
                  </span>
                  <span className="min-w-0 flex-1 leading-tight text-right text-white break-words">
                    No recent communications
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Unified Communication Method Channels */}
          <div className="xl:col-span-8 rounded-lg border border-white/15 bg-[#0A2B6D]/90 backdrop-blur-sm p-2">
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">
                Unified Communication Channels
              </span>
              <span className="text-[10px] font-extrabold text-[#00C6FF]">{channelItems.length} Channels</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-1.5">
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
                        : 'border-white/15 bg-[#16468A]/80'
                    }`}
                    style={{ borderTopWidth: '2.5px', borderTopColor: symColor }}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-white"
                      style={{ background: symColor }}
                    >
                      <SqIcon className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                    </span>
                    <span className="text-[10px] font-extrabold leading-tight text-white break-words">
                      {sq.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}