import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, History } from 'lucide-react';
import { format } from 'date-fns';

// Version history for policies: each new version snapshots the prior content, and
// any two snapshots can be compared with a line-level diff.

function diffLines(a = '', b = '') {
  const A = String(a).split('\n');
  const B = String(b).split('\n');
  const n = A.length;
  const m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ type: 'same', text: A[i] }); i += 1; j += 1; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ type: 'removed', text: A[i] }); i += 1; }
    else { out.push({ type: 'added', text: B[j] }); j += 1; }
  }
  while (i < n) { out.push({ type: 'removed', text: A[i] }); i += 1; }
  while (j < m) { out.push({ type: 'added', text: B[j] }); j += 1; }
  return out;
}

const parseHistory = (raw) => {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
};

export function NewVersionDialog({ policy, open, onOpenChange, onChanged }) {
  const [version, setVersion] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && policy) {
      const next = Number(policy.version) ? String(Number(policy.version) + 1) : '';
      setVersion(next);
      setContent(policy.content || '');
      setSummary('');
    }
  }, [open, policy]);

  if (!policy) return null;
  const history = parseHistory(policy.version_history);

  const save = async () => {
    setSaving(true);
    try {
      const me = await base44.auth.me().catch(() => null);
      const snapshot = {
        version: policy.version || '',
        saved_at: new Date().toISOString(),
        saved_by: me?.full_name || '',
        content: policy.content || '',
        change_summary: policy.description || '',
      };
      await base44.entities.Policy.update(policy.id, {
        version: version || policy.version,
        content,
        version_history: JSON.stringify([...history, snapshot]),
        description: summary || policy.description,
        status: 'Active',
      });
      await onChanged();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>New version — {policy.document_name}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">Saving a new version keeps the current content as an immutable snapshot so any two versions can be compared later.</p>
          <div className="grid gap-1.5"><Label>New version number</Label><Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder={policy.version ? `currently v${policy.version}` : 'e.g. 1'} /></div>
          <div className="grid gap-1.5"><Label>What changed</Label><Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short change summary" /></div>
          <div className="grid gap-1.5"><Label>Updated policy content</Label><Textarea rows={10} value={content} onChange={(e) => setContent(e.target.value)} /></div>
          <Button onClick={save} disabled={saving || !content.trim()}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save new version
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PolicyHistoryDialog({ policy, open, onOpenChange }) {
  const history = useMemo(() => (policy ? parseHistory(policy.version_history) : []), [policy]);
  const versions = useMemo(() => {
    const list = [...history, { version: policy?.version || '', saved_at: policy?.updated_date || '', saved_by: policy?.approved_by || '', content: policy?.content || '', change_summary: policy?.description || '', current: true }];
    return list.reverse();
  }, [history, policy]);
  const [fromIdx, setFromIdx] = useState(1);
  const [toIdx, setToIdx] = useState(0);

  useEffect(() => { setFromIdx(1); setToIdx(0); }, [open, policy?.id]);

  const older = (policy && versions[Math.min(fromIdx, versions.length - 1)]) || {};
  const newer = (policy && versions[Math.min(toIdx, versions.length - 1)]) || {};
  const diff = useMemo(() => diffLines(older.content || '', newer.content || ''), [older, newer]);
  const changes = diff.filter((d) => d.type !== 'same').length;

  if (!policy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><History className="h-4 w-4 text-brand" />Version history — {policy.document_name}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Compare from</Label>
              <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={Math.min(fromIdx, versions.length - 1)} onChange={(e) => setFromIdx(Number(e.target.value))}>
                {versions.map((v, i) => <option key={i} value={i}>{v.version ? `v${v.version}` : 'untitled'}{v.current ? ' (current)' : ''}{v.saved_at ? ` · ${format(new Date(v.saved_at), 'd MMM yyyy')}` : ''}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5"><Label>Compare to</Label>
              <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={Math.min(toIdx, versions.length - 1)} onChange={(e) => setToIdx(Number(e.target.value))}>
                {versions.map((v, i) => <option key={i} value={i}>{v.version ? `v${v.version}` : 'untitled'}{v.current ? ' (current)' : ''}{v.saved_at ? ` · ${format(new Date(v.saved_at), 'd MMM yyyy')}` : ''}</option>)}
              </select>
            </div>
          </div>

          {changes === 0 ? (
            <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">These two versions have identical content.</p>
          ) : (
            <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-border/60 font-mono text-xs leading-relaxed">
              {diff.map((line, i) => (
                <div
                  key={i}
                  className={`whitespace-pre-wrap px-3 py-0.5 ${line.type === 'added' ? 'bg-safe/10 text-safe' : line.type === 'removed' ? 'bg-destructive/10 text-destructive' : 'text-muted-foreground'}`}
                >{line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  '}{line.text || ' '}</div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">{versions.length} snapshot{versions.length === 1 ? '' : 's'} · {changes} changed line{changes === 1 ? '' : 's'}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}