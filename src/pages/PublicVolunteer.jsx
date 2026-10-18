import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, HeartHandshake } from 'lucide-react';

// Public volunteer / student placement interest form. Creates a
// VolunteerInterest record through publicSubmissions (service-role endpoint).
export default function PublicVolunteer() {
  const [form, setForm] = useState({
    interest_type: '', full_name: '', email: '', phone: '', suburb: '',
    institution_name: '', course_name: '', preferred_service_area: '',
    availability: '', relevant_experience: '', motivation: '', privacy_consent: false,
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
    setSending(true);
    setError('');
    try {
      await base44.functions.invoke('publicSubmissions', { kind: 'volunteer_interest', ...form });
      setDone(true);
    } catch (e) {
      setError(e?.response?.data?.error || 'Could not submit right now. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 font-elegant antialiased sm:py-16">
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl shadow-emerald-500/10 dark:border-emerald-500/20 dark:bg-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
            <HeartHandshake className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="mt-4 font-editorial text-2xl font-semibold text-foreground">Thank you, {form.full_name.split(' ')[0]}!</h1>
          <p className="mt-2 text-sm text-foreground/60">Your interest has been registered. Our team will review it and be in touch about the next steps, including the checks and induction.</p>
          <Button asChild variant="outline" className="mt-6 rounded-full">
            <Link to="/">Back to website</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 font-elegant antialiased sm:py-16">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-violet-500/10 sm:p-8 dark:border-white/10 dark:bg-card">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-teal-500/10 p-2.5"><HeartHandshake className="h-5 w-5 text-teal-600" /></div>
          <div>
            <h1 className="font-editorial text-2xl font-semibold text-foreground">Volunteer with us</h1>
            <p className="text-xs text-muted-foreground">Register your interest in volunteering or a student placement.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Label>I would like to apply as a</Label>
            <Select value={form.interest_type} onValueChange={set('interest_type')}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Volunteer or student placement" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Volunteer">Volunteer</SelectItem>
                <SelectItem value="Student Placement">Student Placement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pv-name">Full name *</Label>
            <Input id="pv-name" className="mt-1.5" value={form.full_name} onChange={set('full_name')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pv-email">Email *</Label>
              <Input id="pv-email" type="email" className="mt-1.5" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <Label htmlFor="pv-phone">Phone *</Label>
              <Input id="pv-phone" className="mt-1.5" value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div>
            <Label htmlFor="pv-suburb">Suburb</Label>
            <Input id="pv-suburb" className="mt-1.5" value={form.suburb} onChange={set('suburb')} />
          </div>
          {form.interest_type === 'Student Placement' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pv-inst">Education institution</Label>
                <Input id="pv-inst" className="mt-1.5" value={form.institution_name} onChange={set('institution_name')} />
              </div>
              <div>
                <Label htmlFor="pv-course">Course</Label>
                <Input id="pv-course" className="mt-1.5" value={form.course_name} onChange={set('course_name')} />
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="pv-avail">Availability</Label>
            <Input id="pv-avail" className="mt-1.5" placeholder="e.g. Weekday mornings, weekends" value={form.availability} onChange={set('availability')} />
          </div>
          <div>
            <Label htmlFor="pv-exp">Relevant experience</Label>
            <Textarea id="pv-exp" className="mt-1.5 min-h-[80px]" value={form.relevant_experience} onChange={set('relevant_experience')} />
          </div>
          <div>
            <Label htmlFor="pv-mot">Why would you like to join us? *</Label>
            <Textarea id="pv-mot" className="mt-1.5 min-h-[100px]" value={form.motivation} onChange={set('motivation')} />
          </div>
          <label className="flex items-start gap-2.5 rounded-xl bg-muted/60 p-3 text-xs leading-relaxed text-foreground/70">
            <input
              type="checkbox"
              checked={form.privacy_consent}
              onChange={(e) => setForm((f) => ({ ...f, privacy_consent: e.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-input"
            />
            I consent to my details being collected and used to assess my application, in line with the privacy policy. *
          </label>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <Button onClick={submit} disabled={sending} className="w-full rounded-full">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {sending ? 'Submitting...' : 'Submit interest'}
          </Button>
        </div>
      </div>
    </div>
  );
}