import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight, Download, Loader2, NotebookPen, Paperclip } from 'lucide-react';
import { EMPLOYEE_LOG_TYPES, COMMON_SUBJECTS, loadCommContacts, loadManagementEmails, openAttachment, exportCsv } from '@/lib/commTypes';
import { logCommunicationRegister } from '@/lib/commRouting';
import { useRole } from '@/lib/useRole';
import ContactPicker from './ContactPicker';

export default function EmployeeCommLog({ selfOnly = false } = {}) {
  const { toast } = useToast();
  const { user } = useRole();
  const [staffList, setStaffList] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState([]);
  const [sendAdmins, setSendAdmins] = useState(false);
  const [sendManagement, setSendManagement] = useState(false);
  const [otherStaff, setOtherStaff] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [form, setForm] = useState({
    employee_name: '', log_type: EMPLOYEE_LOG_TYPES[0], subject: '', custom_subject: '',
    date: new Date().toISOString().slice(0, 10), time: '', staff_involved: [], body: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [entryPage, staffPage] = await Promise.all([
        base44.entities.CommunicationEntry.filter({ entry_kind: 'Employee Log' }, { sort: '-created_date', limit: 200 }),
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 300, fields: ['full_name'] }).catch(() => ({ items: [] })),
      ]);
      setItems(entryPage.items || []);
      setStaffList(staffPage.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const toggleStaff = (name) => set('staff_involved', form.staff_involved.includes(name)
    ? form.staff_involved.filter((s) => s !== name)
    : [...form.staff_involved, name]);

  const addFiles = (e) => setFiles((prev) => [...prev, ...Array.from(e.target.files || [])].slice(0, 5));

  const grouped = EMPLOYEE_LOG_TYPES.map((type) => ({ type, entries: items.filter((i) => (i.log_type || 'General Administration') === type
    && (!selfOnly || i.person_name === (user?.full_name || '') || i.sender_email === (user?.email || '') || (i.staff_involved || []).includes(user?.full_name || ''))) }))
    .filter((g) => g.entries.length > 0);

  const save = async () => {
    const subject = form.subject === 'Other' ? form.custom_subject : form.subject;
    if (!form.employee_name || !subject.trim() || !form.body.trim()) {
      toast({ title: 'Employee, subject and communication are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const uploaded = [];
      for (const file of files.slice(0, 5)) {
        const res = await base44.integrations.Core.UploadPrivateFile({ file });
        if (res?.file_uri) uploaded.push({ name: file.name, uri: res.file_uri });
      }
      const recipients = [];
      if (sendAdmins || sendManagement) {
        (await loadManagementEmails()).forEach((m) => {
          if (sendManagement && !recipients.some((r) => r.email === m.email)) recipients.push({ name: m.name, email: m.email, type: 'Management' });
        });
      }
      otherStaff.forEach((email) => {
        const found = staffContacts().find((c) => c.email === email);
        recipients.push({ name: found?.name || email, email, type: 'Staff' });
      });
      const emails = recipients.map((r) => r.email).filter(Boolean);
      const record = await base44.entities.CommunicationEntry.create({
        entry_kind: 'Employee Log',
        person_type: 'Employee',
        person_name: form.employee_name,
        log_type: form.log_type,
        subject,
        body: form.body,
        entry_date: form.date,
        entry_time: form.time,
        staff_involved: form.staff_involved,
        attachments_json: JSON.stringify(uploaded),
        recipients_json: JSON.stringify(recipients),
        send_copy_emails: emails,
        email_sent: emails.length > 0,
        sender_name: user?.full_name || '',
        sender_email: user?.email || '',
        module: 'Communications',
      });
      await logCommunicationRegister(record);
      if (emails.length) {
        try {
          await base44.functions.invoke('sendProfessionalEmail', {
            recipients: emails,
            subject: `Employee communication log: ${subject}`,
            body: `Employee: ${form.employee_name}\nLog type: ${form.log_type}\nDate: ${form.date} ${form.time || ''}\nStaff involved: ${form.staff_involved.join(', ') || '-'}\n\n${form.body}`,
            date: form.date,
          });
          await base44.entities.CommunicationEntry.update(record.id, { management_copy: true });
        } catch { /* email copy is best-effort */ }
      }
      toast({ title: 'Communication logged', description: 'Saved to the log and the employee profile.' });
      setForm({ employee_name: '', log_type: EMPLOYEE_LOG_TYPES[0], subject: '', custom_subject: '', date: new Date().toISOString().slice(0, 10), time: '', staff_involved: [], body: '' });
      setFiles([]); setSendAdmins(false); setSendManagement(false); setOtherStaff([]);
      await load();
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const staffContacts = () => staffList.map((s) => ({ email: s.email, name: s.full_name, type: 'Staff' })).filter((c) => c.email);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><NotebookPen className="h-4 w-4 text-brand" />Employee communication log</div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Employee *</Label>
            <select value={form.employee_name} onChange={(e) => set('employee_name', e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">- Select employee -</option>
              {staffList.map((s) => <option key={s.id} value={s.full_name}>{s.full_name}</option>)}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label>Communication log type</Label>
            <select value={form.log_type} onChange={(e) => set('log_type', e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              {EMPLOYEE_LOG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label>Common subject</Label>
            <select value={form.subject} onChange={(e) => set('subject', e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">- Select subject -</option>
              {COMMON_SUBJECTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {form.subject === 'Other' && (
            <div className="grid gap-1.5"><Label>Custom subject *</Label><Input value={form.custom_subject} onChange={(e) => set('custom_subject', e.target.value)} /></div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} /></div>
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label>Staff involved</Label>
            <div className="flex flex-wrap gap-1.5">
              {staffList.map((s) => (
                <label key={s.id} className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs ${form.staff_involved.includes(s.full_name) ? 'border-brand bg-accent text-accent-foreground' : 'border-border'}`}>
                  <input type="checkbox" className="hidden" checked={form.staff_involved.includes(s.full_name)} onChange={() => toggleStaff(s.full_name)} />
                  {s.full_name}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-1.5 md:col-span-2"><Label>Communication *</Label><Textarea rows={4} value={form.body} onChange={(e) => set('body', e.target.value)} /></div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label>Attachments (stored privately)</Label>
            <Input type="file" multiple onChange={addFiles} className="h-9" />
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {files.map((f, i) => <span key={i} className="rounded-full border px-2 py-0.5 text-xs"><Paperclip className="mr-1 inline h-3 w-3" />{f.name}</span>)}
              </div>
            )}
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Send a copy to</Label>
            <div className="flex flex-col gap-1.5 text-sm">
              <label className="flex items-center gap-2"><Checkbox checked={sendAdmins} onCheckedChange={(v) => setSendAdmins(Boolean(v))} />Administrators</label>
              <label className="flex items-center gap-2"><Checkbox checked={sendManagement} onCheckedChange={(v) => setSendManagement(Boolean(v))} />Management team</label>
              {staffContacts().length > 0 && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Other staff (email a professional copy):</p>
                  <ContactPicker contacts={staffContacts()} selected={otherStaff} onChange={setOtherStaff} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <NotebookPen className="h-4 w-4" />}Log communication</Button>
        </div>
      </div>

      <div className="flex justify-end">
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => exportCsv('employee-communication-log.csv', items.map((n) => ({
            log_type: n.log_type, employee: n.person_name, subject: n.subject, date: n.entry_date, time: n.entry_time,
            staff: (n.staff_involved || []).join('; '), sender: n.sender_name, communication: n.body,
          })))}><Download className="h-4 w-4" />Export log</Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground">No employee communications logged yet.</p>
      ) : (
        <div className="space-y-2">
          {grouped.map((group) => (
            <div key={group.type} className="rounded-xl border border-border/60">
              <button type="button" className="flex w-full items-center justify-between p-3 text-sm font-semibold" onClick={() => setExpanded({ ...expanded, [group.type]: !expanded[group.type] })}>
                <span className="flex items-center gap-2">{expanded[group.type] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}{group.type}<Badge variant="secondary">{group.entries.length}</Badge></span>
              </button>
              {expanded[group.type] && (
                <div className="space-y-2 border-t border-border/60 p-3">
                  {group.entries.map((n) => (
                    <div key={n.id} className="rounded-lg bg-muted/40 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{n.person_name} · {n.subject}</p>
                        <span className="text-xs text-muted-foreground">{[n.entry_date, n.entry_time, n.sender_name].filter(Boolean).join(' · ')}</span>
                      </div>
                      {n.body && <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/80">{n.body}</p>}
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {(n.staff_involved || []).length > 0 && <span>Staff: {n.staff_involved.join(', ')}</span>}
                        {n.management_copy && <span>Copy emailed</span>}
                      </div>
                      {(() => { try { return (JSON.parse(n.attachments_json || '[]') || []).length > 0; } catch { return false; } })() && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(() => { try { return JSON.parse(n.attachments_json || '[]'); } catch { return []; } })().map((a, i) => (
                            <Button key={i} variant="outline" size="sm" onClick={() => openAttachment(a)}><Paperclip className="h-3 w-3" />{a.name}</Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}