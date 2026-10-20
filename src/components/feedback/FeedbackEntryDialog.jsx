import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function FeedbackEntryDialog({ open, onOpenChange, form, setForm, users, saving, error, onSave }) {
  const field = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader><DialogTitle>Record feedback or complaint</DialogTitle></DialogHeader>
      <form onSubmit={(event) => { event.preventDefault(); onSave(); }} className="grid gap-3">
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5"><Label>Type</Label><Select value={form.type} onValueChange={(value) => field('type', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Feedback', 'Complaint'].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid gap-1.5"><Label htmlFor="feedback-rating">Rating (1-5)</Label><Input id="feedback-rating" type="number" min="1" max="5" value={form.rating} onChange={(event) => field('rating', event.target.value)} /></div>
        </div>
        <div className="grid gap-1.5"><Label htmlFor="feedback-subject">Subject *</Label><Input id="feedback-subject" required value={form.subject} onChange={(event) => field('subject', event.target.value)} /></div>
        <div className="grid gap-1.5"><Label htmlFor="feedback-message">Message</Label><Textarea id="feedback-message" value={form.message} onChange={(event) => field('message', event.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5"><Label htmlFor="feedback-submitter">Submitted by</Label><Input id="feedback-submitter" value={form.submitted_by} onChange={(event) => field('submitted_by', event.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="feedback-contact">Contact details</Label><Input id="feedback-contact" value={form.contact_details} onChange={(event) => field('contact_details', event.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5"><Label htmlFor="feedback-channel">Received via</Label><Input id="feedback-channel" placeholder="Phone, email, in person, form" value={form.received_via} onChange={(event) => field('received_via', event.target.value)} /></div>
          <div className="grid gap-1.5"><Label>Assigned to</Label>{users.length ? <Select value={form.assigned_to || undefined} onValueChange={(value) => setForm((current) => ({ ...current, assigned_to: value, assigned_email: users.find((user) => user.full_name === value)?.email || '' }))}><SelectTrigger><SelectValue placeholder="Select a person" /></SelectTrigger><SelectContent>{users.map((user) => <SelectItem key={user.id} value={user.full_name}>{user.full_name}</SelectItem>)}</SelectContent></Select> : <Input aria-label="Assigned to" value={form.assigned_to} onChange={(event) => field('assigned_to', event.target.value)} />}</div>
        </div>
        <div className="flex justify-end gap-2 pt-1"><Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={saving || !form.subject.trim()}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Record entry</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}