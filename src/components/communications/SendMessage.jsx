import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';

export default function SendMessage() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      const contactsMap = new Map();
      try {
        const users = await base44.entities.User.list({ sort: 'full_name', limit: 200, fields: ['full_name', 'email'] });
        (users || []).forEach((u) => u.email && contactsMap.set(u.email, `${u.full_name || u.email} (app user)`));
      } catch { /* user list may be restricted */ }
      try {
        const staff = await base44.entities.StaffProfile.filter({}, { limit: 200, fields: ['full_name', 'email'] });
        (staff.items || []).forEach((s) => s.email && !contactsMap.has(s.email) && contactsMap.set(s.email, `${s.full_name} (staff)`));
      } catch { /* ignore */ }
      try {
        const participants = await base44.entities.ParticipantProfile.filter({}, { limit: 200, fields: ['full_name', 'email'] });
        (participants.items || []).forEach((p) => p.email && !contactsMap.has(p.email) && contactsMap.set(p.email, `${p.full_name} (participant)`));
      } catch { /* ignore */ }
      setContacts([...contactsMap.entries()].map(([email, label]) => ({ email, label })));
    })();
  }, []);

  const send = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      toast({ title: 'Recipient, subject and message are required', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const response = await base44.functions.invoke('sendAppEmail', { to: to.trim(), subject, body });
      if (response.data?.error) throw new Error(response.data.error);
      toast({ title: 'Email sent' });
      setSubject('');
      setBody('');
    } catch (error) {
      toast({ title: 'Send failed', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><Send className="h-4 w-4 text-brand" />Send an email</div>
      <p className="mb-4 text-xs text-muted-foreground">Emails are delivered to registered app users, staff and participant contacts on file. Text (SMS) messaging needs a separate SMS provider - ask us to connect one if you need it.</p>
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label>Recipient</Label>
          <select value={to} onChange={(e) => setTo(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">— Select a contact —</option>
            {contacts.map((c) => <option key={c.email} value={c.email}>{c.label}</option>)}
          </select>
          <Input placeholder="...or type an email address" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="grid gap-1.5"><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label>Message</Label><Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} /></div>
        <div className="flex justify-end">
          <Button onClick={send} disabled={sending}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Send email</Button>
        </div>
      </div>
    </div>
  );
}