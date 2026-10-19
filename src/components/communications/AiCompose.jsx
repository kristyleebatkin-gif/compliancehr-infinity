import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, Loader2, Copy, Send } from 'lucide-react';

const TYPES = ['Professional email', 'Family update', 'Shift note', 'Incident follow-up', 'Feedback response', 'Team reminder', 'Difficult conversation', 'Thank you message', 'Marketing message'];
const TONES = ['Professional', 'Warm', 'Friendly', 'Firm but kind', 'Apologetic', 'Celebratory', 'Brief'];
const LENGTHS = ['Short', 'Medium', 'Long'];

export default function AiCompose() {
  const { toast } = useToast();
  const [messageType, setMessageType] = useState('Professional email');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium');
  const [recipient, setRecipient] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [draft, setDraft] = useState(null);
  const [running, setRunning] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendTo, setSendTo] = useState('');

  const generate = async () => {
    if (!keyPoints.trim()) {
      toast({ title: 'Add a few key points first', variant: 'destructive' });
      return;
    }
    setRunning(true);
    setDraft(null);
    try {
      const res = await base44.functions.invoke('composeAssist', {
        message_type: messageType,
        tone,
        length,
        recipient,
        key_points: keyPoints,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setDraft(res.data);
    } catch (err) {
      toast({ title: 'Draft failed', description: err.message, variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  const copyDraft = async () => {
    if (!draft) return;
    try { await navigator.clipboard.writeText(draft.message); toast({ title: 'Draft copied - paste it anywhere' }); }
    catch { toast({ title: 'Copy failed', variant: 'destructive' }); }
  };

  const sendDraft = async () => {
    if (!sendTo.trim() || !draft) {
      toast({ title: 'Enter a recipient email', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const res = await base44.functions.invoke('sendAppEmail', {
        to: sendTo.trim(),
        subject: draft.subject || 'Message from ComplianceHR Infinity',
        body: draft.message,
      });
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: 'Email sent' });
      setSendTo('');
    } catch (err) {
      toast({ title: 'Send failed', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const chips = (options, value, setter) => (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => setter(o)}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${value === o ? 'bg-brand text-white' : 'border border-border bg-card text-foreground/70 hover:bg-accent'}`}
        >
          {o}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <p className="flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-brand" />AI compose assistant</p>
          <p className="mb-4 text-xs text-muted-foreground">Pick the message type and tone, jot the key points, and the assistant writes a polished draft you can copy anywhere or send straight as an email.</p>
          <div className="grid gap-4">
            <div className="grid gap-1.5"><Label>Message type</Label>{chips(TYPES, messageType, setMessageType)}</div>
            <div className="grid gap-1.5"><Label>Tone</Label>{chips(TONES, tone, setTone)}</div>
            <div className="grid gap-1.5"><Label>Length</Label>{chips(LENGTHS, length, setLength)}</div>
            <div className="grid gap-1.5"><Label>Recipient context (optional)</Label>
              <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Mrs Tran, participant's mother, prefers formal address" />
            </div>
            <div className="grid gap-1.5"><Label>Key points *</Label>
              <Textarea rows={4} value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} placeholder="One per line, e.g. next care review moved to Friday 2pm; new support worker Sam starting Monday; please confirm transport needs" />
            </div>
            <Button onClick={generate} disabled={running}>
              {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {running ? 'Writing...' : 'Write my draft'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {draft && (
        <Card>
          <CardContent className="p-4">
            {draft.subject && <p className="mb-2 text-sm font-bold">Subject: {draft.subject}</p>}
            <Textarea rows={10} value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} className="text-sm" />
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <Button size="sm" variant="outline" onClick={copyDraft}><Copy className="mr-2 h-4 w-4" />Copy draft</Button>
              <div className="grid gap-1.5">
                <Label className="text-xs">Send as email to</Label>
                <Input className="w-full sm:w-64" value={sendTo} onChange={(e) => setSendTo(e.target.value)} placeholder="recipient@email.com" />
              </div>
              <Button size="sm" onClick={sendDraft} disabled={sending}>
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send email
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">You can edit the draft above before copying or sending.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}