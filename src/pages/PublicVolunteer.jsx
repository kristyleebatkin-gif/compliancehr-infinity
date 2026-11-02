import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, HeartHandshake, ArrowRight, Send } from 'lucide-react';
import PublicPageShell from '@/components/landing/PublicPageShell';

// Public volunteer / student placement interest form. Creates a
// VolunteerInterest record through publicSubmissions (service-role endpoint).
export default function PublicVolunteer() {
  const [challenge] = useState(() => ({ a: 5, b: 2 }));
  const [form, setForm] = useState({
    interest_type: '', full_name: '', email: '', phone: '', suburb: '',
    institution_name: '', course_name: '', preferred_service_area: '',
    availability: '', relevant_experience: '', motivation: '', privacy_consent: false,
    captcha_answer: '', website: '',
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: typeof e === 'string' ? e : e.target.value }));

  const submit = async () => {
    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim() || !form.motivation.trim()) {
      setError('Please fill in your name, email, phone and why you would like to join us.');
      return;
    }
    if (!form.privacy_consent) {
      setError('Please accept the privacy notice to continue.');
      return;
    }
    if (Number(String(form.captcha_answer).trim()) !== challenge.a + challenge.b) {
      setError(`Please answer the verification check (${challenge.a} + ${challenge.b}).`);
      return;
    }
    setSending(true);
    setError('');
    try {
      await base44.functions.invoke('publicSubmissions', { kind: 'volunteer_interest', ...form, challenge_a: challenge.a, challenge_b: challenge.b });
      setDone(true);
    } catch (e) {
      setError(e?.response?.data?.error || 'Could not submit right now. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <PublicPageShell>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0072FF]/10">
            <HeartHandshake className="h-7 w-7 text-[#0072FF]" />
          </div>
          <h1 className="mt-4 font-editorial text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A2B6D]">
            Thank you, {form.full_name.split(' ')[0]}!
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#0A2B6D]/75">
            Your interest has been registered. Our team will review it and be in touch about the next
            steps, including the checks and induction.
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
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#00C6FF]/15">
          <HeartHandshake className="h-6 w-6 text-[#0072FF]" />
        </div>
        <div>
          <span className="inline-flex items-center rounded-full bg-[#0A2B6D] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
            Volunteer &amp; Placement Portal
          </span>
          <h1 className="mt-1.5 font-editorial text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A2B6D]">
            Volunteer with us
          </h1>
          <p className="mt-1 text-sm text-[#0A2B6D]/75">
            Register your interest in volunteering or a student placement.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <Label>I would like to apply as a</Label>
          <Select value={form.interest_type} onValueChange={set('interest_type')}>
            <SelectTrigger className="mt-1.5 bg-white"><SelectValue placeholder="Volunteer or student placement" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Volunteer">Volunteer</SelectItem>
              <SelectItem value="Student Placement">Student Placement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="pv-name">Full name *</Label>
          <Input id="pv-name" className="mt-1.5 bg-white" value={form.full_name} onChange={set('full_name')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pv-email">Email *</Label>
            <Input id="pv-email" type="email" className="mt-1.5 bg-white" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <Label htmlFor="pv-phone">Phone *</Label>
            <Input id="pv-phone" className="mt-1.5 bg-white" value={form.phone} onChange={set('phone')} />
          </div>
        </div>
        <div>
          <Label htmlFor="pv-suburb">Suburb</Label>
          <Input id="pv-suburb" className="mt-1.5 bg-white" value={form.suburb} onChange={set('suburb')} />
        </div>
        {form.interest_type === 'Student Placement' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pv-inst">Education institution</Label>
              <Input id="pv-inst" className="mt-1.5 bg-white" value={form.institution_name} onChange={set('institution_name')} />
            </div>
            <div>
              <Label htmlFor="pv-course">Course</Label>
              <Input id="pv-course" className="mt-1.5 bg-white" value={form.course_name} onChange={set('course_name')} />
            </div>
          </div>
        )}
        <div>
          <Label htmlFor="pv-avail">Availability</Label>
          <Input id="pv-avail" className="mt-1.5 bg-white" placeholder="e.g. Weekday mornings, weekends" value={form.availability} onChange={set('availability')} />
        </div>
        <div>
          <Label htmlFor="pv-exp">Relevant experience</Label>
          <Textarea id="pv-exp" className="mt-1.5 min-h-[80px] bg-white" value={form.relevant_experience} onChange={set('relevant_experience')} />
        </div>
        <div>
          <Label htmlFor="pv-mot">Why would you like to join us? *</Label>
          <Textarea id="pv-mot" className="mt-1.5 min-h-[110px] bg-white" value={form.motivation} onChange={set('motivation')} />
        </div>
        <div className="hidden" aria-hidden="true">
          <Label htmlFor="pv-website">Website</Label>
          <Input id="pv-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
        </div>
        <div>
          <Label htmlFor="pv-captcha">Human verification: What is {challenge.a} + {challenge.b}? *</Label>
          <Input id="pv-captcha" inputMode="numeric" className="mt-1.5 max-w-[160px] bg-white" placeholder="Enter sum" value={form.captcha_answer} onChange={set('captcha_answer')} />
        </div>
        <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-semibold leading-relaxed text-[#0A2B6D]/80">
          <input
            type="checkbox"
            checked={form.privacy_consent}
            onChange={(e) => setForm((f) => ({ ...f, privacy_consent: e.target.checked }))}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300"
          />
          <span>I consent to my details being collected and used to assess my application, in line with the privacy policy. *</span>
        </label>
        {error && <p className="rounded-xl bg-[#FF2E9A]/10 px-3 py-2 text-sm font-bold text-[#FF2E9A]">{error}</p>}
        <Button
          onClick={submit}
          disabled={sending}
          className="w-full rounded-xl bg-[#0A2B6D] py-5 text-sm font-extrabold text-white hover:bg-[#0072FF]"
        >
          {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {sending ? 'Submitting...' : 'Submit interest'}
        </Button>
      </div>
    </PublicPageShell>
  );
}