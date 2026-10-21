import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import EmployeePersonnelPicker from '@/components/employee/EmployeePersonnelPicker';
import MessageTemplatePicker from '@/components/communications/MessageTemplatePicker';
export default function EmployeeMessageForm({ mode = 'message', initialSubject = '', initialBody = '', replyTo, onSaved }) {
  const client = useQueryClient();
  const [subject, setSubject] = useState(initialSubject || (replyTo ? `Re: ${replyTo.subject || 'Message'}` : ''));
  const [body, setBody] = useState(initialBody);
  const [recipients, setRecipients] = useState([]);
  const [singleEmail, setSingleEmail] = useState('');
  const [emailCopy, setEmailCopy] = useState(mode === 'email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [templates, setTemplates] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setResult('');
    try {
      const response = await base44.functions.invoke('employeeCommunications', { action: replyTo ? 'reply' : mode === 'video' ? 'video' : 'message', parent_id: replyTo?.id, values: { subject, body, recipients: mode === 'email' && singleEmail.trim() ? [singleEmail.trim()] : recipients, email_copy: emailCopy, email_mode: mode === 'email' } });
      await client.invalidateQueries({ queryKey: ['employee-communications'] });
      setResult(response.data.email?.failed?.length ? `Saved. Email copies could not be sent to: ${response.data.email.failed.join(', ')}` : mode === 'video' ? 'Video invitation saved. Join from the call log below.' : 'Message saved to the diary and recipient inboxes.');
      setBody(''); setSubject(''); setRecipients([]); setSingleEmail(''); onSaved?.(response.data.record);
    } catch (failure) { setError(failure.response?.data?.error || failure.message); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-4">
    <h3 className="text-sm font-semibold">{replyTo ? `Reply to ${replyTo.sender_name || replyTo.sender_email}` : mode === 'video' ? 'Invite key personnel to a video call' : mode === 'email' ? 'Send email' : 'Bulk message key personnel'}</h3>
    {!replyTo && <EmployeePersonnelPicker selected={recipients} onChange={(value) => { setRecipients(value); setSingleEmail(''); }} />}
    {mode === 'email' && !replyTo && <label className="block text-sm">Or email one known app user or saved contact<Input type="email" value={singleEmail} onChange={(event) => { setSingleEmail(event.target.value); setRecipients([]); setEmailCopy(true); }} placeholder="Single recipient email" /></label>}
    <label className="block text-sm">Subject<Input required maxLength={200} value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
    <label className="block text-sm">{mode === 'video' ? 'Invitation message' : 'Message'}<Textarea required={mode !== 'video'} maxLength={10000} value={body} onChange={(event) => setBody(event.target.value)} /></label>
    {!replyTo && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={emailCopy} onChange={(event) => setEmailCopy(event.target.checked)} />Also send email copies</label>}
    {!replyTo && <p className="text-xs text-muted-foreground">External email copies depend on the app’s email setup; invitations are saved in the app.</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{result && <p role="status" className="text-sm">{result}</p>}
    <div className="flex flex-wrap gap-2"><Button variant="outline" type="button" onClick={() => setTemplates(true)}>Use template</Button><Button variant="outline" type="submit" disabled={busy || (!replyTo && !recipients.length && !singleEmail.trim())}>{busy ? 'Saving…' : mode === 'video' ? 'Create invitation' : 'Send message'}</Button></div>
    <MessageTemplatePicker open={templates} onOpenChange={setTemplates} onSelect={(template) => { setSubject(template.subject); setBody(template.body); }} />
  </form>;
}