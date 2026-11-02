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

      {/* 11 ILLUMINATED MODULAR STREAM TILES (TOP 1/4 WHITE + BOTTOM 3/4 DARK BLUE) ON DARK BLUE CHASSIS */}
      <div
        className="preserve-island-theme grid grid-cols-1 gap-2 rounded-2xl border-2 border-[#0A2B6D] p-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-stretch"
        style={{
          background:
            'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        {MY_WORK_11_STREAMS.map((stream, idx) => {
          const Icon = stream.icon;
          const active = activeStream === stream.id;
          const iconColors = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];
          const iconColor = iconColors[idx % iconColors.length];
          return (
            <button
              key={stream.id}
              type="button"
              onClick={() => setActiveStream(stream.id)}
              className={`group flex min-h-[60px] flex-col rounded-2xl p-[2px] text-left transition-all duration-200 ${
                active
                  ? 'shadow-[0_0_20px_rgba(0,198,255,0.85)] scale-[1.01]'
                  : 'shadow-[0_0_12px_rgba(90,0,214,0.35)] hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(0,198,255,0.75)]'
              }`}
              style={{
                background:
                  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
              }}
            >
              <span
                className="flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[14px]"
                style={{
                  background:
                    'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
                }}
              >
                {/* Top 1/4 White Title Bar with App Design Colour Symbol */}
                <span className="flex min-h-[28px] w-full items-center justify-between gap-1 bg-white px-2.5 py-0.5">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#F5F0FF]"
                      style={{ border: `1.5px solid ${iconColor}` }}
                    >
                      <Icon className="h-3 w-3 shrink-0" style={{ color: iconColor }} />
                    </span>
                    <span
                      className="min-w-0 text-[9.5px] font-extrabold leading-tight text-[#0A2B6D]"
                      style={{ color: '#0A2B6D' }}
                    >
                      <span style={{ color: iconColor }}>◉</span> {stream.label}
                    </span>
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0 text-[7px] font-black uppercase ${
                      active ? 'bg-[#0A2B6D] text-[#00C6FF]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: active ? '#00C6FF' : iconColor,
                        boxShadow: active ? '0 0 8px 2px #00C6FF' : `0 0 5px 1px ${iconColor}`,
                      }}
                    />
                    {counts[stream.id] ?? 0}
                  </span>
                </span>

                {/* Bottom 3/4 Dark Blue Body */}
                <span className="flex flex-1 items-center justify-between gap-1 px-2.5 py-1">
                  <span
                    className="min-w-0 flex-1 text-[8.5px] font-bold leading-snug text-white"
                    style={{ color: '#FFFFFF' }}
                  >
                    {counts[stream.id] ?? 0} active items · 1-click view
                  </span>
                  <ArrowUpRight className="h-2.5 w-2.5 shrink-0" style={{ color: iconColor }} />
                </span>
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