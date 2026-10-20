import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Landmark, CheckCircle2, Split, BookmarkPlus, Trash2 } from 'lucide-react';
import { suggestFor, describeKeyword, recordRuleUse, saveRule, deleteRule } from '@/lib/bankMatchRules';

const money = (v) => `$${Math.abs(Number(v || 0)).toLocaleString('en-AU', { minimumFractionDigits: 2 })}`;

// Expense-side bank reconciliation for procurement: match money-out statement
// lines against purchase orders (by amount), confirming payments made.
export default function ExpenseReconciliation({ onChanged }) {
  const { toast } = useToast();
  const [lines, setLines] = useState(null);
  const [orders, setOrders] = useState([]);
  const [rules, setRules] = useState([]);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    const [linePage, orderPage, rulePage] = await Promise.all([
      base44.entities.BankStatementLine.filter({ amount: { $lt: 0 } }, { sort: '-statement_date', limit: 200 }),
      base44.entities.PurchaseOrder.filter({}, { sort: '-order_date', limit: 200 }),
      base44.entities.BankRule.filter({ direction: 'money_out' }, { limit: 200 }),
    ]);
    setLines(linePage.items || []);
    setOrders(orderPage.items || []);
    setRules(rulePage.items || []);
  };

  useEffect(() => { load(); }, []);

  // Open purchase orders as matcher entries, keyed by supplier name.
  const entries = orders
    .filter((o) => ['Submitted', 'Approved', 'Received'].includes(o.status))
    .map((o) => ({ doc: o, name: o.supplier_name || '', amount: Number(o.total || 0) }));

  const suggestionFor = (line) => {
    if (line.matched_po_id) return { doc: orders.find((o) => o.id === line.matched_po_id) || null, rule: null, basis: 'linked' };
    return suggestFor(line, rules, entries);
  };

  const doSaveRule = async (line, po) => {
    setBusy(`rule-${line.id}`);
    const keyword = describeKeyword(line.description) || po.supplier_name || '';
    const me = await base44.auth.me().catch(() => null);
    await saveRule('money_out', keyword, po.supplier_name || '', me?.full_name || me?.email || '');
    setBusy(null);
    await load();
    toast({ title: 'Bank rule saved', description: `Lines containing "${keyword}" will now be matched to ${po.supplier_name} automatically.` });
  };

  const confirmMatch = async (line, po, rule) => {
    setBusy(line.id);
    if (rule) await recordRuleUse(rule).catch(() => {});
    const me = await base44.auth.me().catch(() => null);
    await base44.entities.BankStatementLine.update(line.id, {
      matched_po_id: po.id,
      reconciled: true,
      reconciled_at: new Date().toISOString(),
      reconciled_by: me?.full_name || me?.email || 'Unknown user',
    });
    setBusy(null);
    await load();
    if (onChanged) onChanged();
    toast({ title: `Reconciled: payment for ${po.po_number} confirmed` });
  };

  const unmatch = async (line) => {
    setBusy(line.id);
    await base44.entities.BankStatementLine.update(line.id, {
      matched_po_id: '', reconciled: false, reconciled_at: '', reconciled_by: '',
    });
    setBusy(null);
    await load();
    if (onChanged) onChanged();
  };

  const TONE = (line) => {
    if (line.reconciled) return 'bg-safe/15 text-safe border-transparent';
    const s = suggestionFor(line);
    if (s.basis === 'rule') return 'bg-teal/15 text-teal border-transparent';
    if (s.doc) return 'bg-warning/15 text-warning border-transparent';
    return 'bg-muted text-muted-foreground';
  };

  const openPOs = orders.filter((o) => ['Submitted', 'Approved', 'Received'].includes(o.status));
  const unreconciled = (lines || []).filter((l) => !l.reconciled).length;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-warning/10 p-2"><Landmark className="h-4 w-4 text-warning" /></div>
          <div>
            <p className="text-sm font-bold">Expense reconciliation</p>
            <p className="text-xs text-muted-foreground">Match money-out statement lines (imported in Invoicing) against purchase orders to confirm supplier payments.</p>
          </div>
          <div className="ml-auto">
            {lines !== null && <Badge className={unreconciled ? 'bg-warning/15 text-warning border-transparent' : 'bg-safe/15 text-safe border-transparent'}>{unreconciled ? `${unreconciled} to reconcile` : 'All reconciled'}</Badge>}
          </div>
        </div>

        {lines === null ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading statement lines...</div>
        ) : lines.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No money-out statement lines yet. Import your bank statement (including outflows as negative amounts) in the Invoicing centre.</p>
        ) : (
          <div className="space-y-2">
            {lines.map((line) => {
              const { doc: po, rule, basis } = suggestionFor(line);
              return (
                <div key={line.id} className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{line.description || 'Bank line'}</p>
                      <p className="text-xs text-muted-foreground">{line.statement_date || 'no date'}{line.reconciled && line.reconciled_by ? ` · reconciled by ${line.reconciled_by}` : ''}{po ? ` · matches ${po.po_number} (${po.supplier_name}${basis === 'name' ? ', by name' : basis === 'amount' ? ', by amount' : ''})` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold tabular-nums">-{money(line.amount)}</p>
                      <Badge className={TONE(line)}>{line.reconciled ? 'Reconciled' : basis === 'rule' ? 'Rule match' : basis === 'amount' ? 'Amount match' : basis === 'name' ? 'Name match' : 'No match'}</Badge>
                      {!line.reconciled && po && (
                        <>
                          <Button size="sm" onClick={() => confirmMatch(line, po, rule)} disabled={busy === line.id}>
                            {busy === line.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}Match payment
                          </Button>
                          {basis !== 'rule' && (
                            <Button size="sm" variant="ghost" onClick={() => doSaveRule(line, po)} disabled={busy === `rule-${line.id}`} title="Remember this match as a bank rule">
                              {busy === `rule-${line.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookmarkPlus className="h-3.5 w-3.5" />}Save as rule
                            </Button>
                          )}
                        </>
                      )}
                      {!line.reconciled && !po && openPOs.length > 0 && (
                        <select
                          className="h-8 max-w-[220px] rounded-md border border-input bg-background px-2 text-xs"
                          defaultValue=""
                          onChange={(e) => { const chosen = orders.find((o) => o.id === e.target.value); if (chosen) confirmMatch(line, chosen); }}
                          disabled={busy === line.id}
                        >
                          <option value="">Match to a purchase order...</option>
                          {openPOs.map((o) => <option key={o.id} value={o.id}>{o.po_number} - {money(o.total)}</option>)}
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
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Bank rules - money out ({rules.length})</p>
            <div className="space-y-1">
              {rules.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-1.5 text-xs">
                  <span><span className="font-mono font-semibold">{r.keyword}</span> → {r.target_name || '(any)'} · used {r.use_count || 0}×</span>
                  <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={async () => { await deleteRule(r.id); await load(); }}><Trash2 className="h-3 w-3" />Delete</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}