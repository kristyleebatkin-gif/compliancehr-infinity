import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Loader2, PenLine, Undo2, ExternalLink, RefreshCw, KeyRound } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Approval Inbox (backlog P0 01.06). Every decision is checked and recorded by the
// `approvals` server function: role, no self-approval, signature, one decision only.

const STATUS_STYLE = {
  Pending: 'bg-amber-100 text-amber-900',
  Approved: 'bg-emerald-100 text-emerald-900',
  Returned: 'bg-rose-100 text-rose-900',
  Withdrawn: 'bg-slate-100 text-slate-700',
};

async function callApprovals(body) {
  try {
    const res = await base44.functions.invoke('approvals', body);
    const data = res?.data ?? res ?? {};
    if (data.error) throw new Error(data.error);
    return data;
  } catch (err) {
    const message = err?.response?.data?.error || err?.data?.error || err?.message || 'Something went wrong.';
    throw new Error(message);
  }
}

const when = (iso) => (iso ? new Date(iso).toLocaleString('en-AU', { timeZone: 'Australia/Brisbane', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '-');

const isAccess = (r) => r?.record_type === 'AccessRequest';

function RequestRow({ r, onDecide, onWithdraw }) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-slate-900">{r.title}</p>
        <p className="text-sm text-slate-600">{r.summary}</p>
        <p className="mt-1 text-xs text-slate-500">
          {r.module} · asked {when(r.requested_at)}{r.due_date ? ` · due ${r.due_date}` : ''}
          {r.decided_by_name ? ` · ${r.status.toLowerCase()} by ${r.decided_by_name} ${when(r.decided_at)}` : ''}
        </p>
        {r.decision_note && <p className="mt-1 text-xs text-slate-700">Note: {r.decision_note}</p>}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Badge className={STATUS_STYLE[r.status] || ''}>{r.status}</Badge>
        {r.record_url && !isAccess(r) && (
          <Button asChild variant="ghost" size="sm">
            <Link to={r.record_url}><ExternalLink className="h-4 w-4" />Open</Link>
          </Button>
        )}
        {onDecide && (
          <>
            <Button size="sm" variant="outline" onClick={() => onDecide(r, 'return')}><Undo2 className="h-4 w-4" />{isAccess(r) ? 'Decline' : 'Return'}</Button>
            <Button size="sm" onClick={() => onDecide(r, 'approve')}><PenLine className="h-4 w-4" />{isAccess(r) ? 'Approve' : 'Sign off'}</Button>
          </>
        )}
        {onWithdraw && isAccess(r) && r.status === 'Pending' && (
          <Button size="sm" variant="outline" onClick={() => onWithdraw(r)}>Withdraw</Button>
        )}
      </div>
    </li>
  );
}

function Section({ title, hint, rows, empty, onDecide, onWithdraw }) {
  return (
    <section aria-label={title} className="space-y-2">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title} <span className="text-slate-500">({rows.length})</span></h2>
        {hint && <p className="text-sm text-slate-600">{hint}</p>}
      </div>
      {rows.length ? (
        <ul className="space-y-2">{rows.map((r) => <RequestRow key={r.id} r={r} onDecide={onDecide} onWithdraw={onWithdraw} />)}</ul>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">{empty}</p>
      )}
    </section>
  );
}

// Access Requests (backlog 16.09): ask for a different role; a manager approves or declines it here.
function AccessRequestForm({ data, onSent }) {
  const { toast } = useToast();
  const [role, setRole] = useState('');
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const waiting = (data.my_requests || []).find((r) => isAccess(r) && r.status === 'Pending');
  const send = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      await callApprovals({ action: 'request_access', role, reason });
      toast({ title: 'Access request sent', description: `A manager will decide your request for ${role}.` });
      setRole(''); setReason('');
      await onSent();
    } catch (e) {
      toast({ title: 'Not sent', description: e.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };
  return (
    <section aria-label="Ask for different access" className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900"><KeyRound className="h-4 w-4" />Ask for different access</h2>
      <p className="text-sm text-slate-600">You're currently <strong>{data.my_role}</strong>. If your job needs a different role, ask here and a manager will approve or decline it.</p>
      {waiting ? (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Your request for <strong>{waiting.requested_role}</strong> is waiting for a manager. It's listed under Your requests below, where you can withdraw it.</p>
      ) : (
        <form onSubmit={send} className="grid gap-2 sm:grid-cols-[minmax(0,14rem)_1fr_auto] sm:items-end">
          <div className="space-y-1">
            <Label htmlFor="access-role">Role you need</Label>
            <select id="access-role" required value={role} onChange={(e) => setRole(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              <option value="" disabled>Choose a role…</option>
              {(data.requestable_roles || []).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="access-reason">Why do you need it?</Label>
            <Input id="access-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} placeholder="For example: I now build the weekly roster" />
          </div>
          <Button type="submit" disabled={sending || !role || reason.trim().length < 10}>{sending && <Loader2 className="h-4 w-4 animate-spin" />}Send request</Button>
        </form>
      )}
    </section>
  );
}

export default function ApprovalInbox() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [target, setTarget] = useState(null); // { request, decision }
  const [note, setNote] = useState('');
  const [signature, setSignature] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await callApprovals({ action: 'inbox' }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDecision = (request, decision) => { setTarget({ request, decision }); setNote(''); setSignature(''); };

  const withdraw = async (request) => {
    try {
      await callApprovals({ action: 'withdraw', id: request.id });
      toast({ title: 'Request withdrawn', description: request.title });
      await load();
    } catch (e) {
      toast({ title: 'Not withdrawn', description: e.message, variant: 'destructive' });
    }
  };

  const submit = async () => {
    if (!target) return;
    setSaving(true);
    try {
      await callApprovals({ action: 'decide', id: target.request.id, decision: target.decision, note, signature });
      const access = isAccess(target.request);
      toast({ title: target.decision === 'approve' ? (access ? 'Approved' : 'Signed off') : (access ? 'Declined' : 'Returned'), description: target.request.title });
      setTarget(null);
      await load();
    } catch (e) {
      toast({ title: 'Not saved', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const approving = target?.decision === 'approve';
  const accessTarget = isAccess(target?.request);

  return (
    <ModuleShell
      icon={Inbox}
      moduleKey="approvals"
      title="Approval Inbox"
      subtitle="Everything waiting for your sign-off in one place. Nobody can approve their own work."
      actions={<Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className="h-4 w-4" />Refresh</Button>}
    >
      {loading && !data && (
        <p className="flex items-center gap-2 p-4 text-sm text-slate-600" role="status"><Loader2 className="h-4 w-4 animate-spin" />Loading your approvals…</p>
      )}
      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
          The inbox could not load: {error} <Button variant="link" size="sm" onClick={load}>Try again</Button>
        </div>
      )}
      {data && (
        <div className="space-y-6">
          {data.can_approve && (
            <Section
              title="Waiting for your decision"
              hint="Open the record to check the work, then sign off or return it with a reason."
              rows={data.to_decide}
              empty="Nothing is waiting for you."
              onDecide={openDecision}
            />
          )}
          {data.own_awaiting_someone_else?.length > 0 && (
            <Section
              title="Your work, waiting on someone else"
              hint="You can't sign off work you asked for or completed. Another approver will decide these."
              rows={data.own_awaiting_someone_else}
              empty=""
            />
          )}
          {data.can_request_access && <AccessRequestForm data={data} onSent={load} />}
          <Section
            title="Your requests"
            rows={data.my_requests}
            empty="You have no approval requests. Completing a task that needs sign-off, or asking for different access, adds it here."
            onWithdraw={withdraw}
          />
        </div>
      )}

      <Dialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{accessTarget ? (approving ? 'Approve access' : 'Decline access') : (approving ? 'Sign off' : 'Return for more work')}</DialogTitle>
            <DialogDescription>
              {target?.request.title}
              {accessTarget && approving && ' Approving changes their role straight away.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="approval-note">{approving ? 'Note (optional)' : accessTarget ? 'Why is it being declined?' : 'Why is it being returned?'}</Label>
              <Textarea id="approval-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            </div>
            {approving && (
              <div className="space-y-1">
                <Label htmlFor="approval-signature">Type your full name to sign</Label>
                <Input id="approval-signature" value={signature} onChange={(e) => setSignature(e.target.value)} autoComplete="name" />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTarget(null)} disabled={saving}>Cancel</Button>
              <Button
                onClick={submit}
                disabled={saving || (approving ? signature.trim().length < 2 : note.trim().length < 3)}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {approving ? (accessTarget ? 'Approve' : 'Sign off') : (accessTarget ? 'Decline' : 'Return')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
}
