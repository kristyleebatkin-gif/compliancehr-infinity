import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CalendarDays, Loader2, Mail, Pencil, Trash2 } from 'lucide-react';
import { parseEmails } from '@/lib/meetingPdf';
import { format } from 'date-fns';
import MeetingMinutes from '@/components/meetings/MeetingMinutes';
import MeetingTasks from '@/components/meetings/MeetingTasks';

const STATUSES = ['Scheduled', 'Completed', 'Cancelled'];

export default function MeetingDetail({ meeting, onSaved, onEdit }) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [attendance, setAttendance] = useState(meeting.attendance || '');

  const emails = parseEmails(meeting.attendee_emails);

  const sendInvite = async () => {
    if (emails.length === 0) {
      toast({ title: 'No attendee emails', description: 'Add attendee emails to this meeting first.', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const body = [
        `You are invited to: ${meeting.title}`,
        meeting.meeting_type ? `Type: ${meeting.meeting_type}` : '',
        meeting.date ? `Date: ${format(new Date(meeting.date), 'EEEE d MMMM yyyy')}${meeting.time ? ` at ${meeting.time}` : ''}` : '',
        meeting.duration ? `Expected duration: ${meeting.duration}` : '',
        [meeting.location, meeting.meeting_link].filter(Boolean).length ? `Where: ${[meeting.location, meeting.meeting_link].filter(Boolean).join('  |  ')}` : '',
        meeting.chair ? `Chairperson: ${meeting.chair}` : '',
        meeting.purpose ? `\nPurpose: ${meeting.purpose}` : '',
        meeting.agenda ? `\nAgenda:\n${meeting.agenda}` : '',
        '\nPlease confirm your attendance.',
      ].filter(Boolean).join('\n').slice(0, 5000);
      let failed = 0;
      for (const to of emails) {
        try {
          const res = await base44.functions.invoke('sendAppEmail', { to, subject: `Meeting invitation: ${meeting.title}`, body });
          if (res.data?.error) failed += 1;
        } catch {
          failed += 1;
        }
      }
      await base44.entities.Meeting.update(meeting.id, { invited_at: new Date().toISOString(), invited_to: emails.join(', ') });
      if (onSaved) onSaved();
      if (failed === 0) toast({ title: 'Invites sent', description: `Emailed to ${emails.length} attendee${emails.length === 1 ? '' : 's'}.` });
      else toast({ title: 'Partly sent', description: `${emails.length - failed} sent, ${failed} could not be delivered (external addresses are limited to registered app users).` });
    } finally {
      setSending(false);
    }
  };

  const saveAttendance = async () => {
    await base44.entities.Meeting.update(meeting.id, { attendance });
    if (onSaved) onSaved();
  };

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-border/60 bg-muted/30 p-3">
      <div className="grid gap-2 text-sm md:grid-cols-2">
        {[
          ['Meeting type', meeting.meeting_type],
          ['Purpose', meeting.purpose],
          ['Chairperson', meeting.chair],
          ['Minute taker', meeting.minute_taker],
          ['Expected duration', meeting.duration],
          ['Video / meeting link', meeting.meeting_link],
          ['Attendees', meeting.attendees],
          ['Attendee emails', meeting.attendee_emails],
        ].filter(([, v]) => v).map(([label, value]) => (
          <div key={label} className="rounded-lg bg-card p-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground/40">{label}</p>
            <p className="break-words">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" className="h-8 text-xs" disabled={sending} onClick={sendInvite}>
          {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}Send invite to attendees
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onEdit(meeting)}><Pencil className="h-3 w-3" />Edit</Button>
        <Select value={meeting.status} onValueChange={async (v) => { await base44.entities.Meeting.update(meeting.id, { status: v }); onSaved(); }}>
          <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Badge className={statusTone(meeting.status)}>{meeting.status}</Badge>
        {meeting.invited_at && <span className="text-xs text-muted-foreground">Invites sent {format(new Date(meeting.invited_at), 'd MMM yyyy, h:mm a')}</span>}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-56 flex-1">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/40">Attendance (attended / apologies)</p>
          <Input value={attendance} onChange={(e) => setAttendance(e.target.value)} placeholder="Present: ... Apologies: ..." className="h-8 text-sm" />
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={saveAttendance}>Save attendance</Button>
      </div>

      <MeetingMinutes meeting={meeting} onSaved={onSaved} />
      <MeetingTasks meeting={meeting} />
    </div>
  );
}