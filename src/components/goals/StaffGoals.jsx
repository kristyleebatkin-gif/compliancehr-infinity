import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Target, Download } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import StaffGoalForm from '@/components/goals/StaffGoalForm';
import StaffGoalGroup from '@/components/goals/StaffGoalGroup';

export default function StaffGoals({ profile }) {
  const { user, role } = useRole();
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const manager = ['Provider Administrator', 'Management', 'Administration'].includes(role) || (!!profile && role === 'Human Resources Manager');
  const scope = profile ? { staff_id: profile.id } : manager ? {} : { staff_email: user?.email || '__no_email__' };
  const query = useQuery({ queryKey: ['staff-goals', 'summary', scope], queryFn: async () => {
    const [totals, achieved] = await Promise.all([
      base44.entities.StaffGoal.aggregate({ query: scope, groupBy: 'staff_email', avg: ['progress'] }),
      base44.entities.StaffGoal.aggregate({ query: { ...scope, status: 'Achieved' }, groupBy: 'staff_email' }),
    ]);
    return { totals: totals.rows, achieved: Object.fromEntries(achieved.rows.map((row) => [row.staff_email, row.count])) };
  } });
  const exportGoals = async () => {
    setExporting(true); setExportError('');
    try { const rows = await fetchAllRecords(base44.entities.StaffGoal, scope, '-created_date'); downloadCsv('Staff-Goal-Progress.csv', [{ key: 'staff_name', label: 'Employee' }, { key: 'goal', label: 'Goal' }, { key: 'category', label: 'Category' }, { key: 'progress', label: 'Progress (%)' }, { key: 'status', label: 'Status' }, { key: 'target_date', label: 'Target Date' }, { key: 'support_needed', label: 'Support Needed' }], rows); }
    catch (failure) { setExportError(failure.message); }
    finally { setExporting(false); }
  };
  return <section className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-bold">Staff’s own goals</h2><div className="flex gap-2"><Button variant="outline" size="sm" disabled={exporting || !query.data?.totals.length} onClick={exportGoals}><Download className="h-4 w-4" />{exporting ? 'Exporting...' : 'Export staff goals'}</Button>{(manager || !profile || profile.email === user?.email) && <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />New staff goal</Button>}</div></div>
    {exportError && <p role="alert" className="text-sm text-destructive">{exportError}</p>}
    {query.isPending ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /> : query.isError ? <p role="alert" className="text-sm text-destructive">{query.error.message}<Button variant="outline" onClick={() => query.refetch()}>Try again</Button></p> : !query.data.totals.length ? <EmptyState icon={Target} title="No staff goals yet" message="Add a personal or professional goal to track employee progress." /> : <div className="grid items-start gap-3 xl:grid-cols-2">{query.data.totals.map((summary) => <StaffGoalGroup key={summary.staff_email} summary={summary} achieved={query.data.achieved[summary.staff_email] || 0} scope={scope} canEdit={manager || summary.staff_email === user?.email} />)}</div>}
    {open && <StaffGoalForm profile={profile} onClose={() => setOpen(false)} />}
  </section>;
}