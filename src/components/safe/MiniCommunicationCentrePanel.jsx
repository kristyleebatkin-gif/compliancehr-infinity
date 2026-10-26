import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getHeaderView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const UNIFORM_SPRAY_BG =
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.65) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.65) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.65) 0%, transparent 52%), #FFFFFF';

const MINI_COMM_SQUARES = [
  { key: 'tasks', label: 'Tasks', icon: LayoutDashboard, color: '#0072FF' },
  { key: 'todo', label: 'To-Do', icon: ListTodo, color: '#0A2B6D' },
  { key: 'feed', label: 'Feed', icon: Radio, color: '#A100FF' },
  { key: 'banter', label: 'Banter', icon: MessagesSquare, color: '#FF2E9A' },
  { key: 'shoutouts', label: 'Shoutouts', icon: Sparkles, color: '#5A00D6' },
  { key: 'video', label: 'Video', icon: Video, color: '#0072FF' },
  { key: 'inbox', label: 'Inbox', icon: InboxIcon, color: '#A100FF' },
  { key: 'email', label: 'Email', icon: Mail, color: '#FF2E9A' },
  { key: 'notes', label: 'Shift Notes', icon: NotebookPen, color: '#5A00D6' },
  { key: 'log', label: 'Staff Log', icon: Briefcase, color: '#0A2B6D' },
];

const DEFAULT_SMALL_TODOS = [
  { id: 'st-1', title: 'Sign off morning SIL shift handover note', module: 'Comms', status: 'Pending' },
  { id: 'st-2', title: 'Verify 10-weekly participant progress copy', module: 'Participants', status: 'In Progress' },
  { id: 'st-3', title: 'Confirm NDIS worker screening renewal check', module: 'HR', status: 'Open' },
];

export default function MiniCommunicationCentrePanel({ alertCount = 3 }) {
  const [todos, setTodos] = useState(DEFAULT_SMALL_TODOS);
  const [newTodoText, setNewTodoText] = useState('');

  useEffect(() => {
    let active = true;
    base44.entities.TodoTask.filter(
      { status: { $in: ['Pending', 'Open', 'In Progress'] } },
      { sort: '-created_date', limit: 4 }
    )
      .then((page) => {
        if (active && page?.items?.length > 0) {
          setTodos(
            page.items.slice(0, 4).map((t) => ({
              id: t.id,
              title: t.title,
              module: t.module || 'Team',
              status: t.status || 'Open',
            }))
          );
        }
      })
      .catch(() => {});
    return () => {
      active = false;
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
      <div
        className="flex h-full flex-col justify-between gap-1.5 rounded-[9px] p-1.5 text-center"
        style={{ background: UNIFORM_SPRAY_BG }}
      >
        {/* 1. Mini Communication Centre App-Coloured Header */}
        <div
          className="gradient-brand flex items-center justify-between gap-1 rounded-lg px-2 py-1 text-white"
          style={{ background: getHeaderView(1), color: '#FFFFFF' }}
        >
          <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider text-white" style={{ color: '#FFFFFF' }}>
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-white"
              style={{ boxShadow: '0 0 8px 2px #FFFFFF' }}
            />
            <MessagesSquare className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
            <span style={{ color: '#FFFFFF' }}>Mini Communication Centre</span>
          </span>
          <Link
            to="/communications"
            className="inline-flex items-center gap-0.5 rounded-full bg-white px-1.5 py-0 text-[7px] font-extrabold text-[#0A2B6D]"
          >
            <span>Open Hub</span>
            <ArrowRight className="h-2 w-2 text-[#0A2B6D]" />
          </Link>
        </div>

        {/* 2. Mini Alert Mailbox & Alert Lamps Row (Just Like Communication Centre) */}
        <div className="grid grid-cols-3 gap-1">
          <Link
            to="/communications"
            className="flex items-center justify-between gap-1 rounded-md border border-[#0A2B6D] px-1.5 py-1 text-white"
            style={{ background: 'linear-gradient(125deg, #FF2E9A 0%, #dc2626 55%, #A100FF 100%)' }}
          >
            <span className="inline-flex items-center gap-1 text-[7px] font-extrabold text-white" style={{ color: '#FFFFFF' }}>
              <Mail className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF' }}>Alert Mailbox</span>
            </span>
            <span className="rounded-full bg-white px-1 py-0 text-[6.5px] font-extrabold text-[#0A2B6D]">
              {alertCount}
            </span>
          </Link>

          <Link
            to="/communications"
            className="flex items-center justify-between gap-1 rounded-md border border-[#0A2B6D]/30 bg-white px-1.5 py-1 text-[7px] font-extrabold text-[#0A2B6D]"
          >
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#EF4444]" style={{ boxShadow: '0 0 5px #EF4444' }} />
              <span>Unread Alerts</span>
            </span>
            <BellRing className="h-2.5 w-2.5 text-[#FF2E9A]" />
          </Link>

          <Link
            to="/communications"
            className="flex items-center justify-between gap-1 rounded-md border border-[#0A2B6D]/30 bg-white px-1.5 py-1 text-[7px] font-extrabold text-[#0A2B6D]"
          >
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" style={{ boxShadow: '0 0 5px #10B981' }} />
              <span>Auto Logs</span>
            </span>
            <CheckCircle2 className="h-2.5 w-2.5 text-[#0072FF]" />
          </Link>
        </div>

        {/* 3. Mini Quick-Press Communication Function Squares (Like in CommunicationNavigation) */}
        <div
          className="w-full rounded-lg p-[1.5px]"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="rounded-[6px] bg-white p-1">
            <div className="mb-0.5 flex items-center justify-between px-1">
              <span className="text-[6.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Communication Function Squares
              </span>
              <span className="text-[6.5px] font-extrabold text-[#5A00D6]">10 Channels</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {MINI_COMM_SQUARES.map((sq) => {
                const SqIcon = sq.icon;
                return (
                  <Link
                    key={sq.key}
                    to="/communications"
                    className="flex flex-col items-center justify-center gap-0.5 rounded border border-[#0A2B6D]/30 bg-white p-0.5 text-center transition-transform hover:-translate-y-0.5"
                    style={{ borderTopWidth: '2.5px', borderTopColor: sq.color }}
                  >
                    <span
                      className="flex h-3.5 w-3.5 items-center justify-center rounded text-white"
                      style={{ background: sq.color }}
                    >
                      <SqIcon className="h-2 w-2 text-white" style={{ color: '#FFFFFF' }} />
                    </span>
                    <span className="text-[6.5px] font-extrabold leading-none text-[#0A2B6D]">
                      {sq.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Small Shared To-Do List Inside Mini Communication Centre */}
        <div
          className="w-full flex-1 rounded-lg p-[1.5px]"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex h-full flex-col justify-between gap-1 rounded-[6px] bg-white p-1.5 text-left">
            <div
              className="gradient-brand flex items-center justify-between gap-1 rounded px-2 py-0.5 text-white"
              style={{ background: getHeaderView(4), color: '#FFFFFF' }}
            >
              <span className="inline-flex items-center gap-1 text-[7.5px] font-extrabold uppercase tracking-wider text-white" style={{ color: '#FFFFFF' }}>
                <ListTodo className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                <span style={{ color: '#FFFFFF' }}>Small Shared To-Do List</span>
              </span>
              <Link
                to="/shared-to-do"
                className="rounded-full bg-white px-1.5 py-0 text-[6.5px] font-extrabold text-[#0A2B6D]"
              >
                Full Board →
              </Link>
            </div>

            {/* Compact Quick-Add Shared To-Do Input */}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSmallTodo();
                }}
                placeholder="Quick add shared to-do…"
                className="min-w-0 flex-1 rounded border border-[#0A2B6D]/30 bg-white px-1.5 py-0.5 text-[7.5px] font-extrabold text-[#0A2B6D] placeholder:text-[#0A2B6D]/60 focus:outline-none"
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

            {/* Compact Shared To-Do Items */}
            <div className="space-y-0.5">
              {todos.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-1 rounded border border-[#0A2B6D]/20 bg-[#F5F0FF]/55 px-1.5 py-0.5 text-[7.5px] font-extrabold text-[#0A2B6D]"
                >
                  <button
                    type="button"
                    onClick={() => handleCompleteTodo(item)}
                    title="Mark shared task done"
                    className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] bg-white text-[#0072FF] hover:bg-[#0072FF] hover:text-white"
                  >
                    <CheckCircle2 className="h-2 w-2" />
                  </button>
                  <span className="min-w-0 flex-1 truncate text-left text-[#0A2B6D]">
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
    </div>
  );
}