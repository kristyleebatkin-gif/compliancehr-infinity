import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Download, FileText, Loader2, Save, Send, UploadCloud } from 'lucide-react';
import { downloadMeetingMinutesPdf, meetingMinutesBase64, parseEmails } from '@/lib/meetingPdf';
import { format } from 'date-fns';

export default function MeetingMinutes({ meeting, onSaved }) {
  const { toast } = useToast();
  const [minutes, setMinutes] = useState(meeting.minutes || '');
  const [assessment, setAssessment] = useState(meeting.assessment || '');
  const [saving, setSaving] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

  const save = async (field, value) => {
    setSaving(field);
    try {
      await base44.entities.Meeting.update(meeting.id, { [field]: value });
      toast({ title: field === 'minutes' ? 'Minutes saved' : 'Assessment saved' });
      if (onSaved) onSaved();
    } finally {
      setSaving('');
    }
  };

  const uploadMinutes = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.Meeting.update(meeting.id, { minutes_file_uri: file_uri, minutes_file_name: file.name });
      toast({ title: 'Completed minutes stored' });
      if (onSaved) onSaved();
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const openMinutesFile = async () => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: meeting.minutes_file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      toast({ title: 'Unable to open minutes', description: error.message, variant: 'destructive' });
    }
  };

  const sendMinutes = async () => {
    const emails = parseEmails(meeting.attendee_emails);
    if (emails.length === 0) {
      toast({ title: 'No attendee emails', description: 'Add attendee emails to this meeting first.', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const body = [
        `Minutes of meeting: ${meeting.title}`,
        meeting.date ? `Date: ${format(new Date(meeting.date), 'd MMM yyyy')}${meeting.time ? ` at ${meeting.time}` : ''}` : '',
        meeting.location ? `Location: ${meeting.location}` : '',
        '',
        'AGENDA:',
        meeting.agenda || '-',
        '',
        'MINUTES / DECISIONS:',
        meeting.minutes || '-',
        '',
        'ASSESSMENT:',
        meeting.assessment || '-',
      ].filter(Boolean).join('\n').slice(0, 5000);
      let failed = 0;
      for (const to of emails) {
        try {
          const res = await base44.functions.invoke('sendAppEmail', {
            to,
            subject: `Meeting minutes: ${meeting.title}`,
            body,
            attachments: [{ filename: `Minutes - ${meeting.title}.pdf`, content: meetingMinutesBase64(meeting) }],
          });
          if (res.data?.error) failed += 1;
        } catch {
          failed += 1;
        }
      }
      if (failed === 0) toast({ title: 'Minutes sent', description: `Emailed to ${emails.length} attendee${emails.length === 1 ? '' : 's'} with the PDF attached.` });
      else toast({ title: 'Partly sent', description: `${emails.length - failed} sent, ${failed} could not be delivered (external addresses are limited to registered app users).` });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">Minutes</div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => downloadMeetingMinutesPdf(meeting)}>
            <Download className="h-3 w-3" />Download minutes PDF
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs" disabled={sending} onClick={sendMinutes}>
            {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}Send to attendees
          </Button>
        </div>
      </div>
      <Textarea rows={4} value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="Discussion, decisions and outcomes..." />
      <Button size="sm" className="h-8 text-xs" disabled={saving === 'minutes'} onClick={() => save('minutes', minutes)}>
        {saving === 'minutes' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}Save minutes
      </Button>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        {meeting.minutes_file_uri ? (
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={openMinutesFile}>
            <FileText className="h-3 w-3" />Open stored minutes: {meeting.minutes_file_name}
          </Button>
        ) : null}
        <label className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-transparent px-3 text-xs font-semibold shadow-sm hover:bg-accent ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}Upload completed minutes
          <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.png,.jpg,.jpeg" onChange={(e) => uploadMinutes(e.target.files?.[0])} />
        </label>
      </div>

      <div className="border-t border-border/60 pt-3">
        <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Meeting assessment</Label>
        <Textarea rows={2} className="mt-1.5" value={assessment} onChange={(e) => setAssessment(e.target.value)} placeholder="What worked well, what to improve for next time..." />
        <Button size="sm" variant="outline" className="mt-2 h-8 text-xs" disabled={saving === 'assessment'} onClick={() => save('assessment', assessment)}>
          {saving === 'assessment' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}Save assessment
        </Button>
      </div>
    </div>
  );
}