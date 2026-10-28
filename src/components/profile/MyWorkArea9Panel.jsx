import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  CalendarClock,
  ShieldCheck,
  Target,
  AlertOctagon,
  AlertTriangle,
  MessageSquare,
  GraduationCap,
  CalendarDays,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

const MY_WORK_STREAMS = [
  { id: 'tasks', label: 'My Tasks', icon: CheckSquare, href: '/tasks', color: '#0072FF' },
  { id: 'actions', label: 'My Actions', icon: CheckSquare, href: '/quality', color: '#0A2B6D' },
  { id: 'reviews', label: 'My Reviews', icon: CalendarClock, href: '/review-due', color: '#5A00D6' },
  { id: 'approvals', label: 'My Approvals', icon: ShieldCheck, href: '/compliance', color: '#0A2B6D' },
  { id: 'goals', label: 'My Goals', icon: Target, href: '/goals', color: '#A100FF' },
  { id: 'incidents', label: 'My Incidents', icon: AlertOctagon, href: '/incidents', color: '#FF2E9A' },
  { id: 'risks', label: 'My Risks', icon: AlertTriangle, href: '/risks', color: '#5A00D6' },
  { id: 'communications', label: 'My Communications', icon: MessageSquare, href: '/communications', color: '#0072FF' },
  { id: 'training', label: 'My Training', icon: GraduationCap, href: '/training', color: '#0A2B6D' },
  { id: 'schedule', label: 'My Schedule', icon: CalendarDays, href: '/roster', color: '#00C6FF' },
];

export default function MyWorkArea9Panel({ compact = false }) {
  const { user } = useAuth();
  const [activeStream, setActiveStream] = useState('tasks');
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    tasks: 0,
    reviews: 0,
    approvals: 0,
    goals: 0,
    incidents: 0,
    risks: 0,
    communications: 0,
    training: 0,
    schedule: 0,
  });
  const [items, setItems] = useState([]);

  const loadWorkArea = useCallback(async () => {
    setLoading(true);
    try {
      const [
        tasksPage,
        reviewsPage,
        submissionsPage,
        goalsPage,
        incidentsPage,
        risksPage,
        commsPage,
        trainingPage,
        shiftsPage,
      ] = await Promise.all([
        base44.entities.TodoTask.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.ParticipantReview.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.FormSubmission.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.Goal.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.Incident.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.Risk.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.CommunicationEntry.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.TrainingCompletion.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.Shift.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
      ]);

      const allTasks = tasksPage?.items || [];
      const streamData = {
        tasks: allTasks,
        actions: allTasks.filter((t) => t.status !== 'Completed' && t.status !== 'Finalised'),
        reviews: reviewsPage?.items || [],
        approvals: (submissionsPage?.items || []).filter(
          (s) => s.review_outcome === 'Pending Review' || s.status === 'Submitted'
        ),
        goals: goalsPage?.items || [],
        incidents: incidentsPage?.items || [],
        risks: risksPage?.items || [],
        communications: commsPage?.items || [],
        training: trainingPage?.items || [],
        schedule: shiftsPage?.items || [],
      };

      setCounts({
        tasks: streamData.tasks.length,
        actions: streamData.actions.length,
        reviews: streamData.reviews.length,
        approvals: streamData.approvals.length,
        goals: streamData.goals.length,
        incidents: streamData.incidents.length,
        risks: streamData.risks.length,
        communications: streamData.communications.length,
        training: streamData.training.length,
        schedule: streamData.schedule.length,
      });

      setItems(streamData[activeStream] || []);
    } finally {
      setLoading(false);
    }
  }, [activeStream]);

  useEffect(() => {
    loadWorkArea();
  }, [loadWorkArea]);

  const currentMeta = MY_WORK_STREAMS.find((s) => s.id === activeStream) || MY_WORK_STREAMS[0];

  return (
    <section
      aria-label="My Work Area — 9 Personalised Operational Streams"
      className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-sm space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
            Unified Personal Productivity Hub · Minimise Navigation
          </span>
          <h3 className="text-sm sm:text-base font-extrabold text-[#0A2B6D]">
            My Work Area — Tasks, Reviews, Approvals, Goals, Incidents, Risks, Communications, Training &amp; Schedule
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {user?.email && (
            <span className="rounded-full bg-[#F5F0FF] px-2.5 py-1 text-[10px] font-extrabold text-[#5A00D6]">
              {user.full_name || user.email}
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={loadWorkArea}
            disabled={loading}
            className="h-7 px-2.5 text-[11px] font-extrabold border-[#0A2B6D]"
          >
            <RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button
            size="sm"
            asChild
            className="h-7 px-2.5 text-[11px] font-extrabold bg-[#0A2B6D] text-white"
          >
            <Link to={currentMeta.href}>
              Open {currentMeta.label.replace('My ', '')} <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 9 STREAM TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {MY_WORK_STREAMS.map((stream) => {
          const Icon = stream.icon;
          const active = activeStream === stream.id;
          return (
            <button
              key={stream.id}
              type="button"
              onClick={() => setActiveStream(stream.id)}
              className={`flex flex-col items-start justify-between rounded-xl border-2 p-2.5 text-left transition ${
                active
                  ? 'border-[#0072FF] bg-[#0F172A] text-white shadow-sm'
                  : 'border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#00C6FF]' : 'text-[#5A00D6]'}`} />
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                    active ? 'bg-[#00C6FF] text-[#0A2B6D]' : 'bg-slate-100 text-[#0A2B6D]'
                  }`}
                >
                  {counts[stream.id] ?? 0}
                </span>
              </div>
              <span
                className={`mt-1.5 text-[11px] font-extrabold leading-tight ${
                  active ? 'text-white' : 'text-[#0A2B6D]'
                }`}
              >
                {stream.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE STREAM ITEMS */}
      {!compact && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-[#0A2B6D]">
              {currentMeta.label} ({items.length} active records)
            </span>
            <Link
              to={currentMeta.href}
              className="text-[11px] font-extrabold text-[#0072FF] hover:underline"
            >
              View full register →
            </Link>
          </div>
          {items.length === 0 ? (
            <p className="text-xs font-semibold text-slate-600 py-2">
              No pending items in {currentMeta.label}. Everything is up to date.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {items.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-[#0A2B6D]">
                      {item.title ||
                        item.form_title ||
                        item.subject ||
                        item.goal ||
                        item.participant_name ||
                        item.staff_name ||
                        'Operational Record'}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      {item.status || item.review_outcome || item.entry_kind || 'Active'} ·{' '}
                      {(item.due_date || item.date || item.created_date || '').slice(0, 10)}
                    </div>
                  </div>
                  <Link
                    to={currentMeta.href}
                    className="shrink-0 rounded-md bg-[#F5F0FF] px-2 py-1 text-[10px] font-extrabold text-[#5A00D6] hover:bg-[#EDE9FE]"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}