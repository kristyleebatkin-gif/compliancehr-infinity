import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Field, TextInput, TextArea } from '@/components/Field';
import { CheckCircle2, MessageSquareWarning } from 'lucide-react';
import { format } from 'date-fns';

const blank = {
  name: '',
  issue: '',
  potential_solution: '',
};

export default function IssueSubmitPortal() {
  const [form, setForm] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.issue) return;
    setSubmitting(true);
    try {
      const record = {
        ...form,
        date: format(new Date(), 'yyyy-MM-dd'),
        reported_by: me?.full_name || 'Staff',
        team_worker_ids: me?.id ? [me.id] : [],
      };
      const created = await base44.entities.IssueConcernBarrier.create(record);
      setSubmitted(created);
      setForm(blank);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl p-3 md:p-5">
        <div className="rounded-2xl border border-safe/30 bg-safe/5 p-10 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-safe" />
          <h2 className="mt-4 text-xl font-semibold">Issue submitted</h2>
          <p className="mt-2 text-sm text-foreground/60">
            Your issue, concern or barrier has been sent to the central Issues &amp; Concerns register. Management will follow up with you on the outcome.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button onClick={() => setSubmitted(null)} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90">Submit another issue</button>
            <Link to="/my-work" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Back to My Work</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-3 md:p-5 space-y-4">
      <PageHeader
        title="Report an Issue, Concern or Barrier"
        subtitle="A simple form for staff to raise anything getting in the way of good support. Every submission goes to management for follow-up."
      />

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-5 md:p-6">
        <Field label="Who or what is this about?">
          <TextInput value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Participant name, a workplace, or a process" required />
        </Field>
        <Field label="What is the issue, concern or barrier?">
          <TextArea value={form.issue} onChange={(e) => set('issue', e.target.value)} placeholder="Describe what is happening, when it started and how it is affecting you or the people you support." required />
        </Field>
        <Field label="Your idea for a solution (optional)">
          <TextArea value={form.potential_solution} onChange={(e) => set('potential_solution', e.target.value)} placeholder="If you have a suggestion that would fix or reduce this, tell us here." />
        </Field>
        <p className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-foreground/60">
          <MessageSquareWarning className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          This goes to management, not the participant or their family. For urgent safety matters report an incident instead.
        </p>
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit issue or concern'}
          </button>
        </div>
      </form>
    </div>
  );
}