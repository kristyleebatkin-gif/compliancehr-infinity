import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send, Headset } from 'lucide-react';
import { SUPPORT_MODULES, TECH_TOPICS } from '@/lib/helpCentreExtras';

const URGENCIES = ['Low', 'Medium', 'High', 'Urgent'];
const blank = { topic: '', module: '', description: '', timing: '', error_message: '', tried: '', urgency: 'Medium', contact: '' };

export default function TechSupportForm() {
  const { toast } = useToast();
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then((me) => setForm((f) => ({ ...f, contact: me?.email || '' }))).catch(() => {});
  }, []);

  const submit = async () => {
    if (!form.topic || !form.module || !form.description.trim()) return;
    setSaving(true);
    try {
      await base44.functions.invoke('techSupportRequest', {
        kind: 'tech_support',
        subject: `${form.topic} (${form.module})`,
        module: form.module,
        description: form.description,
        priority: form.urgency,
        answers: {
          Topic: form.topic,
          'When it started / how often': form.timing,
          'Exact error message': form.error_message,
          'Already tried': form.tried,
          Urgency: form.urgency,
          'Contact for follow-up': form.contact,
        },
      });
      setForm({ ...blank, contact: form.contact });
      toast({ title: 'Technical support request sent', description: 'Your answers were emailed to the support desk, which will follow up using the contact details provided.' });
    } finally {
      setSaving(false);
    }
  };

  const ready = form.topic && form.module && form.description.trim();

  return (
    <Card className="overflow-hidden border-sky-300/50 shadow-panel">
      <div className="relative bg-gradient-to-r from-sky-700 via-sky-600 to-blue-600 p-5 text-white">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-400/30 blur-2xl" />
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-2.5"><Headset className="h-6 w-6" /></div>
          <div>
            <p className="text-lg font-bold">Technical support</p>
            <p className="text-xs text-sky-200">Complete the questions below and they are emailed straight to the support desk. Everything marked * is needed so we can help fast.</p>
          </div>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>What do you need help with? *</Label>
            <Select value={form.topic || undefined} onValueChange={(v) => setForm({ ...form, topic: v })}>
              <SelectTrigger><SelectValue placeholder="Choose the topic" /></SelectTrigger>
              <SelectContent>{TECH_TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Which module or page? *</Label>
            <Select value={form.module || undefined} onValueChange={(v) => setForm({ ...form, module: v })}>
              <SelectTrigger><SelectValue placeholder="Choose the module" /></SelectTrigger>
              <SelectContent className="max-h-64">{SUPPORT_MODULES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label>What happened? *</Label>
            <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe exactly what you were doing and what went wrong." />
          </div>
          <div className="grid gap-1.5">
            <Label>When did it start / how often?</Label>
            <Input value={form.timing} onChange={(e) => setForm({ ...form, timing: e.target.value })} placeholder="e.g. since Monday, every time I open it" />
          </div>
          <div className="grid gap-1.5">
            <Label>Exact error message (if any)</Label>
            <Input value={form.error_message} onChange={(e) => setForm({ ...form, error_message: e.target.value })} placeholder="Copy the message exactly, or leave blank" />
          </div>
          <div className="grid gap-1.5">
            <Label>What have you already tried?</Label>
            <Input value={form.tried} onChange={(e) => setForm({ ...form, tried: e.target.value })} placeholder="e.g. refreshed, different browser, checked System Health" />
          </div>
          <div className="grid gap-1.5">
            <Label>How urgent is it? *</Label>
            <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{URGENCIES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label>Contact for follow-up</Label>
            <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Email or phone for the reply" />
          </div>
          <div className="md:col-span-2">
            <Button onClick={submit} disabled={saving || !ready} className="bg-sky-600 text-white hover:bg-sky-700">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Send to support desk
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}