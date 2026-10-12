import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Megaphone } from 'lucide-react';
import { loadCommContacts, loadManagementEmails } from '@/lib/commTypes';
import { logCommunicationRegister } from '@/lib/commRouting';
import ContactPicker from './ContactPicker';

const GROUPS = ['All Staff', 'Management', 'All Participants', 'All Employees', 'Custom'];

export default function BulkMessage() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [management, setManagement] = useState([]);
  const [audience, setAudience] = useState('All Staff');
  const [custom, setCustom] = useState([]);
  const [form, setForm] = useState({ subject: '', message: '', date: new Date().toISOString().slice(0, 10), time: '' });
  const [emailCopies, setEmailCopies] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      setContacts(await loadCommContacts());
      setManagement(await loadManagementEmails());
    })();
  }, []);

  const resolve = () => {
    if (audience === 'All Staff') return contacts.filter((c) => c.type === 'Staff');
    if (audience === 'Management') return management.map((m) => ({ email: m.email, name: m.name, type: 'Management' }));
    if (audience === 'All Participants') return contacts.filter((c) => c.type === 'Participant');
    if (audience === 'All Employees') return contacts.filter((c) => c.type === 'Staff');
    return custom.map((email) => {
      const found = contacts.find((c) => c.email === email);
      return found || { email, name: email, type: 'Manual' };
    });
  };

  const send = async () => {
    const recipients = resolve();
    if (!form.subject.trim() || !form.message.trim() || recipients.length === 0) {
      toast({ title: 'Subject, message and recipients are required', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const emails = recipients.map((r) => r.email).filter(Boolean);
      if (emailCopies && emails.length) {
        const response = await base44.functions.invoke('sendProfessionalEmail', {
          recipients: emails, subject: form.subject, body: form.message, date: form.date,
        });
        if (response.data?.error) throw new Error(response.data.error);
      }
      const user = await base44.auth.me();
      const record = await base44.entities.CommunicationEntry.create({
        entry_kind: audience === 'Custom' ? 'Message' : 'Broadcast',
        person_type: audience.includes('Participant') ? 'Participant' : 'General',
        subject: form.subject,
        body: form.message,
        entry_date: form.date,
        entry_time: form.time || new Date().toTimeString().slice(0, 5),
        recipients_json: JSON.stringify(recipients.map((r) => ({ name: r.name, email: r.email, type: r.type }))),
        send_copy_emails: emailCopies ? emails : [],
        email_sent: Boolean(emailCopies && emails.length),
        sender_name: user?.full_name || '',
        sender_email: user?.email || '',
        module: 'Communications',
      });
      await logCommunicationRegister(record);
      toast({ title: `Message sent to ${recipients.length} recipient${recipients.length === 1 ? '' : 's'}`, description: 'Saved in the communication diary and every recipient\'s inbox.' });
      setForm({ subject: '', message: '', date: new Date().toISOString().slice(0, 10), time: '' });
      setCustom([]);
    } catch (error) {
      toast({ title: 'Send failed', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><Megaphone className="h-4 w-4 text-brand" />Bulk messages</div>
      <p className="mb-4 text-xs text-muted-foreground">Send one message to a whole group or a hand-picked list. It lands in the communication diary and each recipient&apos;s profile inbox, with optional professional email copies.</p>
      <div className="grid gap-3">
        <div className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <Button key={g} size="sm" variant={audience === g ? 'default' : 'outline'} onClick={() => setAudience(g)}>{g}</Button>
          ))}
        </div>
        {audience === 'Custom' && (
          <div className="grid gap-1.5">
            <Label>Recipients</Label>
            <ContactPicker contacts={contacts} selected={custom} onChange={setCustom} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5"><Label>Subject *</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
          </div>
        </div>
        <div className="grid gap-1.5"><Label>Message *</Label><Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={emailCopies} onCheckedChange={(v) => setEmailCopies(Boolean(v))} />
          Also email professional copies of this message to all recipients
        </label>
        <div className="flex justify-end">
          <Button onClick={send} disabled={sending}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}Send bulk message</Button>
        </div>
      </div>
    </div>
  );
}