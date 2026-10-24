import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MessageCircleWarning, ShieldCheck } from 'lucide-react';
import { COMPANY_LOGO_URL, COMPANY_NAME, COMPANY_SLOGAN } from '@/lib/companyBranding';

// Public complaint form: anyone visiting the provider's site can raise a
// complaint without logging in. Creates the record through publicSubmissions.
export default function PublicComplaint() {
  const [form, setForm] = useState({ complainant_name: '', complainant_relationship: '', category: '', title: '', description: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: typeof e === 'string' ? e : e.target.value }));

  const submit = async () => {
    if (!form.complainant_name.trim() || !form.title.trim() || !form.description.trim()) {
      setError('Please fill in your name, a short subject and the details.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await base44.functions.invoke('publicSubmissions', { kind: 'complaint', ...form });
      setReference(res.data.reference);
    } catch (e) {
      setError(e?.response?.data?.error || 'Could not submit right now. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 font-elegant antialiased sm:py-16">
      <div className="mx-auto w-full max-w-xl space-y-4">
        <div className="flex items-center justify-between rounded-2xl px-4 py-3 text-white shadow-md" style={{ background: 'var(--header-gradient)' }}>
          <div className="flex items-center gap-3">
            <img src={COMPANY_LOGO_URL} alt={COMPANY_NAME} className="h-10 w-10 rounded-lg border border-white/30 bg-white object-contain p-0.5" />
            <div>
              <div className="text-sm font-black tracking-tight text-white">{COMPANY_NAME}</div>
              <div className="text-[10px] font-semibold text-white/95">{COMPANY_SLOGAN}</div>
            </div>
          </div>
          <Link to="/" className="rounded-lg bg-white px-3 py-1.5 text-xs font-extrabold text-violet-900 shadow-sm hover:bg-violet-50">
            Home
          </Link>
        </div>
        {reference ? (
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl shadow-emerald-500/10 dark:border-emerald-500/20 dark:bg-card">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
              <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="mt-4 font-editorial text-2xl font-semibold text-foreground">Complaint received</h1>
            <p className="mt-2 text-sm text-foreground/60">
              Thank you for letting us know. Your reference number is <span className="font-bold text-foreground">{reference}</span>. A team member will acknowledge your complaint and be in touch.
            </p>
            <Button asChild variant="outline" className="mt-6 rounded-full">
              <Link to="/">Back to website</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-violet-500/10 sm:p-8 dark:border-white/10 dark:bg-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-rose-500/10 p-2.5"><MessageCircleWarning className="h-5 w-5 text-rose-600" /></div>
              <div>
                <h1 className="font-editorial text-2xl font-semibold text-foreground">Raise a complaint</h1>
                <p className="text-xs text-muted-foreground">Your feedback helps us improve. Every complaint is formally tracked and acknowledged.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="pc-name">Your name *</Label>
                <Input id="pc-name" className="mt-1.5" value={form.complainant_name} onChange={set('complainant_name')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>I am a</Label>
                  <Select value={form.complainant_relationship} onValueChange={set('complainant_relationship')}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select relationship" /></SelectTrigger>
                    <SelectContent>
                      {['Participant', 'Family Member', 'Staff', 'Advocate', 'Other'].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={set('category')}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {['Service Quality', 'Staff Conduct', 'Communication', 'Safety', 'Financial', 'Other'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="pc-subject">Subject *</Label>
                <Input id="pc-subject" className="mt-1.5" placeholder="Short summary of the issue" value={form.title} onChange={set('title')} />
              </div>
              <div>
                <Label htmlFor="pc-details">What happened? *</Label>
                <Textarea id="pc-details" className="mt-1.5 min-h-[120px]" placeholder="Please describe what happened, when, and who was involved." value={form.description} onChange={set('description')} />
              </div>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <Button onClick={submit} disabled={sending} className="w-full rounded-full">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {sending ? 'Submitting...' : 'Submit complaint'}
              </Button>
              <p className="text-center text-[11px] leading-relaxed text-foreground/45">
                Handled under our complaints policy. If your complaint concerns your safety, please also call 000 in an emergency.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}