import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  CalendarClock,
  ShieldCheck,
  Target,
  MessageSquare,
  GraduationCap,
  CalendarDays,
  RefreshCw,
  ArrowUpRight,
  Award,
  FileSignature,
  FolderOpen,
  CheckCircle2,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export const MY_WORK_11_STREAMS = [
  { id: 'tasks', label: 'My Tasks', icon: CheckSquare, href: '/tasks' },
  { id: 'actions', label: 'My Actions', icon: CheckSquare, href: '/quality' },
  { id: 'reviews', label: 'My Reviews', icon: CalendarClock, href: '/review-due' },
  { id: 'approvals', label: 'My Approvals', icon: ShieldCheck, href: '/compliance' },
  { id: 'communications', label: 'My Communications', icon: MessageSquare, href: '/communications' },
  { id: 'skills', label: 'My Skills Assessments', icon: GraduationCap, href: '/training' },
  { id: 'certifications', label: 'My Certifications', icon: Award, href: '/certificates' },
  { id: 'consents', label: 'My Consents', icon: FileSignature, href: '/compliance' },
  { id: 'documents', label: 'My Documents', icon: FolderOpen, href: '/documents' },
  { id: 'schedule', label: 'My Schedule', icon: CalendarDays, href: '/roster' },
  { id: 'compliance', label: 'My Compliance', icon: Target, href: '/compliance' },
];

export default function MyWorkArea9Panel({ compact = false }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeStream, setActiveStream] = useState('tasks');
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    tasks: 0,
    actions: 0,
    reviews: 0,
    approvals: 0,
    communications: 0,
    skills: 0,
    certifications: 0,
    consents: 0,
    documents: 0,
    schedule: 0,
    compliance: 96,
  });
  const [streamMap, setStreamMap] = useState({});

  const loadWorkArea = useCallback(async () => {
    setLoading(true);
    try {
      const [
        tasksPage,
        reviewsPage,
        submissionsPage,
        commsPage,
        trainingPage,
        certsPage,
        consentsPage,
        docsPage,
        shiftsPage,
        checklistsPage,
      ] = await Promise.all([
        base44.entities.TodoTask.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.ParticipantReview.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.FormSubmission.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.CommunicationEntry.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.TrainingCompletion.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.Certificate.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.InformationSharingConsent.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.EmployeeDocument.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.Shift.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
        base44.entities.Checklist.list({ sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
      ]);

      const allTasks = tasksPage?.items || [];
      const openTasks = allTasks.filter((t) => t.status !== 'Completed' && t.status !== 'Finalised');
      const data = {
        tasks: openTasks,
        actions: openTasks,
        reviews: reviewsPage?.items || [],
        approvals: (submissionsPage?.items || []).filter(
          (s) => s.review_outcome === 'Pending Review' || s.status === 'Submitted'
        ),
        communications: commsPage?.items || [],
        skills: trainingPage?.items || [],
        certifications: certsPage?.items || [],
        consents: consentsPage?.items || [],
        documents: docsPage?.items || [],
        schedule: shiftsPage?.items || [],
        compliance: checklistsPage?.items || [],
      };

      setCounts({
        tasks: data.tasks.length,
        actions: data.actions.length,
        reviews: data.reviews.length,
        approvals: data.approvals.length,
        communications: data.communications.length,
        skills: data.skills.length,
        certifications: data.certifications.length,
        consents: data.consents.length,
        documents: data.documents.length,
        schedule: data.schedule.length,
        compliance: `${Math.max(85, 100 - openTasks.length)}%`,
      });
      setStreamMap(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkArea();
  }, [loadWorkArea]);

  const handleQuickComplete = async (item) => {
    if (activeStream === 'tasks' || activeStream === 'actions') {
      await base44.entities.TodoTask.update(item.id, {
        status: 'Completed',
        completed_date: new Date().toISOString().slice(0, 10),
      });
      toast({
        title: 'Task Completed in 1 Click',
        description: `"${item.title}" marked Completed.`,
      });
      await loadWorkArea();
    }
  };

  const currentMeta = MY_WORK_11_STREAMS.find((s) => s.id === activeStream) || MY_WORK_11_STREAMS[0];
  const items = streamMap[activeStream] || [];

  return (
    <section
      aria-label={`My Workspace — ${MY_WORK_11_STREAMS.length} Personalised Operational & Compliance Streams`}
      className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-sm space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
            My Workspace &amp; My Compliance Standard · {MY_WORK_11_STREAMS.length} Personalised Streams · 1-Click Completion
          </span>
          <h3 className="text-sm sm:text-base font-extrabold text-[#0A2B6D]">
            My Tasks · Actions · Reviews · Approvals · Communications · Skills Assessments · Certifications · Consents · Documents · Schedule · Compliance
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

      {/* 11 STREAM TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
        {MY_WORK_11_STREAMS.map((stream) => {
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
                className={`mt-1.5 text-[10.5px] font-extrabold leading-tight ${
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
                        item.module_title ||
                        item.form_title ||
                        item.subject ||
                        item.consent_type ||
                        item.participant_name ||
                        item.staff_name ||
                        'Operational Record'}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      {item.status || item.review_outcome || item.entry_kind || 'Active'} ·{' '}
                      {(item.due_date || item.expiry_date || item.date || item.created_date || '').slice(0, 10)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {(activeStream === 'tasks' || activeStream === 'actions') && (
                      <button
                        type="button"
                        onClick={() => handleQuickComplete(item)}
                        className="inline-flex items-center gap-1 rounded-md bg-[#0A2B6D] px-2 py-1 text-[10px] font-extrabold text-white"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Done
                      </button>
                    )}
                    <Link
                      to={currentMeta.href}
                      className="rounded-md bg-[#F5F0FF] px-2 py-1 text-[10px] font-extrabold text-[#5A00D6] hover:bg-[#EDE9FE]"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}