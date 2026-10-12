import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mail, Paperclip, X } from 'lucide-react';
import { loadCommContacts, loadManagementEmails } from '@/lib/commTypes';
import { logCommunicationRegister } from '@/lib/commRouting';
import ContactPicker from './ContactPicker';

export default function ProfessionalEmail() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [management, setManagement] = useState([]);
  const [selected, setSelected] = useState([]);
  const [manual, setManual] = useState('');
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10), subject: '', attention: '', greeting: 'Greetings,', body: '',
  });

  useEffect(() => {
    (async () => {
      setContacts(await loadCommContacts());
      setManagement(await loadManagementEmails());
    })();
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const groupSelect = (group) => {
    if (group === 'All staff') setSelected(contacts.filter((c) => c.type === 'Staff').map((c) => c.email));
    else if (group === 'Management team') setSelected(management.map((m) => m.email));
    else if (group === 'All participants') setSelected(contacts.filter((c) => c.type === 'Participant').map((c) => c.email));
    else if (group === 'Clear') setSelected([]);
  };

  const addFiles = (e) => setFiles((prev) => [...prev, ...Array.from(e.target.files || [])].slice(0, 5));

  const send = async () => {
    const recipients = [...new Set([
      ...selected,
      ...manual.split(/[,;]/).map((s) => s.trim()).filter(Boolean),
    ])];
    if (!recipients.length || !form.subject.trim() || !form.body.trim()) {
      toast({ title: 'At least one recipient, a subject and a message are required', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const uploaded = [];
      for (const file of files.slice(0, 5)) {
        const res = await base44.integrations.Core.UploadPublicFile({ file });
        if (res?.file_url) uploaded.push({ filename: file.name, file_url: res.file_url });
      }
      const response = await base44.functions.invoke('sendProfessionalEmail', {
        recipients,
        subject: form.subject,
        attention: form.attention,
        greeting: form.greeting,
        body: form.body,
        date: form.date,
        attachments: uploaded,
      });
      if (response.data?.error) throw new Error(response.data.error);
      const user = await base44.auth.me();
      const record = await base44.entities.CommunicationEntry.create({
        entry_kind: 'Email',
        person_type: 'General',
        subject: form.subject,
        attention: form.attention,
        body: form.body,
        entry_date: form.date,
        entry_time: new Date().toTimeString().slice(0, 5),
        attachments_json: JSON.stringify(uploaded.map((u) => ({ name: u.filename, uri: u.file_url }))),
        recipients_json: JSON.stringify(recipients.map((r) => ({ email: r }))),
        send_copy_emails: recipients,
        email_sent: true,
        sender_name: user?.full_name || '',
        sender_email: user?.email || '',
        module: 'Communications',
      });
      await logCommunicationRegister(record);
      toast({
        title: `Email sent to ${response.data.sent} recipient${response.data.sent === 1 ? '' : 's'}`,
        description: response.data.failed?.length ? `Could not send to: ${response.data.failed.join(', ')}` : 'A copy is saved in the communication diary and each recipient\'s inbox.',
      });
      setForm({ date: new Date().toISOString().slice(0, 10), subject: '', attention: '', greeting: 'Greetings,', body: '' });
      setFiles([]);
      setSelected([]);
    } catch (error) {
      toast({ title: 'Send failed', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><Mail className="h-4 w-4 text-brand" />Send a professional email</div>
      <p className="mb-4 text-xs text-muted-foreground">Every email is wrapped in the company letterhead: business name and logo header, date, subject, attention line and greeting, then a footer with the administrative team, ABN, contact details, business goal, mission, vision, values, key personnel and a confidentiality disclaimer. Attachments are stored publicly so the mail service can deliver them.</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-1.5 md:col-span-2">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => groupSelect('All staff')}>Select all staff</Button>
            <Button variant="outline" size="sm" onClick={() => groupSelect('Management team')}>Select management team</Button>
            <Button variant="outline" size="sm" onClick={() => groupSelect('All participants')}>Select all participants</Button>
            {selected.length > 0 && <Button variant="ghost" size="sm" onClick={() => groupSelect('Clear')}>Clear ({selected.length})</Button>}
          </div>
          <Label>Recipients (tick one, several for bulk, or type addresses below)</Label>
          <ContactPicker contacts={contacts} selected={selected} onChange={setSelected} />
          <Input placeholder="...or type extra email addresses, comma separated" value={manual} onChange={(e) => setManual(e.target.value)} />
        </div>
        <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={set('date')} /></div>
        <div className="grid gap-1.5"><Label>Subject *</Label><Input value={form.subject} onChange={set('subject')} /></div>
        <div className="grid gap-1.5"><Label>Attention line</Label><Input placeholder="e.g. Ms J Smith, Plan Manager" value={form.attention} onChange={set('attention')} /></div>
        <div className="grid gap-1.5"><Label>Greeting</Label><Input value={form.greeting} onChange={set('greeting')} /></div>
        <div className="grid gap-1.5 md:col-span-2"><Label>Email body *</Label><Textarea rows={6} value={form.body} onChange={set('body')} /></div>
        <div className="grid gap-1.5 md:col-span-2">
          <Label>Attach documents (up to 5)</Label>
          <Input type="file" multiple onChange={addFiles} className="h-9" />
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span key={`${f.name}-${i}`} className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
                  <Paperclip className="h-3 w-3" />{f.name}
                  <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={send} disabled={sending}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}Send email</Button>
      </div>
    </div>
  );
}