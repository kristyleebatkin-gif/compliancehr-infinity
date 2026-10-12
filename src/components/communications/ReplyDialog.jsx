import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, MessageSquare } from 'lucide-react';
import { logCommunicationRegister } from '@/lib/commRouting';

export default function ReplyDialog({ entry, open, onOpenChange, onSaved }) {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [emailCopy, setEmailCopy] = useState(false);
  const [saving, setSaving] = useState(false);

  const send = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const record = await base44.entities.CommunicationEntry.create({
        entry_kind: 'Message',
        person_type: entry.person_type || 'General',
        person_name: entry.person_name || '',
        subject: `Re: ${entry.subject || entry.note_type || entry.entry_kind}`,
        body: text,
        entry_date: new Date().toISOString().slice(0, 10),
        entry_time: new Date().toTimeString().slice(0, 5),
        parent_id: entry.id,
        recipients_json: JSON.stringify([{ name: entry.sender_name || '', email: entry.sender_email || '' }]),
        sender_name: user?.full_name || '',
        sender_email: user?.email || '',
        ...(emailCopy && entry.sender_email ? { send_copy_emails: [entry.sender_email], email_sent: true, management_copy: true } : {}),
      });
      await logCommunicationRegister(record);
      if (emailCopy && entry.sender_email) {
        try {
          await base44.functions.invoke('sendProfessionalEmail', {
            recipients: [entry.sender_email],
            subject: `Re: ${entry.subject || entry.entry_kind}`,
            body: text,
          });
        } catch { /* email copy may fail for non-registered recipients */ }
      }
      toast({ title: 'Reply sent' });
      setText('');
      setEmailCopy(false);
      onOpenChange(false);
      if (onSaved) await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-brand" />Reply</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">Replying to {entry.sender_name || entry.sender_email || 'sender'} regarding &quot;{entry.subject || entry.note_type || entry.entry_kind}&quot;. The reply appears in the communication diary and in the sender&apos;s inbox.</p>
        <div className="grid gap-2">
          <div className="grid gap-1.5"><Label>Reply *</Label><Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={emailCopy} onCheckedChange={(v) => setEmailCopy(Boolean(v))} />
            Also email a copy to {entry.sender_name || 'the sender'}
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={send} disabled={saving || !text.trim()}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}Send reply</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}