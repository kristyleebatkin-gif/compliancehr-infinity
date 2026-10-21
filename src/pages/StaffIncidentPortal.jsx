import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Field, TextInput, Select, TextArea, DateInput } from '@/components/Field';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = ['Medical', 'Behavioural', 'Safety', 'Medication Error', 'Abuse/Neglect', 'Other'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

const blank = {
  title: '',
  date_occurred: '',
  time_occurred: '',
  location: '',
  category: 'Other',
  severity: 'Medium',
  participant_name: '',
  staff_name: '',
  description: '',
  immediate_actions: '',
};

export default function StaffIncidentPortal() {
  const [form, setForm] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date_occurred) return;
    setSubmitting(true);
    setError('');
    try {
      const record = {
        ...form,
        incident_id: 'INC-' + format(new Date(), 'yyyyMMdd') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
        date_reported: format(new Date(), 'yyyy-MM-dd'),
        reported_by: me?.full_name || 'Staff',
        status: 'Reported',
        source_entity_type: 'Staff Portal',
      };
      const created = await base44.entities.Incident.create(record);
      setSubmitted(created);
      setForm(blank);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl p-3 md:p-5">
        <div className="rounded-2xl border border-safe/30 bg-safe/5 p-10 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-safe" />
          <h2 className="mt-4 text-xl font-semibold">Incident reported</h2>
          <p className="mt-2 text-sm text-foreground/60">
            Your report <span className="font-semibold">{submitted.incident_id}</span> has been sent to the Incident register for review. Your supervisor or the compliance team will follow up if more detail is needed.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button onClick={() => setSubmitted(null)} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90">Report another incident</button>
            <Link to="/incidents" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">{me?.role === 'Employee' ? 'View my incidents' : 'View incident register'}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-3 md:p-5 space-y-4">
      <PageHeader
        title="Report an Incident"
        subtitle="A simple form for staff to report what happened. Every submission goes straight to the Incident register for follow-up."
      />

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-5 md:p-6">
        <Field label="What happened? (short title)">
          <TextInput value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Participant slipped in bathroom" required />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Date it happened"><DateInput value={form.date_occurred} onChange={(e) => set('date_occurred', e.target.value)} required /></Field>
          <Field label="Time"><TextInput value={form.time_occurred} onChange={(e) => set('time_occurred', e.target.value)} placeholder="e.g. 2:30pm" /></Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Location"><TextInput value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Respite home - bathroom" /></Field>
          <Field label="Category"><Select value={form.category} onChange={(e) => set('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Severity"><Select value={form.severity} onChange={(e) => set('severity', e.target.value)}>{SEVERITIES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Participant involved (if any)"><TextInput value={form.participant_name} onChange={(e) => set('participant_name', e.target.value)} /></Field>
        </div>
        <Field label="Staff involved"><TextInput value={form.staff_name} onChange={(e) => set('staff_name', e.target.value)} /></Field>
        <Field label="Full description of the incident">
          <TextArea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe what happened, who was present and anything you noticed before or after." />
        </Field>
        <Field label="Immediate actions taken">
          <TextArea value={form.immediate_actions} onChange={(e) => set('immediate_actions', e.target.value)} placeholder="e.g. First aid given, supervisor notified, participant comforted." />
        </Field>
        <p className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-foreground/60">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          Critical incidents (serious injury, abuse or neglect) must also be reported verbally to your supervisor straight away.
        </p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit incident report'}
          </button>
        </div>
      </form>
    </div>
  );
}