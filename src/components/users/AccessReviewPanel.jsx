import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, Loader2, Printer } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/AuthContext';
import { hasApprovedAccess } from '@/lib/roles';

// Periodic Access Review (backlog 16.12). Every rule is checked by the accessReview server function.
async function reviewCall(user, body) {
  const tenant_id = user?.tenant_id || user?.data?.tenant_id;
  try {
    const { data } = await base44.functions.invoke('accessReview', tenant_id ? { ...body, tenant_id } : body);
    if (data?.error) throw new Error(data.error);
    return data;
  } catch (e) {
    throw new Error(e?.response?.data?.error || e?.message || 'Something went wrong.');
  }
}

const day = (v) => (v ? new Date(v).toLocaleDateString('en-AU', { timeZone: 'Australia/Brisbane', day: 'numeric', month: 'short', year: 'numeric' }) : '-');
const DECISION_STYLE = { Pending: 'text-amber-800', Kept: 'text-emerald-800', Changed: 'text-blue-800', Suspended: 'text-rose-800', 'Left already': 'text-slate-600' };

function PersonRow({ item, data, review, onDone }) {
  const { user } = useAuth();
  const [choice, setChoice] = useState('keep');
  const [role, setRole] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const own = item.user_id === data.me;
  const seniorLocked = item.senior && !data.can_review_senior;
  const decided = item.decision !== 'Pending';
  const save = async () => {
    setSaving(true); setError('');
    try {
      await reviewCall(user, { action: 'decide', review_id: review.id, user_id: item.user_id, decision: choice, role, note });
      await onDone();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };
  const needsNote = choice !== 'keep';
  return (
    <li className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.email} · {item.role_at_start}{item.senior ? ' (senior)' : ''}</p>
        </div>
        <p className={`text-xs font-semibold ${DECISION_STYLE[item.decision] || ''}`}>
          {item.decision}{item.new_role && item.decision === 'Changed' ? ` to ${item.new_role}` : ''}{item.decided_by_name ? ` · ${item.decided_by_name}` : ''}
        </p>
      </div>
      {decided && item.note && <p className="text-xs text-slate-700">Note: {item.note}</p>}
      {!decided && (own || seniorLocked) && (
        <p className="text-xs text-muted-foreground">{own ? 'Someone else must review your own access.' : 'Senior account: the owner or a Provider Administrator reviews this one.'}</p>
      )}
      {!decided && !own && !seniorLocked && (
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label={`Decision for ${item.name}`} value={choice} onChange={(e) => setChoice(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
            <option value="keep">Keep as is</option>
            <option value="change">Change role</option>
            <option value="suspend">Suspend access</option>
          </select>
          {choice === 'change' && (
            <select aria-label={`New role for ${item.name}`} value={role} onChange={(e) => setRole(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
              <option value="" disabled>New role…</option>
              {data.grantable_roles.filter((r) => r !== item.role_at_start).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          )}
          <Input aria-label={`Note for ${item.name}`} value={note} onChange={(e) => setNote(e.target.value)} placeholder={needsNote ? 'Why (needed)' : 'Note (optional)'} className="h-8 min-w-40 flex-1 text-xs" />
          <Button size="sm" variant={choice === 'suspend' ? 'destructive' : 'default'} disabled={saving || (needsNote && note.trim().length < 3) || (choice === 'change' && !role)} onClick={save}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save
          </Button>
        </div>
      )}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </li>
  );
}

function PastReview({ r }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-lg border border-border p-3 print:break-inside-avoid">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{r.title} · {r.status}</p>
          <p className="text-xs text-muted-foreground">Started {day(r.started_at)} by {r.started_by_name}{r.completed_at ? ` · ${r.status === 'Cancelled' ? 'cancelled' : 'completed'} ${day(r.completed_at)} by ${r.completed_by_name}` : ''}</p>
          <p className="text-xs text-slate-700">{r.status === 'Cancelled' ? `Reason: ${r.cancel_reason}` : r.summary}</p>
        </div>
        <Button size="sm" variant="ghost" className="print:hidden" onClick={() => setOpen((v) => !v)}>{open ? 'Hide' : 'Show'} decisions</Button>
      </div>
      {open && (
        <table className="mt-2 w-full text-left text-xs">
          <thead><tr className="text-muted-foreground"><th className="py-1">Person</th><th>Role then</th><th>Decision</th><th>By</th><th>Note</th></tr></thead>
          <tbody>
            {(r.items || []).map((i) => (
              <tr key={i.user_id} className="border-t border-border align-top">
                <td className="py-1 pr-2">{i.name}</td><td className="pr-2">{i.role_at_start}</td>
                <td className="pr-2">{i.decision}{i.decision === 'Changed' ? ` to ${i.new_role}` : ''}</td>
                <td className="pr-2">{i.decided_by_name || '-'}</td><td>{i.note || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </li>
  );
}

export default function AccessReviewPanel() {
  const { user } = useAuth();
  const client = useQueryClient();
  const enabled = hasApprovedAccess(user) && ['admin', 'Provider Administrator', 'Management'].includes(user?.role);
  const { data, isLoading, error } = useQuery({ queryKey: ['access-review'], enabled, queryFn: () => reviewCall(user, { action: 'overview' }) });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [askCancel, setAskCancel] = useState(false);
  const refresh = () => client.invalidateQueries({ queryKey: ['access-review'] });
  if (!enabled) return null;
  const run = async (body, done) => {
    setBusy(true); setMessage('');
    try { const res = await reviewCall(user, body); if (done) setMessage(done(res)); setAskCancel(false); await refresh(); }
    catch (e) { setMessage(e.message); }
    finally { setBusy(false); }
  };
  const review = data?.open;
  const waiting = review ? review.items.filter((i) => i.decision === 'Pending').length : 0;

  return (
    <section aria-label="Access reviews" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#0A2B6D]"><ClipboardCheck className="h-4 w-4" />Access reviews</h3>
          <p className="text-xs text-slate-600">Every {data?.every_days || 90} days, check that each person's access is still right. Changes take effect straight away and every decision is kept for audits.</p>
        </div>
        <Button size="sm" variant="outline" className="print:hidden" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
      </div>
      {isLoading && <p role="status" className="text-sm text-slate-600">Loading…</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
      {message && <p role="status" className="rounded-md bg-slate-50 p-2 text-sm text-slate-800">{message}</p>}

      {data && !review && (
        <div className={`flex flex-wrap items-center justify-between gap-2 rounded-lg p-3 ${data.due_now ? 'bg-amber-50 text-amber-950' : 'bg-slate-50 text-slate-800'}`}>
          <p className="text-sm">
            {data.last_completed_at ? `Last completed ${day(data.last_completed_at)}. ` : 'No access review has been completed yet. '}
            {data.due_now ? 'A review is due now.' : `Next one due by ${day(data.next_due)}.`}
          </p>
          <Button size="sm" disabled={busy} onClick={() => run({ action: 'start' }, () => 'Review started. Decide each person below.')}>Start a review</Button>
        </div>
      )}

      {review && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">{review.title} · due {day(review.due_date)} · {review.items.length - waiting} of {review.items.length} decided</p>
            <div className="flex flex-wrap gap-2 print:hidden">
              <Button size="sm" disabled={busy || waiting > 0} onClick={() => run({ action: 'complete', review_id: review.id }, (r) => `Review completed. ${r.summary}`)}>Complete review</Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => setAskCancel((v) => !v)}>Cancel review</Button>
            </div>
          </div>
          {askCancel && (
            <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted/50 p-2 print:hidden">
              <Input aria-label="Why cancel the review" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Why cancel? Decisions already saved stay in effect." className="h-8 flex-1 text-xs" />
              <Button size="sm" variant="destructive" disabled={busy || cancelReason.trim().length < 3} onClick={() => run({ action: 'cancel', review_id: review.id, reason: cancelReason }, () => 'Review cancelled.')}>Confirm cancel</Button>
            </div>
          )}
          <ul className="space-y-2">{review.items.map((i) => <PersonRow key={i.user_id} item={i} data={data} review={review} onDone={refresh} />)}</ul>
        </div>
      )}

      {data?.past?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Earlier reviews</p>
          <ul className="space-y-2">{data.past.map((r) => <PastReview key={r.id} r={r} />)}</ul>
        </div>
      )}
    </section>
  );
}
