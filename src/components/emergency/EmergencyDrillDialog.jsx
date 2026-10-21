import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TYPES = ['Fire Evacuation', 'Fire Drill', 'Lockdown', 'Medical Emergency', 'Natural Disaster', 'Other'];
export default function EmergencyDrillDialog({ open, onOpenChange, form, onChange, saving, onSave }) {
  const set = (key, value) => onChange({ ...form, [key]: value });
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>New emergency drill</DialogTitle></DialogHeader><div className="grid gap-3">
    <div className="grid gap-1.5"><Label htmlFor="drill-title">Title *</Label><Input id="drill-title" value={form.title} onChange={(event) => set('title', event.target.value)} /></div>
    <div className="grid grid-cols-2 gap-3"><div className="grid gap-1.5"><Label>Drill type</Label><Select value={form.drill_type} onValueChange={(value) => set('drill_type', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-1.5"><Label htmlFor="drill-date">Date</Label><Input id="drill-date" type="date" value={form.date} onChange={(event) => set('date', event.target.value)} /></div></div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="grid gap-1.5"><Label htmlFor="drill-location">Location</Label><Input id="drill-location" value={form.location} onChange={(event) => set('location', event.target.value)} /></div><div className="grid gap-1.5"><Label htmlFor="drill-attendees">Participants</Label><Input id="drill-attendees" type="number" value={form.attendees_count} onChange={(event) => set('attendees_count', event.target.value)} /></div><div className="grid gap-1.5"><Label>Outcome</Label><Select value={form.outcome} onValueChange={(value) => set('outcome', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Completed', 'Partial', 'Issues Found'].map((outcome) => <SelectItem key={outcome} value={outcome}>{outcome}</SelectItem>)}</SelectContent></Select></div></div>
    <div className="grid gap-1.5"><Label htmlFor="drill-notes">Notes</Label><Textarea id="drill-notes" value={form.notes} onChange={(event) => set('notes', event.target.value)} /></div>
    <Button onClick={onSave} disabled={saving || !form.title.trim()}>{saving ? 'Saving…' : 'Log drill'}</Button>
  </div></DialogContent></Dialog>;
}