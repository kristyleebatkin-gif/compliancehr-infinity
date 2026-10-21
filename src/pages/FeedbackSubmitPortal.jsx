import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Field, TextInput, Select, TextArea } from '@/components/Field';
import { CheckCircle2, ThumbsUp } from 'lucide-react';

const TYPES = ['Feedback', 'Complaint'];
const RATINGS = ['1', '2', '3', '4', '5'];

const blank = {
  type: 'Feedback',
  subject: '',
  message: '',
  rating: '',
};

export default function FeedbackSubmitPortal() {
  const [form, setForm] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;
    setSubmitting(true); setError('');
    try {
      await base44.entities.Feedback.create({
        ...form,
        rating: form.rating ? Number(form.rating) : undefined,
        submitted_by: me?.full_name || 'Staff',
        received_via: 'In-app form',
        received_date: new Date().toISOString(),
        status: 'Received',
      });
      setSubmitted(true);
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
          <h2 className="mt-4 text-xl font-semibold">Thank you</h2>
          <p className="mt-2 text-sm text-foreground/60">
            Your feedback has been sent to the Feedback &amp; Complaints register for review. It will appear in your My Work dashboard with its status.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button onClick={() => setSubmitted(false)} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90">Submit more feedback</button>
            <Link to="/my-work" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Back to My Work</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-3 md:p-5 space-y-4">
      <PageHeader
        title="Share Feedback or a Complaint"
        showCompliance={me?.role !== 'Employee'} showAudit={me?.role !== 'Employee'} showAlerts={me?.role !== 'Employee'}
        subtitle="Tell us what is working well, or raise a complaint. Every submission goes to the Feedback & Complaints register for review."
      />

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-5 md:p-6">
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Type"><Select value={form.type} onChange={(e) => set('type', e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
          <Field label="Rating (optional)"><Select value={form.rating} onChange={(e) => set('rating', e.target.value)}><option value="">No rating</option>{RATINGS.map((r) => <option key={r} value={r}>{r} / 5</option>)}</Select></Field>
        </div>
        <Field label="Subject">
          <TextInput value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="e.g. Great support from the Tuesday team" required />
        </Field>
        <Field label="Your message">
          <TextArea value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="Tell us what happened, what worked well, or what you would like to change." required />
        </Field>
        <p className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-foreground/60">
          <ThumbsUp className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          Complaints are reviewed by management. If you would prefer to speak to someone directly, contact your supervisor.
        </p>
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}