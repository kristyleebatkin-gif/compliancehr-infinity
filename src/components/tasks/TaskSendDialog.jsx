import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mail } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskSendDialog({ open, onOpenChange, task, onSaved }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [alertInApp, setAlertInApp] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open || !task) return;
    setEmail(task.assigned_email || '');
    setMessage(`You have been allocated the task "${task.title}"${task.due_date ? `, due ${format(new Date(task.due_date), 'EEEE d MMMM yyyy')}` : ''}. Priority: ${task.priority}. Status: ${task.status}.${task.notes ? `\n\nDetails: ${task.notes}` : ''}\n\nPlease open the Tasks module to keep it up to date.`);
  }, [open, task]);

  const send = async () => {
    if (!/.+@.+\..+/.test(email)) {
      toast({ title: 'A valid recipient email is required', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const res = await base44.functions.invoke('sendAppEmail', {
        to: email,
        subject: `Task allocated: ${task.title}${task.due_date ? ` (due ${format(new Date(task.due_date), 'd MMM yyyy')})` : ''}`,
        body: message.slice(0, 5000),
      });
      if (res.data?.error) {
        toast({ title: 'Could not send', description: res.data.error, variant: 'destructive' });
      } else {
        if (alertInApp) {
          await base44.entities.Notification.create({
            type: 'Task Allocation',
            recipient: task.assigned_to || email,
            message: `Task allocated: ${task.title}${task.due_date ? ` (due ${format(new Date(task.due_date), 'd MMM yyyy')})` : ''}`,
            read: false,
            linked_entity_type: 'Task',
            linked_entity_id: task.id,
          });
        }
        await base44.entities.TodoTask.update(task.id, { assigned_email: email });
        onSaved();
        onOpenChange(false);
        toast({ title: 'Task sent', description: `Emailed to ${email}${alertInApp ? ' with an in-app alert' : ''}.` });
      }
    } catch (error) {
      toast({ title: 'Could not send', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Send task — {task?.title}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>Send to (email)</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></div>
          <div className="grid gap-1.5"><Label>Message</Label><Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={alertInApp} onCheckedChange={(v) => setAlertInApp(Boolean(v))} />
            Also alert the assignee in-app
          </label>
          <Button onClick={send} disabled={sending}>{sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}Send task</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}