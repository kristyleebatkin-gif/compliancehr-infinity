import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Landmark, CheckCircle2, Trash2, Upload, Split, BookmarkPlus } from 'lucide-react';
import { format } from 'date-fns';
import { suggestFor, describeKeyword, recordRuleUse, saveRule, deleteRule } from '@/lib/bankMatchRules';

const money = (v) => `$${Number(v || 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })}`;

// Bank reconciliation: paste your bank statement lines (CSV, one per row:
// date,description,amount), auto-match them against unpaid invoices, and
// confirm matches to mark invoices Paid with the time and user stamped.
export default function BankReconciliation({ invoices, onChanged }) {
  const { toast } = useToast();
  const [lines, setLines] = useState(null);
  const [rules, setRules] = useState([]);
  const [csv, setCsv] = useState('');
  const [busy, setBusy] = useState(null);

  const load = () => {
    setLines(null);
    Promise.all([
      base44.entities.BankStatementLine.filter({}, { sort: '-statement_date', limit: 200 }),
      base44.entities.BankRule.filter({ direction: 'money_in' }, { limit: 200 }),
    ])
      .then(([p, r]) => { setLines(p.items || []); setRules(r.items || []); })
      .catch(() => { setLines([]); setRules([]); });
  };

  useEffect(() => { load(); }, []);

  const parseCsv = (text) => text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split(',').map((s) => s.trim());
      if (parts.length < 3) return null;
      const [date, description, rawAmount] = parts;
      const amount = Number(rawAmount.replace(/[$\s]/g, ''));
      if (!Number.isFinite(amount)) return null;
      const iso = /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? date
        : (() => { const d = new Date(date); return isNaN(d.getTime()) ? null : format(d, 'yyyy-MM-dd'); })();
      if (!iso) return null;
      return { statement_date: iso, description: description || '', amount };
    })
    .filter(Boolean);

  const importLines = async () => {
    const parsed = parseCsv(csv);
    if (!parsed.length) {
      toast({ title: 'Nothing to import', description: 'Use one line per statement row: date,description,amount', variant: 'destructive' });
      return;
    }
    setBusy('import');
    await base44.entities.BankStatementLine.bulkCreate(parsed);
    setCsv('');
    setBusy(null);
    load();
    toast({ title: `${parsed.length} statement line${parsed.length === 1 ? '' : 's'} imported` });
  };

  // Open invoices as matcher entries, keyed by billed-to name.
  const entries = (invoices || [])
    .filter((i) => i.status !== 'Paid' && i.status !== 'Draft')
    .map((i) => ({ doc: i, name: i.client_name || i.participant_name || '', amount: Number(i.amount || 0) }));

  const suggestionFor = (line) => {
    if (line.matched_invoice_id) return { doc: invoices.find((i) => i.id === line.matched_invoice_id) || null, rule: null, basis: 'linked' };
    return suggestFor(line, rules, entries);
  };

  const doSaveRule = async (line, inv) => {
    setBusy(`rule-${line.id}`);
    const name = inv.client_name || inv.participant_name || '';
    const keyword = describeKeyword(line.description) || name;
    const me = await base44.auth.me().catch(() => null);
    await saveRule('money_in', keyword, name, me?.full_name || me?.email || '');
    setBusy(null);
    load();
    toast({ title: 'Bank rule saved', description: `Lines containing "${keyword}" will now be matched to ${name} automatically.` });
  };

  const confirmMatch = async (line, inv, rule) => {
    setBusy(line.id);
    if (rule) await recordRuleUse(rule).catch(() => {});
    const me = await base44.auth.me().catch(() => null);
    await base44.entities.Invoice.update(inv.id, {
      status: 'Paid',
      paid_date: format(new Date(), 'yyyy-MM-dd'),
    });
    await base44.entities.BankStatementLine.update(line.id, {
      matched_invoice_id: inv.id,
      reconciled: true,
      reconciled_at: new Date().toISOString(),
      reconciled_by: me?.full_name || me?.email || 'Unknown user',
    });
    setBusy(null);
    load();
    onChanged();
    toast({ title: `Reconciled: ${inv.invoice_number} marked Paid` });
  };

  const unmatch = async (line) => {
    setBusy(line.id);
    if (line.matched_invoice_id) {
      const inv = invoices.find((i) => i.id === line.matched_invoice_id);
      if (inv) await base44.entities.Invoice.update(inv.id, { status: 'Sent', paid_date: '' });
    }
    await base44.entities.BankStatementLine.update(line.id, {
      matched_invoice_id: '', reconciled: false, reconciled_at: '', reconciled_by: '',
    });
    setBusy(null);
    load();
    onChanged();
  };

  const clearAll = async () => {
    if (!window.confirm('Delete all imported statement lines? Invoices stay untouched; only reconciled ones keep their Paid status.')) return;
    setBusy('clear');
    await base44.entities.BankStatementLine.deleteMany({ reconciled: false });
    setBusy(null);
    load();
  };

  const TONE = (line) => {
    if (line.reconciled) return 'bg-safe/15 text-safe border-transparent';
    const s = suggestionFor(line);
    if (s.basis === 'rule') return 'bg-teal/15 text-teal border-transparent';
    if (s.doc) return 'bg-warning/15 text-warning border-transparent';
    return 'bg-muted text-muted-foreground';
  };

  const unreconciledCount = (lines || []).filter((l) => !l.reconciled).length;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-teal/10 p-2"><Landmark className="h-4 w-4 text-teal" /></div>
          <div>
            <p className="text-sm font-bold">Bank reconciliation</p>
            <p className="text-xs text-muted-foreground">Import statement lines, match them to invoices, and mark invoices paid.</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {lines !== null && <Badge className={unreconciledCount ? 'bg-warning/15 text-warning border-transparent' : 'bg-safe/15 text-safe border-transparent'}>{unreconciledCount ? `${unreconciledCount} to reconcile` : 'All reconciled'}</Badge>}
            {lines !== null && lines.length > 0 && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={clearAll} disabled={busy === 'clear'}><Trash2 className="h-3.5 w-3.5" />Clear unreconciled</Button>
            )}
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label>Paste bank statement lines (one per row: date,description,amount)</Label>
          <Textarea rows={4} placeholder={'2026-10-20,Direct deposit INV-0001,1250.00\n2026-10-21,Card fee,15.00'} value={csv} onChange={(e) => setCsv(e.target.value)} />
          <div>
            <Button onClick={importLines} disabled={busy === 'import' || !csv.trim()}>
              {busy === 'import' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Import lines
            </Button>
          </div>
        </div>

        {lines === null ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading statement lines...</div>
        ) : lines.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No statement lines yet. Paste your bank statement above and import.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {lines.map((line) => {
              const { doc: inv, rule, basis } = suggestionFor(line);
              return (
                <div key={line.id} className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{line.description || 'Bank line'}</p>
                      <p className="text-xs text-muted-foreground">
                        {line.statement_date || 'no date'}
                        {line.reconciled && line.reconciled_by ? ` · reconciled by ${line.reconciled_by}` : ''}
                        {inv ? ` · matches ${inv.invoice_number}${basis === 'name' ? ' (by name)' : basis === 'amount' ? ' (by amount)' : ''}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold tabular-nums">{money(line.amount)}</p>
                      <Badge className={TONE(line)}>{line.reconciled ? 'Reconciled' : basis === 'rule' ? 'Rule match' : basis === 'amount' ? 'Amount match' : basis === 'name' ? 'Name match' : 'No match'}</Badge>
                      {!line.reconciled && inv && (
                        <>
                          <Button size="sm" onClick={() => confirmMatch(line, inv, rule)} disabled={busy === line.id}>
                            {busy === line.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}Match & mark paid
                          </Button>
                          {basis !== 'rule' && (
                            <Button size="sm" variant="ghost" onClick={() => doSaveRule(line, inv)} disabled={busy === `rule-${line.id}`} title="Remember this match as a bank rule">
                              {busy === `rule-${line.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookmarkPlus className="h-3.5 w-3.5" />}Save as rule
                            </Button>
                          )}
                        </>
                      )}
                      {!line.reconciled && !inv && line.amount > 0 && invoices.some((i) => i.status !== 'Paid' && i.status !== 'Draft') && (
                        <select
                          className="h-8 max-w-[220px] rounded-md border border-input bg-background px-2 text-xs"
                          defaultValue=""
                          onChange={(e) => { const chosen = invoices.find((i) => i.id === e.target.value); if (chosen) confirmMatch(line, chosen); }}
                          disabled={busy === line.id}
                        >
                          <option value="">Match to an invoice...</option>
                          {invoices.filter((i) => i.status !== 'Paid' && i.status !== 'Draft').map((i) => (
                            <option key={i.id} value={i.id}>{i.invoice_number} - {money(i.amount)}</option>
                          ))}
                        </select>
                      )}
                      {line.reconciled && (
                        <Button size="sm" variant="ghost" onClick={() => unmatch(line)} disabled={busy === line.id}><Split className="h-3.5 w-3.5" />Unmatch</Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {rules.length > 0 && (
          <div className="mt-4 rounded-xl border border-border/60 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Bank rules - money in ({rules.length})</p>
            <div className="space-y-1">
              {rules.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-1.5 text-xs">
                  <span><span className="font-mono font-semibold">{r.keyword}</span> → {r.target_name || '(any)'} · used {r.use_count || 0}×</span>
                  <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={async () => { await deleteRule(r.id); load(); }}><Trash2 className="h-3 w-3" />Delete</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}