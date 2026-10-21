import React, { useEffect, useState } from 'react';
import withEmployeeView from '@/components/withEmployeeView';
import EmployeeTemplateSendDialog from '@/components/employee/EmployeeTemplateSendDialog';
export default withEmployeeView(TemplateQuickSend, EmployeeTemplateSendDialog);
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Mail, Send } from 'lucide-react';
import { loadCommContacts } from '@/lib/commTypes';
import { logCommunicationRegister } from '@/lib/commRouting';
import ContactPicker from './ContactPicker';

function TemplateQuickSend({ open, onOpenChange, subject, body }) {
  const { toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [manual, setManual] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setContacts(await loadCommContacts());
    })();
  }, [open]);

  const send = async () => {
    const recipients = [...new Set([
      ...selected,
      ...manual.split(/[,;]/).map((s) => s.trim()).filter(Boolean),
    ])];
    if (!recipients.length || !subject.trim() || !body.trim()) {
      toast({ title: 'At least one recipient is required', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const response = await base44.functions.invoke('sendProfessionalEmail', {
        recipients,
        subject,
        body,
        date: new Date().toISOString().slice(0, 10),
      });
      if (response.data?.error) throw new Error(response.data.error);
      const user = await base44.auth.me();
      const record = await base44.entities.CommunicationEntry.create({
        entry_kind: 'Email',
        person_type: 'General',
        subject,
        body,
        entry_date: new Date().toISOString().slice(0, 10),
        entry_time: new Date().toTimeString().slice(0, 5),
        recipients_json: JSON.stringify(recipients.map((r) => ({ email: r }))),
        send_copy_emails: recipients,
        email_sent: true,
        sender_name: user?.full_name || '',
        sender_email: user?.email || '',
        module: 'Communications',
      });
      await logCommunicationRegister(record);
      toast({ title: `Message sent to ${response.data.sent} recipient${response.data.sent === 1 ? '' : 's'}`, description: 'A copy is saved in the communication diary.' });
      setSelected([]);
      setManual('');
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Send failed', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base"><Send className="h-4 w-4 text-brand" />Send template message</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
            <p className="text-sm font-medium">{subject}</p>
            <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-xs text-muted-foreground">{body}</p>
          </div>
          <div className="grid gap-1.5">
            <Label>Recipients</Label>
            <ContactPicker contacts={contacts} selected={selected} onChange={setSelected} />
            <Input placeholder="...or type email addresses, comma separated" value={manual} onChange={(e) => setManual(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={send} disabled={sending}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}Send email</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}