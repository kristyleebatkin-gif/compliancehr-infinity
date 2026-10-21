import React, { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import BriefingList from '@/components/briefing/BriefingList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sunrise, ClipboardList, CalendarClock, CalendarX2, FileWarning, ListChecks } from 'lucide-react';
import { format, addDays, differenceInCalendarDays, parseISO } from 'date-fns';

const WINDOWS = ['7', '14', '30', '60'];

const peopleLabel = (value) => (Array.isArray(value) ? value.filter(Boolean).join(', ') : value) || 'Unassigned';

export default function DailyBriefing() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [windowDays, setWindowDays] = useState('30');
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (days) => {
    setLoading(true);
    try {
      const horizon = format(addDays(new Date(), Number(days)), 'yyyy-MM-dd');
      const F = (sort) => ({ sort, limit: 100 });
      const [tasksDue, tasksOver, checksDue, checksOver, docsExp, certsExp, insExp, docsOver, certsOver, insOver] = await Promise.all([
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
      ]);

      const overdueDays = (dateStr) => Math.max(1, differenceInCalendarDays(parseISO(today), parseISO(dateStr)));

      const dueToday = [
        ...tasksDue.items.map((t) => ({
          primary: t.title || 'Untitled task',
          secondary: [t.module, peopleLabel(t.responsible)].filter(Boolean).join(' · '),
          meta: 'Due today',
          tone: 'text-warning',
        })),
        ...checksDue.items.map((c) => ({
          primary: c.title || 'Untitled checklist',
          secondary: c.section || 'Compliance check',
          meta: 'Due today',
          tone: 'text-warning',
        })),
      ];

      const overdue = [
        ...tasksOver.items.map((t) => ({
          primary: t.title || 'Untitled task',
          secondary: [t.module, peopleLabel(t.responsible)].filter(Boolean).join(' · '),
          meta: `Overdue by ${overdueDays(t.due_date)} day(s) (was ${t.due_date})`,
          tone: 'text-danger',
        })),
        ...checksOver.items.map((c) => ({
          primary: c.title || 'Untitled checklist',
          secondary: c.section || 'Compliance check',
          meta: `Overdue by ${overdueDays(c.next_due_date)} day(s) (was ${c.next_due_date})`,
          tone: 'text-danger',
        })),
      ].sort((a, b) => a.primary.localeCompare(b.primary));

      const toExpiring = (records, kind, label, personField) =>
        records.items.map((r) => ({
          kind, label,
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
        secondary: `${r.label} · ${r.name || ''} · ${peopleLabel(r.person)}`,
        meta: `Expired ${r.expiry}`,
        tone: 'text-danger',
      }));

      setState({ dueToday, overdue, expiring, expired, windowDays: Number(days) });
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

  return (
    <div className="space-y-4">
      <PageHeader
        title="Daily Briefing"
        subtitle="Everything pending and expiring for today — pending compliance tasks, checks due, and records approaching or past expiry."
        icon={Sunrise}
        accent={['#7c3aed', '#22d3ee']}
        action={(
          <Select value={windowDays} onValueChange={setWindowDays}>
            <SelectTrigger className="h-8 w-40 px-2 py-1 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {WINDOWS.map((w) => <SelectItem key={w} value={w}>Expiring window: {w} days</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      />

      {state && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                <Icon className={`h-4 w-4 ${t.tone}`} />
                <div className="mt-1.5 text-2xl font-bold font-display leading-none">{t.value}</div>
                <div className="mt-1 text-[11px] font-medium leading-tight text-muted-foreground">{t.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : state ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <BriefingList title="Due today" icon={ListChecks} tone="text-warning" items={state.dueToday} emptyLabel="Nothing due today." />
          <BriefingList title="Overdue" icon={CalendarClock} tone="text-danger" items={state.overdue} emptyLabel="No overdue items." />
          <BriefingList title={`Expiring in ${state.windowDays} days`} icon={FileWarning} tone="text-warning" items={state.expiring} emptyLabel="Nothing expiring in this window." />
          <BriefingList title="Expired records" icon={CalendarX2} tone="text-danger" items={state.expired} emptyLabel="No expired records." />
        </div>
      ) : null}
    </div>
  );
}