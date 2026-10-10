import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { inviteEmailBody, eventAdPdfBase64 } from '@/lib/eventAdPdf';

export default function EventInviteDialog({ open, onOpenChange, event, business, onSaved }) {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState({});
  const [extraEmails, setExtraEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    base44.entities.User.list({ fields: ['id', 'full_name', 'email'], sort: 'full_name', limit: 200 })
      .then((page) => setUsers((page.items || []).filter((u) => u.email)))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [open]);

  const send = async () => {
    const toList = [...users.filter((u) => selected[u.id]).map((u) => u.email), ...extraEmails.split(/[,;\s]+/).filter((e) => /.+@.+\..+/.test(e))];
    if (!toList.length) {
      toast({ title: 'No recipients selected', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      let attachment = null;
      if (event.ad_image_url || event.ad_body) {
        attachment = { filename: `Invitation-${(event.title || 'event').replace(/[^\w-]+/g, '-')}.pdf`, content: await eventAdPdfBase64(event, business) };
      }
      const subject = `Invitation: ${event.title}${event.date ? ` - ${format(new Date(event.date), 'EEE d MMM yyyy')}` : ''}`;
      const failures = [];
      for (const email of toList) {
        try {
          const res = await base44.functions.invoke('sendAppEmail', {
            to: email,
            subject,
            body: inviteEmailBody(event, business),
            ...(attachment ? { attachments: [attachment] } : {}),
          });
          if (res.data?.error) failures.push({ email, error: res.data.error });
        } catch (error) {
          failures.push({ email, error: error.message });
        }
      }
      const existing = String(event.invited_to || '').split(/[,;\s]+/).filter(Boolean);
      const allTo = [...new Set([...existing, ...toList])].join(', ');
      await base44.entities.Event.update(event.id, { invited_to: allTo, invited_at: new Date().toISOString() });
      onSaved();
      onOpenChange(false);
      if (failures.length) toast({ title: 'Some invites could not be sent', description: failures.map((f) => f.email).join(', '), variant: 'destructive' });
      else toast({ title: 'Invitations sent', description: `${toList.length} recipient${toList.length === 1 ? '' : 's'} invited to ${event.title}.` });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Invite users — {event?.title}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          {event?.invited_to && <p className="text-xs text-muted-foreground">Previously invited: {event.invited_to}</p>}
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-border/60 p-2">
              {users.map((u) => (
                <label key={u.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50">
                  <Checkbox checked={Boolean(selected[u.id])} onCheckedChange={(v) => setSelected({ ...selected, [u.id]: Boolean(v) })} />
                  <span className="truncate">{u.full_name || u.email}</span>
                  <span className="ml-auto truncate text-xs text-muted-foreground">{u.email}</span>
                </label>
              ))}
              {users.length === 0 && <p className="p-2 text-xs text-muted-foreground">No app users found.</p>}
            </div>
          )}
          <div className="grid gap-1.5">
            <Label>Additional email addresses</Label>
            <Textarea rows={2} placeholder="name@example.com, another@example.com" value={extraEmails} onChange={(e) => setExtraEmails(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">Each invitee receives the event details and the advertisement PDF as an attachment.</p>
          <Button onClick={send} disabled={sending}>{sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}Send invitations</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}