import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Landmark, CheckCircle2, Split } from 'lucide-react';

const money = (v) => `$${Math.abs(Number(v || 0)).toLocaleString('en-AU', { minimumFractionDigits: 2 })}`;

// Expense-side bank reconciliation for procurement: match money-out statement
// lines against purchase orders (by amount), confirming payments made.
export default function ExpenseReconciliation({ onChanged }) {
  const { toast } = useToast();
  const [lines, setLines] = useState(null);
  const [orders, setOrders] = useState([]);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    const [linePage, orderPage] = await Promise.all([
      base44.entities.BankStatementLine.filter({ amount: { $lt: 0 } }, { sort: '-statement_date', limit: 200 }),
      base44.entities.PurchaseOrder.filter({}, { sort: '-order_date', limit: 200 }),
    ]);
    setLines(linePage.items || []);
    setOrders(orderPage.items || []);
  };

  useEffect(() => { load(); }, []);

  const suggestionFor = (line) => {
    if (line.matched_po_id) return orders.find((o) => o.id === line.matched_po_id) || null;
    const candidates = orders.filter(
      (o) => ['Submitted', 'Approved', 'Received'].includes(o.status) && Math.abs(Math.abs(line.amount) - (o.total || 0)) < 0.01,
    );
    return candidates.length === 1 ? candidates[0] : null;
  };

  const confirmMatch = async (line, po) => {
    setBusy(line.id);
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
    if (suggestionFor(line)) return 'bg-warning/15 text-warning border-transparent';
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
              const po = suggestionFor(line);
              return (
                <div key={line.id} className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{line.description || 'Bank line'}</p>
                      <p className="text-xs text-muted-foreground">{line.statement_date || 'no date'}{line.reconciled && line.reconciled_by ? ` · reconciled by ${line.reconciled_by}` : ''}{po ? ` · matches ${po.po_number} (${po.supplier_name})` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold tabular-nums">-{money(line.amount)}</p>
                      <Badge className={TONE(line)}>{line.reconciled ? 'Reconciled' : po ? 'Match found' : 'No match'}</Badge>
                      {!line.reconciled && po && (
                        <Button size="sm" onClick={() => confirmMatch(line, po)} disabled={busy === line.id}>
                          {busy === line.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}Match payment
                        </Button>
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
      </CardContent>
    </Card>
  );
}