import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { changeStatus } from '@/lib/statusLog';
import { referralPdfBase64 } from '@/lib/referralPdf';
import { Loader2, Send } from 'lucide-react';

export default function ReferralSendDialog({ referral, open, onClose, onSent }) {
  const { toast } = useToast();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attach, setAttach] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (referral) {
      setTo(referral.provider_email || '');
      setSubject(`Referral ${referral.referral_id || ''} - ${referral.client_name || ''}`.trim());
      setBody(`Dear provider,\n\nPlease find ${attach !== undefined ? 'below' : ''} a referral for ${referral.client_name || 'a client'} (referral ${referral.referral_id || ''}).\n\nService requested: ${referral.service_type || '-'}\nUrgency: ${referral.urgency || 'Routine'}\n\nReason for referral:\n${referral.reason || '-'}\n\nPlease contact the referrer${referral.referrer_name ? ` (${referral.referrer_name})` : ''}${referral.referrer_phone ? ` on ${referral.referrer_phone}` : ''} to confirm receipt and next steps.\n\nKind regards,\nComplianceHR Infinitely`);
    }
  }, [referral, open]);

  const send = async () => {
    setSending(true);
    try {
      const payload = { to: to.trim(), subject: subject.trim(), body };
      if (attach) {
        const content = referralPdfBase64(referral);
        if (!content) throw new Error('The referral PDF could not be generated.');
        payload.attachments = [{ filename: `Referral ${referral.referral_id || referral.client_name}.pdf`, content }];
      }
      const res = await base44.functions.invoke('sendAppEmail', payload);
      if (res.data?.error) throw new Error(res.data.error);
      await changeStatus({ entityType: 'Referral', entity: 'Referral', record: referral, toStatus: 'Sent', dateField: 'sent_at' });
      await base44.entities.Referral.update(referral.id, { sent_to: to.trim() });
      toast({ title: 'Referral sent', description: `Emailed to ${to.trim()}${attach ? ' with the PDF attached' : ''}.` });
      onSent();
      onClose();
    } catch (error) {
      toast({ title: 'Sending failed', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Send referral by email</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>To *</Label>
            <Input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="receiving.provider@example.org" />
          </div>
          <div className="grid gap-1.5"><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label>Message</Label><Textarea rows={9} value={body} onChange={(e) => setBody(e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} className="h-4 w-4 rounded border-input" />
            Attach the referral PDF
          </label>
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">The referral stays logged with its status history regardless of delivery. Email delivery to addresses outside the app depends on your email settings.</p>
          <Button onClick={send} disabled={sending || !to.trim() || !subject.trim()}>{sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Send referral</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}