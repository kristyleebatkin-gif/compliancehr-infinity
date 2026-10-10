import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, NotebookPen, Trash2 } from 'lucide-react';

export default function ShiftNotes() {
  const { toast } = useToast();
  const [participants, setParticipants] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ participant_name: '', staff_name: '', date: '', time: '', travel: '', issues_concerns: '', what_happened: '', incident_report: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [notePage, participantPage, staffPage] = await Promise.all([
        base44.entities.ShiftNote.filter({}, { sort: '-created_date', limit: 50 }),
        base44.entities.ParticipantProfile.filter({}, { sort: 'full_name', limit: 200, fields: ['full_name'] }).catch(() => ({ items: [] })),
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 200, fields: ['full_name'] }).catch(() => ({ items: [] })),
      ]);
      setItems(notePage.items || []);
      setParticipants(participantPage.items || []);
      setStaffList(staffPage.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.participant_name || !form.date) {
      toast({ title: 'Participant and date are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.ShiftNote.create({ ...form, recorded_by: user?.full_name || user?.email || '' });
      toast({ title: 'Shift note recorded' });
      setForm({ participant_name: '', staff_name: '', date: '', time: '', travel: '', issues_concerns: '', what_happened: '', incident_report: '' });
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
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><NotebookPen className="h-4 w-4 text-brand" />Record a participant shift note</div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Participant *</Label>
            <select value={form.participant_name} onChange={(e) => set('participant_name', e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">— Select participant —</option>
              {participants.map((p) => <option key={p.id} value={p.full_name}>{p.full_name}</option>)}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label>Staff</Label>
            <select value={form.staff_name} onChange={(e) => set('staff_name', e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">— Select staff —</option>
              {staffList.map((s) => <option key={s.id} value={s.full_name}>{s.full_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} /></div>
          </div>
          <div className="grid gap-1.5"><Label>Travel (km / details)</Label><Input value={form.travel} onChange={(e) => set('travel', e.target.value)} /></div>
          <div className="grid gap-1.5 md:col-span-2"><Label>What happened</Label><Textarea rows={3} value={form.what_happened} onChange={(e) => set('what_happened', e.target.value)} /></div>
          <div className="grid gap-1.5 md:col-span-2"><Label>Issues or concerns</Label><Textarea rows={2} value={form.issues_concerns} onChange={(e) => set('issues_concerns', e.target.value)} /></div>
          <div className="grid gap-1.5 md:col-span-2"><Label>Incident report reference (if raised)</Label><Input value={form.incident_report} onChange={(e) => set('incident_report', e.target.value)} /></div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <NotebookPen className="h-4 w-4" />}Record shift note</Button>
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shift notes recorded yet.</p>
        ) : items.map((n) => (
          <div key={n.id} className="rounded-xl border border-border/60 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">{n.participant_name}{n.staff_name ? ` · ${n.staff_name}` : ''}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{n.date}{n.time ? ` ${n.time}` : ''}</span>
                <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.ShiftNote.delete(n.id); await load(); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </div>
            {n.what_happened && <p className="mt-1.5 text-sm text-foreground/80">{n.what_happened}</p>}
            <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {n.travel && <span>Travel: {n.travel}</span>}
              {n.issues_concerns && <span>Issues: {n.issues_concerns}</span>}
              {n.incident_report && <span>Incident: {n.incident_report}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}