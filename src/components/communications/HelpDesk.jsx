import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, LifeBuoy } from 'lucide-react';
import { APP_MODULES } from '@/lib/commTypes';

export default function HelpDesk() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ subject: '', module: APP_MODULES[0], priority: 'Medium', description: '' });

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.HelpDeskTicket.filter({}, { sort: '-created_date', limit: 100 });
      setItems(page.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.subject.trim() || !form.description.trim()) {
      toast({ title: 'Subject and description are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.HelpDeskTicket.create({
        ...form,
        requested_by: user?.full_name || '',
        requested_email: user?.email || '',
      });
      toast({ title: 'Support request lodged', description: 'The help desk will pick it up shortly.' });
      setForm({ subject: '', module: APP_MODULES[0], priority: 'Medium', description: '' });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const update = async (ticket, data) => {
    await base44.entities.HelpDeskTicket.update(ticket.id, {
      ...data,
      ...(data.status === 'Resolved' ? { resolved_date: new Date().toISOString().slice(0, 10) } : {}),
    });
    await load();
  };

  const priorityTone = (p) => ({ Urgent: 'destructive', High: 'destructive', Medium: 'secondary', Low: 'outline' }[p] || 'outline');
  const statusTone = (s) => ({ Open: 'default', 'In Progress': 'secondary', Resolved: 'outline' }[s] || 'outline');

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><LifeBuoy className="h-4 w-4 text-brand" />Help desk &amp; technical support</div>
        <p className="mb-4 text-xs text-muted-foreground">Lodge a technical or support request against any app module. Track progress and the support response here.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-1.5"><Label>Subject *</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Module</Label>
              <select value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                {APP_MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Priority</Label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                {['Low', 'Medium', 'High', 'Urgent'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-1.5 md:col-span-2"><Label>What do you need help with? *</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LifeBuoy className="h-4 w-4" />}Lodge request</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No support requests yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="rounded-xl border border-border/60 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-semibold">{t.subject}</span>
                  <Badge variant={priorityTone(t.priority)}>{t.priority}</Badge>
                  <Badge variant={statusTone(t.status)}>{t.status}</Badge>
                  {t.module && <Badge variant="outline">{t.module}</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={t.status}
                    onChange={(e) => update(t, { status: e.target.value })}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    {['Open', 'In Progress', 'Resolved'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className="text-xs text-muted-foreground">{t.requested_by || ''}{t.resolved_date ? ` · resolved ${t.resolved_date}` : ''}</span>
                </div>
              </div>
              {t.description && <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/80">{t.description}</p>}
              {t.response && <p className="mt-2 rounded-lg bg-muted/40 p-2.5 text-sm"><span className="font-semibold">Support response:</span> {t.response}</p>}
              {t.status !== 'Resolved' && (
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Add a support response..."
                    onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) { update(t, { response: e.target.value.trim() }); e.target.value = ''; } }}
                    className="h-8"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}