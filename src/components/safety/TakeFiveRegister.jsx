import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import Container from '@/components/safety/TakeFiveContainer';
import EmptyState from '@/components/EmptyState';
import { Field, TextArea, TextInput, Select, DateInput, Checkbox } from '@/components/Field';
import { ClipboardCheck, Plus, Download } from 'lucide-react';
import { recordSafetyEvent } from '@/lib/safetyEvent';
import { downloadCsv } from '@/lib/csvExport';
import { TAKE5_CSV_COLUMNS } from '@/components/safety/SafetyRegisterExports';
import TakeFiveRecords from '@/components/safety/TakeFiveRecords';
import { useRole } from '@/lib/useRole';

const blank = (meetingType = '', meeting = {}, kind = 'take-five') => ({
  assessment_id: `${kind === 'risk-assessment' ? 'RA' : 'T5'}-${Date.now().toString().slice(-8)}`,
  meeting_id: meeting.meeting_id || '',
  meeting_title: meeting.title || meetingType,
  meeting_type: meetingType,
  task: '',
  worker_name: '',
  supervisor: '',
  location: '',
  assessment_date: new Date().toISOString().slice(0, 10),
  assessment_time: new Date().toTimeString().slice(0, 5),
  hazards_identified: '',
  potential_harm: '',
  likelihood: 'Possible',
  consequence: 'Moderate',
  risk_rating: 'Medium',
  control_measures: '',
  residual_risk: 'Low',
  safe_to_proceed: false,
  status: 'Completed',
});

export default function TakeFiveRegister({ toolboxOnly = false, meeting, showCreateButton = true, openRequest = 0, embedded = false }) {
  const { toast } = useToast();
  const { user } = useRole();
  const canEdit = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Support Worker'].includes(user?.role);
  const [editingId, setEditingId] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [formKind, setFormKind] = useState('take-five');
  const [saving, setSaving] = useState(false);
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const load = async () => {
    try {
      const page = await base44.entities.TakeFive.filter({}, { sort: '-assessment_date', limit: 500 });
      const records = page.items || [];
      setItems(toolboxOnly ? records.filter((item) => item.meeting_type === 'Toolbox Meeting') : records);
    }
    catch (error) { console.error(error); }
  };
  useEffect(() => { load(); }, [toolboxOnly]);
  useEffect(() => {
    if (openRequest > 0) {
      setEditingId(null);
      setFormKind('take-five');
      setForm(blank(toolboxOnly ? 'Toolbox Meeting' : '', meeting));
    }
  }, [meeting, openRequest, toolboxOnly]);

  const openForm = (kind) => {
    setEditingId(null);
    setFormKind(kind);
    setForm(blank(toolboxOnly ? 'Toolbox Meeting' : '', meeting, kind));
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = Object.fromEntries(Object.keys(blank()).map((key) => [key, form[key]]));
      const record = editingId ? await base44.entities.TakeFive.update(editingId, payload) : await base44.entities.TakeFive.create(payload);
      const result = await recordSafetyEvent('TakeFive', record.id, editingId ? { notify: false } : undefined);
      toast({
        title: editingId ? 'Assessment responses updated' : formKind === 'risk-assessment' ? 'Risk assessment recorded' : 'Take Five assessment recorded',
        description: result.email_failures?.length ? `${result.email_failures.length} administrator email(s) failed.` : editingId ? 'Your changes have been saved.' : 'Administrators were notified and emailed.',
        variant: result.email_failures?.length ? 'destructive' : undefined,
      });
      setForm(null);
      setEditingId(null);
      load();
    } catch (error) {
      toast({ title: 'Unable to save Take Five', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const exportRegister = () => {
    if (!items.length) { toast({ title: 'No Take Five assessments to export' }); return; }
    downloadCsv(toolboxOnly ? 'Toolbox Take Five Register.csv' : 'Take Five Assessment Register.csv', TAKE5_CSV_COLUMNS, items);
    toast({ title: 'Take Five register exported' });
  };


  return (
    <Container embedded={embedded} title={toolboxOnly ? 'Toolbox Take Five Risk Assessment Log' : 'Take Five Assessment Register'} description="Complete a quick pre-task risk assessment; saving updates the register and alerts administrators." action={<div className="flex flex-wrap items-center gap-2">{showCreateButton && !form && (<><button onClick={() => openForm('take-five')} className="flex items-center gap-1.5 rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-yellow-500"><Plus className="h-3.5 w-3.5" />New Take Five</button><button onClick={() => openForm('risk-assessment')} className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"><Plus className="h-3.5 w-3.5" />New Risk Assessment</button></>)}<button onClick={exportRegister} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"><Download className="h-3.5 w-3.5 text-brand" />Export CSV</button></div>}>
      {form && <form onSubmit={save} className={`mb-5 space-y-3 rounded-xl border p-4 ${formKind === 'risk-assessment' ? 'border-red-400/60 bg-red-50/40 dark:border-red-500/30 dark:bg-red-500/10' : 'border-yellow-400/60 bg-yellow-50/40 dark:border-yellow-500/30 dark:bg-yellow-500/10'}`}>
        <h3 className="font-semibold">{editingId ? 'Edit assessment responses' : formKind === 'risk-assessment' ? 'New Risk Assessment' : 'New Take Five'}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {toolboxOnly && <Field label="Meeting ID"><TextInput value={form.meeting_id} onChange={(e) => set('meeting_id', e.target.value)} /></Field>}
          {toolboxOnly && <Field label="Meeting Title"><TextInput value={form.meeting_title} onChange={(e) => set('meeting_title', e.target.value)} /></Field>}
          <Field label="Task / Activity"><TextInput value={form.task} onChange={(e) => set('task', e.target.value)} required /></Field>
          <Field label="Assessment ID"><TextInput value={form.assessment_id} onChange={(e) => set('assessment_id', e.target.value)} /></Field>
          <Field label="Worker Name"><TextInput value={form.worker_name} onChange={(e) => set('worker_name', e.target.value)} /></Field>
          <Field label="Supervisor"><TextInput value={form.supervisor} onChange={(e) => set('supervisor', e.target.value)} /></Field>
          <Field label="Location"><TextInput value={form.location} onChange={(e) => set('location', e.target.value)} /></Field>
          <Field label="Date"><DateInput value={form.assessment_date} onChange={(e) => set('assessment_date', e.target.value)} /></Field>
          <Field label="Time"><TextInput type="time" value={form.assessment_time} onChange={(e) => set('assessment_time', e.target.value)} /></Field>
        </div>
        <Field label="Risks / Hazards Identified"><TextArea rows={3} value={form.hazards_identified} onChange={(e) => set('hazards_identified', e.target.value)} /></Field>
        <Field label="Potential Harm / Consequences"><TextArea rows={2} value={form.potential_harm} onChange={(e) => set('potential_harm', e.target.value)} /></Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Likelihood"><Select value={form.likelihood} onChange={(e) => set('likelihood', e.target.value)}>{['Rare','Unlikely','Possible','Likely','Almost Certain'].map((value) => <option key={value}>{value}</option>)}</Select></Field>
          <Field label="Consequence"><Select value={form.consequence} onChange={(e) => set('consequence', e.target.value)}>{['Insignificant','Minor','Moderate','Major','Severe'].map((value) => <option key={value}>{value}</option>)}</Select></Field>
          <Field label="Risk Rating"><Select value={form.risk_rating} onChange={(e) => set('risk_rating', e.target.value)}>{['Low','Medium','High','Critical'].map((value) => <option key={value}>{value}</option>)}</Select></Field>
        </div>
        <Field label="Control Measures"><TextArea rows={3} value={form.control_measures} onChange={(e) => set('control_measures', e.target.value)} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Residual Risk"><Select value={form.residual_risk} onChange={(e) => set('residual_risk', e.target.value)}>{['Low','Medium','High','Critical'].map((value) => <option key={value}>{value}</option>)}</Select></Field>
          <Checkbox label="Safe to proceed" checked={form.safe_to_proceed} onChange={(e) => set('safe_to_proceed', e.target.checked)} />
        </div>
        <div className="flex justify-end gap-2"><button type="button" onClick={() => setForm(null)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={saving} className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 ${formKind === 'risk-assessment' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-yellow-400 text-slate-900 hover:bg-yellow-500'}`}>{saving ? 'Saving...' : formKind === 'risk-assessment' ? 'Save Risk Assessment' : 'Save Take Five'}</button></div>
      </form>}
      {items.length === 0 ? <EmptyState icon={ClipboardCheck} title="No Take Five assessments recorded" /> : <TakeFiveRecords items={items} onEdit={canEdit ? (item) => { setEditingId(item.id); setFormKind(item.assessment_id?.startsWith('RA-') ? 'risk-assessment' : 'take-five'); setForm({ ...blank(), ...item }); } : undefined} />}
    </Container>
  );
}