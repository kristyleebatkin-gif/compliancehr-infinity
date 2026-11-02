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

  const APP_BORDER_GRADIENT =
    'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

  return (
    <section
      aria-label={`My Workspace — ${MY_WORK_11_STREAMS.length} Personalised Operational & Compliance Streams`}
      className="preserve-island-theme rounded-2xl p-[3px] shadow-md"
      style={{ background: APP_BORDER_GRADIENT }}
    >
      <div className="rounded-[13px] bg-white p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Main Header Inside White Section: App Design Coloured Border + White Background + Dark Blue -> App Colour Writing */}
          <div
            className="rounded-2xl p-[2px] shadow-2xs"
            style={{ background: APP_BORDER_GRADIENT }}
          >
            <div className="rounded-[14px] bg-white px-3.5 py-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                <CheckSquare className="h-3.5 w-3.5 text-[#0072FF]" />
                <span>
                  My Workspace &amp; My Compliance Standard · {MY_WORK_11_STREAMS.length} Personalised Streams · 1-Click Completion
                </span>
              </div>
              <h3
                className="mt-0.5 text-sm sm:text-base font-extrabold text-[#0A2B6D]"
                style={{ color: '#0A2B6D' }}
              >
                <span style={{ color: '#0072FF' }}>◉</span> My Tasks · Actions · Reviews · Approvals · Communications · Skills · Certifications · Consents · Documents · Schedule · Compliance
              </h3>
            </div>
          </div>

          {/* Small Header Tiles with App Design Coloured Gradient Borders on White */}
          <div className="flex flex-wrap items-center gap-1.5">
            {user?.email && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-[#0A2B6D]"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                }}
              >
                <span style={{ color: '#5A00D6' }}>◉</span>
                <span style={{ color: '#0A2B6D' }}>{user.full_name || user.email}</span>
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={loadWorkArea}
              disabled={loading}
              className="h-7 rounded-full px-3 text-[11px] font-extrabold text-[#0A2B6D] hover:opacity-90"
              style={{
                border: '2px solid transparent',
                background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                color: '#0A2B6D',
              }}
            >
              <RefreshCw className={`mr-1 h-3 w-3 text-[#0072FF] ${loading ? 'animate-spin' : ''}`} />
              <span style={{ color: '#0A2B6D' }}>Sync</span>
            </Button>
            <Button
              size="sm"
              asChild
              className="h-7 rounded-full px-3 text-[11px] font-extrabold text-white"
              style={{ background: APP_BORDER_GRADIENT }}
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
                      className="min-w-0 bg-clip-text text-[10px] font-extrabold leading-tight text-transparent"
                      style={{
                        backgroundImage:
                          'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)',
                      }}
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

      {/* ACTIVE STREAM ITEMS (Every Word Box in White Section Has an App Design Coloured Border) */}
      {!compact && (
        <div
          className="rounded-2xl p-[2px]"
          style={{ background: APP_BORDER_GRADIENT }}
        >
          <div className="rounded-[14px] bg-white p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-extrabold text-[#0A2B6D]"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                }}
              >
                <span style={{ color: '#0072FF' }}>◉</span>
                <span style={{ color: '#0A2B6D' }}>
                  {currentMeta.label} ({items.length} active records)
                </span>
              </span>
              <Link
                to={currentMeta.href}
                className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[11px] font-extrabold text-[#0A2B6D] hover:opacity-90"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                  color: '#0A2B6D',
                }}
              >
                <span style={{ color: '#5A00D6' }}>◉</span>
                <span>View full register →</span>
              </Link>
            </div>
            {items.length === 0 ? (
              <div
                className="rounded-xl px-3 py-2 text-xs font-bold text-[#0A2B6D]"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                }}
              >
                <span style={{ color: '#0072FF' }}>◉</span> No pending items in {currentMeta.label}. Everything is up to date.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {items.slice(0, 6).map((item, rIdx) => {
                  const bCols = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF'];
                  const bCol = bCols[rIdx % bCols.length];
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs"
                      style={{
                        border: '2px solid transparent',
                        background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                      }}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#0A2B6D]" style={{ color: '#0A2B6D' }}>
                          <span style={{ color: bCol }}>◉</span>{' '}
                          {item.title ||
                            item.module_title ||
                            item.form_title ||
                            item.subject ||
                            item.consent_type ||
                            item.participant_name ||
                            item.staff_name ||
                            'Operational Record'}
                        </div>
                        <div className="text-[10px] font-bold text-[#5A00D6]">
                          {item.status || item.review_outcome || item.entry_kind || 'Active'} ·{' '}
                          {(item.due_date || item.expiry_date || item.date || item.created_date || '').slice(0, 10)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {(activeStream === 'tasks' || activeStream === 'actions') && (
                          <button
                            type="button"
                            onClick={() => handleQuickComplete(item)}
                            className="inline-flex items-center gap-1 rounded-full border-2 border-[#0072FF] bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]"
                          >
                            <CheckCircle2 className="h-3 w-3 text-[#0072FF]" /> Done
                          </button>
                        )}
                        <Link
                          to={currentMeta.href}
                          className="rounded-full border-2 border-[#5A00D6] bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
                          style={{ color: '#0A2B6D' }}
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </section>
  );
}