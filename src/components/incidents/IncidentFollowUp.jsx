import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import SectionCard from '@/components/SectionCard';
import EmptyState from '@/components/EmptyState';
import { Field } from '@/components/Field';
import { Plus, CheckCircle2, Circle, Trash2, ListChecks, FileSearch, X } from 'lucide-react';
import { recordSafetyEvent } from '@/lib/safetyEvent';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Completed', 'Overdue', 'Cancelled'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];

export default function IncidentFollowUp({ incident }) {
  const { toast } = useToast();
  const [investigations, setInvestigations] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invForm, setInvForm] = useState(null);
  const [actForm, setActForm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [invs, tasks] = await Promise.all([
        base44.entities.Investigation.filter({ incident_id: incident.id }, { limit: 200 }).then((p) => p.items || []).catch(() => []),
        base44.entities.Task.filter({ linked_entity_type: 'Incident', linked_entity_id: incident.id }, { limit: 500 }).then((p) => p.items || []).catch(() => []),
      ]);
      setInvestigations(invs);
      setActions(tasks);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [incident.id]);

  const startInvestigation = async (e) => {
    e.preventDefault();
    try {
      const record = await base44.entities.Investigation.create({
        title: `Investigation: ${incident.title}`,
        investigation_id: `INV-${Date.now().toString().slice(-6)}`,
        incident_id: incident.id,
        ...invForm,
        start_date: new Date().toISOString().slice(0, 10),
        status: 'In Progress',
      });
      if (incident.status === 'Reported') {
        await base44.entities.Incident.update(incident.id, { status: 'Under Investigation' });
      }
      const result = await recordSafetyEvent('Investigation', record.id);
      if (result.email_failures?.length) toast({ title: 'Investigation logged; some administrator emails failed', description: `${result.email_failures.length} email(s) could not be sent.`, variant: 'destructive' });
      toast({ title: 'Investigation started' });
      setInvForm(null);
      load();
    } catch (err) { toast({ title: 'Failed', description: err.message, variant: 'destructive' }); }
  };

  const updateInvestigation = async (inv, field, value) => {
    try {
      await base44.entities.Investigation.update(inv.id, { [field]: value });
      await recordSafetyEvent('Investigation', inv.id, { notify: false });
      if (field === 'status' && (value === 'Completed' || value === 'Closed')) {
        await base44.entities.AuditLog.create({ action: 'Update', entity_type: 'Investigation', record_id: inv.id, record_title: inv.title, performed_by: 'ComplianceNQ', details: `Investigation marked ${value}` }).catch((error) => console.error(error));
      }
      toast({ title: 'Investigation updated' });
      load();
    } catch (err) { toast({ title: 'Failed', description: err.message, variant: 'destructive' }); }
  };

  const addAction = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.Task.create({
        title: actForm.title,
        task_type: 'Incident Action',
        assigned_to: actForm.assigned_to || '',
        due_date: actForm.due_date || '',
        priority: actForm.priority || 'Medium',
        status: 'Open',
        linked_entity_type: 'Incident',
        linked_entity_id: incident.id,
        notes: actForm.notes || '',
      });
      await base44.entities.AuditLog.create({ action: 'Create', entity_type: 'Task', record_title: actForm.title, performed_by: 'ComplianceNQ', details: `Follow-up action for incident ${incident.incident_id || incident.id}` }).catch((error) => console.error(error));
      toast({ title: 'Follow-up action added' });
      setActForm(null);
      load();
    } catch (err) { toast({ title: 'Failed', description: err.message, variant: 'destructive' }); }
  };

  const toggleAction = async (a) => {
    const next = a.status === 'Completed' ? 'Open' : 'Completed';
    try {
      await base44.entities.Task.update(a.id, { status: next });
      load();
    } catch (err) { toast({ title: 'Failed', description: err.message, variant: 'destructive' }); }
  };

  const deleteAction = async (a) => {
    if (!confirm('Delete this follow-up action?')) return;
    try {
      await base44.entities.Task.delete(a.id);
      load();
    } catch (err) { toast({ title: 'Failed', description: err.message, variant: 'destructive' }); }
  };

  const closed = incident.status === 'Closed' || incident.status === 'Resolved';

  if (loading) return (
    <SectionCard title="Investigation & Follow-up">
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
      </div>
    </SectionCard>
  );

  const openActions = actions.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled');
  const completedActions = actions.filter(a => a.status === 'Completed');

  return (
    <div className="space-y-4">
      {/* Investigations */}
      <SectionCard
        title="Investigation"
        description={investigations.length ? `${investigations.length} linked investigation(s)` : 'No investigation yet'}
        action={!closed && !invForm && investigations.length === 0 && (
          <button onClick={() => setInvForm({ investigator: '', received_by: '', target_completion: '', incident_summary: incident.description || '', evidence_reviewed: '', persons_interviewed: '', hazards_identified: incident.hazards_identified || '', risk_assessment: incident.risk_assessment || '', control_measures: incident.control_measures || '', root_cause: '', findings: '', recommendations: '', corrective_actions: '' })} className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand/90">
            <Plus className="h-4 w-4" />Start Investigation
          </button>
        )}
      >
        {investigations.length === 0 && !invForm ? (
          <EmptyState icon={FileSearch} title="No investigation linked" message="Start an investigation to move this incident through the workflow." />
        ) : (
          <div className="space-y-3">
            {investigations.map((inv) => (
              <div key={inv.id} className="rounded-lg border border-border/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <FileSearch className="h-5 w-5 shrink-0 text-brand" />
                    <div>
                      <div className="text-sm font-medium">{inv.title}</div>
                      <div className="mt-0.5 text-xs text-foreground/50">
                        Investigator: {inv.investigator || '—'} • Started {inv.start_date || '—'}
                        {inv.target_completion && ` • Target ${inv.target_completion}`}
                      </div>
                    </div>
                  </div>
                  <select
                    value={inv.status}
                    onChange={(e) => updateInvestigation(inv, 'status', e.target.value)}
                    disabled={closed}
                    className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium focus:border-brand focus:ring-1 focus:ring-brand outline-none disabled:opacity-60"
                  >
                    {['Pending', 'In Progress', 'Findings Draft', 'Completed', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {inv.root_cause && <div className="mt-3 rounded-lg bg-muted/40 p-2.5 text-xs"><span className="font-semibold">Root Cause:</span> <span className="text-foreground/70">{inv.root_cause}</span></div>}
                {inv.findings && <div className="mt-2 rounded-lg bg-muted/40 p-2.5 text-xs"><span className="font-semibold">Findings:</span> <span className="text-foreground/70">{inv.findings}</span></div>}
                {inv.recommendations && <div className="mt-2 rounded-lg bg-muted/40 p-2.5 text-xs"><span className="font-semibold">Recommendations:</span> <span className="text-foreground/70">{inv.recommendations}</span></div>}
                {inv.hazards_identified && <div className="mt-2 rounded-lg bg-muted/40 p-2.5 text-xs"><span className="font-semibold">Risks / Hazards:</span> <span className="text-foreground/70">{inv.hazards_identified}</span></div>}
                {inv.risk_assessment && <div className="mt-2 rounded-lg bg-muted/40 p-2.5 text-xs"><span className="font-semibold">Risk Assessment:</span> <span className="text-foreground/70">{inv.risk_assessment}</span></div>}
                {inv.control_measures && <div className="mt-2 rounded-lg bg-muted/40 p-2.5 text-xs"><span className="font-semibold">Control Measures:</span> <span className="text-foreground/70">{inv.control_measures}</span></div>}
                {!closed && (inv.status === 'In Progress' || inv.status === 'Findings Draft' || inv.status === 'Pending') && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <input
                      placeholder="Root cause summary"
                      defaultValue={inv.root_cause || ''}
                      onBlur={(e) => e.target.value !== (inv.root_cause || '') && updateInvestigation(inv, 'root_cause', e.target.value)}
                      className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                    />
                    <input
                      placeholder="Findings summary"
                      defaultValue={inv.findings || ''}
                      onBlur={(e) => e.target.value !== (inv.findings || '') && updateInvestigation(inv, 'findings', e.target.value)}
                      className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                    />
                    <input
                      placeholder="Recommendations"
                      defaultValue={inv.recommendations || ''}
                      onBlur={(e) => e.target.value !== (inv.recommendations || '') && updateInvestigation(inv, 'recommendations', e.target.value)}
                      className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                    />
                    {[
                      ['incident_summary', 'Incident summary'],
                      ['evidence_reviewed', 'Evidence reviewed'],
                      ['persons_interviewed', 'Persons interviewed'],
                      ['hazards_identified', 'Risks / hazards identified'],
                      ['risk_assessment', 'Risk assessment'],
                      ['control_measures', 'Control measures'],
                      ['corrective_actions', 'Corrective actions'],
                    ].map(([field, placeholder]) => (
                      <textarea key={field} placeholder={placeholder} defaultValue={inv[field] || ''} onBlur={(e) => e.target.value !== (inv[field] || '') && updateInvestigation(inv, field, e.target.value)} rows={2} className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {invForm && (
          <form onSubmit={startInvestigation} className="mt-3 space-y-3 rounded-lg border border-brand/30 bg-brand/5 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Investigator Name">
                <input value={invForm.investigator} onChange={(e) => setInvForm({ ...invForm, investigator: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" placeholder="Assign an investigator" />
              </Field>
              <Field label="Target Completion">
                <input type="date" value={invForm.target_completion} onChange={(e) => setInvForm({ ...invForm, target_completion: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
              </Field>
              <Field label="Received By"><input value={invForm.received_by} onChange={(e) => setInvForm({ ...invForm, received_by: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></Field>
            </div>
            {[
              ['incident_summary', 'Incident Summary'],
              ['evidence_reviewed', 'Evidence Reviewed'],
              ['persons_interviewed', 'Persons Interviewed'],
              ['hazards_identified', 'Risks / Hazards Identified'],
              ['risk_assessment', 'Risk Assessment'],
              ['control_measures', 'Control Measures'],
              ['root_cause', 'Root Cause'],
              ['findings', 'Findings'],
              ['recommendations', 'Recommendations'],
              ['corrective_actions', 'Corrective Actions'],
            ].map(([field, label]) => (
              <Field key={field} label={label}><textarea value={invForm[field]} onChange={(e) => setInvForm({ ...invForm, [field]: e.target.value })} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></Field>
            ))}
            <p className="text-xs text-foreground/50">Creates an investigation linked to this incident and advances the workflow to "Under Investigation".</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setInvForm(null)} className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"><X className="h-4 w-4" />Cancel</button>
              <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90">Start Investigation</button>
            </div>
          </form>
        )}
      </SectionCard>

      {/* Follow-up Actions */}
      <SectionCard
        title="Follow-up Actions"
        description={actions.length ? `${openActions.length} open · ${completedActions.length} completed` : 'No follow-up actions yet'}
        action={!closed && !actForm && (
          <button onClick={() => setActForm({ title: '', assigned_to: '', due_date: '', priority: 'Medium', notes: '' })} className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand/90">
            <Plus className="h-4 w-4" />Add Action
          </button>
        )}
      >
        {actions.length === 0 && !actForm ? (
          <EmptyState icon={ListChecks} title="No follow-up actions" message="Track corrective actions, reminders and tasks linked to this incident." />
        ) : (
          <div className="space-y-2">
            {actions.map((a) => {
              const done = a.status === 'Completed';
              const overdue = a.status === 'Overdue' || (a.due_date && !done && new Date(a.due_date) < new Date());
              return (
                <div key={a.id} className={`flex items-start gap-3 rounded-lg border p-3 ${done ? 'border-safe/30 bg-safe/5' : overdue ? 'border-danger/30 bg-danger/5' : 'border-border/60'}`}>
                  <button onClick={() => toggleAction(a)} className="mt-0.5 shrink-0" disabled={closed}>
                    {done ? <CheckCircle2 className="h-5 w-5 text-safe" /> : <Circle className="h-5 w-5 text-foreground/40 hover:text-brand" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${done ? 'line-through text-foreground/50' : ''}`}>{a.title}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-foreground/50">
                      {a.assigned_to && <span>👤 {a.assigned_to}</span>}
                      {a.due_date && <span className={overdue && !done ? 'text-danger font-medium' : ''}>📅 {a.due_date}</span>}
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${a.priority === 'Urgent' ? 'bg-danger/10 text-danger' : a.priority === 'High' ? 'bg-warning/10 text-warning' : 'bg-muted text-foreground/60'}`}>{a.priority}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${done ? 'bg-safe/10 text-safe' : a.status === 'In Progress' ? 'bg-brand/10 text-brand' : 'bg-muted text-foreground/60'}`}>{a.status}</span>
                    </div>
                    {a.notes && <div className="mt-1 text-xs text-foreground/50">{a.notes}</div>}
                  </div>
                  {!closed && (
                    <button onClick={() => deleteAction(a)} aria-label="Delete action" className="shrink-0 rounded p-1 text-foreground/30 hover:bg-danger/5 hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {actForm && (
          <form onSubmit={addAction} className="mt-3 space-y-3 rounded-lg border border-brand/30 bg-brand/5 p-4">
            <Field label="Action Title">
              <input required value={actForm.title} onChange={(e) => setActForm({ ...actForm, title: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" placeholder="e.g. Update support plan, staff retraining" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Assigned To">
                <input value={actForm.assigned_to} onChange={(e) => setActForm({ ...actForm, assigned_to: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" placeholder="Staff name" />
              </Field>
              <Field label="Due Date">
                <input type="date" value={actForm.due_date} onChange={(e) => setActForm({ ...actForm, due_date: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
              </Field>
              <Field label="Priority">
                <select value={actForm.priority} onChange={(e) => setActForm({ ...actForm, priority: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none">
                  {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Notes">
              <textarea value={actForm.notes} onChange={(e) => setActForm({ ...actForm, notes: e.target.value })} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" placeholder="Additional context" />
            </Field>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setActForm(null)} className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"><X className="h-4 w-4" />Cancel</button>
              <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90">Add Action</button>
            </div>
          </form>
        )}
      </SectionCard>
    </div>
  );
}