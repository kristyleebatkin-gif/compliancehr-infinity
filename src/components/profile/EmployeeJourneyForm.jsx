import React, { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Save } from 'lucide-react';
import useEmployeeJourney, { journeyMilestone } from '@/components/profile/useEmployeeJourney';
import JourneyMilestone from '@/components/profile/JourneyMilestone';
import JourneyDocuments from '@/components/profile/JourneyDocuments';
import profileRecordExport from '@/lib/profileRecordExport';

export default function EmployeeJourneyForm({ profile, onUpdated }) {
  const id = useId();
  const state = useEmployeeJourney(profile, onUpdated);
  const { value, entry, change } = state;
  const [busy, setBusy] = useState(false), [exporting, setExporting] = useState(false), [exportError, setExportError] = useState('');
  const update = (milestoneId, key, next) => change({ ...value, milestones: value.milestones.map((item) => item.id === milestoneId ? { ...item, [key]: next } : item) });
  const exportJourney = async (format) => {
    setExporting(true); setExportError('');
    try {
      const rows = [{ field: 'Employment start date', value: value.start_date }, { field: 'Induction date', value: value.induction_date }, { field: 'Last saved by', value: entry.completed_by }, { field: 'Last saved at', value: entry.updated_date || entry.completed_date }];
      for (const item of value.milestones) {
        rows.push({ field: 'Milestone', value: `${item.type}: ${item.title || 'Untitled'}` });
        for (const key of ['planned_date', 'completed_date', 'next_due_date', 'responsible', 'notes', 'report']) rows.push({ field: key.replaceAll('_', ' '), value: item[key] });
        rows.push({ field: 'Supporting documents', value: (item.documents || []).map((document) => document.name).join('; ') });
      }
      await profileRecordExport('Employee Journey', profile, rows, format);
    } catch (failure) { setExportError(failure.message); }
    finally { setExporting(false); }
  };
  if (state.loading) return <p role="status" className="flex items-center gap-1 text-xs"><Loader2 className="h-3 w-3 animate-spin" />Loading journey…</p>;
  if (!value) return <div role="alert" className="text-xs text-destructive">{state.error}<Button type="button" variant="outline" size="sm" onClick={state.retry}>Retry</Button></div>;
  return <form onSubmit={state.save} className="mt-2 space-y-2">
    <p className="text-[11px] text-muted-foreground">Documents the workplace cycle — intake, induction, buddy shift, training, more buddy shift, then repeat. Every step records its dates, comments, report and who ran it; training is logged as its own step. Add milestones for repeat cycles.</p>
    <fieldset disabled={state.saving || busy || exporting} className="min-w-0 space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">{[['start_date', 'Employment start date'], ['induction_date', 'Induction date']].map(([key, label]) => <label key={key} htmlFor={`${id}-${key}`} className="space-y-1 text-[11px]">{label}<Input id={`${id}-${key}`} type="date" disabled={!state.canEditDates || !state.canEdit} value={value[key]} className="h-8 text-xs" onChange={(event) => change({ ...value, [key]: event.target.value })} /></label>)}</div>
      {value.milestones.map((milestone, index) => <JourneyMilestone key={milestone.id} milestone={milestone} index={index} readOnly={!state.canEdit} change={(key, next) => update(milestone.id, key, next)} remove={() => { if (window.confirm('Remove this milestone? This takes effect when you save the journey.')) change({ ...value, milestones: value.milestones.filter((item) => item.id !== milestone.id) }); }}><JourneyDocuments documents={milestone.documents || []} readOnly={!state.canEdit} onChange={(documents) => update(milestone.id, 'documents', documents)} onBusy={setBusy} /></JourneyMilestone>)}
      {state.canEdit && <div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" disabled={value.milestones.length >= 100} onClick={() => change({ ...value, milestones: [...value.milestones, journeyMilestone()] })}><Plus className="h-3 w-3" />Add milestone</Button><Button type="submit" size="sm" variant="outline"><Save className="h-3 w-3" />Save journey</Button></div>}
    </fieldset>
    <div className="flex flex-wrap items-center gap-2">{['pdf', 'csv'].map((format) => <Button type="button" key={format} size="sm" variant="outline" disabled={!entry || state.dirty || busy || state.saving || exporting} onClick={() => exportJourney(format)}>Export {format.toUpperCase()}</Button>)}{(state.saving || exporting) && <Loader2 className="h-3 w-3 animate-spin" />}{state.saved && <span role="status" className="text-xs text-safe">Journey saved</span>}{state.dirty && <span className="text-[11px] text-muted-foreground">Unsaved changes, save before exporting.</span>}</div>
    {entry && <p className="text-[11px] text-muted-foreground">Last saved by {entry.completed_by || 'Not recorded'} on {entry.completed_date || 'Not recorded'}</p>}
    {(state.error || exportError) && <p role="alert" className="text-xs text-destructive">{state.error || exportError}</p>}
  </form>;
}