import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, NotebookPen, Paperclip, Trash2, X } from 'lucide-react';
import { NOTE_TYPES, SHIFT_TYPES, NOTE_TIPS, loadManagementEmails, openAttachment, exportCsv } from '@/lib/commTypes';
import { routeDiaryEntry } from '@/lib/commRouting';
import { useRole } from '@/lib/useRole';

const EMPTY = {
  participant_name: '', note_type: 'Shift Note', shift_type: '', staff_involved: [],
  date: new Date().toISOString().slice(0, 10), time: '', travel_km: '', travel_location: '',
  goal: '', medication_supervised: '', body: '', issues_concerns: '', incident_report: '',
};

export default function ShiftNotes({ selfOnly = false } = {}) {
  const { toast } = useToast();
  const { user } = useRole();
  const [participants, setParticipants] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [goals, setGoals] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState([]);
  const [managementCopy, setManagementCopy] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [filters, setFilters] = useState({ participant: '', note_type: '', shift_type: '', from: '', to: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [entryPage, participantPage, staffPage] = await Promise.all([
        base44.entities.CommunicationEntry.filter({ entry_kind: 'Shift Note' }, { sort: '-created_date', limit: 100 }),
        base44.entities.ParticipantProfile.filter({}, { sort: 'full_name', limit: 300, fields: ['full_name'] }).catch(() => ({ items: [] })),
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 300, fields: ['full_name'] }).catch(() => ({ items: [] })),
      ]);
      setItems(entryPage.items || []);
      setParticipants(participantPage.items || []);
      setStaffList(staffPage.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    (async () => {
      if (!form.participant_name) { setGoals([]); return; }
      try {
        const page = await base44.entities.Goal.filter({ participant_name: form.participant_name }, { limit: 100 });
        setGoals(page.items || []);
      } catch { setGoals([]); }
    })();
  }, [form.participant_name]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const toggleStaff = (name) => set('staff_involved', form.staff_involved.includes(name)
    ? form.staff_involved.filter((s) => s !== name)
    : [...form.staff_involved, name]);

  const addFiles = (e) => setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);

  const filtered = items.filter((n) => (!filters.participant || n.person_name === filters.participant)
    && (!selfOnly || (n.sender_email === (user?.email || '') || (n.staff_involved || []).includes(user?.full_name || '')))
    && (!filters.note_type || n.note_type === filters.note_type)
    && (!filters.shift_type || n.shift_type === filters.shift_type)
    && (!filters.from || (n.entry_date || '') >= filters.from)
    && (!filters.to || (n.entry_date || '') <= filters.to));

  const save = async () => {
    if (!form.participant_name || !form.date || !form.body.trim()) {
      toast({ title: 'Participant, date and what happened are required', variant: 'destructive' });
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
      const emails = managementCopy ? (await loadManagementEmails()).map((m) => m.email) : [];
      const subject = `${form.note_type} - ${form.participant_name} - ${form.date}`;
      const record = await base44.entities.CommunicationEntry.create({
        entry_kind: 'Shift Note',
        person_type: 'Participant',
        person_name: form.participant_name,
        note_type: form.note_type,
        shift_type: form.shift_type,
        travel_km: Number(form.travel_km) || 0,
        travel_location: form.travel_location,
        goal: form.goal,
        medication_supervised: form.medication_supervised,
        staff_involved: form.staff_involved,
        subject,
        body: form.body,
        issues_concerns: form.issues_concerns,
        incident_report: form.incident_report,
        entry_date: form.date,
        entry_time: form.time,
        attachments_json: JSON.stringify(uploaded),
        send_copy_emails: emails,
        management_copy: emails.length > 0,
        email_sent: emails.length > 0,
        sender_name: user?.full_name || '',
        sender_email: user?.email || '',
        module: 'Communications',
      });
      await routeDiaryEntry(record);
      if (form.goal) {
        const goalRec = goals.find((g) => g.goal === form.goal);
        try {
          await base44.entities.GoalProgressNote.create({
            goal_id: goalRec?.id || '',
            participant_name: form.participant_name,
            entry_type: form.note_type === 'Progress Reports' ? 'Progress Report' : 'Progress Note',
            notes: form.body,
            recorded_by: user?.full_name || '',
            recorded_date: form.date,
          });
          await base44.entities.CommunicationEntry.update(record.id, { goal_note_created: true });
        } catch { /* goal progress update is best-effort */ }
      }
      if (emails.length) {
        try {
          const detail = [
            `Type: ${form.note_type}`, `Participant: ${form.participant_name}`,
            form.shift_type && `Shift type: ${form.shift_type}`,
            form.staff_involved.length && `Staff: ${form.staff_involved.join(', ')}`,
            `Date: ${form.date} ${form.time || ''}`,
            form.travel_location && `Travel: ${form.travel_km || '0'} km at ${form.travel_location}`,
            form.medication_supervised && `Medication supervised: ${form.medication_supervised}`,
            form.goal && `Relevant goal: ${form.goal}`,
            form.incident_report && `Incident report: ${form.incident_report}`,
            '', form.body, form.issues_concerns && `Issues or concerns: ${form.issues_concerns}`,
          ].filter(Boolean).join('\n');
          await base44.functions.invoke('sendProfessionalEmail', { recipients: emails, subject, body: detail, date: form.date });
        } catch { /* email copy is best-effort */ }
      }
      toast({ title: `${form.note_type} recorded`, description: form.goal ? 'Saved in the diary and updated in Goal Progress.' : 'Saved in the communication diary and the participant profile.' });
      setForm(EMPTY);
      setFiles([]);
      setManagementCopy(false);
      await load();
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><NotebookPen className="h-4 w-4 text-brand" />Record a participant note</div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Participant *</Label>
            <select value={form.participant_name} onChange={(e) => set('participant_name', e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">- Select participant -</option>
              {participants.map((p) => <option key={p.id} value={p.full_name}>{p.full_name}</option>)}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label>Note type</Label>
            <select value={form.note_type} onChange={(e) => set('note_type', e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              {NOTE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label>Shift type</Label>
            <select value={form.shift_type} onChange={(e) => set('shift_type', e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">- Select shift type -</option>
              {SHIFT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label>Relevant goal</Label>
            <select value={form.goal} onChange={(e) => set('goal', e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">- Select goal -</option>
              {goals.map((g) => <option key={g.id} value={g.goal}>{g.goal}</option>)}
            </select>
            {form.participant_name && goals.length === 0 && <p className="text-xs text-muted-foreground">No goals recorded for this participant yet.</p>}
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
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Travel (km)</Label><Input type="number" value={form.travel_km} onChange={(e) => set('travel_km', e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Travel location</Label><Input value={form.travel_location} onChange={(e) => set('travel_location', e.target.value)} /></div>
          </div>
          <div className="grid gap-1.5">
            <Label>Medication supervised</Label>
            <select value={form.medication_supervised} onChange={(e) => set('medication_supervised', e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">- Select -</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="grid gap-1.5"><Label>Incident report reference (if raised)</Label><Input value={form.incident_report} onChange={(e) => set('incident_report', e.target.value)} /></div>
          <div className="grid gap-1.5 md:col-span-2"><Label>What happened / note *</Label><Textarea rows={4} value={form.body} onChange={(e) => set('body', e.target.value)} /></div>
          <div className="grid gap-1.5 md:col-span-2"><Label>Issues or concerns</Label><Textarea rows={2} value={form.issues_concerns} onChange={(e) => set('issues_concerns', e.target.value)} /></div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label>Upload a copy (stored privately)</Label>
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
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <Checkbox checked={managementCopy} onCheckedChange={(v) => setManagementCopy(Boolean(v))} />
            Send a copy via email to the management team
          </label>
        </div>
        <div className="mt-4 rounded-lg border border-brand/20 bg-accent/40 p-3 text-xs text-accent-foreground">
          <p className="font-semibold">Writer tips</p>
          <p className="mt-1">{NOTE_TIPS[form.note_type] || NOTE_TIPS['Shift Note']}</p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {items.length > 0 && (
            <Button variant="outline" onClick={() => exportCsv('shift-notes.csv', filtered.map((n) => ({
              type: n.note_type, participant: n.person_name, shift_type: n.shift_type, date: n.entry_date, time: n.entry_time,
              goal: n.goal, staff: (n.staff_involved || []).join('; '), travel_km: n.travel_km, travel_location: n.travel_location,
              medication_supervised: n.medication_supervised, note: n.body,
            })))}>Export</Button>
          )}
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <NotebookPen className="h-4 w-4" />}{form.note_type === 'Shift Note' ? 'Record shift note' : `Record ${form.note_type.toLowerCase()}`}</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={filters.participant} onChange={(e) => setFilters({ ...filters, participant: e.target.value })} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All participants</option>
          {participants.map((p) => <option key={p.id} value={p.full_name}>{p.full_name}</option>)}
        </select>
        <select value={filters.note_type} onChange={(e) => setFilters({ ...filters, note_type: e.target.value })} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All note types</option>
          {NOTE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.shift_type} onChange={(e) => setFilters({ ...filters, shift_type: e.target.value })} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All shift types</option>
          {SHIFT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="w-auto" />
        <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="w-auto" />
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes recorded yet.</p>
        ) : filtered.map((n) => {
          const attachments = (() => { try { return JSON.parse(n.attachments_json || '[]'); } catch { return []; } })();
          return (
            <div key={n.id} className="rounded-xl border border-border/60 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline">{n.note_type || 'Shift Note'}</Badge>
                  <Badge variant="secondary">{n.person_name}</Badge>
                  {n.shift_type && <Badge variant="outline">{n.shift_type}</Badge>}
                  {n.goal && <Badge className="bg-safe text-safe-foreground">Goal: {n.goal}</Badge>}
                  {n.medication_supervised && <Badge variant={n.medication_supervised === 'Yes' ? 'destructive' : 'secondary'}>Med supervised: {n.medication_supervised}</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{n.entry_date}{n.entry_time ? ` ${n.entry_time}` : ''}</span>
                  <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.CommunicationEntry.delete(n.id); await load(); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
              {n.body && <p className="mt-1.5 text-sm text-foreground/80">{n.body}</p>}
              <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {(n.staff_involved || []).length > 0 && <span>Staff: {n.staff_involved.join(', ')}</span>}
                {(Number(n.travel_km) > 0 || n.travel_location) && <span>Travel: {n.travel_km || 0} km{n.travel_location ? ` at ${n.travel_location}` : ''}</span>}
                {n.issues_concerns && <span>Issues: {n.issues_concerns}</span>}
                {n.incident_report && <span>Incident: {n.incident_report}</span>}
                {n.goal_note_created && <span className="text-safe">Goal Progress updated</span>}
                {n.management_copy && <span>Management emailed</span>}
              </div>
              {attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {attachments.map((a, i) => (
                    <Button key={i} variant="outline" size="sm" onClick={() => openAttachment(a)}><Paperclip className="h-3 w-3" />{a.name}</Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}