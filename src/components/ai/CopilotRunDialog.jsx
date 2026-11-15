import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { ALL_COPILOT_ACTIONS as COPILOT_ACTIONS } from '@/lib/aiIntelligence';
import AiResponseReport from '@/components/ai/AiResponseReport';

export default function CopilotRunDialog({ open, onClose, onComplete, initialAction, tenantId }) {
  const [action, setAction] = useState(initialAction || COPILOT_ACTIONS[0].key);
  const [question, setQuestion] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const close = () => {
    setResult(null);
    setError('');
    setQuestion('');
    onClose();
  };

  const run = async () => {
    setRunning(true);
    setError('');
    try {
      const response = await base44.functions.invoke('aiCopilot', { action, question, tenant_id: tenantId });
      setResult(response.data);
      if (onComplete) onComplete();
    } catch (invokeError) {
      setError(
        invokeError?.response?.data?.error ||
        invokeError?.message ||
        'The copilot could not complete this review.'
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) close(); }}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{result ? 'Copilot review' : 'Run a copilot review'}</DialogTitle>
          <DialogDescription>
            {result
              ? 'Grounded only in your own registers. Check the evidence behind every recommendation before acting on it.'
              : 'The copilot reads your standards, controls, evidence and findings, then returns findings, recommendations and a traceability map.'}
          </DialogDescription>
        </DialogHeader>

        {result?.review ? (
          <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
            <AiResponseReport review={result.review} registers={result.registers} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="ai-review-type" className="text-xs font-extrabold text-foreground">Review type</label>
              <select id="ai-review-type"
                value={action}
                onChange={(event) => setAction(event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm text-foreground"
              >
                {COPILOT_ACTIONS.map((option) => (
                  <option key={option.key} value={option.key}>{option.label}</option>
                ))}
              </select>
              <p className="text-[11px] font-medium text-muted-foreground">
                {COPILOT_ACTIONS.find((option) => option.key === action)?.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ai-review-focus" className="text-xs font-extrabold text-foreground">What should the copilot focus on? (optional)</label>
              <textarea id="ai-review-focus"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={3}
                maxLength={500}
                placeholder="e.g. We have an NDIS audit in six weeks — what will they ask for that we cannot produce?"
                className="w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs font-bold text-danger">{error}</p>
            ) : null}
          </div>
        )}

        <DialogFooter className="gap-2">
          {result ? (
            <>
              <Button variant="outline" onClick={() => { setResult(null); setError(''); }}>Run another</Button>
              <Button onClick={close}>Done</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={close} disabled={running}>Cancel</Button>
              <Button onClick={run} disabled={running}>{running ? 'Reviewing registers…' : 'Run review'}</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
