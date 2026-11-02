import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MessageCircleWarning, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import PublicPageShell from '@/components/landing/PublicPageShell';

// Public complaint form: anyone visiting the provider's site can raise a
// complaint without logging in. Creates the record through publicSubmissions.
export default function PublicComplaint() {
  const [challenge] = useState(() => ({ a: 4, b: 3 }));
  const [form, setForm] = useState({ complainant_name: '', complainant_relationship: '', category: '', title: '', description: '', captcha_answer: '', website: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: typeof e === 'string' ? e : e.target.value }));

  const submit = async () => {
    if (!form.complainant_name.trim() || !form.title.trim() || !form.description.trim()) {
      setError('Please fill in your name, a short subject and the details.');
      return;
    }
    if (Number(String(form.captcha_answer).trim()) !== challenge.a + challenge.b) {
      setError(`Please answer the verification check (${challenge.a} + ${challenge.b}).`);
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await base44.functions.invoke('publicSubmissions', { kind: 'complaint', ...form, challenge_a: challenge.a, challenge_b: challenge.b });
      setReference(res.data.reference);
    } catch (e) {
      setError(e?.response?.data?.error || 'Could not submit right now. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (reference) {
    return (
      <PublicPageShell>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0072FF]/10">
            <ShieldCheck className="h-7 w-7 text-[#0072FF]" />
          </div>
          <h1 className="mt-4 font-editorial text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A2B6D]">
            Complaint received
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#0A2B6D]/75">
            Thank you for letting us know. Your reference number is{' '}
            <span className="font-extrabold text-[#5A00D6]">{reference}</span>. A team member will
            acknowledge your complaint and be in touch.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A2B6D] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#0072FF]"
          >
            <span>Back to website</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell>
      <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FF2E9A]/10">
          <MessageCircleWarning className="h-6 w-6 text-[#FF2E9A]" />
        </div>
        <div>
          <span className="inline-flex items-center rounded-full bg-[#0A2B6D] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
            Public Feedback Portal
          </span>
          <h1 className="mt-1.5 font-editorial text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A2B6D]">
            Raise a complaint
          </h1>
          <p className="mt-1 text-sm text-[#0A2B6D]/75">
            Your feedback helps us improve. Every complaint is formally tracked and acknowledged.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <Label htmlFor="pc-name">Your name *</Label>
          <Input id="pc-name" className="mt-1.5 bg-white" value={form.complainant_name} onChange={set('complainant_name')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>I am a</Label>
            <Select value={form.complainant_relationship} onValueChange={set('complainant_relationship')}>
              <SelectTrigger className="mt-1.5 bg-white"><SelectValue placeholder="Select relationship" /></SelectTrigger>
              <SelectContent>
                {['Participant', 'Family Member', 'Staff', 'Advocate', 'Other'].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={set('category')}>
              <SelectTrigger className="mt-1.5 bg-white"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {['Service Quality', 'Staff Conduct', 'Communication', 'Safety', 'Financial', 'Other'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="pc-subject">Subject *</Label>
          <Input id="pc-subject" className="mt-1.5 bg-white" placeholder="Short summary of the issue" value={form.title} onChange={set('title')} />
        </div>
        <div>
          <Label htmlFor="pc-details">What happened? *</Label>
          <Textarea id="pc-details" className="mt-1.5 min-h-[130px] bg-white" placeholder="Please describe what happened, when, and who was involved." value={form.description} onChange={set('description')} />
        </div>
        <div className="hidden" aria-hidden="true">
          <Label htmlFor="pc-website">Website</Label>
          <Input id="pc-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
        </div>
        <div>
          <Label htmlFor="pc-captcha">Human verification: What is {challenge.a} + {challenge.b}? *</Label>
          <Input id="pc-captcha" inputMode="numeric" className="mt-1.5 max-w-[160px] bg-white" placeholder="Enter sum" value={form.captcha_answer} onChange={set('captcha_answer')} />
        </div>
        {error && <p className="rounded-xl bg-[#FF2E9A]/10 px-3 py-2 text-sm font-bold text-[#FF2E9A]">{error}</p>}
        <Button
          onClick={submit}
          disabled={sending}
          className="w-full rounded-xl bg-[#0A2B6D] py-5 text-sm font-extrabold text-white hover:bg-[#0072FF]"
        >
          {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
          {sending ? 'Submitting...' : 'Submit complaint'}
        </Button>
        <p className="flex items-start justify-center gap-1.5 text-center text-[11px] leading-relaxed text-[#0A2B6D]/60">
          <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-[#0072FF]" />
          <span>Handled under our complaints policy. If your complaint concerns your safety, please also call 000 in an emergency.</span>
        </p>
      </div>
    </PublicPageShell>
  );
}