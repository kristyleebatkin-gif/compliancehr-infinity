import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Field, TextInput, Select, TextArea } from '@/components/Field';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

const TYPES = ['Risk', 'Hazard', 'Near Miss'];
const CATEGORIES = ['Operational', 'Clinical', 'Financial', 'Workplace Health & Safety', 'Participant', 'Compliance'];
const LIKELIHOODS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const CONSEQUENCES = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Severe'];

const blank = {
  title: '',
  report_type: 'Risk',
  category: 'Operational',
  participant_name: '',
  description: '',
  likelihood: 'Possible',
  consequence: 'Moderate',
};

export default function RiskSubmitPortal() {
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
    if (!form.title || !form.description) return;
    setSubmitting(true);
    setError('');
    try {
      const record = {
        ...form,
        risk_id: 'RSK-' + format(new Date(), 'yyyyMMdd') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
        identified_date: format(new Date(), 'yyyy-MM-dd'),
        owner: me?.full_name || 'Staff',
        status: 'Identified',
        rating: ['Low', 'Medium', 'High', 'Critical'][((LIKELIHOODS.indexOf(form.likelihood) + 1) * (CONSEQUENCES.indexOf(form.consequence) + 1)) <= 4 ? 0 : ((LIKELIHOODS.indexOf(form.likelihood) + 1) * (CONSEQUENCES.indexOf(form.consequence) + 1)) <= 9 ? 1 : ((LIKELIHOODS.indexOf(form.likelihood) + 1) * (CONSEQUENCES.indexOf(form.consequence) + 1)) <= 15 ? 2 : 3],
        source_entity_type: 'Staff Portal',
      };
      const created = await base44.entities.Risk.create(record);
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
          <h2 className="mt-4 text-xl font-semibold">Risk reported</h2>
          <p className="mt-2 text-sm text-foreground/60">
            Your report <span className="font-semibold">{submitted.risk_id}</span> has been sent to the Risk Register for assessment. The compliance team will review and follow up if more detail is needed.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button onClick={() => setSubmitted(null)} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90">Report another risk</button>
            <Link to="/risks" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">{me?.role === 'Employee' ? 'Back to risk reporting' : 'View risk register'}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-3 md:p-5 space-y-4">
      <PageHeader
        title="Report a Risk"
        subtitle="A simple form for staff to report a risk, hazard or near miss. Every submission goes straight to the Risk Register for assessment."
      />

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="What are you reporting?"><Select value={form.report_type} onChange={(e) => set('report_type', e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
          <Field label="Category"><Select value={form.category} onChange={(e) => set('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        </div>
        <Field label="Short title">
          <TextInput value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Wet floor in respite hallway" required />
        </Field>
        <Field label="Full description">
          <TextArea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the risk or hazard, where it is, and what could happen if it isn't addressed." required />
        </Field>
        <Field label="Participant involved (if any)"><TextInput value={form.participant_name} onChange={(e) => set('participant_name', e.target.value)} /></Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="How likely is it?"><Select value={form.likelihood} onChange={(e) => set('likelihood', e.target.value)}>{LIKELIHOODS.map((l) => <option key={l}>{l}</option>)}</Select></Field>
          <Field label="How bad would it be?"><Select value={form.consequence} onChange={(e) => set('consequence', e.target.value)}>{CONSEQUENCES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        </div>
        <p className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-foreground/60">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          If there is immediate danger, keep everyone safe first and contact your supervisor straight away.
        </p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit risk report'}
          </button>
        </div>
      </form>
    </div>
  );
}