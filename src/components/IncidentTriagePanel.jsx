import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Check, X, Loader2, AlertTriangle } from 'lucide-react';

// AI triage for the incident review section. Suggestions are shown for a reviewer
// to accept or dismiss; nothing is saved until the reviewer saves the incident.
export default function IncidentTriagePanel({ form, incidentId, onApply }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [applied, setApplied] = useState(false);

  const run = async () => {
    setLoading(true);
    setError('');
    setApplied(false);
    try {
      const response = await base44.functions.invoke('incidentTriage', { incident: form, incident_id: incidentId || '' });
      if (response.data?.error) throw new Error(response.data.error);
      setResult(response.data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'AI triage failed');
    } finally {
      setLoading(false);
    }
  };

  const apply = () => {
    const s = result.suggestion;
    const updates = {};
    const ndisDecided = s.ndis_reportable_type && s.ndis_reportable_type !== 'Unsure';
    if (ndisDecided) {
      updates.reportable_incident_type = s.ndis_reportable_type;
      updates.requires_ndis_report = s.ndis_reportable_type !== 'Not reportable';
    }
    if (s.sirs_priority !== 'Unsure') {
      updates.sirs_reportable = s.sirs_applicable && s.sirs_priority !== 'Not Applicable';
      updates.sirs_priority = s.sirs_priority;
    }
    if (s.whs_notification_likely) updates.whs_notification_required = true;
    const reasons = [s.ndis_reasons, s.sirs_applicable ? s.sirs_reasons : ''].filter(Boolean).join(' ');
    if (reasons && !String(form.reportability_decision_reasons || '').includes(reasons)) {
      const stamp = `AI-assisted assessment (${new Date().toLocaleDateString('en-AU')}), reviewed and accepted by the reviewer: ${reasons}`;
      updates.reportability_decision_reasons = [form.reportability_decision_reasons, stamp].filter(Boolean).join('\n');
    }
    Object.assign(updates, result.deadlines || {});
    onApply(updates);
    setApplied(true);
  };

  const s = result?.suggestion;
  return (
    <div className="space-y-2 rounded-lg border border-brand/30 bg-brand/5 p-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold"><Sparkles className="h-4 w-4 text-brand" /> AI triage assistant</h3>
          <p className="text-xs text-foreground/55">Suggests reportability, SIRS priority and deadlines from the details above. You decide what to keep.</p>
        </div>
        <button type="button" onClick={run} disabled={loading} className="flex items-center gap-1.5 rounded-lg border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/10 disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Assessing...' : result ? 'Run again' : 'Suggest assessment'}
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {s && (
        <div className="space-y-2 rounded-md border border-border/60 bg-card p-2.5 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <div><span className="text-xs text-foreground/55">NDIS reportable type</span><div className="font-medium">{s.ndis_reportable_type}</div></div>
            <div><span className="text-xs text-foreground/55">Aged Care SIRS</span><div className="font-medium">{s.sirs_applicable ? s.sirs_priority : 'Not applicable'}</div></div>
            {s.suggested_severity && s.suggested_severity !== form.severity && (
              <div><span className="text-xs text-foreground/55">Suggested severity</span><div className="font-medium">{s.suggested_severity} (currently {form.severity}, not changed)</div></div>
            )}
            <div><span className="text-xs text-foreground/55">Confidence</span><div className="font-medium">{s.confidence}</div></div>
          </div>
          {s.ndis_reasons && <p><span className="font-medium">Why: </span>{s.ndis_reasons}{s.sirs_applicable && s.sirs_reasons ? ` ${s.sirs_reasons}` : ''}</p>}
          {(s.whs_notification_likely || s.police_advisable) && (
            <p className="flex items-start gap-1.5 text-warning"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {[s.whs_notification_likely && 'WHS regulator notification may be required.', s.police_advisable && 'Consider notifying police.'].filter(Boolean).join(' ')}
            </p>
          )}
          {result.deadlines?.initial_notification_due_at && (
            <p><span className="font-medium">Initial notification due: </span>{result.deadlines.initial_notification_due_at.replace('T', ' ')}{result.deadlines.five_day_follow_up_due ? ` · 5-day report due ${result.deadlines.five_day_follow_up_due}` : ''}</p>
          )}
          {result.notes?.length > 0 && <ul className="list-disc pl-5 text-xs text-foreground/60">{result.notes.map((n) => <li key={n}>{n}</li>)}</ul>}
          {s.missing_information?.length > 0 && (
            <div><span className="font-medium">Missing information: </span><ul className="list-disc pl-5">{s.missing_information.map((m) => <li key={m}>{m}</li>)}</ul></div>
          )}
          {s.next_steps?.length > 0 && (
            <div><span className="font-medium">Suggested next steps: </span><ol className="list-decimal pl-5">{s.next_steps.map((n) => <li key={n}>{n}</li>)}</ol></div>
          )}
          <p className="text-xs text-foreground/55">This is a suggestion, not legal advice. Check it against the incident and current NDIS Commission and aged care guidance before saving.</p>
          <div className="flex flex-wrap justify-end gap-1.5">
            <button type="button" onClick={() => { setResult(null); setApplied(false); }} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"><X className="h-4 w-4" /> Dismiss</button>
            <button type="button" onClick={apply} disabled={applied} className="flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"><Check className="h-4 w-4" />{applied ? 'Filled in — review and save' : 'Use these suggestions'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
