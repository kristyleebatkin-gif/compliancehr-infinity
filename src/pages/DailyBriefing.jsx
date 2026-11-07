import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import BriefingList from '@/components/briefing/BriefingList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sunrise, ClipboardList, CalendarClock, CalendarX2, FileWarning, ListChecks,
  AlertTriangle, ShieldAlert, ClipboardCheck, GraduationCap, ShieldCheck,
  CheckCircle2, Clock, ArrowRight,
} from 'lucide-react';
import { format, addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import { getHeaderView } from '@/lib/fullColourTiles';
import { Image } from '@/components/ui/image';

const WINDOWS = ['7', '14', '30', '60'];

const ROLE_LENSES = [
  { id: 'Executives', label: 'Executives', sub: 'Board, Risk & SLA Summary' },
  { id: 'Managers', label: 'Managers', sub: 'Operations, Roster & Actions' },
  { id: 'HR', label: 'HR', sub: 'Workforce, Leave & Screening' },
  { id: 'Compliance', label: 'Compliance', sub: 'Audits, Incidents & Standards' },
  { id: 'Supervisors', label: 'Supervisors', sub: 'Shifts, Tasks & Escalations' },
];

const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 42%, #A100FF 68%, #FF2E9A 100%)';

const peopleLabel = (value) => (Array.isArray(value) ? value.filter(Boolean).join(', ') : value) || 'Unassigned';

export default function DailyBriefing() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [windowDays, setWindowDays] = useState('30');
  const [roleLens, setRoleLens] = useState('Executives');
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (days) => {
    setLoading(true);
    try {
      const horizon = format(addDays(new Date(), Number(days)), 'yyyy-MM-dd');
      const F = (sort) => ({ sort, limit: 100 });
      const [
        tasksDue,
        tasksOver,
        checksDue,
        checksOver,
        docsExp,
        certsExp,
        insExp,
        docsOver,
        certsOver,
        insOver,
        incidentsCount,
        risksCount,
        auditsCount,
        auditActionsCount,
        trainingCount,
        issuesCount,
        reviewsCount,
        leavePendingCount,
      ] = await Promise.all([
        base44.entities.TodoTask.filter({ status: 'Pending', due_date: today }, F('due_date')),
        base44.entities.TodoTask.filter({ status: 'Pending', due_date: { $lt: today } }, F('due_date')),
        base44.entities.ComplianceChecklistEntry.filter({ next_due_date: today }, F('next_due_date')),
        base44.entities.ComplianceChecklistEntry.filter({ next_due_date: { $lt: today } }, F('next_due_date')),
        base44.entities.EmployeeDocument.filter({ expiry_date: { $gte: today, $lte: horizon }, status: { $ne: 'Archived' } }, F('expiry_date')),
        base44.entities.Certificate.filter({ expiry_date: { $gte: today, $lte: horizon }, status: { $ne: 'Revoked' } }, F('expiry_date')),
        base44.entities.InsurancePolicy.filter({ expiry_date: { $gte: today, $lte: horizon } }, F('expiry_date')),
        base44.entities.EmployeeDocument.filter({ expiry_date: { $lt: today }, status: { $ne: 'Archived' } }, { sort: '-expiry_date', limit: 100 }),
        base44.entities.Certificate.filter({ expiry_date: { $lt: today }, status: { $ne: 'Revoked' } }, { sort: '-expiry_date', limit: 100 }),
        base44.entities.InsurancePolicy.filter({ expiry_date: { $lt: today } }, { sort: '-expiry_date', limit: 100 }),
        base44.entities.Incident.count().catch(() => 0),
        base44.entities.Risk.count().catch(() => 0),
        base44.entities.Audit.count().catch(() => 0),
        base44.entities.AuditAction.count().catch(() => 0),
        base44.entities.TrainingModule.count().catch(() => 0),
        base44.entities.ComplianceIssue.count().catch(() => 0),
        base44.entities.PerformanceReview.count().catch(() => 0),
        base44.entities.LeaveRequest.count({ status: 'Pending' }).catch(() => 0),
      ]);

      const overdueDays = (dateStr) => (dateStr ? Math.max(1, differenceInCalendarDays(parseISO(today), parseISO(String(dateStr)))) : 1);

      const dueToday = [
        ...tasksDue.items.map((t) => ({
          primary: t.title || 'Untitled task',
          path: `/tasks?task=${encodeURIComponent(t.id)}`,
          secondary: [t.module, peopleLabel(t.responsible)].filter(Boolean).join(' · '),
          meta: 'Due today',
          tone: 'text-warning',
        })),
        ...checksDue.items.map((c) => ({
          primary: c.title || 'Untitled checklist',
          path: '/compliance?tab=kits-drills',
          secondary: c.section || 'Compliance check',
          meta: 'Due today',
          tone: 'text-warning',
        })),
      ];

      const overdue = [
        ...tasksOver.items.map((t) => ({
          primary: t.title || 'Untitled task',
          path: `/tasks?task=${encodeURIComponent(t.id)}`,
          secondary: [t.module, peopleLabel(t.responsible)].filter(Boolean).join(' · '),
          meta: `Overdue by ${overdueDays(t.due_date)} day(s) (was ${t.due_date})`,
          tone: 'text-danger',
        })),
        ...checksOver.items.map((c) => ({
          primary: c.title || 'Untitled checklist',
          path: '/compliance?tab=kits-drills',
          secondary: c.section || 'Compliance check',
          meta: `Overdue by ${overdueDays(c.next_due_date)} day(s) (was ${c.next_due_date})`,
          tone: 'text-danger',
        })),
      ].sort((a, b) => a.primary.localeCompare(b.primary));

      const toExpiring = (records, kind, label, personField) =>
        (records?.items || []).filter((r) => r && r.expiry_date).map((r) => ({
          kind, label,
          path: kind === 'Document' ? '/documents?tab=expiry-calendar' : kind === 'Certificate' ? '/certificates' : null,
          person: r[personField],
          name: kind === 'Document' ? (r.document_type || label) : kind === 'Certificate' ? r.module_title : r.insurer,
          title: kind === 'Certificate' ? `${r.module_title || 'Certificate'} — ${r.staff_name || ''}` : kind === 'Insurance' ? r.policy_name : r.title,
          expiry: r.expiry_date,
        }));
      const expiringRaw = [
        ...toExpiring(docsExp, 'Document', 'Employee document', 'employee_name'),
        ...toExpiring(certsExp, 'Certificate', 'Certificate', 'staff_name'),
        ...toExpiring(insExp, 'Insurance', 'Insurance policy', 'insurer'),
      ].sort((a, b) => (a.expiry || '').localeCompare(b.expiry || ''));
      const expiring = expiringRaw.map((r) => ({
        primary: r.title || 'Untitled record',
        path: r.path,
        secondary: `${r.label} · ${r.name || ''} · ${peopleLabel(r.person)}`,
        meta: `Expires ${r.expiry} — in ${Math.max(0, differenceInCalendarDays(parseISO(r.expiry), parseISO(today)))} day(s)`,
        tone: differenceInCalendarDays(parseISO(r.expiry), parseISO(today)) <= 7 ? 'text-danger' : 'text-warning',
      }));

      const expiredRaw = [
        ...toExpiring(docsOver, 'Document', 'Employee document', 'employee_name'),
        ...toExpiring(certsOver, 'Certificate', 'Certificate', 'staff_name'),
        ...toExpiring(insOver, 'Insurance', 'Insurance policy', 'insurer'),
      ].sort((a, b) => (b.expiry || '').localeCompare(a.expiry || ''));
      const expired = expiredRaw.map((r) => ({
        primary: r.title || 'Untitled record',
        path: r.path,
        secondary: `${r.label} · ${r.name || ''} · ${peopleLabel(r.person)}`,
        meta: `Expired ${r.expiry}`,
        tone: 'text-danger',
      }));

      setState({
        dueToday,
        overdue,
        expiring,
        expired,
        windowDays: Number(days),
        summaryCounts: {
          incidents: incidentsCount,
          risks: risksCount,
          audits: auditsCount,
          actions: auditActionsCount + dueToday.length,
          training: trainingCount,
          compliance: issuesCount,
          expiries: expiring.length + expired.length,
          reviews: reviewsCount,
          escalations: overdue.length,
          approvals: leavePendingCount,
          critical: expired.length + issuesCount,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => { load(windowDays); }, [windowDays, load]);

  const tiles = state ? [
    { icon: ClipboardList, label: 'Due today (tasks & checks)', value: state.dueToday.length, tone: 'text-warning' },
    { icon: CalendarClock, label: 'Overdue', value: state.overdue.length, tone: 'text-danger' },
    { icon: FileWarning, label: `Expiring in ${state.windowDays} days`, value: state.expiring.length, tone: 'text-warning' },
    { icon: CalendarX2, label: 'Expired records', value: state.expired.length, tone: 'text-danger' },
  ] : [];

  const summaryItems = state?.summaryCounts ? [
    { label: 'Incidents', value: state.summaryCounts.incidents, sub: '24h / 5d NDIS SLA', path: '/incidents', icon: AlertTriangle },
    { label: 'Risks', value: state.summaryCounts.risks, sub: 'ISO 31000 Register', path: '/risks', icon: ShieldAlert },
    { label: 'Audits', value: state.summaryCounts.audits, sub: 'Scheduled & Active', path: '/compliance?tab=audits&auditTab=audits', icon: ClipboardCheck },
    { label: 'Actions', value: state.summaryCounts.actions, sub: 'Corrective & To-Do', path: '/tasks', icon: ListChecks },
    { label: 'Training', value: state.summaryCounts.training, sub: 'Active LMS Courses', path: '/training', icon: GraduationCap },
    { label: 'Compliance', value: state.summaryCounts.compliance, sub: 'Open Compliance Items', path: '/compliance?tab=issues', icon: ShieldCheck },
    { label: 'Expiries', value: state.summaryCounts.expiries, sub: 'Approaching & Past', path: '/documents?tab=expiry-calendar', icon: FileWarning },
    { label: 'Reviews', value: state.summaryCounts.reviews, sub: 'Performance Reviews', path: '/hr?tab=reviews', icon: Clock },
    { label: 'Escalations', value: state.summaryCounts.escalations, sub: 'Overdue Items', path: '/tasks', icon: CalendarX2 },
    { label: 'Approvals', value: state.summaryCounts.approvals, sub: 'Pending Leave Requests', path: '/hr?tab=leave', icon: CheckCircle2 },
    { label: 'Critical Issues', value: state.summaryCounts.critical, sub: 'Immediate Action', path: '/compliance?tab=issues', icon: AlertTriangle },
  ] : [];

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4">
      <ModuleShell
        moduleKey="daily-briefing"
        title="Daily 8:30 AM Briefing & Role Summary"
        subtitle="Automated 8:30 AM role-based summaries across Incidents, Risks, Audits, Actions, Training, Compliance, Expiries, Reviews, Escalations, Approvals, and Critical Issues."
        icon={Sunrise}
        actions={(
          <Select value={windowDays} onValueChange={setWindowDays}>
            <SelectTrigger className="h-8 w-44 bg-white px-2 py-1 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {WINDOWS.map((w) => <SelectItem key={w} value={w}>Expiring window: {w} days</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        small={state ? tiles.map((t) => (
          <div key={t.label}><p className="text-[10px] font-semibold uppercase tracking-wide">{t.label}</p><p className="mt-1 text-2xl font-bold tabular-nums">{t.value}</p></div>
        )) : null}
      />

      {/* Role-Based 8:30 AM Summary Selector — Visually Matching Quick Access */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="h-1 w-full" style={{ background: BRAND_GRADIENT }} />

        <div className="flex flex-col items-center px-3.5 pb-1.5 pt-2 text-center sm:px-4">
          <Image
            src={CHR_LOGO}
            alt="ComplianceHR Infinity"
            fittingType="fit"
            className="h-5 w-14 rounded-md border border-slate-200 bg-white px-1 py-0.5 shadow-2xs"
          />
          <span className="mt-0.5 font-editorial text-[12px] font-extrabold leading-tight tracking-tight text-[#0A2B6D]">
            Compliance
            <span className="font-editorial-italic text-[#5A00D6]">HR</span>{' '}
            <span className="bg-gradient-to-r from-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              Infinity
            </span>
          </span>
          <span className="mt-0.5 text-[7.5px] font-extrabold leading-tight">
            <span style={{ color: '#0072FF' }}>Complete Control.</span>{' '}
            <span style={{ color: '#5A00D6' }}>Greater Confidence.</span>{' '}
            <span style={{ color: '#FF2E9A' }}>Brighter Success.</span>
          </span>
        </div>

        <div className="grid auto-rows-fr grid-cols-2 gap-2 p-3 pt-2 sm:grid-cols-3 md:grid-cols-5 items-stretch">
          {ROLE_LENSES.map((lens, idx) => {
            const active = roleLens === lens.id;
            const headerBg = getHeaderView(idx);
            return (
              <button
                key={lens.id}
                type="button"
                onClick={() => setRoleLens(lens.id)}
                aria-pressed={active}
                className={`group flex h-full min-h-[92px] flex-col gap-[3px] rounded-xl border-2 bg-[#0A2B6D] p-[3px] text-left transition-all duration-200 focus-visible:outline-none ${
                  active
                    ? 'border-[#5A00D6] shadow-md ring-2 ring-[#5A00D6]/25 ring-offset-1'
                    : 'border-[#0A2B6D] hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md'
                }`}
              >
                <div className="flex w-full flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
                  <div
                    className="flex min-h-[36px] w-full items-center justify-between gap-1 px-1.5 py-1 text-white"
                    style={{ background: headerBg }}
                  >
                    <div className="flex min-w-0 items-center gap-1">
                      <Sunrise className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                      <span className="min-w-0 text-[9.5px] font-extrabold leading-[11px] tracking-tight text-white">
                        8:30 AM · {lens.label}
                      </span>
                    </div>
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-[#00C6FF]' : 'bg-white/75'}`} />
                  </div>
                  <div className="flex min-h-[38px] w-full flex-1 items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-1.5 py-1">
                    <span className="line-clamp-2 min-w-0 flex-1 break-words text-[10.5px] font-bold leading-[13px] text-[#0A2B6D]/85">
                      {lens.sub}
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5 group-hover:text-[#FF2E9A]" />
                  </div>
                </div>
                <div className="flex h-[5px] w-full items-center justify-center">
                  <span className={`h-[2.5px] w-6 rounded-full transition-all ${active ? 'w-8 bg-[#00C6FF]' : 'bg-white/45 group-hover:bg-white/80'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* 11-Point Role-Based 8:30 AM Summary Grid */}
        {summaryItems.length > 0 && (
          <div className="border-t border-slate-100 p-3 pt-2.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#0A2B6D]">
                8:30 AM Daily Summary — {roleLens} View ({today})
              </span>
              <span className="rounded-full bg-[#F5F0FF] px-2.5 py-0.5 text-[10px] font-extrabold text-[#5A00D6]">
                11 Live Domains
              </span>
            </div>
            <div className="grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 items-stretch">
              {summaryItems.map((item, idx) => {
                const Icon = item.icon;
                const headerBg = getHeaderView(idx);
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="group flex h-full min-h-[92px] flex-col gap-[3px] rounded-xl border-2 border-[#0A2B6D] bg-[#0A2B6D] p-[3px] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md"
                  >
                    <div className="flex flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
                      <div
                        className="flex min-h-[34px] items-center justify-between gap-1 px-1.5 py-1 text-white"
                        style={{ background: headerBg }}
                      >
                        <div className="flex min-w-0 items-center gap-1">
                          <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                          <span className="min-w-0 text-[9.5px] font-extrabold leading-[11px] text-white">
                            {item.label}
                          </span>
                        </div>
                        <span className="rounded-full bg-white px-1.5 py-0.2 text-[9.5px] font-black text-[#0A2B6D]">
                          {item.value}
                        </span>
                      </div>
                      <div className="flex min-h-[36px] flex-1 items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-1.5 py-1">
                        <span className="line-clamp-2 min-w-0 flex-1 break-words text-[10px] font-bold leading-[12.5px] text-[#0A2B6D]/85">
                          {item.sub}
                        </span>
                        <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5 group-hover:text-[#FF2E9A]" />
                      </div>
                    </div>
                    <div className="flex h-[5px] items-center justify-center">
                      <span className="h-[2.5px] w-6 rounded-full bg-white/45 transition-all group-hover:bg-white/80" />
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
              <Link className="text-brand hover:underline" to="/compliance?tab=audits&auditTab=actions">Audit actions</Link>
              <Link className="text-brand hover:underline" to="/compliance?tab=kits-drills">Checklist actions and escalations</Link>
              <Link className="text-brand hover:underline" to="/documents?tab=expiry-calendar">Document and certificate expiries</Link>
              <a className="text-brand hover:underline" href="#brief-expiry-records">Insurance expiries in this briefing</a>
            </div>
          </div>
        )}
      </section>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : state ? (
        <div id="brief-expiry-records" className="grid scroll-mt-24 gap-3 lg:grid-cols-2">
          <BriefingList title="Due today" icon={ListChecks} tone="text-warning" items={state.dueToday} emptyLabel="Nothing due today." />
          <BriefingList title="Overdue" icon={CalendarClock} tone="text-danger" items={state.overdue} emptyLabel="No overdue items." />
          <BriefingList title={`Expiring in ${state.windowDays} days`} icon={FileWarning} tone="text-warning" items={state.expiring} emptyLabel="Nothing expiring in this window." />
          <BriefingList title="Expired records" icon={CalendarX2} tone="text-danger" items={state.expired} emptyLabel="No expired records." />
        </div>
      ) : null}
    </div>
  );
}