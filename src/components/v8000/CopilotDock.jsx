import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, Loader2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRole } from '@/lib/useRole';
import CopilotReport from '@/components/v8000/CopilotReport';
import '@/components/v8000/v8000Glass.css';

/** The five V8000 copilot requests, mapped to the governed copilot actions that already exist. */
export const COPILOT_ACTIONS = [
  { key: 'evidence_review', label: 'Evidence gaps', hint: 'Where evidence is missing, expired or unverified.' },
  { key: 'compliance_review', label: 'Readiness review', hint: 'How ready the business is, from the records held.' },
  { key: 'audit_readiness', label: 'Audit summary', hint: 'The evidence position an auditor would see.' },
  { key: 'executive_review', label: 'Executive report', hint: 'Priorities for the executive team.' },
  { key: 'quality_review', label: 'Corrective actions', hint: 'Recommended corrective actions with sources.' },
];

/** Persistent copilot entry point, available on every page for people with AI OS access. */
export default function CopilotDock() {
  const { can } = useRole();
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState(COPILOT_ACTIONS[0].key);
  const [focus, setFocus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!can('ai-os')) return null;

  const run = async () => {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const response = await base44.functions.invoke('aiCopilot', { action, question: focus.trim() });
      const data = response?.data ?? response;
      if (!data || data.error) throw new Error(data?.error || 'The copilot returned no review.');
      setResult(data);
    } catch (err) {
      setError(err?.message || 'The copilot could not complete this review.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="Open Infinity Copilot"
        className="workspace-copilot-button fixed bottom-20 right-3 z-40 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-xs font-extrabold text-white shadow-lg md:bottom-5 md:right-5"
        style={{ background: 'linear-gradient(120deg, #0072FF, #5A00D6)' }}
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Ask Copilot
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="v8-shell max-h-[85vh] overflow-y-auto sm:max-w-2xl"
          style={{ background: 'linear-gradient(165deg, #0A2B6D 0%, #0A2B6D 55%, #5A00D6 100%)', borderColor: 'rgba(190,220,255,0.3)' }}
        >
          <DialogTitle className="text-sm font-extrabold text-white">Infinity Copilot</DialogTitle>
          <DialogDescription className="v8-sub">
            Drafts advisory reviews from the registers for your business. It cannot approve, close or change any record.
          </DialogDescription>

          <div className="flex flex-wrap gap-1.5">
            {COPILOT_ACTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className="v8-tab"
                aria-pressed={action === option.key}
                onClick={() => setAction(option.key)}
                title={option.hint}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="v8-muted font-bold" htmlFor="v8-copilot-focus">Focus (optional)</label>
          <textarea
            id="v8-copilot-focus"
            value={focus}
            onChange={(event) => setFocus(event.target.value.slice(0, 500))}
            rows={2}
            placeholder="e.g. medication competency evidence for the last quarter"
            className="w-full rounded-md border border-white/25 bg-[#08244F] px-2 py-1.5 text-xs text-white placeholder:text-white/40"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={run} disabled={busy} className="v8-link disabled:opacity-60">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
              {busy ? 'Reviewing the registers…' : 'Generate review'}
            </button>
            <Link to="/ai-os" className="v8-muted inline-flex items-center gap-1 underline">
              Full AI audit trail
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>

          {busy && <p className="v8-sub" role="status">Reading the assurance registers and drafting a review. This can take a few seconds.</p>}
          {error && (
            <div role="alert" className="rounded-lg border p-2.5" style={{ borderColor: '#FF9EC4', background: 'rgba(255,158,196,0.14)' }}>
              <p className="text-xs font-bold" style={{ color: '#FFD2E4' }}>{error}</p>
              <p className="v8-sub mt-1">No review is claimed. If a run started it is recorded in the AI audit trail as incomplete.</p>
            </div>
          )}
          <CopilotReport result={result} />
        </DialogContent>
      </Dialog>
    </>
  );
}