import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send, LifeBuoy } from 'lucide-react';
import { format } from 'date-fns';

const MODULES = [
  'Dashboard', 'Intake Centre', 'Document Vault', 'Company Safe', 'Staff Profiles', 'Participant Profiles',
  'Visual Boards', 'Communication Centre', 'Incident Clinic', 'Risk Reporting', 'Compliance & Report Centre',
  'Training Centre', 'Certificates', 'Asset Management', 'Rostering', 'Invoicing Centre', 'Goal Progress',
  'Emergency Response', 'Meeting Centre', 'Data Control Panel', 'Users & Permissions Hub', 'Receipt Hub',
  'Equipment & MSDS', 'Referral & Support', 'NDIS Provider Portal', 'NDIS Updates & News', 'Quote Centre',
  'Program Design Centre', 'Key Personnel Contacts', 'Volunteering & Student Placement', 'Task Dashboard',
  'Feedback & Surveys', 'Quality & Improvement', 'Help Centre',
];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function SupportTickets() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ subject: '', module: 'General', description: '', priority: 'Medium' });
  const [user, setUser] = useState(null);

  const load = useCallback(async (currentUser) => {
    try {
      const page = await base44.entities.HelpDeskTicket.filter(
        { requested_email: currentUser.email },
        { sort: '-created_date', limit: 30 },
      );
      setTickets(page.items);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    base44.auth.me().then((me) => { setUser(me); load(me); }).catch((e) => console.error(e));
  }, [load]);

  const submit = async () => {
    if (!form.subject.trim()) return;
    setSaving(true);
    try {
      await base44.functions.invoke('techSupportRequest', {
        kind: 'support_ticket',
        subject: form.subject,
        module: form.module === 'General' ? '' : form.module,
        description: form.description,
        priority: form.priority,
      });
      setForm({ subject: '', module: 'General', description: '', priority: 'Medium' });
      await load(user);
      toast({ title: 'Support request logged', description: 'Your ticket is in the queue - a response will appear against it here.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-brand/10 p-2"><LifeBuoy className="h-4 w-4 text-brand" /></div>
            <p className="font-semibold">Raise a support request</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Tell us what you need help with. Urgent issues affecting participants should use the escalation paths (000 / 13HEALTH) first.</p>
          <div className="mt-4 grid gap-3">
            <div className="grid gap-1.5"><Label>Subject *</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Cannot export the risk register" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Module</Label>
                <Select value={form.module} onValueChange={(v) => setForm({ ...form, module: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General / not module specific</SelectItem>
                    {MODULES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5"><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What were you doing, and what happened?" /></div>
            <Button onClick={submit} disabled={saving || !form.subject.trim()}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Submit request</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="font-semibold">My support requests ({tickets.length})</p>
          {tickets.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No requests yet. Raise one on the left if the self-help guides did not solve it.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {tickets.map((t) => (
                <div key={t.id} className="rounded-lg border border-border/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{t.subject}</p>
                    <div className="flex items-center gap-1.5">
                      {t.priority && t.priority !== 'Medium' && <Badge variant="outline" className="text-[10px]">{t.priority}</Badge>}
                      <Badge className={statusTone(t.status)}>{t.status}</Badge>
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.module ? `${t.module} · ` : ''}Raised {t.created_date ? format(new Date(t.created_date), 'd MMM yyyy') : ''}</p>
                  {t.description && <p className="mt-1.5 text-xs text-foreground/70">{t.description}</p>}
                  {t.response && (
                    <div className="mt-2 rounded-md bg-brand/5 p-2 text-xs"><span className="font-semibold text-brand">Support response: </span>{t.response}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}